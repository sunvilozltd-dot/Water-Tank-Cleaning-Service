import React, { useState } from 'react';
import { useTracking } from '../../context/TrackingContext';
import { BarChart3, Save, Check, Shield } from 'lucide-react';

export const TrackingTab: React.FC = () => {
  const { settings, updateSettings, loading } = useTracking();
  const [metaPixelId, setMetaPixelId] = useState(settings?.metaPixelId || '');
  const [ga4Id, setGa4Id] = useState(settings?.ga4MeasurementId || '');
  const [gtmId, setGtmId] = useState(settings?.googleTagManagerId || '');
  const [metaEnabled, setMetaEnabled] = useState(settings?.metaEnabled || false);
  const [ga4Enabled, setGa4Enabled] = useState(settings?.googleAnalyticsEnabled || false);
  const [gtmEnabled, setGtmEnabled] = useState(settings?.gtmEnabled || false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await updateSettings({
      metaPixelId,
      ga4MeasurementId: ga4Id,
      googleTagManagerId: gtmId,
      metaEnabled,
      googleAnalyticsEnabled: ga4Enabled,
      gtmEnabled
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>Tracking, Analytics &amp; Conversion Pixels</span>
          </h2>
          <p className="text-xs text-slate-400">Configure Meta Pixel, Google Analytics 4, and GTM for ad campaign tracking.</p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Saved!' : 'Save Tracking'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Meta Pixel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Meta Pixel (Facebook Ads)</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={metaEnabled}
                onChange={(e) => setMetaEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Pixel ID</label>
            <input
              type="text"
              value={metaPixelId}
              onChange={(e) => setMetaPixelId(e.target.value)}
              placeholder="e.g. 1234567890123456"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
            />
          </div>
        </div>

        {/* Google Analytics 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Google Analytics 4 (GA4)</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={ga4Enabled}
                onChange={(e) => setGa4Enabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Measurement ID</label>
            <input
              type="text"
              value={ga4Id}
              onChange={(e) => setGa4Id(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
