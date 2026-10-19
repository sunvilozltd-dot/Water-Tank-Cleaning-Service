import React, { useState } from 'react';
import { 
  Droplets, 
  Phone, 
  MessageCircle, 
  Send, 
  Mail, 
  MapPin, 
  Clock, 
  Database,
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
  onSelectService,
  onOpenLeadsAdmin,
  onNavigateHome,
  onOpenAdmin,
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
      <footer className="bg-[#030914] text-slate-300 pt-16 pb-28 sm:pb-12 border-t border-cyan-900/40 text-xs sm:text-sm relative overflow-hidden" aria-label="Site Footer">
        {/* Subtle water depth ambient glow */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-cyan-900/30">
            
            {/* Col 1 & 2: Brand Information (Matches Header Logo) */}
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
                    className="flex items-center justify-center text-cyan-400 shrink-0 bg-transparent" 
                    aria-hidden="true"
                  >
                    <Droplets className="w-8 h-8 text-cyan-400" />
                  </div>
                ) : null}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-2xl text-white tracking-tight">
                      {headerConfig.brandName || 'Sunviloz'}
                    </span>
                    {headerConfig.brandSuffix && (
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/30">
                        {headerConfig.brandSuffix}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
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
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#07172C] hover:bg-[#0B213D] text-white border border-cyan-800/40 font-bold text-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                  <span>{BUSINESS_CONFIG.displayPhone}</span>
                </a>

                <a
                  href={BUSINESS_CONFIG.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#28C76F] hover:bg-[#22aa5e] text-white font-bold text-xs transition-colors shadow-sm"
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
                    className="hover:text-[#2585FF] transition-colors text-left cursor-pointer"
                  >
                    Water Tank Cleaning
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleLink('/services/pipeline-cleaning')}
                    className="hover:text-[#2585FF] transition-colors text-left cursor-pointer"
                  >
                    Pipeline Cleaning Service
                  </button>
                </li>
                {services.slice(2, 6).map((srv) => (
                  <li key={srv.id}>
                    <button
                      type="button"
                      onClick={() => handleLink(`/services/${srv.slug}`)}
                      className="hover:text-[#2585FF] transition-colors text-left cursor-pointer"
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
                    className="hover:text-[#2585FF] transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'হোম পেইজ' : 'Home'}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleLink('/about')}
                    className="hover:text-[#2585FF] transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleLink('/pricing')}
                    className="hover:text-[#2585FF] transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'সার্ভিস চার্জ ও প্যাকেজ' : 'Pricing Packages'}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleLink('/service-areas')}
                    className="hover:text-[#2585FF] transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'সার্ভিস এরিয়া (ঢাকা)' : 'Service Areas'}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleLink('/blog')}
                    className="hover:text-[#2585FF] transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'পানি সচেতনতা ব্লগ' : 'Water Hygiene Blog'}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleLink('/contact')}
                    className="hover:text-[#2585FF] transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 5: Contact Info */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                {lang === 'bn' ? 'অফিস ও সহায়তা' : 'Contact & Support'}
              </h3>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#2585FF] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Dhaka, Bangladesh</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#28C76F] shrink-0" aria-hidden="true" />
                  <a href={`tel:${BUSINESS_CONFIG.phone}`} className="hover:text-white transition-colors">
                    {BUSINESS_CONFIG.displayPhone}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#2585FF] shrink-0" aria-hidden="true" />
                  <a href={`mailto:${BUSINESS_CONFIG.email}`} className="hover:text-white transition-colors break-all">
                    {BUSINESS_CONFIG.email}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-[#B8C0CC] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{lang === 'bn' ? BUSINESS_CONFIG.operatingHoursBn : BUSINESS_CONFIG.operatingHours}</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Policies */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#B8C0CC]">
            <p>
              &copy; {currentYear} Sunviloz Clean Care. All rights reserved.
            </p>
            
            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => setModalPolicy('privacy')}
                className="hover:text-[#2585FF] transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <span aria-hidden="true">•</span>
              <button
                type="button"
                onClick={() => setModalPolicy('terms')}
                className="hover:text-[#2585FF] transition-colors cursor-pointer"
              >
                Terms & Conditions
              </button>
              <span aria-hidden="true">•</span>
              <button
                type="button"
                onClick={() => handleLink('/admin/login')}
                className="flex items-center gap-1 text-[#B8C0CC] hover:text-[#2585FF] transition-colors cursor-pointer"
                title="Website Admin Panel"
              >
                <Settings className="w-3.5 h-3.5 text-[#2585FF]" aria-hidden="true" />
                <span>এডমিন প্যানেল</span>
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* Privacy / Terms Modal */}
      {modalPolicy && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="modal-policy-title">
          <div className="bg-[#171C24] border border-[#303743] rounded-3xl max-w-xl w-full p-6 text-white shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setModalPolicy(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#202630] text-[#B8C0CC] hover:text-white cursor-pointer"
              aria-label="Close policy modal"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 id="modal-policy-title" className="text-xl font-bold text-white mb-3">
              {modalPolicy === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
            </h3>
            {modalPolicy === 'privacy' ? (
              <div className="text-xs sm:text-sm text-[#B8C0CC] space-y-3 leading-relaxed">
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
              <div className="text-xs sm:text-sm text-[#B8C0CC] space-y-3 leading-relaxed">
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
