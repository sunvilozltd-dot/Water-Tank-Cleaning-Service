import React, { useState } from 'react';
import { MessageCircle, X, PhoneCall, CalendarCheck } from 'lucide-react';
import { BUSINESS_CONFIG } from '../data/config';
import { useLanguage } from '../context/LanguageContext';
import { trackEvent } from '../utils/tracking';

interface FloatingContactButtonsProps {
  onOpenQuoteModal?: () => void;
}

export const FloatingContactButtons: React.FC<FloatingContactButtonsProps> = ({
  onOpenQuoteModal
}) => {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const rawWhatsapp = (BUSINESS_CONFIG.whatsappNumber || '8801609999612').replace(/[^0-9]/g, '');
  const defaultMsg = 'আসসালামু আলাইকুম। আমি Water Tank Cleaning Service নিতে আগ্রহী। আমার এলাকা: ঢাকা। অনুগ্রহ করে সার্ভিসের মূল্য ও বুকিং প্রক্রিয়া জানাবেন।';
  const whatsappUrl = `https://wa.me/${rawWhatsapp}?text=${encodeURIComponent(defaultMsg)}`;

  return (
    <div className="hidden sm:flex fixed bottom-6 right-6 z-40 flex-col items-end gap-2.5">
      {/* Expanded quick contact tray */}
      {isOpen && (
        <div 
          className="bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-[#E2E8F0] p-3 flex flex-col gap-2 animate-fadeIn mb-1 min-w-[220px] text-[#172B3A]"
          role="dialog"
          aria-label="Direct contact options"
        >
          {/* WhatsApp Direct (#25D366) */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('whatsapp_click', { source: 'floating_widget' })}
            className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl bg-[#E8F5F3] hover:bg-[#d8ece9] text-[#123047] border border-[#0D9488]/20 text-xs font-bold transition-colors min-h-[44px]"
          >
            <div className="w-7 h-7 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0" aria-hidden="true">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <span>{lang === 'bn' ? 'WhatsApp-এ আলাপ' : 'Chat on WhatsApp'}</span>
          </a>

          {/* Quick Quote Request (#0D9488) */}
          {onOpenQuoteModal && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenQuoteModal();
              }}
              className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl bg-[#E8F5F3] hover:bg-[#d8ece9] text-[#123047] border border-[#0D9488]/20 text-xs font-bold transition-colors min-h-[44px] text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-[#0D9488] text-white flex items-center justify-center shrink-0" aria-hidden="true">
                <CalendarCheck className="w-4 h-4 text-white" />
              </div>
              <span>{lang === 'bn' ? 'কোটেশন রিকোয়েস্ট' : 'Request Free Quote'}</span>
            </button>
          )}

          {/* Direct Phone Call (#123047) */}
          <a
            href={`tel:${BUSINESS_CONFIG.phone}`}
            onClick={() => trackEvent('phone_click', { source: 'floating_widget' })}
            className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl bg-[#F5FAFC] hover:bg-[#E8F5F3] text-[#123047] border border-[#E2E8F0] text-xs font-bold transition-colors min-h-[44px]"
          >
            <div className="w-7 h-7 rounded-lg bg-[#123047] text-white flex items-center justify-center shrink-0" aria-hidden="true">
              <PhoneCall className="w-4 h-4 text-[#38BDF8]" />
            </div>
            <span>{BUSINESS_CONFIG.displayPhone}</span>
          </a>
        </div>
      )}

      {/* Main trigger button (#25D366) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-lg transition-all transform active:scale-95 cursor-pointer ring-4 ring-[#25D366]/20 focus-visible:outline-2 focus-visible:outline-[#25D366]"
        aria-label={isOpen ? "Close direct contact options" : "Open direct WhatsApp and phone contact options"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-6 h-6" aria-hidden="true" />
        ) : (
          <MessageCircle className="w-6 h-6 fill-white/20" aria-hidden="true" />
        )}
      </button>
    </div>
  );
};
