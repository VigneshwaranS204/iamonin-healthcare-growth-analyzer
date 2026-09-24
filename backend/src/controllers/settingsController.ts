import { Request, Response } from 'express';
import { prisma } from '../services/auditService.js';
import {
  HEALTHCARE_SPECIALTIES,
  DOCTOR_TERMS,
  DOCTOR_QUALIFICATIONS,
  CTA_TERMS,
  EMERGENCY_TERMS,
} from '../config/dictionary.js';
import { config } from '../config/env.js';

export async function getSettings(req: Request, res: Response): Promise<void> {
  const dbDicts = await prisma.healthcareDictionary.findMany({
    orderBy: { category: 'asc' },
  });

  res.json({
    crawlConfig: {
      maxPages: config.crawl.maxPages,
      maxDepth: config.crawl.maxDepth,
      requestDelayMs: config.crawl.requestDelayMs,
      timeoutMs: config.crawl.timeoutMs,
      userAgent: config.crawl.userAgent,
    },
    defaultDictionaries: {
      specialties: HEALTHCARE_SPECIALTIES,
      doctorTerms: DOCTOR_TERMS,
      doctorQualifications: DOCTOR_QUALIFICATIONS,
      ctaTerms: CTA_TERMS,
      emergencyTerms: EMERGENCY_TERMS,
    },
    customDictionaries: dbDicts,
  });
}

export async function addCustomDictionaryItem(req: Request, res: Response): Promise<void> {
  const { category, keyword, weight } = req.body;

  if (!category || !keyword) {
    res.status(400).json({ error: 'Category and Keyword are required' });
    return;
  }

  const item = await prisma.healthcareDictionary.upsert({
    where: {
      category_keyword: { category, keyword: keyword.toLowerCase().trim() },
    },
    update: { weight: weight || 1 },
    create: {
      category,
      keyword: keyword.toLowerCase().trim(),
      weight: weight || 1,
    },
  });

  res.status(201).json(item);
}
