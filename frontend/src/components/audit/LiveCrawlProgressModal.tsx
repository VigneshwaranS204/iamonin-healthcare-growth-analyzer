import React, { useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Globe,
  Layers,
  Sparkles,
  Shield,
  FileCheck,
  Stethoscope,
  Users,
  Compass,
} from 'lucide-react';
import { CrawlProgressEvent } from '../../types';

interface LiveCrawlProgressModalProps {
  isOpen: boolean;
  auditId?: string;
  hospitalName: string;
  websiteUrl: string;
  onComplete: () => void;
}

export const LiveCrawlProgressModal: React.FC<LiveCrawlProgressModalProps> = ({
  isOpen,
  auditId,
  hospitalName,
  websiteUrl,
  onComplete,
}) => {
  const [currentEvent, setCurrentEvent] = useState<CrawlProgressEvent>({
    step: 'VALIDATING',
    message: 'Initializing security checks and URL validation...',
    pagesCrawled: 0,
    totalPagesDiscovered: 1,
    progressPercent: 5,
  });

  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen || !auditId) return;

    const sseBase = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : '/api';
    const eventSource = new EventSource(`${sseBase}/audits/${auditId}/progress`);

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.step && data.step !== 'CONNECTED') {
          setCurrentEvent(data);
          setLogs((prev) => [
            `[${new Date().toLocaleTimeString()}] ${data.message || data.step}`,
            ...prev.slice(0, 15),
          ]);

          if (data.step === 'COMPLETED') {
            setTimeout(() => {
              eventSource.close();
              onComplete();
            }, 1200);
          }
        }
      } catch {
        // ignore parse error
      }
    };

    eventSource.onerror = () => {
      // Fallback polling if SSE closes or disconnects
      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/audits/${auditId}`);
          const audit = await res.json();
          if (audit.status === 'COMPLETED') {
            clearInterval(pollInterval);
            eventSource.close();
            onComplete();
          }
        } catch {
          // ignore
        }
      }, 2500);

      return () => clearInterval(pollInterval);
    };

    return () => {
      eventSource.close();
    };
  }, [isOpen, auditId, onComplete]);

  if (!isOpen) return null;

  const stages = [
    { key: 'VALIDATING', label: 'Security & Robots.txt', icon: Shield },
    { key: 'SITEMAP_DISCOVERY', label: 'Sitemap Discovery', icon: Globe },
    { key: 'CRAWLING_PAGES', label: 'Website Crawl', icon: Layers },
    { key: 'TECHNICAL_ANALYSIS', label: 'Technical & SEO Rules', icon: FileCheck },
    { key: 'HEALTHCARE_ANALYSIS', label: 'Healthcare Specialties', icon: Stethoscope },
    { key: 'DOCTOR_ANALYSIS', label: 'Doctor Authority', icon: Users },
    { key: 'JOURNEY_ANALYSIS', label: 'Patient Conversion Journey', icon: Compass },
    { key: 'PREPARING_REPORT', label: 'Audit & Outreach Generation', icon: Sparkles },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 text-iamonin-orange mx-auto flex items-center justify-center mb-3 shadow-md shadow-orange-500/10">
            <Activity className="w-8 h-8 animate-pulse text-iamonin-orange" />
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-iamonin-orange">
            Live Website Analysis In Progress
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            {hospitalName}
          </h2>
          <p className="text-xs text-slate-500 truncate max-w-md mx-auto mt-0.5">
            {websiteUrl}
          </p>
        </div>

        {/* Big Progress Bar */}
        <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span>{currentEvent.message}</span>
            <span className="text-iamonin-orange font-extrabold">{currentEvent.progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-iamonin-orange to-orange-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(5, currentEvent.progressPercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mt-3 pt-3 border-t border-slate-200/60">
            <span>Pages Crawled: <strong className="text-slate-800">{currentEvent.pagesCrawled}</strong></span>
            <span>Discovered URLs: <strong className="text-slate-800">{currentEvent.totalPagesDiscovered}</strong></span>
            <span className="truncate max-w-[200px] text-slate-400">
              {currentEvent.currentUrl ? currentEvent.currentUrl.replace(/^https?:\/\//, '') : 'Analyzing...'}
            </span>
          </div>
        </div>

        {/* Checklist Steps */}
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          {stages.map((st, idx) => {
            const Icon = st.icon;
            const isFinished = currentEvent.progressPercent >= (idx + 1) * 12;
            const isCurrent =
              currentEvent.step === st.key ||
              (currentEvent.progressPercent >= idx * 12 && currentEvent.progressPercent < (idx + 1) * 12);

            return (
              <div
                key={st.key}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-colors ${
                  isFinished
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                    : isCurrent
                    ? 'bg-orange-50 border-orange-300 text-orange-900 font-bold shadow-sm'
                    : 'bg-slate-50/50 border-slate-100 text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                    isFinished
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-iamonin-orange text-white animate-pulse'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isFinished ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-semibold truncate">{st.label}</span>
              </div>
            );
          })}
        </div>

        {/* Live Event Stream Log */}
        <div className="bg-slate-900 text-slate-300 rounded-xl p-3 text-[11px] font-mono h-24 overflow-y-auto space-y-1">
          <div className="text-slate-500 font-bold mb-1">▶ AUDIT EXECUTION LOG</div>
          {logs.map((log, idx) => (
            <div key={idx} className={idx === 0 ? 'text-orange-400 font-bold' : 'text-slate-400'}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
