import React from 'react';
import { 
  Phone, 
  MessageCircle, 
  ArrowRight,
  ShieldCheck,
  Clock 
} from 'lucide-react';
import { BUSINESS_CONFIG } from '../data/config';
import { useLanguage } from '../context/LanguageContext';

interface FinalCtaSectionProps {
  onOpenQuoteModal: () => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ onOpenQuoteModal }) => {
  const { lang, t } = useLanguage();

  return (
    <section className="py-16 sm:py-20 bg-[#0B2545] text-white relative overflow-hidden border-t border-slate-800" id="final-cta" aria-labelledby="cta-heading">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Kicker */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300 mb-3">
          <ShieldCheck className="w-4 h-4 text-cyan-400" aria-hidden="true" />
          <span>{lang === 'bn' ? 'ঢাকা শহরের সর্বত্র দ্রুত সার্ভিস' : 'Rapid Response Service Across Dhaka'}</span>
        </div>

        {/* Heading */}
        <h2 id="cta-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
          {t('finalCta.h2')}
        </h2>

        {/* Subheading */}
        <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed mb-8">
          {t('finalCta.sub')}
        </p>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-8">
          {/* 1. Get Free Quote */}
          <button
            type="button"
            onClick={onOpenQuoteModal}
            className="min-h-[48px] flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white text-[#0B2545] hover:bg-slate-100 font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
          >
            <span>{t('finalCta.quote')}</span>
            <ArrowRight className="w-4 h-4 text-cyan-700" aria-hidden="true" />
          </button>

          {/* 2. Call Now */}
          <a
            href={`tel:${BUSINESS_CONFIG.phone}`}
            className="min-h-[48px] flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all focus-visible:outline-2 focus-visible:outline-cyan-400"
          >
            <Phone className="w-4 h-4 text-cyan-300" aria-hidden="true" />
            <span>{BUSINESS_CONFIG.displayPhone}</span>
          </a>

          {/* 3. WhatsApp */}
          <a
            href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Sunviloz Clean Care, I want to book a water tank cleaning service.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[48px] flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            <MessageCircle className="w-4 h-4 text-white" aria-hidden="true" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Operating Hours Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
          <span>
            {lang === 'bn' ? BUSINESS_CONFIG.operatingHoursBn : BUSINESS_CONFIG.operatingHours}
          </span>
        </div>

      </div>
    </section>
  );
};
