import React from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SmartQuoteWizard } from '../components/SmartQuoteWizard';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { ShieldCheck, Phone, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import { trackWhatsAppClick } from '../utils/tracking';

interface GetQuotePageProps {
  onNavigate?: (path: string) => void;
}

export const GetQuotePage: React.FC<GetQuotePageProps> = ({ onNavigate }) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();

  const rawWhatsapp = (business.whatsappNumber || '8801609999612').replace(/[^0-9]/g, '');

  return (
    <main className="min-h-screen bg-transparent text-white py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-10">
      <SeoHead
        title={lang === 'bn' ? 'ফ্রি কোটেশন ও প্রাইসিং | সানভিলোজ ক্লিন কেয়ার' : 'Get a Free Quote | Sunviloz Clean Care Dhaka'}
        description="Calculate estimated water tank cleaning and pipeline descaling costs in Dhaka. Simple 4-step quotation form with instant WhatsApp booking."
        canonicalUrl="https://sunvilozcleancare.com/get-quote"
      />

      <Breadcrumbs
        items={[
          { label: lang === 'bn' ? 'ফ্রি কোটেশন' : 'Get Quote', href: '/get-quote' }
        ]}
      />

      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 inline-flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'bn' ? 'স্বচ্ছ ও নির্ভরযোগ্য সার্ভিস কোটেশন' : 'Transparent & Honest Quotations'}</span>
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          {lang === 'bn' 
            ? 'সহজ ৪ ধাপে পানির ট্যাংকের সঠিক কোটেশন নিন' 
            : 'Get an Accurate Water Tank Cleaning Quote in 4 Steps'}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-[#B8C0CC] leading-relaxed max-w-2xl mx-auto">
          {lang === 'bn'
            ? 'আপনার ট্যাংকের ধরন, ধারণক্ষমতা ও এলাকা নির্বাচন করে কয়েক সেকেন্ডের মধ্যে প্রফেশনাল কোটেশন রিকোয়েস্ট পাঠান।'
            : 'Select your tank type, capacity, and Dhaka locality to receive an upfront estimate with zero hidden costs.'}
        </p>

        {/* Quick Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-2 text-xs text-[#B8C0CC]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#28C76F]" />
            <span>{lang === 'bn' ? 'কোনো হিডেন চার্জ নেই' : 'No hidden fees'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#28C76F]" />
            <span>{lang === 'bn' ? 'ফুড-গ্রেড জীবাণুমুক্তকরণ' : 'Food-grade safe sanitization'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#28C76F]" />
            <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপে দ্রুত উত্তর' : 'Fast WhatsApp confirmation'}</span>
          </span>
        </div>
      </div>

      {/* Main Quote Wizard Form Container */}
      <div className="max-w-3xl mx-auto">
        <SmartQuoteWizard sourceContext="Get Quote Page" />
      </div>

      {/* Alternative Contact Assistance Card */}
      <div className="max-w-3xl mx-auto bg-[#11151B] border border-[#303743] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-white">
            {lang === 'bn' ? 'ফর্ম পূরণ করতে সময় নেই?' : 'Need an Immediate Estimate?'}
          </h3>
          <p className="text-xs sm:text-sm text-[#B8C0CC]">
            {lang === 'bn' 
              ? 'সরাসরি আমাদের হোয়াটসঅ্যাপে ট্যাংকের ছবি পাঠান বা ফোন করুন।' 
              : 'Send a photo of your tank on WhatsApp or call our hotline for quick pricing.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <a
            href={`tel:${business.phone}`}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#171C24] hover:bg-[#202630] text-white border border-[#303743] font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
          >
            <Phone className="w-4 h-4 text-[#2585FF]" />
            <span>{business.displayPhone}</span>
          </a>

          <a
            href={`https://wa.me/${rawWhatsapp}?text=${encodeURIComponent('আসসালামু আলাইকুম। আমি ওয়াটার ট্যাংক পরিষ্কার সার্ভিসের জন্য কোটেশন জানতে চাই।')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick({ source: 'get_quote_page_bottom' })}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#28C76F] hover:bg-[#22aa5e] text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-[#28C76F]/20"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </main>
  );
};

export default GetQuotePage;
