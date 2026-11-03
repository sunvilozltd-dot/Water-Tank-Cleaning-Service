import React from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { QuoteForm } from '../components/QuoteForm';
import { Phone, Mail, MapPin, Clock, MessageCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { WHATSAPP_INT_NUMBER } from '../utils/whatsapp';

export const ContactPage: React.FC = () => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();

  return (
    <main className="min-h-screen bg-transparent text-[#172B3A] py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      <SeoHead
        title="Contact Sunviloz Clean Care - Water Tank Cleaning Hotline Dhaka"
        description="Get in touch with Sunviloz Clean Care for water tank cleaning in Dhaka. Call 01609-999612 or WhatsApp for instant service booking and quick response."
        canonicalUrl="https://water-tank-cleaning-service.vercel.app/contact"
      />
      <Breadcrumbs items={[{ label: lang === 'bn' ? 'যোগাযোগ' : 'Contact Us', href: '/contact' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="px-3 py-1 bg-[#E8F5F3] text-[#0D9488] border border-[#0D9488]/30 rounded-full text-xs font-bold inline-block">
              {lang === 'bn' ? '২৪/৭ কাস্টমার সাপোর্ট' : 'Customer Support'}
            </span>
            <h1 className="text-3xl font-extrabold text-[#123047] mt-3">
              {lang === 'bn' ? 'আমাদের সাথে যোগাযোগ করুন' : 'Get in Touch With Our Team'}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed">
              {lang === 'bn'
                ? 'পানির ট্যাংক সম্পর্কিত যেকোনো প্রশ্ন, সাইট ভিজিট বা ইনস্ট্যান্ট কোটেশনের জন্য কল বা হোয়াটসঅ্যাপ করতে পারেন।'
                : 'Have questions about water tank inspection, capacity calculations, or booking schedules? Reach out directly.'}
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <a
              href={`tel:${business.phone}`}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0D9488] transition-all shadow-sm hover:shadow-md"
            >
              <div className="p-2.5 rounded-xl bg-[#E8F5F3] text-[#0D9488]">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] block font-medium">Hotline (Available 8 AM - 10 PM)</span>
                <span className="text-base font-bold text-[#123047] font-mono">{business.phone}</span>
              </div>
            </a>

            <a
              href={`https://wa.me/${WHATSAPP_INT_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#25D366] transition-all shadow-sm hover:shadow-md"
            >
              <div className="p-2.5 rounded-xl bg-[#25D366]/15 text-[#25D366]">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] block font-medium">WhatsApp Direct Chat</span>
                <span className="text-base font-bold text-[#25D366] font-mono">+880 1609-999612</span>
              </div>
            </a>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
              <div className="p-2.5 rounded-xl bg-[#E8F5F3] text-[#0D9488]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] block font-medium">Main Operational Office</span>
                <span className="text-xs font-semibold text-[#123047]">{business.address}</span>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
              <div className="p-2.5 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] block font-medium">Operating Hours</span>
                <span className="text-xs font-semibold text-[#123047]">Saturday - Friday: 7:00 AM - 10:00 PM (Everyday)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-md">
            <h2 className="text-lg font-bold text-[#123047] mb-4">
              {lang === 'bn' ? 'সরাসরি কোটেশন রিকোয়েস্ট পাঠান' : 'Send Quick Booking Request'}
            </h2>
            <QuoteForm />
          </div>
        </div>
      </div>
    </main>
  );
};
