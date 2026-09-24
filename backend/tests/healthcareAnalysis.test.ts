import { describe, it, expect } from 'vitest';
import { PageCrawler } from '../src/services/crawler/pageCrawler.js';
import { DoctorAnalyzer } from '../src/services/analyzer/doctorAnalyzer.js';
import { HealthcareAnalyzer } from '../src/services/analyzer/healthcareAnalyzer.js';

describe('Healthcare & Doctor Extraction', () => {
  const pageCrawler = new PageCrawler();
  const docAnalyzer = new DoctorAnalyzer();
  const hcAnalyzer = new HealthcareAnalyzer();

  it('extracts doctor names, qualifications, specialties, and CTAs from HTML fixture', () => {
    const sampleHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Dr. Rajesh Gupta - Senior Cardiologist | Apollo Hospital</title>
          <meta name="description" content="Consult Dr. Rajesh Gupta, MBBS, MD, DM Cardiology with 18 years of experience.">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Physician",
              "name": "Dr. Rajesh Gupta",
              "medicalSpecialty": "Cardiology",
              "honorificSuffix": "MBBS, MD, DM",
              "telephone": "+919876543210"
            }
          </script>
        </head>
        <body>
          <h1>Dr. Rajesh Gupta</h1>
          <h2>Senior Consultant - Cardiology & Cardiac Electrophysiology</h2>
          <p>Dr. Rajesh Gupta holds MBBS, MD (Medicine), and DM (Cardiology) with over 18 years of clinical experience in interventional cardiology.</p>
          <a href="https://wa.me/919876543210" class="btn">Chat on WhatsApp</a>
          <button class="book-btn">Book Appointment</button>
          <div class="emergency">24/7 Emergency & Cath Lab Active</div>
        </body>
      </html>
    `;

    const parsed = pageCrawler.parseHtml(
      sampleHtml,
      'https://apollohospital.com/doctors/dr-rajesh-gupta',
      'https://apollohospital.com/doctors/dr-rajesh-gupta',
      200,
      1,
      'https://apollohospital.com'
    );

    expect(parsed.isDoctorPage).toBe(true);
    expect(parsed.hasAppointmentCta).toBe(true);
    expect(parsed.whatsAppLinks.length).toBe(1);
    expect(parsed.schemaTypes).toContain('Physician');

    const crawlResult: any = {
      pages: [parsed],
      robots: { exists: true, sitemaps: [], disallowedPaths: [], allowedPaths: [], userAgents: [], observations: [] },
      sitemap: { exists: true, urls: [], totalUrls: 1, sitemapUrls: [], errors: [], observations: [] },
      stats: { totalDiscovered: 1, totalCrawled: 1, totalFailed: 0, startTime: '', endTime: '', durationSeconds: 1 },
    };

    const docResult = docAnalyzer.analyze(crawlResult);
    expect(docResult.totalDoctorsDetected).toBeGreaterThanOrEqual(1);
    const doctor = docResult.doctors.find((d) => d.name.includes('Rajesh'));
    expect(doctor).toBeDefined();
    expect(doctor?.hasAppointmentCta).toBe(true);
    expect(doctor?.hasSchema).toBe(true);

    const hcResult = hcAnalyzer.analyze(crawlResult);
    expect(hcResult.hasWhatsAppDesk).toBe(true);
    expect(hcResult.hasAppointmentBooking).toBe(true);
  });
});
