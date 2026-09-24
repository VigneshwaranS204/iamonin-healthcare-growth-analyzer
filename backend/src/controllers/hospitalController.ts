import { Request, Response } from 'express';
import { prisma } from '../services/auditService.js';
import { normalizeUrl } from '../services/crawler/urlNormalizer.js';

export async function createHospital(req: Request, res: Response): Promise<void> {
  const { name, websiteUrl, location, googleMapsUrl, instagramUrl, facebookUrl, youtubeUrl, linkedinUrl, contacts } = req.body;

  if (!name || !websiteUrl || !location) {
    res.status(400).json({ error: 'Hospital Name, Website URL, and Location are required' });
    return;
  }

  const normalized = normalizeUrl(websiteUrl);
  if (!normalized) {
    res.status(400).json({ error: 'Invalid Website URL format' });
    return;
  }

  const hospital = await prisma.hospital.create({
    data: {
      name: name.trim(),
      websiteUrl: normalized,
      location: location.trim(),
      googleMapsUrl: googleMapsUrl?.trim() || null,
      instagramUrl: instagramUrl?.trim() || null,
      facebookUrl: facebookUrl?.trim() || null,
      youtubeUrl: youtubeUrl?.trim() || null,
      linkedinUrl: linkedinUrl?.trim() || null,
      contacts: contacts && Array.isArray(contacts)
        ? {
            create: contacts.map((c: any) => ({
              name: c.name,
              designation: c.designation,
              email: c.email,
              phone: c.phone,
              linkedIn: c.linkedIn,
            })),
          }
        : undefined,
    },
    include: { contacts: true, audits: true },
  });

  res.status(201).json(hospital);
}

export async function getHospitals(req: Request, res: Response): Promise<void> {
  const hospitals = await prisma.hospital.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      contacts: true,
      audits: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  res.json(hospitals);
}

export async function getHospitalById(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const hospital = await prisma.hospital.findUnique({
    where: { id },
    include: {
      contacts: true,
      audits: {
        orderBy: { createdAt: 'desc' },
        include: {
          opportunities: true,
          technicalFindings: true,
          healthcareFindings: true,
          doctors: true,
          outreaches: true,
          report: true,
          competitors: true,
        },
      },
    },
  });

  if (!hospital) {
    res.status(404).json({ error: 'Hospital not found' });
    return;
  }

  res.json(hospital);
}

export async function deleteHospital(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  await prisma.hospital.delete({ where: { id } });
  res.json({ success: true, message: 'Hospital and all associated audits deleted' });
}
