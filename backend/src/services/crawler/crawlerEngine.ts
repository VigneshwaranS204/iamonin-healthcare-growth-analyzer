import { PageCrawler, PageCrawlResult } from './pageCrawler.js';
import { RobotsParser, RobotsTxtAnalysis } from './robotsParser.js';
import { SitemapParser, SitemapAnalysis } from './sitemapParser.js';
import { normalizeUrl, isSameDomain } from './urlNormalizer.js';
import { validateUrlForSSRF } from './ssrfGuard.js';
import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export interface CrawlProgressEvent {
  step:
    | 'VALIDATING'
    | 'ROBOTS_CHECK'
    | 'SITEMAP_DISCOVERY'
    | 'CRAWLING_PAGES'
    | 'TECHNICAL_ANALYSIS'
    | 'HEALTHCARE_ANALYSIS'
    | 'DOCTOR_ANALYSIS'
    | 'JOURNEY_ANALYSIS'
    | 'GENERATING_OPPORTUNITIES'
    | 'PREPARING_REPORT'
    | 'COMPLETED'
    | 'FAILED';
  message: string;
  pagesCrawled: number;
  totalPagesDiscovered: number;
  currentUrl?: string;
  progressPercent: number;
}

export type ProgressCallback = (event: CrawlProgressEvent) => void;

export interface CrawlEngineResult {
  baseUrl: string;
  rootFinalUrl: string;
  pages: PageCrawlResult[];
  robots: RobotsTxtAnalysis;
  sitemap: SitemapAnalysis;
  stats: {
    totalDiscovered: number;
    totalCrawled: number;
    totalFailed: number;
    startTime: string;
    endTime: string;
    durationSeconds: number;
  };
}

export class CrawlerEngine {
  private pageCrawler = new PageCrawler();
  private robotsParser = new RobotsParser();
  private sitemapParser = new SitemapParser();

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Executes a full BFS website crawl with rate limiting, depth limit, and live status reporting.
   */
  async crawlWebsite(
    targetUrl: string,
    options?: {
      maxPages?: number;
      maxDepth?: number;
      requestDelayMs?: number;
      onProgress?: ProgressCallback;
    }
  ): Promise<CrawlEngineResult> {
    const maxPages = options?.maxPages || config.crawl.maxPages;
    const maxDepth = options?.maxDepth || config.crawl.maxDepth;
    const requestDelayMs = options?.requestDelayMs || config.crawl.requestDelayMs;
    const notify = options?.onProgress || (() => {});

    const startTime = new Date();

    // 1. SSRF & Protocol Validation
    notify({
      step: 'VALIDATING',
      message: 'Validating hospital website URL and security boundaries...',
      pagesCrawled: 0,
      totalPagesDiscovered: 1,
      currentUrl: targetUrl,
      progressPercent: 5,
    });

    const normalizedRoot = normalizeUrl(targetUrl);
    if (!normalizedRoot) {
      throw new Error(`Invalid URL format: ${targetUrl}`);
    }

    const ssrfCheck = await validateUrlForSSRF(normalizedRoot);
    if (!ssrfCheck.isValid) {
      throw new Error(`Security validation failed for URL: ${ssrfCheck.reason}`);
    }

    // 2. Fetch robots.txt
    notify({
      step: 'ROBOTS_CHECK',
      message: 'Checking robots.txt for crawl directives and sitemaps...',
      pagesCrawled: 0,
      totalPagesDiscovered: 1,
      progressPercent: 10,
    });

    const robotsAnalysis = await this.robotsParser.fetchAndParse(normalizedRoot);

    // 3. Sitemap discovery
    notify({
      step: 'SITEMAP_DISCOVERY',
      message: 'Discovering XML sitemaps and index entries...',
      pagesCrawled: 0,
      totalPagesDiscovered: 1,
      progressPercent: 15,
    });

    const sitemapAnalysis = await this.sitemapParser.discoverAndParse(
      normalizedRoot,
      robotsAnalysis.sitemaps
    );

    // 4. BFS Queue Setup
    const queue: Array<{ url: string; depth: number }> = [{ url: normalizedRoot, depth: 0 }];
    const visitedUrls = new Set<string>([normalizedRoot]);
    const crawledPages: PageCrawlResult[] = [];
    let failedCount = 0;

    // Seed queue with sitemap URLs (up to 30 top candidate URLs within domain)
    if (sitemapAnalysis.urls.length > 0) {
      for (const smUrl of sitemapAnalysis.urls) {
        const normSmUrl = normalizeUrl(smUrl, normalizedRoot);
        if (normSmUrl && isSameDomain(normSmUrl, normalizedRoot) && !visitedUrls.has(normSmUrl)) {
          // Prioritize doctors, specialties, contact, about, emergency
          const lower = normSmUrl.toLowerCase();
          const isHighPriority =
            lower.includes('doctor') ||
            lower.includes('specialt') ||
            lower.includes('department') ||
            lower.includes('contact') ||
            lower.includes('about') ||
            lower.includes('emergency') ||
            lower.includes('package');

          if (isHighPriority && queue.length < 40) {
            visitedUrls.add(normSmUrl);
            queue.push({ url: normSmUrl, depth: 1 });
          }
        }
      }
    }

    let rootFinalUrl = normalizedRoot;

    // 5. BFS Crawl Loop
    while (queue.length > 0 && crawledPages.length < maxPages) {
      const current = queue.shift()!;
      const currentUrl = current.url;
      const currentDepth = current.depth;

      // Check robots.txt disallow rules
      if (!this.robotsParser.isAllowed(currentUrl)) {
        logger.info({ url: currentUrl }, 'Skipping URL disallowed by robots.txt');
        continue;
      }

      const progressPercent = Math.min(
        80,
        15 + Math.round((crawledPages.length / Math.min(maxPages, Math.max(queue.length + crawledPages.length, 1))) * 65)
      );

      notify({
        step: 'CRAWLING_PAGES',
        message: `Crawling page ${crawledPages.length + 1} of max ${maxPages}...`,
        pagesCrawled: crawledPages.length,
        totalPagesDiscovered: visitedUrls.size,
        currentUrl,
        progressPercent,
      });

      // Rate limiting delay
      if (requestDelayMs > 0 && crawledPages.length > 0) {
        await this.sleep(requestDelayMs);
      }

      try {
        const pageResult = await this.pageCrawler.crawlPage(currentUrl, currentDepth, normalizedRoot);

        if (pageResult) {
          crawledPages.push(pageResult);

          if (currentUrl === normalizedRoot && pageResult.finalUrl) {
            rootFinalUrl = pageResult.finalUrl;
          }

          // Discover and enqueue internal links if within depth limit
          if (currentDepth < maxDepth) {
            for (const link of pageResult.internalLinks) {
              const normLink = normalizeUrl(link, normalizedRoot);
              if (normLink && isSameDomain(normLink, normalizedRoot) && !visitedUrls.has(normLink)) {
                visitedUrls.add(normLink);
                if (queue.length + crawledPages.length < maxPages * 2) {
                  queue.push({ url: normLink, depth: currentDepth + 1 });
                }
              }
            }
          }
        } else {
          failedCount++;
        }
      } catch (err: any) {
        failedCount++;
        logger.warn({ url: currentUrl, error: err.message }, 'Failed crawling page');
      }
    }

    const endTime = new Date();
    const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

    return {
      baseUrl: normalizedRoot,
      rootFinalUrl,
      pages: crawledPages,
      robots: robotsAnalysis,
      sitemap: sitemapAnalysis,
      stats: {
        totalDiscovered: visitedUrls.size,
        totalCrawled: crawledPages.length,
        totalFailed: failedCount,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationSeconds,
      },
    };
  }
}
