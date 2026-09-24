import React, { useState } from 'react';
import {
  ExternalLink,
  FileText,
  Send,
  Download,
  Trash2,
  RefreshCw,
  Search,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { FullAuditDetail } from '../../types';
import { api } from '../../services/api';

interface RecentAuditsTableProps {
  audits: FullAuditDetail[];
  onSelectAudit: (auditId: string) => void;
  onOpenOutreach: (audit: FullAuditDetail) => void;
  onDeleteAudit: (auditId: string) => void;
  onReanalyze: (auditId: string) => void;
}

export const RecentAuditsTable: React.FC<RecentAuditsTableProps> = ({
  audits,
  onSelectAudit,
  onOpenOutreach,
  onDeleteAudit,
  onReanalyze,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpportunity, setFilterOpportunity] = useState<string>('ALL');

  const filtered = audits.filter((a) => {
    const matchesSearch =
      a.hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.hospital.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.hospital.websiteUrl.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesOpp =
      filterOpportunity === 'ALL' || a.overallOpportunity === filterOpportunity;

    return matchesSearch && matchesOpp;
  });

  const getOpportunityBadge = (opp?: string) => {
    switch (opp) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-orange-50 text-iamonin-orange border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-iamonin-orange animate-pulse" />
            HIGH OPPORTUNITY
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            OPTIMIZED / LOW
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {opp || 'ANALYZING'}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <CheckCircle className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'CRAWLING':
      case 'ANALYZING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            In Progress
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600">
            <AlertCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Recent Hospital Audits & Prospect Pipeline
          </h2>
          <p className="text-xs text-slate-500">
            Select an audit to inspect scores, opportunities, or export PDF reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search hospital or city..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-iamonin-orange/50"
            />
          </div>

          {/* Filter dropdown */}
          <select
            value={filterOpportunity}
            onChange={(e) => setFilterOpportunity(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-iamonin-orange/50"
          >
            <option value="ALL">All Opportunities</option>
            <option value="HIGH">High Opportunity</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Hospital & Website</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Opportunity</th>
              <th className="py-3 px-4">Key Scores</th>
              <th className="py-3 px-4">Audit Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  No hospital audits found. Start an audit above to generate findings.
                </td>
              </tr>
            ) : (
              filtered.map((audit) => (
                <tr
                  key={audit.id}
                  className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                  onClick={() => onSelectAudit(audit.id)}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 text-iamonin-orange flex items-center justify-center font-bold text-xs">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 group-hover:text-iamonin-orange transition-colors">
                          {audit.hospital.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <span className="truncate max-w-[200px]">{audit.hospital.websiteUrl}</span>
                          <a
                            href={audit.hospital.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                    {audit.hospital.location}
                  </td>

                  <td className="py-3.5 px-4">
                    {getOpportunityBadge(audit.overallOpportunity)}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800" title="Technical Health">
                        T:{audit.technicalHealthScore || 0}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800" title="SEO Readiness">
                        S:{audit.seoReadinessScore || 0}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800" title="Healthcare Structure">
                        H:{audit.healthcareContentScore || 0}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800" title="Doctor Authority">
                        D:{audit.doctorAuthorityScore || 0}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(audit.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {getStatusBadge(audit.status)}
                  </td>

                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onSelectAudit(audit.id)}
                        className="p-1.5 text-slate-600 hover:text-iamonin-orange hover:bg-orange-50 rounded-lg transition-colors"
                        title="View Full Audit"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenOutreach(audit)}
                        className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Generate Outreach"
                      >
                        <Send className="w-4 h-4" />
                      </button>

                      <a
                        href={api.getPdfUrl(audit.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Download PDF Audit"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => onReanalyze(audit.id)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Re-analyze Website"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteAudit(audit.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Audit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
