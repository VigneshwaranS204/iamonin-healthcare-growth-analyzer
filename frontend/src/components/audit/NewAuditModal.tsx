import React, { useState } from 'react';
import { X, Globe, Building2, MapPin, Share2, User, ChevronDown, ChevronUp, Sparkles, Shield } from 'lucide-react';

interface NewAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const NewAuditModal: React.FC<NewAuditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [location, setLocation] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Optional Socials & Maps
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Optional Contact Info
  const [contactName, setContactName] = useState('');
  const [contactDesignation, setContactDesignation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Crawl limits
  const [maxPages, setMaxPages] = useState(50);
  const [maxDepth, setMaxDepth] = useState(3);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

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

    onSubmit({
      hospitalName: inferredName,
      websiteUrl: url.trim(),
      location: location.trim() || 'Metro Area',
      googleMapsUrl: googleMapsUrl.trim() || undefined,
      instagramUrl: instagramUrl.trim() || undefined,
      facebookUrl: facebookUrl.trim() || undefined,
      youtubeUrl: youtubeUrl.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
      contactName: contactName.trim() || undefined,
      contactDesignation: contactDesignation.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      maxPages: Number(maxPages) || 50,
      maxDepth: Number(maxDepth) || 3,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-iamonin-orange text-white flex items-center justify-center shadow-md shadow-orange-500/20 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">New Hospital Growth Audit</h2>
              <p className="text-xs text-slate-500">Configure target hospital for full analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Main URL Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Hospital Website URL <span className="text-iamonin-orange">*</span>
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://apollohospitals.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-iamonin-orange/50 focus:border-iamonin-orange"
              />
            </div>
          </div>

          {/* Hospital Name & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hospital Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apollo Super Specialty"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-iamonin-orange/50 focus:border-iamonin-orange"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location (City / State)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Chennai, Tamil Nadu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-iamonin-orange/50 focus:border-iamonin-orange"
                />
              </div>
            </div>
          </div>

          {/* Toggle Advanced / Optional fields */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-iamonin-orange transition-colors"
            >
              <span>Optional Social Channels, Contacts & Limits</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showAdvanced && (
            <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-200/80 animate-in fade-in duration-100">
              <p className="text-xs font-bold text-slate-700">Target Contact Information (For Outreach)</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Doctor/Director Name"
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
                <input
                  type="text"
                  value={contactDesignation}
                  onChange={(e) => setContactDesignation(e.target.value)}
                  placeholder="Designation (e.g. Medical Director)"
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Contact Email"
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="WhatsApp / Phone"
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <p className="text-xs font-bold text-slate-700 pt-1">Crawl Boundaries</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Max Pages (10-100)</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={maxPages}
                    onChange={(e) => setMaxPages(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Max Depth (1-4)</label>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={maxDepth}
                    onChange={(e) => setMaxDepth(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-6 py-2.5 rounded-xl bg-iamonin-orange hover:bg-iamonin-orange-hover text-white font-bold text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all disabled:bg-slate-400 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>START ANALYSIS</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
