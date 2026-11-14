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
import { trackGoogleMapsClick, trackGoogleReviewClick, trackPhoneClick, trackWhatsAppClick } from '../utils/tracking';

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
  const { images, business } = useSiteConfig();
  const activeLogoUrl = headerConfig.logoUrl || images?.logo || 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/branding/sunviloz-logo-official.png';
  const showVerifiedGbp = Boolean(
    business?.gbpVerified &&
      (business?.googleMapsDirectionsUrl || business?.googleReviewsUrl || business?.googleBusinessProfileUrl)
  );
  const [logoError, setLogoError] = useState(false);
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
              <div className="flex items-center gap-1.5 sm:gap-2">
                {headerConfig.logoEnabled && activeLogoUrl && !logoError ? (
                  <img
                    src={activeLogoUrl}
                    alt={headerConfig.logoAlt || `${headerConfig.brandName || 'Sunviloz'} Logo`}
                    width={headerConfig.logoWidth || 48}
                    height={headerConfig.logoHeight || 38}
                    loading="lazy"
                    decoding="async"
                    onError={() => setLogoError(true)}
                    style={{
                      height: `${headerConfig.logoHeight || 38}px`,
                      width: 'auto',
                      maxWidth: `${headerConfig.logoWidth || 48}px`
                    }}
                    className="object-contain object-left shrink-0 bg-transparent"
                  />
                ) : headerConfig.logoEnabled ? (
                  <div 
                    style={{
                      width: `${headerConfig.logoWidth || 38}px`,
                      height: `${headerConfig.logoHeight || 38}px`
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
                  ? 'ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভারের সকল আবাসিক ভবন, অ্যাপার্টমেন্ট ও বাণিজ্যিক প্রতিষ্ঠানে আধুনিক মেকানাইজড রোটারি ওয়াটার জেট ও পাইপলাইন পরিষ্কার সেবায় সানভিলোজ ক্লিন কেয়ার একটি বিশ্বস্ত নাম।'
                  : 'Sunviloz Clean Care is a trusted water tank cleaning service and pipeline flushing specialist for residential buildings and commercial properties across Dhaka, Narayanganj, Gazipur & Savar.'}
              </p>

              {/* Direct Booking & Hotline Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={`tel:${business.phone || BUSINESS_CONFIG.phone}`}
                  onClick={() => trackPhoneClick({ source: 'footer_call' })}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0e273a] hover:bg-[#183c57] text-white border border-slate-600 font-bold text-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#38BDF8]" aria-hidden="true" />
                  <span>{lang === 'bn' ? `সরাসরি কল করুন (${business.displayPhone || BUSINESS_CONFIG.displayPhone})` : (business.displayPhone || BUSINESS_CONFIG.displayPhone)}</span>
                </a>

                <a
                  href={business.whatsappUrl || BUSINESS_CONFIG.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick({ source: 'footer_whatsapp' })}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                  <span>{lang === 'bn' ? 'WhatsApp-এ কোটেশন নিন' : 'Get WhatsApp Quote'}</span>
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
                  <a
                    href="/services/water-tank-cleaning"
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                      e.preventDefault();
                      handleLink('/services/water-tank-cleaning');
                    }}
                    className="hover:text-[#38BDF8] transition-colors text-left cursor-pointer"
                  >
                    Water Tank Cleaning Service
                  </a>
                </li>
                <li>
                  <a
                    href="/services/overhead-tank-cleaning"
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                      e.preventDefault();
                      handleLink('/services/overhead-tank-cleaning');
                    }}
                    className="hover:text-[#38BDF8] transition-colors text-left cursor-pointer"
                  >
                    Overhead Water Tank Cleaning
                  </a>
                </li>
                <li>
                  <a
                    href="/services/underground-water-tank-cleaning"
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                      e.preventDefault();
                      handleLink('/services/underground-water-tank-cleaning');
                    }}
                    className="hover:text-[#38BDF8] transition-colors text-left cursor-pointer"
                  >
                    Underground Tank Cleaning
                  </a>
                </li>
                <li>
                  <a
                    href="/services/pipeline-cleaning"
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                      e.preventDefault();
                      handleLink('/services/pipeline-cleaning');
                    }}
                    className="hover:text-[#38BDF8] transition-colors text-left cursor-pointer"
                  >
                    Water Pipeline Cleaning
                  </a>
                </li>
                {services
                  .filter(srv => ![
                    'water-tank-cleaning',
                    'overhead-tank-cleaning',
                    'overhead-water-tank-cleaning',
                    'underground-water-tank-cleaning',
                    'underground-tank-cleaning',
                    'pipeline-cleaning',
                    'water-pipeline-cleaning'
                  ].includes(srv.slug))
                  .slice(0, 2)
                  .map((srv) => (
                    <li key={srv.id}>
                      <a
                        href={`/services/${srv.slug}`}
                        onClick={(e) => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                          e.preventDefault();
                          handleLink(`/services/${srv.slug}`);
                        }}
                        className="hover:text-[#38BDF8] transition-colors text-left cursor-pointer"
                      >
                        {srv.title}
                      </a>
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
                  <a
                    href="/"
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                      e.preventDefault();
                      handleLink('/');
                    }}
                    className="hover:text-[#38BDF8] transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'হোম পেইজ' : 'Home'}
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                      e.preventDefault();
                      handleLink('/about');
                    }}
                    className="hover:text-[#38BDF8] transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}
                  </a>
                </li>
                <li>
                  <a
                    href="/get-quote"
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                      e.preventDefault();
                      handleLink('/get-quote');
                    }}
                    className="hover:text-[#38BDF8] transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'ফ্রি কোটেশন নিন' : 'Get Free Quote'}
                  </a>
                </li>
                <li>
                  <a
                    href="/service-areas"
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                      e.preventDefault();
                      handleLink('/service-areas');
                    }}
                    className="hover:text-[#38BDF8] transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'সার্ভিস এরিয়া (ঢাকা)' : 'Service Areas'}
                  </a>
                </li>
                <li>
                  <a
                    href="/blog"
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                      e.preventDefault();
                      handleLink('/blog');
                    }}
                    className="hover:text-[#38BDF8] transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'পানি সচেতনতা ব্লগ' : 'Water Hygiene Blog'}
                  </a>
                </li>
                <li>
                  <a
                    href="/faq"
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                      e.preventDefault();
                      handleLink('/faq');
                    }}
                    className="hover:text-[#38BDF8] transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'সাধারণ প্রশ্নোত্তর (FAQ)' : 'FAQ'}
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                      e.preventDefault();
                      handleLink('/contact');
                    }}
                    className="hover:text-[#38BDF8] transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
                  </a>
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
                    <span>{lang === 'bn' ? 'ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভার' : 'Dhaka, Narayanganj, Gazipur & Savar'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#25D366] shrink-0" aria-hidden="true" />
                    <a
                      href={`tel:${business.phone || BUSINESS_CONFIG.phone}`}
                      onClick={() => trackPhoneClick({ source: 'footer_contact_phone' })}
                      className="hover:text-white transition-colors"
                    >
                      {business.displayPhone || BUSINESS_CONFIG.displayPhone}
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#38BDF8] shrink-0" aria-hidden="true" />
                    <a href={`mailto:${business.email || BUSINESS_CONFIG.email}`} className="hover:text-white transition-colors break-all">
                      {business.email || BUSINESS_CONFIG.email}
                    </a>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{lang === 'bn' ? (business.operatingHoursBn || BUSINESS_CONFIG.operatingHoursBn) : (business.operatingHours || BUSINESS_CONFIG.operatingHours)}</span>
                  </li>
                </ul>
              </div>

              {/* Google Verified Business Links (Only rendered when GBP is verified & configured) */}
              {showVerifiedGbp && (
                <div className="pt-2 border-t border-slate-700/60 space-y-2 text-xs">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-[#38BDF8]">
                    {lang === 'bn' ? 'গুগল প্রোফাইল ও ম্যাপস' : 'Google Business Profile'}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {(business.googleMapsDirectionsUrl || business.googleBusinessProfileUrl) && (
                      <a
                        href={business.googleMapsDirectionsUrl || business.googleBusinessProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackGoogleMapsClick({ source: 'footer_gbp_maps' })}
                        className="hover:text-white text-slate-300 inline-flex items-center gap-1.5"
                      >
                        <span>📍 {lang === 'bn' ? 'গুগল ম্যাপে প্রোফাইল দেখুন' : 'View Google Business Profile'}</span>
                      </a>
                    )}
                    {business.googleReviewsUrl && (
                      <a
                        href={business.googleReviewsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackGoogleReviewClick({ source: 'footer_gbp_reviews' })}
                        className="hover:text-[#F59E0B] text-amber-300 inline-flex items-center gap-1.5"
                      >
                        <span>⭐ {lang === 'bn' ? 'গুগলে রিভিউ দিন' : 'Rate us on Google Reviews'}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
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
              <a
                href="/admin/login"
                rel="nofollow"
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  handleLink('/admin/login');
                }}
                className="flex items-center gap-1 text-slate-400 hover:text-[#38BDF8] transition-colors cursor-pointer"
                title="Website Admin Panel"
              >
                <Settings className="w-3.5 h-3.5 text-[#38BDF8]" aria-hidden="true" />
                <span>এডমিন প্যানেল</span>
              </a>
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
