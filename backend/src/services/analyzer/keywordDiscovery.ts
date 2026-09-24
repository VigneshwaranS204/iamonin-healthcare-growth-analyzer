import { HealthcareSpecialtyDef, HEALTHCARE_SPECIALTIES } from '../../config/dictionary.js';
import { DoctorProfileItem } from './doctorAnalyzer.js';

export interface PotentialKeywordTarget {
  keyword: string;
  intent: 'HIGH_INTENT' | 'SPECIALTY_DISCOVERY' | 'BRANDED' | 'DOCTOR_SEARCH';
  category: string;
  suggestedPageType: 'Specialty Page' | 'Doctor Profile' | 'Homepage' | 'Booking Page';
  rationale: string;
}

export interface KeywordDiscoveryResult {
  keywords: PotentialKeywordTarget[];
  totalGenerated: number;
  disclaimer: string;
}

export class KeywordDiscovery {
  /**
   * Generates deterministic high-value potential target keywords without external SEO APIs.
   */
  generateTargets(
    hospitalName: string,
    location: string,
    detectedSpecialties: string[],
    doctors: DoctorProfileItem[]
  ): KeywordDiscoveryResult {
    const targets: PotentialKeywordTarget[] = [];
    const loc = location || 'nearby';
    const cleanName = hospitalName.trim();

    // 1. Branded Target Keywords
    targets.push(
      {
        keyword: `${cleanName} ${loc}`.trim(),
        intent: 'BRANDED',
        category: 'Brand Search',
        suggestedPageType: 'Homepage',
        rationale: 'Primary branded navigational query for prospective patients searching for this specific facility.',
      },
      {
        keyword: `${cleanName} appointment booking`,
        intent: 'HIGH_INTENT',
        category: 'Brand Conversion',
        suggestedPageType: 'Booking Page',
        rationale: 'High-intent query from returning or referred patients seeking appointment slots.',
      },
      {
        keyword: `${cleanName} doctors list`,
        intent: 'BRANDED',
        category: 'Doctor Roster',
        suggestedPageType: 'Doctor Profile',
        rationale: 'Queries seeking consultant schedules and OPD timings.',
      }
    );

    // 2. Specialty & Clinical Intent Keywords
    for (const specName of detectedSpecialties) {
      const specDef = HEALTHCARE_SPECIALTIES.find((s) => s.name === specName);
      const rootTerm = specDef?.aliases[0] || specName.toLowerCase().split(' ')[0];

      targets.push(
        {
          keyword: `best ${rootTerm} hospital in ${loc}`.toLowerCase(),
          intent: 'HIGH_INTENT',
          category: specName,
          suggestedPageType: 'Specialty Page',
          rationale: `High-intent patient discovery term for clinical interventions in ${specName}.`,
        },
        {
          keyword: `${rootTerm} doctor in ${loc}`.toLowerCase(),
          intent: 'HIGH_INTENT',
          category: specName,
          suggestedPageType: 'Doctor Profile',
          rationale: `Direct specialist search query for OPD consultations.`,
        },
        {
          keyword: `${rootTerm} treatment and surgery ${loc}`.toLowerCase(),
          intent: 'SPECIALTY_DISCOVERY',
          category: specName,
          suggestedPageType: 'Specialty Page',
          rationale: `Procedural discovery keyword for patients researching elective or emergency clinical treatment.`,
        }
      );
    }

    // 3. Doctor-specific queries
    for (const doc of doctors.slice(0, 8)) {
      if (doc.name) {
        targets.push({
          keyword: `${doc.name} ${loc}`,
          intent: 'DOCTOR_SEARCH',
          category: doc.specialty || 'Consultant Search',
          suggestedPageType: 'Doctor Profile',
          rationale: 'Direct doctor reputation and OPD timings search by referred patients.',
        });
      }
    }

    // 4. Emergency queries
    targets.push(
      {
        keyword: `24 hours hospital emergency in ${loc}`.toLowerCase(),
        intent: 'HIGH_INTENT',
        category: 'Emergency & Critical Care',
        suggestedPageType: 'Booking Page',
        rationale: 'Urgent immediate-care discovery search by patients in critical condition.',
      },
      {
        keyword: `ambulance number ${loc}`.toLowerCase(),
        intent: 'HIGH_INTENT',
        category: 'Emergency & Critical Care',
        suggestedPageType: 'Homepage',
        rationale: 'Immediate casualty hotline query.',
      }
    );

    return {
      keywords: targets,
      totalGenerated: targets.length,
      disclaimer:
        'These are potential target keywords generated algorithmically based on detected specialties and location. They do not represent existing Google rankings or search volume.',
    };
  }
}
