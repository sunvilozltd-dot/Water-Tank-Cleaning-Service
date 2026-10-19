import React from 'react';
import { Phone, MessageCircle, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { trackEvent } from '../utils/tracking';

interface MobileStickyBarProps {
  onOpenQuoteModal: () => void;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({ onOpenQuoteModal }) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();

  const rawWhatsapp = (business.whatsappNumber || '8801609999612').replace(/[^0-9]/g, '');
  const inquiryMsg = 'আসসালামু আলাইকুম। আমি Water Tank Cleaning Service নিতে আগ্রহী। আমার এলাকা: ঢাকা। অনুগ্রহ করে সার্ভিসের মূল্য ও বুকিং প্রক্রিয়া জানাবেন।';
  const whatsappUrl = `https://wa.me/${rawWhatsapp}?text=${encodeURIComponent(inquiryMsg)}`;

  return (
    <nav 
      aria-label="Mobile Sticky Action Bar" 
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#040D1A]/95 backdrop-blur-md border-t border-cyan-900/40 px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] sm:hidden shadow-2xl"
    >
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        
        {/* 1. Direct Phone Call */}
        <a
          href={`tel:${business.phone}`}
          onClick={() => trackEvent('phone_click', { source: 'mobile_sticky_bar' })}
          className="flex items-center justify-center gap-1.5 min-h-[44px] py-2 px-1 rounded-xl bg-[#08162A] hover:bg-[#0C2240] border border-cyan-800/40 text-white font-bold text-xs transition-colors active:scale-95 focus-visible:outline-2 focus-visible:outline-cyan-400"
          aria-label={`Call hotline ${business.displayPhone}`}
        >
          <Phone className="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true" />
          <span>{lang === 'bn' ? 'কল করুন' : 'Call'}</span>
        </a>

        {/* 2. Direct WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('whatsapp_click', { source: 'mobile_sticky_bar' })}
          className="flex items-center justify-center gap-1.5 min-h-[44px] py-2 px-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-900/30 active:scale-95 focus-visible:outline-2 focus-visible:outline-emerald-400"
          aria-label="Chat with us on WhatsApp"
        >
          <MessageCircle className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
          <span>WhatsApp</span>
        </a>

        {/* 3. Get Free Quote */}
        <button
          type="button"
          onClick={() => {
            trackEvent('quote_click', { source: 'mobile_sticky_bar' });
            onOpenQuoteModal();
          }}
          className="flex items-center justify-center gap-1.5 min-h-[44px] py-2 px-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition-colors shadow-md shadow-cyan-600/30 active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400"
          aria-label="Open instant quote calculator form"
        >
          <FileText className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
          <span>{lang === 'bn' ? 'কোটেশন' : 'Quote'}</span>
        </button>

      </div>
    </nav>
  );
};
