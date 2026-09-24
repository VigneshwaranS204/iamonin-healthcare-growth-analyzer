import { TechnicalFindingItem } from '../analyzer/technicalSeoAnalyzer.js';
import { HealthcareAnalysisResult } from '../analyzer/healthcareAnalyzer.js';
import { DoctorAuthorityAnalysisResult } from '../analyzer/doctorAnalyzer.js';
import { PatientJourneyAnalysisResult } from '../analyzer/patientJourneyAnalyzer.js';
import { LocalSeoAnalysisResult } from '../analyzer/localSeoAnalyzer.js';
import { CrawlEngineResult } from '../crawler/crawlerEngine.js';

export interface ScoreComponentBreakdown {
  name: string;
  weight: number;
  score: number;
  maxScore: number;
  reason: string;
}

export interface DimensionScore {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL_GAPS';
  components: ScoreComponentBreakdown[];
}

export interface ComprehensiveScoresResult {
  overallOpportunity: 'HIGH' | 'MEDIUM' | 'LOW';
  overallOpportunityScore: number; // 0-100 (Higher = more untapped growth opportunity)
  technicalHealth: DimensionScore;
  seoReadiness: DimensionScore;
  healthcareContent: DimensionScore;
  doctorAuthority: DimensionScore;
  patientJourney: DimensionScore;
  conversionReadiness: DimensionScore;
  localPresence: DimensionScore;
  contentOpportunity: DimensionScore;
}

export class ScoringEngine {
  /**
   * Calculates explainable 8-dimensional scores across all audit findings.
   */
  calculateScores(
    crawlData: CrawlEngineResult,
    technicalFindings: TechnicalFindingItem[],
    healthcareData: HealthcareAnalysisResult,
    doctorData: DoctorAuthorityAnalysisResult,
    journeyData: PatientJourneyAnalysisResult,
    localData: LocalSeoAnalysisResult
  ): ComprehensiveScoresResult {
    const pages = crawlData.pages;
    const totalPages = Math.max(pages.length, 1);

    // 1. Technical Health (0-100)
    const techComponents: ScoreComponentBreakdown[] = [];
    let techScore = 100;

    const nonHttps = technicalFindings.find((f) => f.checkId === 'TECH-01')?.passed ? 0 : 25;
    techScore -= nonHttps;
    techComponents.push({
      name: 'HTTPS Security & Encryption',
      weight: 25,
      score: 25 - nonHttps,
      maxScore: 25,
      reason: nonHttps > 0 ? 'Insecure pages detected' : 'Full HTTPS active',
    });

    const brokenPages = technicalFindings.find((f) => f.checkId === 'TECH-14')?.passed ? 0 : 20;
    techScore -= brokenPages;
    techComponents.push({
      name: 'Page Availability (No 4xx/5xx)',
      weight: 20,
      score: 20 - brokenPages,
      maxScore: 20,
      reason: brokenPages > 0 ? 'Broken pages detected' : 'All pages responding 200 OK',
    });

    const viewportPassed = technicalFindings.find((f) => f.checkId === 'TECH-25')?.passed ? 20 : 0;
    techComponents.push({
      name: 'Mobile Viewport Architecture',
      weight: 20,
      score: viewportPassed,
      maxScore: 20,
      reason: viewportPassed === 20 ? 'Mobile responsive meta configured' : 'Missing viewport meta tag',
    });

    const mixedContentPassed = technicalFindings.find((f) => f.checkId === 'TECH-26')?.passed ? 15 : 0;
    techComponents.push({
      name: 'Clean HTTPS Assets (No Mixed Content)',
      weight: 15,
      score: mixedContentPassed,
      maxScore: 15,
      reason: mixedContentPassed === 15 ? 'Zero mixed content' : 'Insecure assets on HTTPS',
    });

    const depthPassed = technicalFindings.find((f) => f.checkId === 'TECH-20')?.passed ? 20 : 10;
    techComponents.push({
      name: 'Crawl Depth & Hierarchy',
      weight: 20,
      score: depthPassed,
      maxScore: 20,
      reason: depthPassed === 20 ? 'Pages accessible within 3 clicks' : 'Excessive click depth found',
    });

    const finalTechScore = Math.max(0, Math.min(100, Math.round(techComponents.reduce((a, b) => a + b.score, 0))));

    // 2. SEO Readiness (0-100)
    const seoComponents: ScoreComponentBreakdown[] = [];
    const titlePassed = technicalFindings.find((f) => f.checkId === 'TECH-03')?.passed ? 20 : 5;
    seoComponents.push({ name: 'Title Tag Coverage', weight: 20, score: titlePassed, maxScore: 20, reason: 'Page title presence' });

    const metaPassed = technicalFindings.find((f) => f.checkId === 'TECH-07')?.passed ? 20 : 5;
    seoComponents.push({ name: 'Meta Description Coverage', weight: 20, score: metaPassed, maxScore: 20, reason: 'Search snippet descriptions' });

    const h1Passed = technicalFindings.find((f) => f.checkId === 'TECH-09')?.passed ? 15 : 5;
    seoComponents.push({ name: 'H1 Semantic Heading Structure', weight: 15, score: h1Passed, maxScore: 15, reason: 'Primary H1 headings' });

    const sitemapPassed = crawlData.sitemap.exists ? 15 : 0;
    seoComponents.push({ name: 'XML Sitemap Presence', weight: 15, score: sitemapPassed, maxScore: 15, reason: crawlData.sitemap.exists ? 'Sitemap verified' : 'No sitemap found' });

    const schemaPagesCount = pages.filter((p) => p.schemaTypes.length > 0).length;
    const schemaScore = Math.round((schemaPagesCount / totalPages) * 15);
    seoComponents.push({ name: 'Structured Data (Schema.org)', weight: 15, score: schemaScore, maxScore: 15, reason: `${schemaPagesCount}/${totalPages} pages with schema` });

    const canonicalPassed = technicalFindings.find((f) => f.checkId === 'TECH-12')?.passed ? 15 : 5;
    seoComponents.push({ name: 'Canonical Tag Implementation', weight: 15, score: canonicalPassed, maxScore: 15, reason: 'Duplicate content protection' });

    const finalSeoScore = Math.max(0, Math.min(100, Math.round(seoComponents.reduce((a, b) => a + b.score, 0))));

    // 3. Healthcare Content Depth (0-100)
    const hcComponents: ScoreComponentBreakdown[] = [];
    const specCount = healthcareData.detectedSpecialties.length;
    const specScore = Math.min(30, specCount * 4);
    hcComponents.push({ name: 'Clinical Specialty Depth', weight: 30, score: specScore, maxScore: 30, reason: `${specCount} specialties identified` });

    const emergencyScore = healthcareData.hasEmergencyInfo ? 20 : 0;
    hcComponents.push({ name: '24/7 Emergency & Casualty Section', weight: 20, score: emergencyScore, maxScore: 20, reason: healthcareData.hasEmergencyInfo ? 'Emergency care highlighted' : 'No 24/7 emergency section' });

    const packageScore = healthcareData.hasHealthPackages ? 15 : 0;
    hcComponents.push({ name: 'Preventive Health Packages', weight: 15, score: packageScore, maxScore: 15, reason: healthcareData.hasHealthPackages ? 'Packages available' : 'No preventive packages found' });

    const insuranceScore = healthcareData.hasInsuranceDesk ? 15 : 0;
    hcComponents.push({ name: 'Cashless Insurance & TPA Desk', weight: 15, score: insuranceScore, maxScore: 15, reason: healthcareData.hasInsuranceDesk ? 'Insurance info present' : 'No insurance guidelines' });

    const eduScore = healthcareData.hasPatientEducation ? 20 : 0;
    hcComponents.push({ name: 'Patient Education & Health Blog', weight: 20, score: eduScore, maxScore: 20, reason: healthcareData.hasPatientEducation ? 'Blog active' : 'No patient education blog' });

    const finalHcScore = Math.max(0, Math.min(100, Math.round(hcComponents.reduce((a, b) => a + b.score, 0))));

    // 4. Doctor Authority (0-100)
    const docComponents: ScoreComponentBreakdown[] = [];
    const docTotal = doctorData.totalDoctorsDetected;
    const docDiscoveryScore = docTotal > 0 ? (docTotal >= 10 ? 30 : docTotal * 3) : 0;
    docComponents.push({ name: 'Physician Profiles Discovered', weight: 30, score: docDiscoveryScore, maxScore: 30, reason: `${docTotal} doctor profiles detected` });

    const dedicatedRatio = docTotal > 0 ? doctorData.dedicatedProfilesCount / docTotal : 0;
    const dedicatedScore = Math.round(dedicatedRatio * 25);
    docComponents.push({ name: 'Dedicated Doctor Profile Pages', weight: 25, score: dedicatedScore, maxScore: 25, reason: `${doctorData.dedicatedProfilesCount}/${docTotal} with dedicated URLs` });

    const schemaRatio = docTotal > 0 ? (docTotal - doctorData.missingSchemaProfilesCount) / docTotal : 0;
    const docSchemaScore = Math.round(schemaRatio * 20);
    docComponents.push({ name: 'Physician Schema.org Markup', weight: 20, score: docSchemaScore, maxScore: 20, reason: `${docTotal - doctorData.missingSchemaProfilesCount}/${docTotal} with physician schema` });

    const ctaRatio = docTotal > 0 ? (docTotal - doctorData.missingCtaProfilesCount) / docTotal : 0;
    const docCtaScore = Math.round(ctaRatio * 25);
    docComponents.push({ name: 'Direct Doctor Appointment CTAs', weight: 25, score: docCtaScore, maxScore: 25, reason: `${docTotal - doctorData.missingCtaProfilesCount}/${docTotal} with direct booking CTAs` });

    const finalDocScore = Math.max(0, Math.min(100, Math.round(docComponents.reduce((a, b) => a + b.score, 0))));

    // 5. Patient Journey (0-100)
    const journeyScore = journeyData.conversionReadinessScore;

    // 6. Conversion Readiness (0-100)
    const convComponents: ScoreComponentBreakdown[] = [];
    const waScore = healthcareData.hasWhatsAppDesk ? 25 : 0;
    convComponents.push({ name: 'WhatsApp Instant Chat Desk', weight: 25, score: waScore, maxScore: 25, reason: healthcareData.hasWhatsAppDesk ? 'WhatsApp active' : 'No WhatsApp chat detected' });

    const apptPagesCount = pages.filter((p) => p.hasAppointmentCta).length;
    const apptCoverageScore = Math.round((apptPagesCount / totalPages) * 35);
    convComponents.push({ name: 'Appointment CTA Density Across Pages', weight: 35, score: apptCoverageScore, maxScore: 35, reason: `${apptPagesCount}/${totalPages} pages with booking CTAs` });

    const callScore = pages.some((p) => p.phoneNumbers.length > 0) ? 20 : 0;
    convComponents.push({ name: 'Click-to-Call Phone Accessibility', weight: 20, score: callScore, maxScore: 20, reason: callScore === 20 ? 'Telephone CTAs detected' : 'No phone CTAs detected' });

    const formScore = pages.some((p) => p.formsCount > 0) ? 20 : 0;
    convComponents.push({ name: 'Online Enquiry & Consultation Forms', weight: 20, score: formScore, maxScore: 20, reason: formScore === 20 ? 'Enquiry forms present' : 'No enquiry forms detected' });

    const finalConvScore = Math.max(0, Math.min(100, Math.round(convComponents.reduce((a, b) => a + b.score, 0))));

    // 7. Local Presence Signals (0-100)
    const localComponents: ScoreComponentBreakdown[] = [];
    const addrScore = localData.hasAddress ? 25 : 0;
    localComponents.push({ name: 'Physical Address Detection', weight: 25, score: addrScore, maxScore: 25, reason: localData.hasAddress ? 'Address detected' : 'No address detected' });

    const phoneLocalScore = localData.hasPhone ? 25 : 0;
    localComponents.push({ name: 'Local Telephone Number', weight: 25, score: phoneLocalScore, maxScore: 25, reason: localData.hasPhone ? 'Phone numbers found' : 'No phone numbers found' });

    const mapScore = localData.hasEmbeddedMap ? 25 : 0;
    localComponents.push({ name: 'Interactive Map & Directions Link', weight: 25, score: mapScore, maxScore: 25, reason: localData.hasEmbeddedMap ? 'Google Map embedded' : 'No embedded map detected' });

    const locSchemaScore = localData.hasLocalBusinessSchema ? 25 : 0;
    localComponents.push({ name: 'Hospital / Medical Organization Schema', weight: 25, score: locSchemaScore, maxScore: 25, reason: localData.hasLocalBusinessSchema ? 'Geo schema present' : 'Missing LocalBusiness schema' });

    const finalLocalScore = Math.max(0, Math.min(100, Math.round(localComponents.reduce((a, b) => a + b.score, 0))));

    // 8. Content Opportunity (0-100)
    const contentComponents: ScoreComponentBreakdown[] = [];
    const thinPagesCount = technicalFindings.find((f) => f.checkId === 'TECH-18')?.affectedUrls.length || 0;
    const thinRatio = 1 - Math.min(1, thinPagesCount / totalPages);
    const thinScore = Math.round(thinRatio * 35);
    contentComponents.push({ name: 'Clinical Content Depth (>300 words)', weight: 35, score: thinScore, maxScore: 35, reason: `${thinPagesCount} thin page(s)` });

    const eduContentScore = healthcareData.hasPatientEducation ? 35 : 0;
    contentComponents.push({ name: 'Health Blog & Patient Education', weight: 35, score: eduContentScore, maxScore: 35, reason: healthcareData.hasPatientEducation ? 'Blog exists' : 'No blog found' });

    const faqScore = pages.some((p) => p.schemaTypes.some((t) => t.toLowerCase().includes('faq'))) ? 30 : 0;
    contentComponents.push({ name: 'Patient FAQs & Symptom Guidance', weight: 30, score: faqScore, maxScore: 30, reason: faqScore === 30 ? 'FAQ schema detected' : 'No FAQ schema detected' });

    const finalContentScore = Math.max(0, Math.min(100, Math.round(contentComponents.reduce((a, b) => a + b.score, 0))));

    // Overall Average Score (0-100)
    const avgScore = Math.round(
      (finalTechScore +
        finalSeoScore +
        finalHcScore +
        finalDocScore +
        journeyScore +
        finalConvScore +
        finalLocalScore +
        finalContentScore) /
        8
    );

    // Opportunity Score (Inverse: lower current performance = higher upside opportunity for IAMONIN)
    const overallOpportunityScore = 100 - avgScore;
    const overallOpportunity: 'HIGH' | 'MEDIUM' | 'LOW' =
      overallOpportunityScore >= 45 ? 'HIGH' : overallOpportunityScore >= 25 ? 'MEDIUM' : 'LOW';

    const getGrade = (s: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
      if (s >= 85) return 'A';
      if (s >= 70) return 'B';
      if (s >= 55) return 'C';
      if (s >= 40) return 'D';
      return 'F';
    };

    const getStatus = (s: number): DimensionScore['status'] => {
      if (s >= 80) return 'EXCELLENT';
      if (s >= 65) return 'GOOD';
      if (s >= 45) return 'NEEDS_ATTENTION';
      return 'CRITICAL_GAPS';
    };

    return {
      overallOpportunity,
      overallOpportunityScore,
      technicalHealth: { score: finalTechScore, grade: getGrade(finalTechScore), status: getStatus(finalTechScore), components: techComponents },
      seoReadiness: { score: finalSeoScore, grade: getGrade(finalSeoScore), status: getStatus(finalSeoScore), components: seoComponents },
      healthcareContent: { score: finalHcScore, grade: getGrade(finalHcScore), status: getStatus(finalHcScore), components: hcComponents },
      doctorAuthority: { score: finalDocScore, grade: getGrade(finalDocScore), status: getStatus(finalDocScore), components: docComponents },
      patientJourney: {
        score: journeyScore,
        grade: getGrade(journeyScore),
        status: getStatus(journeyScore),
        components: journeyData.stages.map((st) => ({
          name: st.title,
          weight: 16,
          score: Math.round(st.score * 0.16),
          maxScore: 16,
          reason: st.evidence,
        })),
      },
      conversionReadiness: { score: finalConvScore, grade: getGrade(finalConvScore), status: getStatus(finalConvScore), components: convComponents },
      localPresence: { score: finalLocalScore, grade: getGrade(finalLocalScore), status: getStatus(finalLocalScore), components: localComponents },
      contentOpportunity: { score: finalContentScore, grade: getGrade(finalContentScore), status: getStatus(finalContentScore), components: contentComponents },
    };
  }
}
