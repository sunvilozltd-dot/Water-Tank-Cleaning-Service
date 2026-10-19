import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  MessageCircle, 
  Calendar, 
  Layers, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { trackWhatsAppClick, trackEvent } from '../utils/tracking';

interface AboutPreviewSectionProps {
  onLearnMore?: () => void;
  onOpenQuoteModal?: () => void;
  onNavigate?: (path: string) => void;
}

export const AboutPreviewSection: React.FC<AboutPreviewSectionProps> = ({
  onLearnMore,
  onOpenQuoteModal = () => {},
  onNavigate
}) => {
  const { lang } = useLanguage();
  const { business, images } = useSiteConfig();

  const storyImage = images?.aboutStoryImage || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75';

  const handleGoServices = () => {
    trackEvent('about_cta_services_click', { source: 'about_section' });
    if (onNavigate) {
      onNavigate('/services');
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/services');
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  const rawNumber = (business.whatsappNumber || '8801609999612').replace(/[^0-9]/g, '');
  const waMessage = 'আসসালামু আলাইকুম। আমি SUNVILOZ Clean & Care-এর সেবা সম্পর্কে বিস্তারিত জানতে ও পরামর্শ পেতে চাই।';
  const whatsappUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <section 
      id="about-sunviloz" 
      aria-labelledby="about-sunviloz-heading"
      className="py-16 sm:py-24 bg-gradient-to-b from-[#051124] via-[#071933] to-[#040D1B] border-b border-cyan-900/35 relative overflow-hidden"
    >
      {/* Subtle water ambient glow */}
      <div 
        className="absolute top-1/4 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute bottom-10 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Two-Column Editorial Layout on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Brand Story */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Eyebrow Label */}
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-cyan-400 uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" aria-hidden="true" />
              <span>OUR STORY · EST. 2020</span>
            </div>

            {/* Main Heading */}
            <h2 
              id="about-sunviloz-heading" 
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-[1.25]"
            >
              {lang === 'bn' ? 'পরিচ্ছন্নতার প্রতিশ্রুতি, আস্থার সঙ্গে' : 'Commitment to Cleanliness, Built on Trust'}
            </h2>

            {/* Introduction Copy */}
            <div className="space-y-3.5 text-sm sm:text-base text-[#B8C0CC] leading-relaxed">
              <p>
                {lang === 'bn' ? (
                  <>
                    <strong className="text-white font-semibold">২০২০ সালে SUNVILOZ Clean &amp; Care-এর যাত্রা</strong> শুরু হয় একটি বাস্তব সমস্যা থেকে—ঢাকায় নির্ভরযোগ্য, মানসম্মত ও পেশাদার ক্লিনিং সার্ভিস খুঁজে পাওয়া অনেকের জন্যই ছিল কঠিন।
                  </>
                ) : (
                  <>
                    <strong className="text-white font-semibold">SUNVILOZ Clean &amp; Care began its journey in 2020</strong> addressing a genuine challenge in Dhaka—finding dependable, professional, and transparent cleaning services.
                  </>
                )}
              </p>
              <p>
                {lang === 'bn' 
                  ? 'কাজের মান নিয়ে অনিশ্চয়তা, অস্পষ্ট মূল্য নির্ধারণ, পরিষ্কারের উপকরণ সম্পর্কে পর্যাপ্ত তথ্যের অভাব এবং সেবার পর জবাবদিহিতার ঘাটতি আমাদের নতুনভাবে ভাবতে অনুপ্রাণিত করে।'
                  : 'Uncertainty over quality, ambiguous pricing, lack of proper cleaning specifications, and post-service accountability inspired us to rethink how cleaning services should be delivered.'}
              </p>
              <p className="text-white/95 font-medium">
                {lang === 'bn'
                  ? 'সেই ভাবনা থেকেই আমাদের লক্ষ্য—ক্লিনিং সার্ভিসকে আরও পেশাদার, স্বচ্ছ, যত্নশীল ও গ্রাহকবান্ধব করে তোলা।'
                  : 'From that conviction came our core mission—to make cleaning services professional, transparent, attentive, and customer-centered.'}
              </p>
            </div>

            {/* Subheading & Service Scope Description */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#11151B] border border-[#303743] space-y-2.5">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#28C76F]" aria-hidden="true" />
                <span>{lang === 'bn' ? 'আপনার বাসা ও কর্মক্ষেত্রের পরিচ্ছন্নতায় পেশাদার যত্ন' : 'Professional Care for Your Home & Workplace'}</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#B8C0CC] leading-relaxed">
                {lang === 'bn'
                  ? 'আমরা বাসা, অফিস, অ্যাপার্টমেন্ট ও বাণিজ্যিক স্থাপনার জন্য বিভিন্ন ধরনের ক্লিনিং সমাধান প্রদান করি। প্রতিটি সেবার প্রয়োজন অনুযায়ী উপযুক্ত সরঞ্জাম, পরিষ্কারের পদ্ধতি এবং দায়িত্বশীল কাজের মাধ্যমে পরিচ্ছন্নতার মান উন্নত করতে কাজ করি।'
                  : 'We deliver tailored cleaning solutions for residential homes, corporate offices, apartment complexes, and commercial properties with appropriate machinery and methodical practices.'}
              </p>
              <p className="text-xs sm:text-sm text-[#B8C0CC] leading-relaxed">
                {lang === 'bn'
                  ? 'আমাদের লক্ষ্য শুধু একটি জায়গা পরিষ্কার করা নয়; বরং গ্রাহকের জন্য ক্লিনিং সার্ভিস গ্রহণের অভিজ্ঞতাকে আরও সহজ, স্বচ্ছ ও স্বস্তিদায়ক করে তোলা।'
                  : 'Our goal is not merely surface cleaning, but making the entire service journey seamless, transparent, and reassuring for our clients.'}
              </p>
            </div>

            {/* Brand Promise Callout */}
            <div className="pl-4 border-l-2 border-cyan-400 py-1.5 bg-[#091D38]/60 rounded-r-xl pr-4">
              <blockquote className="text-xs sm:text-sm font-semibold text-white italic leading-relaxed">
                “{lang === 'bn' ? 'আমাদের কাছে প্রতিটি কাজ একটি দায়িত্ব, আর প্রতিটি গ্রাহকের আস্থা একটি মূল্যবান অর্জন।' : 'Every task to us is a responsibility, and every client’s trust is an invaluable milestone.'}”
              </blockquote>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Primary CTA: আমাদের সকল সেবা দেখুন */}
              <button
                type="button"
                onClick={handleGoServices}
                className="min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400"
              >
                <span>{lang === 'bn' ? 'আমাদের সকল সেবা দেখুন' : 'Explore All Services'}</span>
                <ArrowRight className="w-4 h-4 text-white" aria-hidden="true" />
              </button>

              {/* Secondary CTA: WhatsApp-এ যোগাযোগ করুন */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick({ source: 'about_story_cta' })}
                className="min-h-[48px] px-6 py-3 rounded-xl bg-[#091D38] hover:bg-[#0E284C] text-white border border-cyan-800/40 hover:border-emerald-500/60 font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 focus-visible:outline-2 focus-visible:outline-emerald-400"
                aria-label="Contact SUNVILOZ on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span>{lang === 'bn' ? 'WhatsApp-এ যোগাযোগ করুন' : 'Contact on WhatsApp'}</span>
              </a>
            </div>

          </div>

          {/* Right Column: Visual Storytelling */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-cyan-500/30 hover:border-cyan-400/60 bg-[#091D38] shadow-2xl transition-all duration-300 group">
              
              {/* High-quality professional cleaning imagery */}
              <div className="relative aspect-4/3 sm:aspect-5/4 overflow-hidden bg-[#080A0D]">
                <img
                  src={storyImage}
                  alt="SUNVILOZ Clean & Care professional cleaning team at work in Dhaka"
                  width="1200"
                  height="960"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                />
                
                {/* Subtle vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080A0D]/90 via-[#080A0D]/20 to-transparent" />
                
                {/* Quiet Floating Label */}
                <div className="absolute top-4 left-4 bg-[#080A0D]/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-[#303743] flex items-center gap-2 text-xs font-semibold text-white shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#2585FF]" aria-hidden="true" />
                  <span>Professional Cleaning Solutions</span>
                </div>



                {/* Bottom Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4 text-xs text-[#B8C0CC]">
                  <div className="p-3 rounded-xl bg-[#11151B]/85 backdrop-blur-md border border-[#303743]/80 space-y-1">
                    <p className="text-white font-bold text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#28C76F]" aria-hidden="true" />
                      <span>{lang === 'bn' ? 'পেশাদার সরঞ্জাম ও দায়িত্বশীল টিম' : 'Dedicated Team & Modern Equipment'}</span>
                    </p>
                    <p className="text-[11px] text-[#B8C0CC]">
                      {lang === 'bn' 
                        ? 'ঢাকা শহরের আবাসিক ও বাণিজ্যিক প্রাঙ্গণে নির্ভরযোগ্য পরিচ্ছন্নতা সেবা।' 
                        : 'Serving residential and commercial properties throughout Dhaka metro.'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Brand Highlights: 3 Compact Minimalist Items */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-[#303743] grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Highlight 1: ২০২০ থেকে যাত্রা */}
          <div className="p-5 rounded-2xl bg-[#171C24] border border-[#303743] hover:border-[#2585FF]/40 transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#202630] border border-[#303743] text-[#2585FF] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-white">
                {lang === 'bn' ? '২০২০ থেকে যাত্রা' : 'Journey Since 2020'}
              </h4>
              <p className="text-xs sm:text-sm text-[#B8C0CC] leading-relaxed">
                {lang === 'bn' ? 'গ্রাহককেন্দ্রিক ক্লিনিং সেবার যাত্রা।' : 'A steady journey focused on customer-first service.'}
              </p>
            </div>
          </div>

          {/* Highlight 2: বিভিন্ন ক্লিনিং সমাধান */}
          <div className="p-5 rounded-2xl bg-[#171C24] border border-[#303743] hover:border-[#2585FF]/40 transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#202630] border border-[#303743] text-[#28C76F] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-white">
                {lang === 'bn' ? 'বিভিন্ন ক্লিনিং সমাধান' : 'Versatile Cleaning Solutions'}
              </h4>
              <p className="text-xs sm:text-sm text-[#B8C0CC] leading-relaxed">
                {lang === 'bn' ? 'বাসা, অফিস ও বাণিজ্যিক স্থাপনার জন্য বিভিন্ন সেবা।' : 'Tailored cleaning for homes, offices, and commercial spaces.'}
              </p>
            </div>
          </div>

          {/* Highlight 3: যত্ন ও স্বচ্ছ যোগাযোগ */}
          <div className="p-5 rounded-2xl bg-[#171C24] border border-[#303743] hover:border-[#2585FF]/40 transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#202630] border border-[#303743] text-[#2585FF] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-white">
                {lang === 'bn' ? 'যত্ন ও স্বচ্ছ যোগাযোগ' : 'Care & Clear Communication'}
              </h4>
              <p className="text-xs sm:text-sm text-[#B8C0CC] leading-relaxed">
                {lang === 'bn' ? 'সেবার পরিধি, মূল্য এবং সময়সূচি সম্পর্কে পরিষ্কারভাবে যোগাযোগের অঙ্গীকার।' : 'Transparent scoping, clear pricing, and clear scheduling commitments.'}
              </p>
            </div>
          </div>

        </div>

      </div>


    </section>
  );
};

export default AboutPreviewSection;
