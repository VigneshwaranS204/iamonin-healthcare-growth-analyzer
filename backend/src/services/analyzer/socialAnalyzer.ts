import { CrawlEngineResult } from '../crawler/crawlerEngine.js';

export interface SocialPlatformPresence {
  platform: 'Instagram' | 'Facebook' | 'YouTube' | 'LinkedIn' | 'Twitter/X';
  isFound: boolean;
  url?: string;
}

export interface SocialAnalysisResult {
  platforms: SocialPlatformPresence[];
  detectedCount: number;
  observations: string[];
}

export class SocialAnalyzer {
  /**
   * Extracts publicly linked social channels from crawled pages.
   */
  analyze(crawlData: CrawlEngineResult, providedSocials?: Record<string, string | undefined>): SocialAnalysisResult {
    const pages = crawlData.pages;

    let ig = providedSocials?.instagram;
    let fb = providedSocials?.facebook;
    let yt = providedSocials?.youtube;
    let li = providedSocials?.linkedin;
    let tw = providedSocials?.twitter;

    for (const p of pages) {
      if (!ig && p.socialLinks.instagram) ig = p.socialLinks.instagram;
      if (!fb && p.socialLinks.facebook) fb = p.socialLinks.facebook;
      if (!yt && p.socialLinks.youtube) yt = p.socialLinks.youtube;
      if (!li && p.socialLinks.linkedin) li = p.socialLinks.linkedin;
      if (!tw && p.socialLinks.twitter) tw = p.socialLinks.twitter;
    }

    const platforms: SocialPlatformPresence[] = [
      { platform: 'Instagram', isFound: !!ig, url: ig },
      { platform: 'Facebook', isFound: !!fb, url: fb },
      { platform: 'YouTube', isFound: !!yt, url: yt },
      { platform: 'LinkedIn', isFound: !!li, url: li },
      { platform: 'Twitter/X', isFound: !!tw, url: tw },
    ];

    const detectedCount = platforms.filter((p) => p.isFound).length;
    const observations: string[] = [];

    if (detectedCount > 0) {
      observations.push(
        `Discovered ${detectedCount} active social media profile link(s) (${platforms.filter((p) => p.isFound).map((p) => p.platform).join(', ')}).`
      );
    } else {
      observations.push('No public social media links detected in website navigation or footer.');
    }

    if (!yt) {
      observations.push('YouTube channel link not detected (key opportunity for doctor video consultation and patient education reels).');
    }

    if (!ig) {
      observations.push('Instagram profile link not detected for hospital lifestyle and health awareness messaging.');
    }

    return {
      platforms,
      detectedCount,
      observations,
    };
  }
}
