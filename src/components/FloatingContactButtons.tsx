import React, { useState } from 'react';
import { MessageCircle, Send, X, PhoneCall, CalendarCheck } from 'lucide-react';
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
    <div className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2.5">
      {/* Expanded quick contact tray */}
      {isOpen && (
        <div 
          className="bg-[#08172C]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-cyan-500/30 p-3 flex flex-col gap-2 animate-fadeIn mb-1 min-w-[220px]"
          role="dialog"
          aria-label="Direct contact options"
        >
          {/* WhatsApp Direct */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('whatsapp_click', { source: 'floating_widget' })}
            className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors min-h-[44px]"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0" aria-hidden="true">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <span>{lang === 'bn' ? 'WhatsApp-এ আলাপ' : 'Chat on WhatsApp'}</span>
          </a>

          {/* Quick Quote Request */}
          {onOpenQuoteModal && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenQuoteModal();
              }}
              className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-colors min-h-[44px] text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-500 text-white flex items-center justify-center shrink-0" aria-hidden="true">
                <CalendarCheck className="w-4 h-4 text-white" />
              </div>
              <span>{lang === 'bn' ? 'কোটেশন রিকোয়েস্ট' : 'Request Free Quote'}</span>
            </button>
          )}

          {/* Direct Phone Call */}
          <a
            href={`tel:${BUSINESS_CONFIG.phone}`}
            onClick={() => trackEvent('phone_click', { source: 'floating_widget' })}
            className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl bg-[#061426] hover:bg-[#0A1E38] text-white border border-cyan-900/40 text-xs font-bold transition-colors min-h-[44px]"
          >
            <div className="w-7 h-7 rounded-lg bg-[#040D1A] text-cyan-400 flex items-center justify-center shrink-0" aria-hidden="true">
              <PhoneCall className="w-4 h-4 text-cyan-400" />
            </div>
            <span>{BUSINESS_CONFIG.displayPhone}</span>
          </a>
        </div>
      )}

      {/* Main trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 rounded-full bg-[#28C76F] hover:bg-[#22aa5e] text-white flex items-center justify-center shadow-2xl transition-all transform active:scale-95 cursor-pointer ring-4 ring-[#28C76F]/20 focus-visible:outline-2 focus-visible:outline-[#28C76F]"
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
