import React from 'react';
import { Camera, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { trackWhatsAppClick, trackEvent } from '../utils/tracking';

interface SendTankPhotoCtaProps {
  className?: string;
  source?: string;
  compact?: boolean;
}

export const SendTankPhotoCta: React.FC<SendTankPhotoCtaProps> = ({
  className = '',
  source = 'tank_photo_banner',
  compact = false
}) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();

  const rawWhatsapp = (business.whatsappNumber || '8801609999612').replace(/[^0-9]/g, '');
  const message = 'আমি পানির ট্যাংক পরিষ্কারের quotation জানতে চাই। ট্যাংকের ছবি সংযুক্ত করছি।';
  const whatsappUrl = `https://wa.me/${rawWhatsapp}?text=${encodeURIComponent(message)}`;

  const handleClick = () => {
    trackEvent('send_tank_photo_click', { source });
    trackWhatsAppClick({ source: `tank_photo_${source}` });
  };

  if (compact) {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#28C76F]/15 hover:bg-[#28C76F]/25 text-[#28C76F] border border-[#28C76F]/40 font-bold text-xs sm:text-sm transition-all active:scale-95 ${className}`}
        aria-label="Send tank photo on WhatsApp for instant quote"
      >
        <Camera className="w-4 h-4 text-[#28C76F]" aria-hidden="true" />
        <span>{lang === 'bn' ? 'ট্যাংকের ছবি পাঠিয়ে কোটেশন নিন' : 'Send Tank Photo on WhatsApp'}</span>
      </a>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#11151B] to-[#171C24] border border-[#303743] hover:border-[#28C76F]/50 p-6 sm:p-8 transition-all shadow-xl group ${className}`}
    >
      {/* Background soft glow */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 bg-[#28C76F]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#28C76F]/10 transition-colors"
        aria-hidden="true" 
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#28C76F]/10 border border-[#28C76F]/30 text-xs font-bold text-[#28C76F] uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5 text-[#28C76F]" aria-hidden="true" />
            <span>{lang === 'bn' ? 'ছবি দেখে তাৎক্ষণিক কোটেশন' : 'Fast Photo Estimate'}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {lang === 'bn' ? 'ট্যাংকের ছবি পাঠিয়ে কোটেশন নিন' : 'Send Tank Photo on WhatsApp for Instant Quote'}
          </h3>

          <p className="text-xs sm:text-sm text-[#B8C0CC] leading-relaxed">
            {lang === 'bn'
              ? 'ট্যাংকের ক্যাপাসিটি নিশ্চিত না হলে বা দ্রুত আনুমানিক খরচ জানতে আপনার ট্যাংকের ১-২টি ছবি সরাসরি আমাদের WhatsApp-এ পাঠান। আমাদের বিশেষজ্ঞ দল দ্রুত পর্যালোচনা করে কোটেশন জানিয়ে দেবে।'
              : 'Not sure about your tank capacity? Send 1-2 photos of your tank via WhatsApp. Our team will review accessibility and condition to provide an accurate estimate.'}
          </p>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="min-h-[50px] px-6 py-3.5 rounded-xl bg-[#28C76F] hover:bg-[#22aa5e] active:bg-[#1d8f50] text-white font-extrabold text-sm sm:text-base tracking-wide shadow-lg shadow-[#28C76F]/20 flex items-center justify-center gap-2.5 whitespace-nowrap active:scale-95 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#28C76F]"
        >
          <Camera className="w-4 h-4 text-white" aria-hidden="true" />
          <span>{lang === 'bn' ? 'ট্যাংকের ছবি পাঠিয়ে কোটেশন নিন' : 'Send Tank Photo on WhatsApp'}</span>
          <ArrowRight className="w-4 h-4 text-white" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
};

export default SendTankPhotoCta;
