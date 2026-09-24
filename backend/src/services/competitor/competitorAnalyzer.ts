import { CrawlerEngine } from '../crawler/crawlerEngine.js';
import { TechnicalSeoAnalyzer } from '../analyzer/technicalSeoAnalyzer.js';
import { HealthcareAnalyzer } from '../analyzer/healthcareAnalyzer.js';
import { DoctorAnalyzer } from '../analyzer/doctorAnalyzer.js';
import { PatientJourneyAnalyzer } from '../analyzer/patientJourneyAnalyzer.js';
import { LocalSeoAnalyzer } from '../analyzer/localSeoAnalyzer.js';
import { ScoringEngine, ComprehensiveScoresResult } from '../scoring/scoringEngine.js';

export interface CompetitorComparisonData {
  name: string;
  websiteUrl: string;
  scores: ComprehensiveScoresResult;
  metrics: {
    totalPagesCrawled: number;
    specialtiesCount: number;
    doctorsCount: number;
    hasWhatsApp: boolean;
    hasAppointmentBooking: boolean;
    hasSchema: boolean;
    hasEmergency: boolean;
  };
  observableGaps: string[];
}

export class CompetitorAnalyzer {
  private crawler = new CrawlerEngine();
  private techAnalyzer = new TechnicalSeoAnalyzer();
  private hcAnalyzer = new HealthcareAnalyzer();
  private docAnalyzer = new DoctorAnalyzer();
  private journeyAnalyzer = new PatientJourneyAnalyzer();
  private localAnalyzer = new LocalSeoAnalyzer();
  private scoringEngine = new ScoringEngine();

  /**
   * Crawls and computes side-by-side gap metrics for a competitor hospital website.
   */
  async analyzeCompetitor(
    name: string,
    websiteUrl: string,
    primaryHospitalData?: {
      specialtiesCount: number;
      doctorsCount: number;
      hasWhatsApp: boolean;
      hasAppointmentBooking: boolean;
    }
  ): Promise<CompetitorComparisonData> {
    const crawlData = await this.crawler.crawlWebsite(websiteUrl, {
      maxPages: 25,
      maxDepth: 3,
      requestDelayMs: 150,
    });

    const technicalFindings = this.techAnalyzer.analyze(crawlData);
    const hcData = this.hcAnalyzer.analyze(crawlData);
    const docData = this.docAnalyzer.analyze(crawlData);
    const journeyData = this.journeyAnalyzer.analyze(crawlData);
    const localData = this.localAnalyzer.analyze(crawlData);

    const scores = this.scoringEngine.calculateScores(
      crawlData,
      technicalFindings,
      hcData,
      docData,
      journeyData,
      localData
    );

    const observableGaps: string[] = [];

    if (hcData.hasWhatsAppDesk && primaryHospitalData && !primaryHospitalData.hasWhatsApp) {
      observableGaps.push(`Competitor provides active WhatsApp patient desk, while your hospital does not.`);
    }

    if (docData.totalDoctorsDetected > (primaryHospitalData?.doctorsCount || 0)) {
      observableGaps.push(
        `Competitor has ${docData.totalDoctorsDetected} public doctor profiles listed compared to ${primaryHospitalData?.doctorsCount || 0}.`
      );
    }

    if (hcData.detectedSpecialties.length > (primaryHospitalData?.specialtiesCount || 0)) {
      observableGaps.push(
        `Competitor details ${hcData.detectedSpecialties.length} specialty landing pages.`
      );
    }

    if (hcData.hasAppointmentBooking && primaryHospitalData && !primaryHospitalData.hasAppointmentBooking) {
      observableGaps.push(`Competitor features direct appointment booking CTAs across multiple pages.`);
    }

    if (observableGaps.length === 0) {
      observableGaps.push('Your hospital matches or exceeds competitor on public observable website signals.');
    }

    return {
      name,
      websiteUrl,
      scores,
      metrics: {
        totalPagesCrawled: crawlData.pages.length,
        specialtiesCount: hcData.detectedSpecialties.length,
        doctorsCount: docData.totalDoctorsDetected,
        hasWhatsApp: hcData.hasWhatsAppDesk,
        hasAppointmentBooking: hcData.hasAppointmentBooking,
        hasSchema: crawlData.pages.some((p) => p.schemaTypes.length > 0),
        hasEmergency: hcData.hasEmergencyInfo,
      },
      observableGaps,
    };
  }
}
