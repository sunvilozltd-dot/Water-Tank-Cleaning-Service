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
    <main className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      <SeoHead
        title="Contact Sunviloz Clean Care - Water Tank Cleaning Hotline Dhaka"
        description="Get in touch with Sunviloz Clean Care for water tank cleaning in Dhaka. Call 01609-999612 or WhatsApp for instant service booking and quick response."
        canonicalUrl="https://sunvilozcleancare.com/contact"
      />
      <Breadcrumbs items={[{ label: lang === 'bn' ? 'যোগাযোগ' : 'Contact Us', href: '/contact' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-semibold">
              {lang === 'bn' ? '২৪/৭ কাস্টমার সাপোর্ট' : 'Customer Support'}
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-3">
              {lang === 'bn' ? 'আমাদের সাথে যোগাযোগ করুন' : 'Get in Touch With Our Team'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {lang === 'bn'
                ? 'পানির ট্যাংক সম্পর্কিত যেকোনো প্রশ্ন, সাইট ভিজিট বা ইনস্ট্যান্ট কোটেশনের জন্য কল বা হোয়াটসঅ্যাপ করতে পারেন।'
                : 'Have questions about water tank inspection, capacity calculations, or booking schedules? Reach out directly.'}
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <a
              href={`tel:${business.phone}`}
              className="flex items-start gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 transition-colors"
            >
              <div className="p-2.5 rounded-lg bg-blue-600/20 text-blue-400">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Hotline (Available 8 AM - 10 PM)</span>
                <span className="text-base font-bold text-white font-mono">{business.phone}</span>
              </div>
            </a>

            <a
              href={`https://wa.me/${WHATSAPP_INT_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 transition-colors"
            >
              <div className="p-2.5 rounded-lg bg-emerald-600/20 text-emerald-400">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">WhatsApp Direct Chat</span>
                <span className="text-base font-bold text-emerald-400 font-mono">+880 1609-999612</span>
              </div>
            </a>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="p-2.5 rounded-lg bg-cyan-600/20 text-cyan-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Main Operational Office</span>
                <span className="text-xs text-white">{business.address}</span>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="p-2.5 rounded-lg bg-amber-600/20 text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Operating Hours</span>
                <span className="text-xs text-white">Saturday - Friday: 7:00 AM - 10:00 PM (Everyday)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-white mb-4">
            {lang === 'bn' ? 'সরাসরি কোটেশন রিকোয়েস্ট পাঠান' : 'Send Quick Booking Request'}
          </h2>
          <QuoteForm />
        </div>
      </div>
    </main>
  );
};
