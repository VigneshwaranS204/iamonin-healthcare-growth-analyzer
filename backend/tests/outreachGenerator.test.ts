import { describe, it, expect } from 'vitest';
import { OutreachGenerator } from '../src/services/outreach/outreachGenerator.js';
import { OpportunityItem } from '../src/services/opportunity/opportunityEngine.js';

describe('Outreach Generator', () => {
  const generator = new OutreachGenerator();

  it('generates multi-channel outreach strictly using observed findings without fake claims', () => {
    const mockOpportunities: OpportunityItem[] = [
      {
        id: 'OPP-01',
        title: 'Instant WhatsApp Patient Consultation Desk',
        category: 'Appointment Conversion',
        severity: 'HIGH',
        impact: 'HIGH',
        effort: 'LOW',
        evidence: 'WhatsApp consultation links were not detected on 24 analyzed pages.',
        whyItMatters: '',
        recommendedAction: 'Add WhatsApp triage desk button.',
        iamoninModule: 'APPOINTMENT_CONVERSION',
        iamoninModuleLabel: '04 Appointment Conversion',
        isTop5: true,
      },
      {
        id: 'OPP-02',
        title: 'Doctor Profile Direct Booking CTAs',
        category: 'Doctor Authority',
        severity: 'HIGH',
        impact: 'HIGH',
        effort: 'LOW',
        evidence: '12 of 16 doctor profile pages lack direct booking CTAs.',
        whyItMatters: '',
        recommendedAction: 'Add 1-click booking CTAs on doctor pages.',
        iamoninModule: 'DOCTOR_AUTHORITY',
        iamoninModuleLabel: '02 Doctor Authority',
        isTop5: true,
      },
    ];

    const mockScores: any = {
      overallOpportunity: 'HIGH',
      overallOpportunityScore: 55,
      technicalHealth: { score: 80 },
    };

    const result = generator.generateOutreach(
      'City Care Hospital',
      'Mumbai',
      'https://citycaremumbai.com',
      mockOpportunities,
      mockScores,
      'Dr. Mehta'
    );

    // Verify presence of real evidence
    expect(result.email.body).toContain('City Care Hospital');
    expect(result.email.body).toContain('WhatsApp consultation links were not detected');
    expect(result.email.body).toContain('12 of 16 doctor profile pages lack direct booking CTAs');

    // Verify absence of fabricated claims
    expect(result.email.body.toLowerCase()).not.toContain('lost patients');
    expect(result.email.body.toLowerCase()).not.toContain('poor hospital management');
    expect(result.email.body.toLowerCase()).not.toContain('revenue loss');

    // Verify WhatsApp & Call Script
    expect(result.whatsApp.body).toContain('City Care Hospital');
    expect(result.callScript.opening).toContain('City Care Hospital');
    expect(result.callScript.keyPoints.length).toBeGreaterThanOrEqual(2);
  });
});
