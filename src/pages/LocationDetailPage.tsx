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

  return (
    <main className="min-h-screen bg-[#080A0D] text-white py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      <SeoHead
        title={location.title || `${location.areaName} Water Tank Cleaning Service | Sunviloz Clean Care`}
        description={location.metaDesc || location.metaDescription || location.intro}
        canonicalUrl={`https://sunvilozcleancare.com/service-areas/${location.slug}`}
      />

      <Breadcrumbs 
        items={[
          { label: lang === 'bn' ? 'সার্ভিস এরিয়া' : 'Service Areas', href: '/service-areas' },
          { label: lang === 'bn' ? location.areaNameBn : location.areaName, href: `/service-areas/${location.slug}` }
        ]} 
      />

      {/* 1. Location Hero Header */}
      <section className="bg-[#11151B] border border-[#303743] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
        {/* Soft decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#2585FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1 bg-[#2585FF]/15 text-[#2585FF] border border-[#2585FF]/30 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2585FF]" />
              <span>{location.zone || (lang === 'bn' ? `${location.areaNameBn} জোন` : `${location.areaName} Zone`)}</span>
            </span>
            <span className="px-3 py-1 bg-[#28C76F]/15 text-[#28C76F] border border-[#28C76F]/30 rounded-full text-xs font-mono font-bold">
              {lang === 'bn' ? 'দৈনিক টিম সক্রিয়' : 'Active Daily Dispatch'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {lang === 'bn' ? (location.titleBn || location.title) : location.title}
          </h1>

          <p className="text-sm sm:text-base text-[#B8C0CC] leading-relaxed max-w-3xl">
            {lang === 'bn' ? (location.introBn || location.descriptionBn || location.intro) : (location.intro || location.description)}
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => {
                trackEvent('area_quote_click', { area: location.areaName });
                onOpenQuoteModal();
              }}
              className="px-6 py-3.5 bg-[#2585FF] hover:bg-[#1a73e8] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#2585FF]/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
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
              className="px-5 py-3.5 bg-[#28C76F] hover:bg-[#22aa5e] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#28C76F]/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{lang === 'bn' ? 'WhatsApp-এ পরামর্শ' : 'WhatsApp Chat'}</span>
            </a>

            <a
              href={`tel:${business.phone}`}
              className="px-5 py-3.5 bg-[#171C24] hover:bg-[#202630] border border-[#303743] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#2585FF]" />
              <span>{business.displayPhone}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Water Condition & Sediment Profile for this Area */}
      {location.waterConditionNote && (
        <section className="bg-[#171C24] border border-[#303743] rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#2585FF]/10 text-[#2585FF] border border-[#2585FF]/30 flex items-center justify-center shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {lang === 'bn' ? `${location.areaNameBn} এলাকার পানির বৈশিষ্ট্য ও সাধারণ সমস্যা` : `Water Profile & Common Challenges in ${location.areaName}`}
              </h2>
              <p className="text-xs sm:text-sm text-[#B8C0CC] leading-relaxed">
                {lang === 'bn' ? (location.waterConditionNoteBn || location.waterConditionNote) : location.waterConditionNote}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 3. Coverage Details & Pricing Structure Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coverage Details */}
        {location.coverageDetails && location.coverageDetails.length > 0 && (
          <div className="bg-[#11151B] border border-[#303743] rounded-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2585FF]" />
              <h3 className="text-base sm:text-lg font-bold text-white">
                {lang === 'bn' ? `${location.areaNameBn}-এর আওতাভুক্ত এলাকা ও সেক্টর` : `Sub-areas & Sectors Covered`}
              </h3>
            </div>
            <ul className="space-y-2.5">
              {location.coverageDetails.map((cov, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#B8C0CC]">
                  <CheckCircle2 className="w-4 h-4 text-[#28C76F] shrink-0 mt-0.5" />
                  <span>{cov}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pricing Factors */}
        {location.pricingFactors && location.pricingFactors.length > 0 && (
          <div className="bg-[#11151B] border border-[#303743] rounded-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#28C76F]" />
              <h3 className="text-base sm:text-lg font-bold text-white">
                {lang === 'bn' ? 'সার্ভিস চার্জ ও প্রারম্ভিক দর' : 'Starting Rates & Pricing'}
              </h3>
            </div>
            <ul className="space-y-2.5">
              {location.pricingFactors.map((price, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#B8C0CC]">
                  <CheckCircle2 className="w-4 h-4 text-[#2585FF] shrink-0 mt-0.5" />
                  <span>{price}</span>
                </li>
              ))}
            </ul>
            <div className="p-3 bg-[#171C24] rounded-xl border border-[#303743] text-[11px] text-[#B8C0CC] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#2585FF] shrink-0" />
              <span>{lang === 'bn' ? 'চূড়ান্ত খরচ ট্যাংকের ধারণক্ষমতা ও কাজের পরিধির ওপর নির্ভর করে।' : 'Final quote confirmed according to tank capacity and physical access.'}</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. WhatsApp Photo Estimate CTA */}
      <SendTankPhotoCta source={`location_detail_${location.slug}`} />

      {/* 5. Location FAQs */}
      {location.faqs && location.faqs.length > 0 && (
        <section className="bg-[#11151B] border border-[#303743] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2585FF]">
              {lang === 'bn' ? 'সাধারণ প্রশ্ন ও উত্তর' : 'Frequently Asked Questions'}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {lang === 'bn' ? `${location.areaNameBn} এলাকার সেবা বিষয়ক প্রশ্নোত্তর` : `Questions About Service in ${location.areaName}`}
            </h3>
          </div>

          <div className="space-y-3">
            {location.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-xl border border-[#303743] bg-[#171C24] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white hover:text-[#2585FF] transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-[#B8C0CC] shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#2585FF]' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs sm:text-sm text-[#B8C0CC] leading-relaxed border-t border-[#303743]/50">
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {lang === 'bn' ? `${location.areaNameBn} এলাকায় তাৎক্ষণিক কোটেশন পান` : `Get an Instant Quote for ${location.areaName}`}
          </h2>
          <p className="text-xs sm:text-sm text-[#B8C0CC] mt-1">
            {lang === 'bn' ? 'কয়েকটি ক্লিকেই আনুমানিক মূল্য জানুন ও বুকিং অনুরোধ পাঠান' : 'Select your tank details for an instant estimate'}
          </p>
        </div>
        <SmartQuoteWizard />
      </section>
    </main>
  );
};
