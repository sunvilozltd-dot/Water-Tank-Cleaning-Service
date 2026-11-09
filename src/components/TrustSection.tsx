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
      titleEn: 'High-Pressure Rotary Jet Wash',
      titleBn: 'মেকানাইজড রোটারি জেট ওয়াশ',
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
      titleEn: 'Punctual Dispatch Across Greater Dhaka',
      titleBn: 'নির্ধারিত সময়ে উপস্থিতি',
      descEn: 'Dedicated teams dispatched to Dhaka, Gazipur, Savar, Narayanganj and surrounding corridors.',
      descBn: 'ঢাকা, গাজীপুর, সাভার ও নারায়ণগঞ্জসহ সংলগ্ন এলাকার জন্য ডেডিকেটেড মোবাইল টিম দ্রুত উপস্থিত হয়ে সেবা প্রদান করে।'
    },
    {
      icon: Users,
      titleEn: 'Trained & Uniformed Crew',
      titleBn: 'প্রশিক্ষিত ও সুশৃঙ্খল কর্মী',
      descEn: 'Experienced technicians equipped with safety gear, waterproof boots, and specialized confined-space lighting.',
      descBn: 'নিরাপত্তা সরঞ্জামসহ প্রশিক্ষিত কারিগরি দল দ্বারা সর্বোচ্চ যত্ন ও নিরাপত্তার সাথে সেবা প্রদান।'
    }
  ];

  return (
    <section 
      className="py-14 sm:py-20 bg-[#F5FAFC] border-b border-[#E2E8F0] relative overflow-hidden" 
      id="trust-facts" 
      aria-labelledby="trust-heading"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488] inline-flex items-center gap-1.5 bg-[#E8F5F3] px-3.5 py-1 rounded-full border border-[#0D9488]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] animate-pulse" aria-hidden="true" />
            <span>{lang === 'bn' ? 'সেবার স্বাস্থ্যবিধি ও মান' : 'Hygiene & Safety Standards'}</span>
          </span>
          <h2 id="trust-heading" className="text-2xl sm:text-3xl md:text-4xl font-black text-[#123047] tracking-tight mt-2.5">
            {lang === 'bn' 
              ? 'বিশুদ্ধ ও নিরাপদ পানির জন্য আমাদের প্রমাণিত স্ট্যান্ডার্ড' 
              : 'Proven Standards for Pure & Hygienic Water Tanks'}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#0D9488] to-transparent mx-auto my-3.5 rounded-full" />
          <p className="mt-2.5 text-sm sm:text-base text-[#64748B] leading-relaxed max-w-2xl mx-auto">
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
                className="bg-white hover:border-[#0D9488]/50 p-6 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#E8F5F3] text-[#0D9488] flex items-center justify-center mb-4 shadow-2xs" aria-hidden="true">
                    <Icon className="w-5 h-5 text-[#0D9488]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#123047] leading-snug mb-2">
                    {title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                    {desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center gap-1.5 text-xs font-semibold text-[#16A34A]">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" aria-hidden="true" />
                  <span>{lang === 'bn' ? 'সানভিলোজ কোয়ালিটি পলিসি' : 'Verified Policy'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Assurance Strip */}
        <div className="mt-10 p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] text-[#172B3A] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-center sm:text-left">
            <h4 className="text-sm sm:text-base font-bold text-[#123047]">
              {lang === 'bn' ? 'আপনার ছাদ বা আন্ডারগ্রাউন্ড ট্যাংকের জন্য কোটেশন প্রয়োজন?' : 'Need an exact quote for your rooftop or reserve tank?'}
            </h4>
            <p className="text-xs text-[#64748B] mt-0.5">
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
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs focus-visible:outline-2 focus-visible:outline-[#0D9488]"
              >
                {lang === 'bn' ? 'ফ্রি কোটেশন নিন' : 'Get Free Quote'}
              </button>
            )}
            <a
              href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('আসসালামু আলাইকুম। আমি Water Tank Cleaning Service নিতে আগ্রহী। আমার এলাকা: ঢাকা। অনুগ্রহ করে সার্ভিসের মূল্য ও বুকিং প্রক্রিয়া জানাবেন।')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] flex items-center px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm transition-all shadow-xs focus-visible:outline-2 focus-visible:outline-[#25D366]"
            >
              WhatsApp
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
