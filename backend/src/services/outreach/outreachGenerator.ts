import { OpportunityItem } from '../opportunity/opportunityEngine.js';
import { ComprehensiveScoresResult } from '../scoring/scoringEngine.js';

export interface GeneratedOutreachSet {
  hospitalName: string;
  location: string;
  websiteUrl: string;
  email: {
    subject: string;
    body: string;
    keyFindingsUsed: string[];
  };
  linkedIn: {
    subject: string;
    body: string;
    keyFindingsUsed: string[];
  };
  whatsApp: {
    body: string;
    keyFindingsUsed: string[];
  };
  callScript: {
    opening: string;
    valueProposition: string;
    keyPoints: string[];
    closingQuestion: string;
  };
}

export class OutreachGenerator {
  /**
   * Generates personalized sales outreach grounded strictly in actual audit evidence.
   */
  generateOutreach(
    hospitalName: string,
    location: string,
    websiteUrl: string,
    topOpportunities: OpportunityItem[],
    scores: ComprehensiveScoresResult,
    contactName?: string
  ): GeneratedOutreachSet {
    const contactGreeting = contactName ? `Hi ${contactName}` : 'Dear Hospital Leadership';
    const cleanLocation = location ? ` in ${location}` : '';

    const top3Opportunities = topOpportunities.slice(0, 3);
    const keyFindingTexts = top3Opportunities.map((o) => `${o.title.toLowerCase()} (${o.evidence})`);

    const findingBullets = top3Opportunities
      .map((o, idx) => `${idx + 1}. **${o.title}**: ${o.evidence}`)
      .join('\n');

    // 1. Email Message
    const emailSubject = `Digital growth observations for ${hospitalName}${cleanLocation}`;
    const emailBody = `${contactGreeting},

We recently completed a structured review of ${hospitalName}'s publicly accessible digital presence and patient conversion touchpoints${cleanLocation}.

Our analysis identified several strong observable opportunities to enhance patient acquisition and doctor visibility:

${findingBullets}

We compiled these findings into a concise 12-section **Healthcare Digital Growth Audit**, which includes actionable recommendations for clinical specialty depth, physician schema, and appointment conversion pathways.

Would you be open to a brief 10-minute walkthrough this week to share the full audit?

Warm regards,

**IAMONIN Healthcare Growth Team**
*Healthcare Digital Growth & Patient Acquisition Systems*`;

    // 2. LinkedIn Message
    const linkedInSubject = `Observations on ${hospitalName}'s digital patient touchpoints`;
    const linkedInBody = `${contactGreeting},

I hope this message finds you well. I was reviewing ${hospitalName}'s public digital channels and noticed a few clear areas where prospective patient engagement can be accelerated:

• ${top3Opportunities[0] ? `${top3Opportunities[0].title} — ${top3Opportunities[0].evidence}` : 'Patient conversion pathways'}
• ${top3Opportunities[1] ? `${top3Opportunities[1].title} — ${top3Opportunities[1].evidence}` : 'Doctor authority and structured schema'}

We have put together an objective Healthcare Digital Growth Audit with specific technical and patient journey recommendations.

Would you be open to reviewing the audit summary? Happy to send it over.

Best regards,
IAMONIN Healthcare Growth Team`;

    // 3. WhatsApp Message
    const whatsAppBody = `Hello ${contactName || 'Team'},

Greetings from IAMONIN Healthcare Growth.

We recently conducted a public digital audit for *${hospitalName}* and noted key opportunities to strengthen patient conversions:

📌 *${top3Opportunities[0]?.title || 'Appointment Conversion'}*: ${top3Opportunities[0]?.evidence || 'Observable growth area'}
📌 *${top3Opportunities[1]?.title || 'Doctor Authority'}*: ${top3Opportunities[1]?.evidence || 'Observable growth area'}

We have a 1-page summary audit ready for your clinical and marketing leadership. 

May I share the PDF report with you here?

Best regards,
*IAMONIN Growth Engineering*`;

    // 4. Phone Opening Script
    const callScript = {
      opening: `"Hello, may I speak with ${contactName ? contactName + ' at ' + hospitalName : 'the Medical Director or Marketing Lead for ' + hospitalName}? My name is [Your Name] with IAMONIN Healthcare Growth."`,
      valueProposition: `"I am calling regarding a digital presence and patient conversion audit we recently completed for ${hospitalName}${cleanLocation}. We noticed a few observable opportunities on your public website around ${top3Opportunities[0]?.title.toLowerCase() || 'patient booking'} and ${top3Opportunities[1]?.title.toLowerCase() || 'doctor profiles'}."`,
      keyPoints: top3Opportunities.map(
        (o) => `Mention observation: "${o.title}" — specifically, "${o.evidence}"`
      ),
      closingQuestion: `"We prepared a structured 12-section audit with concrete recommendations. What is the best email address to send this report for your team to review?"`,
    };

    return {
      hospitalName,
      location,
      websiteUrl,
      email: {
        subject: emailSubject,
        body: emailBody,
        keyFindingsUsed: keyFindingTexts,
      },
      linkedIn: {
        subject: linkedInSubject,
        body: linkedInBody,
        keyFindingsUsed: keyFindingTexts,
      },
      whatsApp: {
        body: whatsAppBody,
        keyFindingsUsed: keyFindingTexts,
      },
      callScript,
    };
  }
}
