import { TechnicalFindingItem } from '../analyzer/technicalSeoAnalyzer.js';
import { HealthcareAnalysisResult } from '../analyzer/healthcareAnalyzer.js';
import { DoctorAuthorityAnalysisResult } from '../analyzer/doctorAnalyzer.js';
import { PatientJourneyAnalysisResult } from '../analyzer/patientJourneyAnalyzer.js';
import { LocalSeoAnalysisResult } from '../analyzer/localSeoAnalyzer.js';
import { SocialAnalysisResult } from '../analyzer/socialAnalyzer.js';
import { KeywordDiscoveryResult } from '../analyzer/keywordDiscovery.js';
import { ComprehensiveScoresResult } from '../scoring/scoringEngine.js';
import { OpportunityItem } from '../opportunity/opportunityEngine.js';
import { CrawlEngineResult } from '../crawler/crawlerEngine.js';

export interface ReportSection {
  sectionNumber: number;
  sectionTitle: string;
  summary: string;
  data: Record<string, any>;
}

export interface FullAuditReportData {
  meta: {
    hospitalName: string;
    websiteUrl: string;
    location: string;
    auditDate: string;
    overallOpportunity: 'HIGH' | 'MEDIUM' | 'LOW';
    overallScore: number;
  };
  executiveSummary: string;
  sections: ReportSection[];
  discoveryQuestions: Array<{ question: string; category: string; rationale: string }>;
  priorityRoadmap: Array<{
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    impact: string;
    effort: string;
    recommendation: string;
    iamoninModule: string;
  }>;
}

export class ReportGenerator {
  /**
   * Builds the comprehensive 12-section Healthcare Digital Growth Audit report structure.
   */
  generateReport(
    hospitalName: string,
    location: string,
    websiteUrl: string,
    crawlData: CrawlEngineResult,
    technicalFindings: TechnicalFindingItem[],
    healthcareData: HealthcareAnalysisResult,
    doctorData: DoctorAuthorityAnalysisResult,
    journeyData: PatientJourneyAnalysisResult,
    localData: LocalSeoAnalysisResult,
    socialData: SocialAnalysisResult,
    keywordData: KeywordDiscoveryResult,
    scores: ComprehensiveScoresResult,
    opportunities: OpportunityItem[]
  ): FullAuditReportData {
    const auditDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const top5 = opportunities.filter((o) => o.isTop5);

    // Section 1: Executive Summary
    const executiveSummary = `IAMONIN Healthcare Growth Analyzer completed an automated, non-invasive digital audit of ${hospitalName}'s publicly accessible website (${websiteUrl}) on ${auditDate}.

The overall observable growth opportunity is rated as **${scores.overallOpportunity}**. 
The website exhibits a Technical Health score of **${scores.technicalHealth.score}/100**, SEO Readiness score of **${scores.seoReadiness.score}/100**, Healthcare Structure score of **${scores.healthcareContent.score}/100**, and Doctor Authority score of **${scores.doctorAuthority.score}/100**.

Key priority highlights:
1. **${top5[0]?.title || 'Conversion Architecture'}**: ${top5[0]?.evidence || 'Identified growth potential.'}
2. **${top5[1]?.title || 'Doctor Authority'}**: ${top5[1]?.evidence || 'Specialist visibility opportunity.'}
3. **${top5[2]?.title || 'Clinical Depth'}**: ${top5[2]?.evidence || 'Content expansion opportunity.'}

Full technical observations, patient conversion journey steps, and IAMONIN Healthcare Growth recommendations are detailed in the sections below.`;

    const sections: ReportSection[] = [
      {
        sectionNumber: 1,
        sectionTitle: 'Executive Summary',
        summary: executiveSummary,
        data: {
          scores,
          overallOpportunity: scores.overallOpportunity,
          pagesCrawled: crawlData.pages.length,
          auditDate,
        },
      },
      {
        sectionNumber: 2,
        sectionTitle: 'Website Overview & Crawl Footprint',
        summary: `Analyzed ${crawlData.pages.length} public web pages up to depth ${Math.max(...crawlData.pages.map((p) => p.depth), 0)}. Discovered ${crawlData.stats.totalDiscovered} total unique URLs.`,
        data: {
          totalPagesCrawled: crawlData.pages.length,
          totalUrlsDiscovered: crawlData.stats.totalDiscovered,
          durationSeconds: crawlData.stats.durationSeconds,
          robotsTxtActive: crawlData.robots.exists,
          sitemapActive: crawlData.sitemap.exists,
          sitemapUrlsCount: crawlData.sitemap.totalUrls,
        },
      },
      {
        sectionNumber: 3,
        sectionTitle: 'Technical & On-Page SEO Health',
        summary: `Evaluated 26 rule-based technical checks. Identified ${technicalFindings.filter((f) => !f.passed).length} potential technical optimizations.`,
        data: {
          score: scores.technicalHealth.score,
          seoScore: scores.seoReadiness.score,
          findings: technicalFindings,
        },
      },
      {
        sectionNumber: 4,
        sectionTitle: 'Healthcare Website Structure & Clinical Depth',
        summary: `Detected ${healthcareData.detectedSpecialties.length} clinical specialties, ${healthcareData.hasEmergencyInfo ? '24/7 Emergency care information' : 'No emergency care page'}, and ${healthcareData.hasHealthPackages ? 'health checkup packages' : 'no checkup packages'}.`,
        data: {
          score: scores.healthcareContent.score,
          detectedSpecialties: healthcareData.detectedSpecialties,
          missingCoreSpecialties: healthcareData.missingCoreSpecialties,
          hasEmergency: healthcareData.hasEmergencyInfo,
          hasPackages: healthcareData.hasHealthPackages,
          hasInsurance: healthcareData.hasInsuranceDesk,
          hasInternationalDesk: healthcareData.hasInternationalPatientInfo,
        },
      },
      {
        sectionNumber: 5,
        sectionTitle: 'Doctor Authority & Physician Presentation',
        summary: `Discovered ${doctorData.totalDoctorsDetected} doctor profiles. ${doctorData.dedicatedProfilesCount} have dedicated URLs, while ${doctorData.missingCtaProfilesCount} lack direct booking CTAs.`,
        data: {
          score: scores.doctorAuthority.score,
          totalDoctors: doctorData.totalDoctorsDetected,
          dedicatedProfiles: doctorData.dedicatedProfilesCount,
          missingCtaCount: doctorData.missingCtaProfilesCount,
          missingSchemaCount: doctorData.missingSchemaProfilesCount,
          doctorsList: doctorData.doctors.slice(0, 20),
        },
      },
      {
        sectionNumber: 6,
        sectionTitle: 'Patient Conversion Journey & CTA Density',
        summary: `Patient Conversion Readiness score is ${journeyData.conversionReadinessScore}/100. Call CTAs exist on ${journeyData.ctaDensity.callCtaPages} pages, WhatsApp on ${journeyData.ctaDensity.whatsAppCtaPages} pages, and appointment booking on ${journeyData.ctaDensity.appointmentCtaPages} pages.`,
        data: {
          score: journeyData.conversionReadinessScore,
          stages: journeyData.stages,
          ctaDensity: journeyData.ctaDensity,
          observations: journeyData.observations,
        },
      },
      {
        sectionNumber: 7,
        sectionTitle: 'Clinical Content & Target Keyword Opportunities',
        summary: `Identified ${keywordData.totalGenerated} potential target keyword opportunities across clinical specialties and doctor profiles.`,
        data: {
          score: scores.contentOpportunity.score,
          keywords: keywordData.keywords,
          disclaimer: keywordData.disclaimer,
        },
      },
      {
        sectionNumber: 8,
        sectionTitle: 'Local Visibility Signals & Social Ecosystem',
        summary: `Detected ${localData.detectedPhones.length} contact telephone numbers, ${localData.hasEmbeddedMap ? 'embedded map presence' : 'no embedded map'}, and ${socialData.detectedCount} social media channel links.`,
        data: {
          score: scores.localPresence.score,
          localData,
          socialPlatforms: socialData.platforms,
        },
      },
      {
        sectionNumber: 9,
        sectionTitle: 'Top 5 High-Impact Growth Opportunities',
        summary: 'Prioritized high-leverage growth actions mapped directly to detected evidence.',
        data: {
          top5Opportunities: top5,
        },
      },
      {
        sectionNumber: 10,
        sectionTitle: 'IAMONIN Recommended Growth Modules',
        summary: 'Mapping of hospital opportunities to the six core IAMONIN Healthcare Growth System modules.',
        data: {
          modules: [
            {
              code: '01',
              name: 'Digital Foundation',
              description: 'Website architecture, technical SEO, mobile conversion bar, and LocalBusiness entity schema.',
              applicableFindings: opportunities.filter((o) => o.iamoninModule === 'DIGITAL_FOUNDATION').length,
            },
            {
              code: '02',
              name: 'Doctor Authority',
              description: 'Physician personal branding, dedicated profile pages, Schema.org Physician markup, and direct OPD slot booking.',
              applicableFindings: opportunities.filter((o) => o.iamoninModule === 'DOCTOR_AUTHORITY').length,
            },
            {
              code: '03',
              name: 'Patient Acquisition',
              description: 'High-intent specialty landing pages, procedural content depth, clinical education hubs, and search visibility.',
              applicableFindings: opportunities.filter((o) => o.iamoninModule === 'PATIENT_ACQUISITION').length,
            },
            {
              code: '04',
              name: 'Appointment Conversion',
              description: '1-click WhatsApp patient triage, real-time consultation booking flows, and friction reduction.',
              applicableFindings: opportunities.filter((o) => o.iamoninModule === 'APPOINTMENT_CONVERSION').length,
            },
            {
              code: '05',
              name: 'AI Follow-up (Discovery Required)',
              description: 'Automated enquiry instant response, WhatsApp reminders, missed call recovery, and patient reactivation.',
              applicableFindings: opportunities.filter((o) => o.iamoninModule === 'AI_FOLLOW_UP').length,
            },
            {
              code: '06',
              name: 'Growth Intelligence (Discovery Required)',
              description: 'Unified marketing-to-OPD conversion tracking, specialty campaign ROI analytics, and patient lifetime value reporting.',
              applicableFindings: opportunities.filter((o) => o.iamoninModule === 'GROWTH_INTELLIGENCE').length,
            },
          ],
        },
      },
      {
        sectionNumber: 11,
        sectionTitle: 'Priority Implementation Roadmap',
        summary: 'High, Medium, and Low phased rollout plan based on Impact vs. Effort analysis.',
        data: {
          opportunities,
        },
      },
      {
        sectionNumber: 12,
        sectionTitle: 'Hospital Discovery Questions',
        summary: 'Critical operational questions requiring direct input from hospital administrative and marketing leadership.',
        data: {
          note: 'These questions cannot be determined from public website analysis and require discovery discussion with hospital stakeholders.',
        },
      },
    ];

    const discoveryQuestions = [
      {
        question: 'How are website and social media patient enquiries currently captured and routed to the front-desk/OPD team?',
        category: 'Enquiry Workflow',
        rationale: 'Identifies response latency bottlenecks and enquiry drop-off before appointment confirmation.',
      },
      {
        question: 'Does the hospital utilize a dedicated healthcare CRM or HMS integration for digital lead tracking?',
        category: 'Technology & CRM',
        rationale: 'Establishes whether lead data is centralizing or getting lost across unmonitored email inboxes.',
      },
      {
        question: 'What is the current estimated conversion percentage from initial enquiry to confirmed OPD consultation?',
        category: 'Conversion Funnel',
        rationale: 'Reveals the revenue upside potential from implementing automated WhatsApp qualification and follow-up.',
      },
      {
        question: 'How are missed calls and after-hours patient enquiries handled and recovered?',
        category: 'Lead Recovery',
        rationale: 'Unlocks immediate appointment recovery from patients calling outside standard OPD hours.',
      },
      {
        question: 'Are appointment confirmation and attendance reminders automated via WhatsApp or SMS?',
        category: 'No-Show Reduction',
        rationale: 'Automated reminders reduce OPD no-show rates by 25-40% across private specialty practices.',
      },
      {
        question: 'How are post-discharge or post-consultation patient reviews and Google ratings collected?',
        category: 'Reputation Management',
        rationale: 'Systematic review generation strengthens local trust and search engine authority.',
      },
      {
        question: 'Which clinical super-specialties currently have underutilized OPD or OT capacity?',
        category: 'Growth Strategy',
        rationale: 'Ensures marketing and digital acquisition campaigns align with high-margin clinical departments.',
      },
    ];

    const priorityRoadmap = opportunities.map((o) => ({
      priority: o.severity,
      title: o.title,
      impact: o.impact,
      effort: o.effort,
      recommendation: o.recommendedAction,
      iamoninModule: o.iamoninModuleLabel,
    }));

    return {
      meta: {
        hospitalName,
        websiteUrl,
        location,
        auditDate,
        overallOpportunity: scores.overallOpportunity,
        overallScore: scores.overallOpportunityScore,
      },
      executiveSummary,
      sections,
      discoveryQuestions,
      priorityRoadmap,
    };
  }
}
