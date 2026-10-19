import React from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { 
  ShieldCheck, 
  Users, 
  Droplets, 
  Wrench, 
  ArrowRight, 
  MessageCircle, 
  Phone,
  Calendar,
  CheckCircle2,
  Layers,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { trackWhatsAppClick, trackEvent } from '../utils/tracking';

interface AboutPageProps {
  onOpenQuoteModal: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenQuoteModal }) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();

  const rawNumber = (business.whatsappNumber || '8801609999612').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent('আসসালামু আলাইকুম। আমি সানভিলোজ ক্লিন কেয়ারের সেবা ও পরামর্শ সম্পর্কে জানতে চাই।')}`;

  return (
    <main className="min-h-screen bg-[#080A0D] text-white py-10 px-4 sm:px-6 max-w-7xl mx-auto space-y-16">
      <SeoHead
        title="About Us in Dhaka | Sunviloz Clean Care"
        description="Learn about Sunviloz Clean Care, established in 2020 in Dhaka. Specializing in professional water tank and pipeline cleaning with transparent quotations."
        canonicalUrl="https://sunvilozcleancare.com/about"
      />
      <Breadcrumbs items={[{ label: lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us', href: '/about' }]} />

      {/* Hero & Brand Story */}
      <section className="bg-[#11151B] border border-[#303743] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#2585FF] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#2585FF]" aria-hidden="true" />
            <span>OUR STORY · EST. 2020</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {lang === 'bn' ? 'পরিচ্ছন্নতার প্রতিশ্রুতি, আস্থার সঙ্গে' : 'Commitment to Cleanliness, Built on Trust'}
          </h1>

          <p className="text-base sm:text-lg text-[#B8C0CC] leading-relaxed">
            {lang === 'bn'
              ? '২০২০ সালে ঢাকায় Sunviloz Clean Care-এর যাত্রা শুরু হয় একটি বাস্তব সমস্যা থেকে—নির্ভরযোগ্য, স্বচ্ছ ও পেশাদার ক্লিনিং সেবা খুঁজে পাওয়া অনেকের জন্যই ছিল কঠিন।'
              : 'Sunviloz Clean Care began its journey in Dhaka in 2020 to solve a real problem: finding dependable, transparent, and professional cleaning services.'}
          </p>
        </div>
      </section>

      {/* The Problem We Saw & Our Approach */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* The Problem We Saw */}
        <section className="p-8 rounded-3xl bg-[#171C24] border border-[#303743] space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#202630] border border-[#303743] text-[#2585FF] flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {lang === 'bn' ? 'যে সমস্যা আমরা লক্ষ্য করেছি' : 'The Problem We Saw'}
          </h2>
          <p className="text-xs sm:text-sm text-[#B8C0CC] leading-relaxed">
            {lang === 'bn'
              ? 'কাজের মান নিয়ে অনিশ্চয়তা, অস্পষ্ট মূল্য নির্ধারণ, পরিচ্ছন্নতার উপকরণ সম্পর্কে প্রয়োজনীয় তথ্যের ঘাটতি এবং সেবার পর জবাবদিহিতার অভাব গ্রাহকদের ভোগান্তিতে ফেলত। প্রচলিত পদ্ধতিতে অনেক সময় অস্বাস্থ্যকর রাসায়নিক দিয়ে দ্রুত কাজ সারার চেষ্টা করা হতো।'
              : 'Uncertainty over quality, ambiguous pricing, lack of proper cleaning specifications, and poor post-service accountability often left property owners frustrated.'}
          </p>
        </section>

        {/* Our Approach */}
        <section className="p-8 rounded-3xl bg-[#171C24] border border-[#303743] space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#202630] border border-[#303743] text-[#28C76F] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {lang === 'bn' ? 'আমাদের কার্যপদ্ধতি' : 'Our Approach'}
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-[#B8C0CC]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#28C76F] shrink-0" />
              <span>{lang === 'bn' ? 'স্বচ্ছ যোগাযোগ ও পরামর্শ' : 'Clear communication & guidance'}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#28C76F] shrink-0" />
              <span>{lang === 'bn' ? 'যান্ত্রিক ও পদ্ধতিগত ৯-ধাপের ডিপ ক্লিন' : 'Systematic 9-step deep cleaning process'}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#28C76F] shrink-0" />
              <span>{lang === 'bn' ? 'পূর্বনির্ধারিত স্বচ্ছ কোটেশন' : 'Upfront transparent quotation'}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#28C76F] shrink-0" />
              <span>{lang === 'bn' ? 'গ্রাহককেন্দ্রিক দায়িত্বশীল সেবা' : 'Customer-focused accountability'}</span>
            </li>
          </ul>
        </section>
      </div>

      {/* What We Focus On */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {lang === 'bn' ? 'আমরা যে বিষয়ে বিশেষজ্ঞ' : 'What We Focus On'}
          </h2>
          <p className="text-xs sm:text-sm text-[#B8C0CC] mt-2">
            {lang === 'bn' ? 'আমাদের মূল ফোকাস হলো পানির ট্যাংক এবং অভ্যন্তরীণ পাইপলাইন পরিচ্ছন্নতা' : 'Primary specialization in water storage hygiene and pipeline flushing'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#11151B] border border-[#303743] space-y-3">
            <div className="flex items-center gap-3">
              <Droplets className="w-6 h-6 text-[#2585FF]" />
              <h3 className="text-lg font-bold text-white">
                {lang === 'bn' ? 'পানির ট্যাংক পরিষ্কার' : 'Water Tank Cleaning'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#B8C0CC] leading-relaxed">
              {lang === 'bn'
                ? 'ছাদের ওভারহেড (পিভিসি/আরসিসি) এবং মাটির নিচের রিজার্ভার থেকে কাদা ও শ্যাওলা যান্ত্রিক রোটারি জেটে অপসারণ।'
                : 'Overhead rooftop tanks (PVC & RCC) and underground reserve tanks cleaned with high-pressure rotary jets.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#11151B] border border-[#303743] space-y-3">
            <div className="flex items-center gap-3">
              <Wrench className="w-6 h-6 text-[#28C76F]" />
              <h3 className="text-lg font-bold text-white">
                {lang === 'bn' ? 'পানির পাইপলাইন ফ্লাশিং' : 'Water Pipeline Cleaning'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#B8C0CC] leading-relaxed">
              {lang === 'bn'
                ? 'দেয়াল বা টাইলস না ভেঙে হাইড্রো-পালস প্রযুক্তিতে ভেতরের জমে থাকা আয়রন ও মরিচা দূরীকরণ।'
                : 'Hydro-pulse air-water pressurized flushing to clear iron scale and restore plumbing flow.'}
            </p>
          </div>
        </div>
      </section>

      {/* Real Timeline */}
      <section className="bg-[#11151B] border border-[#303743] rounded-3xl p-8 max-w-2xl mx-auto space-y-6">
        <h2 className="text-xl font-bold text-white text-center">
          {lang === 'bn' ? 'আমাদের যাত্রা' : 'Company Journey'}
        </h2>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#202630] border border-[#303743] text-[#2585FF] flex items-center justify-center shrink-0 font-bold font-mono">
            2020
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              {lang === 'bn' ? 'সানভিলোজ ক্লিন কেয়ারের সূচনা' : 'Sunviloz Clean Care Established'}
            </h3>
            <p className="text-xs sm:text-sm text-[#B8C0CC] leading-relaxed">
              {lang === 'bn'
                ? 'ঢাকায় পেশাদার ও আধুনিক ওয়াটার ট্যাংক ক্লিনিং সল্যুশন নিয়ে আমাদের যাত্রা শুরু হয়।'
                : 'Started service operations in Dhaka focusing on mechanized water storage cleaning.'}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-[#171C24] via-[#1b222c] to-[#171C24] border border-[#2585FF]/40 text-center space-y-4 shadow-xl">
        <h2 className="text-2xl font-bold text-white">
          {lang === 'bn' ? 'আপনার ভবনের পরিচ্ছন্নতা নিয়ে কথা বলতে চান?' : 'Need Professional Cleaning for Your Building?'}
        </h2>
        <p className="text-xs sm:text-sm text-[#B8C0CC] max-w-xl mx-auto">
          {lang === 'bn'
            ? 'আমাদের টিম নির্ধারিত শিডিউলে আপনার এলাকায় সেবা প্রদানে প্রস্তুত।'
            : 'Get in touch for transparent quotations and flexible scheduling across Dhaka.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenQuoteModal}
            className="px-6 py-3 bg-[#2585FF] hover:bg-[#1a73e8] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg inline-flex items-center gap-2 cursor-pointer"
          >
            <span>{lang === 'bn' ? 'কোটেশন রিকোয়েস্ট করুন' : 'Request a Quote'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick({ source: 'about_page' })}
            className="px-6 py-3 bg-[#28C76F]/15 hover:bg-[#28C76F]/25 text-[#28C76F] border border-[#28C76F]/40 font-bold text-xs sm:text-sm rounded-xl inline-flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-[#28C76F]" />
            <span>WhatsApp: 01609999612</span>
          </a>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
