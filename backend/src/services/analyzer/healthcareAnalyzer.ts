import { CrawlEngineResult } from '../crawler/crawlerEngine.js';
import { HEALTHCARE_SPECIALTIES } from '../../config/dictionary.js';

export interface HealthcareFindingItem {
  category: string;
  title: string;
  status: 'DETECTED' | 'PARTIAL' | 'NOT_DETECTED' | 'DISCOVERY_REQUIRED';
  evidence: string;
  details?: Record<string, any>;
}

export interface HealthcareAnalysisResult {
  detectedSpecialties: Array<{ name: string; category: string; pagesCount: number }>;
  missingCoreSpecialties: string[];
  hasEmergencyInfo: boolean;
  emergencyEvidence: string;
  hasAppointmentBooking: boolean;
  appointmentEvidence: string;
  hasWhatsAppDesk: boolean;
  whatsAppEvidence: string;
  hasHealthPackages: boolean;
  packagesEvidence: string;
  hasInsuranceDesk: boolean;
  insuranceEvidence: string;
  hasTestimonials: boolean;
  testimonialsEvidence: string;
  hasInternationalPatientInfo: boolean;
  internationalEvidence: string;
  hasPatientEducation: boolean;
  educationEvidence: string;
  findings: HealthcareFindingItem[];
}

export class HealthcareAnalyzer {
  /**
   * Analyzes healthcare-specific operational and clinical presence across all crawled pages.
   */
  analyze(crawlData: CrawlEngineResult): HealthcareAnalysisResult {
    const pages = crawlData.pages;
    const findings: HealthcareFindingItem[] = [];

    // 1. Specialty Matrix
    const specialtyPageCountMap = new Map<string, number>();
    for (const page of pages) {
      for (const spec of page.detectedSpecialties) {
        specialtyPageCountMap.set(spec, (specialtyPageCountMap.get(spec) || 0) + 1);
      }
    }

    const detectedSpecialtiesList: Array<{ name: string; category: string; pagesCount: number }> = [];
    for (const specDef of HEALTHCARE_SPECIALTIES) {
      const count = specialtyPageCountMap.get(specDef.name) || 0;
      if (count > 0) {
        detectedSpecialtiesList.push({
          name: specDef.name,
          category: specDef.category,
          pagesCount: count,
        });
      }
    }

    const coreExpectedSpecialties = [
      'Cardiology & Cardiac Surgery',
      'Orthopaedics & Joint Replacement',
      'Neurology & Neurosurgery',
      'Oncology & Cancer Care',
      'Gastroenterology & Hepatology',
      'Nephrology & Urology',
      'Obstetrics & Gynaecology (OB-GYN)',
      'Paediatrics & Neonatology',
    ];

    const missingCoreSpecialties = coreExpectedSpecialties.filter(
      (core) => !specialtyPageCountMap.has(core)
    );

    findings.push({
      category: 'Specialties',
      title: 'Clinical Department & Specialty Depth',
      status: detectedSpecialtiesList.length >= 6 ? 'DETECTED' : detectedSpecialtiesList.length > 0 ? 'PARTIAL' : 'NOT_DETECTED',
      evidence: `Identified ${detectedSpecialtiesList.length} distinct clinical specialty/department areas across ${pages.length} crawled pages.`,
      details: {
        detectedCount: detectedSpecialtiesList.length,
        specialties: detectedSpecialtiesList,
        missingCoreSpecialties,
      },
    });

    // 2. Emergency 24/7 & Casualty
    const emergencyPages = pages.filter((p) => p.isEmergencyPage);
    const hasEmergencyInfo = emergencyPages.length > 0;
    const emergencyEvidence = hasEmergencyInfo
      ? `24/7 Emergency & Casualty information detected on ${emergencyPages.length} page(s).`
      : 'No dedicated 24/7 emergency or ambulance care pages detected in public navigation.';

    findings.push({
      category: 'Emergency',
      title: '24/7 Emergency & Critical Care Accessibility',
      status: hasEmergencyInfo ? 'DETECTED' : 'NOT_DETECTED',
      evidence: emergencyEvidence,
      details: { emergencyPages: emergencyPages.map((p) => p.url) },
    });

    // 3. Online Appointment & Consultation Booking
    const appointmentPages = pages.filter((p) => p.hasAppointmentCta);
    const hasAppointmentBooking = appointmentPages.length > 0;
    const appointmentEvidence = hasAppointmentBooking
      ? `Appointment booking calls-to-action detected across ${appointmentPages.length} of ${pages.length} page(s).`
      : 'Direct appointment booking CTAs were not detected across analyzed pages.';

    findings.push({
      category: 'Conversion',
      title: 'Digital Appointment Booking Infrastructure',
      status: appointmentPages.length >= pages.length * 0.4 ? 'DETECTED' : appointmentPages.length > 0 ? 'PARTIAL' : 'NOT_DETECTED',
      evidence: appointmentEvidence,
      details: { appointmentPagesCount: appointmentPages.length },
    });

    // 4. WhatsApp Patient Desk
    const whatsAppPages = pages.filter((p) => p.whatsAppLinks.length > 0);
    const hasWhatsAppDesk = whatsAppPages.length > 0;
    const whatsAppEvidence = hasWhatsAppDesk
      ? `Direct WhatsApp patient engagement links detected on ${whatsAppPages.length} page(s).`
      : 'WhatsApp patient enquiry or consultation desk link not detected.';

    findings.push({
      category: 'Conversion',
      title: 'WhatsApp Instant Patient Assistance',
      status: hasWhatsAppDesk ? 'DETECTED' : 'NOT_DETECTED',
      evidence: whatsAppEvidence,
      details: {
        whatsAppPagesCount: whatsAppPages.length,
        linksSample: Array.from(new Set(pages.flatMap((p) => p.whatsAppLinks))).slice(0, 3),
      },
    });

    // 5. Preventive Health Packages
    const packagePages = pages.filter((p) => p.hasHealthPackages);
    const hasHealthPackages = packagePages.length > 0;
    const packagesEvidence = hasHealthPackages
      ? `Preventive health packages/master checkup offerings detected on ${packagePages.length} page(s).`
      : 'Dedicated preventive health checkup packages not detected.';

    findings.push({
      category: 'Packages',
      title: 'Preventive Health & Checkup Packages',
      status: hasHealthPackages ? 'DETECTED' : 'NOT_DETECTED',
      evidence: packagesEvidence,
      details: { packagePages: packagePages.map((p) => p.url) },
    });

    // 6. Insurance & Cashless TPA Desk
    const insurancePages = pages.filter((p) => p.hasInsuranceInfo);
    const hasInsuranceDesk = insurancePages.length > 0;
    const insuranceEvidence = hasInsuranceDesk
      ? `Health insurance, TPA empanelment, or cashless claim info detected on ${insurancePages.length} page(s).`
      : 'Cashless insurance / TPA desk guidelines not clearly highlighted on analyzed pages.';

    findings.push({
      category: 'Insurance',
      title: 'Cashless Insurance & TPA Empanelment',
      status: hasInsuranceDesk ? 'DETECTED' : 'NOT_DETECTED',
      evidence: insuranceEvidence,
      details: { insurancePagesCount: insurancePages.length },
    });

    // 7. Patient Testimonials & Case Studies
    const testimonialPages = pages.filter((p) => p.hasTestimonials);
    const hasTestimonials = testimonialPages.length > 0;
    const testimonialsEvidence = hasTestimonials
      ? `Patient reviews, recovery stories, or testimonials detected on ${testimonialPages.length} page(s).`
      : 'Patient recovery testimonials or outcome stories not prominently detected.';

    findings.push({
      category: 'Trust',
      title: 'Patient Outcome Stories & Testimonials',
      status: hasTestimonials ? 'DETECTED' : 'NOT_DETECTED',
      evidence: testimonialsEvidence,
    });

    // 8. International Patient Desk
    const intlPages = pages.filter(
      (p) =>
        p.url.toLowerCase().includes('/international') ||
        p.bodyTextSnippet.toLowerCase().includes('international patient') ||
        p.bodyTextSnippet.toLowerCase().includes('medical tourism')
    );
    const hasInternationalPatientInfo = intlPages.length > 0;
    const internationalEvidence = hasInternationalPatientInfo
      ? `International patient desk / medical visa guidance detected on ${intlPages.length} page(s).`
      : 'International patient support desk information not detected.';

    findings.push({
      category: 'International',
      title: 'International Patient Care Desk',
      status: hasInternationalPatientInfo ? 'DETECTED' : 'NOT_DETECTED',
      evidence: internationalEvidence,
    });

    // 9. Patient Education / Blog
    const blogPages = pages.filter(
      (p) =>
        p.url.includes('/blog') ||
        p.url.includes('/news') ||
        p.url.includes('/articles') ||
        p.url.includes('/health-tips')
    );
    const hasPatientEducation = blogPages.length > 0;
    const educationEvidence = hasPatientEducation
      ? `Patient health education library/blog detected with ${blogPages.length} analyzed post(s).`
      : 'Public patient health blog or clinical education library not detected.';

    findings.push({
      category: 'Education',
      title: 'Patient Health Education & Clinical Blog',
      status: hasPatientEducation ? 'DETECTED' : 'NOT_DETECTED',
      evidence: educationEvidence,
      details: { blogPagesCount: blogPages.length },
    });

    // 10. AI Follow-up & CRM Funnel Tracking (Discovery Required)
    findings.push({
      category: 'Automation',
      title: 'Automated Patient Enquiry Follow-up & Reactivation',
      status: 'DISCOVERY_REQUIRED',
      evidence: 'Patient enquiry handling, CRM workflows, missed call recovery, and follow-up reminders operate inside hospital systems and cannot be observed from the public website.',
    });

    findings.push({
      category: 'Intelligence',
      title: 'End-to-End Patient Funnel Analytics',
      status: 'DISCOVERY_REQUIRED',
      evidence: 'Lead-to-appointment conversion rates, OPD footfall tracking, and acquisition ROI require discovery discussion with hospital leadership.',
    });

    return {
      detectedSpecialties: detectedSpecialtiesList,
      missingCoreSpecialties,
      hasEmergencyInfo,
      emergencyEvidence,
      hasAppointmentBooking,
      appointmentEvidence,
      hasWhatsAppDesk,
      whatsAppEvidence,
      hasHealthPackages,
      packagesEvidence,
      hasInsuranceDesk,
      insuranceEvidence,
      hasTestimonials,
      testimonialsEvidence,
      hasInternationalPatientInfo,
      internationalEvidence,
      hasPatientEducation,
      educationEvidence,
      findings,
    };
  }
}
