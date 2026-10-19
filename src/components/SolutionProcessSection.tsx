import React, { useState } from 'react';
import { 
  Search, 
  ArrowDownCircle, 
  Sparkles, 
  Waves, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronRight,
  Shield,
  ArrowRight,
  Trash2,
  Droplets
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';

const ICON_MAP: Record<string, any> = {
  Search,
  ArrowDownCircle,
  Sparkles,
  Waves,
  CheckCircle2,
  ShieldCheck,
  Shield,
  Trash2,
  Droplets
};

interface SolutionProcessSectionProps {
  onBookService?: () => void;
}

export const SolutionProcessSection: React.FC<SolutionProcessSectionProps> = ({ onBookService = () => {} }) => {
  const { lang, t } = useLanguage();
  const { cleaningSteps } = useSiteConfig();
  const [activeStep, setActiveStep] = useState<number>(0);

  return (
    <section className="py-14 sm:py-20 bg-white border-b border-slate-200" id="process" aria-labelledby="process-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-800">
            {lang === 'bn' ? 'বিজ্ঞানসম্মত ৯টি ধাপ' : 'Hygienic Step-by-Step Process'}
          </span>
          <h2 id="process-heading" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0B2545] tracking-tight mt-1.5">
            {t('solution.h2')}
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {t('solution.sub')}
          </p>
        </div>

        {/* Steps Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cleaningSteps.map((step, idx) => {
            const IconComp = ICON_MAP[step.icon] || Sparkles;
            const isCurrent = activeStep === idx;

            return (
              <div
                key={step.number || idx}
                onClick={() => setActiveStep(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setActiveStep(idx);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isCurrent}
                className={`relative rounded-2xl p-6 transition-all cursor-pointer border focus-visible:outline-2 focus-visible:outline-[#0B2545] ${
                  isCurrent 
                    ? 'bg-white border-[#0B2B5C] shadow-lg ring-2 ring-cyan-500/20' 
                    : 'bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Step number badge & icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    isCurrent 
                      ? 'bg-[#0B2B5C] text-cyan-300 shadow-md' 
                      : 'bg-blue-50 text-blue-700'
                  }`} aria-hidden="true">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-2xl font-black text-slate-300 group-hover:text-cyan-600 transition-colors">
                    {step.number}
                  </span>
                </div>

                {/* Step Subtitle */}
                <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-700">
                  {step.step}
                </span>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2">
                  {lang === 'bn' ? step.titleBn : step.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {lang === 'bn' ? step.descriptionBn : step.description}
                </p>

                {/* Indicator marker */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium">
                    {idx === 0 ? (lang === 'bn' ? 'শুরুর ধাপ' : 'Initial Phase') : 
                      idx === cleaningSteps.length - 1 ? (lang === 'bn' ? 'হস্তান্তর' : 'Final Handover') : 
                      (lang === 'bn' ? 'কার্যপ্রণালী' : 'Execution')}
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isCurrent ? 'text-cyan-700 translate-x-1' : 'text-slate-300'}`} aria-hidden="true" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom trust banner & CTA */}
        <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-[#0B2B5C]">
              {lang === 'bn' ? '১০০% নিরাপদ ও স্বাস্থ্যকর পানির নিশ্চয়তা' : 'Trained on Strict Hygiene Protocols'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg">
              {lang === 'bn' 
                ? 'আমরা কোনো রাসায়নিক বা তীব্র অ্যাসিড ব্যবহার করি না। ক্লিনিং শেষ হওয়ার সাথে সাথেই পানি ব্যবহার উপযোগী হয়।'
                : 'No toxic chemicals or lingering fumes. Water is hygienic, odorless, and ready for household use right after cleaning.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onBookService}
            className="min-h-[44px] shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0B2B5C] to-[#0284C7] hover:from-[#082046] hover:to-[#0369a1] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0B2545]"
          >
            <span>{lang === 'bn' ? 'সার্ভিস শিডিউল করুন' : 'Book Professional Cleaning'}</span>
            <ArrowRight className="w-4 h-4 text-cyan-300" aria-hidden="true" />
          </button>
        </div>

      </div>
    </section>
  );
};
