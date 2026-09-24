import React from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Download,
  Send,
  RefreshCw,
  FileText,
  Building2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { FullAuditDetail } from '../../types';
import { api } from '../../services/api';

interface AuditDetailHeaderProps {
  audit: FullAuditDetail;
  onBack: () => void;
  onOpenOutreach: () => void;
  onReanalyze: () => void;
  isReanalyzing?: boolean;
}

export const AuditDetailHeader: React.FC<AuditDetailHeaderProps> = ({
  audit,
  onBack,
  onOpenOutreach,
  onReanalyze,
  isReanalyzing,
}) => {
  const getOpportunityBadge = (opp?: string) => {
    switch (opp) {
      case 'HIGH':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200">
            <span className="w-2 h-2 rounded-full bg-iamonin-orange animate-ping" />
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block leading-none">Growth Opportunity</span>
              <span className="text-xs font-black text-iamonin-orange tracking-wider">HIGH PRIORITY</span>
            </div>
          </div>
        );
      case 'MEDIUM':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block leading-none">Growth Opportunity</span>
              <span className="text-xs font-black text-blue-700 tracking-wider">MODERATE</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block leading-none">Growth Opportunity</span>
              <span className="text-xs font-black text-emerald-700 tracking-wider">OPTIMIZED</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle mb-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
        <span>/</span>
        <span className="text-slate-900">Hospital Audit Detail</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Main Info */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 text-iamonin-orange flex items-center justify-center font-bold text-lg shadow-sm">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {audit.hospital.name}
              </h1>
              {getOpportunityBadge(audit.overallOpportunity)}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
              <a
                href={audit.hospital.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-slate-700 hover:text-iamonin-orange font-medium"
              >
                <span>{audit.hospital.websiteUrl}</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <span>•</span>
              <span>{audit.hospital.location}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Audited {new Date(audit.createdAt).toLocaleDateString()}
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700">
                {audit.pagesCrawled} Pages Analyzed
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenOutreach}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Generate Outreach</span>
          </button>

          <a
            href={api.getPdfUrl(audit.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-iamonin-orange hover:bg-iamonin-orange-hover text-white font-bold text-xs shadow-sm shadow-orange-500/20 flex items-center gap-2 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Audit PDF</span>
          </a>

          <button
            onClick={onReanalyze}
            disabled={isReanalyzing}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1.5 transition-all"
            title="Re-run Website Crawler"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin' : ''}`} />
            <span>Re-analyze</span>
          </button>
        </div>
      </div>
    </div>
  );
};
