import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { 
  getSpecialOffers, 
  SpecialOfferItem, 
  SPECIAL_OFFERS_CHANGE_EVENT, 
  DEFAULT_SPECIAL_OFFERS 
} from '../utils/specialOffersStore';

interface RunningSpecialOffersProps {
  onNavigate?: (path: string) => void;
}

export const RunningSpecialOffers: React.FC<RunningSpecialOffersProps> = ({ onNavigate }) => {
  const { lang } = useLanguage();
  const [offers, setOffers] = useState<SpecialOfferItem[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const loadOffers = () => {
      const allOffers = getSpecialOffers();
      const active = allOffers.filter(o => o.isActive);
      setOffers(active.length > 0 ? active : DEFAULT_SPECIAL_OFFERS);
    };

    loadOffers();

    window.addEventListener(SPECIAL_OFFERS_CHANGE_EVENT, loadOffers);
    return () => window.removeEventListener(SPECIAL_OFFERS_CHANGE_EVENT, loadOffers);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  const handleOfferClick = (url: string) => {
    if (!url) return;
    if (onNavigate) {
      onNavigate(url);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', url);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  // If empty, display a safe fallback
  const displayItems = offers.length > 0 ? offers : DEFAULT_SPECIAL_OFFERS;
  // Duplicate array for seamless infinite marquee loop
  const marqueeItems = [...displayItems, ...displayItems, ...displayItems];

  return (
    <section 
      aria-label={lang === 'bn' ? 'চলমান বিশেষ অফার ও প্যাকেজ' : 'Running Special Offers'} 
      className="relative z-20 w-full bg-[#06152B]/95 backdrop-blur-md border-y border-cyan-800/40 overflow-hidden select-none shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex items-stretch">
        
        {/* Kicker badge */}
        <div className="shrink-0 flex items-center gap-2 px-3 sm:px-5 py-3 bg-[#040D1A] border-r border-cyan-800/40 z-10 shadow-md">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-cyan-400 whitespace-nowrap flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{lang === 'bn' ? 'চলমান অফার' : 'Special Offers'}</span>
          </span>
        </div>

        {/* Ticker Container with fade masks */}
        <div className="relative flex-1 overflow-hidden py-2.5 flex items-center">
          
          {/* Subtle gradient edge masks for smooth fade */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#06152B] to-transparent z-10 pointer-events-none hidden sm:block" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#06152B] to-transparent z-10 pointer-events-none hidden sm:block" />

          {prefersReducedMotion ? (
            /* Reduced motion mode: static, clean readable list */
            <div className="flex items-center gap-6 px-4 overflow-x-auto py-1 scrollbar-none">
              {displayItems.map((item, idx) => {
                const title = lang === 'bn' ? item.titleBn : item.titleEn;
                const badge = lang === 'bn' ? item.badgeBn : item.badgeEn;
                return (
                  <button
                    key={`${item.id}-${idx}`}
                    type="button"
                    onClick={() => handleOfferClick(item.linkUrl)}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    {badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/30">
                        {badge}
                      </span>
                    )}
                    <span>{title}</span>
                    <ArrowRight className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          ) : (
            /* Smooth continuous ticker loop */
            <div 
              className="flex items-center whitespace-nowrap will-change-transform animate-marquee hover:[animation-play-state:paused]"
              style={{
                display: 'inline-flex',
                animation: 'marquee 38s linear infinite'
              }}
            >
              {marqueeItems.map((item, idx) => {
                const title = lang === 'bn' ? item.titleBn : item.titleEn;
                const badge = lang === 'bn' ? item.badgeBn : item.badgeEn;
                return (
                  <div key={`${item.id}-${idx}`} className="inline-flex items-center">
                    <button
                      type="button"
                      onClick={() => handleOfferClick(item.linkUrl)}
                      className="inline-flex items-center gap-2.5 mx-5 sm:mx-8 text-xs sm:text-sm font-medium text-slate-200 hover:text-white transition-colors cursor-pointer group"
                    >
                      {badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#091D38] text-cyan-300 border border-cyan-500/30 group-hover:border-cyan-400/60 transition-colors">
                          {badge}
                        </span>
                      )}
                      <span className="group-hover:text-white transition-colors underline-offset-4 group-hover:underline">
                        {title}
                      </span>
                      <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center">
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </span>
                    </button>

                    {/* Subtle divider bullet between ticker items */}
                    <span className="text-cyan-800/80 select-none text-xs" aria-hidden="true">
                      ◆
                    </span>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
