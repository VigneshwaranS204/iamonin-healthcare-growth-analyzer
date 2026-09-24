import { Request, Response } from 'express';
import { prisma } from '../services/auditService.js';
import { OutreachGenerator } from '../services/outreach/outreachGenerator.js';

const outreachGen = new OutreachGenerator();

export async function getOutreaches(req: Request, res: Response): Promise<void> {
  const { auditId } = req.params as { auditId: string };

  const outreaches = await prisma.outreach.findMany({
    where: { auditId },
    orderBy: { createdAt: 'desc' },
  });

  res.json(outreaches);
}

export async function regenerateOutreach(req: Request, res: Response): Promise<void> {
  const { auditId } = req.params as { auditId: string };
  const { contactName } = req.body;

  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    include: {
      hospital: { include: { contacts: true } },
      opportunities: true,
    },
  });

  if (!audit || !audit.scoresJson || !audit.hospital) {
    res.status(404).json({ error: 'Audit or scores not found' });
    return;
  }

  const scores = JSON.parse(audit.scoresJson);
  const targetContact = contactName || audit.hospital.contacts[0]?.name;

  const generated = outreachGen.generateOutreach(
    audit.hospital.name,
    audit.hospital.location,
    audit.hospital.websiteUrl,
    audit.opportunities as any,
    scores,
    targetContact
  );

  // Update DB
  await prisma.outreach.deleteMany({ where: { auditId } });

  const channels = [
    { channel: 'EMAIL', subject: generated.email.subject, content: generated.email.body },
    { channel: 'LINKEDIN', subject: generated.linkedIn.subject, content: generated.linkedIn.body },
    { channel: 'WHATSAPP', content: generated.whatsApp.body },
    {
      channel: 'CALL_SCRIPT',
      subject: 'Phone Opening Script',
      content: `${generated.callScript.opening}\n\n${generated.callScript.valueProposition}\n\nKey Points:\n${generated.callScript.keyPoints.join('\n')}\n\nClosing:\n${generated.callScript.closingQuestion}`,
    },
  ];

  for (const ch of channels) {
    await prisma.outreach.create({
      data: {
        auditId,
        channel: ch.channel,
        subject: ch.subject,
        content: ch.content,
        keyFindingsUsedJson: JSON.stringify(generated.email.keyFindingsUsed),
      },
    });
  }

  const updatedOutreaches = await prisma.outreach.findMany({ where: { auditId } });
  res.json({ success: true, outreaches: updatedOutreaches, generated });
}
