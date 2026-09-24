import axios from 'axios';
import { URL } from 'url';
import * as cheerio from 'cheerio';
import { logger } from '../../utils/logger.js';
import { validateUrlForSSRF } from './ssrfGuard.js';
import { config } from '../../config/env.js';

export interface SitemapAnalysis {
  exists: boolean;
  urls: string[];
  totalUrls: number;
  sitemapUrls: string[];
  type?: 'standard' | 'index' | 'multiple';
  lastModified?: string;
  errors: string[];
  observations: string[];
}

export class SitemapParser {
  public analysis: SitemapAnalysis = {
    exists: false,
    urls: [],
    totalUrls: 0,
    sitemapUrls: [],
    errors: [],
    observations: [],
  };

  /**
   * Discovers and parses sitemaps from robots.txt references and standard /sitemap.xml location.
   */
  async discoverAndParse(baseUrl: string, robotsSitemaps: string[] = []): Promise<SitemapAnalysis> {
    const candidateSitemaps = new Set<string>(robotsSitemaps);

    try {
      const parsedBase = new URL(baseUrl);
      candidateSitemaps.add(`${parsedBase.protocol}//${parsedBase.host}/sitemap.xml`);
      candidateSitemaps.add(`${parsedBase.protocol}//${parsedBase.host}/sitemap_index.xml`);
    } catch (e: any) {
      this.analysis.errors.push(`Invalid base URL for sitemap: ${e.message}`);
      return this.analysis;
    }

    const discoveredUrls: Set<string> = new Set();
    const successfulSitemaps: string[] = [];

    for (const sitemapUrl of candidateSitemaps) {
      const ssrf = await validateUrlForSSRF(sitemapUrl);
      if (!ssrf.isValid) continue;

      try {
        const res = await axios.get(sitemapUrl, {
          timeout: config.crawl.timeoutMs,
          headers: {
            'User-Agent': config.crawl.userAgent,
            Accept: 'application/xml,text/xml,*/*',
          },
          maxRedirects: 3,
          validateStatus: (status) => status === 200,
        });

        if (typeof res.data === 'string' && res.data.includes('<')) {
          successfulSitemaps.push(sitemapUrl);
          await this.parseSitemapXml(res.data, sitemapUrl, discoveredUrls);
        }
      } catch {
        // Silently continue checking other candidate URLs
      }
    }

    if (successfulSitemaps.length > 0) {
      this.analysis.exists = true;
      this.analysis.sitemapUrls = successfulSitemaps;
      this.analysis.urls = Array.from(discoveredUrls);
      this.analysis.totalUrls = this.analysis.urls.length;
      this.analysis.type = successfulSitemaps.length > 1 ? 'multiple' : 'standard';
      this.analysis.observations.push(
        `Discovered XML sitemap with ${this.analysis.totalUrls} publicly listed URL(s)`
      );
    } else {
      this.analysis.exists = false;
      this.analysis.observations.push('XML sitemap was not detected');
    }

    return this.analysis;
  }

  private async parseSitemapXml(xmlContent: string, currentSitemapUrl: string, discoveredUrls: Set<string>, depth = 0): Promise<void> {
    if (depth > 2) return;

    try {
      const $ = cheerio.load(xmlContent, { xmlMode: true });

      // Check for sitemap index
      const childSitemaps = $('sitemapindex > sitemap > loc');
      if (childSitemaps.length > 0) {
        this.analysis.type = 'index';
        const childUrls: string[] = [];
        childSitemaps.each((_, el) => {
          const loc = $(el).text().trim();
          if (loc) childUrls.push(loc);
        });

        // Parse up to 5 child sitemaps to prevent resource exhaust
        for (const childUrl of childUrls.slice(0, 5)) {
          const ssrf = await validateUrlForSSRF(childUrl);
          if (!ssrf.isValid) continue;

          try {
            const res = await axios.get(childUrl, {
              timeout: config.crawl.timeoutMs,
              headers: { 'User-Agent': config.crawl.userAgent },
            });
            if (typeof res.data === 'string') {
              await this.parseSitemapXml(res.data, childUrl, discoveredUrls, depth + 1);
            }
          } catch (e: any) {
            this.analysis.errors.push(`Child sitemap error (${childUrl}): ${e.message}`);
          }
        }
      }

      // Check for urlset
      const urlNodes = $('urlset > url > loc');
      urlNodes.each((_, el) => {
        const loc = $(el).text().trim();
        if (loc) discoveredUrls.add(loc);
      });

      // Extract lastmod if present on first node
      const lastMod = $('urlset > url > lastmod').first().text().trim();
      if (lastMod && !this.analysis.lastModified) {
        this.analysis.lastModified = lastMod;
      }
    } catch (err: any) {
      this.analysis.errors.push(`XML parse error on ${currentSitemapUrl}: ${err.message}`);
    }
  }
}
