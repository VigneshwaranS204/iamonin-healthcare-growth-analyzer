import React from 'react';
import { Building2, CheckCircle2, Clock, Flame, FileText, Send } from 'lucide-react';
import { DashboardStats } from '../../types';

interface StatCardsProps {
  stats?: DashboardStats['kpis'];
}

export const StatCards: React.FC<StatCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Hospitals',
      value: stats?.totalHospitals ?? 0,
      icon: Building2,
      color: 'text-slate-700',
      bg: 'bg-slate-100',
      border: 'border-slate-200',
    },
    {
      title: 'Audits Completed',
      value: stats?.completedAudits ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      title: 'Audits In Progress',
      value: stats?.inProgressAudits ?? 0,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      title: 'High Opportunity Leads',
      value: stats?.highOpportunityCount ?? 0,
      icon: Flame,
      color: 'text-iamonin-orange',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      highlight: true,
    },
    {
      title: 'Reports Ready',
      value: stats?.reportsCount ?? 0,
      icon: FileText,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
    },
    {
      title: 'Outreach Generated',
      value: stats?.outreachCount ?? 0,
      icon: Send,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-xl border bg-white shadow-subtle flex flex-col justify-between transition-all hover:shadow-md ${card.border}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">{card.title}</span>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-extrabold tracking-tight ${card.highlight ? 'text-iamonin-orange' : 'text-slate-900'}`}>
                  {card.value}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
