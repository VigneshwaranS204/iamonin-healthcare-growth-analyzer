import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  HEALTHCARE_SPECIALTIES,
  DOCTOR_TERMS,
  DOCTOR_QUALIFICATIONS,
  CTA_TERMS,
  EMERGENCY_TERMS,
} from '../src/config/dictionary.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for IAMONIN Healthcare Growth Analyzer...');

  // 1. Seed Users
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const salesPassword = await bcrypt.hash('Sales@123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@iamonin.com' },
    update: {},
    create: {
      email: 'admin@iamonin.com',
      passwordHash: adminPassword,
      name: 'IAMONIN Growth Admin',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'sales@iamonin.com' },
    update: {},
    create: {
      email: 'sales@iamonin.com',
      passwordHash: salesPassword,
      name: 'Healthcare Sales Executive',
      role: 'SALES',
    },
  });

  // 2. Seed Healthcare Dictionaries
  for (const spec of HEALTHCARE_SPECIALTIES) {
    await prisma.healthcareDictionary.upsert({
      where: {
        category_keyword: { category: 'SPECIALTY', keyword: spec.name.toLowerCase() },
      },
      update: {},
      create: {
        category: 'SPECIALTY',
        keyword: spec.name.toLowerCase(),
        weight: 3,
        metadataJson: JSON.stringify({ aliases: spec.aliases, category: spec.category }),
      },
    });
  }

  for (const qual of DOCTOR_QUALIFICATIONS) {
    await prisma.healthcareDictionary.upsert({
      where: {
        category_keyword: { category: 'DOCTOR_TERM', keyword: qual.toLowerCase() },
      },
      update: {},
      create: {
        category: 'DOCTOR_TERM',
        keyword: qual.toLowerCase(),
        weight: 2,
      },
    });
  }

  // 3. Seed Demo Hospital & Audit
  const demoHospital = await prisma.hospital.upsert({
    where: { id: 'demo-hospital-apex' },
    update: {},
    create: {
      id: 'demo-hospital-apex',
      name: 'Apex Super Specialty Hospital',
      websiteUrl: 'https://apexhospitaldemo.com',
      location: 'Bengaluru, Karnataka',
      googleMapsUrl: 'https://maps.google.com/?q=Apex+Hospital+Bengaluru',
      instagramUrl: 'https://instagram.com/apexhospital',
      facebookUrl: 'https://facebook.com/apexhospital',
      youtubeUrl: 'https://youtube.com/@apexhospital',
      linkedinUrl: 'https://linkedin.com/company/apex-hospital',
      contacts: {
        create: [
          {
            name: 'Dr. Ramesh Sharma',
            designation: 'Medical Director',
            email: 'dr.ramesh@apexhospitaldemo.com',
            phone: '+91 98450 12345',
          },
        ],
      },
    },
  });

  const demoAudit = await prisma.audit.upsert({
    where: { id: 'demo-audit-apex' },
    update: {},
    create: {
      id: 'demo-audit-apex',
      hospitalId: demoHospital.id,
      status: 'COMPLETED',
      pagesCrawled: 34,
      totalPagesDiscovered: 82,
      overallOpportunity: 'HIGH',
      technicalHealthScore: 78,
      seoReadinessScore: 62,
      healthcareContentScore: 68,
      doctorAuthorityScore: 54,
      patientJourneyScore: 48,
      conversionReadinessScore: 45,
      localPresenceScore: 70,
      contentOpportunityScore: 58,
      scoresJson: JSON.stringify({
        overallOpportunity: 'HIGH',
        overallOpportunityScore: 52,
        technicalHealth: { score: 78, grade: 'B', status: 'GOOD' },
        seoReadiness: { score: 62, grade: 'C', status: 'NEEDS_ATTENTION' },
        healthcareContent: { score: 68, grade: 'C', status: 'GOOD' },
        doctorAuthority: { score: 54, grade: 'D', status: 'NEEDS_ATTENTION' },
        patientJourney: { score: 48, grade: 'D', status: 'NEEDS_ATTENTION' },
        conversionReadiness: { score: 45, grade: 'D', status: 'NEEDS_ATTENTION' },
        localPresence: { score: 70, grade: 'B', status: 'GOOD' },
        contentOpportunity: { score: 58, grade: 'C', status: 'NEEDS_ATTENTION' },
      }),
      executiveSummary:
        "IAMONIN Healthcare Growth Analyzer completed a structured audit of Apex Super Specialty Hospital. The overall growth opportunity is HIGH (52/100 untapped upside). Key gaps identified include missing WhatsApp appointment triage, lack of Physician schema markup across 18 consultant pages, and absence of appointment CTAs on clinical specialty pages.",
    },
  });

  // Seed Opportunities for Demo
  const demoOpps = [
    {
      title: 'Instant WhatsApp Patient Consultation Desk',
      category: 'Appointment Conversion',
      severity: 'HIGH',
      impact: 'HIGH',
      effort: 'LOW',
      evidence: 'WhatsApp consultation desk links were not detected on any crawled page.',
      whyItMatters: 'Over 60% of modern private healthcare enquiries convert faster via direct WhatsApp interaction than static web forms.',
      recommendedAction: 'Implement a direct, automated WhatsApp patient triage desk button across high-intent specialty and doctor profile pages.',
      iamoninModule: 'APPOINTMENT_CONVERSION',
      isTop5: true,
    },
    {
      title: 'Doctor Profile Direct Booking CTAs',
      category: 'Doctor Authority',
      severity: 'HIGH',
      impact: 'HIGH',
      effort: 'LOW',
      evidence: '14 of 18 detected doctor profiles lack direct appointment booking buttons.',
      whyItMatters: 'Patients researching specific specialists drop off when forced to navigate away from the doctor profile.',
      recommendedAction: 'Add 1-click "Book with Dr. [Name]" sticky and in-page CTAs with real-time OPD slot request capability.',
      iamoninModule: 'DOCTOR_AUTHORITY',
      isTop5: true,
    },
    {
      title: 'Physician Schema & Dedicated Profile Architecture',
      category: 'Doctor Authority',
      severity: 'HIGH',
      impact: 'HIGH',
      effort: 'MEDIUM',
      evidence: '18 doctor profiles lack Schema.org Physician JSON-LD structured data.',
      whyItMatters: 'Physician schema enables individual doctors to appear directly in Google Rich Results and Medical Knowledge Panels.',
      recommendedAction: 'Deploy dedicated URL slugs for each consultant with complete biographical and Physician JSON-LD schema.',
      iamoninModule: 'DOCTOR_AUTHORITY',
      isTop5: true,
    },
    {
      title: 'Clinical Specialty Content Depth & Procedure Hubs',
      category: 'Healthcare Content',
      severity: 'HIGH',
      impact: 'HIGH',
      effort: 'MEDIUM',
      evidence: '9 specialty pages contain thin clinical content (<300 words), and Cardiology lacks procedural details.',
      whyItMatters: 'High-intent patients seeking complex surgical procedures research clinical outcomes, technology, and doctor experience.',
      recommendedAction: 'Create comprehensive 800+ word specialty pillars detailing treatment procedures and recovery FAQs.',
      iamoninModule: 'PATIENT_ACQUISITION',
      isTop5: true,
    },
    {
      title: 'Conversion Architecture & Sticky Patient CTAs',
      category: 'Website',
      severity: 'MEDIUM',
      impact: 'HIGH',
      effort: 'LOW',
      evidence: '12 of 34 analyzed pages have no detectable call-to-action (dead ends).',
      whyItMatters: 'Patients who reach clinical articles without clear next-steps bounce to competitor hospital sites.',
      recommendedAction: 'Introduce floating mobile action bars (Call OPD / WhatsApp Desk / Book Slot) across all pages.',
      iamoninModule: 'DIGITAL_FOUNDATION',
      isTop5: true,
    },
  ];

  for (const opp of demoOpps) {
    await prisma.opportunity.create({
      data: {
        auditId: demoAudit.id,
        ...opp,
      },
    });
  }

  // Seed Outreaches
  await prisma.outreach.create({
    data: {
      auditId: demoAudit.id,
      channel: 'EMAIL',
      subject: 'Digital growth observations for Apex Super Specialty Hospital in Bengaluru',
      content: `Hi Dr. Ramesh Sharma,

We recently completed a structured review of Apex Super Specialty Hospital's publicly accessible digital presence and patient conversion touchpoints in Bengaluru.

Our analysis identified several strong observable opportunities:
1. Instant WhatsApp Patient Consultation Desk: WhatsApp consultation desk links were not detected.
2. Doctor Profile Direct Booking CTAs: 14 of 18 doctor profiles lack direct booking buttons.
3. Physician Schema: 18 doctor profiles lack Schema.org Physician structured data.

We prepared a concise 12-section Healthcare Digital Growth Audit showing these observations and possible improvements.

Happy to share the full report if useful.

Warm regards,
IAMONIN Healthcare Growth Team`,
      keyFindingsUsedJson: JSON.stringify(['WhatsApp missing', '14 doctor profiles lack CTA', 'Physician schema missing']),
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
