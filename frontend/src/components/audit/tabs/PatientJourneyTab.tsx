import React from 'react';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  Phone,
  MessageSquare,
  Calendar,
  FileText,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { FullAuditDetail } from '../../../types';

interface PatientJourneyTabProps {
  audit: FullAuditDetail;
}

export const PatientJourneyTab: React.FC<PatientJourneyTabProps> = ({ audit }) => {
  let parsedScores: any = {};
  try {
    if (audit.scoresJson) {
      parsedScores = JSON.parse(audit.scoresJson);
    }
  } catch {
    // ignore
  }

  const journeyComponents = parsedScores.patientJourney?.components || [];
  const totalPages = audit.pagesCrawled || 1;

  const apptCount = audit.pages?.filter((p) => p.hasAppointmentCta).length || 0;

  return (
    <div className="space-y-6">
      {/* Disclaimer Alert */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Patient Conversion Readiness:</strong> This score represents observable on-site navigation, mobile usability, and call-to-action visibility across public web pages. It does not measure internal hospital conversion rates or offline OPD patient footfall.
        </p>
      </div>

      {/* 6-Stage Journey Flow */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
        <h2 className="text-base font-extrabold text-slate-900 mb-1">
          6-Stage Patient Discovery-to-Appointment Funnel
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Step-by-step audit of digital patient decision journey
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              step: '01',
              title: 'DISCOVER',
              subtitle: 'Mobile First Impression',
              desc: 'Homepage responsiveness, load speed signals, viewport tag, and headline clarity.',
            },
            {
              step: '02',
              title: 'TRUST',
              subtitle: 'Social Proof & Credentials',
              desc: 'Hospital accreditations (NABH/JCI), recovery stories, reviews, and clinical awards.',
            },
            {
              step: '03',
              title: 'SPECIALTY',
              subtitle: 'Clinical Department Depth',
              desc: 'Procedure details, surgical technologies, treatment FAQs, and condition guides.',
            },
            {
              step: '04',
              title: 'DOCTOR',
              subtitle: 'Consultant Authority',
              desc: 'Doctor qualifications, specialist biographies, video consultations, and OPD timings.',
            },
            {
              step: '05',
              title: 'ENQUIRY',
              subtitle: 'Direct Triage Access',
              desc: 'WhatsApp chat desk, telephone lines, and responsive enquiry form capture.',
            },
            {
              step: '06',
              title: 'APPOINTMENT',
              subtitle: 'Frictionless Booking',
              desc: '1-click appointment booking CTAs and direct consultation scheduling.',
            },
          ].map((st, idx) => (
            <div
              key={st.step}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-orange-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-iamonin-orange">STAGE {st.step}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                    {st.subtitle}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">{st.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{st.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Density & Dead-Ends */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
        <h2 className="text-base font-extrabold text-slate-900 mb-1">
          Call-to-Action (CTA) Density & Page Friction
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Distribution of conversion entry points across {totalPages} crawled pages
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-xs mb-1">
              <Calendar className="w-4 h-4 text-iamonin-orange" />
              <span>Appointment Booking CTAs</span>
            </div>
            <div className="text-2xl font-black text-slate-900 my-1">
              {apptCount} <span className="text-xs font-normal text-slate-500">/ {totalPages} pages</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {Math.round((apptCount / totalPages) * 100)}% of pages allow direct booking
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-xs mb-1">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Chat Desk</span>
            </div>
            <div className="text-2xl font-black text-slate-900 my-1">
              {audit.healthcareFindings?.some((h) => h.title.includes('WhatsApp') && h.status === 'DETECTED')
                ? 'Active'
                : 'Not Detected'}
            </div>
            <p className="text-[11px] text-slate-500">
              High-converting channel for instant patient routing
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-xs mb-1">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Click-to-Call Phone Lines</span>
            </div>
            <div className="text-2xl font-black text-slate-900 my-1">
              {audit.technicalFindings?.some((t) => t.category === 'Technical') ? 'Detected' : 'Standard'}
            </div>
            <p className="text-[11px] text-slate-500">Direct OPD hotline numbers in header/footer</p>
          </div>
        </div>
      </div>
    </div>
  );
};
