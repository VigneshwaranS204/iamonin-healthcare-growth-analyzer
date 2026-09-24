import { describe, it, expect } from 'vitest';
import { TechnicalSeoAnalyzer } from '../src/services/analyzer/technicalSeoAnalyzer.js';
import { CrawlEngineResult } from '../src/services/crawler/crawlerEngine.js';

describe('Technical SEO Analyzer', () => {
  const analyzer = new TechnicalSeoAnalyzer();

  it('detects missing titles, duplicate H1s, and thin content accurately', () => {
    const mockCrawlData: CrawlEngineResult = {
      baseUrl: 'https://test-hospital.com',
      rootFinalUrl: 'https://test-hospital.com',
      pages: [
        {
          url: 'https://test-hospital.com',
          finalUrl: 'https://test-hospital.com',
          statusCode: 200,
          depth: 0,
          title: 'Test Hospital - Best Care',
          metaDescription: 'Leading super specialty hospital in Bengaluru offering 24/7 care.',
          h1List: ['Welcome to Test Hospital', 'Secondary H1'],
          h2List: ['Specialties', 'Doctors'],
          wordCount: 500,
          language: 'en',
          robotsMeta: '',
          canonicalUrl: 'https://test-hospital.com',
          ogTitle: 'Test Hospital',
          ogDescription: 'Best healthcare',
          ogImage: 'https://test-hospital.com/og.jpg',
          images: [{ src: '/img1.jpg', alt: '', hasAlt: false }],
          imagesCount: 1,
          imagesMissingAlt: 1,
          internalLinks: ['https://test-hospital.com/cardiology'],
          externalLinks: [],
          phoneNumbers: ['+91 9845012345'],
          emailAddresses: ['info@test-hospital.com'],
          whatsAppLinks: [],
          socialLinks: {},
          formsCount: 1,
          ctas: [{ text: 'Book Appointment', type: 'BOOK_APPOINTMENT', tag: 'button' }],
          detectedSpecialties: ['Cardiology & Cardiac Surgery'],
          hasAppointmentCta: true,
          isDoctorPage: false,
          isSpecialtyPage: false,
          isEmergencyPage: false,
          hasHealthPackages: false,
          hasInsuranceInfo: false,
          hasTestimonials: false,
          schemaTypes: ['Hospital'],
          rawJsonLd: [],
          breadcrumbs: [],
          bodyTextSnippet: 'Welcome to test hospital with cardiology',
          hasViewportMeta: true,
          hasMixedContent: false,
        },
        {
          url: 'https://test-hospital.com/cardiology',
          finalUrl: 'https://test-hospital.com/cardiology',
          statusCode: 200,
          depth: 1,
          title: '', // Missing title
          metaDescription: '', // Missing meta
          h1List: [], // Missing H1
          h2List: [],
          wordCount: 120, // Thin content
          language: 'en',
          robotsMeta: '',
          canonicalUrl: '',
          ogTitle: '',
          ogDescription: '',
          ogImage: '',
          images: [],
          imagesCount: 0,
          imagesMissingAlt: 0,
          internalLinks: [],
          externalLinks: [],
          phoneNumbers: [],
          emailAddresses: [],
          whatsAppLinks: [],
          socialLinks: {},
          formsCount: 0,
          ctas: [],
          detectedSpecialties: ['Cardiology & Cardiac Surgery'],
          hasAppointmentCta: false,
          isDoctorPage: false,
          isSpecialtyPage: true,
          isEmergencyPage: false,
          hasHealthPackages: false,
          hasInsuranceInfo: false,
          hasTestimonials: false,
          schemaTypes: [],
          rawJsonLd: [],
          breadcrumbs: [],
          bodyTextSnippet: 'Cardiology services',
          hasViewportMeta: true,
          hasMixedContent: false,
        },
      ],
      robots: {
        exists: true,
        sitemaps: ['https://test-hospital.com/sitemap.xml'],
        disallowedPaths: ['/admin'],
        allowedPaths: ['/'],
        userAgents: ['*'],
        observations: [],
      },
      sitemap: {
        exists: true,
        urls: ['https://test-hospital.com', 'https://test-hospital.com/cardiology'],
        totalUrls: 2,
        sitemapUrls: ['https://test-hospital.com/sitemap.xml'],
        errors: [],
        observations: [],
      },
      stats: {
        totalDiscovered: 2,
        totalCrawled: 2,
        totalFailed: 0,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        durationSeconds: 2,
      },
    };

    const findings = analyzer.analyze(mockCrawlData);
    expect(findings.length).toBe(26);

    // Check Missing Title
    const missingTitleCheck = findings.find((f) => f.checkId === 'TECH-03');
    expect(missingTitleCheck?.passed).toBe(false);
    expect(missingTitleCheck?.affectedUrls).toContain('https://test-hospital.com/cardiology');

    // Check Multiple H1
    const multiH1Check = findings.find((f) => f.checkId === 'TECH-10');
    expect(multiH1Check?.passed).toBe(false);

    // Check Thin Content
    const thinCheck = findings.find((f) => f.checkId === 'TECH-18');
    expect(thinCheck?.passed).toBe(false);
    expect(thinCheck?.affectedUrls).toContain('https://test-hospital.com/cardiology');
  });
});
