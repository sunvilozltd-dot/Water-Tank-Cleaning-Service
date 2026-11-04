import React, { useEffect, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';
import { QuoteForm } from './QuoteForm';
import { FastMobileQuoteForm } from './FastMobileQuoteForm';
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
  const [formMode, setFormMode] = React.useState<'fast' | 'detailed'>('fast');

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
      className="fixed inset-0 z-50 bg-[#123047]/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
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
        className="relative w-full max-w-xl bg-white text-[#172B3A] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] my-auto animate-fadeIn border border-[#E2E8F0] border-t-4 border-t-[#0D9488]"
      >
        {/* Sticky Header with Mode Toggle & Close Button */}
        <div className="sticky top-0 z-40 bg-white/98 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-[#E2E8F0] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" aria-hidden="true" />
            <h3 id="quote-modal-title" className="font-bold text-sm sm:text-base text-[#123047] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
              <span>{lang === 'bn' ? 'ফ্রি কোটেশন রিকোয়েস্ট' : 'Free Quotation Request'}</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode switch pills */}
            <div className="hidden xs:flex bg-[#F5FAFC] p-1 rounded-xl border border-[#E2E8F0] text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setFormMode('fast')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  formMode === 'fast' ? 'bg-[#0D9488] text-white shadow-xs' : 'text-[#64748B] hover:text-[#123047]'
                }`}
              >
                {lang === 'bn' ? 'দ্রুত ফর্ম' : 'Fast Form'}
              </button>
              <button
                type="button"
                onClick={() => setFormMode('detailed')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  formMode === 'detailed' ? 'bg-[#0D9488] text-white shadow-xs' : 'text-[#64748B] hover:text-[#123047]'
                }`}
              >
                {lang === 'bn' ? 'উইজার্ড' : 'Wizard'}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-[#F5FAFC] hover:bg-[#E8F5F3] text-[#64748B] hover:text-[#172B3A] border border-[#E2E8F0] flex items-center justify-center transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0D9488]"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white">
          {formMode === 'fast' ? (
            <FastMobileQuoteForm
              initialService={serviceName}
              sourceContext={serviceName ? `Modal Fast Booking - ${serviceName}` : 'Modal Fast Quote'}
              onSuccess={() => {
                setTimeout(() => {
                  onClose();
                }, 4000);
              }}
              onClose={onClose}
            />
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};
