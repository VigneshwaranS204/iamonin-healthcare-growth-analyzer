import React from 'react';
import {
  Stethoscope,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  PhoneCall,
  Package,
  HeartHandshake,
  BookOpen,
  Globe,
} from 'lucide-react';
import { FullAuditDetail, HealthcareFinding } from '../../../types';

interface HealthcareStructureTabProps {
  audit: FullAuditDetail;
}

export const HealthcareStructureTab: React.FC<HealthcareStructureTabProps> = ({ audit }) => {
  const findings = audit.healthcareFindings || [];

  const getStatusBadge = (status: HealthcareFinding['status']) => {
    switch (status) {
      case 'DETECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            DETECTED
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" />
            PARTIAL COVERAGE
          </span>
        );
      case 'NOT_DETECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            NOT DETECTED
          </span>
        );
      case 'DISCOVERY_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <HelpCircle className="w-3.5 h-3.5" />
            DISCOVERY REQUIRED
          </span>
        );
    }
  };

  const specialtiesFinding = findings.find((f) => f.category === 'Specialties');
  let specialtiesData: any = null;
  try {
    if (specialtiesFinding?.detailsJson) {
      specialtiesData = JSON.parse(specialtiesFinding.detailsJson);
    }
  } catch {
    // ignore
  }

  return (
    <div className="space-y-6">
      {/* Clinical Specialties Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-iamonin-orange flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Clinical Department & Specialty Depth
              </h2>
              <p className="text-xs text-slate-500">
                {specialtiesData?.detectedCount || 0} Super-Specialty & Broad Clinical Departments Identified
              </p>
            </div>
          </div>

          {specialtiesFinding && getStatusBadge(specialtiesFinding.status)}
        </div>

        {/* Detected Specialties Badges */}
        {specialtiesData?.specialties && specialtiesData.specialties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-4">
            {specialtiesData.specialties.map((spec: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{spec.name}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">{spec.category?.replace(/_/g, ' ')}</span>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {spec.pagesCount} page(s)
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-3">No clinical specialties detected.</p>
        )}

        {/* Missing Core Specialties (if any) */}
        {specialtiesData?.missingCoreSpecialties && specialtiesData.missingCoreSpecialties.length > 0 && (
          <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-200 mt-3">
            <span className="text-xs font-bold text-iamonin-orange block mb-1">
              Potential Clinical Gaps / Undetected Super-Specialty Hubs:
            </span>
            <div className="flex flex-wrap gap-2">
              {specialtiesData.missingCoreSpecialties.map((miss: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-white border border-orange-200 text-xs font-medium text-slate-700"
                >
                  {miss}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Healthcare Infrastructure & Patient Touchpoints Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
        <h2 className="text-base font-extrabold text-slate-900 mb-1">
          Hospital Operational & Patient Care Touchpoints
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Observable on-site accessibility signals vs. hospital-side discovery
        </p>

        <div className="divide-y divide-slate-100">
          {findings
            .filter((f) => f.category !== 'Specialties')
            .map((finding) => (
              <div key={finding.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-900">{finding.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">
                      {finding.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{finding.evidence}</p>
                </div>

                <div className="shrink-0">
                  {getStatusBadge(finding.status)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
