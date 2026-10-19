import React, { useState } from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SmartQuoteWizard } from '../components/SmartQuoteWizard';
import { DynamicServiceBookingModal } from '../components/DynamicServiceBookingModal';
import { useServices } from '../utils/servicesStore';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  MessageCircle, 
  Clock, 
  Layers, 
  Star,
  Check,
  MapPin,
  ChevronDown,
  Wrench,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { trackWhatsAppClick, trackEvent } from '../utils/tracking';

interface ServiceDetailPageProps {
  slug: string;
  onOpenQuoteModal: (serviceName?: string) => void;
  onNavigate?: (path: string) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({ 
  slug, 
  onOpenQuoteModal,
  onNavigate 
}) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();
  const { services } = useServices();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => prev === index ? null : index);
  };

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  // Find service by slug or match normalized slug
  const normalizedSlug = slug.replace(/-service$/, '');
  const service = services.find(s => 
    s.slug === slug || 
    s.slug === `${slug}-service` || 
    s.slug.replace(/-service$/, '') === normalizedSlug
  ) || services[0];

  if (!service) {
    return (
      <main className="min-h-screen bg-[#080A0D] text-white py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
        <button
          onClick={() => handleNavigate('/services')}
          className="px-6 py-2 bg-[#2585FF] text-white rounded-xl font-semibold"
        >
          View All Services
        </button>
      </main>
    );
  }

  const title = lang === 'bn' ? (service.titleBn || service.title) : service.title;
  const description = lang === 'bn' 
    ? (service.descriptionBn || service.shortDescBn || service.shortDesc || service.description)
    : (service.description || service.shortDesc || service.descriptionBn || '');

  const whyNeeded = lang === 'bn' ? service.whyNeededBn : service.whyNeeded;
  const benefits = (lang === 'bn' ? service.benefitsBn : service.benefits) || service.benefits || [
    'অভিজ্ঞ ও প্রশিক্ষিত টেকনিশিয়ান টিম',
    'উন্নতমানের আধুনিক ক্লিনিং ইকুইপমেন্ট',
    'পরিচ্ছন্নতার পর স্বাস্থ্যসম্মত পরিবেশ নিশ্চিতকরণ',
    'স্বচ্ছ ও নির্ধারিত সার্ভিস কোটেশন'
  ];

  const processSteps = (lang === 'bn' ? service.processBn : service.process) || service.process || [
    'প্রাথমিক মূল্যায়ন ও কাজের পরিধি নির্ধারণ',
    'উপযুক্ত যন্ত্রপাতি ও উপাদান প্রস্তুতকরণ',
    'সুনির্দিষ্ট ধাপে গভীর পরিচ্ছন্নতা পরিচালনা',
    'চূড়ান্ত পরিদর্শন এবং গ্রাহকের নিকট হস্তান্তর'
  ];

  const rawNumber = (business.whatsappNumber || '8801609999612').replace(/[^0-9]/g, '');
  const waMessage = `আসসালামু আলাইকুম। আমি SUNVILOZ Clean & Care-এর "${service.title}" সার্ভিস সম্পর্কে বিস্তারিত জানতে ও বুকিং করতে চাই।`;
  const whatsappUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent(waMessage)}`;

  // Service-specific FAQs fallback
  const faqs = (service.faqs && service.faqs.length > 0) ? service.faqs : [
    {
      question: `How is the price calculated for ${service.title}?`,
      questionBn: `${title} সার্ভিসের মূল্য কীভাবে নির্ধারিত হয়?`,
      answer: 'Price is transparently estimated based on property size, required materials, and the scope of work.',
      answerBn: 'কাজের পরিধি, স্থাপনার পরিমাপ এবং স্পেসিফিকেশনের ওপর ভিত্তি করে কাজের পূর্বেই স্পষ্ট লিখিত কোটেশন দেওয়া হয়।'
    },
    {
      question: 'How do I book or confirm a time slot?',
      questionBn: 'কীভাবে বুকিং কনফার্ম করব এবং পছন্দের সময়সূচি পাব?',
      answer: 'You can book through our online quote form or directly via WhatsApp message/call.',
      answerBn: 'আপনি সরাসরি অনলাইন কোটেশন ফর্ম পূরণ করে অথবা আমাদের WhatsApp নম্বরে বার্তা পাঠিয়ে সুবিধাজনক স্লটে বুকিং করতে পারেন।'
    },
    {
      question: 'Do you bring your own cleaning machines and supplies?',
      questionBn: 'ক্লিনিংয়ের জন্য প্রয়োজনীয় যন্ত্রপাতি ও কেমিক্যাল কি আপনারা সাথে নিয়ে আসেন?',
      answer: 'Yes, our team arrives fully equipped with specialized tools, solutions, and safety gear.',
      answerBn: 'হ্যাঁ, আমাদের টেকনিশিয়ান টিম প্রয়োজনীয় পেশাদার যন্ত্রপাতি, নিরাপদ ক্লিনিং সল্যুশন ও সেফটি গিয়ার সাথে নিয়ে আসে।'
    }
  ];

  // Related other services (excluding current)
  const relatedServices = services
    .filter(s => s.id !== service.id)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-[#080A0D] text-white py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-14">
      <SeoHead
        title={`${title} - SUNVILOZ Clean & Care Dhaka`}
        description={service.metaDesc || service.shortDesc || description}
        canonicalUrl={`https://sunvilozcleancare.com/services/${service.slug}`}
      />
      
      <Breadcrumbs 
        items={[
          { label: lang === 'bn' ? 'সার্ভিসসমূহ' : 'Services', href: '/services' },
          { label: title, href: `/services/${service.slug}` }
        ]} 
      />

      {/* 1. Hero Service Banner */}
      <section className="bg-[#11151B] border border-[#303743] rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2585FF]/15 border border-[#2585FF]/30 text-xs font-semibold text-[#2585FF]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'পেশাদার পরিচ্ছন্নতা সেবা' : 'Professional Cleaning Service'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              {title}
            </h1>

            {lang === 'bn' && service.title !== service.titleBn && (
              <p className="text-sm font-semibold text-[#2585FF]">
                {service.title}
              </p>
            )}

            <p className="text-sm sm:text-base text-[#B8C0CC] leading-relaxed max-w-2xl">
              {description}
            </p>

            {service.startingPrice && typeof service.startingPrice === 'number' && (
              <div className="inline-block px-4 py-2 bg-[#171C24] border border-[#303743] rounded-xl">
                <span className="text-xs text-[#B8C0CC] mr-2">{lang === 'bn' ? 'শুরু মাত্র:' : 'Starting from:'}</span>
                <span className="text-lg font-bold font-mono text-[#28C76F]">৳{service.startingPrice.toLocaleString()}</span>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  trackEvent('service_detail_booking', { service: service.title });
                  setIsCustomModalOpen(true);
                }}
                className="px-6 py-3.5 bg-[#2585FF] hover:bg-[#1a73e8] active:bg-[#1557b0] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#2585FF]/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{lang === 'bn' ? 'বুকিং ও কোটেশন নিন' : 'Book & Get Quote'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick({ source: `service_detail_${service.slug}` })}
                className="px-5 py-3.5 bg-[#28C76F]/15 hover:bg-[#28C76F]/25 text-[#28C76F] border border-[#28C76F]/40 font-bold text-sm rounded-xl transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#28C76F]" />
                <span>WhatsApp: {business.whatsappNumber || '01609999612'}</span>
              </a>

              <a
                href={`tel:${business.phone}`}
                className="px-5 py-3.5 bg-[#202630] hover:bg-[#2a3240] text-white font-bold text-sm rounded-xl border border-[#303743] transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-[#2585FF]" />
                <span>{business.displayPhone || business.phone}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-video lg:aspect-4/3 rounded-2xl overflow-hidden border border-[#303743] shadow-lg bg-[#080A0D]">
              <img
                src={service.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75'}
                alt={title}
                width="800"
                height="600"
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11151B]/80 via-transparent to-transparent" />
            </div>
          </div>

        </div>
      </section>

      {/* 2 & 3. Benefits & Why Needed */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#171C24] border border-[#303743] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2585FF]" />
            <span>{lang === 'bn' ? 'সার্ভিসের গুরুত্ব ও প্রয়োজনীয়তা' : 'Why This Service Is Essential'}</span>
          </h2>
          <p className="text-sm sm:text-base text-[#B8C0CC] leading-relaxed">
            {whyNeeded || description}
          </p>
        </div>

        <div className="bg-[#171C24] border border-[#303743] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-[#28C76F]" />
            <span>{lang === 'bn' ? 'আমাদের সার্ভিসের মূল সুবিধাসমূহ' : 'Key Service Benefits'}</span>
          </h2>
          <ul className="space-y-3">
            {benefits.map((benefit: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-[#B8C0CC]">
                <Check className="w-4 h-4 text-[#28C76F] shrink-0 mt-1" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4 & 5. Scope of Work & Cleaning Process */}
      <section className="bg-[#11151B] border border-[#303743] rounded-3xl p-6 sm:p-10 space-y-6">
        <div>
          <span className="text-xs font-bold text-[#2585FF] uppercase tracking-wider block mb-1">
            কার্যপ্রণালী
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            আমাদের সেবার কার্যপদ্ধতি (Process Steps)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {processSteps.map((step: string, idx: number) => (
            <div key={idx} className="p-5 rounded-xl bg-[#171C24] border border-[#303743] space-y-2">
              <span className="text-xs font-mono font-bold text-[#2585FF] block">পদক্ষেপ 0{idx + 1}</span>
              <p className="text-xs sm:text-sm text-white font-medium">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Pricing / Quote Calculator */}
      <div id="quote" className="space-y-4">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {lang === 'bn' ? 'তাৎক্ষণিক কোটেশন ও বুকিং' : 'Instant Quotation & Booking'}
          </h2>
          <p className="text-sm text-[#B8C0CC] mt-1">
            {lang === 'bn' ? 'আপনার স্থাপনার ধরন নির্বাচন করে সহজ কয়েকটি ধাপে আনুমানিক খরচ দেখুন' : 'Select your property type and get an instant transparent quote in seconds'}
          </p>
        </div>
        <SmartQuoteWizard />
      </div>

      {/* 7. Applicable Service Areas */}
      <section className="bg-[#11151B] border border-[#303743] rounded-2xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#2585FF] uppercase">
          <MapPin className="w-4 h-4" />
          <span>সার্ভিস কভারেজ</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white">
          ঢাকা মেট্রোপলিটন এলাকার যেকোনো স্থানে সার্ভিস উপলব্ধ
        </h3>
        <p className="text-xs sm:text-sm text-[#B8C0CC]">
          গুলশান, বনানী, বারিধারা, ধানমন্ডি, উত্তরা, মিরপুর, মোহাম্মদপুর, বাড্ডা, বসুন্ধরা আবাসিক, পুরান ঢাকাসহ সকল আবাসিক ও বাণিজ্যিক এলাকায় সার্ভিস পৌঁছানো হয়।
        </p>
      </section>

      {/* 8. Service-Specific FAQ Accordion (Deep linkable via #faq) */}
      <section id="faq" className="space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#2585FF] uppercase">
            <HelpCircle className="w-4 h-4" />
            <span>সচরাচর জিজ্ঞাসা</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {title} সংক্রান্ত সচরাচর জিজ্ঞাসিত প্রশ্নাবলী
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq: any, idx: number) => {
            const isOpen = openFaq === idx;
            const q = lang === 'bn' ? (faq.questionBn || faq.question) : faq.question;
            const a = lang === 'bn' ? (faq.answerBn || faq.answer) : faq.answer;

            return (
              <div key={idx} className="bg-[#171C24] border border-[#303743] rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-white hover:text-[#2585FF] flex items-center justify-between gap-4 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-[#2585FF] text-xs font-mono font-bold">Q{idx + 1}.</span>
                    <span>{q}</span>
                  </span>
                  <ChevronDown 
                    className={`w-4 h-4 text-[#B8C0CC] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#2585FF]' : ''}`} 
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#B8C0CC] leading-relaxed border-t border-[#303743]/50">
                    <p>{a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. WhatsApp Booking CTA Banner */}
      <section className="bg-gradient-to-r from-[#171C24] via-[#1c232e] to-[#171C24] border border-[#2585FF]/40 rounded-3xl p-6 sm:p-10 text-center space-y-5 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          {title} বুকিং করতে চান?
        </h2>
        <p className="text-sm text-[#B8C0CC] max-w-xl mx-auto">
          আমাদের এক্সপার্ট টিমের সাথে সরাসরি WhatsApp-এ বার্তা পাঠিয়ে সুবিধাজনক সময়সূচি নির্ধারণ করুন।
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick({ source: `service_cta_${service.slug}` })}
            className="px-8 py-3.5 bg-[#28C76F] hover:bg-[#22ab5f] text-slate-950 font-extrabold text-sm sm:text-base rounded-xl transition-all shadow-lg flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5 text-slate-950" />
            <span>WhatsApp-এ সরাসরি আলাপ করুন</span>
          </a>

          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="px-7 py-3.5 bg-[#2585FF] hover:bg-[#1a73e8] text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg cursor-pointer"
          >
            <span>{lang === 'bn' ? 'অনলাইন বুকিং ফর্ম' : 'Online Booking Form'}</span>
          </button>
        </div>
      </section>

      {/* 10. Related Services */}
      {relatedServices.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            সম্পর্কিত অন্যান্য সেবা
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {relatedServices.map((rel) => (
              <button
                key={rel.id}
                type="button"
                onClick={() => handleNavigate(`/services/${rel.slug}`)}
                className="p-5 rounded-2xl bg-[#171C24] border border-[#303743] hover:border-[#2585FF]/50 text-left transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <h3 className="font-bold text-white group-hover:text-[#2585FF] transition-colors text-base mb-1">
                    {lang === 'bn' ? (rel.titleBn || rel.title) : rel.title}
                  </h3>
                  <p className="text-xs text-[#B8C0CC] line-clamp-2">
                    {lang === 'bn' ? (rel.shortDescBn || rel.shortDesc) : rel.shortDesc}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-[#303743]/50 flex items-center justify-between text-xs font-semibold text-[#2585FF]">
                  <span>বিস্তারিত দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Service Custom Booking Modal */}
      <DynamicServiceBookingModal
        service={service}
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
      />

    </main>
  );
};

export default ServiceDetailPage;
