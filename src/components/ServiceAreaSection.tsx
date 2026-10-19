import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  CheckCircle2, 
  Phone, 
  ArrowRight, 
  PhoneCall,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { LOCATIONS_DATA } from '../data/locationsData';
import { trackEvent, trackWhatsAppClick } from '../utils/tracking';

interface ServiceAreaSectionProps {
  onAreaSelected?: (areaName: string) => void;
  onNavigate?: (path: string) => void;
}

export const ServiceAreaSection: React.FC<ServiceAreaSectionProps> = ({ 
  onAreaSelected = () => {},
  onNavigate 
}) => {
  const { lang, t } = useLanguage();
  const { areas, business } = useSiteConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [checkResult, setCheckResult] = useState<{
    found: boolean;
    name?: string;
    message?: string;
    slug?: string;
  } | null>(null);

  const DHAKA_ZONES = [
    {
      name: 'North Dhaka Hub',
      nameBn: 'উত্তর ঢাকা জোন',
      places: 'উত্তরা, বসুন্ধরা আ/এ, নিকুঞ্জ, খিলক্ষেত, কুড়িল',
      featuredSlug: 'bashundhara'
    },
    {
      name: 'Diplomatic & Commercial',
      nameBn: 'ডিপ্লোম্যাটিক ও বাণিজ্যিক জোন',
      places: 'গুলশান ১ ও ২, বনানী, বারিধারা, বারিধারা ডিওএইচএস, নিকেতন',
      featuredSlug: 'gulshan'
    },
    {
      name: 'Central Dhaka Hub',
      nameBn: 'সেন্ট্রাল ঢাকা জোন',
      places: 'ধানমন্ডি, মোহাম্মদপুর, লালমাটিয়া, তেজগাঁও, মহাখালী',
      featuredSlug: 'dhanmondi'
    },
    {
      name: 'Old & South Dhaka',
      nameBn: 'পূর্ব ও দক্ষিণ ঢাকা জোন',
      places: 'বাড্ডা, রামপুরা, বনশ্রী, খিলগাঁও, মালিবাগ, শান্তিনগর, পুরান ঢাকা',
      featuredSlug: 'dhaka'
    }
  ];

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

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const term = searchTerm.trim().toLowerCase();
    const match = areas.find(a => 
      a.name.toLowerCase().includes(term) ||
      a.nameBn.toLowerCase().includes(term)
    );

    const locationMatch = LOCATIONS_DATA.find(l => 
      l.areaName.toLowerCase().includes(term) ||
      l.areaNameBn.toLowerCase().includes(term) ||
      l.slug.includes(term)
    );

    if (match || locationMatch) {
      const matchedName = match ? (lang === 'bn' ? match.nameBn : match.name) : (lang === 'bn' ? locationMatch!.areaNameBn : locationMatch!.areaName);
      setCheckResult({
        found: true,
        name: matchedName,
        slug: locationMatch?.slug,
        message: lang === 'bn' 
          ? `হ্যাঁ! ${matchedName} এলাকায় আমাদের সার্ভিস সক্রিয় রয়েছে। আমাদের টেকনিক্যাল টিম নিয়মিত এই জোনে সেবা প্রদান করছে।`
          : `Yes! Sunviloz Clean Care actively services ${matchedName}. Our mobile team provides prompt service in this zone.`
      });
    } else {
      setCheckResult({
        found: true,
        name: searchTerm,
        message: lang === 'bn' 
          ? `হ্যাঁ! ${searchTerm} এবং এর সংলগ্ন ঢাকা শহরের যেকোনো এলাকায় আমরা পানি ট্যাংক ক্লিনিং সার্ভিস প্রদান করি।`
          : `Yes! We provide water tank cleaning service in ${searchTerm} and all adjoining areas across Dhaka.`
      });
    }
  };

  const rawWhatsapp = (business.whatsappNumber || '8801609999612').replace(/[^0-9]/g, '');

  return (
    <section className="py-16 sm:py-24 bg-[#080A0D] border-b border-[#303743]" id="service-areas" aria-labelledby="areas-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2585FF]">
            {lang === 'bn' ? 'কভারেজ এলাকা ও জোন' : 'Service Areas & Coverage'}
          </span>
          <h2 id="areas-heading" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-1.5">
            {lang === 'bn' 
              ? 'ঢাকা শহরের সকল এলাকায় আমাদের সার্ভিস কভারেজ' 
              : 'Water Tank Cleaning Services Across Dhaka City'}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#2585FF] to-transparent mx-auto my-3.5 rounded-full" />
          <p className="text-sm sm:text-base text-[#B8C0CC] leading-relaxed max-w-3xl mx-auto">
            {lang === 'bn'
              ? 'ঢাকা, গাজীপুর, সাভার, নারায়ণগঞ্জসহ ঢাকার পার্শ্ববর্তী বিভিন্ন এলাকায় আপনার বাসা, ভবন ও প্রতিষ্ঠানের জন্য পেশাদার পানির ট্যাংক ও পাইপলাইন ক্লিনিং সার্ভিস নিয়ে আমরা আছি আপনার পাশে।'
              : 'Providing professional water tank and pipeline cleaning services for your home, building, and commercial establishments across Dhaka, Gazipur, Savar, Narayanganj, and adjoining areas.'}
          </p>
        </div>

        {/* 1. Dhaka Primary Zones Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {DHAKA_ZONES.map((zone) => (
            <div
              key={zone.name}
              className="bg-[#11151B] rounded-2xl p-5 border border-[#303743] hover:border-[#2585FF]/50 hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#171C24] border border-[#303743] text-[#2585FF] flex items-center justify-center font-bold" aria-hidden="true">
                    <MapPin className="w-5 h-5 text-[#2585FF]" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#2585FF] transition-colors">
                  {lang === 'bn' ? zone.nameBn : zone.name}
                </h3>
                <p className="text-xs text-[#B8C0CC] mt-2 line-clamp-2 leading-relaxed">
                  {zone.places}
                </p>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => onAreaSelected(zone.nameBn)}
                  className="w-full min-h-[40px] py-2 px-3 rounded-xl bg-[#171C24] hover:bg-[#2585FF] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#303743] hover:border-[#2585FF]"
                >
                  <span>{lang === 'bn' ? 'এই জোনে বুক করুন' : 'Book in this Zone'}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>

                {zone.featuredSlug && (
                  <button
                    type="button"
                    onClick={() => handleNavigate(`/service-areas/${zone.featuredSlug}`)}
                    className="w-full text-center text-[11px] text-[#2585FF] hover:underline flex items-center justify-center gap-1 py-1"
                  >
                    <span>{lang === 'bn' ? 'এরিয়া বিস্তারিত দেখুন' : 'View Area Details'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 2. Interactive Area Availability Checker Tool */}
        <div className="max-w-2xl mx-auto bg-[#11151B] rounded-3xl p-6 sm:p-8 border border-[#303743] shadow-2xl">
          <h3 className="text-base sm:text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#2585FF]" aria-hidden="true" />
            <span>{t('area.checkTitle')}</span>
          </h3>
          <p className="text-xs text-[#B8C0CC] mb-4">
            {lang === 'bn' 
              ? 'আপনার এলাকার নাম লিখুন এবং তাত্ক্ষণিকভাবে সার্ভিসের প্রাপ্যতা যাচাই করুন' 
              : 'Enter your neighborhood or thana in Dhaka to verify instant availability'}
          </p>

          <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-[#B8C0CC] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: গুলশান, মিরপুর, উত্তরা, ধানমন্ডি...' : 'e.g. Gulshan, Mirpur, Uttara, Dhanmondi...'}
                className="w-full pl-10 pr-3.5 py-3 text-sm rounded-xl bg-[#171C24] border border-[#303743] text-white placeholder-[#B8C0CC]/50 focus:outline-none focus:border-[#2585FF] focus:ring-1 focus:ring-[#2585FF]"
                aria-label="Area search input"
              />
            </div>
            <button
              type="submit"
              className="min-h-[44px] py-3 px-6 rounded-xl bg-[#2585FF] hover:bg-[#1a73e8] text-white font-bold text-xs sm:text-sm shadow-md transition-all whitespace-nowrap cursor-pointer active:scale-95"
            >
              {t('area.checkBtn')}
            </button>
          </form>

          {/* Interactive Result Card */}
          {checkResult && (
            <div className="mt-4 p-4 rounded-2xl border text-xs sm:text-sm bg-[#171C24] border-[#28C76F]/40 text-white transition-all animate-fadeIn" role="status" aria-live="polite">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#28C76F] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <div className="font-bold text-[#28C76F] mb-1">
                    {lang === 'bn' ? `✓ ${checkResult.name}-এ সার্ভিস সক্রিয় আছে!` : `✓ Service Active in ${checkResult.name}!`}
                  </div>
                  <p className="text-xs leading-relaxed text-[#B8C0CC]">
                    {checkResult.message}
                  </p>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onAreaSelected(checkResult.name!)}
                      className="min-h-[36px] py-1.5 px-3.5 rounded-lg bg-[#2585FF] hover:bg-[#1a73e8] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{lang === 'bn' ? 'এই এলাকার জন্য কোটেশন নিন' : 'Request Quote for this Area'}</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>

                    {checkResult.slug && (
                      <button
                        type="button"
                        onClick={() => handleNavigate(`/service-areas/${checkResult.slug}`)}
                        className="min-h-[36px] py-1.5 px-3.5 rounded-lg bg-[#11151B] border border-[#303743] hover:border-[#2585FF] text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <span>{lang === 'bn' ? 'এরিয়া পেজ দেখুন' : 'View Dedicated Page'}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#2585FF]" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Dhaka Key Dedicated Area Hubs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#B8C0CC]">
              {lang === 'bn' ? 'প্রধান কভারেজ এলাকা সমুহ:' : 'Key Active Dhaka Coverage Locations:'}
            </h3>
            <span className="text-xs text-[#2585FF] font-mono font-bold">
              {LOCATIONS_DATA.length} Prime Dedicated Hubs
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {LOCATIONS_DATA.map((loc) => (
              <button
                key={loc.slug}
                type="button"
                onClick={() => handleNavigate(`/service-areas/${loc.slug}`)}
                className="group inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-xl bg-[#11151B] hover:bg-[#171C24] border border-[#303743] hover:border-[#2585FF] text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#28C76F] group-hover:scale-125 transition-transform" aria-hidden="true" />
                <span>{lang === 'bn' ? loc.areaNameBn : loc.areaName}</span>
                <ArrowRight className="w-3 h-3 text-[#B8C0CC] group-hover:text-[#2585FF] group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* 4. Quick Hotline & Emergency Booking Card */}
        <div className="bg-gradient-to-r from-[#11151B] via-[#171C24] to-[#11151B] border border-[#303743] rounded-3xl p-6 sm:p-8 text-white shadow-2xl max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs uppercase font-extrabold text-[#2585FF] tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-[#28C76F] animate-pulse" aria-hidden="true" />
              <span>{lang === 'bn' ? 'সরাসরি হেল্পলাইন' : 'Emergency Hotline & Dispatch'}</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white font-mono">
              {business.displayPhone}
            </h3>
            <p className="text-xs text-[#B8C0CC] max-w-md">
              {lang === 'bn' 
                ? 'সরাসরি ফোনে কথা বলে দ্রুত কোটেশন ও শিডিউল নিশ্চিত করুন।'
                : 'Direct line for prompt dispatch and water tank cleaning consultation across Dhaka.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a
              href={`tel:${business.phone}`}
              className="min-h-[44px] py-3 px-6 rounded-xl bg-[#2585FF] hover:bg-[#1a73e8] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Phone className="w-4 h-4 text-white" aria-hidden="true" />
              <span>{lang === 'bn' ? 'কল করুন' : 'Call Now'}</span>
            </a>
            <a
              href={`https://wa.me/${rawWhatsapp}?text=${encodeURIComponent('আসসালামু আলাইকুম। আমি ঢাকা শহরে ওয়াটার ট্যাংক ক্লিনিং সার্ভিস সম্পর্কে জানতে চাই।')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick({ source: 'service_area_bottom' })}
              className="min-h-[44px] py-3 px-6 rounded-xl bg-[#28C76F] hover:bg-[#22aa5e] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <MessageCircle className="w-4 h-4 text-white" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
