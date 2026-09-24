import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Mail,
  Linkedin,
  MessageSquare,
  PhoneCall,
  Sparkles,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { FullAuditDetail } from '../../types';
import { api } from '../../services/api';

interface OutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  audit: FullAuditDetail;
}

export const OutreachModal: React.FC<OutreachModalProps> = ({
  isOpen,
  onClose,
  audit,
}) => {
  const [activeChannel, setActiveChannel] = useState<'EMAIL' | 'LINKEDIN' | 'WHATSAPP' | 'CALL_SCRIPT'>('EMAIL');
  const [copied, setCopied] = useState(false);
  const [customContact, setCustomContact] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [localOutreaches, setLocalOutreaches] = useState(audit.outreaches || []);

  if (!isOpen) return null;

  const currentOutreach = localOutreaches.find((o) => o.channel === activeChannel) || {
    subject: `Digital growth observations for ${audit.hospital.name}`,
    content: `Hi,\n\nWe completed a review of ${audit.hospital.name}'s digital presence...`,
  };

  const handleCopy = () => {
    const textToCopy = currentOutreach.subject
      ? `Subject: ${currentOutreach.subject}\n\n${currentOutreach.content}`
      : currentOutreach.content;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await api.regenerateOutreach(audit.id, customContact.trim() || undefined);
      if (res.outreaches) {
        setLocalOutreaches(res.outreaches);
      }
    } catch {
      // ignore
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Personalized Healthcare Sales Outreach
              </h2>
              <p className="text-xs text-slate-500">
                Grounded strictly in actual detected audit findings for {audit.hospital.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Selection Tabs */}
        <div className="px-6 pt-4 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          {[
            { key: 'EMAIL', label: 'Email Outreach', icon: Mail },
            { key: 'LINKEDIN', label: 'LinkedIn Message', icon: Linkedin },
            { key: 'WHATSAPP', label: 'WhatsApp Message', icon: MessageSquare },
            { key: 'CALL_SCRIPT', label: 'Phone Script', icon: PhoneCall },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeChannel === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveChannel(tab.key as any)}
                className={`pb-3 px-3 border-b-2 text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4">
          {/* Optional recipient customizer */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customContact}
              onChange={(e) => setCustomContact(e.target.value)}
              placeholder="Recipient name (e.g. Dr. Ramesh Sharma)"
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Personalize</span>
            </button>
          </div>

          {/* Subject Line if exists */}
          {currentOutreach.subject && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Subject</span>
              <span className="text-xs font-bold text-slate-900">{currentOutreach.subject}</span>
            </div>
          )}

          {/* Message Content Body */}
          <div className="relative">
            <textarea
              readOnly
              rows={9}
              value={currentOutreach.content}
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-800 font-sans leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-slate-300"
            />

            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Outreach copy contains zero fabricated claims and strictly references observed website evidence.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
