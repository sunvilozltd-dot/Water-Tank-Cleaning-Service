import React from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface TermsPageProps {
  onNavigate?: (path: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  const { lang } = useLanguage();

  return (
    <main className="min-h-screen bg-transparent text-[#172B3A] py-10 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
      <SeoHead
        title={lang === 'bn' ? 'শর্তাবলী | সানভিলোজ ক্লিন কেয়ার' : 'Terms & Conditions - Sunviloz Clean Care Dhaka'}
        description="Terms and conditions for water tank cleaning services provided by Sunviloz Clean Care in Dhaka."
        canonicalUrl="https://sunvilozcleancare.com/terms"
      />
      <Breadcrumbs items={[{ label: lang === 'bn' ? 'শর্তাবলী' : 'Terms & Conditions', href: '/terms' }]} />

      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-10 space-y-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F5F3] text-[#0D9488] border border-[#0D9488]/30 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123047]">
              {lang === 'bn' ? 'সেবার নিয়ম ও শর্তাবলী' : 'Terms of Service'}
            </h1>
            <p className="text-xs text-[#64748B]">
              {lang === 'bn' ? 'সর্বশেষ আপডেট: অক্টোবর ২০২৬' : 'Last Updated: October 2026'}
            </p>
          </div>
        </div>

        <div className="text-[#64748B] text-xs sm:text-sm space-y-5 leading-relaxed border-t border-[#E2E8F0] pt-6">
          <p>
            {lang === 'bn' 
              ? 'সানভিলোজ ক্লিন কেয়ারে স্বাগতম। আমাদের ওয়াটার ট্যাংক বা পাইপলাইন ক্লিনিং সেবা বুকিং করার মাধ্যমে আপনি নিচের সেবামূলক নীতিমালা মেনে নিচ্ছেন।' 
              : 'Welcome to Sunviloz Clean Care. By requesting a service or quotation, you agree to these operational terms.'}
          </p>

          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-[#123047] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
              <span>{lang === 'bn' ? '১. সাইট পরিদর্শন ও প্রবেশাধিকার' : '1. Service Execution & Site Access'}</span>
            </h3>
            <p>
              {lang === 'bn'
                ? 'ক্লায়েন্ট বা ভবন কর্তৃপক্ষ ছাদ, আন্ডারগ্রাউন্ড রিজার্ভার এবং বিদ্যুৎ ও পানি নিষ্কাশনের ড্রেইনেজে অনুমোদিত প্রবেশাধিকার প্রদান করবেন।'
                : 'Clients are requested to grant authorized access to rooftops, reservoirs, and standard electrical supply for operating jet wash equipment.'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-[#123047] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
              <span>{lang === 'bn' ? '২. কোটেশন ও চূড়ান্ত মূল্য নির্ধারণ' : '2. Quotation & Pricing Confirmation'}</span>
            </h3>
            <p>
              {lang === 'bn'
                ? 'অনলাইন বা ফোনে দেওয়া প্রাথমিক কোটেশন গ্রাহকের দেওয়া তথ্যের ওপর ভিত্তি করে হিসাব করা হয়। সাইটে এসে ট্যাংকের সাইজ বা অতিরিক্ত কোনো কাজ থাকলে তা কাজের পূর্বেই আলোচনার মাধ্যমে চূড়ান্ত করা হয়।'
                : 'Initial estimates are based on customer provided capacity. If the site demands extra work, adjustments are communicated before commencing work.'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-[#123047] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
              <span>{lang === 'bn' ? '৩. নিরাপত্তা ও স্বাস্থ্যবিধি' : '3. Safety & Hygiene Standards'}</span>
            </h3>
            <p>
              {lang === 'bn'
                ? 'আমরা কোনো ক্ষতিকর অ্যাসিড বা এসিডীয় গ্যাস নির্গতকারী পদার্থ ব্যবহার করি না। ক্লিনিং কাজে ফুড-গ্রেড অনুমোদিত স্যানিটাইজার ও মেকানিক্যাল ওয়াটার প্রেসার ব্যবহার করা হয়।'
                : 'We strictly prohibit toxic industrial acids. Only approved food-grade water sanitizers and controlled pressure jets are deployed.'}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TermsPage;
