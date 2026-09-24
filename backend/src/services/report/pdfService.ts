import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { FullAuditReportData } from './reportGenerator.js';
import { logger } from '../../utils/logger.js';

export class PdfService {
  /**
   * Generates a high-fidelity branded PDF report using PDFKit.
   */
  async generatePdf(reportData: FullAuditReportData, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const doc = new PDFDocument({
          size: 'A4',
          margin: 40,
          info: {
            Title: `IAMONIN Healthcare Growth Audit - ${reportData.meta.hospitalName}`,
            Author: 'IAMONIN Growth Engineering',
            Subject: 'Healthcare Digital Growth Audit',
            Keywords: 'Healthcare, Audit, SEO, Growth, IAMONIN',
          },
        });

        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        // --- COVER / HEADER ---
        // Top Brand Accent Bar
        doc.rect(0, 0, 595.28, 12).fill('#fc4d01');

        // Brand Title
        doc.fontSize(10).fillColor('#fc4d01').font('Helvetica-Bold').text('IAMONIN', 40, 30);
        doc.fontSize(8).fillColor('#64748b').font('Helvetica').text('HEALTHCARE DIGITAL GROWTH AUDIT', 40, 42);

        doc.fontSize(8).fillColor('#64748b').text(`Date: ${reportData.meta.auditDate}`, 420, 30, { align: 'right' });
        doc.fontSize(8).fillColor('#64748b').text(`Ref: ${reportData.meta.hospitalName.replace(/\s+/g, '-').toUpperCase()}`, 420, 42, { align: 'right' });

        doc.moveTo(40, 58).lineTo(555, 58).strokeColor('#e2e8f0').stroke();

        // Main Hospital Title Block
        doc.fontSize(20).fillColor('#0f172a').font('Helvetica-Bold').text(reportData.meta.hospitalName, 40, 75);
        doc.fontSize(10).fillColor('#64748b').font('Helvetica').text(`${reportData.meta.websiteUrl} • ${reportData.meta.location}`, 40, 100);

        // Overall Opportunity Badge
        const badgeColor = reportData.meta.overallOpportunity === 'HIGH' ? '#fc4d01' : '#0284c7';
        doc.roundedRect(430, 75, 125, 30, 4).fill(badgeColor);
        doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold').text('GROWTH OPPORTUNITY', 430, 81, { width: 125, align: 'center' });
        doc.fontSize(10).text(reportData.meta.overallOpportunity, 430, 93, { width: 125, align: 'center' });

        // Executive Summary Box
        doc.roundedRect(40, 125, 515, 80, 6).fill('#f8fafc').strokeColor('#cbd5e1').stroke();
        doc.fontSize(10).fillColor('#0f172a').font('Helvetica-Bold').text('EXECUTIVE SUMMARY', 55, 138);
        doc.fontSize(8.5).fillColor('#334155').font('Helvetica').text(
          reportData.executiveSummary.replace(/\*\*/g, '').slice(0, 350) + '...',
          55,
          154,
          { width: 485, lineGap: 3 }
        );

        // --- SECTION: 8 CORE SCORES ---
        doc.fontSize(12).fillColor('#0f172a').font('Helvetica-Bold').text('1. Observable Growth Scores', 40, 220);

        const s1 = reportData.sections[0]?.data?.scores;
        if (s1) {
          const scoreCards = [
            { label: 'Technical Health', val: `${s1.technicalHealth?.score || 0}/100`, grade: s1.technicalHealth?.grade },
            { label: 'SEO Readiness', val: `${s1.seoReadiness?.score || 0}/100`, grade: s1.seoReadiness?.grade },
            { label: 'Healthcare Content', val: `${s1.healthcareContent?.score || 0}/100`, grade: s1.healthcareContent?.grade },
            { label: 'Doctor Authority', val: `${s1.doctorAuthority?.score || 0}/100`, grade: s1.doctorAuthority?.grade },
            { label: 'Patient Journey', val: `${s1.patientJourney?.score || 0}/100`, grade: s1.patientJourney?.grade },
            { label: 'Conversion Readiness', val: `${s1.conversionReadiness?.score || 0}/100`, grade: s1.conversionReadiness?.grade },
            { label: 'Local Presence', val: `${s1.localPresence?.score || 0}/100`, grade: s1.localPresence?.grade },
            { label: 'Content Depth', val: `${s1.contentOpportunity?.score || 0}/100`, grade: s1.contentOpportunity?.grade },
          ];

          let startY = 240;
          scoreCards.forEach((sc, idx) => {
            const col = idx % 4;
            const row = Math.floor(idx / 4);
            const x = 40 + col * 132;
            const y = startY + row * 55;

            doc.roundedRect(x, y, 122, 48, 4).fill('#ffffff').strokeColor('#e2e8f0').stroke();
            doc.fontSize(7.5).fillColor('#64748b').font('Helvetica').text(sc.label, x + 8, y + 8, { width: 106 });
            doc.fontSize(13).fillColor('#0f172a').font('Helvetica-Bold').text(sc.val, x + 8, y + 24);
            doc.fontSize(10).fillColor('#fc4d01').text(`[${sc.grade || 'B'}]`, x + 90, y + 26);
          });
        }

        // --- SECTION: TOP 5 OPPORTUNITIES ---
        doc.fontSize(12).fillColor('#0f172a').font('Helvetica-Bold').text('2. Top High-Impact Growth Opportunities', 40, 370);

        const top5 = reportData.sections[8]?.data?.top5Opportunities || [];
        let oppY = 390;

        top5.slice(0, 4).forEach((opp: any, idx: number) => {
          doc.roundedRect(40, oppY, 515, 60, 4).fill('#ffffff').strokeColor('#e2e8f0').stroke();
          doc.rect(40, oppY, 4, 60).fill('#fc4d01');

          doc.fontSize(9.5).fillColor('#0f172a').font('Helvetica-Bold').text(`${idx + 1}. ${opp.title}`, 52, oppY + 8);
          doc.fontSize(7.5).fillColor('#fc4d01').font('Helvetica-Bold').text(opp.iamoninModuleLabel || opp.category, 420, oppY + 8, { align: 'right', width: 125 });

          doc.fontSize(8).fillColor('#475569').font('Helvetica').text(`Evidence: ${opp.evidence}`, 52, oppY + 22, { width: 490 });
          doc.fontSize(8).fillColor('#0f172a').font('Helvetica-Oblique').text(`Action: ${opp.recommendedAction}`, 52, oppY + 38, { width: 490 });

          oppY += 66;
        });

        // --- SECTION: PRIORITY ROADMAP TABLE (PAGE 2) ---
        doc.addPage();
        doc.rect(0, 0, 595.28, 12).fill('#fc4d01');

        doc.fontSize(10).fillColor('#fc4d01').font('Helvetica-Bold').text('IAMONIN', 40, 30);
        doc.fontSize(8).fillColor('#64748b').font('Helvetica').text('HEALTHCARE DIGITAL GROWTH AUDIT — IMPLEMENTATION ROADMAP', 40, 42);
        doc.moveTo(40, 55).lineTo(555, 55).strokeColor('#e2e8f0').stroke();

        doc.fontSize(13).fillColor('#0f172a').font('Helvetica-Bold').text('3. Priority Implementation Roadmap', 40, 70);

        let tableY = 95;
        // Table Header
        doc.rect(40, tableY, 515, 20).fill('#0f172a');
        doc.fontSize(8).fillColor('#ffffff').font('Helvetica-Bold');
        doc.text('Priority', 50, tableY + 6);
        doc.text('Opportunity & Action', 110, tableY + 6);
        doc.text('Impact', 360, tableY + 6);
        doc.text('Effort', 410, tableY + 6);
        doc.text('IAMONIN Module', 460, tableY + 6);

        tableY += 20;

        reportData.priorityRoadmap.slice(0, 7).forEach((item, idx) => {
          const rowBg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
          doc.rect(40, tableY, 515, 36).fill(rowBg).strokeColor('#e2e8f0').stroke();

          const prioColor = item.priority === 'HIGH' ? '#fc4d01' : item.priority === 'MEDIUM' ? '#0284c7' : '#64748b';
          doc.fontSize(7.5).fillColor(prioColor).font('Helvetica-Bold').text(item.priority, 50, tableY + 12);

          doc.fontSize(8).fillColor('#0f172a').font('Helvetica-Bold').text(item.title, 110, tableY + 6, { width: 240 });
          doc.fontSize(7).fillColor('#475569').font('Helvetica').text(item.recommendation, 110, tableY + 18, { width: 240, height: 16 });

          doc.fontSize(7.5).fillColor('#0f172a').text(item.impact, 360, tableY + 12);
          doc.fontSize(7.5).fillColor('#0f172a').text(item.effort, 410, tableY + 12);
          doc.fontSize(7).fillColor('#fc4d01').font('Helvetica-Bold').text(item.iamoninModule.split(' ')[1] || item.iamoninModule, 460, tableY + 12, { width: 90 });

          tableY += 36;
        });

        // --- SECTION: DISCOVERY QUESTIONS ---
        tableY += 20;
        doc.fontSize(13).fillColor('#0f172a').font('Helvetica-Bold').text('4. Hospital Discovery Questions', 40, tableY);
        doc.fontSize(8).fillColor('#64748b').font('Helvetica').text(
          'Requires hospital-side information to evaluate internal conversion funnel and patient retention.',
          40,
          tableY + 16
        );

        tableY += 32;

        reportData.discoveryQuestions.slice(0, 5).forEach((dq, idx) => {
          doc.roundedRect(40, tableY, 515, 34, 4).fill('#f8fafc').strokeColor('#e2e8f0').stroke();
          doc.fontSize(8).fillColor('#fc4d01').font('Helvetica-Bold').text(`Q${idx + 1} [${dq.category}]`, 50, tableY + 6);
          doc.fontSize(8).fillColor('#0f172a').font('Helvetica').text(dq.question, 50, tableY + 18, { width: 495 });

          tableY += 40;
        });

        // Footer note
        doc.fontSize(7).fillColor('#94a3b8').text(
          'IAMONIN Healthcare Growth Analyzer • Proprietary Rule-Based Audit System • No Third-Party SEO APIs Used',
          40,
          780,
          { align: 'center', width: 515 }
        );

        doc.end();

        writeStream.on('finish', () => {
          resolve(outputPath);
        });

        writeStream.on('error', (err) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}
