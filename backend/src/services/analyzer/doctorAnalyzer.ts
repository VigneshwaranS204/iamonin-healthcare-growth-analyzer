import { CrawlEngineResult } from '../crawler/crawlerEngine.js';
import { PageCrawlResult } from '../crawler/pageCrawler.js';
import { DOCTOR_QUALIFICATIONS, HEALTHCARE_SPECIALTIES } from '../../config/dictionary.js';

export interface DoctorProfileItem {
  name: string;
  specialty?: string;
  qualifications?: string;
  experienceYears?: number;
  profileUrl: string;
  photoUrl?: string;
  hasAppointmentCta: boolean;
  hasDedicatedPage: boolean;
  contentWordCount: number;
  hasSchema: boolean;
}

export interface DoctorAuthorityAnalysisResult {
  totalDoctorsDetected: number;
  dedicatedProfilesCount: number;
  weakContentProfilesCount: number;
  missingCtaProfilesCount: number;
  missingSchemaProfilesCount: number;
  doctors: DoctorProfileItem[];
  observations: string[];
}

export class DoctorAnalyzer {
  /**
   * Analyzes doctor digital authority, profile completeness, and conversion hooks.
   */
  analyze(crawlData: CrawlEngineResult): DoctorAuthorityAnalysisResult {
    const pages = crawlData.pages;
    const detectedDoctorsMap = new Map<string, DoctorProfileItem>();

    // 1. Scan pages with Physician schema or schema.org JSON-LD
    for (const page of pages) {
      for (const jsonLd of page.rawJsonLd) {
        this.extractDoctorsFromJsonLd(jsonLd, page, detectedDoctorsMap);
      }
    }

    // 2. Scan dedicated doctor profile pages and directory pages
    for (const page of pages) {
      const lowerUrl = page.url.toLowerCase();
      const isDoctorUrl =
        lowerUrl.includes('/doctor') ||
        lowerUrl.includes('/specialist') ||
        lowerUrl.includes('/physician') ||
        lowerUrl.includes('/dr-') ||
        lowerUrl.includes('/team/');

      if (isDoctorUrl && page.h1List.length > 0) {
        for (const h1 of page.h1List) {
          const docName = this.extractDoctorNameFromText(h1) || (h1.toLowerCase().includes('dr') ? h1 : null);
          if (docName && !detectedDoctorsMap.has(docName.toLowerCase())) {
            const qualifications = this.extractQualifications(page.bodyTextSnippet);
            const specialty = this.extractSpecialty(page.title, page.h1List.join(' '), page.detectedSpecialties);
            const experienceYears = this.extractExperience(page.bodyTextSnippet);
            const hasPhoto = page.images.some((img) => img.src.toLowerCase().includes('doc') || img.src.toLowerCase().includes('profile') || img.alt.toLowerCase().includes('dr'));

            detectedDoctorsMap.set(docName.toLowerCase(), {
              name: docName,
              specialty,
              qualifications,
              experienceYears,
              profileUrl: page.url,
              photoUrl: hasPhoto ? page.images[0]?.src : undefined,
              hasAppointmentCta: page.hasAppointmentCta || page.ctas.some((c) => c.type === 'BOOK_APPOINTMENT' || c.type === 'CALL'),
              hasDedicatedPage: true,
              contentWordCount: page.wordCount,
              hasSchema: page.schemaTypes.some((t) => t.toLowerCase().includes('physician') || t.toLowerCase().includes('person')),
            });
          }
        }
      }

      // Also parse listing pages where multiple doctors are listed in cards
      if (isDoctorUrl && detectedDoctorsMap.size < 50) {
        const textSnippets = page.bodyTextSnippet.split(/\n+/);
        for (const snippet of textSnippets) {
          const docName = this.extractDoctorNameFromText(snippet);
          if (docName && docName.length > 5 && !detectedDoctorsMap.has(docName.toLowerCase())) {
            detectedDoctorsMap.set(docName.toLowerCase(), {
              name: docName,
              specialty: this.extractSpecialty(snippet, '', page.detectedSpecialties),
              qualifications: this.extractQualifications(snippet),
              profileUrl: page.url,
              hasAppointmentCta: page.hasAppointmentCta,
              hasDedicatedPage: false,
              contentWordCount: page.wordCount,
              hasSchema: false,
            });
          }
        }
      }
    }

    const doctorsList = Array.from(detectedDoctorsMap.values());
    const totalDoctorsDetected = doctorsList.length;
    const dedicatedProfilesCount = doctorsList.filter((d) => d.hasDedicatedPage).length;
    const weakContentProfilesCount = doctorsList.filter((d) => d.contentWordCount < 150).length;
    const missingCtaProfilesCount = doctorsList.filter((d) => !d.hasAppointmentCta).length;
    const missingSchemaProfilesCount = doctorsList.filter((d) => !d.hasSchema).length;

    const observations: string[] = [];

    if (totalDoctorsDetected > 0) {
      observations.push(`Detected ${totalDoctorsDetected} doctor/consultant profile(s) across the website.`);

      if (dedicatedProfilesCount < totalDoctorsDetected) {
        observations.push(
          `${totalDoctorsDetected - dedicatedProfilesCount} doctor(s) are listed on shared roster pages without dedicated individual profile URLs.`
        );
      }

      if (missingCtaProfilesCount > 0) {
        observations.push(
          `${missingCtaProfilesCount} doctor profile(s) lack a direct appointment booking or consultation call-to-action.`
        );
      }

      if (missingSchemaProfilesCount > 0) {
        observations.push(
          `${missingSchemaProfilesCount} doctor profile(s) lack Schema.org Physician structured data for Google search visibility.`
        );
      }

      if (weakContentProfilesCount > 0) {
        observations.push(
          `${weakContentProfilesCount} profile(s) contain thin biographical details (<150 words), missing key procedural expertise.`
        );
      }
    } else {
      observations.push('No structured doctor profile pages or physician directories detected in public website navigation.');
    }

    return {
      totalDoctorsDetected,
      dedicatedProfilesCount,
      weakContentProfilesCount,
      missingCtaProfilesCount,
      missingSchemaProfilesCount,
      doctors: doctorsList,
      observations,
    };
  }

  private extractDoctorsFromJsonLd(
    node: any,
    page: PageCrawlResult,
    map: Map<string, DoctorProfileItem>
  ): void {
    if (!node) return;

    if (Array.isArray(node)) {
      node.forEach((n) => this.extractDoctorsFromJsonLd(n, page, map));
      return;
    }

    const type = typeof node['@type'] === 'string' ? node['@type'].toLowerCase() : '';
    if (type.includes('physician') || (type.includes('person') && node.jobTitle)) {
      const name = node.name || node.givenName;
      if (name && typeof name === 'string' && !map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), {
          name: name.startsWith('Dr') ? name : `Dr. ${name}`,
          specialty: typeof node.medicalSpecialty === 'string' ? node.medicalSpecialty : typeof node.jobTitle === 'string' ? node.jobTitle : undefined,
          qualifications: typeof node.honorificSuffix === 'string' ? node.honorificSuffix : undefined,
          profileUrl: page.url,
          photoUrl: typeof node.image === 'string' ? node.image : node.image?.url,
          hasAppointmentCta: page.hasAppointmentCta,
          hasDedicatedPage: true,
          contentWordCount: page.wordCount,
          hasSchema: true,
        });
      }
    }

    if (node['@graph'] && Array.isArray(node['@graph'])) {
      node['@graph'].forEach((n: any) => this.extractDoctorsFromJsonLd(n, page, map));
    }
  }

  private extractDoctorNameFromText(text: string): string | null {
    if (!text) return null;
    const match = text.match(/\b(Dr\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/);
    return match ? match[1].trim() : null;
  }

  private extractQualifications(text: string): string | undefined {
    if (!text) return undefined;
    const matched: string[] = [];
    for (const qual of DOCTOR_QUALIFICATIONS) {
      const regex = new RegExp(`\\b${qual}\\b`, 'i');
      if (regex.test(text)) {
        matched.push(qual);
      }
    }
    return matched.length > 0 ? Array.from(new Set(matched)).join(', ') : undefined;
  }

  private extractSpecialty(title: string, h1: string, detectedSpecialties: string[]): string | undefined {
    if (detectedSpecialties.length > 0) {
      return detectedSpecialties[0];
    }
    const combined = `${title} ${h1}`.toLowerCase();
    for (const spec of HEALTHCARE_SPECIALTIES) {
      if (spec.aliases.some((a) => combined.includes(a))) {
        return spec.name;
      }
    }
    return undefined;
  }

  private extractExperience(text: string): number | undefined {
    if (!text) return undefined;
    const match = text.match(/(\d{1,2})\+?\s*(?:years|yrs)\s*(?:of\s*)?experience/i);
    if (match) {
      const yrs = parseInt(match[1], 10);
      if (!isNaN(yrs) && yrs > 0 && yrs < 60) return yrs;
    }
    return undefined;
  }
}
