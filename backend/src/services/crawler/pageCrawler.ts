import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import { normalizeUrl, isSameDomain } from './urlNormalizer.js';
import { validateUrlForSSRF } from './ssrfGuard.js';
import { config } from '../../config/env.js';
import {
  HEALTHCARE_SPECIALTIES,
  DOCTOR_TERMS,
  CTA_TERMS,
  EMERGENCY_TERMS,
  HEALTH_PACKAGE_TERMS,
  INSURANCE_TERMS,
  TESTIMONIAL_TERMS,
} from '../../config/dictionary.js';

export interface ExtractedCta {
  text: string;
  type: 'CALL' | 'WHATSAPP' | 'BOOK_APPOINTMENT' | 'CONTACT_FORM' | 'ONLINE_BOOKING' | 'GENERIC_CTA';
  href?: string;
  tag: string;
}

export interface ExtractedImage {
  src: string;
  alt: string;
  hasAlt: boolean;
}

export interface ExtractedSocials {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  linkedin?: string;
  twitter?: string;
}

export interface PageCrawlResult {
  url: string;
  finalUrl: string;
  statusCode: number;
  depth: number;
  title: string;
  metaDescription: string;
  h1List: string[];
  h2List: string[];
  wordCount: number;
  language: string;
  robotsMeta: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  images: ExtractedImage[];
  imagesCount: number;
  imagesMissingAlt: number;
  internalLinks: string[];
  externalLinks: string[];
  phoneNumbers: string[];
  emailAddresses: string[];
  whatsAppLinks: string[];
  socialLinks: ExtractedSocials;
  formsCount: number;
  ctas: ExtractedCta[];
  detectedSpecialties: string[];
  hasAppointmentCta: boolean;
  isDoctorPage: boolean;
  isSpecialtyPage: boolean;
  isEmergencyPage: boolean;
  hasHealthPackages: boolean;
  hasInsuranceInfo: boolean;
  hasTestimonials: boolean;
  schemaTypes: string[];
  rawJsonLd: any[];
  breadcrumbs: string[];
  bodyTextSnippet: string;
  hasViewportMeta: boolean;
  hasMixedContent: boolean;
}

export class PageCrawler {
  /**
   * Fetches and extracts full structured data from an HTML page.
   */
  async crawlPage(targetUrl: string, depth = 0, rootBaseUrl: string): Promise<PageCrawlResult | null> {
    const ssrf = await validateUrlForSSRF(targetUrl);
    if (!ssrf.isValid) {
      return null;
    }

    try {
      const res = await axios.get(targetUrl, {
        timeout: config.crawl.timeoutMs,
        headers: {
          'User-Agent': config.crawl.userAgent,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        maxRedirects: 5,
        maxContentLength: config.crawl.maxResponseSizeBytes,
        validateStatus: () => true, // capture all status codes
      });

      const contentType = String(res.headers['content-type'] || '').toLowerCase();
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        return null;
      }

      const finalUrl = res.request?.res?.responseUrl || targetUrl;
      const html = typeof res.data === 'string' ? res.data : '';

      return this.parseHtml(html, targetUrl, finalUrl, res.status, depth, rootBaseUrl);
    } catch (err: any) {
      return null;
    }
  }

  /**
   * Parses raw HTML string and extracts all SEO, healthcare, conversion and social attributes.
   */
  public parseHtml(
    html: string,
    requestedUrl: string,
    finalUrl: string,
    statusCode: number,
    depth: number,
    rootBaseUrl: string
  ): PageCrawlResult {
    const $ = cheerio.load(html);

    // Title
    const title = $('head > title').text().trim() || $('title').first().text().trim() || '';

    // Meta Description
    const metaDescription =
      $('meta[name="description" i]').attr('content')?.trim() ||
      $('meta[property="og:description" i]').attr('content')?.trim() ||
      '';

    // Headings
    const h1List: string[] = [];
    $('h1').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text) h1List.push(text);
    });

    const h2List: string[] = [];
    $('h2').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text) h2List.push(text);
    });

    // Language
    const language = $('html').attr('lang')?.trim() || 'en';

    // Robots Meta
    const robotsMeta = $('meta[name="robots" i]').attr('content')?.trim() || '';

    // Canonical
    const canonicalUrl = $('link[rel="canonical" i]').attr('href')?.trim() || '';

    // Open Graph
    const ogTitle = $('meta[property="og:title" i]').attr('content')?.trim() || '';
    const ogDescription = $('meta[property="og:description" i]').attr('content')?.trim() || '';
    const ogImage = $('meta[property="og:image" i]').attr('content')?.trim() || '';

    // Viewport
    const hasViewportMeta = $('meta[name="viewport" i]').length > 0;

    // Mixed content check (http assets on https page)
    const isHttps = finalUrl.startsWith('https://');
    let hasMixedContent = false;
    if (isHttps) {
      $('script[src^="http://"], link[href^="http://"], img[src^="http://"], iframe[src^="http://"]').each(() => {
        hasMixedContent = true;
      });
    }

    // Schema.org JSON-LD extraction (Extract before removing script tags)
    const schemaTypes: string[] = [];
    const rawJsonLd: any[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const text = $(el).html()?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          rawJsonLd.push(parsed);

          const extractType = (obj: any) => {
            if (!obj) return;
            if (Array.isArray(obj)) {
              obj.forEach(extractType);
            } else if (typeof obj === 'object') {
              if (obj['@type']) {
                if (Array.isArray(obj['@type'])) {
                  obj['@type'].forEach((t: string) => schemaTypes.push(t));
                } else if (typeof obj['@type'] === 'string') {
                  schemaTypes.push(obj['@type']);
                }
              }
              if (obj['@graph'] && Array.isArray(obj['@graph'])) {
                obj['@graph'].forEach(extractType);
              }
            }
          };

          extractType(parsed);
        }
      } catch {
        // malformed json-ld
      }
    });

    // Body text & Word count
    $('script, style, noscript, svg, iframe, select').remove();
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const words = bodyText ? bodyText.split(/\s+/).filter((w) => w.length > 1) : [];
    const wordCount = words.length;

    // Images
    const images: ExtractedImage[] = [];
    let imagesMissingAlt = 0;
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      const alt = $(el).attr('alt')?.trim() || '';
      const hasAlt = alt.length > 0;
      if (!hasAlt) imagesMissingAlt++;
      if (src) {
        images.push({ src, alt, hasAlt });
      }
    });

    // Links extraction (Internal vs External)
    const internalLinksSet = new Set<string>();
    const externalLinksSet = new Set<string>();

    $('a[href]').each((_, el) => {
      const rawHref = $(el).attr('href');
      if (!rawHref) return;

      const normalized = normalizeUrl(rawHref, finalUrl);
      if (!normalized) return;

      if (isSameDomain(normalized, rootBaseUrl)) {
        internalLinksSet.add(normalized);
      } else {
        externalLinksSet.add(normalized);
      }
    });

    // Contact Data: Phone Numbers
    const phoneNumbersSet = new Set<string>();
    const telLinks = $('a[href^="tel:"]');
    telLinks.each((_, el) => {
      const href = $(el).attr('href') || '';
      const num = href.replace(/^tel:/i, '').replace(/[^\d+]/g, '').trim();
      if (num.length >= 7) phoneNumbersSet.add(num);
    });

    // Regex for phones in text
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/g;
    const phoneMatches = bodyText.match(phoneRegex) || [];
    for (const match of phoneMatches) {
      const cleaned = match.replace(/[^\d+]/g, '');
      if (cleaned.length >= 8 && cleaned.length <= 15) {
        phoneNumbersSet.add(match.trim());
      }
    }

    // Emails
    const emailSet = new Set<string>();
    $('a[href^="mailto:"]').each((_, el) => {
      const mail = ($(el).attr('href') || '').replace(/^mailto:/i, '').split('?')[0].trim();
      if (mail && mail.includes('@')) emailSet.add(mail.toLowerCase());
    });
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatches = bodyText.match(emailRegex) || [];
    for (const em of emailMatches) {
      emailSet.add(em.toLowerCase());
    }

    // WhatsApp
    const whatsAppLinksSet = new Set<string>();
    $(
      'a[href*="whatsapp.com"], a[href*="wa.me"], a[href^="whatsapp://"], a[href*="api.whatsapp.com"]'
    ).each((_, el) => {
      const href = $(el).attr('href') || '';
      whatsAppLinksSet.add(href);
    });

    // Socials
    const socialLinks: ExtractedSocials = {};
    $('a[href]').each((_, el) => {
      const href = ($(el).attr('href') || '').trim();
      if (href.includes('instagram.com/')) socialLinks.instagram = href;
      else if (href.includes('facebook.com/')) socialLinks.facebook = href;
      else if (href.includes('youtube.com/') || href.includes('youtu.be/')) socialLinks.youtube = href;
      else if (href.includes('linkedin.com/')) socialLinks.linkedin = href;
      else if (href.includes('twitter.com/') || href.includes('x.com/')) socialLinks.twitter = href;
    });

    // CTAs & Buttons
    const ctas: ExtractedCta[] = [];
    let hasAppointmentCta = false;

    $('a, button, input[type="submit"], input[type="button"]').each((_, el) => {
      const tag = el.tagName.toLowerCase();
      const text = $(el).text().replace(/\s+/g, ' ').trim() || $(el).attr('value')?.trim() || '';
      const href = $(el).attr('href') || '';
      const lowerText = text.toLowerCase();
      const lowerHref = href.toLowerCase();

      if (!text && !href.includes('whatsapp') && !href.startsWith('tel:')) return;

      let ctaType: ExtractedCta['type'] = 'GENERIC_CTA';

      if (lowerHref.includes('wa.me') || lowerHref.includes('whatsapp') || lowerText.includes('whatsapp')) {
        ctaType = 'WHATSAPP';
      } else if (lowerHref.startsWith('tel:') || lowerText.includes('call now') || lowerText.includes('call us')) {
        ctaType = 'CALL';
      } else if (
        lowerText.includes('appointment') ||
        lowerText.includes('book now') ||
        lowerText.includes('schedule') ||
        lowerText.includes('consult now') ||
        lowerText.includes('consult doctor')
      ) {
        ctaType = 'BOOK_APPOINTMENT';
        hasAppointmentCta = true;
      } else if (lowerText.includes('enquire') || lowerText.includes('contact') || tag === 'input') {
        ctaType = 'CONTACT_FORM';
      }

      const isCtaKeyword = CTA_TERMS.some((term) => lowerText.includes(term) || lowerHref.includes(term));

      if (isCtaKeyword || ctaType !== 'GENERIC_CTA') {
        ctas.push({ text: text.slice(0, 100), type: ctaType, href: href || undefined, tag });
      }
    });

    // Forms
    const formsCount = $('form').length;

    // Healthcare Specialties Detection
    const detectedSpecialties: string[] = [];
    const lowerBody = bodyText.toLowerCase();
    const lowerTitle = title.toLowerCase();
    const lowerH1 = h1List.join(' ').toLowerCase();

    for (const spec of HEALTHCARE_SPECIALTIES) {
      const matchAlias = spec.aliases.some(
        (alias) =>
          lowerTitle.includes(alias) ||
          lowerH1.includes(alias) ||
          finalUrl.toLowerCase().includes(alias.replace(/\s+/g, '-')) ||
          (lowerBody.includes(alias) && lowerBody.split(alias).length > 2)
      );
      if (matchAlias) {
        detectedSpecialties.push(spec.name);
      }
    }

    // Doctor page indicator
    const isDoctorPage =
      finalUrl.toLowerCase().includes('/doctor') ||
      finalUrl.toLowerCase().includes('/specialist') ||
      finalUrl.toLowerCase().includes('/our-team') ||
      finalUrl.toLowerCase().includes('/physician') ||
      DOCTOR_TERMS.some((dt) => lowerTitle.includes(dt) || lowerH1.includes(dt));

    // Specialty page indicator
    const isSpecialtyPage =
      finalUrl.toLowerCase().includes('/department') ||
      finalUrl.toLowerCase().includes('/specialt') ||
      finalUrl.toLowerCase().includes('/centre-of-excellence') ||
      detectedSpecialties.length > 0;

    // Emergency page indicator
    const isEmergencyPage =
      finalUrl.toLowerCase().includes('/emergency') ||
      finalUrl.toLowerCase().includes('/trauma') ||
      EMERGENCY_TERMS.some((term) => lowerTitle.includes(term) || lowerH1.includes(term));

    // Health Packages indicator
    const hasHealthPackages =
      finalUrl.toLowerCase().includes('/package') ||
      HEALTH_PACKAGE_TERMS.some((term) => lowerBody.includes(term));

    // Insurance indicator
    const hasInsuranceInfo = INSURANCE_TERMS.some((term) => lowerBody.includes(term));

    // Testimonials indicator
    const hasTestimonials = TESTIMONIAL_TERMS.some((term) => lowerBody.includes(term));



    // Breadcrumbs
    const breadcrumbs: string[] = [];
    $('[aria-label="breadcrumb" i] a, .breadcrumb a, .breadcrumbs a').each((_, el) => {
      const bc = $(el).text().trim();
      if (bc) breadcrumbs.push(bc);
    });

    return {
      url: requestedUrl,
      finalUrl,
      statusCode,
      depth,
      title,
      metaDescription,
      h1List,
      h2List,
      wordCount,
      language,
      robotsMeta,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      images,
      imagesCount: images.length,
      imagesMissingAlt,
      internalLinks: Array.from(internalLinksSet),
      externalLinks: Array.from(externalLinksSet),
      phoneNumbers: Array.from(phoneNumbersSet),
      emailAddresses: Array.from(emailSet),
      whatsAppLinks: Array.from(whatsAppLinksSet),
      socialLinks,
      formsCount,
      ctas,
      detectedSpecialties,
      hasAppointmentCta,
      isDoctorPage,
      isSpecialtyPage,
      isEmergencyPage,
      hasHealthPackages,
      hasInsuranceInfo,
      hasTestimonials,
      schemaTypes: Array.from(new Set(schemaTypes)),
      rawJsonLd,
      breadcrumbs,
      bodyTextSnippet: bodyText.slice(0, 1500),
      hasViewportMeta,
      hasMixedContent,
    };
  }
}
