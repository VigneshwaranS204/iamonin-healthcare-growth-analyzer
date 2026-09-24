import React, { useState } from 'react';
import { Search, Globe, MapPin, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

interface QuickAuditFormProps {
  onStartAudit: (data: { hospitalName: string; websiteUrl: string; location: string }) => void;
  isLoading?: boolean;
}

export const QuickAuditForm: React.FC<QuickAuditFormProps> = ({ onStartAudit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Auto-infer hospital name from domain if name left blank
    let inferredName = name.trim();
    if (!inferredName) {
      try {
        const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
        inferredName = parsed.hostname.replace(/^www\./, '').split('.')[0];
        inferredName = inferredName.charAt(0).toUpperCase() + inferredName.slice(1) + ' Hospital';
      } catch {
        inferredName = 'Hospital Target';
      }
    }

    onStartAudit({
      websiteUrl: url.trim(),
      hospitalName: inferredName,
      location: location.trim() || 'Metro Area',
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 shadow-premium border border-slate-700/50">
      {/* Background glow accents */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-iamonin-orange/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>IAMONIN HEALTHCARE GROWTH AUDITOR</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
          Prospect & Audit Any Hospital Website in Seconds
        </h1>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Non-invasive public crawler extracting technical SEO, 25+ medical specialties, doctor authority, and patient conversion friction. 100% self-contained analysis with personalized sales outreach.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-0 sm:flex sm:gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter Hospital Website URL (e.g., apollohospitals.com)"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-iamonin-orange focus:border-transparent transition-all"
            />
          </div>

          <div className="relative sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City / Location"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-iamonin-orange focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-iamonin-orange hover:bg-iamonin-orange-hover disabled:bg-slate-700 text-white font-bold text-sm shadow-md shadow-orange-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Crawling...</span>
              </>
            ) : (
              <>
                <span>Start Audit</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            SSRF Protected Crawler
          </span>
          <span>•</span>
          <span>Robots.txt & Sitemap Engine</span>
          <span>•</span>
          <span>Deterministic Opportunity Mapping</span>
        </div>
      </div>
    </div>
  );
};
