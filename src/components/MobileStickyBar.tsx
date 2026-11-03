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
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-[#E2E8F0] px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] sm:hidden shadow-xl"
    >
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        
        {/* 1. Direct Phone Call (Deep Navy #123047) */}
        <a
          href={`tel:${business.phone}`}
          onClick={() => trackEvent('phone_click', { source: 'mobile_sticky_bar' })}
          className="flex items-center justify-center gap-1.5 min-h-[44px] py-2 px-1 rounded-xl bg-[#123047] hover:bg-[#0f2638] text-white font-bold text-xs transition-colors active:scale-95 focus-visible:outline-2 focus-visible:outline-[#123047]"
          aria-label={`Call hotline ${business.displayPhone}`}
        >
          <Phone className="w-4 h-4 text-[#38BDF8] shrink-0" aria-hidden="true" />
          <span>{lang === 'bn' ? 'কল করুন' : 'Call'}</span>
        </a>

        {/* 2. Direct WhatsApp (WhatsApp Green #25D366) */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('whatsapp_click', { source: 'mobile_sticky_bar' })}
          className="flex items-center justify-center gap-1.5 min-h-[44px] py-2 px-1 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs transition-colors shadow-xs active:scale-95 focus-visible:outline-2 focus-visible:outline-[#25D366]"
          aria-label="Chat with us on WhatsApp"
        >
          <MessageCircle className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
          <span>WhatsApp</span>
        </a>

        {/* 3. Get Free Quote (Fresh Teal #0D9488) */}
        <button
          type="button"
          onClick={() => {
            trackEvent('quote_click', { source: 'mobile_sticky_bar' });
            onOpenQuoteModal();
          }}
          className="flex items-center justify-center gap-1.5 min-h-[44px] py-2 px-1 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs transition-colors shadow-xs active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0D9488]"
          aria-label="Open instant quote calculator form"
        >
          <FileText className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
          <span>{lang === 'bn' ? 'কোটেশন' : 'Quote'}</span>
        </button>

      </div>
    </nav>
  );
};
