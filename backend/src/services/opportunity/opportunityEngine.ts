import { TechnicalFindingItem } from '../analyzer/technicalSeoAnalyzer.js';
import { HealthcareAnalysisResult } from '../analyzer/healthcareAnalyzer.js';
import { DoctorAuthorityAnalysisResult } from '../analyzer/doctorAnalyzer.js';
import { PatientJourneyAnalysisResult } from '../analyzer/patientJourneyAnalyzer.js';
import { LocalSeoAnalysisResult } from '../analyzer/localSeoAnalyzer.js';
import { CrawlEngineResult } from '../crawler/crawlerEngine.js';

export type IamoninModule =
  | 'DIGITAL_FOUNDATION'
  | 'DOCTOR_AUTHORITY'
  | 'PATIENT_ACQUISITION'
  | 'APPOINTMENT_CONVERSION'
  | 'AI_FOLLOW_UP'
  | 'GROWTH_INTELLIGENCE';

export interface OpportunityItem {
  id: string;
  title: string;
  category: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  effort: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string;
  whyItMatters: string;
  recommendedAction: string;
  iamoninModule: IamoninModule;
  iamoninModuleLabel: string;
  isTop5: boolean;
}

export class OpportunityEngine {
  /**
   * Generates prioritized opportunity catalog mapped to IAMONIN growth modules.
   */
  generateOpportunities(
    crawlData: CrawlEngineResult,
    technicalFindings: TechnicalFindingItem[],
    healthcareData: HealthcareAnalysisResult,
    doctorData: DoctorAuthorityAnalysisResult,
    journeyData: PatientJourneyAnalysisResult,
    localData: LocalSeoAnalysisResult
  ): OpportunityItem[] {
    const pages = crawlData.pages;
    const totalPages = pages.length;
    const opportunities: OpportunityItem[] = [];

    // 1. WhatsApp Patient Engagement Opportunity
    if (!healthcareData.hasWhatsAppDesk) {
      opportunities.push({
        id: 'OPP-01',
        title: 'Instant WhatsApp Patient Consultation Desk',
        category: 'Appointment Conversion',
        severity: 'HIGH',
        impact: 'HIGH',
        effort: 'LOW',
        evidence: 'WhatsApp consultation or appointment booking links were not detected on any crawled page.',
        whyItMatters: 'Over 60% of modern private healthcare enquiries convert faster via direct WhatsApp interaction than static web forms.',
        recommendedAction: 'Implement a direct, automated WhatsApp patient triage desk button across high-intent specialty and doctor profile pages.',
        iamoninModule: 'APPOINTMENT_CONVERSION',
        iamoninModuleLabel: '04 Appointment Conversion',
        isTop5: true,
      });
    }

    // 2. Doctor Profile Direct Appointment CTAs
    if (doctorData.missingCtaProfilesCount > 0) {
      opportunities.push({
        id: 'OPP-02',
        title: 'Doctor Profile Direct Booking CTAs',
        category: 'Doctor Authority',
        severity: 'HIGH',
        impact: 'HIGH',
        effort: 'LOW',
        evidence: `${doctorData.missingCtaProfilesCount} of ${doctorData.totalDoctorsDetected} detected doctor profile(s) lack direct appointment booking buttons.`,
        whyItMatters: 'Patients researching specific specialists drop off when forced to navigate away from the doctor profile to search for generic booking forms.',
        recommendedAction: 'Add 1-click "Book with Dr. [Name]" sticky and in-page CTAs with real-time OPD slot request capability on every consultant page.',
        iamoninModule: 'DOCTOR_AUTHORITY',
        iamoninModuleLabel: '02 Doctor Authority',
        isTop5: true,
      });
    }

    // 3. Doctor Authority & Physician Schema.org Markup
    if (doctorData.missingSchemaProfilesCount > 0 || doctorData.dedicatedProfilesCount < doctorData.totalDoctorsDetected) {
      opportunities.push({
        id: 'OPP-03',
        title: 'Physician Schema & Dedicated Profile Architecture',
        category: 'Doctor Authority',
        severity: 'HIGH',
        impact: 'HIGH',
        effort: 'MEDIUM',
        evidence: `${doctorData.missingSchemaProfilesCount} doctor profile(s) lack Schema.org Physician JSON-LD structured data.`,
        whyItMatters: 'Physician schema enables individual doctors to appear directly in Google Rich Results and Medical Knowledge Panels for local patient queries.',
        recommendedAction: 'Deploy dedicated URL slugs for each consultant with complete biographical, qualification, and Physician JSON-LD schema.',
        iamoninModule: 'DOCTOR_AUTHORITY',
        iamoninModuleLabel: '02 Doctor Authority',
        isTop5: true,
      });
    }

    // 4. Clinical Specialty Content Depth & Thin Pages
    const thinPagesCount = technicalFindings.find((f) => f.checkId === 'TECH-18')?.affectedUrls.length || 0;
    if (thinPagesCount > 0 || healthcareData.missingCoreSpecialties.length > 0) {
      opportunities.push({
        id: 'OPP-04',
        title: 'Clinical Specialty Content Depth & Procedure Hubs',
        category: 'Healthcare Content',
        severity: 'HIGH',
        impact: 'HIGH',
        effort: 'MEDIUM',
        evidence: `${thinPagesCount} page(s) have thin clinical content (<300 words), and ${healthcareData.missingCoreSpecialties.length} core super-specialty hub(s) lack dedicated pages.`,
        whyItMatters: 'High-intent patients seeking complex surgical procedures (e.g. joint replacement, cardiology) research clinical outcomes, technology, and doctor experience.',
        recommendedAction: 'Create comprehensive 800+ word specialty pillars detailing treatment procedures, hospital technology, consultant team, and recovery FAQs.',
        iamoninModule: 'PATIENT_ACQUISITION',
        iamoninModuleLabel: '03 Patient Acquisition',
        isTop5: true,
      });
    }

    // 5. Patient Journey Dead-Ends (Pages Missing CTAs)
    if (journeyData.ctaDensity.noCtaPages > totalPages * 0.25) {
      opportunities.push({
        id: 'OPP-05',
        title: 'Conversion Architecture & Sticky Patient CTAs',
        category: 'Website',
        severity: 'MEDIUM',
        impact: 'HIGH',
        effort: 'LOW',
        evidence: `${journeyData.ctaDensity.noCtaPages} of ${totalPages} analyzed pages have no detectable call-to-action (dead ends).`,
        whyItMatters: 'Patients who reach clinical articles or department overviews without clear next-steps bounce to competitor hospital sites.',
        recommendedAction: 'Introduce floating mobile action bars (Call OPD / WhatsApp Desk / Book Slot) across 100% of website pages.',
        iamoninModule: 'DIGITAL_FOUNDATION',
        iamoninModuleLabel: '01 Digital Foundation',
        isTop5: true,
      });
    }

    // 6. Missing XML Sitemap & Technical SEO Indexing
    if (!crawlData.sitemap.exists) {
      opportunities.push({
        id: 'OPP-06',
        title: 'XML Sitemap & Search Indexing Optimization',
        category: 'Technical SEO',
        severity: 'MEDIUM',
        impact: 'MEDIUM',
        effort: 'LOW',
        evidence: 'XML sitemap was not detected at standard locations or in robots.txt.',
        whyItMatters: 'Search engines take longer to discover newly published doctor profiles and medical articles without an automated XML sitemap.',
        recommendedAction: 'Generate a dynamic, self-updating XML sitemap and submit to search consoles.',
        iamoninModule: 'DIGITAL_FOUNDATION',
        iamoninModuleLabel: '01 Digital Foundation',
        isTop5: false,
      });
    }

    // 7. Local Presence & Hospital Geo-Schema
    if (!localData.hasLocalBusinessSchema) {
      opportunities.push({
        id: 'OPP-07',
        title: 'Hospital & MedicalOrganization Local Entity Schema',
        category: 'Local Visibility',
        severity: 'MEDIUM',
        impact: 'MEDIUM',
        effort: 'LOW',
        evidence: 'Hospital / MedicalOrganization Schema.org JSON-LD structured data is missing from the website.',
        whyItMatters: 'Structured medical entity schema binds the hospital website to local geographical coordinates in Google Maps and localized organic search.',
        recommendedAction: 'Implement JSON-LD schema with exact hospital address, emergency telephone line, OPD timings, and geo-coordinates.',
        iamoninModule: 'DIGITAL_FOUNDATION',
        iamoninModuleLabel: '01 Digital Foundation',
        isTop5: false,
      });
    }

    // 8. Automated Patient Lead Recovery & AI Follow-up (Discovery Required)
    opportunities.push({
      id: 'OPP-08',
      title: 'Automated Lead Recovery & Missed Enquiry Follow-up',
      category: 'Automation Opportunity',
      severity: 'HIGH',
      impact: 'HIGH',
      effort: 'MEDIUM',
      evidence: 'Observable website shows enquiry capture points, but internal response latency and missed call recovery require hospital-side discovery.',
      whyItMatters: 'Industry benchmarks show 35-50% of healthcare website enquiries drop off if not acknowledged within 5 minutes.',
      recommendedAction: 'Deploy IAMONIN AI Follow-up workflows to instantly acknowledge web leads, send WhatsApp reminders, and recover missed enquiries.',
      iamoninModule: 'AI_FOLLOW_UP',
      iamoninModuleLabel: '05 AI Follow-up (Discovery Required)',
      isTop5: false,
    });

    // 9. End-to-End Growth Intelligence & Conversion Analytics (Discovery Required)
    opportunities.push({
      id: 'OPP-09',
      title: 'OPD Funnel & Patient Acquisition ROI Tracking',
      category: 'Growth Intelligence',
      severity: 'HIGH',
      impact: 'HIGH',
      effort: 'MEDIUM',
      evidence: 'Front-end tracking tags and internal CRM integration status require discovery discussion.',
      whyItMatters: 'Without unified campaign-to-OPD conversion tracking, hospital marketing spend cannot be attributed to specific super-specialty revenues.',
      recommendedAction: 'Implement IAMONIN Growth Intelligence dashboard connecting digital touchpoints to OPD consultations and IPD admissions.',
      iamoninModule: 'GROWTH_INTELLIGENCE',
      iamoninModuleLabel: '06 Growth Intelligence (Discovery Required)',
      isTop5: false,
    });

    // Select Top 5
    const top5Ids = opportunities.slice(0, 5).map((o) => o.id);
    opportunities.forEach((o) => {
      o.isTop5 = top5Ids.includes(o.id);
    });

    return opportunities;
  }
}
