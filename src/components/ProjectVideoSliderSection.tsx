import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Video, 
  Play, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useProjectVideos } from '../context/ProjectVideosContext';
import { useLanguage } from '../context/LanguageContext';

export const ProjectVideoSliderSection: React.FC = () => {
  const { activeVideos, loading } = useProjectVideos();
  const { lang } = useLanguage();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // Touch swipe support for mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Keep currentIndex bounded if activeVideos changes
  useEffect(() => {
    if (currentIndex >= activeVideos.length && activeVideos.length > 0) {
      setCurrentIndex(activeVideos.length - 1);
    }
  }, [activeVideos.length, currentIndex]);

  // When slide changes, stop playing previous video so audio doesn't linger
  const handleSlideChange = useCallback((newIndex: number) => {
    setCurrentIndex(newIndex);
    setPlayingVideoId(null);
  }, []);

  const handlePrev = () => {
    if (activeVideos.length <= 1) return;
    const nextIdx = currentIndex === 0 ? activeVideos.length - 1 : currentIndex - 1;
    handleSlideChange(nextIdx);
  };

  const handleNext = () => {
    if (activeVideos.length <= 1) return;
    const nextIdx = currentIndex === activeVideos.length - 1 ? 0 : currentIndex + 1;
    handleSlideChange(nextIdx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      // Swiped Left -> Go Next
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Go Prev
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeVideos.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, activeVideos.length]);

  /**
   * CRITICAL EMPTY STATE RULE:
   * Admin Panel থেকে কোনো YouTube Video যোগ না করা পর্যন্ত Frontend-এ এই Section-এর
   * মধ্যে কোনো ভিডিও থাকবে না। কোনো Demo/Sample/Placeholder থাকবে না।
   * সব ভিডিও মুছে দিলে বা Inactive করলে সম্পূর্ণ Section Hide থাকবে।
   */
  if (loading && activeVideos.length === 0) {
    return null;
  }

  if (activeVideos.length === 0) {
    return null; // 100% hidden!
  }

  const currentVideo = activeVideos[currentIndex] || activeVideos[0];
  const isPlaying = playingVideoId === currentVideo.id;
  const hasMultiple = activeVideos.length > 1;

  return (
    <section 
      id="project-videos" 
      className="py-16 sm:py-20 bg-white text-[#172B3A] border-b border-[#E2E8F0] relative overflow-hidden" 
      aria-labelledby="project-videos-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8F5F3] text-[#0D9488] text-xs font-bold uppercase tracking-wider mb-3 border border-[#0D9488]/30">
            <Video className="w-3.5 h-3.5 text-[#0D9488]" aria-hidden="true" />
            <span>{lang === 'bn' ? 'বাস্তব প্রজেক্ট ভিডিও' : 'Live Cleaning Projects'}</span>
          </div>
          
          <h2 
            id="project-videos-heading" 
            className="text-2xl sm:text-3xl md:text-4xl font-black text-[#123047] tracking-tight"
          >
            {lang === 'bn' ? 'আমাদের ক্লিনিং প্রজেক্টের সরাসরি ভিডিও' : 'Direct Cleaning Project Videos'}
          </h2>
          
          <p className="mt-3 text-sm sm:text-base text-[#64748B] leading-relaxed max-w-2xl mx-auto">
            {lang === 'bn'
              ? 'আমাদের সম্পন্ন করা বাস্তব ক্লিনিং কাজের ভিডিও দেখুন এবং আমাদের কাজের মান সম্পর্কে জানুন।'
              : 'Watch real cleaning operations in action and witness our hygiene standards firsthand.'}
          </p>
        </div>

        {/* Video Slider Showcase */}
        <div 
          ref={sliderContainerRef}
          className="relative max-w-4xl mx-auto"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Video Viewport */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 aspect-video shadow-2xl border border-slate-200/80 group">
            
            {isPlaying ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${currentVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={currentVideo.title || 'Sunviloz Clean Care Project Video'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div 
                onClick={() => setPlayingVideoId(currentVideo.id)}
                className="w-full h-full relative cursor-pointer group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setPlayingVideoId(currentVideo.id);
                  }
                }}
                aria-label={`Play YouTube Video: ${currentVideo.title || 'Cleaning Project'}`}
              >
                {/* YouTube HQ Thumbnail */}
                <img
                  src={`https://img.youtube.com/vi/${currentVideo.youtubeId}/hqdefault.jpg`}
                  alt={currentVideo.title || 'Sunviloz Project Video'}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback to mqdefault if hqdefault is unavailable
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.src.includes('mqdefault')) {
                      target.src = `https://img.youtube.com/vi/${currentVideo.youtubeId}/mqdefault.jpg`;
                    }
                  }}
                />

                {/* Subtle dark gradient overlay for play contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity group-hover:bg-black/40" />

                {/* Center YouTube Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl transform transition-transform duration-300 group-hover:scale-110">
                    <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-current ml-1" />
                  </div>
                </div>

                {/* Video Index Counter Pill on top right */}
                {hasMultiple && (
                  <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-md border border-white/20">
                    {currentIndex + 1} / {activeVideos.length}
                  </div>
                )}
              </div>
            )}

            {/* Slider Navigation Arrows (Overlay on sides) */}
            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-[#0D9488] text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/20 shadow-lg cursor-pointer z-20 focus-visible:outline-2 focus-visible:outline-[#0D9488]"
                  aria-label="Previous Project Video"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-[#0D9488] text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/20 shadow-lg cursor-pointer z-20 focus-visible:outline-2 focus-visible:outline-[#0D9488]"
                  aria-label="Next Project Video"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}
          </div>

          {/* Video Metadata / Title Display */}
          {currentVideo.title && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
              <h3 className="font-bold text-base sm:text-lg text-[#123047] line-clamp-2">
                {currentVideo.title}
              </h3>
              <a
                href={currentVideo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[#0D9488] hover:text-[#0b7a6f] inline-flex items-center gap-1 shrink-0"
              >
                <span>YouTube-এ দেখুন</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Pagination Dots & Navigation Controls */}
          {hasMultiple && (
            <div className="mt-6 flex flex-col items-center justify-center gap-3">
              <div className="flex items-center gap-2" role="tablist" aria-label="Video slides">
                {activeVideos.map((vid, idx) => (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => handleSlideChange(idx)}
                    role="tab"
                    aria-selected={currentIndex === idx}
                    aria-label={`Go to video ${idx + 1}`}
                    className={`transition-all rounded-full cursor-pointer ${
                      currentIndex === idx
                        ? 'w-7 h-2.5 bg-[#0D9488]'
                        : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>

              {/* Mobile swipe helper text */}
              <span className="sm:hidden text-[11px] text-[#64748B] font-medium">
                বাম বা ডানে সোয়াইপ (Swipe) করে ভিডিও পরিবর্তন করুন
              </span>
            </div>
          )}

          {/* Thumbnail Strip preview (when multiple videos exist) */}
          {hasMultiple && activeVideos.length >= 2 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-[#123047] uppercase tracking-wider">
                  প্রজেক্ট প্লেলিস্ট ({activeVideos.length}টি ভিডিও)
                </span>
                <span className="text-xs text-[#64748B]">
                  সরাসরি দেখতে যেকোনো ভিডিওতে ক্লিক করুন
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {activeVideos.map((vid, idx) => {
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => handleSlideChange(idx)}
                      className={`text-left rounded-xl overflow-hidden border-2 transition-all p-1 bg-white cursor-pointer group ${
                        isCurrent
                          ? 'border-[#0D9488] shadow-md ring-2 ring-[#0D9488]/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="aspect-video rounded-lg overflow-hidden relative bg-slate-900">
                        <img
                          src={`https://img.youtube.com/vi/${vid.youtubeId}/mqdefault.jpg`}
                          alt={vid.title || `Video ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            isCurrent ? 'bg-[#0D9488] text-white' : 'bg-white/80 text-[#123047]'
                          }`}>
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <p className="mt-1.5 text-[11px] font-semibold text-[#123047] truncate px-1">
                        {vid.title || `ভিডিও প্রজেক্ট ${idx + 1}`}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
