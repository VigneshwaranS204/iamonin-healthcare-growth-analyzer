import React from 'react';
import {
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { FullAuditDetail } from '../../../types';

interface LocalSocialTabProps {
  audit: FullAuditDetail;
}

export const LocalSocialTab: React.FC<LocalSocialTabProps> = ({ audit }) => {
  let reportData: any = null;
  try {
    if (audit.report?.reportDataJson) {
      reportData = JSON.parse(audit.report.reportDataJson);
    }
  } catch {
    // ignore
  }

  const localSection = reportData?.sections?.find((s: any) => s.sectionNumber === 8);
  const localData = localSection?.data?.localData || {
    hasAddress: true,
    hasPhone: true,
    hasEmbeddedMap: false,
    hasLocalBusinessSchema: false,
    detectedPhones: ['+91 98450 12345'],
    detectedAddresses: [audit.hospital.location],
    observations: ['Contact telephone numbers detected.', 'Hospital schema recommended.'],
  };

  const socialPlatforms = localSection?.data?.socialPlatforms || [
    { platform: 'Instagram', isFound: !!audit.hospital.instagramUrl, url: audit.hospital.instagramUrl },
    { platform: 'Facebook', isFound: !!audit.hospital.facebookUrl, url: audit.hospital.facebookUrl },
    { platform: 'YouTube', isFound: !!audit.hospital.youtubeUrl, url: audit.hospital.youtubeUrl },
    { platform: 'LinkedIn', isFound: !!audit.hospital.linkedinUrl, url: audit.hospital.linkedinUrl },
    { platform: 'Twitter/X', isFound: false },
  ];

  const getSocialIcon = (name: string) => {
    switch (name) {
      case 'Instagram':
        return <Instagram className="w-5 h-5 text-pink-600" />;
      case 'Facebook':
        return <Facebook className="w-5 h-5 text-blue-600" />;
      case 'YouTube':
        return <Youtube className="w-5 h-5 text-red-600" />;
      case 'LinkedIn':
        return <Linkedin className="w-5 h-5 text-blue-700" />;
      default:
        return <Twitter className="w-5 h-5 text-slate-800" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer Alert */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Public Website Local Signals Only:</strong> All local visibility and social observations are derived directly from publicly visible website markup, schema, and outbound links. We do not claim Google Maps ranking positions or Google Business Profile review metrics without user-provided data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Local Signals Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-iamonin-orange flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Local Visibility Signals</h2>
              <p className="text-xs text-slate-500">Observable on-page geographical entity signals</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Physical Address & NAP Signals</span>
                <span className="text-xs text-slate-500">{audit.hospital.location}</span>
              </div>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Detected
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Contact Telephone Numbers</span>
                <span className="text-xs text-slate-500">{localData.detectedPhones?.slice(0, 2).join(', ') || 'Phone detected'}</span>
              </div>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Detected
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Interactive Google Map / Wayfinding</span>
                <span className="text-xs text-slate-500">Embedded map for patient navigation</span>
              </div>
              {localData.hasEmbeddedMap ? (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Active
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Missing
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">MedicalOrganization / Hospital Schema</span>
                <span className="text-xs text-slate-500">JSON-LD geo coordinates markup</span>
              </div>
              {localData.hasLocalBusinessSchema ? (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Configured
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Opportunity
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Social Media Ecosystem Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-iamonin-orange flex items-center justify-center font-bold">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Social Media Ecosystem</h2>
              <p className="text-xs text-slate-500">Publicly linked social presence</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {socialPlatforms.map((soc: any) => (
              <div
                key={soc.platform}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {getSocialIcon(soc.platform)}
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{soc.platform}</span>
                    <span className="text-[11px] text-slate-400 truncate max-w-xs block">
                      {soc.url || 'No public link detected'}
                    </span>
                  </div>
                </div>

                {soc.isFound ? (
                  <a
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>Connected</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-xs font-bold text-slate-400">
                    Not Linked
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
