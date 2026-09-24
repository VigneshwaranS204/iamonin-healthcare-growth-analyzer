import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FullAuditDetail, TechnicalFinding } from '../../../types';

interface TechnicalSeoTabProps {
  audit: FullAuditDetail;
}

export const TechnicalSeoTab: React.FC<TechnicalSeoTabProps> = ({ audit }) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCheckId, setExpandedCheckId] = useState<string | null>(null);

  const findings = audit.technicalFindings || [];

  const filtered = findings.filter((f) => {
    const matchesSeverity =
      severityFilter === 'ALL'
        ? true
        : severityFilter === 'PASSED'
        ? f.severity === 'INFO'
        : f.severity === severityFilter;

    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.evidence.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.checkId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSeverity && matchesSearch;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-orange-100 text-iamonin-orange border border-orange-200">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">
            LOW
          </span>
        );
      case 'INFO':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
            PASSED / INFO
          </span>
        );
      default:
        return null;
    }
  };

  const criticalCount = findings.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = findings.filter((f) => f.severity === 'HIGH').length;
  const medCount = findings.filter((f) => f.severity === 'MEDIUM').length;
  const lowCount = findings.filter((f) => f.severity === 'LOW').length;
  const passedCount = findings.filter((f) => f.severity === 'INFO').length;

  return (
    <div className="space-y-6">
      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setSeverityFilter('ALL')}
          className={`p-3 rounded-xl border text-left transition-all ${
            severityFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold block uppercase opacity-75">All Checks</span>
          <span className="text-xl font-black">{findings.length}</span>
        </button>

        <button
          onClick={() => setSeverityFilter('CRITICAL')}
          className={`p-3 rounded-xl border text-left transition-all ${
            severityFilter === 'CRITICAL'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white text-rose-700 border-rose-100 hover:border-rose-200'
          }`}
        >
          <span className="text-[10px] font-bold block uppercase opacity-75">Critical</span>
          <span className="text-xl font-black">{criticalCount}</span>
        </button>

        <button
          onClick={() => setSeverityFilter('HIGH')}
          className={`p-3 rounded-xl border text-left transition-all ${
            severityFilter === 'HIGH'
              ? 'bg-iamonin-orange text-white border-iamonin-orange shadow-sm'
              : 'bg-white text-orange-700 border-orange-100 hover:border-orange-200'
          }`}
        >
          <span className="text-[10px] font-bold block uppercase opacity-75">High Priority</span>
          <span className="text-xl font-black">{highCount}</span>
        </button>

        <button
          onClick={() => setSeverityFilter('MEDIUM')}
          className={`p-3 rounded-xl border text-left transition-all ${
            severityFilter === 'MEDIUM'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white text-amber-700 border-amber-100 hover:border-amber-200'
          }`}
        >
          <span className="text-[10px] font-bold block uppercase opacity-75">Medium</span>
          <span className="text-xl font-black">{medCount}</span>
        </button>

        <button
          onClick={() => setSeverityFilter('PASSED')}
          className={`p-3 rounded-xl border text-left transition-all ${
            severityFilter === 'PASSED'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white text-emerald-700 border-emerald-100 hover:border-emerald-200'
          }`}
        >
          <span className="text-[10px] font-bold block uppercase opacity-75">Passed</span>
          <span className="text-xl font-black">{passedCount}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search checks, check IDs or keywords..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-iamonin-orange/50"
          />
        </div>

        <span className="text-xs text-slate-500 font-semibold self-start sm:self-auto">
          Showing {filtered.length} of {findings.length} Rule Checks
        </span>
      </div>

      {/* Checks List */}
      <div className="space-y-3">
        {filtered.map((finding) => {
          const isExpanded = expandedCheckId === finding.id;
          let affectedUrls: string[] = [];
          try {
            if (finding.affectedUrlsJson) {
              affectedUrls = JSON.parse(finding.affectedUrlsJson);
            }
          } catch {
            // ignore
          }

          const isPassed = finding.severity === 'INFO';

          return (
            <div
              key={finding.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                isPassed
                  ? 'bg-white border-slate-200 hover:border-slate-300'
                  : 'bg-white border-slate-200 hover:border-orange-300 shadow-subtle'
              }`}
            >
              <div
                className="p-4 cursor-pointer flex items-start justify-between gap-4"
                onClick={() => setExpandedCheckId(isExpanded ? null : finding.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isPassed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : finding.severity === 'CRITICAL' ? (
                      <AlertOctagon className="w-5 h-5 text-rose-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-iamonin-orange" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {finding.checkId}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">
                        {finding.name}
                      </h3>
                      {getSeverityBadge(finding.severity)}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                        {finding.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      <strong>Evidence:</strong> {finding.evidence}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {affectedUrls.length > 0 && (
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {affectedUrls.length} URL(s)
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5">Why it matters:</span>
                      <p className="text-slate-600">{finding.explanation}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5">Recommendation:</span>
                      <p className="text-slate-900 font-medium">{finding.recommendation}</p>
                    </div>
                  </div>

                  {affectedUrls.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">
                        Affected URLs ({affectedUrls.length}):
                      </span>
                      <div className="max-h-32 overflow-y-auto space-y-1 font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-200">
                        {affectedUrls.map((url, idx) => (
                          <div key={idx} className="flex items-center justify-between text-slate-600 hover:text-slate-900">
                            <span className="truncate max-w-xl">{url}</span>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-700 shrink-0 ml-2">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
