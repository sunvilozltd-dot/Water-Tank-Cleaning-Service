import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  CheckCircle2, 
  Phone, 
  ArrowRight, 
  PhoneCall,
  MessageCircle,
  ExternalLink,
  AlertCircle
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
      name: 'Central & West Dhaka',
      nameBn: 'সেন্ট্রাল ও পশ্চিম ঢাকা জোন',
      places: 'ধানমন্ডি, মোহাম্মদপুর, লালমাটিয়া, তেজগাঁও, মহাখালী, মিরপুর',
      featuredSlug: 'dhanmondi'
    },
    {
      name: 'South & East Dhaka',
      nameBn: 'পূর্ব ও দক্ষিণ ঢাকা জোন',
      places: 'বাড্ডা, রামপুরা, বনশ্রী, খিলগাঁও, মালিবাগ, শান্তিনগর, পুরান ঢাকা',
      featuredSlug: 'dhaka'
    },
    {
      name: 'Greater Dhaka Corridor',
      nameBn: 'বৃহত্তর ঢাকা করিডোর',
      places: 'গাজীপুর, টঙ্গী, সাভার, আশুলিয়া, হেমায়েতপুর, নারায়ণগঞ্জ',
      featuredSlug: 'gazipur'
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

    // 1. Explicitly check for an active and verified service area record
    const verifiedActiveArea = areas.find(a => 
      Boolean(a.active) && (
        a.name.toLowerCase().includes(term) ||
        (a.nameBn && a.nameBn.includes(searchTerm.trim())) ||
        term.includes(a.name.toLowerCase())
      )
    );

    if (verifiedActiveArea && verifiedActiveArea.active === true) {
      trackEvent('service_area_check', { area: verifiedActiveArea.name, verified: true });
      const matchedLocation = LOCATIONS_DATA.find(loc => 
        loc.areaName.toLowerCase().includes(verifiedActiveArea.name.toLowerCase()) || 
        verifiedActiveArea.name.toLowerCase().includes(loc.areaName.toLowerCase())
      );
      
      setCheckResult({
        found: true,
        name: lang === 'bn' ? (verifiedActiveArea.nameBn || verifiedActiveArea.name) : verifiedActiveArea.name,
        message: lang === 'bn' 
          ? `হ্যাঁ! ${verifiedActiveArea.nameBn || verifiedActiveArea.name} এলাকায় আমাদের পেশাদার টিম নিয়মিত সার্ভিস প্রদান করছে। বুকিং করতে নিচে ক্লিক করুন বা সরাসরি কল করুন।` 
          : `Yes! Professional water tank and pipeline cleaning service is actively available in ${verifiedActiveArea.name}. Request an estimate below.`,
        slug: matchedLocation?.slug
      });
      return;
    }

    // 2. Unverified or Unlisted Area: Strictly show contact confirmation message
    trackEvent('service_area_check', { area: searchTerm.trim(), verified: false });
    setCheckResult({
      found: false,
      name: searchTerm.trim(),
      message: lang === 'bn'
        ? `অনুগ্রহ করে আমাদের সাথে যোগাযোগ করে আপনার এলাকায় সার্ভিসের প্রাপ্যতা নিশ্চিত করুন (Please contact us to confirm service availability)। আমাদের হটলাইন ${business.displayPhone} নম্বরে সরাসরি কল করুন অথবা হোয়াটসঅ্যাপে জানান।`
        : `Please contact us to confirm service availability for "${searchTerm.trim()}". Call our dispatch desk directly at ${business.displayPhone} or reach out via WhatsApp.`
    });
  };

  const rawWhatsapp = (business.whatsappNumber || '8801609999612').replace(/[^0-9]/g, '');

  return (
    <section 
      className="py-16 sm:py-24 bg-[#F5FAFC] border-b border-[#E2E8F0] relative overflow-hidden" 
      id="service-areas" 
      aria-labelledby="areas-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#0D9488] uppercase mb-2 bg-[#E8F5F3] px-3.5 py-1 rounded-full border border-[#0D9488]/30">
            <MapPin className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
            <span>{lang === 'bn' ? 'সার্ভিস কভারেজ ও জোন' : 'Dhaka Metro Coverage'}</span>
          </div>
          <h2 id="areas-heading" className="text-2xl sm:text-3xl md:text-4xl font-black text-[#123047] tracking-tight mt-2.5">
            {lang === 'bn' 
              ? 'ঢাকা শহরের সকল এলাকায় আমাদের সার্ভিস কভারেজ' 
              : 'Water Tank Cleaning Services Across Dhaka City'}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#0D9488] to-transparent mx-auto my-3.5 rounded-full" />
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-3xl mx-auto">
            {lang === 'bn'
              ? 'ঢাকা, গাজীপুর, সাভার, নারায়ণগঞ্জসহ ঢাকার পার্শ্ববর্তী বিভিন্ন এলাকায় আপনার বাসা, ভবন ও প্রতিষ্ঠানের জন্য পেশাদার পানির ট্যাংক ও পাইপলাইন ক্লিনিং সার্ভিস নিয়ে আমরা আছি আপনার পাশে।'
              : 'Providing professional water tank and pipeline cleaning services for your home, building, and commercial establishments across Dhaka, Gazipur, Savar, Narayanganj, and adjoining areas.'}
          </p>
        </div>

        {/* 1. Dhaka Primary Zones Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {DHAKA_ZONES.map((zone) => (
            <div
              key={zone.name}
              className="bg-white rounded-2xl p-5 border border-[#E2E8F0] hover:border-[#0D9488]/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F5F3] text-[#0D9488] flex items-center justify-center font-bold" aria-hidden="true">
                    <MapPin className="w-5 h-5 text-[#0D9488]" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-[#123047] group-hover:text-[#0D9488] transition-colors">
                  {lang === 'bn' ? zone.nameBn : zone.name}
                </h3>
                <p className="text-xs text-[#64748B] mt-2 line-clamp-2 leading-relaxed">
                  {zone.places}
                </p>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => onAreaSelected(zone.nameBn)}
                  className="w-full min-h-[40px] py-2 px-3 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>{lang === 'bn' ? 'এই জোনে বুক করুন' : 'Book in this Zone'}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>

                {zone.featuredSlug && (
                  <button
                    type="button"
                    onClick={() => handleNavigate(`/service-areas/${zone.featuredSlug}`)}
                    className="w-full text-center text-[11px] text-[#0D9488] hover:underline flex items-center justify-center gap-1 py-1 font-semibold"
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
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-md">
          <h3 className="text-base sm:text-lg font-bold text-[#123047] mb-1 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
            <span>{t('area.checkTitle')}</span>
          </h3>
          <p className="text-xs text-[#64748B] mb-4">
            {lang === 'bn' 
              ? 'আপনার এলাকার নাম লিখুন এবং তাত্ক্ষণিকভাবে সার্ভিসের প্রাপ্যতা যাচাই করুন' 
              : 'Enter your neighborhood or thana in Dhaka to verify instant availability'}
          </p>

          <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: গুলশান, মিরপুর, উত্তরা, ধানমন্ডি...' : 'e.g. Gulshan, Mirpur, Uttara, Dhanmondi...'}
                className="w-full pl-10 pr-3.5 py-3 text-sm rounded-xl bg-white border border-[#E2E8F0] text-[#172B3A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                aria-label="Area search input"
              />
            </div>
            <button
              type="submit"
              className="min-h-[44px] py-3 px-6 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs sm:text-sm shadow-xs transition-all whitespace-nowrap cursor-pointer active:scale-95"
            >
              {t('area.checkBtn')}
            </button>
          </form>

          {/* Interactive Result Card */}
          {checkResult && (
            <div 
              className={`mt-4 p-4 rounded-2xl border text-xs sm:text-sm bg-[#F5FAFC] transition-all animate-fadeIn ${
                checkResult.found 
                  ? 'border-[#16A34A]/40 text-[#172B3A]' 
                  : 'border-[#D97706]/40 text-[#172B3A]'
              }`} 
              role="status" 
              aria-live="polite"
            >
              <div className="flex items-start gap-2.5">
                {checkResult.found ? (
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" aria-hidden="true" />
                )}
                <div className="flex-1">
                  <div className={`font-bold mb-1 ${checkResult.found ? 'text-[#16A34A]' : 'text-[#D97706]'}`}>
                    {checkResult.found
                      ? (lang === 'bn' ? `✓ ${checkResult.name}-এ সার্ভিস সক্রিয় আছে!` : `✓ Service Active in ${checkResult.name}!`)
                      : (lang === 'bn' ? `অতালিকাভুক্ত এলাকা: ${checkResult.name}` : `Unlisted Area: ${checkResult.name}`)}
                  </div>
                  <p className="text-xs leading-relaxed text-[#64748B]">
                    {checkResult.message}
                  </p>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-2.5">
                    {checkResult.found ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onAreaSelected(checkResult.name!)}
                          className="min-h-[36px] py-1.5 px-3.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{lang === 'bn' ? 'এই এলাকার জন্য কোটেশন নিন' : 'Request Quote for this Area'}</span>
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>

                        {checkResult.slug && (
                          <button
                            type="button"
                            onClick={() => handleNavigate(`/service-areas/${checkResult.slug}`)}
                            className="min-h-[36px] py-1.5 px-3.5 rounded-lg bg-white border border-[#E2E8F0] hover:border-[#0D9488] text-[#123047] font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>{lang === 'bn' ? 'এরিয়া পেজ দেখুন' : 'View Dedicated Page'}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-[#0D9488]" />
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <a
                          href={`tel:${business.phone}`}
                          className="min-h-[36px] py-1.5 px-3.5 rounded-lg bg-[#123047] hover:bg-[#0f2638] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#38BDF8]" />
                          <span>{lang === 'bn' ? `হটলাইনে কল করুন (${business.displayPhone})` : `Call Hotline (${business.displayPhone})`}</span>
                        </a>
                        <a
                          href={`https://wa.me/${rawWhatsapp}?text=${encodeURIComponent(`আসসালামু আলাইকুম। আমি ${checkResult.name} এলাকা থেকে বলছি। এখানে ওয়াটার ট্যাংক ক্লিনিং সার্ভিস পাওয়া যাবে কি না জানতে চাই।`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackWhatsAppClick({ source: 'unlisted_area_check' })}
                          className="min-h-[36px] py-1.5 px-3.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{lang === 'bn' ? 'WhatsApp এ নিশ্চিত হোন' : 'Confirm on WhatsApp'}</span>
                        </a>
                      </>
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              {lang === 'bn' ? 'প্রধান কভারেজ এলাকা সমুহ:' : 'Key Active Dhaka Coverage Locations:'}
            </h3>
            <span className="text-xs text-[#0D9488] font-mono font-bold">
              {LOCATIONS_DATA.length} Prime Dedicated Hubs
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {LOCATIONS_DATA.map((loc) => (
              <button
                key={loc.slug}
                type="button"
                onClick={() => handleNavigate(`/service-areas/${loc.slug}`)}
                className="group inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-xl bg-white hover:bg-[#E8F5F3] border border-[#E2E8F0] hover:border-[#0D9488] text-xs font-semibold text-[#172B3A] shadow-2xs transition-all cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] group-hover:scale-125 transition-transform" aria-hidden="true" />
                <span>{lang === 'bn' ? loc.areaNameBn : loc.areaName}</span>
                <ArrowRight className="w-3 h-3 text-[#94A3B8] group-hover:text-[#0D9488] group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* 4. Quick Hotline & Emergency Booking Card (Deep Navy #123047) */}
        <div className="bg-[#123047] border border-[#123047] rounded-3xl p-6 sm:p-8 text-white shadow-xl max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs uppercase font-extrabold text-[#38BDF8] tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-[#25D366] animate-pulse" aria-hidden="true" />
              <span>{lang === 'bn' ? 'সরাসরি হেল্পলাইন' : 'Emergency Hotline & Dispatch'}</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white font-mono">
              {business.displayPhone}
            </h3>
            <p className="text-xs text-slate-300 max-w-md">
              {lang === 'bn' 
                ? 'সরাসরি ফোনে কথা বলে দ্রুত কোটেশন ও শিডিউল নিশ্চিত করুন।'
                : 'Direct line for prompt dispatch and water tank cleaning consultation across Dhaka.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a
              href={`tel:${business.phone}`}
              className="min-h-[44px] py-3 px-6 rounded-xl bg-white hover:bg-slate-100 text-[#123047] font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Phone className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
              <span>{lang === 'bn' ? 'কল করুন' : 'Call Now'}</span>
            </a>
            <a
              href={`https://wa.me/${rawWhatsapp}?text=${encodeURIComponent('আসসালামু আলাইকুম। আমি ঢাকা শহরে ওয়াটার ট্যাংক ক্লিনিং সার্ভিস সম্পর্কে জানতে চাই।')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick({ source: 'service_area_bottom' })}
              className="min-h-[44px] py-3 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
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

export default ServiceAreaSection;
