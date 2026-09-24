import { CrawlEngineResult } from '../crawler/crawlerEngine.js';

export interface JourneyStageStatus {
  stage: 'DISCOVER' | 'TRUST' | 'SPECIALTY' | 'DOCTOR' | 'ENQUIRY' | 'APPOINTMENT';
  title: string;
  isAccessible: boolean;
  score: number; // 0-100
  evidence: string;
  frictionPoints: string[];
}

export interface CtaDensitySummary {
  totalPages: number;
  callCtaPages: number;
  whatsAppCtaPages: number;
  appointmentCtaPages: number;
  formCtaPages: number;
  noCtaPages: number;
}

export interface PatientJourneyAnalysisResult {
  stages: JourneyStageStatus[];
  ctaDensity: CtaDensitySummary;
  conversionReadinessScore: number;
  observations: string[];
  disclaimer: string;
}

export class PatientJourneyAnalyzer {
  /**
   * Analyzes the 6-stage patient discovery-to-appointment conversion journey.
   */
  analyze(crawlData: CrawlEngineResult): PatientJourneyAnalysisResult {
    const pages = crawlData.pages;
    const totalPages = pages.length;

    let callCount = 0;
    let waCount = 0;
    let apptCount = 0;
    let formCount = 0;
    let noCtaCount = 0;

    for (const p of pages) {
      let hasAnyCta = false;
      const types = new Set(p.ctas.map((c) => c.type));

      if (types.has('CALL') || p.phoneNumbers.length > 0) {
        callCount++;
        hasAnyCta = true;
      }
      if (types.has('WHATSAPP') || p.whatsAppLinks.length > 0) {
        waCount++;
        hasAnyCta = true;
      }
      if (types.has('BOOK_APPOINTMENT') || p.hasAppointmentCta) {
        apptCount++;
        hasAnyCta = true;
      }
      if (types.has('CONTACT_FORM') || p.formsCount > 0) {
        formCount++;
        hasAnyCta = true;
      }
      if (!hasAnyCta) {
        noCtaCount++;
      }
    }

    const ctaDensity: CtaDensitySummary = {
      totalPages,
      callCtaPages: callCount,
      whatsAppCtaPages: waCount,
      appointmentCtaPages: apptCount,
      formCtaPages: formCount,
      noCtaPages: noCtaCount,
    };

    // Stage 1: DISCOVER (Homepage clarity, viewport, title, fast landing)
    const rootPage = pages.find((p) => p.depth === 0) || pages[0];
    const discoverFriction: string[] = [];
    let discoverScore = 80;
    if (!rootPage?.hasViewportMeta) {
      discoverScore -= 20;
      discoverFriction.push('Missing mobile viewport configuration on main landing page');
    }
    if (!rootPage?.title || rootPage.title.length < 20) {
      discoverScore -= 15;
      discoverFriction.push('Weak or missing homepage title tag');
    }

    // Stage 2: TRUST (Accreditations, testimonials, doctor qualifications, address)
    const trustFriction: string[] = [];
    let trustScore = 70;
    const hasTestimonials = pages.some((p) => p.hasTestimonials);
    const hasSchema = pages.some((p) => p.schemaTypes.length > 0);
    if (!hasTestimonials) {
      trustScore -= 20;
      trustFriction.push('No patient stories, recovery testimonials, or reviews detected');
    }
    if (!hasSchema) {
      trustScore -= 15;
      trustFriction.push('Missing structured hospital schema to authenticate medical entity');
    }

    // Stage 3: SPECIALTY (Depth of clinical departments, procedural details)
    const specialtyFriction: string[] = [];
    const specialtyPages = pages.filter((p) => p.isSpecialtyPage || p.detectedSpecialties.length > 0);
    let specialtyScore = Math.min(100, Math.round((specialtyPages.length / Math.max(totalPages * 0.3, 1)) * 100));
    if (specialtyPages.length < 5) {
      specialtyFriction.push('Limited specialty landing pages discovered');
    }

    // Stage 4: DOCTOR (Individual profiles, credentials, doctor CTAs)
    const doctorFriction: string[] = [];
    const doctorPages = pages.filter((p) => p.isDoctorPage);
    let doctorScore = doctorPages.length > 0 ? 75 : 30;
    const doctorMissingCta = doctorPages.filter((p) => !p.hasAppointmentCta);
    if (doctorMissingCta.length > 0) {
      doctorScore -= 20;
      doctorFriction.push(`${doctorMissingCta.length} doctor page(s) lack a direct booking CTA button`);
    }

    // Stage 5: ENQUIRY (Phone numbers, forms, WhatsApp)
    const enquiryFriction: string[] = [];
    let enquiryScore = 60;
    if (callCount > 0) enquiryScore += 15;
    if (waCount > 0) enquiryScore += 15;
    if (formCount > 0) enquiryScore += 10;
    if (waCount === 0) {
      enquiryFriction.push('No instant WhatsApp enquiry channel detected for fast patient routing');
    }

    // Stage 6: APPOINTMENT (Direct booking buttons across specialty & doctor pages)
    const appointmentFriction: string[] = [];
    const apptRatio = totalPages > 0 ? apptCount / totalPages : 0;
    let appointmentScore = Math.round(apptRatio * 100);
    if (apptRatio < 0.3) {
      appointmentFriction.push(`Appointment booking CTA detected on only ${apptCount} of ${totalPages} pages`);
    }

    const stages: JourneyStageStatus[] = [
      {
        stage: 'DISCOVER',
        title: 'Patient Discovery & Mobile First Impression',
        isAccessible: discoverScore >= 50,
        score: Math.max(0, Math.min(100, discoverScore)),
        evidence: `Analyzed homepage accessibility and mobile viewport tags.`,
        frictionPoints: discoverFriction,
      },
      {
        stage: 'TRUST',
        title: 'Clinical Trust & Patient Social Proof',
        isAccessible: trustScore >= 50,
        score: Math.max(0, Math.min(100, trustScore)),
        evidence: hasTestimonials ? 'Patient feedback/testimonials detected.' : 'Patient testimonials not detected.',
        frictionPoints: trustFriction,
      },
      {
        stage: 'SPECIALTY',
        title: 'Specialty Department Navigation & Procedures',
        isAccessible: specialtyScore >= 50,
        score: Math.max(0, Math.min(100, specialtyScore)),
        evidence: `Discovered ${specialtyPages.length} clinical department & specialty URL(s).`,
        frictionPoints: specialtyFriction,
      },
      {
        stage: 'DOCTOR',
        title: 'Doctor Authority & Specialist Credentials',
        isAccessible: doctorScore >= 50,
        score: Math.max(0, Math.min(100, doctorScore)),
        evidence: `Found ${doctorPages.length} doctor profile page(s).`,
        frictionPoints: doctorFriction,
      },
      {
        stage: 'ENQUIRY',
        title: 'Direct Enquiry Accessibility (Phone / WhatsApp)',
        isAccessible: enquiryScore >= 50,
        score: Math.max(0, Math.min(100, enquiryScore)),
        evidence: `Call options on ${callCount} pages, WhatsApp on ${waCount} pages, contact forms on ${formCount} pages.`,
        frictionPoints: enquiryFriction,
      },
      {
        stage: 'APPOINTMENT',
        title: 'Frictionless Appointment Actionability',
        isAccessible: appointmentScore >= 40,
        score: Math.max(0, Math.min(100, appointmentScore)),
        evidence: `Direct appointment booking CTA present on ${apptCount} of ${totalPages} page(s).`,
        frictionPoints: appointmentFriction,
      },
    ];

    const conversionReadinessScore = Math.round(
      stages.reduce((acc, s) => acc + s.score, 0) / stages.length
    );

    const observations: string[] = [];
    if (noCtaCount > totalPages * 0.4) {
      observations.push(
        `${noCtaCount} of ${totalPages} pages contain no detectable calls-to-action (dead ends for prospective patients).`
      );
    }
    if (waCount === 0) {
      observations.push('WhatsApp patient assistance is completely absent from the public website.');
    }
    if (apptCount < totalPages * 0.3) {
      observations.push(
        `Appointment booking CTAs are limited to only ${Math.round(apptRatio * 100)}% of analyzed pages.`
      );
    }

    return {
      stages,
      ctaDensity,
      conversionReadinessScore,
      observations,
      disclaimer:
        'The Patient Conversion Readiness score is an observable measure of website navigation and call-to-action visibility. It does not represent internal hospital conversion rates or offline patient footfall.',
    };
  }
}
