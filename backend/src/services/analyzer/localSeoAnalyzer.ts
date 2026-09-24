import { CrawlEngineResult } from '../crawler/crawlerEngine.js';

export interface LocalSeoAnalysisResult {
  hasAddress: boolean;
  detectedAddresses: string[];
  hasPhone: boolean;
  detectedPhones: string[];
  hasEmbeddedMap: boolean;
  hasLocalBusinessSchema: boolean;
  hasLocationPages: boolean;
  locationPages: string[];
  observations: string[];
  disclaimer: string;
}

export class LocalSeoAnalyzer {
  /**
   * Analyzes observable on-site local visibility signals.
   */
  analyze(crawlData: CrawlEngineResult, hospitalLocation?: string): LocalSeoAnalysisResult {
    const pages = crawlData.pages;
    const allPhones = Array.from(new Set(pages.flatMap((p) => p.phoneNumbers)));

    const addressKeywords = ['road', 'street', 'avenue', 'nagar', 'cross', 'layout', 'sector', 'block', 'pin', 'pincode', 'dist', 'near'];
    const detectedAddresses: string[] = [];

    for (const p of pages) {
      const lower = p.bodyTextSnippet.toLowerCase();
      if (addressKeywords.some((kw) => lower.includes(kw))) {
        const lines = p.bodyTextSnippet.split(/\n+/);
        for (const line of lines) {
          if (addressKeywords.some((kw) => line.toLowerCase().includes(kw)) && line.length > 15 && line.length < 150) {
            detectedAddresses.push(line.trim());
          }
        }
      }
    }

    const hasEmbeddedMap = pages.some(
      (p) =>
        p.bodyTextSnippet.includes('google.com/maps') ||
        p.internalLinks.some((l) => l.includes('maps.google')) ||
        p.externalLinks.some((l) => l.includes('google.com/maps') || l.includes('goo.gl/maps'))
    );

    const hasLocalBusinessSchema = pages.some((p) =>
      p.schemaTypes.some((t) =>
        ['hospital', 'medicalbusiness', 'localbusiness', 'medicalorganization'].includes(t.toLowerCase())
      )
    );

    const locationPages = pages
      .filter((p) => p.url.includes('/location') || p.url.includes('/branch') || p.url.includes('/contact'))
      .map((p) => p.url);

    const observations: string[] = [];

    if (allPhones.length > 0) {
      observations.push(`Detected ${allPhones.length} contact phone number(s) on the website (${allPhones.slice(0, 3).join(', ')}).`);
    } else {
      observations.push('No telephone numbers detected in structured HTML or tel: links.');
    }

    if (hasEmbeddedMap) {
      observations.push('Interactive Google Map or directions link detected for patient wayfinding.');
    } else {
      observations.push('No embedded Google Map or location coordinates found on contact/hospital pages.');
    }

    if (hasLocalBusinessSchema) {
      observations.push('Structured MedicalOrganization / Hospital JSON-LD schema is present.');
    } else {
      observations.push('Missing LocalBusiness / Hospital Schema markup to establish geo-entity coordinates in Google Search.');
    }

    if (locationPages.length > 0) {
      observations.push(`Found ${locationPages.length} dedicated contact/location landing page(s).`);
    }

    return {
      hasAddress: detectedAddresses.length > 0,
      detectedAddresses: Array.from(new Set(detectedAddresses)).slice(0, 5),
      hasPhone: allPhones.length > 0,
      detectedPhones: allPhones.slice(0, 5),
      hasEmbeddedMap,
      hasLocalBusinessSchema,
      hasLocationPages: locationPages.length > 0,
      locationPages,
      observations,
      disclaimer:
        'Local SEO observations are derived solely from observable website signals. This tool does not claim Google Maps ranking, review counts, or Google Business Profile performance without user-supplied data.',
    };
  }
}
