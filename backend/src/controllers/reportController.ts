import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../services/auditService.js';
import { PdfService } from '../services/report/pdfService.js';

const pdfService = new PdfService();

export async function getReport(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const report = await prisma.auditReport.findUnique({
    where: { auditId: id },
    include: {
      audit: {
        include: { hospital: true, opportunities: true },
      },
    },
  });

  if (!report) {
    res.status(404).json({ error: 'Report not generated yet for this audit' });
    return;
  }

  res.json({
    id: report.id,
    auditId: report.auditId,
    reportData: JSON.parse(report.reportDataJson),
    pdfPath: report.pdfPath,
    createdAt: report.createdAt,
  });
}

export async function downloadPdf(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const report = await prisma.auditReport.findUnique({
    where: { auditId: id },
    include: { audit: { include: { hospital: true } } },
  });

  if (!report) {
    res.status(404).json({ error: 'Audit report not found' });
    return;
  }

  let pdfPath = report.pdfPath;

  if (!pdfPath || !fs.existsSync(pdfPath)) {
    // Regenerate on the fly if file missing
    const reportData = JSON.parse(report.reportDataJson);
    const generatedPath = path.resolve(process.cwd(), 'reports', `audit-${id}.pdf`);
    await pdfService.generatePdf(reportData, generatedPath);
    pdfPath = generatedPath;

    await prisma.auditReport.update({
      where: { id: report.id },
      data: { pdfPath: generatedPath },
    });
  }

  const filename = `IAMONIN_Audit_${(report.audit?.hospital?.name || 'Hospital').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  const fileStream = fs.createReadStream(pdfPath);
  fileStream.pipe(res);
}
