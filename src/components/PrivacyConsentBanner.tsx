import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Settings2 } from 'lucide-react';
import { useTracking } from '../context/TrackingContext';

export const PrivacyConsentBanner: React.FC = () => {
  const { settings, consent, updateConsent } = useTracking();
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(consent.analytics);
  const [marketingAllowed, setMarketingAllowed] = useState(consent.marketing);

  useEffect(() => {
    // Only show if consent is required by admin and user hasn't explicitly set preferences yet
    if (settings.consentRequired && !consent.timestamp) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [settings.consentRequired, consent.timestamp]);

  if (!isOpen) return null;

  const handleAcceptAll = () => {
    updateConsent({ analytics: true, marketing: true });
    setIsOpen(false);
  };

  const handleDeclineNonEssential = () => {
    updateConsent({ analytics: false, marketing: false });
    setIsOpen(false);
  };

  const handleSaveCustom = () => {
    updateConsent({ analytics: analyticsAllowed, marketing: marketingAllowed });
    setIsOpen(false);
  };

  return (
    <aside 
      className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 bg-slate-900/95 text-white p-5 rounded-3xl shadow-2xl border border-slate-700/80 backdrop-blur-md animate-scaleUp text-xs"
      role="region"
      aria-label="Cookie and Privacy Consent"
    >
      <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
          <h3 className="font-extrabold text-sm text-slate-100">
            {settings.consentBannerTitle || 'We value your privacy & water safety'}
          </h3>
        </div>
        <button
          type="button"
          onClick={handleDeclineNonEssential}
          className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-slate-300 text-[11px] leading-relaxed pt-2">
        {settings.consentBannerDesc || 'We use cookies and telemetry to improve your booking experience, measure site performance, and protect customer communications.'}
      </p>

      {/* Advanced Preferences Panel */}
      {showPreferences && (
        <div className="mt-3 p-3 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200">Necessary (Website & Security)</span>
            <span className="text-emerald-400 font-bold text-[10px]">Always Active</span>
          </div>
          <label className="flex items-center justify-between cursor-pointer pt-1 border-t border-slate-900">
            <span className="font-bold text-slate-300">Analytics (Google Analytics 4)</span>
            <input
              type="checkbox"
              checked={analyticsAllowed}
              onChange={e => setAnalyticsAllowed(e.target.checked)}
              className="rounded text-cyan-500 w-4 h-4"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer pt-1 border-t border-slate-900">
            <span className="font-bold text-slate-300">Marketing (Meta Pixel & Conversion Ads)</span>
            <input
              type="checkbox"
              checked={marketingAllowed}
              onChange={e => setMarketingAllowed(e.target.checked)}
              className="rounded text-cyan-500 w-4 h-4"
            />
          </label>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setShowPreferences(!showPreferences)}
          className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>{showPreferences ? 'Hide Options' : 'Customize Options'}</span>
        </button>

        <div className="flex items-center gap-2 ml-auto">
          {showPreferences ? (
            <button
              type="button"
              onClick={handleSaveCustom}
              className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl cursor-pointer"
            >
              Save Preferences
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleDeclineNonEssential}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl cursor-pointer shadow-sm"
              >
                Accept All
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
