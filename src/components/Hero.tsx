import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useHomepageCms } from '../context/HomepageCmsContext';
import { extractYouTubeId } from '../services/mediaService';

interface HeroProps {
  onOpenQuoteModal?: () => void;
}

export const Hero: React.FC<HeroProps> = () => {
  const { lang } = useLanguage();
  const { hero, images } = useSiteConfig();
  const { sections } = useHomepageCms();

  // Find CMS hero section settings if present, otherwise fall back to siteConfig hero
  const cmsHeroSection = sections.find(s => s.sectionKey === 'hero');

  const desktopVideoUrl = cmsHeroSection?.videoUrl || hero.videoUrl || '/videos/tank-cleaning-desktop.mp4';
  const mobileVideoUrl = cmsHeroSection?.mobileVideoUrl || hero.mobileVideoUrl || '/videos/tank-cleaning-mobile.mp4';
  const posterImageUrl = cmsHeroSection?.posterImageUrl || images?.heroPoster || hero.posterImageUrl || hero.bgImageUrl;

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const desktopYtId = extractYouTubeId(desktopVideoUrl);
  const mobileYtId = extractYouTubeId(mobileVideoUrl);
  const activeYtId = isMobileScreen && mobileYtId ? mobileYtId : (desktopYtId || mobileYtId);
  const effectivePoster = posterImageUrl || (activeYtId ? `https://img.youtube.com/vi/${activeYtId}/maxresdefault.jpg` : undefined);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  }, [desktopVideoUrl, mobileVideoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  return (
    <section 
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#123047] border-b border-[#E2E8F0] select-none group"
      aria-labelledby="hero-heading"
    >
      {/* Hidden Accessible H1 for SEO Integrity (No visual box/text displayed) */}
      <h1 id="hero-heading" className="sr-only">
        {lang === 'bn' 
          ? 'ঢাকায় প্রফেশনাল ওয়াটার ট্যাংক ক্লিনিং সার্ভিস - Sunviloz Clean Care' 
          : 'Professional Water Tank Cleaning Service in Dhaka - Sunviloz Clean Care'}
      </h1>

      {/* FULL-WIDTH RESPONSIVE VIDEO CONTAINER */}
      <div className="relative w-full h-[52vh] min-h-[340px] sm:h-[62vh] sm:min-h-[460px] lg:h-[76vh] lg:min-h-[580px] max-h-[760px] bg-black flex items-center justify-center overflow-hidden">
        {activeYtId ? (
          <div className="relative w-full h-full overflow-hidden">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeYtId}?autoplay=1&mute=1&controls=1&loop=1&playlist=${activeYtId}&playsinline=1&rel=0&showinfo=0&modestbranding=1`}
              title="Sunviloz Clean Care - Water Tank Cleaning Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-0 pointer-events-auto"
              style={{
                width: '100vw',
                height: '56.25vw',
                minHeight: '100%',
                minWidth: '177.77vh'
              }}
            />
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              poster={effectivePoster}
              onLoadedData={() => setVideoLoaded(true)}
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover object-center transition-opacity duration-500 opacity-100"
              preload="auto"
            >
              {mobileVideoUrl && (
                <source src={mobileVideoUrl} type="video/mp4" media="(max-width: 640px)" />
              )}
              <source src={desktopVideoUrl} type="video/mp4" />
            </video>

            {/* Poster fallback if video fails */}
            {videoError && effectivePoster && (
              <img 
                src={effectivePoster} 
                alt="Sunviloz Water Tank Cleaning" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* SLEEK FLOATING VIDEO CONTROLS (BOTTOM-RIGHT) */}
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex items-center gap-2 bg-[#123047]/85 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/20 shadow-xl transition-opacity duration-300 opacity-90 group-hover:opacity-100">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-white/80" /> : <Volume2 className="w-4 h-4 text-[#38BDF8]" />}
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label="Toggle fullscreen"
                className="w-9 h-9 hidden sm:flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <Maximize2 className="w-4 h-4 text-white/80" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Hero;
