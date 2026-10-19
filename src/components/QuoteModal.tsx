import React, { useEffect, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';
import { QuoteForm } from './QuoteForm';
import { useLanguage } from '../context/LanguageContext';

interface QuoteModalProps {
  isOpen?: boolean;
  onClose: () => void;
  serviceName?: string;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen = true,
  onClose,
  serviceName
}) => {
  const { lang } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#020712]/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="quote-modal-title"
    >
      {/* Modal Dialog Card */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-xl bg-[#08172C] text-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] my-auto animate-fadeIn border border-cyan-500/30 border-t-2 border-t-cyan-400"
      >
        {/* Sticky Fixed Header with ALWAYS VISIBLE Close Button */}
        <div className="sticky top-0 z-40 bg-[#061426]/98 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-cyan-900/40 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <h3 id="quote-modal-title" className="font-extrabold text-sm sm:text-base text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span>{lang === 'bn' ? 'ফ্রি কোটেশন ও বুকিং রিকোয়েস্ট' : 'Free Quotation & Service Booking'}</span>
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#0D2444] hover:bg-[#12315C] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#08172C]">
          <QuoteForm
            initialService={serviceName}
            sourceContext={serviceName ? `Modal Booking - ${serviceName}` : 'Modal Quote Request'}
            compact={true}
            onSuccess={() => {
              setTimeout(() => {
                onClose();
              }, 4000);
            }}
            onCloseModal={onClose}
          />
        </div>
      </div>
    </div>
  );
};
