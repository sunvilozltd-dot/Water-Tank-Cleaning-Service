import React, { useState } from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SmartQuoteWizard } from '../components/SmartQuoteWizard';
import { SendTankPhotoCta } from '../components/SendTankPhotoCta';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  MessageCircle, 
  Wrench, 
  Droplets,
  CalendarCheck,
  ChevronDown,
  Layers,
  MapPin,
  Check,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { trackWhatsAppClick, trackEvent } from '../utils/tracking';

interface PipelineCleaningPageProps {
  onOpenQuoteModal: (serviceName?: string) => void;
  onNavigate?: (path: string) => void;
}

export const PipelineCleaningPage: React.FC<PipelineCleaningPageProps> = ({ 
  onOpenQuoteModal,
  onNavigate 
}) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();
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
  const whatsappUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent('আসসালামু আলাইকুম। আমি পানির পাইপলাইন পরিষ্কার সার্ভিস (Pipeline Cleaning Service) সম্পর্কে জানতে ও বুকিং করতে চাই।')}`;

  const pipelineFaqs = [
    {
      qBn: 'পাইপলাইন পরিষ্কার করতে দেয়াল বা টাইলস কি ভাঙতে হবে?',
      aBn: 'একেবারেই না। আমাদের পদ্ধতিতে দেয়াল বা টাইলসের কোনো ক্ষতি না করে বিদ্যমান ট্যাপ, অ্যাঙ্গেল স্টপ কক এবং মেইন লাইনে সরাসরি মেশিন সংযুক্ত করে উচ্চচাপে ফ্লাশিং সম্পন্ন করা হয়।'
    },
    {
      qBn: 'পাইপে জমে থাকা আয়রন ও মরিচা কীভাবে দূর করা হয়?',
      aBn: 'এয়ার-ওয়াটার পালস বা হাইড্রো-পালস প্রেসারাইজড ফ্লো তৈরি করে পাইপের ভেতরের আস্তরণে জমে থাকা আয়রন ও মরিচাকে আলগা করে তীব্র বেগে ড্রেইন আউট করা হয়।'
    },
    {
      qBn: 'ক্লিনিংয়ের পর শাওয়ার ও ট্যাপের পানির স্পিড কি বাড়বে?',
      aBn: 'হ্যাঁ। পাইপলাইনের ব্লকেজ ও স্লাগ দূর হয়ে গেলে ট্যাপ, বাথটাব এবং শাওয়ারে পানির প্রবাহ তার স্বাভাবিক বেগ ফিরে পায়।'
    },
    {
      qBn: 'সিপিভিসি, পিপিআর ও জিআই পাইপের ক্ষেত্রে কি এটি নিরাপদ?',
      aBn: 'হ্যাঁ। আমরা পাইপের উপাদান এবং বয়স অনুযায়ী প্রেসার নিয়ন্ত্রণ করি, ফলে পিভিসি, সিপিভিসি, পিপিআর কিংবা পুরোনো জিআই লাইনে কোনো ফাটল সৃষ্টি হয় না।'
    },
    {
      qBn: 'পাইপলাইন ক্লিনিং করতে কত সময় লাগে?',
      aBn: 'সাধারণতঃ একটি স্ট্যান্ডার্ড ফ্ল্যাট বা বাড়ির অভ্যন্তরীণ পাইপলাইন ফ্লাশিংয়ে ৩ থেকে ৪ ঘণ্টা সময় লাগে। সম্পূর্ণ বিল্ডিংয়ের ক্ষেত্রে সমন্বয় করে কাজ করা হয়।'
    }
  ];

  return (
    <main className="min-h-screen bg-[#080A0D] text-white py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-16">
      <SeoHead
        title="Pipeline Cleaning Service in Dhaka | Sunviloz Clean Care"
        description="Non-invasive water pipeline cleaning and hydro-pulse flushing in Dhaka. Remove iron rust and sediment without breaking walls. Call or WhatsApp 01609999612."
        canonicalUrl="https://sunvilozcleancare.com/services/pipeline-cleaning"
      />

      <Breadcrumbs 
        items={[
          { label: lang === 'bn' ? 'সার্ভিসসমূহ' : 'Services', href: '/services' },
          { label: lang === 'bn' ? 'পানির পাইপলাইন পরিষ্কার সার্ভিস' : 'Pipeline Cleaning Service', href: '/services/pipeline-cleaning' }
        ]} 
      />

      {/* Hero */}
      <section className="bg-[#11151B] border border-[#303743] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2585FF]/15 border border-[#2585FF]/30 text-xs font-bold text-[#2585FF] uppercase tracking-wider">
                <Wrench className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'বিশেষায়িত পাইপলাইন ফ্লাশিং' : 'Non-Invasive Pipe Descaling'}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#28C76F]/15 border border-[#28C76F]/30 text-xs font-extrabold text-[#28C76F] font-mono">
                {lang === 'bn' ? 'শুরু মাত্র ৳ ১,৫০০' : 'Starting from BDT 1,500'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {lang === 'bn' ? 'পেশাদার পানির পাইপলাইন পরিষ্কার ও ফ্লাশিং সার্ভিস' : 'Professional Water Pipeline Cleaning Service in Dhaka'}
            </h1>

            <p className="text-sm sm:text-base text-[#B8C0CC] leading-relaxed max-w-2xl">
              {lang === 'bn'
                ? 'বাসা ও বাণিজ্যিক ভবনের পানির পাইপলাইনে জমে থাকা আয়রন, মরিচা ও ক্ষতিকর স্লাগ দেয়াল বা টাইলস অক্ষত রেখে আধুনিক হাইড্রো-পালস প্রেসারাইজড পদ্ধতিতে অপসারণ।'
                : 'Advanced non-invasive air-water pulse flushing technology to clear heavy rust scale, bio-sludge, and mineral deposits from internal water pipes without damaging walls or tiles.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  trackEvent('pipeline_page_quote_click', { source: 'hero_primary' });
                  onOpenQuoteModal('Pipeline Cleaning Service');
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
                onClick={() => trackWhatsAppClick({ source: 'pipeline_hero' })}
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
                src="https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=75"
                alt="Water Pipeline Cleaning Service in Dhaka"
                width="800"
                height="600"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080A0D]/90 via-transparent to-transparent flex items-end p-5">
                <span className="text-xs font-semibold text-[#B8C0CC] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#28C76F]" />
                  <span>দেয়াল না ভেঙে হাইড্রো-পালস ফ্লাশিং</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Benefits */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {lang === 'bn' ? 'পাইপলাইন ফ্লাশিংয়ের মূল সুবিধাসমূহ' : 'Key Advantages'}
          </h2>
          <p className="text-sm text-[#B8C0CC] mt-2">
            ট্যাংক পরিষ্কারের পাশাপাশি পাইপলাইন পরিষ্কার রাখলে ট্যাপে সম্পূর্ণ ফ্রেশ পানি পাওয়া যায়।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: 'দেয়াল অক্ষত রেখে কাজ',
              desc: 'কোনো ড্রিলিং বা টাইলস কাটার প্রয়োজন নেই, ট্যাপ কানেকশনে মেশিন যুক্ত হয়।'
            },
            {
              title: 'আয়রন ও লালচে পানির সমাধান',
              desc: 'পাইপের ভেতরে জমে থাকা দীর্ঘদিনের আয়রন ও শ্যাওলা পরিষ্কার হয়ে স্বচ্ছ পানি বের হয়।'
            },
            {
              title: 'পানির স্বাভাবিক প্রবাহ বৃদ্ধি',
              desc: 'ব্লকেজ দূর হয়ে শাওয়ার ও বেসিন ট্যাপে পানির চমৎকার গতি ফিরে আসে।'
            },
            {
              title: 'সব ধরনের পাইপে নিরাপদ',
              desc: 'কন্ট্রোল্ড প্রেসার প্রযুক্তির কারণে সিপিভিসি, পিপিআর ও জিআই পাইপে নিরাপদ।'
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

      {/* Pipe Types We Clean */}
      <section className="bg-[#11151B] border border-[#303743] rounded-3xl p-6 sm:p-10 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          যেসব পাইপলাইন সিস্টেমে আমরা কাজ করি
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-[#171C24] border border-[#303743]">
            <h3 className="font-bold text-white text-base mb-1">CPVC & PPR পাইপলাইন</h3>
            <p className="text-xs text-[#B8C0CC]">আধুনিক বাথরুম ও কিচেনের প্লাস্টিক ফিটিংস লাইনে নিরাপদ পালস ফ্লাশিং।</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#171C24] border border-[#303743]">
            <h3 className="font-bold text-white text-base mb-1">জিআই (GI) পাইপলাইন</h3>
            <p className="text-xs text-[#B8C0CC]">পুরোনো ভবনের লোহার পাইপে জমে থাকা অভ্যন্তরীণ ভারী মরিচার স্তর অপসারণ।</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#171C24] border border-[#303743]">
            <h3 className="font-bold text-white text-base mb-1">মেইন রাইজার ও ড্রপ লাইন</h3>
            <p className="text-xs text-[#B8C0CC]">ছাদের ট্যাংক থেকে বাথরুমে পানি নামার উল্লম্ব ফিডার লাইনের সামগ্রিক ফ্লাশিং।</p>
          </div>
        </div>
      </section>

      {/* Quote / Calculator */}
      <div id="quote" className="space-y-4">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            পাইপলাইন সার্ভিসের খরচ ও কোটেশন
          </h2>
          <p className="text-xs sm:text-sm text-[#B8C0CC] mt-1">
            আপনার ফ্ল্যাটের বাথরুম ও কিচেন সংখ্যা অনুযায়ী সহজ পদক্ষেপে কোটেশন জেনে নিন।
          </p>
        </div>
        <SmartQuoteWizard />
      </div>

      {/* FAQs */}
      <section id="faq" className="space-y-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            সচরাচর জিজ্ঞাসিত প্রশ্নাবলী — পাইপলাইন ক্লিনিং
          </h2>
          <p className="text-sm text-[#B8C0CC] mt-2">
            পানির পাইপলাইন ফ্লাশিং পদ্ধতি, খরচ ও সময়সূচি সংক্রান্ত প্রয়োজনীয় তথ্য।
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-3">
          {pipelineFaqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                className="bg-[#171C24] border border-[#303743] rounded-xl overflow-hidden"
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

      {/* Send Photo CTA */}
      <SendTankPhotoCta source="pipeline_page" />

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-[#171C24] via-[#1c232e] to-[#171C24] border border-[#2585FF]/40 rounded-3xl p-6 sm:p-10 lg:p-12 text-center space-y-6 shadow-2xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          কম পানির স্পিড বা ময়লা পানির সমস্যায় ভুগছেন?
        </h2>
        <p className="text-sm text-[#B8C0CC] max-w-2xl mx-auto leading-relaxed">
          কোনো ভাঙচুর ছাড়া মাত্র কয়েক ঘণ্টার ফ্লাশিংয়ে আপনার ভবনের পানির পাইপলাইন ফিরে পাবে পূর্ণ সতেজতা।
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick({ source: 'pipeline_bottom_cta' })}
            className="px-8 py-3.5 bg-[#28C76F] hover:bg-[#22ab5f] text-slate-950 font-extrabold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-[#28C76F]/20 flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5 text-slate-950" />
            <span>WhatsApp-এ সরাসরি বুকিং করুন</span>
          </a>

          <button
            type="button"
            onClick={() => onOpenQuoteModal('Pipeline Cleaning Service')}
            className="px-7 py-3.5 bg-[#2585FF] hover:bg-[#1a73e8] text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-[#2585FF]/20"
          >
            <span>অনলাইন কোটেশন ফর্ম</span>
          </button>
        </div>
      </section>

      {/* Related Services */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          সম্পর্কিত অন্যান্য সেবা
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <button
            type="button"
            onClick={() => handleNavigate('/water-tank-cleaning-service')}
            className="p-5 rounded-2xl bg-[#171C24] border border-[#303743] hover:border-[#2585FF]/50 text-left transition-all group flex items-start gap-4 cursor-pointer"
          >
            <Droplets className="w-8 h-8 text-[#2585FF] shrink-0" />
            <div>
              <h3 className="font-bold text-white group-hover:text-[#2585FF] transition-colors text-base">
                Water Tank Cleaning Service
              </h3>
              <p className="text-xs text-[#B8C0CC] mt-1">
                ছাদ ও ভূগর্ভস্থ পানির ট্যাংকের গভীর পরিষ্কার ও স্যানিটাইজেশন।
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
                সম্পূর্ণ বাড়ির ফ্লোর স্ক্রাবিং ও গভীর পরিচ্ছন্নতা সেবা।
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('/services/bathroom-cleaning-service')}
            className="p-5 rounded-2xl bg-[#171C24] border border-[#303743] hover:border-[#2585FF]/50 text-left transition-all group flex items-start gap-4 cursor-pointer"
          >
            <Droplets className="w-8 h-8 text-cyan-400 shrink-0" />
            <div>
              <h3 className="font-bold text-white group-hover:text-[#2585FF] transition-colors text-base">
                Bathroom Deep Cleaning
              </h3>
              <p className="text-xs text-[#B8C0CC] mt-1">
                টাইলসের হলুদ আয়রন দাগ ও বাথরুম স্যানিটারি সামগ্রী ক্লিনিং।
              </p>
            </div>
          </button>
        </div>
      </section>

    </main>
  );
};

export default PipelineCleaningPage;
