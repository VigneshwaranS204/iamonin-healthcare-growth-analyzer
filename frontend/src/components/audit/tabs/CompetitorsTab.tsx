import React, { useState } from 'react';
import { Plus, Building2, ExternalLink, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { FullAuditDetail, Competitor } from '../../../types';
import { api } from '../../../services/api';

interface CompetitorsTabProps {
  audit: FullAuditDetail;
  onRefreshAudit: () => void;
}

export const CompetitorsTab: React.FC<CompetitorsTabProps> = ({ audit, onRefreshAudit }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [location, setLocation] = useState(audit.hospital.location || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const competitors = audit.competitors || [];

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await api.addCompetitor({
        auditId: audit.id,
        name: name.trim() || 'Competitor Hospital',
        websiteUrl: websiteUrl.trim(),
        location: location.trim(),
      });
      setShowAddModal(false);
      setName('');
      setWebsiteUrl('');
      onRefreshAudit();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed analyzing competitor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            Competitor Website Gap Analysis
          </h2>
          <p className="text-xs text-slate-500">
            Compare public digital presence against up to 3 competing healthcare institutions
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Competitor URL</span>
        </button>
      </div>

      {/* Competitor Side-by-Side Comparison Grid */}
      {competitors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-subtle">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Competitors Added Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Add competitor hospital URLs to discover observable website gaps in doctors, WhatsApp accessibility, and specialty depth.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-iamonin-orange hover:bg-iamonin-orange-hover text-white font-bold text-xs shadow-sm"
          >
            Add First Competitor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {competitors.map((comp) => {
            let gapData: any = {};
            let scoresData: any = {};
            try {
              if (comp.comparisonGapsJson) gapData = JSON.parse(comp.comparisonGapsJson);
              if (comp.scoresJson) scoresData = JSON.parse(comp.scoresJson);
            } catch {
              // ignore
            }

            return (
              <div key={comp.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{comp.name}</h3>
                    <a
                      href={comp.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-500 hover:text-iamonin-orange flex items-center gap-1 mt-0.5"
                    >
                      <span>{comp.websiteUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {comp.location || 'Metro Area'}
                  </span>
                </div>

                {/* Observable Gaps */}
                <div>
                  <span className="text-xs font-bold text-slate-800 block mb-2">Observable Website Gaps:</span>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {gapData.observableGaps?.map((gap: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <AlertCircle className="w-3.5 h-3.5 text-iamonin-orange shrink-0 mt-0.5" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Competitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Competitor Hospital URL</h3>
            <form onSubmit={handleAddCompetitor} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Competitor Website URL *</label>
                <input
                  type="text"
                  required
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://competitorhospital.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-iamonin-orange/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Competitor Hospital Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Metro Care Hospital"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-iamonin-orange/50"
                />
              </div>

              {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-iamonin-orange hover:bg-iamonin-orange-hover text-white font-bold text-xs"
                >
                  {isLoading ? 'Crawling Competitor...' : 'Analyze Competitor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
