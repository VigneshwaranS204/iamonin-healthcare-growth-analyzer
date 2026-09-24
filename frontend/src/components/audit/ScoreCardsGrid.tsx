import React from 'react';
import {
  ShieldCheck,
  Search,
  Stethoscope,
  Users,
  Compass,
  Zap,
  MapPin,
  FileText,
} from 'lucide-react';
import { FullAuditDetail } from '../../types';

interface ScoreCardsGridProps {
  audit: FullAuditDetail;
}

export const ScoreCardsGrid: React.FC<ScoreCardsGridProps> = ({ audit }) => {
  let parsedScores: any = {};
  try {
    if (audit.scoresJson) {
      parsedScores = JSON.parse(audit.scoresJson);
    }
  } catch {
    // fallback
  }

  const scoreItems = [
    {
      key: 'tech',
      title: 'Technical Health',
      score: audit.technicalHealthScore ?? parsedScores.technicalHealth?.score ?? 0,
      grade: parsedScores.technicalHealth?.grade ?? 'B',
      status: parsedScores.technicalHealth?.status ?? 'GOOD',
      icon: ShieldCheck,
      description: 'HTTPS, mobile viewport, clean asset protocols & 0 broken pages',
    },
    {
      key: 'seo',
      title: 'SEO Readiness',
      score: audit.seoReadinessScore ?? parsedScores.seoReadiness?.score ?? 0,
      grade: parsedScores.seoReadiness?.grade ?? 'C',
      status: parsedScores.seoReadiness?.status ?? 'NEEDS_ATTENTION',
      icon: Search,
      description: 'Titles, meta coverage, H1 hierarchy, sitemaps & canonical tags',
    },
    {
      key: 'hc',
      title: 'Healthcare Structure',
      score: audit.healthcareContentScore ?? parsedScores.healthcareContent?.score ?? 0,
      grade: parsedScores.healthcareContent?.grade ?? 'C',
      status: parsedScores.healthcareContent?.status ?? 'NEEDS_ATTENTION',
      icon: Stethoscope,
      description: 'Clinical specialties, 24/7 emergency, health packages & insurance',
    },
    {
      key: 'doc',
      title: 'Doctor Authority',
      score: audit.doctorAuthorityScore ?? parsedScores.doctorAuthority?.score ?? 0,
      grade: parsedScores.doctorAuthority?.grade ?? 'D',
      status: parsedScores.doctorAuthority?.status ?? 'CRITICAL_GAPS',
      icon: Users,
      description: 'Physician profiles, qualifications, doctor CTAs & schema markup',
    },
    {
      key: 'journey',
      title: 'Patient Journey',
      score: audit.patientJourneyScore ?? parsedScores.patientJourney?.score ?? 0,
      grade: parsedScores.patientJourney?.grade ?? 'D',
      status: parsedScores.patientJourney?.status ?? 'CRITICAL_GAPS',
      icon: Compass,
      description: '6-stage patient discovery funnel from landing to appointment',
    },
    {
      key: 'conv',
      title: 'Conversion Readiness',
      score: audit.conversionReadinessScore ?? parsedScores.conversionReadiness?.score ?? 0,
      grade: parsedScores.conversionReadiness?.grade ?? 'D',
      status: parsedScores.conversionReadiness?.status ?? 'CRITICAL_GAPS',
      icon: Zap,
      description: 'WhatsApp consultation desk, click-to-call & booking CTA density',
    },
    {
      key: 'local',
      title: 'Local Presence',
      score: audit.localPresenceScore ?? parsedScores.localPresence?.score ?? 0,
      grade: parsedScores.localPresence?.grade ?? 'B',
      status: parsedScores.localPresence?.status ?? 'GOOD',
      icon: MapPin,
      description: 'NAP signals, embedded Google maps & MedicalOrganization schema',
    },
    {
      key: 'content',
      title: 'Content Depth',
      score: audit.contentOpportunityScore ?? parsedScores.contentOpportunity?.score ?? 0,
      grade: parsedScores.contentOpportunity?.grade ?? 'C',
      status: parsedScores.contentOpportunity?.status ?? 'NEEDS_ATTENTION',
      icon: FileText,
      description: 'Clinical procedure depth, patient FAQs & health education library',
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 65) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-iamonin-orange bg-orange-50 border-orange-200';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 65) return 'bg-blue-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-iamonin-orange';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {scoreItems.map((item) => {
        const Icon = item.icon;
        const colorClass = getScoreColor(item.score);
        const progressClass = getProgressColor(item.score);

        return (
          <div
            key={item.key}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-subtle flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">{item.title}</span>
                </div>
                <span className={`text-xs font-black px-2 py-0.5 rounded-md border ${colorClass}`}>
                  {item.grade}
                </span>
              </div>

              <div className="flex items-baseline gap-1 my-2">
                <span className="text-2xl font-black text-slate-900">{item.score}</span>
                <span className="text-xs text-slate-400 font-bold">/100</span>
              </div>

              {/* Progress track */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progressClass}`}
                  style={{ width: `${Math.max(4, item.score)}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-tight line-clamp-2 mt-1">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};
