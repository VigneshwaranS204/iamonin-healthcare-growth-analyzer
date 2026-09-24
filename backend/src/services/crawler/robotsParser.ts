import axios from 'axios';
import { URL } from 'url';
import { logger } from '../../utils/logger.js';
import { validateUrlForSSRF } from './ssrfGuard.js';
import { config } from '../../config/env.js';

export interface RobotsTxtAnalysis {
  exists: boolean;
  statusCode?: number;
  rawContent?: string;
  sitemaps: string[];
  disallowedPaths: string[];
  allowedPaths: string[];
  crawlDelay?: number;
  userAgents: string[];
  observations: string[];
}

export class RobotsParser {
  private disallowedPatterns: RegExp[] = [];
  private allowedPatterns: RegExp[] = [];
  private sitemaps: string[] = [];
  private crawlDelay?: number;
  public analysis: RobotsTxtAnalysis = {
    exists: false,
    sitemaps: [],
    disallowedPaths: [],
    allowedPaths: [],
    userAgents: [],
    observations: [],
  };

  /**
   * Fetches and parses robots.txt for a given base website URL.
   */
  async fetchAndParse(baseUrl: string): Promise<RobotsTxtAnalysis> {
    try {
      const parsedBase = new URL(baseUrl);
      const robotsUrl = `${parsedBase.protocol}//${parsedBase.host}/robots.txt`;

      const ssrfCheck = await validateUrlForSSRF(robotsUrl);
      if (!ssrfCheck.isValid) {
        this.analysis.observations.push(`SSRF check prevented robots.txt fetch: ${ssrfCheck.reason}`);
        return this.analysis;
      }

      const res = await axios.get(robotsUrl, {
        timeout: config.crawl.timeoutMs,
        headers: {
          'User-Agent': config.crawl.userAgent,
          Accept: 'text/plain,*/*',
        },
        maxRedirects: 3,
        validateStatus: () => true, // Don't throw on 404
      });

      this.analysis.statusCode = res.status;

      if (res.status === 200 && typeof res.data === 'string') {
        this.analysis.exists = true;
        this.analysis.rawContent = res.data;
        this.parseContent(res.data);
      } else if (res.status === 404) {
        this.analysis.exists = false;
        this.analysis.observations.push('robots.txt not found (HTTP 404) - site is completely open to crawling');
      } else {
        this.analysis.observations.push(`robots.txt returned unexpected HTTP status ${res.status}`);
      }
    } catch (err: any) {
      this.analysis.observations.push(`Failed to fetch robots.txt: ${err.message}`);
    }

    return this.analysis;
  }

  private parseContent(content: string): void {
    const lines = content.split(/\r?\n/);
    let currentUserAgentApplies = false;
    const allUserAgents: Set<string> = new Set();

    for (let line of lines) {
      line = line.trim();
      // Ignore comments and empty lines
      if (!line || line.startsWith('#')) continue;

      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;

      const directive = line.slice(0, colonIdx).trim().toLowerCase();
      const value = line.slice(colonIdx + 1).trim();

      if (directive === 'user-agent') {
        const ua = value.toLowerCase();
        allUserAgents.add(value);
        currentUserAgentApplies = ua === '*' || ua.includes('bot') || ua.includes('iamonin');
      } else if (directive === 'sitemap') {
        if (value && !this.sitemaps.includes(value)) {
          this.sitemaps.push(value);
          this.analysis.sitemaps.push(value);
        }
      } else if (currentUserAgentApplies) {
        if (directive === 'disallow' && value) {
          this.analysis.disallowedPaths.push(value);
          this.disallowedPatterns.push(this.pathToRegex(value));
        } else if (directive === 'allow' && value) {
          this.analysis.allowedPaths.push(value);
          this.allowedPatterns.push(this.pathToRegex(value));
        } else if (directive === 'crawl-delay' && value) {
          const delay = parseFloat(value);
          if (!isNaN(delay)) {
            this.crawlDelay = delay;
            this.analysis.crawlDelay = delay;
          }
        }
      }
    }

    this.analysis.userAgents = Array.from(allUserAgents);

    // Observations (Strictly neutral, non-alarmist)
    if (this.analysis.sitemaps.length > 0) {
      this.analysis.observations.push(`Found ${this.analysis.sitemaps.length} sitemap reference(s) in robots.txt`);
    } else {
      this.analysis.observations.push('No Sitemap directive declared in robots.txt');
    }

    if (this.analysis.disallowedPaths.length > 0) {
      this.analysis.observations.push(`${this.analysis.disallowedPaths.length} disallowed path rule(s) configured for web crawlers`);
    }
  }

  private pathToRegex(path: string): RegExp {
    // Escape special regex characters except * and $
    let escaped = path.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    escaped = escaped.replace(/\*/g, '.*');
    if (!escaped.endsWith('$')) {
      escaped = escaped + '.*';
    }
    return new RegExp(`^${escaped}`);
  }

  /**
   * Checks if a specific relative path or absolute URL is allowed by robots.txt.
   */
  isAllowed(targetUrl: string): boolean {
    if (!this.analysis.exists) return true;

    try {
      const parsed = new URL(targetUrl);
      const fullPath = parsed.pathname + parsed.search;

      // Check allow rules first
      for (const pattern of this.allowedPatterns) {
        if (pattern.test(fullPath)) return true;
      }

      // Check disallow rules
      for (const pattern of this.disallowedPatterns) {
        if (pattern.test(fullPath)) return false;
      }

      return true;
    } catch {
      return true;
    }
  }
}
