import { Request, Response } from 'express';
import { prisma, auditService } from '../services/auditService.js';
import { normalizeUrl } from '../services/crawler/urlNormalizer.js';
import { logger } from '../utils/logger.js';

export async function startAudit(req: Request, res: Response): Promise<void> {
  const {
    hospitalName,
    websiteUrl,
    location,
    googleMapsUrl,
    instagramUrl,
    facebookUrl,
    youtubeUrl,
    linkedinUrl,
    contactName,
    contactDesignation,
    contactEmail,
    contactPhone,
    maxPages,
    maxDepth,
  } = req.body;

  if (!hospitalName || !websiteUrl) {
    res.status(400).json({ error: 'Hospital Name and Website URL are required' });
    return;
  }

  const normalized = normalizeUrl(websiteUrl);
  if (!normalized) {
    res.status(400).json({ error: 'Invalid hospital website URL' });
    return;
  }

  // Find existing hospital or create
  let hospital = await prisma.hospital.findFirst({
    where: { websiteUrl: normalized },
    include: { contacts: true },
  });

  if (!hospital) {
    hospital = await prisma.hospital.create({
      data: {
        name: hospitalName.trim(),
        websiteUrl: normalized,
        location: (location || 'General Location').trim(),
        googleMapsUrl: googleMapsUrl?.trim() || null,
        instagramUrl: instagramUrl?.trim() || null,
        facebookUrl: facebookUrl?.trim() || null,
        youtubeUrl: youtubeUrl?.trim() || null,
        linkedinUrl: linkedinUrl?.trim() || null,
        contacts: contactName
          ? {
              create: [
                {
                  name: contactName.trim(),
                  designation: contactDesignation?.trim() || null,
                  email: contactEmail?.trim() || null,
                  phone: contactPhone?.trim() || null,
                },
              ],
            }
          : undefined,
      },
      include: { contacts: true },
    });
  }

  // Create pending Audit record
  const audit = await prisma.audit.create({
    data: {
      hospitalId: hospital.id,
      status: 'CRAWLING',
      overallOpportunity: 'HIGH',
    },
  });

  // Execute pipeline asynchronously
  auditService
    .runAudit(hospital.id, audit.id, { maxPages, maxDepth })
    .then((result) => {
      logger.info({ auditId: audit.id }, 'Audit pipeline completed');
    })
    .catch((err) => {
      logger.error({ auditId: audit.id, error: err.message }, 'Audit pipeline error');
    });

  res.status(202).json({
    message: 'Hospital audit analysis started',
    auditId: audit.id,
    hospitalId: hospital.id,
    status: 'CRAWLING',
  });
}

export async function getAuditById(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const audit = await prisma.audit.findUnique({
    where: { id },
    include: {
      hospital: { include: { contacts: true } },
      technicalFindings: true,
      healthcareFindings: true,
      doctors: true,
      opportunities: true,
      outreaches: true,
      report: true,
      competitors: true,
      pages: {
        take: 30,
        orderBy: { depth: 'asc' },
      },
      jobs: {
        orderBy: { startedAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!audit) {
    res.status(404).json({ error: 'Audit not found' });
    return;
  }

  res.json(audit);
}

export async function getAuditProgressStream(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial ping
  res.write(`data: ${JSON.stringify({ step: 'CONNECTED', message: 'Connected to live crawl stream' })}\n\n`);

  const unsubscribe = auditService.subscribeToProgress(id, (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
    if (event.step === 'COMPLETED' || event.step === 'FAILED') {
      res.end();
    }
  });

  req.on('close', () => {
    unsubscribe();
  });
}

export async function reanalyzeAudit(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const existing = await prisma.audit.findUnique({
    where: { id },
    include: { hospital: true },
  });

  if (!existing) {
    res.status(404).json({ error: 'Audit not found' });
    return;
  }

  auditService
    .runAudit(existing.hospitalId, existing.id)
    .catch((err) => logger.error({ error: err.message }, 'Re-audit failed'));

  res.json({ message: 'Re-audit triggered', auditId: existing.id, status: 'CRAWLING' });
}

export async function deleteAudit(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  await prisma.audit.delete({ where: { id } });
  res.json({ success: true, message: 'Audit deleted successfully' });
}
