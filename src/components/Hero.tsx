import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  MapPin, 
  Layers,
  Sparkles,
  ShieldCheck,
  Video,
  Eye,
  EyeOff,
  Droplets
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useHomepageCms } from '../context/HomepageCmsContext';
import { trackEvent, trackWhatsAppClick } from '../utils/tracking';
import { RealisticWaterHeroBackdrop } from './RealisticWaterHeroBackdrop';
import { extractYouTubeId } from '../services/mediaService';

interface HeroProps {
  onOpenQuoteModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenQuoteModal }) => {
  const { lang } = useLanguage();
  const { hero, business, images } = useSiteConfig();
  const { sections } = useHomepageCms();

  // Find CMS hero section settings if present, otherwise fall back to siteConfig hero
  const cmsHeroSection = sections.find(s => s.sectionKey === 'hero');

  // Video and background configuration loaded dynamically from settings/database/storage
  const isVideoEnabled = cmsHeroSection?.settings?.videoEnabled ?? hero.videoEnabled ?? true;
  const desktopVideoUrl = cmsHeroSection?.videoUrl || hero.videoUrl || '/videos/tank-cleaning-desktop.mp4';
  const mobileVideoUrl = cmsHeroSection?.mobileVideoUrl || hero.mobileVideoUrl || '/videos/tank-cleaning-mobile.mp4';
  const posterImageUrl = cmsHeroSection?.posterImageUrl || images?.heroPoster || hero.posterImageUrl || hero.bgImageUrl || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75';
  
  // Overlay opacity (range 0.20 to 0.95, default 0.72)
  const overlayOpacity = cmsHeroSection?.settings?.overlayOpacity ?? hero.overlayOpacity ?? 0.72;
  const overlayColor = cmsHeroSection?.settings?.overlayColor ?? hero.overlayColor ?? 'navy';

  // Video element and performance states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // Check screen width for mobile video adaptation
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Detect YouTube video IDs
  const desktopYtId = extractYouTubeId(desktopVideoUrl);
  const mobileYtId = extractYouTubeId(mobileVideoUrl);
  const activeYtId = isMobileScreen && mobileYtId ? mobileYtId : (desktopYtId || mobileYtId);
  const effectivePoster = posterImageUrl || (activeYtId ? `https://img.youtube.com/vi/${activeYtId}/maxresdefault.jpg` : undefined);

  // Check prefers-reduced-motion for accessibility & performance
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Ensure video auto-plays muted
  useEffect(() => {
    if (videoRef.current && !prefersReducedMotion && isVideoEnabled) {
      videoRef.current.play().catch(() => {
        // Autoplay policy prevented playback, keep poster fallback
      });
    }
  }, [prefersReducedMotion, isVideoEnabled, desktopVideoUrl]);

  // Core conversion headlines (Mandatory: Bengali headline "ঢাকায় প্রফেশনাল ওয়াটার ট্যাংক ক্লিনিং সার্ভিস")
  const headline = lang === 'bn'
    ? (hero.headingBn || cmsHeroSection?.titleBn || 'ঢাকায় প্রফেশনাল ওয়াটার ট্যাংক ক্লিনিং সার্ভিস')
    : (hero.headingEn || cmsHeroSection?.title || 'Professional Water Tank Cleaning Service in Dhaka');

  const subheadline = lang === 'bn'
    ? (hero.subheadlineBn || hero.subheadingBn || cmsHeroSection?.subtitleBn || 'নিয়মিত পানির ট্যাংক পরিষ্কার রাখা আপনার ও পরিবারের সুস্থতার জন্য জরুরি। আপনার ট্যাংকের তথ্য জানিয়ে রিকোয়েস্ট করুন, আমাদের টিম সঠিক কোটেশন প্রদান করবে।')
    : (hero.subheadlineEn || hero.subheadingEn || cmsHeroSection?.subtitle || 'Regular water tank and pipeline cleaning is essential for hygienic, safe water. Share your tank details — our team will review and provide a tailored quotation.');

  const areaBadge = lang === 'bn'
    ? (hero.servingAreaBadgeBn || cmsHeroSection?.badgeBn || 'ঢাকা শহরের সকল এলাকায় সার্ভিস প্রদান')
    : (hero.servingAreaBadgeEn || cmsHeroSection?.badge || 'Serving All Areas Across Dhaka');

  const handleScrollToServices = () => {
    const el = document.getElementById('popular-services') || document.getElementById('services');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToQuote = () => {
    const el = document.getElementById('quote');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onOpenQuoteModal();
    }
  };

  // Determine overlay background color style
  const getOverlayStyle = () => {
    if (overlayColor === 'black') {
      return {
        backgroundColor: `rgba(2, 6, 23, ${overlayOpacity})`
      };
    }
    if (overlayColor === 'darkBlue') {
      return {
        backgroundColor: `rgba(11, 43, 92, ${overlayOpacity})`
      };
    }
    // Navy default (#07172c with slight gradient for rich depth)
    return {
      background: `linear-gradient(135deg, rgba(7, 23, 44, ${overlayOpacity}) 0%, rgba(11, 37, 69, ${Math.min(0.96, overlayOpacity + 0.08)}) 100%)`
    };
  };

  return (
    <section 
      className="relative w-full overflow-hidden min-h-[600px] sm:min-h-[660px] lg:min-h-[720px] flex items-center justify-center border-b border-cyan-900/40"
      aria-labelledby="hero-heading"
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. REALISTIC WATER SURFACE BACKDROP (CAUSTICS, RAYS, RIPPLES, WAVES) */}
      {/* ------------------------------------------------------------- */}
      <RealisticWaterHeroBackdrop 
        reducedMotion={prefersReducedMotion} 
        className="z-1"
      />

      {/* ------------------------------------------------------------- */}
      {/* 2. OPTIONAL VIDEO LAYER (YOUTUBE EMBED OR DIRECT MP4/WEBM)    */}
      {/* ------------------------------------------------------------- */}
      {isVideoEnabled && !prefersReducedMotion ? (
        activeYtId ? (
          <div 
            className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none transition-opacity duration-700 opacity-60 mix-blend-luminosity"
            style={{ zIndex: 2 }}
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeYtId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${activeYtId}&playsinline=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&modestbranding=1&enablejsapi=1`}
              title="Hero Background Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none border-0"
              style={{
                width: '100vw',
                height: '56.25vw',
                minHeight: '100%',
                minWidth: '177.77vh'
              }}
            />
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            poster={effectivePoster}
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => setVideoError(true)}
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-700 opacity-50 mix-blend-luminosity"
            style={{
              zIndex: 2
            }}
            preload="metadata"
          >
            {mobileVideoUrl && (
              <source src={mobileVideoUrl} type="video/mp4" media="(max-width: 640px)" />
            )}
            <source src={desktopVideoUrl} type="video/mp4" />
          </video>
        )
      ) : null}

      {/* Fallback Poster Image subtle blend if video is disabled or reduced-motion is requested */}
      {(!isVideoEnabled || prefersReducedMotion || videoError) && effectivePoster && (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center pointer-events-none opacity-25 mix-blend-overlay"
          style={{
            backgroundImage: `url('${effectivePoster}')`,
            zIndex: 2
          }}
        />
      )}

      {/* Custom Dark Color Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-300"
        style={{
          ...getOverlayStyle(),
          zIndex: 2
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* 3. SUBTLE WATER DEPTH VIGNETTE & CONTRAST GRADIENT             */}
      {/* ------------------------------------------------------------- */}
      <div 
        className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#040D1A] via-transparent to-[#040D1A]/60"
        style={{ zIndex: 3 }}
      />

      {/* ------------------------------------------------------------- */}
      {/* 4. CURRENT HERO CONTENT & CTA BUTTONS (PROTECTED BY READABILITY SHIELD) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 text-white">
        <div className="max-w-3xl space-y-6 water-text-shield p-6 sm:p-8 md:p-10 rounded-3xl">

          {/* Location & Brand Kicker */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-cyan-400/30 text-xs sm:text-sm font-bold text-cyan-200 shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span className="tracking-wide">{areaBadge}</span>
            <span className="text-cyan-400/50" aria-hidden="true">•</span>
            <span className="text-white font-extrabold">{business.name}</span>
          </div>

          {/* Main Conversion Bengali / English Headline (Unchanged) */}
          <h1 
            id="hero-heading" 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-black text-white tracking-tight leading-[1.2] drop-shadow-md text-balance"
          >
            {headline}
          </h1>

          {/* Supporting Subheadline / Description (Unchanged) */}
          <p className="text-base sm:text-lg text-slate-100 font-normal leading-relaxed max-w-2xl drop-shadow-sm text-balance">
            {subheadline}
          </p>

          {/* Verified Service Guarantees List (Unchanged, enhanced with clean backdrop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-white/95 bg-slate-950/40 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>{lang === 'bn' ? 'নিরাপদ খাদ্য-বান্ধব ডিসইনফেকশন' : 'Safe Food-Grade Disinfection'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-white/95 bg-slate-950/40 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>{lang === 'bn' ? '১২০-১৫০ বার রোটারি হাই-প্রেসার ওয়াশ' : '120-150 Bar Rotary Pressure Jet Wash'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-white/95 bg-slate-950/40 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>{lang === 'bn' ? 'সাবমারসিবল কাদা ও স্লাজ উত্তোলন' : 'Submersible Sump Sludge Extraction'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-white/95 bg-slate-950/40 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>{lang === 'bn' ? 'ট্যাংকের সাইজ অনুযায়ী সঠিক কোটেশন' : 'Accurate Quotation by Tank Specifications'}</span>
            </div>
          </div>

          {/* 3 Call to Action Buttons (All Existing Buttons & Functionality Maintained) */}
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Primary CTA: কোটেশন রিকোয়েস্ট করুন */}
            <button
              type="button"
              onClick={() => {
                trackEvent('quote_click', { source: 'hero_primary_quote_cta' });
                handleScrollToQuote();
              }}
              className="flex items-center justify-center gap-2 min-h-[52px] px-8 py-3 text-sm sm:text-base font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-300"
            >
              <span>{lang === 'bn' ? (hero.ctaQuoteTextBn || 'কোটেশন রিকোয়েস্ট করুন') : (hero.ctaQuoteTextEn || 'Request a Quote')}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" aria-hidden="true" />
            </button>

            {/* Secondary CTA: WhatsApp-এ যোগাযোগ */}
            <a
              href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Sunviloz Clean Care, I would like to get information and a quote for water tank cleaning in Dhaka.')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick({ source: 'hero_secondary_whatsapp' })}
              className="flex items-center justify-center gap-2 min-h-[52px] px-7 py-3 text-sm sm:text-base font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg hover:shadow-emerald-600/25 transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-emerald-400"
              aria-label="Contact on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-white" aria-hidden="true" />
              <span>{lang === 'bn' ? 'WhatsApp-এ যোগাযোগ' : 'Chat on WhatsApp'}</span>
            </a>

            {/* Third CTA: সেবাসমূহ দেখুন */}
            <button
              type="button"
              onClick={handleScrollToServices}
              className="flex items-center justify-center gap-2 min-h-[52px] px-6 py-3 text-sm sm:text-base font-bold text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 rounded-xl transition-all cursor-pointer active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
            >
              <Layers className="w-4 h-4 text-cyan-300" aria-hidden="true" />
              <span>{lang === 'bn' ? 'সেবাসমূহ দেখুন' : 'Explore Services'}</span>
            </button>
          </div>

          {/* Quick Contact & Operating Hours Strip (Unchanged) */}
          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-5 text-xs text-slate-200">
            <a
              href={`tel:${business.phone}`}
              onClick={() => trackEvent('phone_click', { source: 'hero_hotline' })}
              className="inline-flex items-center gap-1.5 font-bold text-white hover:text-cyan-300 transition-colors py-1"
              aria-label={`Call hotline ${business.displayPhone}`}
            >
              <Phone className="w-3.5 h-3.5 text-cyan-300" aria-hidden="true" />
              <span>হটলাইন: {business.displayPhone}</span>
            </a>

            <span className="text-white/40 hidden sm:inline" aria-hidden="true">•</span>

            <div className="flex items-center gap-1 text-slate-200">
              <Clock className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span>{lang === 'bn' ? business.operatingHoursBn : business.operatingHours}</span>
            </div>

            <span className="text-white/40 hidden sm:inline" aria-hidden="true">•</span>

            <div className="flex items-center gap-1 text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>{lang === 'bn' ? 'ঢাকা মেট্রো ও পার্শ্ববর্তী এলাকা' : 'Dhaka Metro & Regional'}</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
