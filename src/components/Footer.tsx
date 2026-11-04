import React, { useState } from 'react';
import { 
  Droplets, 
  Phone, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Clock, 
  X,
  Settings
} from 'lucide-react';
import { BUSINESS_CONFIG } from '../data/config';
import { useLanguage } from '../context/LanguageContext';
import { useServices } from '../utils/servicesStore';
import { useHeaderNav } from '../context/HeaderNavContext';
import { useSiteConfig } from '../context/SiteConfigContext';

interface FooterProps {
  onSelectService?: (slug: string) => void;
  onOpenLeadsAdmin?: () => void;
  onNavigateHome?: (hash?: string) => void;
  onOpenAdmin?: () => void;
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate
}) => {
  const { lang } = useLanguage();
  const { services } = useServices();
  const { headerConfig } = useHeaderNav();
  const { images } = useSiteConfig();
  const activeLogoUrl = headerConfig.logoUrl || images?.logo;
  const currentYear = new Date().getFullYear();
  const [modalPolicy, setModalPolicy] = useState<'privacy' | 'terms' | null>(null);

  const handleLink = (path: string) => {
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

  return (
    <>
      <footer className="bg-[#123047] text-slate-300 pt-16 pb-28 sm:pb-12 border-t border-[#0e273a] text-xs sm:text-sm relative overflow-hidden" aria-label="Site Footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-700/60">
            
            {/* Col 1 & 2: Brand Information */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                {headerConfig.logoEnabled && activeLogoUrl ? (
                  <img
                    src={activeLogoUrl}
                    alt={headerConfig.logoAlt || `${headerConfig.brandName || 'Sunviloz'} Logo`}
                    style={{
                      width: `${headerConfig.logoWidth || 40}px`,
                      height: `${headerConfig.logoHeight || 40}px`
                    }}
                    className="object-contain bg-transparent"
                  />
                ) : headerConfig.logoEnabled ? (
                  <div 
                    style={{
                      width: `${headerConfig.logoWidth || 40}px`,
                      height: `${headerConfig.logoHeight || 40}px`
                    }}
                    className="flex items-center justify-center text-[#38BDF8] shrink-0 bg-transparent" 
                    aria-hidden="true"
                  >
                    <Droplets className="w-8 h-8 text-[#38BDF8]" />
                  </div>
                ) : null}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-2xl text-white tracking-tight">
                      {headerConfig.brandName || 'Sunviloz'}
                    </span>
                    {headerConfig.brandSuffix && (
                      <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8] bg-[#38BDF8]/15 px-1.5 py-0.5 rounded border border-[#38BDF8]/30">
                        {headerConfig.brandSuffix}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {lang === 'bn' 
                      ? (headerConfig.brandTaglineBn || 'ওয়াটার ট্যাংক ও পাইপলাইন ক্লিনিং সার্ভিস')
                      : (headerConfig.brandTaglineEn || 'Water Tank & Pipeline Cleaning')}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
                {lang === 'bn' 
                  ? 'ঢাকা শহরের সকল আবাসিক ভবন, অ্যাপার্টমেন্ট ও বাণিজ্যিক প্রতিষ্ঠানে আধুনিক মেকানাইজড রোটারি ওয়াটার জেট ও ফুড-গ্রেড জীবাণুমুক্তকরণ সেবায় সানভিলোজ ক্লিন কেয়ার একটি বিশ্বস্ত নাম।'
                  : 'Sunviloz Clean Care is the trusted mechanized water tank and pipeline cleaning specialist for residential buildings and commercial properties across Dhaka.'}
              </p>

              {/* Direct Booking & Hotline Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={`tel:${BUSINESS_CONFIG.phone}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0e273a] hover:bg-[#183c57] text-white border border-slate-600 font-bold text-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#38BDF8]" aria-hidden="true" />
                  <span>{BUSINESS_CONFIG.displayPhone}</span>
                </a>

                <a
                  href={BUSINESS_CONFIG.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Col 3: Specialized Services */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                {lang === 'bn' ? 'আমাদের সেবাসমূহ' : 'Services'}
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => handleLink('/services/water-tank-cleaning')}
                    className="hover:text-[#38BDF8] transition-colors text-left cursor-pointer"
                  >
                    Water Tank Cleaning
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleLink('/services/pipeline-cleaning')}
                    className="hover:text-[#38BDF8] transition-colors text-left cursor-pointer"
                  >
                    Pipeline Cleaning Service
                  </button>
                </li>
                {services.slice(2, 6).map((srv) => (
                  <li key={srv.id}>
                    <button
                      type="button"
                      onClick={() => handleLink(`/services/${srv.slug}`)}
                      className="hover:text-[#38BDF8] transition-colors text-left cursor-pointer"
                    >
                      {srv.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Quick Links */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                {lang === 'bn' ? 'প্রয়োজনীয় লিংক' : 'Quick Links'}
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => handleLink('/')}
                    className="hover:text-[#38BDF8] transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'হোম পেইজ' : 'Home'}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleLink('/about')}
                    className="hover:text-[#38BDF8] transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleLink('/get-quote')}
                    className="hover:text-[#38BDF8] transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'ফ্রি কোটেশন নিন' : 'Get Free Quote'}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleLink('/service-areas')}
                    className="hover:text-[#38BDF8] transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'সার্ভিস এরিয়া (ঢাকা)' : 'Service Areas'}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleLink('/blog')}
                    className="hover:text-[#38BDF8] transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'পানি সচেতনতা ব্লগ' : 'Water Hygiene Blog'}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleLink('/contact')}
                    className="hover:text-[#38BDF8] transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 5: Contact Info & Google Business Profile */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  {lang === 'bn' ? 'অফিস ও সহায়তা' : 'Contact & Support'}
                </h3>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Dhaka, Bangladesh</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#25D366] shrink-0" aria-hidden="true" />
                    <a href={`tel:${BUSINESS_CONFIG.phone}`} className="hover:text-white transition-colors">
                      {BUSINESS_CONFIG.displayPhone}
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#38BDF8] shrink-0" aria-hidden="true" />
                    <a href={`mailto:${BUSINESS_CONFIG.email}`} className="hover:text-white transition-colors break-all">
                      {BUSINESS_CONFIG.email}
                    </a>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{lang === 'bn' ? BUSINESS_CONFIG.operatingHoursBn : BUSINESS_CONFIG.operatingHours}</span>
                  </li>
                </ul>
              </div>

              {/* Google Verified Business Links */}
              <div className="pt-2 border-t border-slate-700/60 space-y-2 text-xs">
                <div className="font-bold text-[11px] uppercase tracking-wider text-[#38BDF8]">
                  {lang === 'bn' ? 'গুগল প্রোফাইল ও ম্যাপস' : 'Google Business Profile'}
                </div>
                <div className="flex flex-col gap-1.5">
                  <a
                    href={BUSINESS_CONFIG.googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (typeof window !== 'undefined' && (window as any).gtag) {
                        (window as any).gtag('event', 'google_maps_click', { platform: 'google_maps' });
                      }
                    }}
                    className="hover:text-white text-slate-300 inline-flex items-center gap-1.5"
                  >
                    <span>📍 {lang === 'bn' ? 'গুগল ম্যাপে লোকেশন ও ডিরেকশন' : 'Google Maps Directions'}</span>
                  </a>
                  <a
                    href={BUSINESS_CONFIG.googleReviewsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (typeof window !== 'undefined' && (window as any).gtag) {
                        (window as any).gtag('event', 'google_review_click', { platform: 'google_reviews' });
                      }
                    }}
                    className="hover:text-[#F59E0B] text-amber-300 inline-flex items-center gap-1.5"
                  >
                    <span>⭐ {lang === 'bn' ? 'গুগলে ৫-স্টার রিভিউ দিন' : 'Rate us on Google Reviews'}</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Policies */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              &copy; {currentYear} Sunviloz Clean Care. All rights reserved.
            </p>
            
            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => setModalPolicy('privacy')}
                className="hover:text-[#38BDF8] transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <span aria-hidden="true">•</span>
              <button
                type="button"
                onClick={() => setModalPolicy('terms')}
                className="hover:text-[#38BDF8] transition-colors cursor-pointer"
              >
                Terms & Conditions
              </button>
              <span aria-hidden="true">•</span>
              {/* Cookie Preferences & Consent Withdrawal Button */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('sunviloz_open_consent_preferences'));
                  }
                }}
                className="hover:text-cyan-400 text-slate-300 underline underline-offset-2 transition-colors cursor-pointer"
                title="Manage cookie consent & privacy options"
              >
                {lang === 'bn' ? 'কুকি সেটিংস ও সম্মতি' : 'Cookie Preferences'}
              </button>
              <span aria-hidden="true">•</span>
              <button
                type="button"
                onClick={() => handleLink('/admin/login')}
                className="flex items-center gap-1 text-slate-400 hover:text-[#38BDF8] transition-colors cursor-pointer"
                title="Website Admin Panel"
              >
                <Settings className="w-3.5 h-3.5 text-[#38BDF8]" aria-hidden="true" />
                <span>এডমিন প্যানেল</span>
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* Privacy / Terms Modal */}
      {modalPolicy && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="modal-policy-title">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl max-w-xl w-full p-6 text-[#172B3A] shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setModalPolicy(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#F5FAFC] text-[#64748B] hover:text-[#172B3A] cursor-pointer"
              aria-label="Close policy modal"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 id="modal-policy-title" className="text-xl font-bold text-[#123047] mb-3">
              {modalPolicy === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
            </h3>
            {modalPolicy === 'privacy' ? (
              <div className="text-xs sm:text-sm text-[#64748B] space-y-3 leading-relaxed">
                <p>
                  At Sunviloz Clean Care, your privacy is paramount. When you submit a quote inquiry through our website, we only collect details necessary to formulate your cleaning estimate and schedule service visits (such as your name, phone number, and Dhaka locality).
                </p>
                <p>
                  We never sell, rent, or trade your contact details to third parties. Your phone number is utilized solely for direct service coordination via phone calls, SMS, or WhatsApp.
                </p>
                <p>
                  If you have any questions regarding your data or wish to update your records, please contact us at {BUSINESS_CONFIG.email}.
                </p>
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-[#64748B] space-y-3 leading-relaxed">
                <p>
                  1. <strong>Quotations & Estimates:</strong> Preliminary quotes provided online or over the phone are estimates based on standard tank dimensions. Final pricing is confirmed after assessing actual accessibility, physical tank capacity, and sediment depth.
                </p>
                <p>
                  2. <strong>Water Supply Management:</strong> Clients are encouraged to lower water levels prior to service through normal household chores to minimize water wastage.
                </p>
                <p>
                  3. <strong>Safety & Access:</strong> The client agrees to grant safe roof or underground access to our trained personnel during the scheduled service window.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
