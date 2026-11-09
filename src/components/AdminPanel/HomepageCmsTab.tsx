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
import { uploadMediaItem, extractYouTubeId, validateVideoUrl } from '../../services/mediaService';
import { persistHeroVideosToCentralRegistry } from '../../services/imageSyncService';
import { recordAuditLog } from '../../services/auditService';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { WebsiteImagesTab } from './WebsiteImagesTab';
import { 
  getSpecialOffers, 
  fetchSpecialOffersFromSupabase,
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

  useEffect(() => {
    fetchSpecialOffersFromSupabase().then(latest => {
      if (latest && latest.length > 0) {
        setOffersList(latest);
      }
    });
  }, [activeSubSection]);

  const [newOfferBn, setNewOfferBn] = useState('');
  const [newOfferEn, setNewOfferEn] = useState('');
  const [newOfferBadgeBn, setNewOfferBadgeBn] = useState('');
  const [newOfferBadgeEn, setNewOfferBadgeEn] = useState('');
  const [newOfferLink, setNewOfferLink] = useState('/water-tank-cleaning-service');
  const [offersSaved, setOffersSaved] = useState(false);

  // Find existing hero section from CMS or fallback to default
  const heroSection = sections.find(s => s.sectionKey === 'hero' || s.id === 'sec-hero') || {
    id: 'sec-hero',
    sectionKey: 'hero',
    title: 'Professional Water Tank Cleaning Service in Dhaka',
    titleBn: 'ঢাকায় প্রফেশনাল ওয়াটার ট্যাংক ক্লিনিং সার্ভিস',
    subtitle: 'Regular water tank and pipeline cleaning is essential for hygienic, safe water. Share your tank details — our team will review and provide a tailored quotation.',
    subtitleBn: 'নিয়মিত পানির ট্যাংক পরিষ্কার রাখা আপনার ও পরিবারের সুস্থতার জন্য জরুরি। আপনার ট্যাংকের তথ্য জানিয়ে রিকোয়েস্ট করুন, আমাদের টিম সঠিক কোটেশন প্রদান করবে।',
    isEnabled: true,
    order: 0,
    videoUrl: '/videos/tank-cleaning-desktop.mp4',
    mobileVideoUrl: '/videos/tank-cleaning-mobile.mp4',
    posterImageUrl: '/assets/aistudio/hero-rooftop-poster.jpg',
    settings: {
      videoEnabled: true,
      overlayOpacity: 0.72,
      overlayColor: 'navy'
    }
  } as HomepageSection;

  // Local state for All 3 Cover Videos
  const [videoEnabled, setVideoEnabled] = useState<boolean>(
    heroSection.settings?.videoEnabled ?? hero.videoEnabled ?? true
  );

  // Video 1 (ছাদের পানির ট্যাংক ক্লিনিং - Rooftop Tank Cleaning)
  const [video1Url, setVideo1Url] = useState<string>(
    heroSection.videoUrl || hero.videoUrl || '/videos/tank-cleaning-desktop.mp4'
  );
  const [poster1Url, setPoster1Url] = useState<string>(
    heroSection.posterImageUrl || hero.posterImageUrl || '/assets/aistudio/hero-rooftop-poster.jpg'
  );

  // Video 2 (আন্ডারগ্রাউন্ড রিজার্ভার ক্লিনিং - Underground Reservoir & Sludge Extraction)
  const [video2Url, setVideo2Url] = useState<string>(
    heroSection.video2Url || heroSection.mobileVideoUrl || hero.video2Url || hero.mobileVideoUrl || '/videos/tank-cleaning-mobile.mp4'
  );
  const [poster2Url, setPoster2Url] = useState<string>(
    heroSection.posterImage2Url || hero.posterImage2Url || '/assets/aistudio/hero-underground-poster.jpg'
  );

  // Video 3 (পানির পাইপলাইন ক্লিনিং - Water Pipeline Descaling & Hydro-Pulse Wash)
  const [video3Url, setVideo3Url] = useState<string>(
    heroSection.video3Url || hero.video3Url || ''
  );
  const [poster3Url, setPoster3Url] = useState<string>(
    heroSection.posterImage3Url || hero.posterImage3Url || '/assets/aistudio/hero-underground-poster.jpg'
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
  const [uploadingVideo1, setUploadingVideo1] = useState(false);
  const [uploadingPoster1, setUploadingPoster1] = useState(false);
  const [uploadingVideo2, setUploadingVideo2] = useState(false);
  const [uploadingPoster2, setUploadingPoster2] = useState(false);
  const [uploadingVideo3, setUploadingVideo3] = useState(false);
  const [uploadingPoster3, setUploadingPoster3] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Bengali Validation Messages for URLs
  const [video1ErrorBn, setVideo1ErrorBn] = useState<string | null>(null);
  const [video2ErrorBn, setVideo2ErrorBn] = useState<string | null>(null);
  const [video3ErrorBn, setVideo3ErrorBn] = useState<string | null>(null);

  const handleVideo1Change = (val: string) => {
    setVideo1Url(val);
    if (!val.trim()) {
      setVideo1ErrorBn(null);
      return;
    }
    const check = validateVideoUrl(val);
    if (!check.isValid) {
      setVideo1ErrorBn(check.errorBn || 'সঠিক ইউটিউব লিঙ্ক বা ভিডিও পাথ দিন।');
    } else {
      setVideo1ErrorBn(null);
    }
  };

  const handleVideo2Change = (val: string) => {
    setVideo2Url(val);
    if (!val.trim()) {
      setVideo2ErrorBn(null);
      return;
    }
    const check = validateVideoUrl(val);
    if (!check.isValid) {
      setVideo2ErrorBn(check.errorBn || 'সঠিক ইউটিউব লিঙ্ক বা ভিডিও পাথ দিন।');
    } else {
      setVideo2ErrorBn(null);
    }
  };

  const handleVideo3Change = (val: string) => {
    setVideo3Url(val);
    if (!val.trim()) {
      setVideo3ErrorBn(null);
      return;
    }
    const check = validateVideoUrl(val);
    if (!check.isValid) {
      setVideo3ErrorBn(check.errorBn || 'সঠিক ইউটিউব লিঙ্ক বা ভিডিও পাথ দিন।');
    } else {
      setVideo3ErrorBn(null);
    }
  };

  // Sync state if external hero config updates
  useEffect(() => {
    if (heroSection) {
      setVideoEnabled(heroSection.settings?.videoEnabled ?? hero.videoEnabled ?? true);
      setVideo1Url(heroSection.videoUrl || hero.videoUrl || '/videos/tank-cleaning-desktop.mp4');
      setPoster1Url(heroSection.posterImageUrl || hero.posterImageUrl || '/assets/aistudio/hero-rooftop-poster.jpg');
      setVideo2Url(heroSection.video2Url || heroSection.mobileVideoUrl || hero.video2Url || hero.mobileVideoUrl || '/videos/tank-cleaning-mobile.mp4');
      setPoster2Url(heroSection.posterImage2Url || hero.posterImage2Url || '/assets/aistudio/hero-underground-poster.jpg');
      setVideo3Url(heroSection.video3Url || hero.video3Url || '');
      setPoster3Url(heroSection.posterImage3Url || hero.posterImage3Url || '/assets/aistudio/hero-underground-poster.jpg');
      setOverlayOpacity(heroSection.settings?.overlayOpacity ?? hero.overlayOpacity ?? 0.72);
      setOverlayColor((heroSection.settings?.overlayColor as any) ?? hero.overlayColor ?? 'navy');
    }
  }, [heroSection.id, hero.videoUrl, hero.video2Url, hero.video3Url]);

  // Video 1 Upload Handler
  const handleVideo1Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingVideo1(true);
      setUploadFeedback(null);
      const media = await uploadMediaItem(file, 'video');
      setVideo1Url(media.publicUrl || media.storagePath || '');
      setVideoEnabled(true);
      setUploadFeedback({ type: 'success', message: 'Video 1 (ছাদের পানির ট্যাংক) সফলভাবে আপলোড করা হয়েছে!' });
      setTimeout(() => setUploadFeedback(null), 5000);
    } catch (err: any) {
      setUploadFeedback({ type: 'error', message: err?.message || 'Video 1 আপলোড করতে সমস্যা হয়েছে।' });
    } finally {
      setUploadingVideo1(false);
      e.target.value = '';
    }
  };

  // Poster 1 Upload Handler
  const handlePoster1Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPoster1(true);
      setUploadFeedback(null);
      const media = await uploadMediaItem(file, 'image');
      setPoster1Url(media.publicUrl || media.storagePath || '');
      setUploadFeedback({ type: 'success', message: 'Poster 1 ছবি সফলভাবে আপলোড হয়েছে!' });
      setTimeout(() => setUploadFeedback(null), 5000);
    } catch (err: any) {
      setUploadFeedback({ type: 'error', message: err?.message || 'Poster 1 আপলোড করতে সমস্যা হয়েছে।' });
    } finally {
      setUploadingPoster1(false);
      e.target.value = '';
    }
  };

  // Video 2 Upload Handler
  const handleVideo2Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingVideo2(true);
      setUploadFeedback(null);
      const media = await uploadMediaItem(file, 'video');
      setVideo2Url(media.publicUrl || media.storagePath || '');
      setVideoEnabled(true);
      setUploadFeedback({ type: 'success', message: 'Video 2 (আন্ডারগ্রাউন্ড রিজার্ভার) সফলভাবে আপলোড করা হয়েছে!' });
      setTimeout(() => setUploadFeedback(null), 5000);
    } catch (err: any) {
      setUploadFeedback({ type: 'error', message: err?.message || 'Video 2 আপলোড করতে সমস্যা হয়েছে।' });
    } finally {
      setUploadingVideo2(false);
      e.target.value = '';
    }
  };

  // Poster 2 Upload Handler
  const handlePoster2Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPoster2(true);
      setUploadFeedback(null);
      const media = await uploadMediaItem(file, 'image');
      setPoster2Url(media.publicUrl || media.storagePath || '');
      setUploadFeedback({ type: 'success', message: 'Poster 2 ছবি সফলভাবে আপলোড হয়েছে!' });
      setTimeout(() => setUploadFeedback(null), 5000);
    } catch (err: any) {
      setUploadFeedback({ type: 'error', message: err?.message || 'Poster 2 আপলোড করতে সমস্যা হয়েছে।' });
    } finally {
      setUploadingPoster2(false);
      e.target.value = '';
    }
  };

  // Video 3 Upload Handler
  const handleVideo3Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingVideo3(true);
      setUploadFeedback(null);
      const media = await uploadMediaItem(file, 'video');
      setVideo3Url(media.publicUrl || media.storagePath || '');
      setVideoEnabled(true);
      setUploadFeedback({ type: 'success', message: 'Video 3 (পানির পাইপলাইন) সফলভাবে আপলোড করা হয়েছে!' });
      setTimeout(() => setUploadFeedback(null), 5000);
    } catch (err: any) {
      setUploadFeedback({ type: 'error', message: err?.message || 'Video 3 আপলোড করতে সমস্যা হয়েছে।' });
    } finally {
      setUploadingVideo3(false);
      e.target.value = '';
    }
  };

  // Poster 3 Upload Handler
  const handlePoster3Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPoster3(true);
      setUploadFeedback(null);
      const media = await uploadMediaItem(file, 'image');
      setPoster3Url(media.publicUrl || media.storagePath || '');
      setUploadFeedback({ type: 'success', message: 'Poster 3 ছবি সফলভাবে আপলোড হয়েছে!' });
      setTimeout(() => setUploadFeedback(null), 5000);
    } catch (err: any) {
      setUploadFeedback({ type: 'error', message: err?.message || 'Poster 3 আপলোড করতে সমস্যা হয়েছে।' });
    } finally {
      setUploadingPoster3(false);
      e.target.value = '';
    }
  };

  // Save All 3 Video Settings to Supabase Database & Central Store
  const handleSaveHeroVideo = async () => {
    try {
      setSaving(true);
      setSavedSuccess(false);
      setUploadFeedback(null);

      // Validate Video 1 URL
      const v1Check = validateVideoUrl(video1Url);
      if (!v1Check.isValid) {
        setVideo1ErrorBn(v1Check.errorBn || 'কভার কলাম ১ (ভিডিও ১) এর লিঙ্কটি সঠিক নয়।');
        setUploadFeedback({ type: 'error', message: `কভার কলাম ১ (ভিডিও ১): ${v1Check.errorBn}` });
        setSaving(false);
        return;
      }
      setVideo1ErrorBn(null);

      // Validate Video 2 URL
      const v2Check = validateVideoUrl(video2Url);
      if (!v2Check.isValid) {
        setVideo2ErrorBn(v2Check.errorBn || 'কভার কলাম ২ (ভিডিও ২) এর লিঙ্কটি সঠিক নয়।');
        setUploadFeedback({ type: 'error', message: `কভার কলাম ২ (ভিডিও ২): ${v2Check.errorBn}` });
        setSaving(false);
        return;
      }
      setVideo2ErrorBn(null);

      // Validate Video 3 URL if provided
      if (video3Url && video3Url.trim()) {
        const v3Check = validateVideoUrl(video3Url);
        if (!v3Check.isValid) {
          setVideo3ErrorBn(v3Check.errorBn || 'কভার কলাম ৩ (ভিডিও ৩) এর লিঙ্কটি সঠিক নয়।');
          setUploadFeedback({ type: 'error', message: `কভার কলাম ৩ (ভিডিও ৩): ${v3Check.errorBn}` });
          setSaving(false);
          return;
        }
        setVideo3ErrorBn(null);
      }

      // 1. Update Homepage CMS Section in Supabase (targeting 'sec-hero')
      const ytId1 = extractYouTubeId(video1Url);
      const ytId2 = extractYouTubeId(video2Url);
      const ytId3 = extractYouTubeId(video3Url);

      const updatedHeroSection: HomepageSection = {
        ...heroSection,
        id: 'sec-hero',
        sectionKey: 'hero',
        videoUrl: video1Url,
        video2Url: video2Url,
        mobileVideoUrl: video2Url,
        video3Url: video3Url,
        posterImageUrl: poster1Url,
        posterImage2Url: poster2Url,
        posterImage3Url: poster3Url,
        mediaType: ytId1 ? 'youtube' : 'video',
        youtubeUrl: ytId1 ? video1Url : undefined,
        youtubeVideoId: ytId1 || undefined,
        content: {
          ...(heroSection.content || {}),
          video1Url,
          video2Url,
          video3Url,
          mobileVideoUrl: video2Url,
          posterImage1Url: poster1Url,
          posterImage2Url: poster2Url,
          posterImage3Url: poster3Url
        },
        settings: {
          ...(heroSection.settings || {}),
          videoEnabled,
          overlayOpacity: Number(overlayOpacity),
          overlayColor,
          video1Url,
          video2Url,
          video3Url,
          mobileVideoUrl: video2Url,
          posterImage1Url: poster1Url,
          posterImage2Url: poster2Url,
          posterImage3Url: poster3Url
        }
      };

      const cmsSaved = await updateSection(updatedHeroSection);
      if (!cmsSaved) {
        throw new Error('Supabase ডেটাবেজে ভিডিও সংরক্ষণ করা সম্ভব হয়নি। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করে পুনরায় চেষ্টা করুন।');
      }

      // 2. Persist to siteConfigStore (public.site_settings) for cross-browser synchronization
      await updateHeroVideoConfig({
        videoEnabled,
        videoUrl: video1Url,
        video2Url: video2Url,
        mobileVideoUrl: video2Url,
        video3Url: video3Url,
        posterImageUrl: poster1Url,
        posterImage2Url: poster2Url,
        posterImage3Url: poster3Url,
        overlayOpacity: Number(overlayOpacity),
        overlayColor
      });

      // 3. Persist to Central Storage Registry (site-media/config/registry_*.json) for cross-device/incognito sync
      await persistHeroVideosToCentralRegistry({
        video1Url,
        video2Url,
        video3Url,
        poster1Url,
        poster2Url,
        poster3Url
      });

      // 4. Log audit event
      await recordAuditLog(
        adminUser?.email || 'admin@sunviloz.com',
        'Updated Cover Tri-Videos',
        'HeroSection',
        'sec-hero',
        `Cover Videos Saved: V1=${video1Url.slice(0, 35)}, V2=${video2Url.slice(0, 35)}, V3=${video3Url.slice(0, 35)}`
      );

      // 5. Refresh global config context
      refreshConfig();

      setSavedSuccess(true);
      setUploadFeedback({ type: 'success', message: 'কভার কলাম ১ ও কলাম ২-এর ভিডিও সফলভাবে Supabase ডেটাবেজে সংরক্ষিত হয়েছে!' });
      setTimeout(() => {
        setSavedSuccess(false);
      }, 5000);
    } catch (error: any) {
      setUploadFeedback({
        type: 'error',
        message: error?.message || 'ভিডিও সংরক্ষণের সময় সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
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
      url: '/videos/tank-cleaning-desktop.mp4',
      mobileUrl: '/videos/tank-cleaning-mobile.mp4'
    },
    {
      title: 'Water Tank High-Pressure Wash',
      url: '/videos/tank-cleaning-desktop.mp4',
      mobileUrl: '/videos/tank-cleaning-desktop.mp4'
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

            {/* ========================================================= */}
            {/* 2. COVER VIDEO 1: ছাদের পানির ট্যাংক ক্লিনিং */}
            {/* ========================================================= */}
            <div className="bg-slate-900 border border-cyan-800/60 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/60 text-cyan-300 text-xs font-bold flex items-center justify-center">
                    ১
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-white">ভিডিও ১: ছাদের পানির ট্যাংক ক্লিনিং</h3>
                    <p className="text-[11px] text-cyan-300/80">Video 1: Rooftop Tank Cleaning (150-Bar Rotary Jet)</p>
                  </div>
                </div>
                <span className="text-xs bg-cyan-950 text-cyan-300 border border-cyan-800/80 px-2.5 py-1 rounded-md font-medium">
                  কভার কলাম ১ (বামপাশে)
                </span>
              </div>

              {/* Video 1 URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Video 1 URL (YouTube লিঙ্ক অথবা সরাসরি MP4 / WebM লিঙ্ক)
                  </label>
                  {extractYouTubeId(video1Url) && (
                    <span className="text-[11px] text-red-400 font-semibold flex items-center gap-1 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/60">
                      🔴 YouTube Detected ({extractYouTubeId(video1Url)})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={video1Url}
                    onChange={(e) => handleVideo1Change(e.target.value)}
                    placeholder="e.g. /videos/tank-cleaning-desktop.mp4 or https://www.youtube.com/watch?v=..."
                    className={`flex-1 bg-slate-950 border rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none font-mono ${
                      video1ErrorBn ? 'border-red-500 focus:border-red-400' : 'border-slate-700 focus:border-cyan-500'
                    }`}
                  />
                  {video1Url && (
                    <button
                      type="button"
                      onClick={() => {
                        setVideo1Url('');
                        setVideo1ErrorBn(null);
                      }}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
                      title="Clear Video 1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Video 1 Bengali Validation Error */}
                {video1ErrorBn && (
                  <div className="mt-2 p-2 bg-red-950/80 border border-red-700 text-red-200 text-xs rounded-lg flex items-center gap-1.5 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{video1ErrorBn}</span>
                  </div>
                )}

                {/* Instant YouTube Preview Thumbnail */}
                {extractYouTubeId(video1Url) && (
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-950/90 border border-red-900/60 flex items-center gap-3">
                    <img 
                      src={`https://img.youtube.com/vi/${extractYouTubeId(video1Url)}/hqdefault.jpg`} 
                      alt="YouTube preview 1"
                      className="w-16 h-10 object-cover rounded border border-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="font-semibold text-white truncate">▶ YouTube Video 1 Connected</div>
                      <div className="text-[11px] text-emerald-400">✓ Ready for Autoplay in Hero Column 1</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Video 1 File Upload & Reset */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <label className="cursor-pointer px-3.5 py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingVideo1 ? 'ভিডিও আপলোড হচ্ছে...' : 'নতুন ভিডিও ১ আপলোড করুন'}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                    onChange={handleVideo1Upload}
                    disabled={uploadingVideo1}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setVideo1Url('/videos/tank-cleaning-desktop.mp4');
                    setVideo1ErrorBn(null);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>ডিফল্ট ভিডিও ১ সেট করুন</span>
                </button>
              </div>

              {/* Video 1 Poster / Fallback Image */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  ভিডিও ১ পোস্টার ছবি (Fallback Poster Image)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={poster1Url}
                    onChange={(e) => setPoster1Url(e.target.value)}
                    placeholder="https://... or /assets/aistudio/hero-rooftop-poster.jpg"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <label className="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 border border-slate-700 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingPoster1 ? 'আপলোড...' : 'পোস্টার ১ আপলোড'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePoster1Upload}
                      disabled={uploadingPoster1}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 3. COVER VIDEO 2: আন্ডারগ্রাউন্ড রিজার্ভার ও স্লাজ উত্তোলন */}
            {/* ========================================================= */}
            <div className="bg-slate-900 border border-blue-800/60 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-blue-950 border border-blue-500/60 text-blue-300 text-xs font-bold flex items-center justify-center">
                    ২
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-white">ভিডিও ২: আন্ডারগ্রাউন্ড রিজার্ভার ও স্লাজ উত্তোলন</h3>
                    <p className="text-[11px] text-blue-300/80">Video 2: Underground Reservoir &amp; Sludge Extraction</p>
                  </div>
                </div>
                <span className="text-xs bg-blue-950 text-blue-300 border border-blue-800/80 px-2.5 py-1 rounded-md font-medium">
                  কভার কলাম ২ (মাঝখানে)
                </span>
              </div>

              {/* Video 2 URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Video 2 URL (YouTube লিঙ্ক অথবা সরাসরি MP4 / WebM লিঙ্ক)
                  </label>
                  {extractYouTubeId(video2Url) && (
                    <span className="text-[11px] text-red-400 font-semibold flex items-center gap-1 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/60">
                      🔴 YouTube Detected ({extractYouTubeId(video2Url)})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={video2Url}
                    onChange={(e) => handleVideo2Change(e.target.value)}
                    placeholder="e.g. /videos/tank-cleaning-mobile.mp4 or https://www.youtube.com/watch?v=..."
                    className={`flex-1 bg-slate-950 border rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none font-mono ${
                      video2ErrorBn ? 'border-red-500 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'
                    }`}
                  />
                  {video2Url && (
                    <button
                      type="button"
                      onClick={() => {
                        setVideo2Url('');
                        setVideo2ErrorBn(null);
                      }}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
                      title="Clear Video 2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Video 2 Bengali Validation Error */}
                {video2ErrorBn && (
                  <div className="mt-2 p-2 bg-red-950/80 border border-red-700 text-red-200 text-xs rounded-lg flex items-center gap-1.5 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{video2ErrorBn}</span>
                  </div>
                )}

                {/* Instant YouTube Preview Thumbnail */}
                {extractYouTubeId(video2Url) && (
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-950/90 border border-red-900/60 flex items-center gap-3">
                    <img 
                      src={`https://img.youtube.com/vi/${extractYouTubeId(video2Url)}/hqdefault.jpg`} 
                      alt="YouTube preview 2"
                      className="w-16 h-10 object-cover rounded border border-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="font-semibold text-white truncate">▶ YouTube Video 2 Connected</div>
                      <div className="text-[11px] text-emerald-400">✓ Ready for Autoplay in Hero Column 2</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Video 2 File Upload & Reset */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <label className="cursor-pointer px-3.5 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingVideo2 ? 'ভিডিও আপলোড হচ্ছে...' : 'নতুন ভিডিও ২ আপলোড করুন'}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                    onChange={handleVideo2Upload}
                    disabled={uploadingVideo2}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setVideo2Url('/videos/tank-cleaning-mobile.mp4');
                    setVideo2ErrorBn(null);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>ডিফল্ট ভিডিও ২ সেট করুন</span>
                </button>
              </div>

              {/* Video 2 Poster / Fallback Image */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  ভিডিও ২ পোস্টার ছবি (Fallback Poster Image)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={poster2Url}
                    onChange={(e) => setPoster2Url(e.target.value)}
                    placeholder="https://... or /assets/aistudio/hero-underground-poster.jpg"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <label className="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 border border-slate-700 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingPoster2 ? 'আপলোড...' : 'পোস্টার ২ আপলোড'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePoster2Upload}
                      disabled={uploadingPoster2}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 4. COVER VIDEO 3: পানির পাইপলাইন ফ্লাশিং ও ওয়াশ */}
            {/* ========================================================= */}
            <div className="bg-slate-900 border border-emerald-800/60 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center justify-center">
                    ৩
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-white">ভিডিও ৩: পানির পাইপলাইন ফ্লাশিং ও ওয়াশ</h3>
                    <p className="text-[11px] text-emerald-300/80">Video 3: Pipeline Descaling &amp; Hydro-Pulse Wash</p>
                  </div>
                </div>
                <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2.5 py-1 rounded-md font-medium">
                  কভার কলাম ৩ (ডানপাশে)
                </span>
              </div>

              {/* Video 3 URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Video 3 URL (YouTube লিঙ্ক অথবা সরাসরি MP4 / WebM লিঙ্ক)
                  </label>
                  {extractYouTubeId(video3Url) && (
                    <span className="text-[11px] text-red-400 font-semibold flex items-center gap-1 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/60">
                      🔴 YouTube Detected ({extractYouTubeId(video3Url)})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={video3Url}
                    onChange={(e) => handleVideo3Change(e.target.value)}
                    placeholder="e.g. https://www.youtube.com/watch?v=... or /videos/tank-cleaning-desktop.mp4"
                    className={`flex-1 bg-slate-950 border rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none font-mono ${
                      video3ErrorBn ? 'border-red-500 focus:border-red-400' : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                  {video3Url && (
                    <button
                      type="button"
                      onClick={() => {
                        setVideo3Url('');
                        setVideo3ErrorBn(null);
                      }}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
                      title="Clear Video 3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Video 3 Bengali Validation Error */}
                {video3ErrorBn && (
                  <div className="mt-2 p-2 bg-red-950/80 border border-red-700 text-red-200 text-xs rounded-lg flex items-center gap-1.5 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{video3ErrorBn}</span>
                  </div>
                )}

                {/* Instant YouTube Preview Thumbnail */}
                {extractYouTubeId(video3Url) && (
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-950/90 border border-red-900/60 flex items-center gap-3">
                    <img 
                      src={`https://img.youtube.com/vi/${extractYouTubeId(video3Url)}/hqdefault.jpg`} 
                      alt="YouTube preview 3"
                      className="w-16 h-10 object-cover rounded border border-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="font-semibold text-white truncate">▶ YouTube Video 3 Connected</div>
                      <div className="text-[11px] text-emerald-400">✓ Ready for Autoplay in Hero Column 3</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Video 3 File Upload & Reset */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <label className="cursor-pointer px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingVideo3 ? 'ভিডিও আপলোড হচ্ছে...' : 'নতুন ভিডিও ৩ আপলোড করুন'}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                    onChange={handleVideo3Upload}
                    disabled={uploadingVideo3}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setVideo3Url('');
                    setVideo3ErrorBn(null);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>ভিডিও ৩ ফাঁকা করুন</span>
                </button>
              </div>

              {/* Video 3 Poster / Fallback Image */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  ভিডিও ৩ পোস্টার ছবি (Fallback Poster Image)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={poster3Url}
                    onChange={(e) => setPoster3Url(e.target.value)}
                    placeholder="https://... or https://images.unsplash.com/..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <label className="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 border border-slate-700 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingPoster3 ? 'আপলোড...' : 'পোস্টার ৩ আপলোড'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePoster3Upload}
                      disabled={uploadingPoster3}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Quick 1-Click Realistic Footage Presets */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-semibold text-white">৩টি ভিডিওর প্রস্তুতকৃত ফুটেজ প্রিসেট (Presets):</h4>
                </div>
                <span className="text-[11px] text-slate-400">এক ক্লিকে ৩টি ভিডিও ও পোস্টার লোড করুন</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setVideo1Url('/videos/tank-cleaning-desktop.mp4');
                    setPoster1Url('/assets/aistudio/hero-rooftop-poster.jpg');
                    setVideo2Url('/videos/tank-cleaning-mobile.mp4');
                    setPoster2Url('/assets/aistudio/hero-underground-poster.jpg');
                    setVideo3Url('');
                    setPoster3Url('/assets/aistudio/hero-underground-poster.jpg');
                    setVideoEnabled(true);
                  }}
                  className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-blue-600 rounded-lg text-left transition-all"
                >
                  <div className="font-semibold text-white text-xs">স্ট্যান্ডার্ড ট্রাই-ভিডিও সেট (Default)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">ছাদের ট্যাংক + আন্ডারগ্রাউন্ড রিজার্ভার + পাইপলাইন ওয়াশ</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVideo1Url('/videos/tank-cleaning-desktop.mp4');
                    setPoster1Url('/assets/aistudio/hero-rooftop-poster.jpg');
                    setVideo2Url('/videos/tank-cleaning-desktop.mp4');
                    setPoster2Url('/assets/aistudio/hero-underground-poster.jpg');
                    setVideo3Url('');
                    setPoster3Url('/assets/aistudio/hero-underground-poster.jpg');
                    setVideoEnabled(true);
                  }}
                  className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-cyan-600 rounded-lg text-left transition-all"
                >
                  <div className="font-semibold text-white text-xs">হাই-প্রেশার রোটারি ওয়াশ সেট</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">১৫০ বার রোটারি জেট + ডাবল স্লাজ এক্সট্র্যাকশন</div>
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-400">
                পরিবর্তনগুলো সাথে সাথে Supabase এবং লাইভ ওয়েবসাইটে সেভ হবে।
              </div>
              <button
                type="button"
                onClick={handleSaveHeroVideo}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'ডেটাবেজে সেভ হচ্ছে...' : '৩টি কভার ভিডিও সংরক্ষণ করুন (Save All 3 Videos)'}</span>
              </button>
            </div>
          </div>

          {/* Right column: Live Real-Time Tri-Video Preview */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm sticky top-20">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>কভার ৩টি ভিডিও লাইভ প্রিভিউ</span>
                </span>
                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-2 py-0.5 rounded transition-all ${previewDevice === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                  >
                    Desktop (3 Columns)
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-2 py-0.5 rounded transition-all ${previewDevice === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                  >
                    Mobile (Stacked)
                  </button>
                </div>
              </div>

              {/* Tri-Video Container */}
              <div className="bg-[#123047] p-2 sm:p-2.5 rounded-lg border border-slate-700">
                <div className={previewDevice === 'desktop' ? 'grid grid-cols-3 gap-1.5' : 'grid grid-cols-1 gap-1.5'}>
                  {/* Preview Video 1 */}
                  <div className="w-full aspect-video rounded overflow-hidden bg-black relative border border-cyan-500/30">
                    {extractYouTubeId(video1Url) ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(video1Url)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${extractYouTubeId(video1Url)}&playsinline=1`}
                        className="w-full h-full object-cover pointer-events-none"
                        title="V1"
                      />
                    ) : (
                      <video
                        key={video1Url}
                        src={video1Url}
                        poster={poster1Url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    )}
                    <div className="absolute top-1 left-1 bg-black/70 text-[9px] text-cyan-300 px-1 py-0.5 rounded font-mono">
                      V1: ছাদ
                    </div>
                  </div>

                  {/* Preview Video 2 */}
                  <div className="w-full aspect-video rounded overflow-hidden bg-black relative border border-blue-500/30">
                    {extractYouTubeId(video2Url) ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(video2Url)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${extractYouTubeId(video2Url)}&playsinline=1`}
                        className="w-full h-full object-cover pointer-events-none"
                        title="V2"
                      />
                    ) : (
                      <video
                        key={video2Url}
                        src={video2Url}
                        poster={poster2Url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    )}
                    <div className="absolute top-1 left-1 bg-black/70 text-[9px] text-blue-300 px-1 py-0.5 rounded font-mono">
                      V2: রিজার্ভার
                    </div>
                  </div>

                  {/* Preview Video 3 */}
                  <div className="w-full aspect-video rounded overflow-hidden bg-black relative border border-emerald-500/30">
                    {extractYouTubeId(video3Url) ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(video3Url)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${extractYouTubeId(video3Url)}&playsinline=1`}
                        className="w-full h-full object-cover pointer-events-none"
                        title="V3"
                      />
                    ) : (
                      <video
                        key={video3Url}
                        src={video3Url}
                        poster={poster3Url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    )}
                    <div className="absolute top-1 left-1 bg-black/70 text-[9px] text-emerald-300 px-1 py-0.5 rounded font-mono">
                      V3: পাইপলাইন
                    </div>
                  </div>
                </div>
              </div>

              {/* Status details */}
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] space-y-1.5 text-slate-400">
                <div className="flex justify-between">
                  <span>কভার ভিডিও স্ট্যাটাস:</span>
                  <span className={videoEnabled ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                    {videoEnabled ? 'Active (Auto-Play Muted Loop)' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>লেআউট মোড:</span>
                  <span className="text-white font-medium">৩ কলাম (ডেস্কটপ) / ১ কলাম (মোবাইল)</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="truncate max-w-[120px]">ভিডিও ১:</span>
                  <span className="text-cyan-300 font-mono truncate max-w-[180px]">{video1Url.split('/').pop() || 'Set'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="truncate max-w-[120px]">ভিডিও ২:</span>
                  <span className="text-blue-300 font-mono truncate max-w-[180px]">{video2Url.split('/').pop() || 'Set'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="truncate max-w-[120px]">ভিডিও ৩:</span>
                  <span className="text-emerald-300 font-mono truncate max-w-[180px]">{video3Url.split('/').pop() || 'Set'}</span>
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
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div>
              <h3 className="text-base font-semibold text-white">কভার ৩টি ভিডিও ফুল প্রিভিউ (Tri-Video Live Layout)</h3>
              <p className="text-xs text-slate-400">ডেস্কটপ এবং মোবাইল ভিউতে ৩টি ভিডিও পাশাপাশি ও ওপর-নিচে কীভাবে প্রদর্শিত হচ্ছে তা দেখুন।</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium border ${
                  previewDevice === 'desktop' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                Desktop View (৩টি পাশাপাশি)
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium border ${
                  previewDevice === 'mobile' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                Mobile View (৩টি ওপর-নিচে)
              </button>
            </div>
          </div>

          <div className="w-full bg-[#123047] p-3 sm:p-5 rounded-xl border border-slate-700">
            <div className={previewDevice === 'desktop' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4' : 'max-w-md mx-auto grid grid-cols-1 gap-3'}>
              
              {/* Video 1 Card */}
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-black relative shadow-lg border border-cyan-500/40">
                {extractYouTubeId(video1Url) ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(video1Url)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${extractYouTubeId(video1Url)}&playsinline=1`}
                    className="w-full h-full object-cover"
                    title="Preview Video 1"
                  />
                ) : (
                  <video
                    key={video1Url}
                    src={video1Url}
                    poster={poster1Url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-cyan-300 font-semibold border border-cyan-500/40">
                  ১. ছাদের পানির ট্যাংক ক্লিনিং
                </div>
              </div>

              {/* Video 2 Card */}
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-black relative shadow-lg border border-blue-500/40">
                {extractYouTubeId(video2Url) ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(video2Url)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${extractYouTubeId(video2Url)}&playsinline=1`}
                    className="w-full h-full object-cover"
                    title="Preview Video 2"
                  />
                ) : (
                  <video
                    key={video2Url}
                    src={video2Url}
                    poster={poster2Url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-blue-300 font-semibold border border-blue-500/40">
                  ২. আন্ডারগ্রাউন্ড রিজার্ভার ও স্লাজ উত্তোলন
                </div>
              </div>

              {/* Video 3 Card */}
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-black relative shadow-lg border border-emerald-500/40">
                {extractYouTubeId(video3Url) ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(video3Url)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${extractYouTubeId(video3Url)}&playsinline=1`}
                    className="w-full h-full object-cover"
                    title="Preview Video 3"
                  />
                ) : (
                  <video
                    key={video3Url}
                    src={video3Url}
                    poster={poster3Url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-emerald-300 font-semibold border border-emerald-500/40">
                  ৩. পানির পাইপলাইন ফ্লাশিং ও ওয়াশ
                </div>
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
