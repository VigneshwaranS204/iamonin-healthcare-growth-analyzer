import React, { useState } from 'react';
import { FileText, Search, Key, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { FullAuditDetail } from '../../../types';

interface ContentTabProps {
  audit: FullAuditDetail;
}

export const ContentTab: React.FC<ContentTabProps> = ({ audit }) => {
  const [searchTerm, setSearchTerm] = useState('');

  let reportData: any = null;
  try {
    if (audit.report?.reportDataJson) {
      reportData = JSON.parse(audit.report.reportDataJson);
    }
  } catch {
    // ignore
  }

  const keywordSection = reportData?.sections?.find((s: any) => s.sectionNumber === 7);
  const keywords: any[] = keywordSection?.data?.keywords || [
    {
      keyword: `${audit.hospital.name} ${audit.hospital.location}`,
      intent: 'BRANDED',
      category: 'Brand Search',
      suggestedPageType: 'Homepage',
      rationale: 'Primary navigational query for hospital name in location.',
    },
    {
      keyword: `cardiology hospital in ${audit.hospital.location}`,
      intent: 'HIGH_INTENT',
      category: 'Cardiology',
      suggestedPageType: 'Specialty Page',
      rationale: 'High-intent specialty search for cardiology consultations.',
    },
    {
      keyword: `orthopedic doctor in ${audit.hospital.location}`,
      intent: 'HIGH_INTENT',
      category: 'Orthopaedics',
      suggestedPageType: 'Doctor Profile',
      rationale: 'OPD specialist search for bone and joint treatments.',
    },
    {
      keyword: `24 hours hospital emergency ${audit.hospital.location}`,
      intent: 'HIGH_INTENT',
      category: 'Emergency',
      suggestedPageType: 'Booking Page',
      rationale: 'Urgent immediate casualty care query.',
    },
  ];

  const filteredKeywords = keywords.filter((k) =>
    k.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Disclaimer Alert */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Potential Target Keywords Only:</strong> These high-intent terms are generated algorithmically based on detected specialties and location. They represent high-leverage search targets for content strategy and do <em>not</em> claim current Google ranking positions or third-party search volume.
        </p>
      </div>

      {/* Target Keywords Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>Potential High-Intent Keyword Targets</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-iamonin-orange uppercase">
                CONTENT TARGETS
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              High-converting clinical and doctor keyword opportunities
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter keyword targets..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-iamonin-orange/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Potential Target Query</th>
                <th className="py-3 px-4">Intent Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Suggested Destination</th>
                <th className="py-3 px-4">Clinical Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredKeywords.map((k, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                    {k.keyword}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      {k.intent}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-700 font-semibold">
                    {k.category}
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                      {k.suggestedPageType}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-500 max-w-xs">
                    {k.rationale}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
