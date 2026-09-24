import { describe, it, expect } from 'vitest';
import { ScoringEngine } from '../src/services/scoring/scoringEngine.js';
import { TechnicalFindingItem } from '../src/services/analyzer/technicalSeoAnalyzer.js';

describe('Scoring Engine', () => {
  const engine = new ScoringEngine();

  it('keeps all 8 scores strictly within 0-100 bounds and computes opportunity grade', () => {
    const mockCrawlData: any = {
      pages: [
        {
          url: 'https://sample-hospital.com',
          finalUrl: 'https://sample-hospital.com',
          schemaTypes: ['Hospital'],
          phoneNumbers: ['+919876543210'],
          whatsAppLinks: [],
          ctas: [],
          hasAppointmentCta: false,
          detectedSpecialties: ['Cardiology & Cardiac Surgery'],
          wordCount: 400,
        },
      ],
      sitemap: { exists: false, totalUrls: 0, sitemapUrls: [] },
      robots: { exists: true, disallowedPaths: [], sitemaps: [] },
      stats: { totalDiscovered: 1, totalCrawled: 1 },
    };

    const mockTechnicalFindings: TechnicalFindingItem[] = [
      {
        checkId: 'TECH-01',
        name: 'HTTPS',
        category: 'Security',
        severity: 'INFO',
        passed: true,
        evidence: 'HTTPS active',
        affectedUrls: [],
        explanation: '',
        recommendation: '',
      },
    ];

    const mockHealthcare: any = {
      detectedSpecialties: [{ name: 'Cardiology', category: 'super_specialty', pagesCount: 1 }],
      missingCoreSpecialties: ['Neurology'],
      hasEmergencyInfo: true,
      hasAppointmentBooking: false,
      hasWhatsAppDesk: false,
      hasHealthPackages: false,
      hasInsuranceDesk: false,
      hasPatientEducation: false,
    };

    const mockDoctor: any = {
      totalDoctorsDetected: 2,
      dedicatedProfilesCount: 1,
      missingCtaProfilesCount: 1,
      missingSchemaProfilesCount: 1,
      weakContentProfilesCount: 0,
      doctors: [],
    };

    const mockJourney: any = {
      conversionReadinessScore: 50,
      stages: [],
    };

    const mockLocal: any = {
      hasAddress: true,
      hasPhone: true,
      hasEmbeddedMap: false,
      hasLocalBusinessSchema: false,
    };

    const scores = engine.calculateScores(
      mockCrawlData,
      mockTechnicalFindings,
      mockHealthcare,
      mockDoctor,
      mockJourney,
      mockLocal
    );

    expect(scores.technicalHealth.score).toBeGreaterThanOrEqual(0);
    expect(scores.technicalHealth.score).toBeLessThanOrEqual(100);
    expect(scores.seoReadiness.score).toBeGreaterThanOrEqual(0);
    expect(scores.seoReadiness.score).toBeLessThanOrEqual(100);
    expect(scores.healthcareContent.score).toBeGreaterThanOrEqual(0);
    expect(scores.healthcareContent.score).toBeLessThanOrEqual(100);
    expect(scores.doctorAuthority.score).toBeGreaterThanOrEqual(0);
    expect(scores.doctorAuthority.score).toBeLessThanOrEqual(100);
    expect(scores.patientJourney.score).toBeGreaterThanOrEqual(0);
    expect(scores.patientJourney.score).toBeLessThanOrEqual(100);
    expect(scores.conversionReadiness.score).toBeGreaterThanOrEqual(0);
    expect(scores.conversionReadiness.score).toBeLessThanOrEqual(100);
    expect(scores.localPresence.score).toBeGreaterThanOrEqual(0);
    expect(scores.localPresence.score).toBeLessThanOrEqual(100);
    expect(scores.contentOpportunity.score).toBeGreaterThanOrEqual(0);
    expect(scores.contentOpportunity.score).toBeLessThanOrEqual(100);

    expect(['HIGH', 'MEDIUM', 'LOW']).toContain(scores.overallOpportunity);
  });
});
