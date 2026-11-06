import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useHomepageCms } from '../context/HomepageCmsContext';
import { extractYouTubeId } from '../services/mediaService';

interface HeroProps {
  onOpenQuoteModal?: () => void;
}

export const Hero: React.FC<HeroProps> = () => {
  const { hero } = useSiteConfig();
  const { sections } = useHomepageCms();

  const cmsHeroSection = sections.find(s => s.sectionKey === 'hero');

  // Video 1 source & poster (Rooftop Tank Cleaning)
  const video1Url = cmsHeroSection?.videoUrl || hero.videoUrl || '/videos/tank-cleaning-desktop.mp4';
  const video1Poster = cmsHeroSection?.posterImageUrl || hero.posterImageUrl || '/assets/aistudio/hero-rooftop-poster.jpg';

  // Video 2 source & poster (Underground Reservoir & Sludge Extraction)
  const video2Url = cmsHeroSection?.video2Url || cmsHeroSection?.mobileVideoUrl || hero.video2Url || hero.mobileVideoUrl || '/videos/tank-cleaning-mobile.mp4';
  const video2Poster = cmsHeroSection?.posterImage2Url || hero.posterImage2Url || '/assets/aistudio/hero-underground-poster.jpg';

  // Video 3 source & poster (Water Supply Pipeline Descaling & Hydro-Pulse Wash)
  const video3Url = cmsHeroSection?.video3Url || hero.video3Url || 'https://spwatertankcleaner.com/wp-content/uploads/2025/08/how-to-clean-water-tank-_-hygyniec-water-tank-cleaning-_-Overhead-water-tank-cleaning.mp4';
  const video3Poster = cmsHeroSection?.posterImage3Url || hero.posterImage3Url || 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=75';

  // Video 1 Refs & State
  const video1Ref = useRef<HTMLVideoElement>(null);
  const [isPlaying1, setIsPlaying1] = useState(true);
  const [isMuted1, setIsMuted1] = useState(true);
  const [hasError1, setHasError1] = useState(false);

  // Video 2 Refs & State
  const video2Ref = useRef<HTMLVideoElement>(null);
  const [isPlaying2, setIsPlaying2] = useState(true);
  const [isMuted2, setIsMuted2] = useState(true);
  const [hasError2, setHasError2] = useState(false);

  // Video 3 Refs & State
  const video3Ref = useRef<HTMLVideoElement>(null);
  const [isPlaying3, setIsPlaying3] = useState(true);
  const [isMuted3, setIsMuted3] = useState(true);
  const [hasError3, setHasError3] = useState(false);

  // Auto-play all 3 videos reliably on mount
  useEffect(() => {
    if (video1Ref.current) {
      video1Ref.current.play().then(() => setIsPlaying1(true)).catch(() => setIsPlaying1(false));
    }
    if (video2Ref.current) {
      video2Ref.current.play().then(() => setIsPlaying2(true)).catch(() => setIsPlaying2(false));
    }
    if (video3Ref.current) {
      video3Ref.current.play().then(() => setIsPlaying3(true)).catch(() => setIsPlaying3(false));
    }
  }, [video1Url, video2Url, video3Url]);

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

  const ytId1 = extractYouTubeId(video1Url);
  const ytId2 = extractYouTubeId(video2Url);
  const ytId3 = extractYouTubeId(video3Url);

  return (
    <section 
      aria-label="Cover Videos" 
      className="w-full bg-[#123047] py-2 sm:py-3 lg:py-4 px-2 sm:px-4 lg:px-6 transition-all"
    >
      <div className="max-w-7xl mx-auto">
        {/*
          Responsive Tri-Video Layout:
          1. Desktop (>= 1024px):
             - 3 videos side-by-side in 3 equal columns (lg:grid-cols-3)
             - Equal width and equal height (aspect-video)
             - Small gap between them
             - All 3 videos visible and playing simultaneously (no slider, no carousel)

          2. Tablet (768px - 1023px):
             - md:grid-cols-2
             - Video 1 and Video 2 side-by-side in row 1
             - Video 3 in row 2 centered (md:col-span-2 md:w-1/2 md:mx-auto) with identical width & height
             - No video cut off or hidden

          3. Mobile (< 768px):
             - grid-cols-1: Video 1, Video 2, Video 3 stacked vertically in sequential order
             - 100% full width, aspect-video, zero horizontal scrolling, zero cropping

          4. Strict Content Discipline:
             - NO Headline or Heading
             - NO Title or Subtitle
             - NO Description or Paragraph
             - NO Call Now / WhatsApp / CTA Button
             - NO Badge or Label
             - NO Text Overlay or Promotional Content
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 lg:gap-4 items-center">
          
          {/* ================= VIDEO 1 ================= */}
          <div 
            className="w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black relative shadow-lg group cursor-pointer"
            onClick={togglePlay1}
          >
            {ytId1 ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${ytId1}?autoplay=1&mute=1&controls=1&loop=1&playlist=${ytId1}&playsinline=1&rel=0`}
                title="Cleaning Service Video 1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="w-full h-full border-0 object-contain"
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
                  poster={video1Poster}
                  onError={() => setHasError1(true)}
                  className="w-full h-full object-contain bg-black"
                >
                  <source src={video1Url} type="video/mp4" />
                </video>

                {/* Poster fallback when video load fails */}
                {hasError1 && video1Poster && (
                  <img 
                    src={video1Poster} 
                    alt="Cleaning Service Video 1" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=75';
                    }}
                    className="absolute inset-0 w-full h-full object-contain bg-black" 
                  />
                )}

                {/* Subtle Floating Media Controls (Play/Pause & Mute/Unmute) */}
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
            )}
          </div>

          {/* ================= VIDEO 2 ================= */}
          <div 
            className="w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black relative shadow-lg group cursor-pointer"
            onClick={togglePlay2}
          >
            {ytId2 ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${ytId2}?autoplay=1&mute=1&controls=1&loop=1&playlist=${ytId2}&playsinline=1&rel=0`}
                title="Cleaning Service Video 2"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="w-full h-full border-0 object-contain"
              />
            ) : (
              <>
                <video
                  ref={video2Ref}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={video2Poster}
                  onError={() => setHasError2(true)}
                  className="w-full h-full object-contain bg-black"
                >
                  <source src={video2Url} type="video/mp4" />
                </video>

                {/* Poster fallback when video load fails */}
                {hasError2 && video2Poster && (
                  <img 
                    src={video2Poster} 
                    alt="Cleaning Service Video 2" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=75';
                    }}
                    className="absolute inset-0 w-full h-full object-contain bg-black" 
                  />
                )}
 
                {/* Subtle Floating Media Controls (Play/Pause & Mute/Unmute) */}
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
            )}
          </div>
 
          {/* ================= VIDEO 3 ================= */}
          <div 
            className="w-full md:col-span-2 lg:col-span-1 md:w-1/2 md:mx-auto lg:w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black relative shadow-lg group cursor-pointer"
            onClick={togglePlay3}
          >
            {ytId3 ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${ytId3}?autoplay=1&mute=1&controls=1&loop=1&playlist=${ytId3}&playsinline=1&rel=0`}
                title="Cleaning Service Video 3"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="w-full h-full border-0 object-contain"
              />
            ) : (
              <>
                <video
                  ref={video3Ref}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={video3Poster}
                  onError={() => setHasError3(true)}
                  className="w-full h-full object-contain bg-black"
                >
                  <source src={video3Url} type="video/mp4" />
                </video>
 
                {/* Poster fallback when video load fails */}
                {hasError3 && video3Poster && (
                  <img 
                    src={video3Poster} 
                    alt="Cleaning Service Video 3" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=75';
                    }}
                    className="absolute inset-0 w-full h-full object-contain bg-black" 
                  />
                )}

                {/* Subtle Floating Media Controls (Play/Pause & Mute/Unmute) */}
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
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
