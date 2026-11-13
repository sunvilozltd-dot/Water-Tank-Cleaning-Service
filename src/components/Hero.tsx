import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Video } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useHomepageCms } from '../context/HomepageCmsContext';
import { extractYouTubeId } from '../services/mediaService';
import { isDemoMedia } from '../services/homepageCmsService';

interface HeroProps {
  onOpenQuoteModal?: () => void;
}

export const Hero: React.FC<HeroProps> = () => {
  const { hero } = useSiteConfig();
  const { sections } = useHomepageCms();

  const cmsHeroSection = sections.find(s => s.sectionKey === 'hero');

  // Video 1 source & poster (Rooftop Tank Cleaning)
  // Strictly display administrator-configured media only; 0 hardcoded fallback URLs
  const rawVideo1 = cmsHeroSection?.videoUrl || hero.videoUrl;
  const video1Url = (!rawVideo1 || isDemoMedia(rawVideo1)) ? undefined : rawVideo1.trim();
  const rawPoster1 = cmsHeroSection?.posterImageUrl || hero.posterImageUrl;
  const video1Poster = (!rawPoster1 || isDemoMedia(rawPoster1)) ? undefined : rawPoster1.trim();

  // Video 2 source & poster (Underground Reservoir & Sludge Extraction)
  const rawVideo2 = cmsHeroSection?.video2Url || cmsHeroSection?.mobileVideoUrl || hero.video2Url || hero.mobileVideoUrl;
  const video2Url = (!rawVideo2 || isDemoMedia(rawVideo2)) ? undefined : rawVideo2.trim();
  const rawPoster2 = cmsHeroSection?.posterImage2Url || hero.posterImage2Url;
  const video2Poster = (!rawPoster2 || isDemoMedia(rawPoster2)) ? undefined : rawPoster2.trim();

  // Video 3 source & poster (Water Pipeline Cleaning)
  const rawVideo3 = cmsHeroSection?.video3Url || hero.video3Url;
  const video3Url = (!rawVideo3 || isDemoMedia(rawVideo3)) ? undefined : rawVideo3.trim();
  const rawPoster3 = cmsHeroSection?.posterImage3Url || hero.posterImage3Url;
  const video3Poster = (!rawPoster3 || isDemoMedia(rawPoster3)) ? undefined : rawPoster3.trim();

  // Video 1 Refs & State
  const video1Ref = useRef<HTMLVideoElement>(null);
  const [isPlaying1, setIsPlaying1] = useState(true);
  const [isMuted1, setIsMuted1] = useState(true);
  const [hasError1, setHasError1] = useState(false);
  const [posterError1, setPosterError1] = useState(false);

  // Video 2 Refs & State
  const video2Ref = useRef<HTMLVideoElement>(null);
  const video2ContainerRef = useRef<HTMLDivElement>(null);
  const [video2InView, setVideo2InView] = useState(false);
  const [isPlaying2, setIsPlaying2] = useState(true);
  const [isMuted2, setIsMuted2] = useState(true);
  const [hasError2, setHasError2] = useState(false);
  const [posterError2, setPosterError2] = useState(false);

  // Video 3 Refs & State
  const video3Ref = useRef<HTMLVideoElement>(null);
  const video3ContainerRef = useRef<HTMLDivElement>(null);
  const [video3InView, setVideo3InView] = useState(false);
  const [isPlaying3, setIsPlaying3] = useState(true);
  const [isMuted3, setIsMuted3] = useState(true);
  const [hasError3, setHasError3] = useState(false);
  const [posterError3, setPosterError3] = useState(false);

  // IntersectionObserver to load below-the-fold or secondary hero players politely
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // On larger desktop screens (>=1024px), videos are side-by-side, activate promptly
    if (window.innerWidth >= 1024) {
      setVideo2InView(true);
      setVideo3InView(true);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setVideo2InView(true);
      setVideo3InView(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === video2ContainerRef.current) setVideo2InView(true);
          if (entry.target === video3ContainerRef.current) setVideo3InView(true);
        }
      });
    }, { rootMargin: '300px' });

    if (video2ContainerRef.current) observer.observe(video2ContainerRef.current);
    if (video3ContainerRef.current) observer.observe(video3ContainerRef.current);

    return () => observer.disconnect();
  }, []);

  // Auto-play videos when refs become available
  useEffect(() => {
    if (video1Ref.current && video1Url) {
      video1Ref.current.play().then(() => setIsPlaying1(true)).catch(() => setIsPlaying1(false));
    }
    if (video2Ref.current && video2InView && video2Url) {
      video2Ref.current.play().then(() => setIsPlaying2(true)).catch(() => setIsPlaying2(false));
    }
    if (video3Ref.current && video3InView && video3Url) {
      video3Ref.current.play().then(() => setIsPlaying3(true)).catch(() => setIsPlaying3(false));
    }
  }, [video1Url, video2Url, video3Url, video2InView, video3InView]);

  // Video 1 Controls
  const togglePlay1 = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!video1Ref.current) return;
    if (video1Ref.current.paused) {
      video1Ref.current.play();
      setIsPlaying1(true);
    } else {
      video1Ref.current.pause();
      setIsPlaying1(false);
    }
  };

  const toggleMute1 = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!video1Ref.current) return;
    video1Ref.current.muted = !video1Ref.current.muted;
    setIsMuted1(video1Ref.current.muted);
  };

  // Video 2 Controls
  const togglePlay2 = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!video2Ref.current) return;
    if (video2Ref.current.paused) {
      video2Ref.current.play();
      setIsPlaying2(true);
    } else {
      video2Ref.current.pause();
      setIsPlaying2(false);
    }
  };

  const toggleMute2 = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!video2Ref.current) return;
    video2Ref.current.muted = !video2Ref.current.muted;
    setIsMuted2(video2Ref.current.muted);
  };

  // Video 3 Controls
  const togglePlay3 = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!video3Ref.current) return;
    if (video3Ref.current.paused) {
      video3Ref.current.play();
      setIsPlaying3(true);
    } else {
      video3Ref.current.pause();
      setIsPlaying3(false);
    }
  };

  const toggleMute3 = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!video3Ref.current) return;
    video3Ref.current.muted = !video3Ref.current.muted;
    setIsMuted3(video3Ref.current.muted);
  };

  const ytId1 = video1Url ? extractYouTubeId(video1Url) : null;
  const ytId2 = video2Url ? extractYouTubeId(video2Url) : null;
  const ytId3 = video3Url ? extractYouTubeId(video3Url) : null;

  const hasVideo1 = Boolean(ytId1 || video1Url);
  const hasVideo2 = Boolean(ytId2 || video2Url);
  const hasVideo3 = Boolean(ytId3 || video3Url);

  return (
    <section 
      aria-label="Cover Videos" 
      className="w-full bg-[#123047] py-2 sm:py-3 lg:py-4 px-2 sm:px-4 lg:px-6 transition-all"
    >
      <div className="max-w-7xl mx-auto">
        {/*
          Responsive Tri-Video Layout:
          1. Desktop (>= 1024px): 3 equal columns (lg:grid-cols-3)
          2. Tablet (768px - 1023px): md:grid-cols-2 with Video 3 centered in row 2
          3. Mobile (< 768px): grid-cols-1 stacked vertically
          Strict zero-demo discipline: Only administrator-configured media is shown.
          If media is unconfigured or unavailable, container dimensions (aspect-video)
          are preserved with a neutral background, guaranteeing CLS = 0.
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 lg:gap-4 items-center">
          
          {/* ================= VIDEO 1 ================= */}
          <div 
            className="w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-[#0F2333] border border-slate-800/80 relative shadow-lg group cursor-pointer"
            onClick={hasVideo1 ? togglePlay1 : undefined}
          >
            {hasVideo1 ? (
              ytId1 ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${ytId1}?autoplay=1&mute=1&controls=1&loop=1&playlist=${ytId1}&playsinline=1&rel=0`}
                  title="SUNVILOZ mechanized water tank cleaning service demonstration in Dhaka"
                  loading="eager"
                  width="560"
                  height="315"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  className="w-full h-full border-0 object-contain bg-black"
                />
              ) : (
                <>
                  <video
                    ref={video1Ref}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={!posterError1 ? video1Poster : undefined}
                    onError={() => setHasError1(true)}
                    className="w-full h-full object-contain bg-black"
                  >
                    <source src={video1Url} type="video/mp4" />
                  </video>

                  {/* Poster fallback when video load fails */}
                  {hasError1 && (
                    !posterError1 && video1Poster ? (
                      <img 
                        src={video1Poster} 
                        alt="SUNVILOZ mechanized water tank cleaning service demonstration in Dhaka" 
                        width="560"
                        height="315"
                        onError={() => setPosterError1(true)}
                        className="absolute inset-0 w-full h-full object-contain bg-black" 
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-[#0F2333] flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                        <Video className="w-8 h-8 mb-2 text-slate-500 opacity-60" />
                        <span className="text-xs font-medium text-slate-300">ভিডিও বর্তমানে অনুপলব্ধ / Video unavailable</span>
                      </div>
                    )
                  )}

                  {/* Floating Media Controls */}
                  <div 
                    className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm p-1 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={togglePlay1}
                      aria-label={isPlaying1 ? 'Pause Video 1' : 'Play Video 1'}
                      className="w-7 h-7 flex items-center justify-center rounded bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                      {isPlaying1 ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute1}
                      aria-label={isMuted1 ? 'Unmute Video 1' : 'Mute Video 1'}
                      className="w-7 h-7 flex items-center justify-center rounded bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                      {isMuted1 ? <VolumeX className="w-3.5 h-3.5 text-white/80" /> : <Volume2 className="w-3.5 h-3.5 text-[#38BDF8]" />}
                    </button>
                  </div>
                </>
              )
            ) : (
              /* Neutral empty state when slot 1 has no video configured */
              <div className="w-full h-full bg-[#0F2333] flex flex-col items-center justify-center text-slate-400 p-4 text-center select-none">
                <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center mb-2 text-slate-400">
                  <Video className="w-5 h-5 opacity-60" />
                </div>
                <span className="text-xs font-semibold text-slate-300">ভিডিও স্লট ১</span>
                <span className="text-[11px] text-slate-500 mt-0.5">অ্যাডমিন প্যানেল থেকে কনফিগার করুন</span>
              </div>
            )}
          </div>

          {/* ================= VIDEO 2 ================= */}
          <div 
            ref={video2ContainerRef}
            className="w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-[#0F2333] border border-slate-800/80 relative shadow-lg group cursor-pointer"
            onClick={(e) => {
              if (!video2InView) setVideo2InView(true);
              if (hasVideo2) togglePlay2(e);
            }}
          >
            {hasVideo2 ? (
              ytId2 ? (
                video2InView ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytId2}?autoplay=1&mute=1&controls=1&loop=1&playlist=${ytId2}&playsinline=1&rel=0`}
                    title="Overhead water tank rotary jet scrubbing and sludge extraction demonstration"
                    loading="lazy"
                    width="560"
                    height="315"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    className="w-full h-full border-0 object-contain bg-black"
                  />
                ) : (
                  <div className="relative w-full h-full bg-[#0F2333] flex items-center justify-center">
                    {!posterError2 && video2Poster ? (
                      <img
                        src={video2Poster}
                        alt="Overhead water tank rotary jet scrubbing and sludge extraction demonstration"
                        loading="lazy"
                        decoding="async"
                        width="560"
                        height="315"
                        onError={() => setPosterError2(true)}
                        className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#0F2333] flex items-center justify-center">
                        <Video className="w-8 h-8 text-slate-500 opacity-60" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <>
                  <video
                    ref={video2Ref}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={!posterError2 ? video2Poster : undefined}
                    onError={() => setHasError2(true)}
                    className="w-full h-full object-contain bg-black"
                  >
                    <source src={video2Url} type="video/mp4" />
                  </video>

                  {/* Poster fallback when video load fails */}
                  {hasError2 && (
                    !posterError2 && video2Poster ? (
                      <img 
                        src={video2Poster} 
                        alt="Overhead water tank rotary jet scrubbing and sludge extraction demonstration" 
                        width="560"
                        height="315"
                        onError={() => setPosterError2(true)}
                        className="absolute inset-0 w-full h-full object-contain bg-black" 
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-[#0F2333] flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                        <Video className="w-8 h-8 mb-2 text-slate-500 opacity-60" />
                        <span className="text-xs font-medium text-slate-300">ভিডিও বর্তমানে অনুপলব্ধ / Video unavailable</span>
                      </div>
                    )
                  )}

                  {/* Floating Media Controls */}
                  <div 
                    className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm p-1 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={togglePlay2}
                      aria-label={isPlaying2 ? 'Pause Video 2' : 'Play Video 2'}
                      className="w-7 h-7 flex items-center justify-center rounded bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                      {isPlaying2 ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute2}
                      aria-label={isMuted2 ? 'Unmute Video 2' : 'Mute Video 2'}
                      className="w-7 h-7 flex items-center justify-center rounded bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                      {isMuted2 ? <VolumeX className="w-3.5 h-3.5 text-white/80" /> : <Volume2 className="w-3.5 h-3.5 text-[#38BDF8]" />}
                    </button>
                  </div>
                </>
              )
            ) : (
              /* Neutral empty state when slot 2 has no video configured */
              <div className="w-full h-full bg-[#0F2333] flex flex-col items-center justify-center text-slate-400 p-4 text-center select-none">
                <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center mb-2 text-slate-400">
                  <Video className="w-5 h-5 opacity-60" />
                </div>
                <span className="text-xs font-semibold text-slate-300">ভিডিও স্লট ২</span>
                <span className="text-[11px] text-slate-500 mt-0.5">অ্যাডমিন প্যানেল থেকে কনফিগার করুন</span>
              </div>
            )}
          </div>

          {/* ================= VIDEO 3 ================= */}
          <div 
            ref={video3ContainerRef}
            className="w-full md:col-span-2 lg:col-span-1 md:w-1/2 md:mx-auto lg:w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-[#0F2333] border border-slate-800/80 relative shadow-lg group cursor-pointer"
            onClick={(e) => {
              if (!video3InView) setVideo3InView(true);
              if (hasVideo3) togglePlay3(e);
            }}
          >
            {hasVideo3 ? (
              ytId3 ? (
                video3InView ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytId3}?autoplay=1&mute=1&controls=1&loop=1&playlist=${ytId3}&playsinline=1&rel=0`}
                    title="Underground reserve tank deep cleaning and pipeline flushing demonstration"
                    loading="lazy"
                    width="560"
                    height="315"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    className="w-full h-full border-0 object-contain bg-black"
                  />
                ) : (
                  <div className="relative w-full h-full bg-[#0F2333] flex items-center justify-center">
                    {!posterError3 && video3Poster ? (
                      <img
                        src={video3Poster}
                        alt="Underground reserve tank deep cleaning and pipeline flushing demonstration"
                        loading="lazy"
                        decoding="async"
                        width="560"
                        height="315"
                        onError={() => setPosterError3(true)}
                        className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#0F2333] flex items-center justify-center">
                        <Video className="w-8 h-8 text-slate-500 opacity-60" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <>
                  <video
                    ref={video3Ref}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={!posterError3 ? video3Poster : undefined}
                    onError={() => setHasError3(true)}
                    className="w-full h-full object-contain bg-black"
                  >
                    <source src={video3Url} type="video/mp4" />
                  </video>

                  {/* Poster fallback when video load fails */}
                  {hasError3 && (
                    !posterError3 && video3Poster ? (
                      <img 
                        src={video3Poster} 
                        alt="Underground reserve tank deep cleaning and pipeline flushing demonstration" 
                        width="560"
                        height="315"
                        onError={() => setPosterError3(true)}
                        className="absolute inset-0 w-full h-full object-contain bg-black" 
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-[#0F2333] flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                        <Video className="w-8 h-8 mb-2 text-slate-500 opacity-60" />
                        <span className="text-xs font-medium text-slate-300">ভিডিও বর্তমানে অনুপলব্ধ / Video unavailable</span>
                      </div>
                    )
                  )}

                  {/* Floating Media Controls */}
                  <div 
                    className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm p-1 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={togglePlay3}
                      aria-label={isPlaying3 ? 'Pause Video 3' : 'Play Video 3'}
                      className="w-7 h-7 flex items-center justify-center rounded bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                      {isPlaying3 ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute3}
                      aria-label={isMuted3 ? 'Unmute Video 3' : 'Mute Video 3'}
                      className="w-7 h-7 flex items-center justify-center rounded bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                      {isMuted3 ? <VolumeX className="w-3.5 h-3.5 text-white/80" /> : <Volume2 className="w-3.5 h-3.5 text-[#38BDF8]" />}
                    </button>
                  </div>
                </>
              )
            ) : (
              /* Neutral empty state when slot 3 has no video configured */
              <div className="w-full h-full bg-[#0F2333] flex flex-col items-center justify-center text-slate-400 p-4 text-center select-none">
                <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center mb-2 text-slate-400">
                  <Video className="w-5 h-5 opacity-60" />
                </div>
                <span className="text-xs font-semibold text-slate-300">ভিডিও স্লট ৩</span>
                <span className="text-[11px] text-slate-500 mt-0.5">অ্যাডমিন প্যানেল থেকে কনফিগার করুন</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
