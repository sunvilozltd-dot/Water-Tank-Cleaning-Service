import React from 'react';
import { 
  FileText, 
  PhoneCall, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CalendarCheck 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HowItWorksProps {
  onBookCleaning?: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksProps> = ({ onBookCleaning = () => {} }) => {
  const { lang, t } = useLanguage();

  const steps = [
    {
      num: '১',
      title: 'Request a Quote',
      titleBn: 'কোটেশন রিকোয়েস্ট করুন',
      subtitle: 'Tell us about your tank.',
      subtitleBn: 'আপনার ট্যাংকের তথ্য জানান।',
      desc: 'Fill our quick quote form or message us directly on WhatsApp with your location in Dhaka and tank type.',
      descBn: 'আমাদের ওয়েবসাইটে ফরম পূরণ করুন অথবা হোয়াটসঅ্যাপে আপনার ঠিকানা ও ট্যাংকের বিবরণ জানান।',
      icon: FileText
    },
    {
      num: '২',
      title: 'Confirm Your Service',
      titleBn: 'শিডিউল নিশ্চিত করুন',
      subtitle: 'Our team contacts you and confirms the service details.',
      subtitleBn: 'আমাদের প্রতিনিধি কল দিয়ে কোটেশন ও সময় নিশ্চিত করবে।',
      desc: 'We review your request, provide transparent pricing, and lock in your convenient date and arrival time window.',
      descBn: 'আমরা আপনার প্রয়োজনীয়তা পর্যালোচনা করে সাশ্রয়ী কোটেশন দেব এবং আপনার সুবিধাজনক দিনক্ষণ চূড়ান্ত করব।',
      icon: PhoneCall
    },
    {
      num: '৩',
      title: 'Professional Cleaning',
      titleBn: 'মেকানাইজড ডিপ ক্লিনিং',
      subtitle: 'Our team arrives at the agreed time and performs the cleaning service.',
      subtitleBn: 'আমাদের দক্ষ টিম সময়মতো পৌঁছে ট্যাংক পরিষ্কার ও স্যানিটাইজ করবে।',
      desc: 'Our equipped mobile team arrives on time with high-pressure washers and pumps to complete the hygienic cleaning.',
      descBn: 'রোটারি হাই-প্রেসার জেট ওয়াশার ও পাম্প দিয়ে সম্পূর্ণ কাজ শেষ করে পরিষ্কার ট্যাংক হ্যান্ডওভার দেওয়া হবে।',
      icon: Sparkles
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-white border-b border-slate-200" id="booking-steps" aria-labelledby="how-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5F3] text-[#0D9488] text-xs font-bold uppercase tracking-wider border border-[#0D9488]/30 mb-3">
            <Clock className="w-3.5 h-3.5 text-[#0D9488]" aria-hidden="true" />
            {t('how.tag')}
          </span>
          <h2 id="how-heading" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#123047] tracking-tight">
            {t('how.h2')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#64748B] leading-relaxed">
            {t('how.sub')}
          </p>
        </div>

        {/* 3 Step Cards with connecting progression line */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
          {steps.map((step, idx) => {
            return (
              <div 
                key={idx}
                className="relative bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] text-center flex flex-col items-center hover:shadow-lg transition-all"
              >
                {/* Number Badge */}
                <div className="w-14 h-14 rounded-2xl bg-[#123047] text-white font-black text-xl flex items-center justify-center shadow-lg shadow-[#123047]/15 mb-4" aria-hidden="true">
                  {step.num}
                </div>
                <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-widest mb-1">
                  ধাপ ০{idx + 1}
                </span>
                <h3 className="text-xl font-bold text-[#172B3A] mb-1">
                  {lang === 'bn' ? step.titleBn : step.title}
                </h3>
                <p className="text-xs font-semibold text-[#64748B] mb-2">
                  {lang === 'bn' ? step.subtitleBn : step.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  {lang === 'bn' ? step.descBn : step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Conversion Action */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={onBookCleaning}
            className="min-h-[48px] inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#0D9488]/20 transition-all active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0D9488]"
          >
            <CalendarCheck className="w-5 h-5 text-white" aria-hidden="true" />
            <span>{t('how.cta')}</span>
            <ArrowRight className="w-4 h-4 text-white" aria-hidden="true" />
          </button>
        </div>

      </div>
    </section>
  );
};
