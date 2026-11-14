import React, { useState, useRef, useEffect } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { useHeaderNav } from '../../context/HeaderNavContext';
import {
  Settings,
  Save,
  Check,
  Video,
  Upload,
  Droplets,
  RefreshCw,
  Globe,
  ShieldCheck,
  Send,
  ExternalLink,
  Link2,
  Trash2,
  Plus,
  AlertCircle
} from 'lucide-react';
import { compressImageFile } from '../../utils/imageCompressor';
import { saveSiteConfig } from '../../utils/siteConfigStore';
import { uploadImageToSupabase, persistImageChange } from '../../services/imageSyncService';
import {
  submitUrlsToIndexNow,
  fetchIndexNowLogs,
  fetchIndexNowOutbox,
  fetchIndexNowServerStatus,
  processIndexNowQueue,
  triggerSiteRebuild,
  IndexNowLogRecord,
  IndexNowOutboxRecord,
  IndexNowServerStatus
} from '../../services/indexnowService';
import {
  fetchUrlRedirects,
  createSlugRedirect,
  deleteUrlRedirect,
  UrlRedirectRecord
} from '../../services/zoneContentService';
import { PageSeoOverride } from '../../types/siteConfig';
import { getProductionDomain } from '../../config/siteDomain';
import { DEFAULT_HOME_SEO_TITLE, DEFAULT_HOME_SEO_DESCRIPTION } from '../../seo/seoResolver';

interface SettingsTabProps {
  onGoToHeroVideo?: () => void;
}

const CORE_ROUTES = [
  { path: '/', label: 'Homepage (/)' },
  { path: '/services', label: 'All Services (/services)' },
  { path: '/services/water-tank-cleaning', label: 'Water Tank Cleaning' },
  { path: '/services/pipeline-cleaning', label: 'Water Pipeline Cleaning' },
  { path: '/service-areas', label: 'Service Areas Hub (/service-areas)' },
  { path: '/faq', label: 'FAQ & Q&A (/faq)' },
  { path: '/contact', label: 'Contact (/contact)' }
];

function extractMetaToken(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/content=["']([^"']+)["']/i);
  return match ? match[1].trim() : trimmed;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ onGoToHeroVideo }) => {
  const { config, business, hero, images, updateSiteImages } = useSiteConfig();
  const { headerConfig, saveHeader } = useHeaderNav();
  const activeSiteDomain = getProductionDomain();

  // Contact & Core Business
  const [phone, setPhone] = useState(business.phone);
  const [email, setEmail] = useState(business.email);
  const [address, setAddress] = useState(business.address);
  const [headlineBn, setHeadlineBn] = useState(hero.headingBn || 'ঢাকায় প্রফেশনাল ওয়াটার ট্যাংক ও পাইপলাইন পরিষ্কার সার্ভিস');

  // Google Business Profile
  const [gbpVerified, setGbpVerified] = useState(Boolean(business.gbpVerified));
  const [googleBusinessProfileUrl, setGoogleBusinessProfileUrl] = useState(business.googleBusinessProfileUrl || '');
  const [googleReviewsUrl, setGoogleReviewsUrl] = useState(business.googleReviewsUrl || '');
  const [googleMapsDirectionsUrl, setGoogleMapsDirectionsUrl] = useState(business.googleMapsDirectionsUrl || '');

  // Search Engine Verification
  const [googleSiteVerification, setGoogleSiteVerification] = useState(business.googleSiteVerification || '');
  const [bingSiteVerification, setBingSiteVerification] = useState(business.bingSiteVerification || '');

  // Global SEO, Open Graph & llms.txt
  const [defaultMetaTitle, setDefaultMetaTitle] = useState(config.seo?.defaultMetaTitle || DEFAULT_HOME_SEO_TITLE);
  const [defaultMetaDescription, setDefaultMetaDescription] = useState(config.seo?.defaultMetaDescription || DEFAULT_HOME_SEO_DESCRIPTION);
  const [socialOgImage, setSocialOgImage] = useState(config.seo?.socialOgImage || '');
  const [ogImageAlt, setOgImageAlt] = useState(config.seo?.ogImageAlt || 'SUNVILOZ CLEAN CARE — Water Tank & Pipeline Cleaning Service');
  const [llmsSummary, setLlmsSummary] = useState(config.seo?.llmsSummary || '');
  const [indexingAllowed, setIndexingAllowed] = useState(config.seo?.indexingAllowed !== false);

  // Per-Route SEO Overrides
  const [pageSeoOverrides, setPageSeoOverrides] = useState<Record<string, PageSeoOverride>>(config.seo?.pageSeoOverrides || {});
  const [selectedRoute, setSelectedRoute] = useState<string>('/');

  // IndexNow Settings & Logs
  const [indexNowEnabled, setIndexNowEnabled] = useState(config.seo?.indexNowEnabled !== false);
  const [indexNowServerStatus, setIndexNowServerStatus] = useState<IndexNowServerStatus | null>(null);
  const [manualPingUrls, setManualPingUrls] = useState(
    `${activeSiteDomain}/\n${activeSiteDomain}/services/water-tank-cleaning\n${activeSiteDomain}/service-areas`
  );
  const [pingingIndexNow, setPingingIndexNow] = useState(false);
  const [processingQueue, setProcessingQueue] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [rebuildMsg, setRebuildMsg] = useState('');
  const [indexNowMsg, setIndexNowMsg] = useState<string>('');
  const [indexNowLogs, setIndexNowLogs] = useState<IndexNowLogRecord[]>([]);
  const [indexNowOutbox, setIndexNowOutbox] = useState<IndexNowOutboxRecord[]>([]);

  // URL Redirects
  const [redirects, setRedirects] = useState<UrlRedirectRecord[]>([]);
  const [newFromPath, setNewFromPath] = useState('');
  const [newToPath, setNewToPath] = useState('');
  const [redirectMsg, setRedirectMsg] = useState('');

  // Save states
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoMessage, setLogoMessage] = useState('');
  const logoFileRef = useRef<HTMLInputElement>(null);

  const activeLogo = headerConfig.logoUrl || images?.logo || '';

  const loadTechnicalData = async () => {
    const [logs, outbox, redirs, status] = await Promise.all([
      fetchIndexNowLogs(20),
      fetchIndexNowOutbox(20),
      fetchUrlRedirects(),
      fetchIndexNowServerStatus()
    ]);
    setIndexNowLogs(logs);
    setIndexNowOutbox(outbox);
    setRedirects(redirs);
    setIndexNowServerStatus(status);
  };

  useEffect(() => {
    loadTechnicalData();
  }, []);

  const currentOverride: PageSeoOverride = pageSeoOverrides[selectedRoute] || {};

  const updateRouteOverride = (field: keyof PageSeoOverride, value: string | boolean) => {
    setPageSeoOverrides(prev => ({
      ...prev,
      [selectedRoute]: {
        ...(prev[selectedRoute] || {}),
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      const cleanGsc = extractMetaToken(googleSiteVerification);
      const cleanBing = extractMetaToken(bingSiteVerification);
      setGoogleSiteVerification(cleanGsc);
      setBingSiteVerification(cleanBing);

      const updatedConfig = {
        ...config,
        business: {
          ...config.business,
          phone,
          email,
          address,
          gbpVerified,
          googleBusinessProfileUrl: googleBusinessProfileUrl.trim(),
          googleReviewsUrl: googleReviewsUrl.trim(),
          googleMapsDirectionsUrl: googleMapsDirectionsUrl.trim(),
          googleSiteVerification: cleanGsc,
          bingSiteVerification: cleanBing
        },
        hero: {
          ...config.hero,
          headingBn: headlineBn
        },
        seo: {
          ...config.seo,
          defaultMetaTitle,
          defaultMetaDescription,
          canonicalBaseUrl: activeSiteDomain,
          indexingAllowed,
          socialOgImage: socialOgImage.trim(),
          ogImageAlt,
          llmsSummary,
          indexNowEnabled,
          indexNowKey: '',
          pageSeoOverrides
        }
      };

      const res = await saveSiteConfig(updatedConfig);
      if (!res.success) {
        setSaveError(res.error || 'ডাটাবেজে সেভ করতে সমস্যা হয়েছে।');
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err: any) {
      setSaveError(err?.message || 'ডাটাবেজ সংযোগে ত্রুটি দেখা দিয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualIndexNowPing = async () => {
    const urls = manualPingUrls
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (urls.length === 0) {
      setIndexNowMsg('কমপক্ষে একটি বৈধ পাবলিক URL লিখুন।');
      return;
    }

    setPingingIndexNow(true);
    setIndexNowMsg('');
    const res = await submitUrlsToIndexNow(urls, 'admin_manual_ping');
    setPingingIndexNow(false);
    setIndexNowMsg(res.message);
    await loadTechnicalData();
  };

  const handleProcessOutboxQueue = async () => {
    setProcessingQueue(true);
    setIndexNowMsg('');
    const res = await processIndexNowQueue();
    setProcessingQueue(false);
    setIndexNowMsg(res.message);
    await loadTechnicalData();
  };

  const handleTriggerRebuild = async () => {
    setRebuilding(true);
    setRebuildMsg('');
    const res = await triggerSiteRebuild();
    setRebuilding(false);
    setRebuildMsg(res.message);
  };

  const handleAddRedirect = async () => {
    if (!newFromPath.trim() || !newToPath.trim()) {
      setRedirectMsg('Source এবং Destination উভয় পাথ দিন।');
      return;
    }
    const res = await createSlugRedirect(newFromPath, newToPath, 301);
    if (res.success) {
      setNewFromPath('');
      setNewToPath('');
      setRedirectMsg('৩0১ রিডাইরেক্ট যুক্ত করা হয়েছে।');
      await loadTechnicalData();
    } else {
      setRedirectMsg(res.error || 'রিডাইরেক্ট যুক্ত করা যায়নি।');
    }
  };

  const handleDeleteRedirect = async (id: string) => {
    const ok = await deleteUrlRedirect(id);
    if (ok) {
      await loadTechnicalData();
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoMessage('Please select a PNG, SVG, JPG, or WebP image.');
      return;
    }

    setUploadingLogo(true);
    setLogoMessage('');

    try {
      const uploadRes = await uploadImageToSupabase(file, 'branding', 'logo');
      let targetLogoUrl = '';

      if (uploadRes.success && uploadRes.publicUrl) {
        targetLogoUrl = uploadRes.publicUrl;
      } else {
        targetLogoUrl = await compressImageFile(file, {
          maxWidth: 400,
          maxHeight: 400,
          quality: 0.9,
          preserveTransparency: true
        });
      }

      await saveHeader({ ...headerConfig, logoUrl: targetLogoUrl, logoEnabled: true });
      updateSiteImages({ logo: targetLogoUrl });
      await persistImageChange('siteConfig', 'logo', targetLogoUrl);

      setLogoMessage('Logo uploaded and permanently saved to Supabase!');
      setTimeout(() => setLogoMessage(''), 4000);
    } catch (err) {
      console.error('Logo upload error:', err);
      setLogoMessage('Failed to upload logo.');
      setTimeout(() => setLogoMessage(''), 4000);
    } finally {
      setUploadingLogo(false);
      if (logoFileRef.current) logoFileRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    await saveHeader({ ...headerConfig, logoUrl: '', logoEnabled: true });
    updateSiteImages({ logo: '' });
    await persistImageChange('siteConfig', 'logo', '');
    setLogoMessage('Logo removed. Default droplet icon restored.');
    setTimeout(() => setLogoMessage(''), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Header Save Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <span>Site General, SEO, GBP &amp; IndexNow Settings</span>
          </h2>
          <p className="text-xs text-slate-400">
            ব্যবসার যোগাযোগ, ভেরিফাইড Google Business Profile, Search Console / Bing ভেরিফিকেশন, Open Graph এবং IndexNow পিং পরিচালনা করুন।
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : saved ? (
              <Check className="w-4 h-4 text-emerald-300" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving to Database...' : saved ? 'Saved to Database!' : 'Save All Settings'}</span>
          </button>
          {saveError && (
            <span className="text-[11px] text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
              {saveError}
            </span>
          )}
        </div>
      </div>

      {/* Brand Logo Upload Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span>Brand Logo (ওয়েবসাইট লোগো)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload your company logo (PNG, SVG, or JPG). Transparent PNG or SVG is recommended.
            </p>
          </div>
          {logoMessage && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-800">
              {logoMessage}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
          <div className="w-24 h-24 rounded-2xl bg-slate-950 border-2 border-slate-700 p-2 flex items-center justify-center shrink-0">
            {activeLogo ? (
              <img
                src={activeLogo}
                alt="Brand Logo"
                className="max-w-full max-h-full object-contain"
                style={{ width: `${headerConfig.logoWidth || 40}px` }}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Droplets className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap gap-2">
              <input
                ref={logoFileRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoFileRef.current?.click()}
                disabled={uploadingLogo}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo File'}</span>
              </button>

              {activeLogo && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="px-3 py-2 bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-rose-900/30 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restore Default</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Display Width:</span>
              <div className="flex gap-1.5 font-mono">
                {[36, 40, 48, 56, 64].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => saveHeader({ ...headerConfig, logoWidth: size, logoHeight: size })}
                    className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                      (headerConfig.logoWidth || 40) === size
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Video Banner Link */}
      <div className="bg-blue-950/40 border border-blue-800/50 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-600 text-white">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Homepage Hero Video Settings</h4>
            <p className="text-xs text-blue-300">
              Customize full-width cleaning service background video, mobile video, poster, and overlay opacity.
            </p>
          </div>
        </div>
        {onGoToHeroVideo && (
          <button
            onClick={onGoToHeroVideo}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Customize Hero Video →
          </button>
        )}
      </div>

      {/* Contact & Hero Heading */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Contact Information</h3>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Hotline / Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Official Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Service City / Address Coverage</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Bengali Headline</h3>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Hero Main Heading (Bengali)</label>
            <input
              type="text"
              value={headlineBn}
              onChange={(e) => setHeadlineBn(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
            />
            <p className="text-[11px] text-slate-500 mt-1">Default: &quot;ঢাকায় প্রফেশনাল ওয়াটার ট্যাংক ও পাইপলাইন পরিষ্কার সার্ভিস&quot;</p>
          </div>
        </div>
      </div>

      {/* Google Business Profile (Gated on Verified Toggle) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Google Business Profile &amp; Reviews (শুধুমাত্র ভেরিফাইড হলে পাবলিক হবে)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              গুগল বিজনেস প্রোফাইল ক্লেইম ও ভেরিফাই হওয়ার পর নিচের সুইচটি চালু করুন—তা না হলে পাবলিক ফুটার/রিভিউতে কোনো অযাচাইকৃত Google লিংক দেখানো হবে না।
            </p>
          </div>

          <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-semibold text-white cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={gbpVerified}
              onChange={(e) => setGbpVerified(e.target.checked)}
            />
            <span>GBP Verified: {gbpVerified ? 'Active' : 'Off'}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Google Business Profile URL</label>
            <input
              type="url"
              value={googleBusinessProfileUrl}
              onChange={(e) => setGoogleBusinessProfileUrl(e.target.value)}
              placeholder="https://maps.google.com/?cid=..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Google Reviews URL</label>
            <input
              type="url"
              value={googleReviewsUrl}
              onChange={(e) => setGoogleReviewsUrl(e.target.value)}
              placeholder="https://g.page/r/.../review"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Google Maps Directions URL</label>
            <input
              type="url"
              value={googleMapsDirectionsUrl}
              onChange={(e) => setGoogleMapsDirectionsUrl(e.target.value)}
              placeholder="https://maps.google.com/?q=..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Search Console & Bing Webmaster Verification + Global OG */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Search Console, Bing Webmaster, Open Graph &amp; llms.txt Settings</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Google Search Console Verification Token (google-site-verification)
            </label>
            <input
              type="text"
              value={googleSiteVerification}
              onChange={(e) => setGoogleSiteVerification(e.target.value)}
              placeholder="টোকেন অথবা সম্পূর্ণ <meta name='google-site-verification' content='...'> পেস্ট করুন"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Bing Webmaster Verification Token (msvalidate.01)
            </label>
            <input
              type="text"
              value={bingSiteVerification}
              onChange={(e) => setBingSiteVerification(e.target.value)}
              placeholder="টোকেন অথবা সম্পূর্ণ <meta name='msvalidate.01' content='...'> পেস্ট করুন"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Default Meta Title</label>
            <input
              type="text"
              value={defaultMetaTitle}
              onChange={(e) => setDefaultMetaTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Default Social Share OG Image URL (1200x630 HTTPS)</label>
            <input
              type="url"
              value={socialOgImage}
              onChange={(e) => setSocialOgImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Default Meta Description</label>
            <textarea
              rows={2}
              value={defaultMetaDescription}
              onChange={(e) => setDefaultMetaDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Custom llms.txt Overview Note (ঐচ্ছিক)</label>
            <textarea
              rows={2}
              value={llmsSummary}
              onChange={(e) => setLlmsSummary(e.target.value)}
              placeholder="যদি llms.txt ফাইলে অতিরিক্ত সত্যনিষ্ঠ সারসংক্ষেপ দেখাতে চান..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={indexingAllowed}
                onChange={(e) => setIndexingAllowed(e.target.checked)}
              />
              <span>Allow Search Engine Indexing (index, follow)</span>
            </label>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>sitemap.xml</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>llms.txt</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Per-Route SEO & Open Graph Overrides Editor */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">Per-Route SEO &amp; Open Graph Overrides</h3>
            <p className="text-xs text-slate-400">গুরুত্বপূর্ণ পেজগুলোর Title, Description ও OG Image আলাদাভাবে নিয়ন্ত্রণ করুন (উপরে Save All Settings চাপুন)।</p>
          </div>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
          >
            {CORE_ROUTES.map(r => (
              <option key={r.path} value={r.path}>{r.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Route Meta Title ({selectedRoute})</label>
            <input
              type="text"
              value={currentOverride.title || ''}
              onChange={(e) => updateRouteOverride('title', e.target.value)}
              placeholder={selectedRoute === '/' ? `ডিফল্ট: ${DEFAULT_HOME_SEO_TITLE}` : 'খালি রাখলে ডিফল্ট পেজ টাইটেল থাকবে'}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Route OG Title</label>
            <input
              type="text"
              value={currentOverride.ogTitle || ''}
              onChange={(e) => updateRouteOverride('ogTitle', e.target.value)}
              placeholder={selectedRoute === '/' ? `ডিফল্ট: ${DEFAULT_HOME_SEO_TITLE}` : ''}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Route Meta Description</label>
            <textarea
              rows={2}
              value={currentOverride.description || ''}
              onChange={(e) => updateRouteOverride('description', e.target.value)}
              placeholder={selectedRoute === '/' ? `ডিফল্ট: ${DEFAULT_HOME_SEO_DESCRIPTION}` : ''}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Route OG Image URL</label>
            <input
              type="url"
              value={currentOverride.ogImage || ''}
              onChange={(e) => updateRouteOverride('ogImage', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* IndexNow Controls & Submission Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              <span>IndexNow Controls &amp; Submission Logs</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              IndexNow শুধু সার্চ ইঞ্জিনকে আপডেটের সংকেত পাঠায়; কোনো URL জমা দেওয়া মানে স্বয়ংক্রিয়ভাবে ইনডেক্স হওয়ার নিশ্চয়তা নয়।
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
            <input
              type="checkbox"
              checked={indexNowEnabled}
              onChange={(e) => setIndexNowEnabled(e.target.checked)}
            />
            <span>IndexNow Active</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className={`p-3 rounded-lg border text-xs ${
              indexNowServerStatus?.configured && indexNowServerStatus?.keyFileVerified
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                : indexNowServerStatus?.configured
                ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <div className="font-semibold text-white mb-0.5">
                Server INDEXNOW_KEY Status:{' '}
                {indexNowServerStatus === null
                  ? 'Checking...'
                  : indexNowServerStatus.configured && indexNowServerStatus.keyFileVerified
                  ? 'Configured & Verified'
                  : indexNowServerStatus.configured
                  ? 'Configured (Verification Pending)'
                  : 'Disabled (Not Configured)'}
              </div>
              <p className="text-[11px] opacity-90">
                {indexNowServerStatus?.message || 'সার্ভার স্ট্যাটাস লোড হচ্ছে...'}
              </p>
              {indexNowServerStatus?.verificationFilePath && (
                <p className="text-[11px] font-mono text-cyan-300 mt-1">
                  Verification File: {indexNowServerStatus.verificationFilePath}
                </p>
              )}
            </div>

            <div className={`p-3 rounded-lg border text-xs ${
              indexNowServerStatus?.scheduler?.automaticRetryActive
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <div className="font-semibold text-white mb-0.5">
                Automatic Outbox Retry Scheduler:{' '}
                {indexNowServerStatus === null
                  ? 'Checking...'
                  : indexNowServerStatus.scheduler?.automaticRetryActive
                  ? `Active (${indexNowServerStatus.scheduler.schedule || 'Scheduled'})`
                  : 'Inactive (Not Configured)'}
              </div>
              <p className="text-[11px] opacity-90">
                {indexNowServerStatus?.scheduler?.message ||
                  'স্বয়ংক্রিয় রিট্রাই স্ট্যাটাস যাচাই করতে সার্ভার শিডিউলার কনফিগারেশন প্রয়োজন।'}
              </p>
              {indexNowServerStatus?.scheduler?.lastRunAt && (
                <p className="text-[10px] font-mono text-slate-400 mt-1">
                  Last Cron Run: {new Date(indexNowServerStatus.scheduler.lastRunAt).toLocaleString()}
                </p>
              )}
            </div>

            <label className="block text-xs text-slate-400 pt-1">Canonical URLs to Ping (প্রতি লাইনে একটি)</label>
            <textarea
              rows={3}
              value={manualPingUrls}
              onChange={(e) => setManualPingUrls(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleManualIndexNowPing}
                disabled={
                  pingingIndexNow ||
                  !indexNowEnabled ||
                  (indexNowServerStatus !== null && !indexNowServerStatus.configured)
                }
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{pingingIndexNow ? 'Queuing & Sending...' : 'Send IndexNow Ping'}</span>
              </button>
              <button
                type="button"
                onClick={handleProcessOutboxQueue}
                disabled={processingQueue}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${processingQueue ? 'animate-spin' : ''}`} />
                <span>{processingQueue ? 'Processing Queue...' : 'Process Outbox Queue'}</span>
              </button>
              <button
                type="button"
                onClick={handleTriggerRebuild}
                disabled={rebuilding}
                className="px-3.5 py-2 bg-blue-600/80 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${rebuilding ? 'animate-spin' : ''}`} />
                <span>{rebuilding ? 'Triggering Rebuild...' : 'Trigger Static Rebuild'}</span>
              </button>
              {indexNowMsg && (
                <span className="text-xs text-amber-200 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{indexNowMsg}</span>
                </span>
              )}
              {rebuildMsg && (
                <span className="text-xs text-cyan-200 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{rebuildMsg}</span>
                </span>
              )}
            </div>

            {indexNowServerStatus?.outboxSummary && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1 text-[10px] font-mono">
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-center text-slate-300">
                  Queued: {indexNowServerStatus.outboxSummary.queued}
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-center text-cyan-300">
                  Active: {indexNowServerStatus.outboxSummary.processing}
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-center text-emerald-300">
                  Accepted: {indexNowServerStatus.outboxSummary.accepted}
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-center text-blue-300">
                  Sent: {indexNowServerStatus.outboxSummary.submitted}
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-center text-amber-300">
                  Retry: {indexNowServerStatus.outboxSummary.failed}
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-center text-rose-300">
                  Dead: {indexNowServerStatus.outboxSummary.dead_letter}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Outbox Queue ({indexNowOutbox.length})</span>
                <button
                  type="button"
                  onClick={loadTechnicalData}
                  className="text-xs text-cyan-400 hover:underline cursor-pointer"
                >
                  Refresh
                </button>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                {indexNowOutbox.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-3">আউটবক্সে কোনো অপেক্ষমাণ কাজ নেই।</div>
                ) : (
                  indexNowOutbox.map(item => (
                    <div key={item.id} className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white truncate">
                          {item.action} ({Array.isArray(item.urls) ? item.urls.length : 0} URL)
                        </div>
                        <div className="text-slate-400 truncate">
                          Try {item.attempts}/{item.max_attempts}
                          {item.last_http_status ? ` • HTTP ${item.last_http_status}` : ''}
                          {item.last_error ? ` • ${item.last_error}` : ''}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold shrink-0 ${
                        item.status === 'accepted' || item.status === 'submitted'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : item.status === 'queued' || item.status === 'processing'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : item.status === 'failed'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Recent Submissions ({indexNowLogs.length})</span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                {indexNowLogs.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-4">এখনো কোনো IndexNow সাবমিশন লগ নেই।</div>
                ) : (
                  indexNowLogs.map(log => (
                    <div key={log.id} className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white truncate">
                          {log.action} ({Array.isArray(log.urls) ? log.urls.length : 0} URL)
                        </div>
                        <div className="text-slate-400 truncate">
                          {new Date(log.created_at).toLocaleString()} {log.http_status ? `• HTTP ${log.http_status}` : ''}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold shrink-0 ${
                        log.status === 'Accepted' || log.status === 'Submitted'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : log.status === 'Pending'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* URL Redirects Manager */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Link2 className="w-4 h-4 text-blue-400" />
          <span>URL Redirects Manager (301/302 স্ল্যাগ রিডাইরেক্ট)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <input
            type="text"
            placeholder="From path (e.g. /old-area)"
            value={newFromPath}
            onChange={(e) => setNewFromPath(e.target.value)}
            className="sm:col-span-5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
          />
          <input
            type="text"
            placeholder="To path (e.g. /service-areas/uttara)"
            value={newToPath}
            onChange={(e) => setNewToPath(e.target.value)}
            className="sm:col-span-5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
          />
          <button
            type="button"
            onClick={handleAddRedirect}
            className="sm:col-span-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add 301</span>
          </button>
        </div>
        {redirectMsg && <p className="text-xs text-cyan-300">{redirectMsg}</p>}

        {redirects.length > 0 && (
          <div className="space-y-1.5 pt-2">
            {redirects.map(r => (
              <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <div className="font-mono text-slate-300 truncate">
                  <span className="text-blue-400">{r.fromPath}</span> → <span className="text-emerald-400">{r.toPath}</span> ({r.statusCode})
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteRedirect(r.id)}
                  className="p-1 text-rose-400 hover:bg-rose-950/60 rounded cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsTab;
