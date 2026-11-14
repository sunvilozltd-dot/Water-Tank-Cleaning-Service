import React, { useState } from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SmartQuoteWizard } from '../components/SmartQuoteWizard';
import { SendTankPhotoCta } from '../components/SendTankPhotoCta';
import { OptimizedImage } from '../components/OptimizedImage';
import { 
  Wrench, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  MessageCircle,
  CalendarCheck,
  ChevronDown,
  Sparkles,
  Droplets,
  ShieldCheck,
  Building2,
  MapPin
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useServices } from '../utils/servicesStore';
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
  const { getServiceBySlug } = useServices();
  const dbService = getServiceBySlug('pipeline-cleaning') || getServiceBySlug('water-pipeline-cleaning');

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
  const whatsappDisplay = rawNumber.startsWith('880')
    ? rawNumber.slice(2).replace(/^(\d{5})(\d+)$/, '$1-$2')
    : (rawNumber || '01609-999612');
  const whatsappUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent('আসসালামু আলাইকুম। আমি ওয়াটার পাইপলাইন ক্লিনিং সার্ভিস (Water Pipeline Cleaning Service) সম্পর্কে জানতে ও বুকিং করতে চাই।')}`;

  const pipelineFaqs = [
    {
      qBn: 'পাইপলাইন পরিষ্কার করতে দেয়াল বা টাইলস কি ভাঙতে হয়?',
      aBn: 'না, একদমই কোনো ভাঙচুর করতে হয় না। আমাদের আধুনিক হাইড্রো-পালস বা এয়ার-ওয়াটার কম্প্রেশন প্রযুক্তি ট্যাপের মুখ থেকে সরাসরি লাইনের ভেতর কাজ করে।'
    },
    {
      qBn: 'পাইপলাইন ফ্লাশিংয়ে কত সময় লাগে?',
      aBn: 'একটি সাধারণ ৩-৪ বাথরুমের আবাসিক ফ্ল্যাটের সম্পূর্ণ পাইপলাইন ফ্লাশিং করতে ২ থেকে ৩ ঘণ্টার মতো সময় প্রয়োজন হয়।'
    },
    {
      qBn: 'কী ধরনের পাইপলাইন পরিষ্কার করা সম্ভব?',
      aBn: 'আমরা সিপিভিসি (CPVC), পিপিআর (PPR), পিভিসি এবং পুরোনো ভবনের জিআই (GI) পাইপলাইনের আয়রন ও মরিচা নিরাপদে দূর করি।'
    },
    {
      qBn: 'ক্লিনিংয়ের পর কি লালচে বা আয়রনযুক্ত পানির সমস্যা দূর হবে?',
      aBn: 'হ্যাঁ, পাইপের অভ্যন্তরীণ গায়ে লেগে থাকা ভারী আয়রন ও শ্যাওলার আস্তরণ ফ্লাশিং আউট হওয়ার কারণে স্বচ্ছ পানি নিশ্চিত হয়।'
    },
    {
      qBn: 'সার্ভিস চার্জ কীভাবে নির্ধারিত হয়?',
      aBn: 'বাথরুম ও কিচেন লাইনের সংখ্যা এবং পাইপের ধরনের ওপর নির্ভর করে স্বচ্ছ ও সাশ্রয়ী রেটে চার্জ নির্ধারণ করা হয়।'
    }
  ];

  const breadcrumbsList = [
    { name: lang === 'bn' ? 'হোম' : 'Home', path: '/' },
    { name: lang === 'bn' ? 'সার্ভিসসমূহ' : 'Services', path: '/services' },
    { name: lang === 'bn' ? 'পাইপলাইন পরিষ্কার সার্ভিস' : 'Water Pipeline Cleaning Service', path: '/services/pipeline-cleaning' }
  ];

  const defaultFaqItems = pipelineFaqs.map(f => ({
    question: f.qBn,
    answer: f.aBn
  }));

  const activeFaqItems =
    dbService?.faqs && dbService.faqs.length > 0
      ? dbService.faqs.map(f => ({
          question: lang === 'bn' ? (f.questionBn || f.question) : (f.question || f.questionBn || ''),
          answer: lang === 'bn' ? (f.answerBn || f.answer) : (f.answer || f.answerBn || '')
        })).filter(item => Boolean(item.question && item.answer))
      : defaultFaqItems;

  const autoFallbackMetaTitle = dbService ? `${dbService.title} in Dhaka | Sunviloz Clean Care` : '';
  const explicitServiceMetaTitle =
    dbService?.metaTitle && dbService.metaTitle !== autoFallbackMetaTitle
      ? dbService.metaTitle
      : undefined;
  const explicitServiceMetaDesc =
    dbService?.metaDesc && dbService.metaDesc !== dbService.shortDesc
      ? dbService.metaDesc
      : undefined;

  return (
    <main className="min-h-screen bg-transparent text-[#172B3A] py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-16">
      <SeoHead
        title={explicitServiceMetaTitle}
        description={explicitServiceMetaDesc}
        canonicalPath="/services/pipeline-cleaning"
        canonicalUrl="https://sunvilozcleancare.com/services/pipeline-cleaning"
        ogType="service"
        ogImage={dbService?.image || undefined}
        serviceSchema={{
          name: 'Water Pipeline Cleaning Service in Dhaka',
          serviceType: 'Water Pipeline Cleaning',
          description: explicitServiceMetaDesc || 'Non-destructive hydro-pulse pressurized pipeline descaling and flushing to clear iron sediments, rust scaling, and bio-slime from internal plumbing across Dhaka.'
        }}
        breadcrumbs={breadcrumbsList}
        faqSchema={activeFaqItems}
      />

      <Breadcrumbs
        items={[
          { label: lang === 'bn' ? 'সার্ভিসসমূহ' : 'Services', href: '/services' },
          { label: lang === 'bn' ? 'পাইপলাইন পরিষ্কার সার্ভিস' : 'Pipeline Cleaning', href: '/services/pipeline-cleaning' }
        ]}
      />

      {/* Hero */}
      <section className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-md relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5F3] border border-[#0D9488]/30 text-xs font-bold text-[#0D9488] uppercase tracking-wider">
                <Wrench className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'বিশেষায়িত পাইপলাইন ফ্লাশিং' : 'Non-Invasive Pipe Descaling'}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-[#16A34A] font-mono">
                {lang === 'bn' ? 'শুরু মাত্র ৳ ১,৫০০' : 'Starting from BDT 1,500'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#123047] tracking-tight leading-tight">
              {lang === 'bn' ? 'পেশাদার পানির পাইপলাইন পরিষ্কার ও ফ্লাশিং সার্ভিস' : 'Professional Water Pipeline Cleaning Service in Dhaka'}
            </h1>

            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-2xl">
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
                className="px-6 py-3.5 bg-[#0D9488] hover:bg-[#0F766E] active:bg-[#0f6861] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#0D9488]/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>{lang === 'bn' ? 'কোটেশন ও বুকিং করুন' : 'Book & Get Quote'}</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick({ source: 'pipeline_hero' })}
                className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>WhatsApp: {whatsappDisplay}</span>
              </a>

              <a
                href={`tel:${business.phone}`}
                className="px-5 py-3.5 bg-[#123047] hover:bg-[#1b4363] text-white font-semibold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                <Phone className="w-4 h-4 text-[#38BDF8]" />
                <span>{business.displayPhone || business.phone}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-video lg:aspect-4/3 rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-md bg-[#F5FAFC] group">
              <OptimizedImage
                src="https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/water-pipeline-cleaning_1794133710278.jpg"
                alt="Water Pipeline Cleaning Service in Dhaka"
                width={800}
                height={600}
                aspectRatio="4/3"
                priority={true}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#123047]/80 via-transparent to-transparent flex items-end p-5 pointer-events-none">
                <span className="text-xs font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#25D366]" />
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123047]">
            {lang === 'bn' ? 'পাইপলাইন ফ্লাশিংয়ের মূল সুবিধাসমূহ' : 'Key Advantages'}
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
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
            <div key={idx} className="p-6 rounded-2xl bg-white border border-[#E2E8F0] space-y-3 shadow-sm hover:shadow-md transition-all">
              <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
              <h3 className="font-bold text-[#123047] text-base">{item.title}</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pipe Types We Clean */}
      <section className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123047]">
          যেসব পাইপলাইন সিস্টেমে আমরা কাজ করি
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-[#F5FAFC] border border-[#E2E8F0]">
            <h3 className="font-bold text-[#123047] text-base mb-1">CPVC & PPR পাইপলাইন</h3>
            <p className="text-xs text-[#64748B]">আধুনিক বাথরুম ও কিচেনের প্লাস্টিক ফিটিংস লাইনে নিরাপদ পালস ফ্লাশিং।</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#F5FAFC] border border-[#E2E8F0]">
            <h3 className="font-bold text-[#123047] text-base mb-1">জিআই (GI) পাইপলাইন</h3>
            <p className="text-xs text-[#64748B]">পুরোনো ভবনের লোহার পাইপে জমে থাকা অভ্যন্তরীণ ভারী মরিচার স্তর অপসারণ।</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#F5FAFC] border border-[#E2E8F0]">
            <h3 className="font-bold text-[#123047] text-base mb-1">মেইন রাইজার ও ড্রপ লাইন</h3>
            <p className="text-xs text-[#64748B]">ছাদের ট্যাংক থেকে বাথরুমে পানি নামার উল্লম্ব ফিডার লাইনের সামগ্রিক ফ্লাশিং।</p>
          </div>
        </div>
      </section>

      {/* Quote / Calculator */}
      <div id="quote" className="space-y-4">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123047]">
            পাইপলাইন সার্ভিসের খরচ ও কোটেশন
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            আপনার ফ্ল্যাটের বাথরুম ও কিচেন সংখ্যা অনুযায়ী সহজ পদক্ষেপে কোটেশন জেনে নিন।
          </p>
        </div>
        <SmartQuoteWizard />
      </div>

      {/* FAQs */}
      <section id="faq" className="space-y-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123047]">
            সচরাচর জিজ্ঞাসিত প্রশ্নাবলী — পাইপলাইন ক্লিনিং
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            পানির পাইপলাইন ফ্লাশিং পদ্ধতি, খরচ ও সময়সূচি সংক্রান্ত প্রয়োজনীয় তথ্য।
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-3">
          {activeFaqItems.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-[#123047] hover:text-[#0D9488] flex items-center justify-between gap-4 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-[#0D9488] text-xs font-mono font-bold">Q{index + 1}.</span>
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown 
                    className={`w-4 h-4 text-[#64748B] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#0D9488]' : ''}`} 
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#64748B] leading-relaxed border-t border-[#E2E8F0]">
                    <p>{faq.answer}</p>
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
      <section className="bg-[#123047] rounded-3xl p-6 sm:p-10 lg:p-12 text-center space-y-6 shadow-xl text-white">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          কম পানির স্পিড বা ময়লা পানির সমস্যায় ভুগছেন?
        </h2>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          কোনো ভাঙচুর ছাড়া মাত্র কয়েক ঘণ্টার ফ্লাশিংয়ে আপনার ভবনের পানির পাইপলাইন ফিরে পাবে পূর্ণ সতেজতা।
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick({ source: 'pipeline_bottom_cta' })}
            className="px-8 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-[#25D366]/20 flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5 text-white" />
            <span>WhatsApp-এ সরাসরি বুকিং করুন</span>
          </a>

          <button
            type="button"
            onClick={() => onOpenQuoteModal('Pipeline Cleaning Service')}
            className="px-7 py-3.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-[#0D9488]/20 cursor-pointer"
          >
            <span>অনলাইন কোটেশন ফর্ম</span>
          </button>
        </div>
      </section>

      {/* Related Services */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider block">
            সম্পর্কিত সেবা
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#123047]">
            {lang === 'bn' ? 'সম্পর্কিত ওয়াটার ট্যাংক ক্লিনিং সার্ভিসসমূহ' : 'Related Water Tank Cleaning Services'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <a
            href="/services/water-tank-cleaning"
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              handleNavigate('/services/water-tank-cleaning');
            }}
            className="p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0D9488]/50 text-left transition-all group flex items-start gap-4 cursor-pointer shadow-sm"
          >
            <Droplets className="w-8 h-8 text-[#0D9488] shrink-0" />
            <div>
              <h3 className="font-bold text-[#123047] group-hover:text-[#0D9488] transition-colors text-base">
                Water Tank Cleaning Service
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                ছাদ ও ভূগর্ভস্থ পানির ট্যাংকের গভীর মেকানাইজড পরিষ্কার ও খাদ্য-বান্ধব স্যানিটাইজেশন।
              </p>
            </div>
          </a>

          <a
            href="/services/overhead-tank-cleaning"
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              handleNavigate('/services/overhead-tank-cleaning');
            }}
            className="p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0D9488]/50 text-left transition-all group flex items-start gap-4 cursor-pointer shadow-sm"
          >
            <Building2 className="w-8 h-8 text-[#0D9488] shrink-0" />
            <div>
              <h3 className="font-bold text-[#123047] group-hover:text-[#0D9488] transition-colors text-base">
                Overhead Water Tank Cleaning Service
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                ছাদের পিভিসি ও আরসিসি ট্যাংকের রোটারি প্রেশার ওয়াশ ও শ্যাওলা পরিষ্কার।
              </p>
            </div>
          </a>

          <a
            href="/services/underground-water-tank-cleaning"
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              handleNavigate('/services/underground-water-tank-cleaning');
            }}
            className="p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0D9488]/50 text-left transition-all group flex items-start gap-4 cursor-pointer shadow-sm"
          >
            <ShieldCheck className="w-8 h-8 text-[#0D9488] shrink-0" />
            <div>
              <h3 className="font-bold text-[#123047] group-hover:text-[#0D9488] transition-colors text-base">
                Underground Water Tank Cleaning Service
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                মাটির নিচের আরসিসি রিজার্ভার ও রিজার্ভ ট্যাংকের ভারী কাদা ভ্যাকুয়াম ও স্লাজ উত্তোলন।
              </p>
            </div>
          </a>
        </div>
      </section>

      {/* Service Areas Hub Linking */}
      <section className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0D9488] uppercase tracking-wider">
          <MapPin className="w-4 h-4 text-[#0D9488]" />
          <span>সার্ভিস কভারেজ ও এলাকাভিত্তিক পাইপলাইন টিম</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#123047]">
          {lang === 'bn' ? 'ঢাকা ও সংলগ্ন এলাকায় পাইপলাইন ক্লিনিং কভারেজ' : 'Pipeline Cleaning Coverage Across Dhaka Locations'}
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] max-w-3xl leading-relaxed">
          {lang === 'bn'
            ? 'আমাদের মোবাইল ভ্যান ও হাইড্রো-পালস মেশিনারিজ সহ ঢাকা শহরের সকল প্রধান এলাকা ও সংলগ্ন জোনে দ্রুততম সময়ে পাইপলাইন ফ্লাশিং সার্ভিস প্রদান করা হয়:'
            : 'Non-invasive hydro-pulse pipeline descaling available across all prime Dhaka metropolitan areas:'}
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { name: 'উত্তরা (Uttara)', slug: 'uttara' },
            { name: 'গুলশান (Gulshan)', slug: 'gulshan' },
            { name: 'বনানী (Banani)', slug: 'banani' },
            { name: 'ধানমন্ডি (Dhanmondi)', slug: 'dhanmondi' },
            { name: 'মিরপুর (Mirpur)', slug: 'mirpur' },
            { name: 'বসুন্ধরা (Bashundhara)', slug: 'bashundhara' },
            { name: 'মোহাম্মদপুর (Mohammadpur)', slug: 'mohammadpur' },
            { name: 'বাড্ডা ও রামপুরা (Badda)', slug: 'badda' },
            { name: 'বারিধারা (Baridhara)', slug: 'baridhara' },
            { name: 'খিলক্ষেত (Khilkhet)', slug: 'khilkhet' },
            { name: 'রামপুরা (Rampura)', slug: 'rampura' },
            { name: 'গাজীপুর (Gazipur)', slug: 'gazipur' },
            { name: 'সাভার (Savar)', slug: 'savar' },
            { name: 'নারায়ণগঞ্জ (Narayanganj)', slug: 'narayanganj' },
            { name: 'ঢাকা মেট্রো (Dhaka All)', slug: 'dhaka' }
          ].map((area, idx) => (
            <a
              key={idx}
              href={`/service-areas/${area.slug}`}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                handleNavigate(`/service-areas/${area.slug}`);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#F5FAFC] hover:bg-[#E8F5F3] border border-[#E2E8F0] hover:border-[#0D9488]/40 text-xs font-semibold text-[#123047] hover:text-[#0D9488] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
              <span>{area.name}</span>
            </a>
          ))}
        </div>
      </section>

    </main>
  );
};

export default PipelineCleaningPage;
