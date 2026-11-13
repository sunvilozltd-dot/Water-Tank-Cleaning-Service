import React from 'react';
import { Phone, MessageCircle, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { trackEvent, trackPhoneClick, trackWhatsAppClick } from '../utils/tracking';

interface MobileStickyBarProps {
  onOpenQuoteModal: () => void;
  isHidden?: boolean;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({
  onOpenQuoteModal,
  isHidden = false
}) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();

  if (isHidden) {
    return null;
  }

  const rawWhatsapp = (business.whatsappNumber || '8801609999612').replace(/[^0-9]/g, '');
  const inquiryMsg = 'আসসালামু আলাইকুম। আমি Water Tank Cleaning Service নিতে আগ্রহী। আমার এলাকা: ঢাকা। অনুগ্রহ করে সার্ভিসের মূল্য ও বুকিং প্রক্রিয়া জানাবেন।';
  const whatsappUrl = `https://wa.me/${rawWhatsapp}?text=${encodeURIComponent(inquiryMsg)}`;

  return (
    <nav
      aria-label="Mobile Sticky Action Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-[#E2E8F0] px-2.5 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] sm:hidden shadow-xl"
    >
      <div className="grid grid-cols-3 gap-1.5 max-w-md mx-auto">

        {/* 1. Direct Phone Call */}
        <a
          href={`tel:${business.phone}`}
          onClick={() => trackPhoneClick({ source: 'mobile_sticky_bar' })}
          className="flex items-center justify-center gap-1 min-h-[44px] py-2 px-1 rounded-xl bg-[#123047] hover:bg-[#0f2638] text-white font-bold text-[11px] transition-colors active:scale-95 focus-visible:outline-2 focus-visible:outline-[#123047]"
          aria-label={`সরাসরি কল করুন ${business.displayPhone}`}
        >
          <Phone className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" aria-hidden="true" />
          <span className="truncate">{lang === 'bn' ? 'সরাসরি কল করুন' : 'Call Now'}</span>
        </a>

        {/* 2. Direct WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick({ source: 'mobile_sticky_bar' })}
          className="flex items-center justify-center gap-1 min-h-[44px] py-2 px-1 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-[11px] transition-colors shadow-xs active:scale-95 focus-visible:outline-2 focus-visible:outline-[#25D366]"
          aria-label="WhatsApp-এ কোটেশন নিন"
        >
          <MessageCircle className="w-3.5 h-3.5 text-white shrink-0" aria-hidden="true" />
          <span className="truncate">WhatsApp</span>
        </a>

        {/* 3. Open Quote Modal */}
        <button
          type="button"
          onClick={() => {
            trackEvent('quote_click', { source: 'mobile_sticky_bar' });
            onOpenQuoteModal();
          }}
          className="flex items-center justify-center gap-1 min-h-[44px] py-2 px-1 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-[11px] transition-colors shadow-xs active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0D9488]"
          aria-label="কোটেশন ফর্ম খুলুন"
        >
          <FileText className="w-3.5 h-3.5 text-white shrink-0" aria-hidden="true" />
          <span className="truncate">{lang === 'bn' ? 'ফ্রি কোটেশন' : 'Quote'}</span>
        </button>

      </div>
    </nav>
  );
};

