import React from 'react';
import { 
  ShieldCheck, 
  Droplets, 
  Waves, 
  FileCheck, 
  Clock, 
  Users, 
  CheckCircle2 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';

interface TrustSectionProps {
  onOpenQuoteModal?: () => void;
}

export const TrustSection: React.FC<TrustSectionProps> = ({ onOpenQuoteModal }) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();

  const trustFacts = [
    {
      icon: ShieldCheck,
      titleEn: 'Approved Food-Grade Sanitization',
      titleBn: 'অনুমোদিত ফুড-গ্রেড স্যানিটাইজেশন',
      descEn: 'We use certified non-toxic, food-safe antibacterial disinfectants approved for drinking water tanks. Leaves zero chemical odor.',
      descBn: 'আমরা ক্ষতিকর এসিডমুক্ত, পরিবেশবান্ধব ও খাওয়ার পানির ট্যাংকের উপযোগী অনুমোদিত খাদ্য-মানসম্পন্ন জীবাণুনাশক ব্যবহার করি।'
    },
    {
      icon: Waves,
      titleEn: '120-150 Bar Rotary Pressure Jet',
      titleBn: '১২০-১৫০ বার রোটারি জেট ওয়াশ',
      descEn: 'Industrial rotary water pressure strips stubborn algae, mineral scale, and biofilm without damaging PVC or concrete waterproofing.',
      descBn: 'উচ্চ চাপের ঘূর্ণায়মান রোটারি নজল ট্যাংকের দেয়াল ও প্লাম্বিং অক্ষত রেখেই ভেতরের শেওলা ও কাদা নিমেষে পরিষ্কার করে।'
    },
    {
      icon: Droplets,
      titleEn: 'Heavy Sludge & Mud Evacuation',
      titleBn: 'হেভি স্লাজ ও গভীর কাদা নিষ্কাশন',
      descEn: 'Equipped with heavy submersible slurry pumps and wet industrial vacuums to extract thick WASA mud from underground sumps.',
      descBn: 'মাটির নিচের রিজার্ভার থেকে ওয়াসা লাইনের ঘন পলি ও স্লাজ নিষ্কাশনে রয়েছে শক্তিশালী সাবমারসিবল পাম্প ও সাকশন ভ্যাকুয়াম।'
    },
    {
      icon: FileCheck,
      titleEn: 'Transparent Written Quotation',
      titleBn: 'স্বচ্ছ ও লিখিত কোটেশন',
      descEn: 'Clear pricing shared on WhatsApp before work begins. No unexpected fuel charges, hidden add-ons, or surprise price increases.',
      descBn: 'কাজ শুরুর পূর্বেই হোয়াটসঅ্যাপে নিখুঁত ও লিখিত কোটেশন প্রদান করা হয়। কোনো প্রকার লুকানো বা অতিরিক্ত সার্ভিস চার্জ নেই।'
    },
    {
      icon: Clock,
      titleEn: 'Punctual Dispatch Across Dhaka',
      titleBn: 'নির্ধারিত সময়ে উপস্থিতি',
      descEn: 'Dedicated teams dispatched to Uttara, Gulshan, Banani, Dhanmondi, Bashundhara, Mirpur, and all zones across Dhaka.',
      descBn: 'বুকিংয়ের সময় অনুযায়ী আমাদের মোবাইল টিম সময়মতো উপস্থিত হয়ে দ্রুত ও যত্নসহকারে কাজ সুসম্পন্ন করে।'
    },
    {
      icon: Users,
      titleEn: 'Trained & Uniformed Crew',
      titleBn: 'প্রশিক্ষিত ও সুশৃঙ্খল কর্মী',
      descEn: 'Background-verified technicians equipped with safety helmets, waterproof boots, and specialized lighting.',
      descBn: 'নিরাপত্তা সরঞ্জামসহ প্রশিক্ষিত কারিগরি দল দ্বারা সর্বোচ্চ যত্ন ও নিরাপত্তার সাথে সেবা প্রদান।'
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-[#051122] via-[#061833] to-[#040D1B] border-b border-cyan-900/35 relative overflow-hidden" id="trust-facts" aria-labelledby="trust-heading">
      {/* Ambient water glow */}
      <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-10 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" aria-hidden="true" />
            <span>{lang === 'bn' ? 'সেবার মান ও বৈশিষ্ট্য' : 'Verified Service Standards'}</span>
          </span>
          <h2 id="trust-heading" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-1.5">
            {lang === 'bn' 
              ? 'বিশুদ্ধ ও নিরাপদ পানির জন্য আমাদের প্রমাণিত স্ট্যান্ডার্ড' 
              : 'Proven Standards for Pure & Hygienic Water Tanks'}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto my-3.5 rounded-full" />
          <p className="mt-2.5 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {lang === 'bn'
              ? 'আমরা কোনো ক্ষতিকর কাঁচা অ্যাসিড বা ধারালো তারের ব্রাশ ব্যবহার করি না। মেকানাইজড পদ্ধতিতে ট্যাংক সুরক্ষিত রেখে জীবাণুমুক্ত সেবা নিশ্চিত করি।'
              : 'No abrasive wire brushes or harsh acid damage. We adhere strictly to verified hygiene, safety, and equipment standards across Dhaka.'}
          </p>
        </div>

        {/* 6 Verified Fact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustFacts.map((fact, idx) => {
            const Icon = fact.icon;
            const title = lang === 'bn' ? fact.titleBn : fact.titleEn;
            const desc = lang === 'bn' ? fact.descBn : fact.descEn;

            return (
              <div 
                key={idx}
                className="water-glass-card hover:border-cyan-400/50 p-6 rounded-2xl border border-cyan-500/20 shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#040D1A] border border-cyan-800/40 text-cyan-400 flex items-center justify-center mb-4 shadow-sm" aria-hidden="true">
                    <Icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug mb-2">
                    {title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-cyan-900/40 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>{lang === 'bn' ? 'সানভিলোজ কোয়ালিটি পলিসি' : 'Verified Policy'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Assurance Strip */}
        <div className="mt-10 p-5 sm:p-6 rounded-2xl bg-[#171C24] border border-[#303743] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="text-center sm:text-left">
            <h4 className="text-sm sm:text-base font-bold text-white">
              {lang === 'bn' ? 'আপনার ছাদ বা আন্ডারগ্রাউন্ড ট্যাংকের জন্য কোটেশন প্রয়োজন?' : 'Need an exact quote for your rooftop or reserve tank?'}
            </h4>
            <p className="text-xs text-[#B8C0CC] mt-0.5">
              {lang === 'bn' 
                ? `সরাসরি ফোন করুন ${business.displayPhone} নম্বরে অথবা হোয়াটসঅ্যাপে মেসেজ পাঠিয়ে কোটেশন নিন` 
                : `Call us directly at ${business.displayPhone} or message on WhatsApp for instant confirmation`}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onOpenQuoteModal && (
              <button
                type="button"
                onClick={onOpenQuoteModal}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#2585FF] hover:bg-[#1a73e8] text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md focus-visible:outline-2 focus-visible:outline-[#2585FF]"
              >
                {lang === 'bn' ? 'ফ্রি কোটেশন নিন' : 'Get Free Quote'}
              </button>
            )}
            <a
              href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('আসসালামু আলাইকুম। আমি Water Tank Cleaning Service নিতে আগ্রহী। আমার এলাকা: ঢাকা। অনুগ্রহ করে সার্ভিসের মূল্য ও বুকিং প্রক্রিয়া জানাবেন।')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] flex items-center px-4 py-2.5 rounded-xl bg-[#28C76F] hover:bg-[#22aa5e] text-white font-bold text-xs sm:text-sm transition-all shadow-md focus-visible:outline-2 focus-visible:outline-[#28C76F]"
            >
              WhatsApp
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
