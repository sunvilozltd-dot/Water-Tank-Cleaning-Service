import React, { useState, useEffect } from 'react';
import { Tag, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { 
  getSpecialOffers, 
  fetchSpecialOffersFromSupabase,
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
    fetchSpecialOffersFromSupabase().then(() => loadOffers());

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

  const displayItems = offers.length > 0 ? offers : DEFAULT_SPECIAL_OFFERS;
  const marqueeItems = [...displayItems, ...displayItems, ...displayItems];

  return (
    <section 
      aria-label={lang === 'bn' ? 'চলমান বিশেষ অফার ও প্যাকেজ' : 'Running Special Offers'} 
      className="relative z-20 w-full bg-[#E8F5F3] border-b border-[#E2E8F0] overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto flex items-stretch">
        
        {/* Kicker badge (Deep Navy #123047 with Special Offer Accent #F59E0B) */}
        <div className="shrink-0 flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-[#123047] z-10 shadow-sm text-white">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F59E0B]"></span>
          </span>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#F59E0B] whitespace-nowrap flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{lang === 'bn' ? 'চলমান অফার' : 'Special Offers'}</span>
          </span>
        </div>

        {/* Ticker Container with fade masks */}
        <div className="relative flex-1 overflow-hidden py-2 flex items-center">
          
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#E8F5F3] to-transparent z-10 pointer-events-none hidden sm:block" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#E8F5F3] to-transparent z-10 pointer-events-none hidden sm:block" />

          {prefersReducedMotion ? (
            <div className="flex items-center gap-6 px-4 overflow-x-auto py-1 scrollbar-none">
              {displayItems.map((item, idx) => {
                const title = lang === 'bn' ? item.titleBn : item.titleEn;
                const badge = lang === 'bn' ? item.badgeBn : item.badgeEn;
                return (
                  <a
                    key={`${item.id}-${idx}`}
                    href={item.linkUrl || '/get-quote'}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                      e.preventDefault();
                      handleOfferClick(item.linkUrl);
                    }}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#172B3A] hover:text-[#0D9488] transition-colors cursor-pointer shrink-0 font-medium"
                  >
                    {badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#0D9488] border border-[#0D9488]/30">
                        {badge}
                      </span>
                    )}
                    <span>{title}</span>
                    <ArrowRight className="w-3 h-3 text-[#0D9488]" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          ) : (
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
                    <a
                      href={item.linkUrl || '/get-quote'}
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                        e.preventDefault();
                        handleOfferClick(item.linkUrl);
                      }}
                      className="inline-flex items-center gap-2.5 mx-5 sm:mx-8 text-xs sm:text-sm font-semibold text-[#172B3A] hover:text-[#0D9488] transition-colors cursor-pointer group"
                    >
                      {badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#0D9488] border border-[#0D9488]/30 group-hover:border-[#0D9488] transition-colors">
                          {badge}
                        </span>
                      )}
                      <span className="group-hover:text-[#0D9488] transition-colors">
                        {title}
                      </span>
                      <span className="text-[#0D9488] group-hover:translate-x-0.5 transition-transform inline-flex items-center">
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </span>
                    </a>

                    <span className="text-[#0D9488]/40 select-none text-xs" aria-hidden="true">
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
