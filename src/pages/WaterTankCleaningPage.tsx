import React, { useState } from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SmartQuoteWizard } from '../components/SmartQuoteWizard';
import { OurWorkVideosSection } from '../components/OurWorkVideosSection';
import { CustomerProblemSection } from '../components/CustomerProblemSection';
import { SendTankPhotoCta } from '../components/SendTankPhotoCta';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  MessageCircle,
  Droplets,
  Layers,
  Wrench,
  Building2,
  CalendarCheck,
  ChevronDown,
  Clock,
  Sparkles,
  MapPin,
  Check,
  Filter
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { trackWhatsAppClick, trackEvent } from '../utils/tracking';

interface WaterTankCleaningPageProps {
  onOpenQuoteModal: (serviceName?: string) => void;
  onNavigate?: (path: string) => void;
}

export const WaterTankCleaningPage: React.FC<WaterTankCleaningPageProps> = ({ 
  onOpenQuoteModal,
  onNavigate 
}) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();
  
  // Accordion state for FAQs
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => prev === index ? null : index);
  };

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  const rawNumber = (business.whatsappNumber || '8801609999612').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent('আসসালামু আলাইকুম। আমি ওয়াটার ট্যাংক ক্লিনিং সার্ভিস (Water Tank Cleaning Service) সম্পর্কে জানতে ও বুকিং করতে চাই।')}`;

  // 9-Step Scientific Process
  const nineSteps = [
    {
      step: '01',
      titleBn: 'প্রাথমিক পরিদর্শন (Initial Inspection)',
      titleEn: 'Initial Inspection',
      descBn: 'ট্যাংকের ধরন (ওভারহেড বা আন্ডারগ্রাউন্ড), গঠনগত অবস্থা, প্রবেশপথের নিরাপত্তা এবং দৃশ্যমান পলির পুরুত্ব মূল্যায়ন।'
    },
    {
      step: '02',
      titleBn: 'ওয়াটার সাপ্লাই প্রস্তুতি (Water Supply Preparation)',
      titleEn: 'Water Supply Preparation',
      descBn: 'পানির ইনলেট লাইন বন্ধ করা এবং মূল পাইপলাইনের সাথে সংযোগ সাময়িকভাবে বিচ্ছিন্ন করে ড্রেইনেজ পথ নিশ্চিতকরণ।'
    },
    {
      step: '03',
      titleBn: 'অবশিষ্ট পানি নিষ্কাশন (Safe Water Removal)',
      titleEn: 'Safe Water Removal',
      descBn: 'উচ্চ ক্ষমতাসম্পন্ন সাবমারসিবল ও ডিওয়াটারিং পাম্পের সাহায্যে ট্যাংকে জমে থাকা অবশিষ্ট পানি দ্রুত অপসারণ।'
    },
    {
      step: '04',
      titleBn: 'কাদা ও স্লাজ নিষ্কাশন (Sediment Removal)',
      titleEn: 'Sediment Removal',
      descBn: 'ট্যাংকের তলদেশে বহু বছর ধরে জমে থাকা ভারী পলি, কাদা ও বালুকণা ভ্যাকুয়াম স্লাজ পাম্পিং ও হস্তচালিত পদ্ধতিতে পরিষ্কার।'
    },
    {
      step: '05',
      titleBn: 'মেকানিক্যাল স্ক্রাবিং (Mechanical Cleaning)',
      titleEn: 'Mechanical Cleaning',
      descBn: 'দেয়ালে ও মেঝেতে শক্তভাবে লেগে থাকা শ্যাওলা ও আয়রন আস্তরণ উপযুক্ত ব্রাশ ও ১২০–১৫০ বার রোটারি প্রেসার জেটে স্কাউরিং।'
    },
    {
      step: '06',
      titleBn: 'পৃষ্ঠতল ধৌতকরণ (Rinsing)',
      titleEn: 'Rinsing',
      descBn: 'স্ক্রাবিংয়ে আলগা হওয়া ময়লা, পলি ও নোংরা পানি পরিষ্কার পানির স্প্রে দিয়ে ধুয়ে সম্পূর্ণ ড্রেইন আউট করা।'
    },
    {
      step: '07',
      titleBn: 'উপযুক্ত স্যানিটাইজেশন (Suitable Sanitization)',
      titleEn: 'Suitable Sanitization',
      descBn: 'খাদ্য-সংস্পর্শ উপযোগী নিরাপদ স্যানিটাইজিং দ্রবণ অনুমোদিত মাত্রায় প্রয়োগ করে ব্যাকটেরিয়া ও বায়োফিল্ম প্রশমিতকরণ।'
    },
    {
      step: '08',
      titleBn: 'চূড়ান্ত পরিদর্শন ও ফ্লাশিং (Final Inspection & Rinsing)',
      titleEn: 'Final Inspection & Rinsing',
      descBn: 'ট্যাংক অভ্যন্তরীণ দেয়াল ও তলদেশ পুঙ্খানুপুঙ্খ পরীক্ষা এবং কোনো দ্রবণ অবশিষ্টাংশ যাতে না থাকে তা নিশ্চিত করতে চূড়ান্ত রিন্স।'
    },
    {
      step: '09',
      titleBn: 'রিফিল প্রস্তুতি ও হ্যান্ডওভার (Refill Readiness & Handover)',
      titleEn: 'Refill Readiness & Handover',
      descBn: 'ট্যাংক সিলিং ঢাকনা সুরক্ষিত করা, পানি রিফিলের সময়সীমা ও গ্রাহককে প্রয়োজনীয় সার্ভিস-পরবর্তী নির্দেশনা হস্তান্তর।'
    }
  ];

  // Specific 9 Water Tank FAQs as requested
  const waterTankFaqs = [
    {
      qBn: 'পানির ট্যাংক কত দিন পরপর পরিষ্কার করা উচিত?',
      aBn: 'স্বাস্থ্যসম্মত ব্যবহারের জন্য প্রতি ৬ মাস অন্তর (বছরে অন্তত দুই বার) ছাদের ওভারহেড ট্যাংক এবং আন্ডারগ্রাউন্ড রিজার্ভার ডিপ ক্লিন করা বিশ্ব স্বাস্থ্য মানদণ্ড অনুযায়ী সুপারিশকৃত।'
    },
    {
      qBn: 'পানির ট্যাংক পরিষ্কার করতে কত সময় লাগে?',
      aBn: 'ট্যাংকের ধারণক্ষমতা এবং ময়লার স্তরের ওপর সময় নির্ভর করে। সাধারণ ১,০০০–৩,০০০ লিটার ওভারহেড ট্যাংকে ২ থেকে ৩ ঘণ্টা এবং বড় ভূগর্ভস্থ রিজার্ভারে ৩ থেকে ৫ ঘণ্টা সময় লাগে।'
    },
    {
      qBn: 'পানির ট্যাংক পরিষ্কারের খরচ কীভাবে নির্ধারণ করা হয়?',
      aBn: 'ট্যাংকের ধরন (পিভিসি, আরসিসি বা আন্ডারগ্রাউন্ড), ধারণক্ষমতা (লিটার বা গ্যালন) এবং প্রবেশগম্যতা যাচাই করে স্বচ্ছ কোটেশন দেওয়া হয়। বুকিংয়ের পূর্বে আপনি নিশ্চিত আনুমানিক খরচ জানতে পারবেন।'
    },
    {
      qBn: 'আন্ডারগ্রাউন্ড ও ওভারহেড ট্যাংক কি পরিষ্কার করা হয়?',
      aBn: 'হ্যাঁ। আমরা ছাদের ওভারহেড পিভিসি/আরসিসি ট্যাংক এবং ভূগর্ভস্থ আন্ডারগ্রাউন্ড ওয়াটার রিজার্ভার—উভয়ের জন্যই বিশেষায়িত পাম্প ও প্রেসার ওয়াশার ব্যবহার করে সার্ভিস প্রদান করি।'
    },
    {
      qBn: 'ট্যাংকের ধারণক্ষমতা জানা না থাকলে কীভাবে কোটেশন পাওয়া যাবে?',
      aBn: 'ভবনের তলা সংখ্যা, ফ্ল্যাট সংখ্যা বা বাসিন্দার আনুমানিক সংখ্যা আমাদের জানালে আমাদের এক্সপার্ট টিম ধারণক্ষমতা অনুমান করে কোটেশন প্রদান করতে পারে। এছাড়া WhatsApp-এ ছবি পাঠালেও পরামর্শ দেওয়া হয়।'
    },
    {
      qBn: 'ট্যাংক পরিষ্কারের সময় পানির সংযোগ কীভাবে পরিচালনা করা হয়?',
      aBn: 'ক্লিনিংয়ের পূর্বে মূল ভালভ বন্ধ করে সংযোগ সুরক্ষিত রাখা হয়, যাতে লাইনে ময়লা পানি প্রবেশ না করে। কাজ শেষে সিস্টেম চেক করে স্বাভাবিক পানির সরবরাহ চালু করা হয়।'
    },
    {
      qBn: 'পরিষ্কার করার পর কখন আবার ট্যাংক ব্যবহার করা যাবে?',
      aBn: 'চূড়ান্ত রিন্স ও স্যানিটাইজেশন শেষ হলে ট্যাংক ড্রেন সম্পন্ন করার পর সাথে সাথেই ওয়াসা বা ডিপ টিউবওয়েলের ফ্রেশ পানি দিয়ে রিফিল করে ব্যবহার শুরু করা যায়।'
    },
    {
      qBn: 'ক্লিনিংয়ের সময় কী ধরনের স্যানিটাইজার ব্যবহার করা হয়?',
      aBn: 'আমরা নন-টক্সিক ও খাদ্য-সংস্পর্শ উপযোগী অনুমোদিত ওয়াটার স্যানিটাইজার দ্রবণ সঠিক মাত্রায় প্রয়োগ করি, যা এসিডের মতো ক্ষতিকর গন্ধ বা পাইপের ক্ষতি করে না।'
    },
    {
      qBn: 'বুকিং করতে কী কী তথ্য দিতে হবে?',
      aBn: 'আপনার নাম, মোবাইল নম্বর, ঢাকা শহরের এলাকা/ঠিকানা, ট্যাংকের ধরন (ছাদ/আন্ডারগ্রাউন্ড) এবং পছন্দসই তারিখ জানালেই আমাদের টিম দ্রুত কনফার্মেশন ও কোটেশন পাঠাবে।'
    }
  ];

  return (
    <main className="min-h-screen bg-[#080A0D] text-white py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-16">
      <SeoHead
        title="Water Tank Cleaning Service in Dhaka | Sunviloz Clean Care"
        description="Professional water tank cleaning service in Dhaka for rooftop and underground water tanks, including sludge, sediment and surface buildup removal. Call or WhatsApp 01609999612."
        canonicalUrl="https://sunvilozcleancare.com/services/water-tank-cleaning"
      />

      <Breadcrumbs 
        items={[
          { label: lang === 'bn' ? 'সার্ভিসসমূহ' : 'Services', href: '/services' },
          { label: lang === 'bn' ? 'পানির ট্যাংক পরিষ্কার সার্ভিস' : 'Water Tank Cleaning', href: '/services/water-tank-cleaning' }
        ]} 
      />

      {/* 1. Water Tank Cleaning Hero */}
      <section className="bg-[#11151B] border border-[#303743] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2585FF]/15 border border-[#2585FF]/30 text-xs font-bold text-[#2585FF] uppercase tracking-wider">
                <Droplets className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'প্রাইমারি কোর সার্ভিস' : 'Core Priority Service'}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#28C76F]/15 border border-[#28C76F]/30 text-xs font-extrabold text-[#28C76F] font-mono">
                {lang === 'bn' ? 'শুরু মাত্র ৳ ১,২০০' : 'Starting from BDT 1,200'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {lang === 'bn' ? 'ঢাকায় পেশাদার পানির ট্যাংক পরিষ্কার সার্ভিস' : 'Professional Water Tank Cleaning Service in Dhaka'}
            </h1>

            <p className="text-sm sm:text-base text-[#B8C0CC] leading-relaxed max-w-2xl">
              {lang === 'bn'
                ? 'বাসাবাড়ি, অ্যাপার্টমেন্ট ও বাণিজ্যিক ভবনের ছাদের ওভারহেড এবং ভূগর্ভস্থ আন্ডারগ্রাউন্ড পানির ট্যাংক পরিষ্কারে সানভিলোজ ক্লিন কেয়ারের আধুনিক মেকানিক্যাল পদ্ধতি ও খাদ্য-বান্ধব স্যানিটাইজিং সল্যুশন।'
                : 'Deep cleaning, heavy sludge extraction, high-pressure jet washing, and food-safe sanitization for underground reservoirs and rooftop tanks across Dhaka metro areas.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  trackEvent('water_tank_page_quote_click', { source: 'hero_primary' });
                  onOpenQuoteModal('Water Tank Cleaning Service');
                }}
                className="px-6 py-3.5 bg-[#2585FF] hover:bg-[#1a73e8] active:bg-[#1557b0] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#2585FF]/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>{lang === 'bn' ? 'কোটেশন ও বুকিং করুন' : 'Book & Get Quote'}</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick({ source: 'water_tank_hero' })}
                className="px-6 py-3.5 bg-[#28C76F]/15 hover:bg-[#28C76F]/25 text-[#28C76F] border border-[#28C76F]/40 font-bold text-sm rounded-xl transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#28C76F]" />
                <span>WhatsApp: {business.whatsappNumber || '01609999612'}</span>
              </a>

              <a
                href={`tel:${business.phone}`}
                className="px-5 py-3.5 bg-[#202630] hover:bg-[#2a3240] text-white font-semibold text-sm rounded-xl border border-[#303743] transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-[#2585FF]" />
                <span>{business.displayPhone || business.phone}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-video lg:aspect-4/3 rounded-2xl overflow-hidden border border-[#303743] shadow-xl bg-[#080A0D] group">
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75"
                alt="Professional Water Tank Cleaning Service in Dhaka"
                width="800"
                height="600"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080A0D]/90 via-transparent to-transparent flex items-end p-5">
                <span className="text-xs font-semibold text-[#B8C0CC] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#28C76F]" />
                  <span>হাই-প্রেসার ওয়াটার জেট ও সেফটি প্রোটোকল</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Service Benefits */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {lang === 'bn' ? 'পেশাদার ট্যাংক পরিষ্কারের মূল সুবিধাসমূহ' : 'Key Service Benefits'}
          </h2>
          <p className="text-sm text-[#B8C0CC] mt-2">
            {lang === 'bn' ? 'স্বাভাবিক হাত দিয়ে ধোয়ার চেয়ে মেকানিক্যাল ক্লিনিংয়ে পানির গুণমান সুরক্ষিত থাকে' : 'Reliable, hygienic water storage cleaning for building health'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: 'স্লাজ ও পলি নিষ্কাশন',
              desc: 'তলদেশে জমে থাকা ঘন কাদা, বালু ও ওয়াসার পলি ভ্যাকুয়াম পাম্প দিয়ে সম্পূর্ণ অপসারন।'
            },
            {
              title: 'উচ্চচাপ ওয়াটার স্কাউরিং',
              desc: '১২০-১৫০ বার রোটারি স্প্রে দিয়ে দেয়ালের শক্ত শ্যাওলা ও আয়রন আস্তরণ পরিষ্কার।'
            },
            {
              title: 'খাদ্য-বান্ধব স্যানিটাইজিং',
              desc: 'অনুমোদিত মাত্রার ফুড-গ্রেড সল্যুশন যা পানির গন্ধ পরিবর্তন না করে পরিচ্ছন্নতা আনে।'
            },
            {
              title: 'স্বচ্ছ মূল্য ও লিখিত কোটেশন',
              desc: 'কাজের পূর্বে ট্যাংকের আকার অনুযায়ী পরিষ্কার আলোচনা ও নির্ধারিত চার্জ।'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-[#171C24] border border-[#303743] space-y-3">
              <CheckCircle2 className="w-5 h-5 text-[#28C76F]" />
              <h3 className="font-bold text-white text-base">{item.title}</h3>
              <p className="text-xs sm:text-sm text-[#B8C0CC] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Tank Types We Clean */}
      <section className="bg-[#11151B] border border-[#303743] rounded-3xl p-6 sm:p-10 space-y-8">
        <div>
          <span className="text-xs font-bold text-[#2585FF] uppercase tracking-wider block mb-1">
            {lang === 'bn' ? 'ট্যাংকের প্রকারভেদ' : 'Versatile Capability'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {lang === 'bn' ? 'যেসব পানির ট্যাংক আমরা পরিষ্কার করি' : 'Tank Types We Clean'}
          </h2>
          <p className="text-sm text-[#B8C0CC] mt-2">
            আবাসিক ও বাণিজ্যিক ভবনের সব ধরনের স্টোরেজ কাঠামোর জন্য আমাদের রয়েছে উপযুক্ত যন্ত্রপাতি।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-[#171C24] border border-[#303743]">
            <h3 className="font-bold text-white text-base mb-1">ওভারহেড পিভিসি ট্যাংক</h3>
            <p className="text-xs text-[#B8C0CC]">ছাদের ৫০০ থেকে ৫,০০০ লিটার প্লাস্টিক বা পলিমার ট্যাংক।</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#171C24] border border-[#303743]">
            <h3 className="font-bold text-white text-base mb-1">ওভারহেড আরসিসি ট্যাংক</h3>
            <p className="text-xs text-[#B8C0CC]">ছাদের কংক্রিট বা পাকা ট্যাংক যেখানে ভারী শ্যাওলা জমে।</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#171C24] border border-[#303743]">
            <h3 className="font-bold text-white text-base mb-1">আন্ডারগ্রাউন্ড রিজার্ভার</h3>
            <p className="text-xs text-[#B8C0CC]">মাটির নিচে স্থাপিত ৫,০০০ থেকে ১,০০,০০০+ লিটার রিজার্ভার।</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#171C24] border border-[#303743]">
            <h3 className="font-bold text-white text-base mb-1">স্টেইনলেস স্টিল ও কমার্শিয়াল</h3>
            <p className="text-xs text-[#B8C0CC]">হাসপাতাল, হোটেল, গার্মেন্টস ও কারখানার ফুড-গ্রেড স্টোরেজ।</p>
          </div>
        </div>
      </section>

      {/* Customer Problems & Educational Insight */}
      <CustomerProblemSection 
        onOpenQuoteModal={() => onOpenQuoteModal('Water Tank Cleaning Service')} 
        showPhotoCta={true}
      />

      {/* 4. Scientific 9-Step Cleaning Process (Section 9) */}
      <section id="process-steps" className="space-y-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#2585FF] uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2585FF]" aria-hidden="true" />
            <span>বিজ্ঞানসম্মত কার্যপ্রণালী</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            বিজ্ঞানসম্মত ৯টি ধাপ
          </h2>
          
          <p className="text-base text-[#2585FF] font-semibold mt-1">
            ওয়াটার ট্যাংকের জন্য আধুনিক ও নিরাপদ ক্লিনিং প্রসেস
          </p>

          <p className="text-xs sm:text-sm text-[#B8C0CC] mt-2 leading-relaxed">
            আমরা সুশৃঙ্খল ধাপে ধাপে পরিচ্ছন্নতা পরিচালনা করি। কোনো ক্ষতিকর অ্যাসিড বা অস্বাস্থ্যকর পদ্ধতি ব্যবহার না করে যান্ত্রিক ও অনুমোদিত স্যানিটাইজিং উপায়ে সেবা সম্পন্ন হয়।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nineSteps.map((step) => (
            <div 
              key={step.step}
              className="bg-[#171C24] border border-[#303743] hover:border-[#2585FF]/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-[#2585FF] px-2.5 py-1 rounded bg-[#202630] border border-[#303743]">
                    ধাপ {step.step}
                  </span>
                  <Check className="w-4 h-4 text-[#28C76F]" />
                </div>
                <h3 className="font-bold text-white text-base mb-2">
                  {step.titleBn}
                </h3>
                <p className="text-xs sm:text-sm text-[#B8C0CC] leading-relaxed">
                  {step.descBn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Live Project Work Videos Documentation */}
      <OurWorkVideosSection />

      {/* 6. Pricing or Quote Information */}
      <div id="quote" className="space-y-4">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {lang === 'bn' ? 'তাৎক্ষণিক কোটেশন ও আনুমানিক খরচ' : 'Instant Quotation & Estimation'}
          </h2>
          <p className="text-xs sm:text-sm text-[#B8C0CC] mt-1">
            আপনার ট্যাংকের সাইজ ও ধরন নির্বাচন করে সহজ কয়েকটি ধাপে আনুমানিক খরচ দেখুন।
          </p>
        </div>
        <SmartQuoteWizard />
      </div>

      {/* 7. Service Area Information */}
      <section className="bg-[#11151B] border border-[#303743] rounded-3xl p-6 sm:p-10 space-y-5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#2585FF] uppercase">
          <MapPin className="w-4 h-4" />
          <span>সার্ভিস এলাকা</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          ঢাকা শহরের সকল প্রধান এলাকায় আমরা সার্ভিস দিচ্ছি
        </h2>
        <p className="text-xs sm:text-sm text-[#B8C0CC] leading-relaxed">
          মিরপুর, উত্তরা, ধানমন্ডি, গুলশান, বনানী, বারিধারা, মোহাম্মদপুর, বাড্ডা, খিলগাঁও, রামপুরা, বসুন্ধরা আবাসিক, পুরান ঢাকা এবং কেরানীগঞ্জসহ সমগ্র ঢাকা মেট্রোপলিটন এলাকায় আমাদের মোবাইল টেকনিশিয়ান টিম পৌঁছে যায়।
        </p>
      </section>

      {/* 8. Frequently Asked Questions — Water Tank Cleaning (Section 10) */}
      <section id="faq" className="space-y-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#2585FF] uppercase mb-2">
            <span>প্রশ্নোত্তর</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            সচরাচর জিজ্ঞাসিত প্রশ্নাবলী
          </h2>

          <p className="text-sm sm:text-base text-[#B8C0CC] mt-2">
            ওয়াটার ট্যাংক ক্লিনিং পদ্ধতি, খরচ ও সময়সূচি সংক্রান্ত প্রয়োজনীয় তথ্য।
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-3">
          {waterTankFaqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                className="bg-[#171C24] border border-[#303743] rounded-xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-white hover:text-[#2585FF] flex items-center justify-between gap-4 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-[#2585FF] text-xs font-mono font-bold">Q{index + 1}.</span>
                    <span>{faq.qBn}</span>
                  </span>
                  <ChevronDown 
                    className={`w-4 h-4 text-[#B8C0CC] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#2585FF]' : ''}`} 
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#B8C0CC] leading-relaxed border-t border-[#303743]/50">
                    <p>{faq.aBn}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. WhatsApp Booking CTA Banner */}
      <section className="bg-gradient-to-r from-[#171C24] via-[#1c232e] to-[#171C24] border border-[#2585FF]/40 rounded-3xl p-6 sm:p-10 lg:p-12 text-center space-y-6 shadow-2xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          আপনার পানির ট্যাংক আজই পরিষ্কার করতে চান?
        </h2>
        <p className="text-sm text-[#B8C0CC] max-w-2xl mx-auto leading-relaxed">
          কোনো অগ্রিম পেমেন্ট ছাড়াই সরাসরি আপনার ট্যাংকের তথ্য জানিয়ে ফ্রি কোটেশন ও সুবিধাজনক শিডিউল নিশ্চিত করুন।
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick({ source: 'water_tank_bottom_cta' })}
            className="px-8 py-3.5 bg-[#28C76F] hover:bg-[#22ab5f] text-slate-950 font-extrabold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-[#28C76F]/20 flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5 text-slate-950" />
            <span>WhatsApp-এ সরাসরি বুকিং করুন</span>
          </a>

          <button
            type="button"
            onClick={() => onOpenQuoteModal('Water Tank Cleaning Service')}
            className="px-7 py-3.5 bg-[#2585FF] hover:bg-[#1a73e8] text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-[#2585FF]/20"
          >
            <span>অনলাইন কোটেশন ফর্ম</span>
          </button>
        </div>
      </section>

      {/* 10. Related Services */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          সম্পর্কিত অন্যান্য সেবা
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <button
            type="button"
            onClick={() => handleNavigate('/services/pipeline-cleaning')}
            className="p-5 rounded-2xl bg-[#171C24] border border-[#303743] hover:border-[#2585FF]/50 text-left transition-all group flex items-start gap-4 cursor-pointer"
          >
            <Wrench className="w-8 h-8 text-[#2585FF] shrink-0" />
            <div>
              <h3 className="font-bold text-white group-hover:text-[#2585FF] transition-colors text-base">
                Pipeline Cleaning Service
              </h3>
              <p className="text-xs text-[#B8C0CC] mt-1">
                পাইপলাইনে জমে থাকা আয়রন ও মরিচা দেয়াল অক্ষত রেখে ফ্লাশিং।
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('/services/home-deep-cleaning')}
            className="p-5 rounded-2xl bg-[#171C24] border border-[#303743] hover:border-[#2585FF]/50 text-left transition-all group flex items-start gap-4 cursor-pointer"
          >
            <Sparkles className="w-8 h-8 text-[#28C76F] shrink-0" />
            <div>
              <h3 className="font-bold text-white group-hover:text-[#2585FF] transition-colors text-base">
                Professional Deep Cleaning
              </h3>
              <p className="text-xs text-[#B8C0CC] mt-1">
                নতুন বাসা, ফ্ল্যাট বা রেনোভেশনের পর সম্পূর্ণ বাড়ি ডিপ ক্লিন।
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('/services/sofa-cleaning')}
            className="p-5 rounded-2xl bg-[#171C24] border border-[#303743] hover:border-[#2585FF]/50 text-left transition-all group flex items-start gap-4 cursor-pointer"
          >
            <Droplets className="w-8 h-8 text-cyan-400 shrink-0" />
            <div>
              <h3 className="font-bold text-white group-hover:text-[#2585FF] transition-colors text-base">
                Sofa & Upholstery Cleaning
              </h3>
              <p className="text-xs text-[#B8C0CC] mt-1">
                সোফার ডাস্ট ও দাগ দূরীকরণে আধুনিক ফোম ওয়াশ ও ভ্যাকুয়াম।
              </p>
            </div>
          </button>
        </div>
      </section>

    </main>
  );
};

export default WaterTankCleaningPage;
