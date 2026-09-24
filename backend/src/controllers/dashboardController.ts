import { Request, Response } from 'express';
import { prisma } from '../services/auditService.js';

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  const [
    totalHospitals,
    totalAudits,
    completedAudits,
    inProgressAudits,
    highOpportunityCount,
    mediumOpportunityCount,
    reportsCount,
    outreachCount,
    recentAudits,
  ] = await Promise.all([
    prisma.hospital.count(),
    prisma.audit.count(),
    prisma.audit.count({ where: { status: 'COMPLETED' } }),
    prisma.audit.count({ where: { status: { in: ['PENDING', 'CRAWLING', 'ANALYZING'] } } }),
    prisma.audit.count({ where: { overallOpportunity: 'HIGH' } }),
    prisma.audit.count({ where: { overallOpportunity: 'MEDIUM' } }),
    prisma.auditReport.count(),
    prisma.outreach.count(),
    prisma.audit.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        hospital: true,
        opportunities: { where: { isTop5: true }, take: 3 },
      },
    }),
  ]);

  res.json({
    kpis: {
      totalHospitals,
      totalAudits,
      completedAudits,
      inProgressAudits,
      highOpportunityCount,
      mediumOpportunityCount,
      reportsCount,
      outreachCount,
    },
    recentAudits,
  });
}
