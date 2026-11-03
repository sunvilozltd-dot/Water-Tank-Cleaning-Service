import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  MessageCircle, 
  Calendar, 
  Layers
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { trackWhatsAppClick, trackEvent } from '../utils/tracking';
import { OptimizedImage } from './OptimizedImage';

interface AboutPreviewSectionProps {
  onLearnMore?: () => void;
  onOpenQuoteModal?: () => void;
  onNavigate?: (path: string) => void;
}

export const AboutPreviewSection: React.FC<AboutPreviewSectionProps> = ({
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
      className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Two-Column Editorial Layout on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Brand Story */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Eyebrow Label */}
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#0D9488] uppercase bg-[#E8F5F3] px-3.5 py-1 rounded-full border border-[#0D9488]/30">
              <span className="w-2 h-2 rounded-full bg-[#0D9488]" aria-hidden="true" />
              <span>OUR STORY · EST. 2020</span>
            </div>

            {/* Main Heading */}
            <h2 
              id="about-sunviloz-heading" 
              className="text-2xl sm:text-3xl md:text-4xl font-black text-[#123047] tracking-tight leading-[1.25]"
            >
              {lang === 'bn' ? 'পরিচ্ছন্নতার প্রতিশ্রুতি, আস্থার সঙ্গে' : 'Commitment to Cleanliness, Built on Trust'}
            </h2>

            {/* Introduction Copy */}
            <div className="space-y-3.5 text-sm sm:text-base text-[#64748B] leading-relaxed">
              <p>
                {lang === 'bn' ? (
                  <>
                    <strong className="text-[#123047] font-semibold">২০২০ সালে SUNVILOZ Clean &amp; Care-এর যাত্রা</strong> শুরু হয় একটি বাস্তব সমস্যা থেকে—ঢাকায় নির্ভরযোগ্য, মানসম্মত ও পেশাদার ক্লিনিং সার্ভিস খুঁজে পাওয়া অনেকের জন্যই ছিল কঠিন।
                  </>
                ) : (
                  <>
                    <strong className="text-[#123047] font-semibold">SUNVILOZ Clean &amp; Care began its journey in 2020</strong> addressing a genuine challenge in Dhaka—finding dependable, professional, and transparent cleaning services.
                  </>
                )}
              </p>
              <p>
                {lang === 'bn' 
                  ? 'কাজের মান নিয়ে অনিশ্চয়তা, অস্পষ্ট মূল্য নির্ধারণ, পরিষ্কারের উপকরণ সম্পর্কে পর্যাপ্ত তথ্যের অভাব এবং সেবার পর জবাবদিহিতার ঘাটতি আমাদের নতুনভাবে ভাবতে অনুপ্রাণিত করে।'
                  : 'Uncertainty over quality, ambiguous pricing, lack of proper cleaning specifications, and post-service accountability inspired us to rethink how cleaning services should be delivered.'}
              </p>
              <p className="text-[#172B3A] font-medium">
                {lang === 'bn'
                  ? 'সেই ভাবনা থেকেই আমাদের লক্ষ্য—ক্লিনিং সার্ভিসকে আরও পেশাদার, স্বচ্ছ, যত্নশীল ও গ্রাহকবান্ধব করে তোলা।'
                  : 'From that conviction came our core mission—to make cleaning services professional, transparent, attentive, and customer-centered.'}
              </p>
            </div>

            {/* Subheading & Service Scope Description */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#F5FAFC] border border-[#E2E8F0] space-y-2.5">
              <h3 className="text-base sm:text-lg font-bold text-[#123047] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" aria-hidden="true" />
                <span>{lang === 'bn' ? 'আপনার বাসা ও কর্মক্ষেত্রের পরিচ্ছন্নতায় পেশাদার যত্ন' : 'Professional Care for Your Home & Workplace'}</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                {lang === 'bn'
                  ? 'আমরা বাসা, অফিস, অ্যাপার্টমেন্ট ও বাণিজ্যিক স্থাপনার জন্য বিভিন্ন ধরনের ক্লিনিং সমাধান প্রদান করি। প্রতিটি সেবার প্রয়োজন অনুযায়ী উপযুক্ত সরঞ্জাম, পরিষ্কারের পদ্ধতি এবং দায়িত্বশীল কাজের মাধ্যমে পরিচ্ছন্নতার মান উন্নত করতে কাজ করি।'
                  : 'We deliver tailored cleaning solutions for residential homes, corporate offices, apartment complexes, and commercial properties with appropriate machinery and methodical practices.'}
              </p>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                {lang === 'bn'
                  ? 'আমাদের লক্ষ্য শুধু একটি জায়গা পরিষ্কার করা নয়; বরং গ্রাহকের জন্য ক্লিনিং সার্ভিস গ্রহণের অভিজ্ঞতাকে আরও সহজ, স্বচ্ছ ও স্বস্তিদায়ক করে তোলা।'
                  : 'Our goal is not merely surface cleaning, but making the entire service journey seamless, transparent, and reassuring for our clients.'}
              </p>
            </div>

            {/* Brand Promise Callout */}
            <div className="pl-4 border-l-4 border-[#0D9488] py-2 bg-[#E8F5F3]/50 rounded-r-xl pr-4">
              <blockquote className="text-xs sm:text-sm font-semibold text-[#123047] italic leading-relaxed">
                “{lang === 'bn' ? 'আমাদের কাছে প্রতিটি কাজ একটি দায়িত্ব, আর প্রতিটি গ্রাহকের আস্থা একটি মূল্যবান অর্জন।' : 'Every task to us is a responsibility, and every client’s trust is an invaluable milestone.'}”
              </blockquote>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Primary CTA: Fresh Teal #0D9488 */}
              <button
                type="button"
                onClick={handleGoServices}
                className="min-h-[48px] px-6 py-3 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] active:scale-95 text-white font-bold text-sm tracking-wide shadow-md shadow-[#0D9488]/20 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0D9488]"
              >
                <span>{lang === 'bn' ? 'আমাদের সকল সেবা দেখুন' : 'Explore All Services'}</span>
                <ArrowRight className="w-4 h-4 text-white" aria-hidden="true" />
              </button>

              {/* Secondary CTA: WhatsApp Green #25D366 */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick({ source: 'about_story_cta' })}
                className="min-h-[48px] px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm shadow-md shadow-[#25D366]/20 transition-all flex items-center justify-center gap-2 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#25D366]"
                aria-label="Contact SUNVILOZ on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-white" aria-hidden="true" />
                <span>{lang === 'bn' ? 'WhatsApp-এ যোগাযোগ করুন' : 'Contact on WhatsApp'}</span>
              </a>
            </div>

          </div>

          {/* Right Column: Visual Storytelling */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E2E8F0] bg-white shadow-xl transition-all duration-300 group">
              
              <div className="relative aspect-4/3 sm:aspect-5/4 overflow-hidden bg-[#F5FAFC]">
                <OptimizedImage
                  src={storyImage}
                  alt="SUNVILOZ Clean & Care professional cleaning team at work in Dhaka"
                  width={1200}
                  height={960}
                  aspectRatio="4/3"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                />
                
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] flex items-center gap-2 text-xs font-bold text-[#123047] shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#0D9488]" aria-hidden="true" />
                  <span>Professional Cleaning Solutions</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#E2E8F0] shadow-md space-y-1">
                    <p className="text-[#123047] font-bold text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
                      <span>{lang === 'bn' ? 'পেশাদার সরঞ্জাম ও দায়িত্বশীল টিম' : 'Dedicated Team & Modern Equipment'}</span>
                    </p>
                    <p className="text-[11px] text-[#64748B]">
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
        <div className="mt-12 sm:mt-16 pt-8 border-t border-[#E2E8F0] grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0D9488]/40 shadow-sm transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5F3] text-[#0D9488] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-[#123047]">
                {lang === 'bn' ? '২০২০ থেকে যাত্রা' : 'Journey Since 2020'}
              </h4>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                {lang === 'bn' ? 'গ্রাহককেন্দ্রিক ক্লিনিং সেবার যাত্রা।' : 'A steady journey focused on customer-first service.'}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0D9488]/40 shadow-sm transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5F3] text-[#0D9488] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-[#123047]">
                {lang === 'bn' ? 'বিভিন্ন ক্লিনিং সমাধান' : 'Versatile Cleaning Solutions'}
              </h4>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                {lang === 'bn' ? 'বাসা, অফিস ও বাণিজ্যিক স্থাপনার জন্য বিভিন্ন সেবা।' : 'Tailored cleaning for homes, offices, and commercial spaces.'}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0D9488]/40 shadow-sm transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5F3] text-[#0D9488] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-[#123047]">
                {lang === 'bn' ? 'যত্ন ও স্বচ্ছ যোগাযোগ' : 'Care & Clear Communication'}
              </h4>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
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
