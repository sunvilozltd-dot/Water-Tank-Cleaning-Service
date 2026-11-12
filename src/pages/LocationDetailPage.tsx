import React, { useState } from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SmartQuoteWizard } from '../components/SmartQuoteWizard';
import { SendTankPhotoCta } from '../components/SendTankPhotoCta';
import { LOCATIONS_DATA, findLocationBySlug } from '../data/locationsData';
import { useLanguage } from '../context/LanguageContext';
import { 
  MapPin, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  MessageCircle, 
  Droplets, 
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { trackEvent, trackWhatsAppClick } from '../utils/tracking';

interface LocationDetailPageProps {
  slug: string;
  onOpenQuoteModal: () => void;
  onNavigate?: (path: string) => void;
}

export const LocationDetailPage: React.FC<LocationDetailPageProps> = ({ 
  slug, 
  onOpenQuoteModal,
  onNavigate 
}) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const location = findLocationBySlug(slug);

  const rawWhatsapp = (business.whatsappNumber || '8801609999612').replace(/[^0-9]/g, '');
  const areaInquiryMsg = `আসসালামু আলাইকুম। আমি ${location.areaNameBn} (${location.areaName}) এলাকায় ওয়াটার ট্যাংক পরিষ্কার সার্ভিসের জন্য কোটেশন জানতে চাই।`;
  const whatsappUrl = `https://wa.me/${rawWhatsapp}?text=${encodeURIComponent(areaInquiryMsg)}`;

  const breadcrumbsList = [
    { name: lang === 'bn' ? 'হোম' : 'Home', path: '/' },
    { name: lang === 'bn' ? 'সার্ভিস এরিয়া' : 'Service Areas', path: '/service-areas' },
    { name: lang === 'bn' ? location.areaNameBn : location.areaName, path: `/service-areas/${location.slug}` }
  ];

  const structuredFaqs = location.faqs ? location.faqs.map(f => ({
    question: f.question,
    answer: f.answer
  })) : undefined;

  return (
    <main className="min-h-screen bg-transparent text-[#172B3A] py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      <SeoHead
        title={location.title || `${location.areaName} Water Tank Cleaning Service | SUNVILOZ CLEAN CARE`}
        description={location.metaDesc || location.metaDescription || location.intro}
        canonicalUrl={`https://sunvilozcleancare.com/service-areas/${location.slug}`}
        serviceSchema={{
          name: `Water Tank Cleaning Service in ${location.areaName}`,
          serviceType: 'Water Tank Cleaner & Cleaning Service',
          description: location.intro || `Professional rooftop overhead and underground water tank cleaner and cleaning service in ${location.areaName}, Dhaka.`
        }}
        breadcrumbs={breadcrumbsList}
        faqSchema={structuredFaqs}
      />

      <Breadcrumbs 
        items={[
          { label: lang === 'bn' ? 'সার্ভিস এরিয়া' : 'Service Areas', href: '/service-areas' },
          { label: lang === 'bn' ? location.areaNameBn : location.areaName, href: `/service-areas/${location.slug}` }
        ]} 
      />

      {/* 1. Location Hero Header */}
      <section className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1 bg-[#E8F5F3] text-[#0D9488] border border-[#0D9488]/30 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>{location.zone || (lang === 'bn' ? `${location.areaNameBn} জোন` : `${location.areaName} Zone`)}</span>
            </span>
            <span className="px-3 py-1 bg-emerald-50 text-[#16A34A] border border-emerald-200 rounded-full text-xs font-mono font-bold">
              {lang === 'bn' ? 'দৈনিক টিম সক্রিয়' : 'Active Daily Dispatch'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#123047] tracking-tight leading-tight">
            {lang === 'bn' ? (location.titleBn || location.title) : location.title}
          </h1>

          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-3xl">
            {lang === 'bn' ? (location.introBn || location.descriptionBn || location.intro) : (location.intro || location.description)}
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => {
                trackEvent('area_quote_click', { area: location.areaName });
                onOpenQuoteModal();
              }}
              className="px-6 py-3.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#0D9488]/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <span>{lang === 'bn' ? `${location.areaNameBn}-এর জন্য কোটেশন নিন` : `Quote for ${location.areaName}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackEvent('whatsapp_click', { source: `location_${location.slug}` });
                trackWhatsAppClick({ source: `location_${location.slug}` });
              }}
              className="px-5 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#25D366]/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{lang === 'bn' ? 'WhatsApp-এ পরামর্শ' : 'WhatsApp Chat'}</span>
            </a>

            <a
              href={`tel:${business.phone}`}
              className="px-5 py-3.5 bg-[#123047] hover:bg-[#1b4363] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Phone className="w-4 h-4 text-[#38BDF8]" />
              <span>{business.displayPhone}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Water Condition & Sediment Profile for this Area */}
      {location.waterConditionNote && (
        <section className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5F3] text-[#0D9488] border border-[#0D9488]/30 flex items-center justify-center shrink-0">
              <Droplets className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-bold text-[#123047]">
                {lang === 'bn' ? `${location.areaNameBn} এলাকার পানির বৈশিষ্ট্য ও সাধারণ সমস্যা` : `Water Profile & Common Challenges in ${location.areaName}`}
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                {lang === 'bn' ? (location.waterConditionNoteBn || location.waterConditionNote) : location.waterConditionNote}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 3. Core Specialized Services in this Locality */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488] bg-[#E8F5F3] px-3.5 py-1 rounded-full border border-[#0D9488]/30">
            {lang === 'bn' ? `${location.areaNameBn}-এ আমাদের বিশেষায়িত সেবা` : `Services Available in ${location.areaName}`}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123047] tracking-tight">
            {lang === 'bn' ? 'ওভারহেড, আন্ডারগ্রাউন্ড ও পাইপলাইন পরিচ্ছন্নতা' : 'Overhead, Reserve & Pipeline Cleaning'}
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            {lang === 'bn'
              ? 'বাসা, অ্যাপার্টমেন্ট ভবন ও বাণিজ্যিক প্রাঙ্গণে আধুনিক যন্ত্রপাতির সমন্বয়ে নিরাপদ সার্ভিস।'
              : 'Mechanized, non-acid cleaning for residential apartments and commercial properties.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Overhead Tank */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5F3] text-[#0D9488] flex items-center justify-center font-bold">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#123047]">
                {lang === 'bn' ? 'ছাদের ওভারহেড ট্যাংক ক্লিনিং' : 'Overhead Water Tank Cleaning'}
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {lang === 'bn'
                  ? 'তীব্র রোদে ছাদের পিভিসি বা আরসিসি ট্যাংকে দ্রুত শ্যাওলা ও বায়োফিল্ম জন্ম নেয়। আমরা ১৫০ বার রোটারি ওয়াটার জেটে ট্যাংকের দেয়াল মসৃণ রেখে সম্পূর্ণ শ্যাওলা ও তলদেশের পলি পরিষ্কার করি।'
                  : 'Rooftop tanks suffer from heat-induced algae bloom and municipal silt. High-pressure rotary jet washing eliminates algae and biofilms without scratching interior tank walls.'}
              </p>
            </div>
            <ul className="text-xs text-[#64748B] space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span>{lang === 'bn' ? 'ফুড-গ্রেড নন-টক্সিক জীবাণুনাশক' : 'Food-grade safe disinfection'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span>{lang === 'bn' ? 'ক্ষতিকর এসিডমুক্ত পদ্ধতি' : 'Zero harsh acids or pungent fumes'}</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Underground Reserve */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5F3] text-[#0D9488] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#123047]">
                {lang === 'bn' ? 'আন্ডারগ্রাউন্ড রিজার্ভার ডিপ ক্লিন' : 'Underground Reserve Deep Clean'}
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {lang === 'bn'
                  ? 'ওয়াসার লাইন ও গভীর নলকূপের ভারী কাদা, বালু ও আয়রন মাটির নিচের ট্যাংকের নিচে জমা হয়। আমাদের শক্তিশালী সাবমারসিবল স্লাজ পাম্পের সাহায্যে তলদেশের থিক কাদা সম্পূর্ণ টেনে বের করা হয়।'
                  : 'Deep underground concrete reservoirs collect dense municipal mud and borehole silt. High-capacity submersible slurry pumps safely evacuate thick sediment layers.'}
              </p>
            </div>
            <ul className="text-xs text-[#64748B] space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span>{lang === 'bn' ? 'ওয়াটারপ্রুফিং অক্ষত রাখা হয়' : 'Protects waterproofing membrane'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span>{lang === 'bn' ? 'অক্সিজেন ও সেফটি প্রোটোকল মেনে কাজ' : 'Strict confined-space safety'}</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Pipeline Cleaning */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5F3] text-[#0D9488] flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#123047]">
                {lang === 'bn' ? 'পানির পাইপলাইন ফ্লাশিং' : 'Water Pipeline Descaling'}
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {lang === 'bn'
                  ? 'ট্যাংক পরিষ্কার হলেও যদি পাইপে মরিচা বা আয়রন জমে থাকে, তবে কল দিয়ে লালচে পানি বের হয়। হাইড্রো-পালস প্রযুক্তিতে দেয়াল বা টাইলস না ভেঙে পাইপের অভ্যন্তরীণ জট পরিষ্কার করা হয়।'
                  : 'Eliminates tap discoloration, iron scale, and pipe odors using non-invasive hydro-pulse pressurized flushing without cracking tiles or breaking walls.'}
              </p>
            </div>
            <ul className="text-xs text-[#64748B] space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span>{lang === 'bn' ? 'স্বাভাবিক পানির প্রেসার পুনরুদ্ধার' : 'Restores shower & tap flow'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span>{lang === 'bn' ? 'দেয়াল ভাঙার কোনো প্রয়োজন নেই' : 'Non-destructive technology'}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Practical Considerations & Local Guidance */}
      <section className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-[#0D9488]" />
          <h2 className="text-lg sm:text-xl font-bold text-[#123047]">
            {lang === 'bn' ? `${location.areaNameBn} এলাকার জন্য গুরুত্বপূর্ণ ব্যবহারিক পরামর্শ` : `Practical Maintenance Guidelines for ${location.areaName}`}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs text-[#64748B]">
          <div className="p-4 rounded-2xl bg-[#F5FAFC] border border-[#E2E8F0] space-y-1.5">
            <strong className="block font-bold text-[#123047]">১. কত দিন পর পর পরিষ্কার করবেন?</strong>
            <span>ঢাকা শহরের পানি সরবরাহ এবং তলানি জমার কারণে প্রতি ৪ থেকে ৬ মাস পর পর ছাদ ও রিজার্ভার ডিপ ক্লিন করা স্বাস্থ্যসম্মত।</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#F5FAFC] border border-[#E2E8F0] space-y-1.5">
            <strong className="block font-bold text-[#123047]">২. পানি সংরক্ষণে সাশ্রয়ী কৌশল</strong>
            <span>আমাদের টিম পৌঁছানোর আগের দিন স্বাভাবিক ব্যবহারে পানির স্তর কিছুটা কমিয়ে রাখলে পানির অপচয় সর্বনিম্ন থাকে।</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#F5FAFC] border border-[#E2E8F0] space-y-1.5">
            <strong className="block font-bold text-[#123047]">৩. কাজ শেষের সাথে সাথেই ব্যবহার</strong>
            <span>আমরা কোনো তীব্র এসিড ব্যবহার করি না। খাদ্য-মানসম্পন্ন জীবাণুনাশক ব্যবহারের পর ফ্রেশ ওয়াশ করা হয়, ফলে সরাসরি ব্যবহার নিরাপদ।</span>
          </div>
        </div>
      </section>

      {/* 5. Systematic 6-Step Mechanized Workflow */}
      <section className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
            {lang === 'bn' ? 'বিজ্ঞানসম্মত কার্যপদ্ধতি' : 'Standardized Workflow'}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#123047]">
            {lang === 'bn' ? 'আমাদের সুশৃঙ্খল ৬-ধাপের মেকানাইজড ক্লিনিং' : 'Our 6-Step Hygienic Cleaning Process'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {[
            { step: '০১', titleBn: 'পানি নিষ্কাশন ও ডেস্লাজিং', descBn: 'ট্যাংক খালি করে তলদেশের নোংরা পানি ড্রেন আউট করা হয়।' },
            { step: '০২', titleBn: 'ভারী কাদা ও স্লাজ উত্তোলন', descBn: 'সাবমারসিবল স্লাজ পাম্প দিয়ে গভীর কাদার স্তর ভ্যাকুয়াম করা হয়।' },
            { step: '০৩', titleBn: '১৫০ বার হাই-প্রেসার জেট ওয়াশ', descBn: 'ট্যাংকের দেয়াল ও কোণা থেকে শ্যাওলা নিখুঁতভাবে পরিষ্কার করা হয়।' },
            { step: '০৪', titleBn: 'ফুড-গ্রেড স্যানিটাইজার স্প্রে', descBn: 'খাদ্য-মানসম্পন্ন জীবাণুনাশক দিয়ে ব্যাকটেরিয়া ও ছত্রাক ধ্বংস করা হয়।' },
            { step: '০৫', titleBn: 'বিশুদ্ধ পানি দিয়ে ফ্রেশ ফ্লাশিং', descBn: 'কোনো অবশিষ্টাংশ না রেখে পরিষ্কার পানিতে সম্পূর্ণ ট্যাংক ধোয়া হয়।' },
            { step: '০৬', titleBn: 'চূড়ান্ত পরিদর্শন ও হ্যান্ডওভার', descBn: 'ভবন কর্তৃপক্ষকে কাজ দেখিয়ে সন্তোষজনকভাবে সম্পন্ন করা হয়।' }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
              <span className="text-xs font-mono font-bold text-[#0D9488] bg-white px-2 py-0.5 rounded border border-[#0D9488]/20">
                ধাপ {item.step}
              </span>
              <h4 className="text-sm font-bold text-[#123047]">{item.titleBn}</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">{item.descBn}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Coverage Details & Pricing Structure Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coverage Details */}
        {location.coverageDetails && location.coverageDetails.length > 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0D9488]" />
              <h3 className="text-base sm:text-lg font-bold text-[#123047]">
                {lang === 'bn' ? `${location.areaNameBn}-এর আওতাভুক্ত এলাকা ও সেক্টর` : `Sub-areas & Sectors Covered`}
              </h3>
            </div>
            <ul className="space-y-2.5">
              {location.coverageDetails.map((cov, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#64748B]">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>{cov}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pricing Factors */}
        {location.pricingFactors && location.pricingFactors.length > 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <h3 className="text-base sm:text-lg font-bold text-[#123047]">
                {lang === 'bn' ? 'সার্ভিস চার্জ ও প্রারম্ভিক দর' : 'Starting Rates & Pricing'}
              </h3>
            </div>
            <ul className="space-y-2.5">
              {location.pricingFactors.map((price, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#64748B]">
                  <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
                  <span>{price}</span>
                </li>
              ))}
            </ul>
            <div className="p-3 bg-[#F5FAFC] rounded-xl border border-[#E2E8F0] text-[11px] text-[#64748B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#0D9488] shrink-0" />
              <span>{lang === 'bn' ? 'চূড়ান্ত খরচ ট্যাংকের ধারণক্ষমতা ও কাজের পরিধির ওপর নির্ভর করে।' : 'Final quote confirmed according to tank capacity and physical access.'}</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. WhatsApp Photo Estimate CTA */}
      <SendTankPhotoCta source={`location_detail_${location.slug}`} />

      {/* 5. Location FAQs */}
      {location.faqs && location.faqs.length > 0 && (
        <section className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
              {lang === 'bn' ? 'সাধারণ প্রশ্ন ও উত্তর' : 'Frequently Asked Questions'}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#123047]">
              {lang === 'bn' ? `${location.areaNameBn} এলাকার সেবা বিষয়ক প্রশ্নোত্তর` : `Questions About Service in ${location.areaName}`}
            </h3>
          </div>

          <div className="space-y-3">
            {location.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#123047] hover:text-[#0D9488] transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#0D9488]' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs sm:text-sm text-[#64748B] leading-relaxed border-t border-[#E2E8F0]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Smart Quote Wizard */}
      <section id="quote" className="pt-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123047] tracking-tight">
            {lang === 'bn' ? `${location.areaNameBn} এলাকায় তাৎক্ষণিক কোটেশন পান` : `Get an Instant Quote for ${location.areaName}`}
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            {lang === 'bn' ? 'কয়েকটি ক্লিকেই আনুমানিক মূল্য জানুন ও বুকিং অনুরোধ পাঠান' : 'Select your tank details for an instant estimate'}
          </p>
        </div>
        <SmartQuoteWizard />
      </section>
    </main>
  );
};

export default LocationDetailPage;
