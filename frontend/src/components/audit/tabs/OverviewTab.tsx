import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Stethoscope, Users, Send } from 'lucide-react';
import { FullAuditDetail, Opportunity } from '../../../types';

interface OverviewTabProps {
  audit: FullAuditDetail;
  onNavigateTab: (tabId: string) => void;
  onOpenOutreach: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  audit,
  onNavigateTab,
  onOpenOutreach,
}) => {
  const top5 = audit.opportunities?.filter((o) => o.isTop5) || audit.opportunities?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Executive Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-iamonin-orange flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Executive Audit Summary</h2>
            <p className="text-xs text-slate-500">Automated digital posture & growth opportunity appraisal</p>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-normal">
          {audit.executiveSummary ||
            'IAMONIN Healthcare Growth Analyzer completed a structured audit of this hospital website. Key observations indicate strong opportunity to enhance appointment conversion, doctor profile visibility, and specialty content.'}
        </p>
      </div>

      {/* Top 5 High-Impact Opportunities */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>Top 5 High-Impact Growth Opportunities</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-iamonin-orange">
                PRIORITY ACTIONS
              </span>
            </h2>
            <p className="text-xs text-slate-500">Deterministic findings mapped to IAMONIN growth solutions</p>
          </div>

          <button
            onClick={() => onNavigateTab('opportunities')}
            className="text-xs font-bold text-iamonin-orange hover:text-iamonin-orange-hover flex items-center gap-1"
          >
            <span>View All Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {top5.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No top opportunities generated yet.</p>
          ) : (
            top5.map((opp, idx) => (
              <div
                key={opp.id || idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-orange-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-iamonin-orange/10 text-iamonin-orange flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-iamonin-orange transition-colors">
                        {opp.title}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-orange-100 text-iamonin-orange uppercase">
                        {opp.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-1">
                      <strong className="text-slate-800">Evidence:</strong> {opp.evidence}
                    </p>
                    <p className="text-xs text-slate-500 italic">
                      <strong className="text-slate-700 not-italic">Recommendation:</strong> {opp.recommendedAction}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-1.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    {opp.iamoninModule?.replace(/_/g, ' ') || 'IAMONIN MODULE'}
                  </span>
                  <span className="text-[10px] font-extrabold text-iamonin-orange">
                    Impact: HIGH
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* IAMONIN 6 Growth Modules Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
        <h2 className="text-base font-extrabold text-slate-900 mb-1">
          IAMONIN Healthcare Growth System Alignment
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Observable website gaps mapped to the 6 IAMONIN growth pillars
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="text-[10px] font-black text-slate-400 uppercase">01 MODULE</div>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">Digital Foundation</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">Website, Technical SEO, Mobile Viewport, Schema</p>
            <div className="text-xs font-bold text-emerald-600">✓ Observable Findings Ready</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="text-[10px] font-black text-slate-400 uppercase">02 MODULE</div>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">Doctor Authority</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">Physician Profiles, Credentials, Direct OPD CTAs</p>
            <div className="text-xs font-bold text-iamonin-orange">⚡ High Growth Opportunity</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="text-[10px] font-black text-slate-400 uppercase">03 MODULE</div>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">Patient Acquisition</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">Specialty Procedural Hubs, Clinical Content</p>
            <div className="text-xs font-bold text-iamonin-orange">⚡ High Growth Opportunity</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="text-[10px] font-black text-slate-400 uppercase">04 MODULE</div>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">Appointment Conversion</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">1-Click WhatsApp Desk, Sticky Action Bar</p>
            <div className="text-xs font-bold text-iamonin-orange">⚡ High Growth Opportunity</div>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
            <div className="text-[10px] font-black text-blue-500 uppercase">05 MODULE</div>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">AI Follow-up</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">Missed Enquiry Recovery & Reminder Workflows</p>
            <div className="text-xs font-bold text-blue-700">🔍 Discovery Required</div>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
            <div className="text-[10px] font-black text-blue-500 uppercase">06 MODULE</div>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">Growth Intelligence</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">Campaign-to-OPD Attribution & CRM Tracking</p>
            <div className="text-xs font-bold text-blue-700">🔍 Discovery Required</div>
          </div>
        </div>
      </div>
    </div>
  );
};
