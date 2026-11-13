import React from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { QuoteForm } from '../components/QuoteForm';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { WHATSAPP_INT_NUMBER } from '../utils/whatsapp';
import { trackGoogleMapsClick, trackGoogleReviewClick, trackPhoneClick, trackWhatsAppClick } from '../utils/tracking';

export const ContactPage: React.FC = () => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();
  const showVerifiedGbp = Boolean(
    business?.gbpVerified &&
      (business?.googleMapsDirectionsUrl || business?.googleReviewsUrl || business?.googleBusinessProfileUrl)
  );

  return (
    <main className="min-h-screen bg-transparent text-[#172B3A] py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      <SeoHead
        title="Contact Us | SUNVILOZ CLEAN CARE — Hotline 01609999612"
        description="Contact SUNVILOZ CLEAN CARE for water tank and pipeline cleaning in Dhaka, Narayanganj, Gazipur & Savar. Call 01609999612 or WhatsApp for quick quotation."
        canonicalUrl="https://sunvilozcleancare.com/contact"
        breadcrumbs={[
          { name: lang === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: lang === 'bn' ? 'যোগাযোগ' : 'Contact Us', path: '/contact' }
        ]}
      />
      <Breadcrumbs items={[{ label: lang === 'bn' ? 'যোগাযোগ' : 'Contact Us', href: '/contact' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="px-3 py-1 bg-[#E8F5F3] text-[#0D9488] border border-[#0D9488]/30 rounded-full text-xs font-bold inline-block">
              {lang === 'bn' ? 'গ্রাহক সহায়তা কেন্দ্র' : 'Customer Support'}
            </span>
            <h1 className="text-3xl font-extrabold text-[#123047] mt-3">
              {lang === 'bn' ? 'আমাদের সাথে যোগাযোগ করুন' : 'Get in Touch With Our Team'}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed">
              {lang === 'bn'
                ? 'পানির ট্যাংক পরিষ্কার সম্পর্কিত যেকোনো প্রশ্ন, সাইট ভিজিট বা তাৎক্ষণিক কোটেশনের জন্য সরাসরি কল বা WhatsApp করতে পারেন।'
                : 'Have questions about water tank inspection, capacity estimates, or scheduling in Dhaka, Narayanganj, Gazipur, or Savar? Reach out directly.'}
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <a
              href={`tel:${business.phone}`}
              onClick={() => trackPhoneClick({ source: 'contact_page_phone' })}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0D9488] transition-all shadow-sm hover:shadow-md"
            >
              <div className="p-2.5 rounded-xl bg-[#E8F5F3] text-[#0D9488]">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] block font-medium">
                  {lang === 'bn' ? 'সরাসরি কল করুন (সকাল ৮টা – রাত ১০টা)' : 'Call Direct (8:00 AM - 10:00 PM)'}
                </span>
                <span className="text-base font-bold text-[#123047] font-mono">{business.phone}</span>
              </div>
            </a>

            <a
              href={`https://wa.me/${WHATSAPP_INT_NUMBER}?text=${encodeURIComponent('আসসালামু আলাইকুম। আমি পানির ট্যাংক পরিষ্কার সার্ভিসের কোটেশন জানতে চাই।')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick({ source: 'contact_page_whatsapp' })}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#25D366] transition-all shadow-sm hover:shadow-md"
            >
              <div className="p-2.5 rounded-xl bg-[#25D366]/15 text-[#25D366]">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] block font-medium">
                  {lang === 'bn' ? 'WhatsApp-এ কোটেশন নিন' : 'Get WhatsApp Quotation'}
                </span>
                <span className="text-base font-bold text-[#25D366] font-mono">+880 1609-999612</span>
              </div>
            </a>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
              <div className="p-2.5 rounded-xl bg-[#E8F5F3] text-[#0D9488]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] block font-medium">
                  {lang === 'bn' ? 'সার্ভিস অঞ্চলসমূহ' : 'Primary Service Regions'}
                </span>
                <span className="text-xs font-semibold text-[#123047]">
                  {lang === 'bn' ? 'ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভার' : (business.address || 'Dhaka, Narayanganj, Gazipur & Savar')}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
              <div className="p-2.5 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] block font-medium">Operating Hours</span>
                <span className="text-xs font-semibold text-[#123047]">
                  {lang === 'bn' ? (business.operatingHoursBn || 'প্রতিদিন সকাল ৮:০০টা – রাত ১০:০০টা') : (business.operatingHours || 'Saturday - Friday: 8:00 AM - 10:00 PM')}
                </span>
              </div>
            </div>

            {business.email && (
              <a
                href={`mailto:${business.email}`}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0D9488] transition-all shadow-sm"
              >
                <div className="p-2.5 rounded-xl bg-[#E8F5F3] text-[#0D9488]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-[#64748B] block font-medium">Email Support</span>
                  <span className="text-xs font-semibold text-[#123047]">{business.email}</span>
                </div>
              </a>
            )}

            {/* Google Business Profile & Directions Card (Shown strictly after GBP verification) */}
            {showVerifiedGbp && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-[#F5FAFC] border border-[#E2E8F0] shadow-sm space-y-3">
                <span className="text-[11px] font-bold text-[#0D9488] uppercase tracking-wider block">
                  Google Business Profile
                </span>
                <div className="flex flex-wrap gap-2">
                  {(business.googleMapsDirectionsUrl || business.googleBusinessProfileUrl) && (
                    <a
                      href={business.googleMapsDirectionsUrl || business.googleBusinessProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackGoogleMapsClick({ source: 'contact_gbp_maps' })}
                      className="px-3 py-2 rounded-xl bg-[#123047] hover:bg-[#1b4363] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>View Google Profile</span>
                    </a>
                  )}
                  {business.googleReviewsUrl && (
                    <a
                      href={business.googleReviewsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackGoogleReviewClick({ source: 'contact_gbp_reviews' })}
                      className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>⭐ Write a Google Review</span>
                    </a>
                  )}
                </div>
              </div>
            )}
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
