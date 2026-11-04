import React from 'react';
import { SeoHead } from '../components/SeoHead';
import { Home, Wrench, Phone, MessageCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { BUSINESS_CONFIG } from '../data/config';
import { trackPhoneClick, trackWhatsAppClick } from '../utils/tracking';

interface NotFoundPageProps {
  onNavigate?: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  const { lang } = useLanguage();

  const handleGo = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const rawWhatsapp = (BUSINESS_CONFIG.whatsappNumber || '8801609999612').replace(/[^0-9]/g, '');

  return (
    <main className="min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-[#F5FAFC] to-white">
      <SeoHead
        title="Page Not Found (404) - Sunviloz Clean Care"
        description="The requested page could not be found. Explore our water tank cleaning services in Dhaka or contact our hotline directly."
        noIndex={true}
      />

      <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-12 border border-[#E2E8F0] shadow-xl space-y-6 animate-fadeIn">
        {/* Error Badge */}
        <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 border border-rose-200 mx-auto flex items-center justify-center shadow-inner">
          <AlertCircle className="w-10 h-10" />
        </div>

        {/* 404 Header */}
        <div className="space-y-2">
          <span className="text-xs font-black tracking-widest text-[#0D9488] uppercase bg-[#E8F5F3] px-3 py-1 rounded-full border border-[#0D9488]/30">
            Error 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#123047] tracking-tight">
            {lang === 'bn' ? 'পৃষ্ঠাটি খুঁজে পাওয়া যায়নি' : 'Page Not Found'}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-sm mx-auto">
            {lang === 'bn'
              ? 'আপনি যে পেজটি খুঁজছেন তা মুছে ফেলা হয়েছে, লিঙ্কটি পরিবর্তন হয়েছে অথবা ভুল ইউআরএল দেওয়া হয়েছে।'
              : 'The page you requested may have been moved, deleted, or the URL address was entered incorrectly.'}
          </p>
        </div>

        {/* Navigation Actions */}
        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={() => handleGo('/')}
            className="w-full min-h-[46px] px-6 py-2.5 rounded-xl bg-[#123047] hover:bg-[#1b4363] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Home className="w-4 h-4 text-[#38BDF8]" />
            <span>{lang === 'bn' ? 'হোমপেজে ফিরে যান' : 'Back to Home'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleGo('/services')}
            className="w-full min-h-[46px] px-6 py-2.5 rounded-xl bg-white hover:bg-[#F5FAFC] border border-[#E2E8F0] hover:border-[#0D9488] text-[#123047] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-[#0D9488]" />
            <span>{lang === 'bn' ? 'আমাদের সকল সার্ভিস দেখুন' : 'Explore All Services'}</span>
          </button>

          <a
            href={`https://wa.me/${rawWhatsapp}?text=${encodeURIComponent('আসসালামু আলাইকুম। সানভিলোজ ক্লিন কেয়ার ওয়েবসাইটে একটি পেজ কাজ করছে না, কোটেশন প্রয়োজন।')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick({ source: 'not_found_page' })}
            className="w-full min-h-[46px] px-6 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{lang === 'bn' ? 'সরাসরি হোয়াটসঅ্যাপে সাহায্য নিন' : 'WhatsApp Support'}</span>
          </a>
        </div>

        {/* Hotline */}
        <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-center gap-2 text-xs text-[#64748B]">
          <Phone className="w-3.5 h-3.5 text-[#0D9488]" />
          <span>{lang === 'bn' ? 'জরুরি কল করুন:' : 'Urgent Hotline:'}</span>
          <a
            href={`tel:${BUSINESS_CONFIG.phone}`}
            onClick={() => trackPhoneClick({ source: 'not_found_hotline' })}
            className="font-bold text-[#123047] hover:text-[#0D9488] underline font-mono"
          >
            {BUSINESS_CONFIG.displayPhone}
          </a>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
