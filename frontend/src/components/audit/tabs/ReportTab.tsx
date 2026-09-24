import React from 'react';
import {
  Download,
  FileSpreadsheet,
  FileCode,
  Printer,
  Sparkles,
  HelpCircle,
  Building2,
  Calendar,
} from 'lucide-react';
import { FullAuditDetail } from '../../../types';
import { api } from '../../../services/api';

interface ReportTabProps {
  audit: FullAuditDetail;
}

export const ReportTab: React.FC<ReportTabProps> = ({ audit }) => {
  let reportData: any = null;
  try {
    if (audit.report?.reportDataJson) {
      reportData = JSON.parse(audit.report.reportDataJson);
    }
  } catch {
    // ignore
  }

  const sections: any[] = reportData?.sections || [];
  const discoveryQuestions: any[] = reportData?.discoveryQuestions || [
    {
      question: 'How are website enquiries currently handled and routed to the front-desk/OPD team?',
      category: 'Enquiry Workflow',
      rationale: 'Identifies response latency bottlenecks and enquiry drop-off before appointment confirmation.',
    },
    {
      question: 'Do you use a dedicated healthcare CRM or HMS integration for digital lead tracking?',
      category: 'Technology & CRM',
      rationale: 'Establishes whether lead data is centralizing or getting lost.',
    },
    {
      question: 'What percentage of enquiries currently become confirmed OPD appointments?',
      category: 'Conversion Funnel',
      rationale: 'Reveals revenue upside from automated WhatsApp qualification.',
    },
    {
      question: 'How are missed calls and after-hours patient enquiries followed up?',
      category: 'Lead Recovery',
      rationale: 'Unlocks immediate appointment recovery from patients calling outside standard hours.',
    },
    {
      question: 'Are appointment reminders automated via WhatsApp or SMS?',
      category: 'No-Show Reduction',
      rationale: 'Automated reminders reduce OPD no-show rates by 25-40%.',
    },
    {
      question: 'Which clinical super-specialties currently have underutilized OPD or OT capacity?',
      category: 'Growth Strategy',
      rationale: 'Aligns digital acquisition with high-margin clinical departments.',
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>Healthcare Digital Growth Audit Report</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-iamonin-orange">
              12 SECTIONS READY
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Formatted client-ready presentation with executive summary and priority roadmap
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={api.getPdfUrl(audit.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-iamonin-orange hover:bg-iamonin-orange-hover text-white font-bold text-xs shadow-sm shadow-orange-500/20 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </a>

          <a
            href={api.getCsvUrl(audit.id)}
            download
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </a>

          <a
            href={api.getJsonUrl(audit.id)}
            download
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1.5 transition-all"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-600" />
            <span>Export JSON</span>
          </a>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Structured 12-Section Document Preview */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-premium space-y-8 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-iamonin-orange text-white flex items-center justify-center font-black text-sm">
                IA
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">IAMONIN</span>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              HEALTHCARE GROWTH AUDIT REPORT
            </span>
          </div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {audit.hospital.name}
          </h1>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
            <span>{audit.hospital.websiteUrl}</span>
            <span>•</span>
            <span>{audit.hospital.location}</span>
            <span>•</span>
            <span>Audit Date: {new Date(audit.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Render 12 Sections */}
        {sections.length > 0 ? (
          sections.map((sec) => (
            <section key={sec.sectionNumber} className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-iamonin-orange uppercase tracking-wider">
                  SECTION {sec.sectionNumber}
                </span>
                <span className="text-slate-300">/</span>
                <h3 className="text-lg font-extrabold text-slate-900">{sec.sectionTitle}</h3>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                {sec.summary}
              </div>
            </section>
          ))
        ) : (
          <div className="space-y-6">
            <section className="space-y-2">
              <span className="text-xs font-black text-iamonin-orange uppercase">SECTION 1</span>
              <h3 className="text-lg font-bold text-slate-900">Executive Summary</h3>
              <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {audit.executiveSummary}
              </p>
            </section>
          </div>
        )}

        {/* SECTION 12: Discovery Questions Box */}
        <section className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-iamonin-orange uppercase">SECTION 12</span>
              <h3 className="text-lg font-extrabold text-slate-900">Hospital Discovery Questions</h3>
              <p className="text-xs text-slate-500">
                Required hospital-side inputs to evaluate internal conversion workflows and retention
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              DISCOVERY REQUIRED
            </span>
          </div>

          <div className="space-y-2.5">
            {discoveryQuestions.map((dq, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-iamonin-orange mb-1">
                  <span>Question {idx + 1}</span>
                  <span className="text-slate-500 font-medium">[{dq.category}]</span>
                </div>
                <p className="font-bold text-slate-900 mb-1">{dq.question}</p>
                <p className="text-slate-500 italic">Why this matters: {dq.rationale}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
