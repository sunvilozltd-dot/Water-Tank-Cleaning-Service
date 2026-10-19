import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Sliders, 
  Check, 
  Play, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  AlertCircle, 
  FileVideo, 
  ImageIcon, 
  Sparkles, 
  Layers, 
  Save, 
  Smartphone, 
  Monitor, 
  HelpCircle,
  FolderOpen,
  Camera,
  CheckCircle2,
  X
} from 'lucide-react';
import { useHomepageCms } from '../../context/HomepageCmsContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { HomepageSection } from '../../types/homepageCms';
import { updateHeroVideoConfig } from '../../utils/siteConfigStore';
import { uploadMediaItem, extractYouTubeId } from '../../services/mediaService';
import { recordAuditLog } from '../../services/auditService';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { WebsiteImagesTab } from './WebsiteImagesTab';
import { 
  getSpecialOffers, 
  saveSpecialOffers, 
  SpecialOfferItem, 
  DEFAULT_SPECIAL_OFFERS 
} from '../../utils/specialOffersStore';

export const HomepageCmsTab: React.FC = () => {
  const { sections, updateSection, saveAllSections, loading: cmsLoading } = useHomepageCms();
  const { hero, refreshConfig } = useSiteConfig();
  const { adminUser } = useAdminAuth();

  // Active subpath: Hero Video, Running Special Offers, Website Images, Preview
  const [activeSubSection, setActiveSubSection] = useState<'hero' | 'offers' | 'images' | 'preview'>('hero');
  const [offersList, setOffersList] = useState<SpecialOfferItem[]>(() => getSpecialOffers());
  const [newOfferBn, setNewOfferBn] = useState('');
  const [newOfferEn, setNewOfferEn] = useState('');
  const [newOfferBadgeBn, setNewOfferBadgeBn] = useState('');
  const [newOfferBadgeEn, setNewOfferBadgeEn] = useState('');
  const [newOfferLink, setNewOfferLink] = useState('/water-tank-cleaning-service');
  const [offersSaved, setOffersSaved] = useState(false);

  // Find existing hero section from CMS or fallback to default
  const heroSection = sections.find(s => s.sectionKey === 'hero') || {
    id: 'hero',
    sectionKey: 'hero',
    title: 'Professional Water Tank Cleaning Service in Dhaka',
    titleBn: 'ঢাকায় প্রফেশনাল ওয়াটার ট্যাংক ক্লিনিং সার্ভিস',
    subtitle: 'Regular water tank and pipeline cleaning is essential for hygienic, safe water. Share your tank details — our team will review and provide a tailored quotation.',
    subtitleBn: 'নিয়মিত পানির ট্যাংক পরিষ্কার রাখা আপনার ও পরিবারের সুস্থতার জন্য জরুরি। আপনার ট্যাংকের তথ্য জানিয়ে রিকোয়েস্ট করুন, আমাদের টিম সঠিক কোটেশন প্রদান করবে।',
    isEnabled: true,
    order: 0,
    videoUrl: '/videos/tank-cleaning-desktop.mp4',
    mobileVideoUrl: '/videos/tank-cleaning-mobile.mp4',
    posterImageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
    settings: {
      videoEnabled: true,
      overlayOpacity: 0.72,
      overlayColor: 'navy'
    }
  } as HomepageSection;

  // Local state for Hero Video Form
  const [videoEnabled, setVideoEnabled] = useState<boolean>(
    heroSection.settings?.videoEnabled ?? hero.videoEnabled ?? true
  );
  const [desktopVideoUrl, setDesktopVideoUrl] = useState<string>(
    heroSection.videoUrl || hero.videoUrl || '/videos/tank-cleaning-desktop.mp4'
  );
  const [mobileVideoUrl, setMobileVideoUrl] = useState<string>(
    heroSection.mobileVideoUrl || hero.mobileVideoUrl || '/videos/tank-cleaning-mobile.mp4'
  );
  const [posterImageUrl, setPosterImageUrl] = useState<string>(
    heroSection.posterImageUrl || hero.posterImageUrl || hero.bgImageUrl || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75'
  );
  const [overlayOpacity, setOverlayOpacity] = useState<number>(
    heroSection.settings?.overlayOpacity ?? hero.overlayOpacity ?? 0.72
  );
  const [overlayColor, setOverlayColor] = useState<'navy' | 'black' | 'darkBlue'>(
    (heroSection.settings?.overlayColor as any) ?? hero.overlayColor ?? 'navy'
  );

  // Status and feedback
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Sync state if external hero config updates
  useEffect(() => {
    if (heroSection) {
      setVideoEnabled(heroSection.settings?.videoEnabled ?? hero.videoEnabled ?? true);
      setDesktopVideoUrl(heroSection.videoUrl || hero.videoUrl || '/videos/tank-cleaning-desktop.mp4');
      setMobileVideoUrl(heroSection.mobileVideoUrl || hero.mobileVideoUrl || '/videos/tank-cleaning-mobile.mp4');
      setPosterImageUrl(heroSection.posterImageUrl || hero.posterImageUrl || hero.bgImageUrl || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75');
      setOverlayOpacity(heroSection.settings?.overlayOpacity ?? hero.overlayOpacity ?? 0.72);
      setOverlayColor((heroSection.settings?.overlayColor as any) ?? hero.overlayColor ?? 'navy');
    }
  }, [heroSection.id, hero.videoUrl]);

  // Handle Desktop Video File Upload
  const handleDesktopFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingDesktop(true);
      setUploadFeedback(null);
      const media = await uploadMediaItem(file, 'video');
      setDesktopVideoUrl(media.publicUrl || media.storagePath || '');
      // Auto enable video when new one uploaded
      setVideoEnabled(true);
      setUploadFeedback({ type: 'success', message: 'Desktop video successfully updated and saved!' });
      setTimeout(() => setUploadFeedback(null), 5000);
    } catch (err: any) {
      setUploadFeedback({
        type: 'error',
        message: err?.message || 'Failed to upload desktop video file. Please check file format (MP4, WebM recommended).'
      });
    } finally {
      setUploadingDesktop(false);
      e.target.value = '';
    }
  };

  // Handle Mobile Video File Upload
  const handleMobileFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingMobile(true);
      setUploadFeedback(null);
      const media = await uploadMediaItem(file, 'video');
      setMobileVideoUrl(media.publicUrl || media.storagePath || '');
      setVideoEnabled(true);
      setUploadFeedback({ type: 'success', message: 'Mobile video successfully updated!' });
      setTimeout(() => setUploadFeedback(null), 5000);
    } catch (err: any) {
      setUploadFeedback({
        type: 'error',
        message: err?.message || 'Failed to upload mobile video file.'
      });
    } finally {
      setUploadingMobile(false);
      e.target.value = '';
    }
  };

  // Handle Poster Image Upload
  const handlePosterFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPoster(true);
      setUploadFeedback(null);
      const media = await uploadMediaItem(file, 'image');
      setPosterImageUrl(media.publicUrl || media.storagePath || '');
      setUploadFeedback({ type: 'success', message: 'Poster image uploaded successfully!' });
      setTimeout(() => setUploadFeedback(null), 5000);
    } catch (err: any) {
      setUploadFeedback({
        type: 'error',
        message: err?.message || 'Failed to upload poster image.'
      });
    } finally {
      setUploadingPoster(false);
      e.target.value = '';
    }
  };

  // Save Video Settings to Database/Storage
  const handleSaveHeroVideo = async () => {
    try {
      setSaving(true);
      setSavedSuccess(false);
      setUploadFeedback(null);

      // 1. Update Homepage CMS Section
      const desktopYtId = extractYouTubeId(desktopVideoUrl);
      const updatedHeroSection: HomepageSection = {
        ...heroSection,
        videoUrl: desktopVideoUrl,
        mobileVideoUrl: mobileVideoUrl,
        posterImageUrl: posterImageUrl,
        mediaType: desktopYtId ? 'youtube' : 'video',
        youtubeUrl: desktopYtId ? desktopVideoUrl : heroSection.youtubeUrl,
        youtubeVideoId: desktopYtId || heroSection.youtubeVideoId,
        settings: {
          ...(heroSection.settings || {}),
          videoEnabled,
          overlayOpacity: Number(overlayOpacity),
          overlayColor
        }
      };
      await updateSection(updatedHeroSection);

      // 2. Also persist to siteConfigStore for high compatibility
      updateHeroVideoConfig({
        videoEnabled,
        videoUrl: desktopVideoUrl,
        mobileVideoUrl: mobileVideoUrl,
        posterImageUrl: posterImageUrl,
        overlayOpacity: Number(overlayOpacity),
        overlayColor
      });

      // 3. Log audit event
      await recordAuditLog(
        adminUser?.email || 'admin@sunviloz.com',
        'Updated Hero Background Video Settings',
        'HeroSection',
        'hero',
        `Video enabled: ${videoEnabled}, Opacity: ${overlayOpacity}, Desktop URL: ${desktopVideoUrl}`
      );

      // 4. Refresh global config context
      refreshConfig();

      setSavedSuccess(true);
      setUploadFeedback({ type: 'success', message: 'Hero video settings saved successfully!' });
      setTimeout(() => {
        setSavedSuccess(false);
        setUploadFeedback(null);
      }, 4000);
    } catch (error: any) {
      setUploadFeedback({
        type: 'error',
        message: error?.message || 'Error saving hero video settings. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  // Preset realistic cleaning video URLs for easy 1-click test
  const cleaningVideoPresets = [
    {
      title: 'Local High-Pressure Water Jet Cleaning (Default)',
      url: '/videos/tank-cleaning-desktop.mp4',
      mobileUrl: '/videos/tank-cleaning-mobile.mp4'
    },
    {
      title: 'Pressure Cleaning & Surface Wash',
      url: 'https://wombatsweepers.com.au/wp-content/uploads/2024/05/pressure-cleaning-brisbane.mp4',
      mobileUrl: 'https://wombatsweepers.com.au/wp-content/uploads/2024/05/pressure-cleaning-brisbane.mp4'
    },
    {
      title: 'Deep Water Tank Cleaning Footage',
      url: 'https://spwatertankcleaner.com/wp-content/uploads/2025/08/how-to-clean-water-tank-_-hygyniec-water-tank-cleaning-_-Overhead-water-tank-cleaning.mp4',
      mobileUrl: 'https://spwatertankcleaner.com/wp-content/uploads/2025/08/how-to-clean-water-tank-_-hygyniec-water-tank-cleaning-_-Overhead-water-tank-cleaning.mp4'
    }
  ];

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* BREADCRUMB NAVIGATION: Customize → Homepage → Hero Section */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div>
          <nav className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <span className="hover:text-slate-200">Customize</span>
            <span>&gt;</span>
            <span className="hover:text-slate-200">Homepage</span>
            <span>&gt;</span>
            <span className="text-blue-400 font-semibold">Hero Section</span>
          </nav>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-400" />
            <span>Customize Homepage &amp; Hero Background Video</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure full-width cleaning service background video, poster fallback, dark navy overlay, and mobile responsiveness.
          </p>
        </div>

        {/* Sub-tabs switch */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubSection('hero')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeSubSection === 'hero'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hero Video Settings
          </button>
          <button
            onClick={() => setActiveSubSection('offers')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeSubSection === 'offers'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Running Special Offers
          </button>
          <button
            onClick={() => setActiveSubSection('images')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              activeSubSection === 'images'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>ছবি পরিবর্তন (Images)</span>
          </button>
          <button
            onClick={() => setActiveSubSection('preview')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeSubSection === 'preview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Visual Preview
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-600 text-emerald-200 p-4 rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-3">
            <Check className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="font-semibold text-sm">Hero Video Settings Saved Successfully!</p>
              <p className="text-xs text-emerald-300/80">Settings have been loaded into database/storage. Homepage hero is now updated.</p>
            </div>
          </div>
          <button
            onClick={() => window.open('/', '_blank')}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg flex items-center gap-1.5"
          >
            <span>View Homepage</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* HERO VIDEO CUSTOMIZE CONTROLS */}
      {/* ------------------------------------------------------------- */}
      {activeSubSection === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main settings form */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Video Enable / Disable Switch */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <FileVideo className="w-5 h-5 text-blue-400" />
                    <span>Hero Background Video Status</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    When enabled, the full-width cleaning service video plays muted in a loop behind the hero content.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={videoEnabled}
                    onChange={(e) => setVideoEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {uploadFeedback && (
                <div 
                  className={`mt-4 p-3 rounded-lg text-xs flex items-center justify-between gap-2 shadow-md animate-fadeIn ${
                    uploadFeedback.type === 'error'
                      ? 'bg-red-950/80 border border-red-700 text-red-200'
                      : 'bg-emerald-950/80 border border-emerald-600 text-emerald-200'
                  }`}
                  role="alert"
                >
                  <div className="flex items-center gap-2">
                    {uploadFeedback.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    )}
                    <span className="font-medium">{uploadFeedback.message}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadFeedback(null)}
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
                    aria-label="Dismiss message"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {!videoEnabled && (
                <div className="mt-4 p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-xs text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Video is disabled. The Poster / Fallback image will be shown on the homepage hero instead.</span>
                </div>
              )}
            </div>

            {/* 2. Desktop Hero Video Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Monitor className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-semibold text-white">Desktop Hero Video</h3>
                </div>
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md">
                  Full-width desktop &amp; tablet (up to 1GB)
                </span>
              </div>

              {/* Video URL Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Video URL (YouTube URL / ID, or direct MP4 / WebM link)
                  </label>
                  {extractYouTubeId(desktopVideoUrl) && (
                    <span className="text-[11px] text-red-400 font-semibold flex items-center gap-1 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/60">
                      🔴 YouTube Detected ({extractYouTubeId(desktopVideoUrl)})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={desktopVideoUrl}
                    onChange={(e) => setDesktopVideoUrl(e.target.value)}
                    placeholder="e.g. https://www.youtube.com/watch?v=... or /videos/tank-cleaning-desktop.mp4"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  {desktopVideoUrl && (
                    <button
                      type="button"
                      onClick={() => setDesktopVideoUrl('')}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
                      title="Delete Video URL"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports <strong className="text-cyan-300">YouTube videos</strong> (e.g. <code className="text-cyan-400 font-mono">https://www.youtube.com/watch?v=...</code>), direct MP4/WebM videos, or local uploads.
                </p>

                {/* Instant YouTube Preview Thumbnail */}
                {extractYouTubeId(desktopVideoUrl) && (
                  <div className="mt-2.5 p-3 rounded-lg bg-slate-950/90 border border-red-900/60 flex items-center gap-3">
                    <img 
                      src={`https://img.youtube.com/vi/${extractYouTubeId(desktopVideoUrl)}/hqdefault.jpg`} 
                      alt="YouTube preview"
                      className="w-20 h-12 object-cover rounded border border-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="font-semibold text-white flex items-center gap-1.5 truncate">
                        <span className="text-red-500">▶</span> YouTube Video Connected
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">{desktopVideoUrl}</div>
                      <div className="text-[11px] text-emerald-400 font-medium">✓ Ready for Hero Background Autoplay</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Video File Upload & Replace */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingDesktop ? 'Uploading...' : 'Upload New Desktop Video'}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                    onChange={handleDesktopFileUpload}
                    disabled={uploadingDesktop}
                    className="hidden"
                  />
                </label>

                {desktopVideoUrl && (
                  <button
                    type="button"
                    onClick={() => setDesktopVideoUrl('/videos/tank-cleaning-desktop.mp4')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset to Tank Cleaning Default</span>
                  </button>
                )}
              </div>

              {/* Ready-made Realistic Cleaning Video Presets */}
              <div className="mt-3 p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="text-[11px] font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Select from Realistic Cleaning Footage Presets:</span>
                </div>
                <div className="space-y-1.5">
                  {cleaningVideoPresets.map((preset, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs"
                    >
                      <span className="text-slate-300 font-medium">{preset.title}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setDesktopVideoUrl(preset.url);
                          setMobileVideoUrl(preset.mobileUrl);
                          setVideoEnabled(true);
                        }}
                        className="px-2.5 py-1 bg-blue-900/60 hover:bg-blue-800 text-blue-300 rounded text-[11px] font-medium transition-colors"
                      >
                        Apply Preset
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Mobile Hero Video Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-semibold text-white">Mobile Hero Video</h3>
                </div>
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md">
                  Lightweight version for phones
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Mobile Video URL (Optional — defaults to desktop video if left blank)
                  </label>
                  {extractYouTubeId(mobileVideoUrl) && (
                    <span className="text-[11px] text-red-400 font-semibold flex items-center gap-1 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/60">
                      🔴 YouTube ({extractYouTubeId(mobileVideoUrl)})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={mobileVideoUrl}
                    onChange={(e) => setMobileVideoUrl(e.target.value)}
                    placeholder="e.g. https://www.youtube.com/watch?v=... or /videos/tank-cleaning-mobile.mp4"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  {mobileVideoUrl && (
                    <button
                      type="button"
                      onClick={() => setMobileVideoUrl('')}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
                      title="Clear Mobile Video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {extractYouTubeId(mobileVideoUrl) && (
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-950/90 border border-red-900/60 flex items-center gap-2 text-xs">
                    <img 
                      src={`https://img.youtube.com/vi/${extractYouTubeId(mobileVideoUrl)}/hqdefault.jpg`} 
                      alt="YouTube mobile preview"
                      className="w-14 h-9 object-cover rounded border border-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">Mobile YouTube Video Connected</div>
                      <div className="text-[10px] text-emerald-400">✓ Ready for mobile background autoplay</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-2 border border-slate-700 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingMobile ? 'Uploading...' : 'Upload Mobile Video'}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                    onChange={handleMobileFileUpload}
                    disabled={uploadingMobile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* 4. Poster / Fallback Image Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-semibold text-white">Poster / Fallback Image</h3>
                </div>
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md">
                  Fallback when video is loading or disabled
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Poster Image URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={posterImageUrl}
                    onChange={(e) => setPosterImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  {posterImageUrl && (
                    <button
                      type="button"
                      onClick={() => setPosterImageUrl('')}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
                      title="Clear Poster"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-2 border border-slate-700 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingPoster ? 'Uploading...' : 'Upload Poster Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterFileUpload}
                    disabled={uploadingPoster}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* 5. Dark Transparent Overlay Opacity & Color */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-semibold text-white">Dark Transparent Overlay</h3>
                </div>
                <span className="text-xs bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2.5 py-1 rounded-md font-mono">
                  {Math.round(overlayOpacity * 100)}% Opacity
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs text-slate-300 mb-2">
                  <span>Overlay Darkening (Higher = more text readability, Lower = brighter video)</span>
                  <span className="font-semibold text-white">{overlayOpacity}</span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="0.95"
                  step="0.02"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>20% (Light)</span>
                  <span>72% (Recommended for high contrast)</span>
                  <span>95% (Very Dark)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Overlay Color Tint
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setOverlayColor('navy')}
                    className={`p-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      overlayColor === 'navy'
                        ? 'border-blue-500 bg-blue-950/60 text-white ring-1 ring-blue-500'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-[#07172c] border border-blue-400"></span>
                    <span>Dark Navy (Default)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOverlayColor('black')}
                    className={`p-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      overlayColor === 'black'
                        ? 'border-blue-500 bg-blue-950/60 text-white ring-1 ring-blue-500'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-600"></span>
                    <span>Pure Black</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOverlayColor('darkBlue')}
                    className={`p-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      overlayColor === 'darkBlue'
                        ? 'border-blue-500 bg-blue-950/60 text-white ring-1 ring-blue-500'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-[#0b2b5c] border border-blue-400"></span>
                    <span>Deep Royal Blue</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveHeroVideo}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving to Database...' : 'Save Hero Video Settings'}</span>
              </button>
            </div>
          </div>

          {/* Right column: Live Mini Preview */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm sticky top-20">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Real-Time Mini Preview</span>
                </span>
                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-2 py-0.5 rounded ${previewDevice === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                  >
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-2 py-0.5 rounded ${previewDevice === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              {/* Live Preview Container */}
              <div 
                className={`relative overflow-hidden rounded-lg border border-slate-700 bg-slate-950 transition-all ${
                  previewDevice === 'mobile' ? 'max-w-[260px] mx-auto aspect-[9/16]' : 'w-full aspect-[16/10]'
                }`}
              >
                {/* Background Video */}
                {videoEnabled && (desktopVideoUrl || mobileVideoUrl) ? (
                  (() => {
                    const activeUrl = previewDevice === 'mobile' && mobileVideoUrl ? mobileVideoUrl : desktopVideoUrl;
                    const ytId = extractYouTubeId(activeUrl);
                    if (ytId) {
                      return (
                        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&playsinline=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&modestbranding=1`}
                            className="absolute inset-0 w-full h-full object-cover border-0 scale-125 pointer-events-none"
                            title="YouTube Preview"
                            allow="autoplay"
                          />
                        </div>
                      );
                    }
                    return (
                      <video
                        key={desktopVideoUrl + mobileVideoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster={posterImageUrl}
                        className="absolute inset-0 w-full h-full object-cover"
                      >
                        <source src={activeUrl} type="video/mp4" />
                      </video>
                    );
                  })()
                ) : (
                  <div 
                    className="absolute inset-0 w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${posterImageUrl}')` }}
                  />
                )}

                {/* Dark Overlay */}
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundColor: overlayColor === 'black' 
                      ? `rgba(2, 6, 23, ${overlayOpacity})`
                      : overlayColor === 'darkBlue'
                      ? `rgba(11, 43, 92, ${overlayOpacity})`
                      : `rgba(7, 23, 44, ${overlayOpacity})`
                  }}
                />

                {/* Content Preview Overlay */}
                <div className="relative z-10 p-4 h-full flex flex-col justify-center text-center items-center text-white">
                  <span className="inline-block px-2 py-0.5 mb-2 text-[9px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full">
                    ঢাকা শহরের সকল এলাকায়
                  </span>
                  <h4 className="text-xs font-bold leading-tight drop-shadow-md line-clamp-2">
                    ঢাকায় প্রফেশনাল ওয়াটার ট্যাংক ক্লিনিং সার্ভিস
                  </h4>
                  <p className="text-[9px] text-slate-300 mt-1 line-clamp-2 max-w-[220px]">
                    রূফটপ ও আন্ডারগ্রাউন্ড পানির ট্যাংক স্বাস্থ্যসম্মতভাবে পরিষ্কার
                  </p>
                  <div className="mt-3 flex gap-1.5 justify-center">
                    <span className="px-2 py-1 bg-blue-600 text-[9px] font-semibold rounded text-white shadow">
                      কোটেশন নিন
                    </span>
                    <span className="px-2 py-1 bg-white/20 text-[9px] font-semibold rounded text-white backdrop-blur">
                      কল করুন
                    </span>
                  </div>
                </div>
              </div>

              {/* Status breakdown */}
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] space-y-1.5 text-slate-400">
                <div className="flex justify-between">
                  <span>Video Engine:</span>
                  <span className={videoEnabled ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                    {videoEnabled ? 'Active (Loop/Muted)' : 'Disabled (Poster Fallback)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Overlay Darkness:</span>
                  <span className="text-white font-mono">{Math.round(overlayOpacity * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Color Tone:</span>
                  <span className="text-white capitalize">{overlayColor}</span>
                </div>
                <div className="flex justify-between truncate">
                  <span>Desktop Source:</span>
                  <span className="text-slate-300 font-mono text-[10px] truncate max-w-[150px]">
                    {desktopVideoUrl ? desktopVideoUrl.split('/').pop() : 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* RUNNING SPECIAL OFFERS MANAGEMENT TAB */}
      {/* ------------------------------------------------------------- */}
      {activeSubSection === 'offers' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Running Special Offers (চলমান বিশেষ অফার ও প্যাকেজ)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage the horizontally running promotional ticker displayed directly beneath the Hero section.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    saveSpecialOffers(DEFAULT_SPECIAL_OFFERS);
                    setOffersList(DEFAULT_SPECIAL_OFFERS);
                    setOffersSaved(true);
                    setTimeout(() => setOffersSaved(false), 3000);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>

            {offersSaved && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Special Offers updated successfully! The homepage ticker is now live with your changes.</span>
              </div>
            )}

            {/* Existing Offers List */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Current Ticker Messages ({offersList.length})
              </h3>

              {offersList.map((offer, idx) => (
                <div 
                  key={offer.id} 
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    offer.isActive 
                      ? 'bg-slate-950 border-slate-800 hover:border-slate-700' 
                      : 'bg-slate-950/50 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500">#{idx + 1}</span>
                      {offer.badgeBn && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                          {offer.badgeBn}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-white">{offer.titleBn}</span>
                    </div>
                    <div className="text-xs text-slate-400 pl-6">
                      <span>{offer.titleEn}</span>
                      <span className="mx-2">•</span>
                      <span className="text-blue-400 font-mono">{offer.linkUrl}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Toggle Active Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = offersList.map(o => o.id === offer.id ? { ...o, isActive: !o.isActive } : o);
                        setOffersList(updated);
                        saveSpecialOffers(updated);
                        setOffersSaved(true);
                        setTimeout(() => setOffersSaved(false), 3000);
                      }}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium border transition-colors ${
                        offer.isActive 
                          ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300 hover:bg-emerald-900/60' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {offer.isActive ? 'Active' : 'Inactive'}
                    </button>

                    {/* Move Up */}
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const copy = [...offersList];
                          const temp = copy[idx - 1];
                          copy[idx - 1] = copy[idx];
                          copy[idx] = temp;
                          const reindexed = copy.map((o, i) => ({ ...o, sortOrder: i + 1 }));
                          setOffersList(reindexed);
                          saveSpecialOffers(reindexed);
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700"
                        title="Move Up"
                      >
                        ↑
                      </button>
                    )}

                    {/* Move Down */}
                    {idx < offersList.length - 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const copy = [...offersList];
                          const temp = copy[idx + 1];
                          copy[idx + 1] = copy[idx];
                          copy[idx] = temp;
                          const reindexed = copy.map((o, i) => ({ ...o, sortOrder: i + 1 }));
                          setOffersList(reindexed);
                          saveSpecialOffers(reindexed);
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700"
                        title="Move Down"
                      >
                        ↓
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = offersList.filter(o => o.id !== offer.id);
                        setOffersList(updated);
                        saveSpecialOffers(updated);
                        setOffersSaved(true);
                        setTimeout(() => setOffersSaved(false), 3000);
                      }}
                      className="p-1.5 bg-red-950/50 hover:bg-red-900/60 text-red-300 text-xs rounded border border-red-800 transition-colors"
                      title="Delete Offer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Offer Form */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 mt-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Add New Promotional Message / Offer</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Message in Bengali (বাংলা বার্তা) *</label>
                  <input
                    type="text"
                    value={newOfferBn}
                    onChange={(e) => setNewOfferBn(e.target.value)}
                    placeholder="উদাঃ পানির ট্যাংক পরিষ্কার সার্ভিসের জন্য বিশেষ প্যাকেজ সুবিধা"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Message in English *</label>
                  <input
                    type="text"
                    value={newOfferEn}
                    onChange={(e) => setNewOfferEn(e.target.value)}
                    placeholder="e.g. Special Package Offers on Water Tank Cleaning Service"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Badge Label (Bangla)</label>
                  <input
                    type="text"
                    value={newOfferBadgeBn}
                    onChange={(e) => setNewOfferBadgeBn(e.target.value)}
                    placeholder="উদাঃ বিশেষ অফার"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Target Landing Page URL *</label>
                  <select
                    value={newOfferLink}
                    onChange={(e) => setNewOfferLink(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="/water-tank-cleaning-service">/water-tank-cleaning-service (Water Tank Page)</option>
                    <option value="/pipeline-cleaning-service">/pipeline-cleaning-service (Pipeline Cleaning Page)</option>
                    <option value="/services/home-deep-cleaning">/services/home-deep-cleaning (Deep Cleaning)</option>
                    <option value="/services/sofa-cleaning">/services/sofa-cleaning (Sofa Cleaning)</option>
                    <option value="/get-quote">/get-quote (Free Quote & Booking)</option>
                    <option value="/pricing">/pricing (Pricing Page)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={!newOfferBn.trim()}
                  onClick={() => {
                    if (!newOfferBn.trim()) return;
                    const newOffer: SpecialOfferItem = {
                      id: `offer-${Date.now()}`,
                      titleBn: newOfferBn.trim(),
                      titleEn: newOfferEn.trim() || newOfferBn.trim(),
                      badgeBn: newOfferBadgeBn.trim() || 'অফার',
                      badgeEn: newOfferBadgeEn.trim() || 'Offer',
                      linkUrl: newOfferLink,
                      isActive: true,
                      sortOrder: offersList.length + 1
                    };
                    const updated = [...offersList, newOffer];
                    setOffersList(updated);
                    saveSpecialOffers(updated);
                    setNewOfferBn('');
                    setNewOfferEn('');
                    setNewOfferBadgeBn('');
                    setNewOfferBadgeEn('');
                    setOffersSaved(true);
                    setTimeout(() => setOffersSaved(false), 3000);
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Add Offer to Ticker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* FULL PREVIEW TAB */}
      {/* ------------------------------------------------------------- */}
      {activeSubSection === 'preview' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-white">Full Responsive Live Preview</h3>
              <p className="text-xs text-slate-400">See exactly how the full-width background cleaning video renders with the current Bengali content and CTA buttons.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium border ${
                  previewDevice === 'desktop' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                Desktop Full Width
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium border ${
                  previewDevice === 'mobile' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                Mobile View
              </button>
            </div>
          </div>

          <div className="relative w-full overflow-hidden rounded-xl border border-slate-700 min-h-[420px] flex items-center justify-center p-6 text-center">
            {/* Background Video */}
            {videoEnabled && (desktopVideoUrl || mobileVideoUrl) ? (
              (() => {
                const activeUrl = previewDevice === 'mobile' && mobileVideoUrl ? mobileVideoUrl : desktopVideoUrl;
                const ytId = extractYouTubeId(activeUrl);
                if (ytId) {
                  return (
                    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&playsinline=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&modestbranding=1`}
                        className="absolute inset-0 w-full h-full object-cover border-0 scale-125 pointer-events-none"
                        title="YouTube Preview"
                        allow="autoplay"
                      />
                    </div>
                  );
                }
                return (
                  <video
                    key={desktopVideoUrl + previewDevice}
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={posterImageUrl}
                    className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                  >
                    <source src={activeUrl} type="video/mp4" />
                  </video>
                );
              })()
            ) : (
              <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center pointer-events-none"
                style={{ backgroundImage: `url('${posterImageUrl}')` }}
              />
            )}

            {/* Dark Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none transition-all duration-300"
              style={{
                backgroundColor: overlayColor === 'black' 
                  ? `rgba(2, 6, 23, ${overlayOpacity})`
                  : overlayColor === 'darkBlue'
                  ? `rgba(11, 43, 92, ${overlayOpacity})`
                  : `rgba(7, 23, 44, ${overlayOpacity})`
              }}
            />

            {/* Bengali text overlay matching real hero */}
            <div className="relative z-10 max-w-3xl mx-auto space-y-4 text-white">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>ঢাকা শহরের সকল এলাকায় সার্ভিস প্রদান</span>
              </span>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-lg">
                ঢাকায় প্রফেশনাল ওয়াটার ট্যাংক ক্লিনিং সার্ভিস
              </h1>

              <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed drop-shadow">
                নিয়মিত পানির ট্যাংক পরিষ্কার রাখা আপনার ও পরিবারের সুস্থতার জন্য জরুরি। আপনার ট্যাংকের তথ্য জানিয়ে রিকোয়েস্ট করুন, আমাদের টিম সঠিক কোটেশন প্রদান করবে।
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <span className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-2 cursor-pointer">
                  <span>ফ্রি কোটেশন রিকোয়েস্ট করুন</span>
                </span>
                <span className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-2 cursor-pointer">
                  <span>হোয়াটসঅ্যাপে যোগাযোগ</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* WEBSITE IMAGES MANAGEMENT SUB-SECTION */}
      {/* ------------------------------------------------------------- */}
      {activeSubSection === 'images' && (
        <WebsiteImagesTab />
      )}
    </div>
  );
};
