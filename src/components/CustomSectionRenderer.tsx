import React from 'react';
import { SectionConfig } from '../types/siteConfig';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { Sparkles, ArrowRight, MessageCircle, Phone } from 'lucide-react';

interface CustomSectionRendererProps {
  section: any;
  onOpenQuoteModal: () => void;
}

export const CustomSectionRenderer: React.FC<CustomSectionRendererProps> = ({ section, onOpenQuoteModal }) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();
  const data = section.customData;
  if (!data) return null;

  const bgClassesMap: Record<string, string> = {
    blue: 'bg-gradient-to-r from-[#123047] via-[#0F766E] to-[#0D9488] text-white',
    white: 'bg-white text-[#172B3A] border-y border-[#E2E8F0]',
    slate: 'bg-[#F5FAFC] text-[#172B3A] border-y border-[#E2E8F0]',
    cyan: 'bg-[#123047] text-white'
  };
  const bgClasses = bgClassesMap[data.bgStyle as string] || bgClassesMap.blue;

  const isLight = data.bgStyle === 'white';
  const heading = lang === 'bn' ? (data.headingBn || data.headingEn) : data.headingEn;
  const subheading = lang === 'bn' ? (data.subheadingBn || data.subheadingEn) : data.subheadingEn;
  const content = lang === 'bn' ? (data.contentBn || data.contentEn) : data.contentEn;
  const badge = lang === 'bn' ? (data.badgeTextBn || data.badgeTextEn) : data.badgeTextEn;
  const ctaText = lang === 'bn' ? (data.ctaTextBn || data.ctaTextEn || 'কোটেশন নিন') : (data.ctaTextEn || 'Get Free Quote');

  return (
    <section className={`py-12 sm:py-16 relative overflow-hidden ${bgClasses}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`grid grid-cols-1 ${data.imageUrl ? 'lg:grid-cols-12 gap-8 items-center' : 'max-w-4xl mx-auto text-center'}`}>
          
          <div className={data.imageUrl ? 'lg:col-span-7 space-y-4' : 'space-y-4'}>
            {badge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-xs border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" aria-hidden="true" />
                <span>{badge}</span>
              </div>
            )}

            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight ${isLight ? 'text-[#123047]' : 'text-white'}`}>
              {heading}
            </h2>

            {subheading && (
              <p className={`text-base sm:text-lg leading-relaxed ${isLight ? 'text-slate-600' : 'text-cyan-100'}`}>
                {subheading}
              </p>
            )}

            {content && (
              <div className={`text-sm leading-relaxed p-4 rounded-xl ${isLight ? 'bg-slate-50 text-slate-700' : 'bg-white/10 text-white/90'}`}>
                {content}
              </div>
            )}

            <div className={`pt-2 flex flex-wrap gap-3 items-center ${data.imageUrl ? 'justify-start' : 'justify-center'}`}>
              <button
                type="button"
                onClick={onOpenQuoteModal}
                className="min-h-[44px] inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-lg hover:shadow-xl transition-all transform active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0D9488]"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4 text-white" aria-hidden="true" />
              </button>

              <a
                href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello Sunviloz Clean Care, I have an inquiry about ${heading}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-md transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4 text-white" aria-hidden="true" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`tel:${business.phone}`}
                className={`min-h-[44px] inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  isLight 
                    ? 'text-[#123047] hover:bg-[#E8F5F3]' 
                    : 'text-white/90 hover:text-white'
                }`}
              >
                <Phone className="w-4 h-4 text-[#38BDF8]" aria-hidden="true" />
                <span>{business.displayPhone}</span>
              </a>
            </div>
          </div>

          {data.imageUrl && (
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 max-w-md w-full aspect-[4/3]">
                <img 
                  src={data.imageUrl} 
                  alt={heading}
                  width="500"
                  height="375"
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
