import React from 'react';
import { Plus, Activity, Settings, Building2, BarChart3, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  currentView: 'dashboard' | 'audit_detail' | 'settings';
  onNavigate: (view: 'dashboard' | 'settings') => void;
  onOpenNewAudit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenNewAudit,
}) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-iamonin-orange to-iamonin-orange-hover flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">
                    IAMONIN
                  </span>
                  <span className="bg-orange-100 text-iamonin-orange text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Healthcare
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium tracking-wide">
                  Growth & Audit Engine
                </p>
              </div>
            </button>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  currentView === 'dashboard' || currentView === 'audit_detail'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-slate-500" />
                Dashboard
              </button>

              <button
                onClick={() => onNavigate('settings')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  currentView === 'settings'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Settings className="w-4 h-4 text-slate-500" />
                Config & Dictionaries
              </button>
            </nav>
          </div>

          {/* Right Action & User Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewAudit}
              className="flex items-center gap-2 bg-iamonin-orange hover:bg-iamonin-orange-hover text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm shadow-orange-500/30 hover:shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Hospital Audit</span>
            </button>

            <div className="hidden sm:flex items-center pl-3 border-l border-slate-200 gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'IA'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.name || 'Sales Consultant'}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  IAMONIN Engine Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
