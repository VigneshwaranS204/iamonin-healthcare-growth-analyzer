import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-bold text-slate-700">IAMONIN Healthcare Growth Analyzer</span>
          <span>•</span>
          <span>Proprietary Rule-Based Growth & Prospecting System</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Self-Contained Crawler (No Third-Party APIs)</span>
          </div>
          <span>•</span>
          <span>v1.0 Production Ready</span>
        </div>
      </div>
    </footer>
  );
};
