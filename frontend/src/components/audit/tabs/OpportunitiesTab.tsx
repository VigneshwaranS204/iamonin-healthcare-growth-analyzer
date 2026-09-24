import React, { useState } from 'react';
import { Flame, CheckCircle2, ArrowRight, Zap, Filter, HelpCircle } from 'lucide-react';
import { FullAuditDetail, Opportunity } from '../../../types';

interface OpportunitiesTabProps {
  audit: FullAuditDetail;
}

export const OpportunitiesTab: React.FC<OpportunitiesTabProps> = ({ audit }) => {
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const opportunities = audit.opportunities || [];

  const modules = [
    { key: 'ALL', label: 'All Modules' },
    { key: 'DIGITAL_FOUNDATION', label: '01 Digital Foundation' },
    { key: 'DOCTOR_AUTHORITY', label: '02 Doctor Authority' },
    { key: 'PATIENT_ACQUISITION', label: '03 Patient Acquisition' },
    { key: 'APPOINTMENT_CONVERSION', label: '04 Appointment Conversion' },
    { key: 'AI_FOLLOW_UP', label: '05 AI Follow-up (Discovery)' },
    { key: 'GROWTH_INTELLIGENCE', label: '06 Growth Intelligence (Discovery)' },
  ];

  const filtered = opportunities.filter((o) =>
    selectedModule === 'ALL' ? true : o.iamoninModule === selectedModule
  );

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-orange-100 text-iamonin-orange border border-orange-200">
            HIGH PRIORITY
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {modules.map((m) => (
          <button
            key={m.key}
            onClick={() => setSelectedModule(m.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedModule === m.key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            No opportunities found for the selected IAMONIN module.
          </div>
        ) : (
          filtered.map((opp, idx) => (
            <div
              key={opp.id || idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle hover:border-orange-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-iamonin-orange flex items-center justify-center font-black text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{opp.title}</h3>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">{opp.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getSeverityBadge(opp.severity)}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Impact: {opp.impact || 'HIGH'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Effort: {opp.effort || 'LOW'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-800 block">Observable Evidence:</span>
                  <p className="text-slate-600 leading-relaxed">{opp.evidence}</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-800 block">Why it matters:</span>
                  <p className="text-slate-600 leading-relaxed">{opp.whyItMatters}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200 flex items-start gap-2.5 text-xs">
                <Zap className="w-4 h-4 text-iamonin-orange shrink-0 mt-0.5" />
                <div>
                  <strong className="text-iamonin-orange font-bold">Recommended IAMONIN Action:</strong>
                  <p className="text-slate-800 font-medium mt-0.5">{opp.recommendedAction}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="font-bold text-slate-700">
                  Target Solution: <strong className="text-iamonin-orange">{opp.iamoninModule?.replace(/_/g, ' ')}</strong>
                </span>
                {opp.isTop5 && (
                  <span className="px-2 py-0.5 rounded bg-orange-100 text-iamonin-orange font-black text-[10px]">
                    TOP 5 STRATEGIC ACTION
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
