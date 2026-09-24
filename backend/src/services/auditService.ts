import { PrismaClient } from '@prisma/client';
import path from 'path';
import { CrawlerEngine, CrawlProgressEvent } from './crawler/crawlerEngine.js';
import { TechnicalSeoAnalyzer } from './analyzer/technicalSeoAnalyzer.js';
import { HealthcareAnalyzer } from './analyzer/healthcareAnalyzer.js';
import { DoctorAnalyzer } from './analyzer/doctorAnalyzer.js';
import { PatientJourneyAnalyzer } from './analyzer/patientJourneyAnalyzer.js';
import { LocalSeoAnalyzer } from './analyzer/localSeoAnalyzer.js';
import { SocialAnalyzer } from './analyzer/socialAnalyzer.js';
import { KeywordDiscovery } from './analyzer/keywordDiscovery.js';
import { ScoringEngine } from './scoring/scoringEngine.js';
import { OpportunityEngine } from './opportunity/opportunityEngine.js';
import { OutreachGenerator } from './outreach/outreachGenerator.js';
import { ReportGenerator } from './report/reportGenerator.js';
import { PdfService } from './report/pdfService.js';
import { logger } from '../utils/logger.js';

export const prisma = new PrismaClient();

export class AuditService {
  private crawler = new CrawlerEngine();
  private techAnalyzer = new TechnicalSeoAnalyzer();
  private hcAnalyzer = new HealthcareAnalyzer();
  private docAnalyzer = new DoctorAnalyzer();
  private journeyAnalyzer = new PatientJourneyAnalyzer();
  private localAnalyzer = new LocalSeoAnalyzer();
  private socialAnalyzer = new SocialAnalyzer();
  private keywordDiscovery = new KeywordDiscovery();
  private scoringEngine = new ScoringEngine();
  private opportunityEngine = new OpportunityEngine();
  private outreachGenerator = new OutreachGenerator();
  private reportGenerator = new ReportGenerator();
  private pdfService = new PdfService();

  // In-memory active SSE subscribers for live crawl updates
  private progressSubscribers = new Map<string, Array<(event: CrawlProgressEvent) => void>>();

  /**
   * Subscribes to live crawl events for a specific audit ID.
   */
  subscribeToProgress(auditId: string, callback: (event: CrawlProgressEvent) => void): () => void {
    const subs = this.progressSubscribers.get(auditId) || [];
    subs.push(callback);
    this.progressSubscribers.set(auditId, subs);

    return () => {
      const current = this.progressSubscribers.get(auditId) || [];
      this.progressSubscribers.set(
        auditId,
        current.filter((cb) => cb !== callback)
      );
    };
  }

  private emitProgress(auditId: string, event: CrawlProgressEvent): void {
    const subs = this.progressSubscribers.get(auditId);
    if (subs) {
      subs.forEach((cb) => {
        try {
          cb(event);
        } catch (err) {
          logger.warn({ error: err }, 'Error executing progress callback');
        }
      });
    }
  }

  /**
   * Executes the full automated audit pipeline.
   */
  async runAudit(
    hospitalId: string,
    auditId?: string,
    options?: { maxPages?: number; maxDepth?: number }
  ): Promise<any> {
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      include: { contacts: true },
    });

    if (!hospital) {
      throw new Error(`Hospital with ID ${hospitalId} not found`);
    }

    let audit: any;
    if (auditId) {
      audit = await prisma.audit.findUnique({ where: { id: auditId } });
    }

    if (!audit) {
      audit = await prisma.audit.create({
        data: {
          hospitalId: hospital.id,
          status: 'CRAWLING',
          overallOpportunity: 'PENDING',
        },
      });
    } else {
      await prisma.audit.update({
        where: { id: audit.id },
        data: { status: 'CRAWLING', errorMessage: null },
      });
    }

    const currentAuditId = audit.id;

    // Create AuditJob record
    const job = await prisma.auditJob.create({
      data: {
        auditId: currentAuditId,
        status: 'RUNNING',
        currentStep: 'STARTING_CRAWL',
        progressPercent: 5,
      },
    });

    try {
      // 1. Run Crawler
      const crawlData = await this.crawler.crawlWebsite(hospital.websiteUrl, {
        maxPages: options?.maxPages,
        maxDepth: options?.maxDepth,
        onProgress: (evt) => {
          this.emitProgress(currentAuditId, evt);
          prisma.auditJob
            .update({
              where: { id: job.id },
              data: {
                currentStep: evt.step,
                progressPercent: evt.progressPercent,
              },
            })
            .catch(() => {});
        },
      });

      // 2. Technical SEO Analysis
      this.emitProgress(currentAuditId, {
        step: 'TECHNICAL_ANALYSIS',
        message: 'Evaluating 26 technical & on-page SEO rule checks...',
        pagesCrawled: crawlData.pages.length,
        totalPagesDiscovered: crawlData.stats.totalDiscovered,
        progressPercent: 82,
      });
      const technicalFindings = this.techAnalyzer.analyze(crawlData);

      // 3. Healthcare Structure Analysis
      this.emitProgress(currentAuditId, {
        step: 'HEALTHCARE_ANALYSIS',
        message: 'Analyzing clinical departments, 25+ medical specialties, and emergency accessibility...',
        pagesCrawled: crawlData.pages.length,
        totalPagesDiscovered: crawlData.stats.totalDiscovered,
        progressPercent: 85,
      });
      const hcData = this.hcAnalyzer.analyze(crawlData);

      // 4. Doctor Authority Analysis
      this.emitProgress(currentAuditId, {
        step: 'DOCTOR_ANALYSIS',
        message: 'Detecting consultant profiles, qualifications, and direct booking CTAs...',
        pagesCrawled: crawlData.pages.length,
        totalPagesDiscovered: crawlData.stats.totalDiscovered,
        progressPercent: 88,
      });
      const docData = this.docAnalyzer.analyze(crawlData);

      // 5. Patient Journey & Local/Social
      this.emitProgress(currentAuditId, {
        step: 'JOURNEY_ANALYSIS',
        message: 'Mapping 6-stage patient discovery funnel and CTA density...',
        pagesCrawled: crawlData.pages.length,
        totalPagesDiscovered: crawlData.stats.totalDiscovered,
        progressPercent: 90,
      });
      const journeyData = this.journeyAnalyzer.analyze(crawlData);
      const localData = this.localAnalyzer.analyze(crawlData, hospital.location);
      const socialData = this.socialAnalyzer.analyze(crawlData, {
        instagram: hospital.instagramUrl || undefined,
        facebook: hospital.facebookUrl || undefined,
        youtube: hospital.youtubeUrl || undefined,
        linkedin: hospital.linkedinUrl || undefined,
      });
      const keywordData = this.keywordDiscovery.generateTargets(
        hospital.name,
        hospital.location,
        hcData.detectedSpecialties.map((s) => s.name),
        docData.doctors
      );

      // 6. Scoring Engine
      const scores = this.scoringEngine.calculateScores(
        crawlData,
        technicalFindings,
        hcData,
        docData,
        journeyData,
        localData
      );

      // 7. Opportunity Engine
      this.emitProgress(currentAuditId, {
        step: 'GENERATING_OPPORTUNITIES',
        message: 'Identifying high-impact opportunities and mapping to IAMONIN growth modules...',
        pagesCrawled: crawlData.pages.length,
        totalPagesDiscovered: crawlData.stats.totalDiscovered,
        progressPercent: 93,
      });
      const opportunities = this.opportunityEngine.generateOpportunities(
        crawlData,
        technicalFindings,
        hcData,
        docData,
        journeyData,
        localData
      );

      // 8. Outreach Generator
      const primaryContact = hospital.contacts[0]?.name;
      const outreachSet = this.outreachGenerator.generateOutreach(
        hospital.name,
        hospital.location,
        hospital.websiteUrl,
        opportunities,
        scores,
        primaryContact
      );

      // 9. Full Audit Report Builder
      this.emitProgress(currentAuditId, {
        step: 'PREPARING_REPORT',
        message: 'Compiling 12-section audit report and server-side PDF document...',
        pagesCrawled: crawlData.pages.length,
        totalPagesDiscovered: crawlData.stats.totalDiscovered,
        progressPercent: 96,
      });
      const fullReportData = this.reportGenerator.generateReport(
        hospital.name,
        hospital.location,
        hospital.websiteUrl,
        crawlData,
        technicalFindings,
        hcData,
        docData,
        journeyData,
        localData,
        socialData,
        keywordData,
        scores,
        opportunities
      );

      // 10. Generate PDF
      const pdfFileName = `audit-${currentAuditId}.pdf`;
      const pdfFilePath = path.resolve(process.cwd(), 'reports', pdfFileName);
      await this.pdfService.generatePdf(fullReportData, pdfFilePath);

      // 11. Database Persistence in Transaction with bulk batch operations
      await prisma.$transaction(
        async (tx) => {
          // Clear previous child records if re-analyzing
          await tx.crawlPage.deleteMany({ where: { auditId: currentAuditId } });
          await tx.technicalFinding.deleteMany({ where: { auditId: currentAuditId } });
          await tx.healthcareFinding.deleteMany({ where: { auditId: currentAuditId } });
          await tx.doctor.deleteMany({ where: { auditId: currentAuditId } });
          await tx.opportunity.deleteMany({ where: { auditId: currentAuditId } });
          await tx.outreach.deleteMany({ where: { auditId: currentAuditId } });
          await tx.auditReport.deleteMany({ where: { auditId: currentAuditId } });

          // Update Audit main record
          await tx.audit.update({
            where: { id: currentAuditId },
            data: {
              status: 'COMPLETED',
              pagesCrawled: crawlData.pages.length,
              totalPagesDiscovered: crawlData.stats.totalDiscovered,
              overallOpportunity: scores.overallOpportunity,
              technicalHealthScore: scores.technicalHealth.score,
              seoReadinessScore: scores.seoReadiness.score,
              healthcareContentScore: scores.healthcareContent.score,
              doctorAuthorityScore: scores.doctorAuthority.score,
              patientJourneyScore: scores.patientJourney.score,
              conversionReadinessScore: scores.conversionReadiness.score,
              localPresenceScore: scores.localPresence.score,
              contentOpportunityScore: scores.contentOpportunity.score,
              scoresJson: JSON.stringify(scores),
              executiveSummary: fullReportData.executiveSummary,
              crawlStatsJson: JSON.stringify(crawlData.stats),
            },
          });

          // Insert Crawled Pages in Bulk (up to 50 sample pages)
          const crawlPagesData = crawlData.pages.slice(0, 50).map((p) => ({
            auditId: currentAuditId,
            url: p.url,
            finalUrl: p.finalUrl,
            statusCode: p.statusCode,
            depth: p.depth,
            title: p.title,
            metaDescription: p.metaDescription,
            h1ListJson: JSON.stringify(p.h1List),
            h2ListJson: JSON.stringify(p.h2List),
            wordCount: p.wordCount,
            canonicalUrl: p.canonicalUrl,
            ogDataJson: JSON.stringify({ title: p.ogTitle, description: p.ogDescription, image: p.ogImage }),
            schemaTypesJson: JSON.stringify(p.schemaTypes),
            imagesCount: p.imagesCount,
            imagesMissingAlt: p.imagesMissingAlt,
            internalLinksCount: p.internalLinks.length,
            externalLinksCount: p.externalLinks.length,
            ctasJson: JSON.stringify(p.ctas),
            detectedSpecialtiesJson: JSON.stringify(p.detectedSpecialties),
            isDoctorPage: p.isDoctorPage,
            isSpecialtyPage: p.isSpecialtyPage,
            isEmergencyPage: p.isEmergencyPage,
          }));

          if (crawlPagesData.length > 0) {
            await tx.crawlPage.createMany({ data: crawlPagesData });
          }

          // Insert Technical Findings in Bulk
          const techFindingsData = technicalFindings.map((tf) => ({
            auditId: currentAuditId,
            checkId: tf.checkId,
            name: tf.name,
            category: tf.category,
            severity: tf.severity,
            evidence: tf.evidence,
            affectedUrlsJson: JSON.stringify(tf.affectedUrls),
            explanation: tf.explanation,
            recommendation: tf.recommendation,
          }));

          if (techFindingsData.length > 0) {
            await tx.technicalFinding.createMany({ data: techFindingsData });
          }

          // Insert Healthcare Findings in Bulk
          const hcFindingsData = hcData.findings.map((hf) => ({
            auditId: currentAuditId,
            category: hf.category,
            title: hf.title,
            status: hf.status,
            evidence: hf.evidence,
            detailsJson: hf.details ? JSON.stringify(hf.details) : null,
          }));

          if (hcFindingsData.length > 0) {
            await tx.healthcareFinding.createMany({ data: hcFindingsData });
          }

          // Insert Doctors in Bulk
          const doctorsData = docData.doctors.map((doc) => ({
            auditId: currentAuditId,
            name: doc.name,
            specialty: doc.specialty,
            qualifications: doc.qualifications,
            experienceYears: doc.experienceYears,
            profileUrl: doc.profileUrl,
            photoUrl: doc.photoUrl,
            hasAppointmentCta: doc.hasAppointmentCta,
            hasDedicatedPage: doc.hasDedicatedPage,
            contentWordCount: doc.contentWordCount,
            hasSchema: doc.hasSchema,
          }));

          if (doctorsData.length > 0) {
            await tx.doctor.createMany({ data: doctorsData });
          }

          // Insert Opportunities in Bulk
          const opportunitiesData = opportunities.map((opp) => ({
            auditId: currentAuditId,
            title: opp.title,
            category: opp.category,
            severity: opp.severity,
            impact: opp.impact,
            effort: opp.effort,
            evidence: opp.evidence,
            whyItMatters: opp.whyItMatters,
            recommendedAction: opp.recommendedAction,
            iamoninModule: opp.iamoninModule,
            isTop5: opp.isTop5,
          }));

          if (opportunitiesData.length > 0) {
            await tx.opportunity.createMany({ data: opportunitiesData });
          }

          // Insert Outreaches in Bulk
          const channels = [
            { channel: 'EMAIL', subject: outreachSet.email.subject, content: outreachSet.email.body },
            { channel: 'LINKEDIN', subject: outreachSet.linkedIn.subject, content: outreachSet.linkedIn.body },
            { channel: 'WHATSAPP', subject: null, content: outreachSet.whatsApp.body },
            {
              channel: 'CALL_SCRIPT',
              subject: 'Phone Script',
              content: `${outreachSet.callScript.opening}\n\n${outreachSet.callScript.valueProposition}\n\nKey Points:\n${outreachSet.callScript.keyPoints.join('\n')}\n\nClosing:\n${outreachSet.callScript.closingQuestion}`,
            },
          ];

          const outreachData = channels.map((ch) => ({
            auditId: currentAuditId,
            channel: ch.channel,
            subject: ch.subject,
            content: ch.content,
            keyFindingsUsedJson: JSON.stringify(outreachSet.email.keyFindingsUsed),
          }));

          await tx.outreach.createMany({ data: outreachData });

          // Insert AuditReport
          await tx.auditReport.create({
            data: {
              auditId: currentAuditId,
              reportDataJson: JSON.stringify(fullReportData),
              pdfPath: pdfFilePath,
            },
          });

          // Complete Job
          await tx.auditJob.update({
            where: { id: job.id },
            data: {
              status: 'COMPLETED',
              currentStep: 'COMPLETED',
              progressPercent: 100,
              finishedAt: new Date(),
            },
          });
        },
        {
          maxWait: 15000,
          timeout: 60000,
        }
      );

      this.emitProgress(currentAuditId, {
        step: 'COMPLETED',
        message: 'Audit completed successfully. Report and outreach ready.',
        pagesCrawled: crawlData.pages.length,
        totalPagesDiscovered: crawlData.stats.totalDiscovered,
        progressPercent: 100,
      });

      return await prisma.audit.findUnique({
        where: { id: currentAuditId },
        include: {
          hospital: true,
          technicalFindings: true,
          healthcareFindings: true,
          doctors: true,
          opportunities: true,
          outreaches: true,
          report: true,
          competitors: true,
        },
      });
    } catch (err: any) {
      logger.error({ error: err.message, auditId: currentAuditId }, 'Audit execution failed');

      await prisma.audit.update({
        where: { id: currentAuditId },
        data: {
          status: 'FAILED',
          errorMessage: err.message || 'Audit execution error',
        },
      });

      await prisma.auditJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          errorMessage: err.message,
          finishedAt: new Date(),
        },
      });

      this.emitProgress(currentAuditId, {
        step: 'FAILED',
        message: `Audit failed: ${err.message}`,
        pagesCrawled: 0,
        totalPagesDiscovered: 0,
        progressPercent: 0,
      });

      throw err;
    }
  }
}

export const auditService = new AuditService();
