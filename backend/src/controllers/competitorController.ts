import { Request, Response } from 'express';
import { prisma } from '../services/auditService.js';
import { CompetitorAnalyzer } from '../services/competitor/competitorAnalyzer.js';
import { normalizeUrl } from '../services/crawler/urlNormalizer.js';

const compAnalyzer = new CompetitorAnalyzer();

export async function addAndAnalyzeCompetitor(req: Request, res: Response): Promise<void> {
  const { auditId, name, websiteUrl, location } = req.body;

  if (!auditId || !name || !websiteUrl) {
    res.status(400).json({ error: 'auditId, name, and websiteUrl are required' });
    return;
  }

  const normalized = normalizeUrl(websiteUrl);
  if (!normalized) {
    res.status(400).json({ error: 'Invalid competitor website URL' });
    return;
  }

  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    include: {
      healthcareFindings: true,
      doctors: true,
    },
  });

  if (!audit) {
    res.status(404).json({ error: 'Parent audit not found' });
    return;
  }

  try {
    const comparison = await compAnalyzer.analyzeCompetitor(name, normalized, {
      specialtiesCount: audit.healthcareFindings.length,
      doctorsCount: audit.doctors.length,
      hasWhatsApp: audit.healthcareFindings.some((h) => h.title.includes('WhatsApp') && h.status === 'DETECTED'),
      hasAppointmentBooking: audit.healthcareFindings.some((h) => h.title.includes('Appointment') && h.status === 'DETECTED'),
    });

    const competitor = await prisma.competitor.create({
      data: {
        auditId,
        name: name.trim(),
        websiteUrl: normalized,
        location: location?.trim() || null,
        scoresJson: JSON.stringify(comparison.scores),
        comparisonGapsJson: JSON.stringify({
          metrics: comparison.metrics,
          observableGaps: comparison.observableGaps,
        }),
      },
    });

    res.status(201).json(competitor);
  } catch (err: any) {
    res.status(500).json({ error: `Competitor analysis failed: ${err.message}` });
  }
}

export async function getCompetitors(req: Request, res: Response): Promise<void> {
  const { auditId } = req.params as { auditId: string };
  const competitors = await prisma.competitor.findMany({
    where: { auditId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(competitors);
}
