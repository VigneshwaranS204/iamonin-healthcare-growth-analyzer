import React, { useEffect, useState } from 'react';
import { Settings, Plus, BookOpen, Stethoscope, Users, Zap, Shield, Save, Check } from 'lucide-react';
import { api } from '../../services/api';

export const DictionarySettings: React.FC = () => {
  const [settingsData, setSettingsData] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<'specialties' | 'doctorTerms' | 'doctorQualifications' | 'ctaTerms' | 'emergencyTerms'>('specialties');
  const [newKeyword, setNewKeyword] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getSettings().then((data) => setSettingsData(data)).catch(() => {});
  }, []);

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    setIsAdding(true);
    try {
      const categoryMapping: Record<string, string> = {
        specialties: 'SPECIALTY',
        doctorTerms: 'DOCTOR_TERM',
        doctorQualifications: 'DOCTOR_TERM',
        ctaTerms: 'CTA_TERM',
        emergencyTerms: 'EMERGENCY_TERM',
      };

      await api.addDictionaryItem({
        category: categoryMapping[activeCategory] || 'SPECIALTY',
        keyword: newKeyword.trim(),
      });

      setNewKeyword('');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);

      // Refresh
      const updated = await api.getSettings();
      setSettingsData(updated);
    } catch {
      // ignore
    } finally {
      setIsAdding(false);
    }
  };

  const getActiveList = (): any[] => {
    if (!settingsData?.defaultDictionaries) return [];
    return settingsData.defaultDictionaries[activeCategory] || [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-iamonin-orange flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Crawler Settings & Healthcare Dictionaries
            </h1>
            <p className="text-xs text-slate-500">
              Configure medical taxonomies, keyword weights, and crawler limits
            </p>
          </div>
        </div>
      </div>

      {/* Crawl Engine Parameters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-extrabold text-slate-900">Crawler Bounds & Request Limits</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-slate-500 block mb-1 font-semibold">MAX_PAGES</span>
            <span className="text-lg font-bold text-slate-900">{settingsData?.crawlConfig?.maxPages || 100}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Pages limit per hospital</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-slate-500 block mb-1 font-semibold">MAX_DEPTH</span>
            <span className="text-lg font-bold text-slate-900">{settingsData?.crawlConfig?.maxDepth || 4}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Max BFS click depth</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-slate-500 block mb-1 font-semibold">REQUEST_DELAY</span>
            <span className="text-lg font-bold text-slate-900">{settingsData?.crawlConfig?.requestDelayMs || 200} ms</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Polite crawl throttling</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-slate-500 block mb-1 font-semibold">TIMEOUT</span>
            <span className="text-lg font-bold text-slate-900">{(settingsData?.crawlConfig?.timeoutMs || 15000) / 1000} s</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Max HTTP timeout</span>
          </div>
        </div>
      </div>

      {/* Healthcare Dictionaries */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-5">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900">Configurable Healthcare Dictionaries</h2>
          <p className="text-xs text-slate-500">Taxonomies used to identify clinical departments, doctors, and CTAs</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'specialties', label: 'Clinical Specialties (25+)', icon: Stethoscope },
            { key: 'doctorQualifications', label: 'Doctor Qualifications', icon: Users },
            { key: 'ctaTerms', label: 'CTA & Booking Keywords', icon: Zap },
            { key: 'emergencyTerms', label: 'Emergency Terminology', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeCategory === tab.key
                  ? 'bg-iamonin-orange text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Add keyword form */}
        <form onSubmit={handleAddKeyword} className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder={`Add new keyword to ${activeCategory}...`}
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-iamonin-orange/50"
          />
          <button
            type="submit"
            disabled={isAdding || !newKeyword.trim()}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Term</span>
          </button>
        </form>

        {savedSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>Dictionary term successfully added!</span>
          </div>
        )}

        {/* Keywords Chips */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap gap-2 max-h-72 overflow-y-auto">
          {getActiveList().map((item: any, idx: number) => {
            const label = typeof item === 'string' ? item : item.name || item.keyword;
            return (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs"
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
