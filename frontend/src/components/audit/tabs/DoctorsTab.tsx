import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Award,
  Calendar,
  AlertTriangle,
  FileCode2,
} from 'lucide-react';
import { FullAuditDetail } from '../../../types';

interface DoctorsTabProps {
  audit: FullAuditDetail;
}

export const DoctorsTab: React.FC<DoctorsTabProps> = ({ audit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const doctors = audit.doctors || [];

  const filtered = doctors.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.specialty && d.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.qualifications && d.qualifications.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const dedicatedCount = doctors.filter((d) => d.hasDedicatedPage).length;
  const withCtaCount = doctors.filter((d) => d.hasAppointmentCta).length;
  const withSchemaCount = doctors.filter((d) => d.hasSchema).length;
  const weakContentCount = doctors.filter((d) => d.contentWordCount < 150).length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Doctors Detected</span>
          <span className="text-2xl font-black text-slate-900">{doctors.length}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Identified in crawl</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Dedicated URL Slugs</span>
          <span className="text-2xl font-black text-slate-900">{dedicatedCount}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {doctors.length > 0 ? Math.round((dedicatedCount / doctors.length) * 100) : 0}% coverage
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Direct Booking CTAs</span>
          <span className={`text-2xl font-black ${withCtaCount < doctors.length ? 'text-iamonin-orange' : 'text-emerald-600'}`}>
            {withCtaCount} / {doctors.length}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {doctors.length - withCtaCount} lack direct booking
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Physician Schema</span>
          <span className={`text-2xl font-black ${withSchemaCount === 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {withSchemaCount} / {doctors.length}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">JSON-LD markup</span>
        </div>
      </div>

      {/* Roster Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Doctor Profiles & Authority Roster
            </h2>
            <p className="text-xs text-slate-500">
              Evaluation of digital visibility, qualifications, and patient conversion hooks
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search doctor or specialty..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-iamonin-orange/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Doctor Name</th>
                <th className="py-3 px-4">Specialty</th>
                <th className="py-3 px-4">Qualifications</th>
                <th className="py-3 px-4">Dedicated Page</th>
                <th className="py-3 px-4">Booking CTA</th>
                <th className="py-3 px-4">Schema Markup</th>
                <th className="py-3 px-4 text-right">Profile Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                    No doctor profiles detected matching the search query.
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {doc.name}
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-600">
                      {doc.specialty || 'General Consultant'}
                    </td>

                    <td className="py-3 px-4 text-xs font-medium text-slate-700">
                      {doc.qualifications ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {doc.qualifications}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Not stated</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-xs">
                      {doc.hasDedicatedPage ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <XCircle className="w-3.5 h-3.5" />
                          Roster Only
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-xs">
                      {doc.hasAppointmentCta ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-iamonin-orange font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Missing CTA
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-xs">
                      {doc.hasSchema ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Physician
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          Missing
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {doc.profileUrl ? (
                        <a
                          href={doc.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-iamonin-orange font-medium"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
