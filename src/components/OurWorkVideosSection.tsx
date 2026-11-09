import React, { useState } from 'react';
import { Video, Play } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useWorkVideos } from '../utils/videosStore';

interface OurWorkVideosSectionProps {
  onSelectService?: (slug: string) => void;
}

export const OurWorkVideosSection: React.FC<OurWorkVideosSectionProps> = () => {
  const { lang } = useLanguage();
  const { featuredVideos } = useWorkVideos();
  const [activeVideoId, setActiveVideoId] = useState<string>(
    featuredVideos.length > 0 && featuredVideos[0].youtubeId ? featuredVideos[0].youtubeId : 'ScMzIvxBSi4'
  );

  const activeVideo = featuredVideos.find(v => v.youtubeId === activeVideoId) || featuredVideos[0];

  if (!featuredVideos || featuredVideos.length === 0) {
    return null;
  }

  return (
    <section className="py-14 sm:py-20 bg-white text-[#172B3A] border-b border-[#E2E8F0]" id="work-videos" aria-labelledby="work-videos-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E8F5F3] text-[#0D9488] text-xs font-bold uppercase tracking-wider mb-2 border border-[#0D9488]/30">
            <Video className="w-3.5 h-3.5 text-[#0D9488]" aria-hidden="true" />
            <span>{lang === 'bn' ? 'কাজের ভিডিও ডকুমেন্টেশন' : 'Video Evidence'}</span>
          </div>
          <h2 id="work-videos-heading" className="text-2xl sm:text-3xl md:text-4xl font-black text-[#123047] tracking-tight">
            {lang === 'bn' ? 'আমাদের ক্লিনিং প্রজেক্টের সরাসরি ভিডিও' : 'Our Work Videos'}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#64748B] leading-relaxed">
            {lang === 'bn'
              ? 'হাই-প্রেসার ওয়াশ ও সাবমারসিবল কাদা পাম্পের সাহায্যে সরাসরি ট্যাংক পরিষ্কারের ভিডিওগুলো দেখুন।'
              : 'Watch real cleaning operations in action: high-pressure rotary washing and subterranean slurry extraction.'}
          </p>
        </div>

        {/* Video Player & Selection List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Embedded Player */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl overflow-hidden bg-black aspect-video relative shadow-lg border border-[#E2E8F0]">
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
              <div className="mt-4 p-4 rounded-2xl bg-[#F5FAFC] border border-[#E2E8F0] space-y-1">
                <h3 className="font-bold text-base text-[#123047]">
                  {lang === 'bn' ? (activeVideo.titleBn || activeVideo.title) : activeVideo.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B]">
                  {lang === 'bn' ? (activeVideo.descriptionBn || activeVideo.description) : activeVideo.description}
                </p>
              </div>
            )}
          </div>

          {/* Multiple Featured Videos Selection Grid */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider block">
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
                        ? 'bg-[#E8F5F3] border-2 border-[#0D9488] text-[#123047] shadow-xs'
                        : 'bg-[#F5FAFC] border-[#E2E8F0] text-[#172B3A] hover:bg-white hover:border-[#0D9488]/40'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center shrink-0 text-[#0D9488]">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold truncate text-[#123047]">
                        {lang === 'bn' ? (vid.titleBn || vid.title) : vid.title}
                      </h4>
                      <p className="text-[11px] text-[#64748B] line-clamp-1 mt-0.5">
                        {lang === 'bn' ? (vid.descriptionBn || vid.description) : vid.description}
                      </p>
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
