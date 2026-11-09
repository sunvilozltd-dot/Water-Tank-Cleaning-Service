import React from 'react';
import { 
  ArrowRight, 
  MessageCircle, 
  CalendarCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useServices } from '../utils/servicesStore';
import { trackWhatsAppClick, trackEvent } from '../utils/tracking';
import { OptimizedImage } from './OptimizedImage';

interface PopularServicesSectionProps {
  onOpenQuoteModal: (serviceName?: string) => void;
  onNavigate?: (path: string) => void;
}

export const PopularServicesSection: React.FC<PopularServicesSectionProps> = ({
  onOpenQuoteModal,
  onNavigate
}) => {
  const { lang } = useLanguage();
  const { business, images } = useSiteConfig();
  const { homepageServices } = useServices();

  const getWhatsAppUrl = (serviceName: string) => {
    const rawNumber = (business.whatsappNumber || '8801609999612').replace(/[^0-9]/g, '');
    const message = `আসসালামু আলাইকুম। আমি ${serviceName} নিতে আগ্রহী। আমার এলাকা: ঢাকা। অনুগ্রহ করে সার্ভিসের মূল্য ও বুকিং প্রক্রিয়া জানাবেন।`;
    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleBooking = (serviceName: string) => {
    trackEvent('service_booking_click', { service: serviceName });
    onOpenQuoteModal(serviceName);
  };

  const handleNavigateDetail = (slug: string) => {
    const path = `/services/${slug}`;
    trackEvent('service_details_click', { path });
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  // Popular Services: Strictly the 3 specialized water hygiene services
  const primaryServices = homepageServices.filter(service => {
    const slug = service.slug.toLowerCase();
    return (
      slug === 'overhead-water-tank-cleaning' ||
      slug === 'underground-water-tank-cleaning' ||
      slug === 'water-pipeline-cleaning' ||
      slug === 'water-tank-cleaning' ||
      slug === 'pipeline-cleaning' ||
      service.id === 'srv-overhead-water-tank' ||
      service.id === 'srv-underground-water-tank' ||
      service.id === 'srv-water-pipeline'
    );
  }).slice(0, 3);

  const displayedPopular = primaryServices.length > 0 ? primaryServices : homepageServices.slice(0, 3);

  return (
    <section 
      id="popular-services" 
      aria-labelledby="popular-services-heading"
      className="py-14 sm:py-20 bg-[#F5FAFC] border-b border-[#E2E8F0] relative overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#0D9488] uppercase mb-2.5 bg-[#E8F5F3] px-3.5 py-1 rounded-full border border-[#0D9488]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] animate-pulse" aria-hidden="true" />
            <span>{lang === 'bn' ? 'আমাদের সক্রিয় বিশেষায়িত সেবাসমূহ' : 'Our Specialized Services'}</span>
          </div>
          
          <h2 
            id="popular-services-heading" 
            className="text-2xl sm:text-3xl md:text-4xl font-black text-[#123047] tracking-tight"
          >
            {lang === 'bn' ? 'পেশাদার পানির ট্যাংক ও পাইপলাইন ক্লিনিং' : 'Professional Water Tank & Pipeline Cleaning'}
          </h2>
          
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#0D9488] to-transparent mx-auto my-3.5 rounded-full" />
          
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
            {lang === 'bn'
              ? 'বাসা, অ্যাপার্টমেন্ট ও বাণিজ্যিক ভবনের নিরাপদ ও বিশুদ্ধ পানি নিশ্চিত করতে আমাদের ৩টি প্রধান সক্রিয় সেবা।'
              : 'Our focused water hygiene services for residences, apartments, and commercial buildings across Dhaka.'}
          </p>
        </div>

        {/* Dynamic Responsive Grid: 3 columns on desktop, 1 or 2 on tablet/mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {displayedPopular.map((service, index) => {
            const title = lang === 'bn' ? (service.titleBn || service.title) : service.title;
            const titleEn = service.title;

            const cardImage = 
              service.image || 
              service.featured_image || 
              (service.slug.includes('overhead') ? (images?.popularTankImage || 'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg') :
               service.slug.includes('underground') ? (images?.popularUndergroundImage || 'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/services/underground-water-tank-cleaning_1794133736994.png') :
               service.slug.includes('pipeline') ? (images?.popularPipelineImage || 'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/services/water-pipeline-cleaning_1794133710278.jpg') :
               'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg');

            return (
              <article 
                key={service.id}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('button, a')) return;
                  handleNavigateDetail(service.slug);
                }}
                className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl border border-[#E2E8F0] hover:border-[#0D9488]/40 cursor-pointer"
              >
                <div>
                  {/* Service Image matching full width of card box */}
                  <div 
                    onClick={() => handleNavigateDetail(service.slug)}
                    className="relative w-full aspect-[16/10] sm:aspect-video overflow-hidden bg-[#F5FAFC] cursor-pointer"
                  >
                    <OptimizedImage
                      src={cardImage}
                      alt={title}
                      width={800}
                      height={500}
                      aspectRatio="16/10"
                      priority={index === 0}
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                    />
                  </div>

                  {/* Service Titles */}
                  <div 
                    onClick={() => handleNavigateDetail(service.slug)}
                    className="p-5 sm:p-6 pb-2 space-y-1.5 cursor-pointer"
                  >
                    <h3 className="text-lg sm:text-xl font-bold text-[#123047] group-hover:text-[#0D9488] transition-colors leading-snug">
                      {titleEn}
                    </h3>
                    {service.titleBn && (
                      <p className="text-sm font-semibold text-[#0D9488]">
                        {service.titleBn}
                      </p>
                    )}
                  </div>
                </div>

                {/* CTAs */}
                <div className="p-5 sm:p-6 pt-2 mt-auto">
                  <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* Primary Booking / Quote CTA: Fresh Teal #0D9488 */}
                    <button
                      type="button"
                      onClick={() => handleBooking(title)}
                      className="flex-1 min-h-[42px] px-3.5 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] active:scale-95 text-white font-bold text-xs tracking-wide shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{lang === 'bn' ? 'কোটেশন নিন' : 'Get Quote'}</span>
                    </button>

                    {/* Details Link button */}
                    <button
                      type="button"
                      onClick={() => handleNavigateDetail(service.slug)}
                      className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#F5FAFC] hover:bg-[#E8F5F3] text-[#123047] border border-[#E2E8F0] font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>{lang === 'bn' ? 'বিস্তারিত' : 'Details'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {/* WhatsApp button: #25D366 */}
                    <a
                      href={getWhatsAppUrl(title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackWhatsAppClick(`Card - ${service.title}`)}
                      className="min-h-[42px] px-3 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
                      title="WhatsApp"
                      aria-label={`WhatsApp for ${title}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
