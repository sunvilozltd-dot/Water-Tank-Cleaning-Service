import React from 'react';
import { 
  Wrench, 
  MessageCircle, 
  CalendarCheck, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Building2,
  FileText,
  Clock,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const WhyChooseUsSection: React.FC = () => {
  const { lang } = useLanguage();

  const benefits = [
    {
      icon: Wrench,
      num: '01',
      titleEn: 'Appropriate Cleaning Equipment',
      titleBn: 'উপযুক্ত আধুনিক ইকুইপমেন্ট',
      descEn: 'We utilize rotary pressure jet washers, submersible sludge evacuation pumps, and pipe flushing systems suited for each job.',
      descBn: 'কাজের প্রয়োজন অনুযায়ী রোটারি প্রেসার জেট, সাবমারসিবল স্লাজ পাম্প ও এয়ার-ওয়াটার পাইপলাইনার ব্যবহৃত হয়।'
    },
    {
      icon: ShieldCheck,
      num: '02',
      titleEn: 'Professional Cleaning Process',
      titleBn: 'বিজ্ঞানসম্মত পেশাদার পদ্ধতি',
      descEn: 'Step-by-step cleaning from surface assessment, sediment evacuation, scrubbing, and sanitizing with food-contact safe products.',
      descBn: 'ট্যাংক পরিদর্শন, তলদেশের পলি নিষ্কাশন, প্রাচীর স্কাউরিং এবং নিরাপদ স্যানিটাইজিং নিশ্চিত করা হয়।'
    },
    {
      icon: MessageCircle,
      num: '03',
      titleEn: 'Convenient Booking via WhatsApp',
      titleBn: 'সহজ WhatsApp ও কল বুকিং',
      descEn: 'Send photos, location, and property specifications over WhatsApp for quick consultation and schedule confirmation.',
      descBn: 'ট্যাংকের ছবি, ধারণক্ষমতা ও লোকেশন WhatsApp-এ পাঠিয়ে সহজেই বুকিং ও শিডিউল নিশ্চিত করা যায়।'
    },
    {
      icon: FileText,
      num: '04',
      titleEn: 'Clear Communication & Quotes',
      titleBn: 'স্বচ্ছ মূল্য ও সরাসরি আলোচনা',
      descEn: 'Transparent price quotes based on actual tank capacity, condition, and access prior to starting any cleaning work.',
      descBn: 'কাজের পরিধি, ট্যাংকের আকার ও বাস্তব অবস্থা অনুযায়ী পরিষ্কার ও পূর্বনির্ধারিত কোটেশন প্রদান করা হয়।'
    },
    {
      icon: Building2,
      num: '05',
      titleEn: 'Residential & Commercial Options',
      titleBn: 'বাসা ও বাণিজ্যিক উভয় ভবনের সুবিধা',
      descEn: 'Tailored solutions for single-family homes, multi-story apartment communities, offices, and commercial establishments.',
      descBn: 'আবাসিক অ্যাপার্টমেন্ট, ব্যক্তি মালিকানাধীন বাড়ি, করপোরেট অফিস ও বাণিজ্যিক প্রতিষ্ঠানের জন্য উপযোগী প্যাকেজ।'
    },
    {
      icon: Clock,
      num: '06',
      titleEn: 'After-Service Guidance',
      titleBn: 'সার্ভিস পরবর্তী প্রয়োজনীয় পরামর্শ',
      descEn: 'Guidance on proper tank refilling, ventilation, routine maintenance intervals, and clean water usage advice.',
      descBn: 'ট্যাংক রিফিলিং সময়, পরবর্তী ক্লিনিং ইন্টারভ্যাল এবং পানি সংরক্ষণ ব্যবস্থার সঠিক রক্ষণাবেক্ষণ পরামর্শ।'
    }
  ];

  return (
    <section 
      className="py-16 sm:py-24 bg-gradient-to-b from-[#040D1B] via-[#061730] to-[#051122] border-b border-cyan-900/35 relative overflow-hidden" 
      id="why-us" 
      aria-labelledby="why-heading"
    >
      {/* Subtle ambient water depth glow */}
      <div className="absolute top-1/3 -left-36 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-1/4 -right-36 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-cyan-400 uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" aria-hidden="true" />
            <span>{lang === 'bn' ? 'আমাদের বিশেষত্ব' : 'Our Capabilities'}</span>
          </div>

          <h2 
            id="why-heading" 
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight"
          >
            Why SUNVILOZ Clean Care?
          </h2>

          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto my-3.5 rounded-full" />

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {lang === 'bn' 
              ? 'বাস্তবসম্মত অভিজ্ঞতা, প্রয়োজনীয় ইকুইপমেন্ট এবং গ্রাহক-কেন্দ্রিক সেবার সমন্বয়ে আমরা প্রদান করি নির্ভরযোগ্য পরিচ্ছন্নতা।'
              : 'Delivering dependable, professional cleaning through genuine operational competence, appropriate machinery, and clear customer coordination.'}
          </p>
        </div>

        {/* 6 Benefit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((item) => {
            const IconComp = item.icon;

            return (
              <div
                key={item.num}
                className="water-glass-card rounded-2xl p-6 sm:p-7 border border-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="w-12 h-12 rounded-xl bg-[#040D1A] border border-cyan-800/40 text-cyan-400 group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-blue-600 group-hover:text-white transition-all flex items-center justify-center shadow-md" 
                      aria-hidden="true"
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400/70">{item.num}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#2585FF] transition-colors leading-snug">
                    {lang === 'bn' ? item.titleBn : item.titleEn}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#B8C0CC] leading-relaxed mt-2.5">
                    {lang === 'bn' ? item.descBn : item.descEn}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#303743]/50 flex items-center gap-1.5 text-xs font-semibold text-[#28C76F]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'যাচাইকৃত পেশাদার কার্যপদ্ধতি' : 'Verified Standard Practice'}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUsSection;
