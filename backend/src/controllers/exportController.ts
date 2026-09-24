import { Request, Response } from 'express';
import { prisma } from '../services/auditService.js';
import { ExportService } from '../services/export/exportService.js';

const exportService = new ExportService();

export async function exportAuditCsv(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const audit = await prisma.audit.findUnique({
    where: { id },
    include: {
      hospital: true,
      opportunities: true,
      technicalFindings: true,
    },
  });

  if (!audit || !audit.hospital) {
    res.status(404).json({ error: 'Audit not found' });
    return;
  }

  const csv = exportService.generateCsv(
    audit.hospital.name,
    audit.hospital.websiteUrl,
    audit.opportunities as any,
    audit.technicalFindings as any
  );

  const filename = `IAMONIN_Export_${audit.hospital.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

export async function exportAuditJson(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const report = await prisma.auditReport.findUnique({
    where: { auditId: id },
    include: {
      audit: {
        include: { hospital: true },
      },
    },
  });

  if (!report) {
    res.status(404).json({ error: 'Report data not found for audit' });
    return;
  }

  const parsed = JSON.parse(report.reportDataJson);
  const jsonOutput = exportService.generateJson(parsed);

  const filename = `IAMONIN_Report_${(report.audit?.hospital?.name || 'Hospital').replace(/[^a-zA-Z0-9]/g, '_')}.json`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(jsonOutput);
}
