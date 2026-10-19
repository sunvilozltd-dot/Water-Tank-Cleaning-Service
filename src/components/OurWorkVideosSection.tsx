import React, { useState } from 'react';
import { Video, Play, ExternalLink, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useWorkVideos } from '../utils/videosStore';

interface OurWorkVideosSectionProps {
  onSelectService?: (slug: string) => void;
}

export const OurWorkVideosSection: React.FC<OurWorkVideosSectionProps> = ({ onSelectService }) => {
  const { lang } = useLanguage();
  const { featuredVideos } = useWorkVideos();
  const [activeVideoId, setActiveVideoId] = useState<string>(
    featuredVideos.length > 0 && featuredVideos[0].youtubeId ? featuredVideos[0].youtubeId : 'ScMzIvxBSi4'
  );

  const activeVideo = featuredVideos.find(v => v.youtubeId === activeVideoId) || featuredVideos[0];

  return (
    <section className="py-14 sm:py-20 bg-slate-900 text-white border-b border-slate-800" id="work-videos" aria-labelledby="work-videos-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 text-xs font-extrabold uppercase tracking-wider mb-2">
            <Video className="w-3.5 h-3.5 text-cyan-300" aria-hidden="true" />
            <span>{lang === 'bn' ? 'কাজের ভিডিও ডকুমেন্টেশন' : 'Video Evidence'}</span>
          </div>
          <h2 id="work-videos-heading" className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            {lang === 'bn' ? 'আমাদের ক্লিনিং প্রজেক্টের সরাসরি ভিডিও' : 'Our Work Videos'}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            {lang === 'bn'
              ? 'হাই-প্রেসার ওয়াশ ও সাবমারসিবল কাদা পাম্পের সাহায্যে সরাসরি ট্যাংক পরিষ্কারের ভিডিওগুলো দেখুন।'
              : 'Watch real cleaning operations in action: high-pressure rotary washing and subterranean slurry extraction.'}
          </p>
        </div>

        {/* Video Player & Selection List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Embedded Player */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl overflow-hidden bg-black aspect-video relative shadow-2xl border border-white/10">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?rel=0&autoplay=0`}
                title={activeVideo?.title || 'Sunviloz Clean Care Video'}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            
            {activeVideo && (
              <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <h3 className="font-extrabold text-base text-white">
                  {lang === 'bn' ? (activeVideo.titleBn || activeVideo.title) : activeVideo.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  {lang === 'bn' ? (activeVideo.descriptionBn || activeVideo.description) : activeVideo.description}
                </p>
              </div>
            )}
          </div>

          {/* Multiple Featured Videos Selection Grid */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
              {lang === 'bn' ? 'অন্যান্য ভিডিও প্লেলিস্ট' : 'Featured Video Playlist'}
            </span>
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {featuredVideos.map((vid) => {
                const isActive = vid.youtubeId === activeVideoId;
                return (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => setActiveVideoId(vid.youtubeId || '')}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                      isActive 
                        ? 'bg-cyan-950/60 border-cyan-400/80 shadow-md ring-1 ring-cyan-400/40' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative">
                      <img
                        src={vid.thumbnailUrl || `https://img.youtube.com/vi/${vid.youtubeId}/mqdefault.jpg`}
                        alt={vid.title}
                        width="96"
                        height="64"
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                    <div className="space-y-1 overflow-hidden">
                      <h4 className="font-bold text-xs text-white line-clamp-2 leading-snug">
                        {lang === 'bn' ? (vid.titleBn || vid.title) : vid.title}
                      </h4>
                      <span className="text-[10px] text-cyan-300 font-semibold block">
                        {isActive ? (lang === 'bn' ? '● চলছে' : '● Playing') : (lang === 'bn' ? 'ভিডিও চালান' : 'Click to Play')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default OurWorkVideosSection;
