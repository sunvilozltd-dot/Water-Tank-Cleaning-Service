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
    <main className="min-h-screen bg-[#080A0D] text-white py-10 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
      <SeoHead
        title={lang === 'bn' ? 'শর্তাবলী | সানভিলোজ ক্লিন কেয়ার' : 'Terms & Conditions - Sunviloz Clean Care Dhaka'}
        description="Terms and conditions for water tank cleaning services provided by Sunviloz Clean Care in Dhaka."
        canonicalUrl="https://sunvilozcleancare.com/terms"
      />
      <Breadcrumbs items={[{ label: lang === 'bn' ? 'শর্তাবলী' : 'Terms & Conditions', href: '/terms' }]} />

      <div className="bg-[#11151B] border border-[#303743] rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2585FF]/15 text-[#2585FF] flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {lang === 'bn' ? 'সেবার নিয়ম ও শর্তাবলী' : 'Terms of Service'}
            </h1>
            <p className="text-xs text-[#B8C0CC]">
              {lang === 'bn' ? 'সর্বশেষ আপডেট: অক্টোবর ২০২৬' : 'Last Updated: October 2026'}
            </p>
          </div>
        </div>

        <div className="text-[#B8C0CC] text-xs sm:text-sm space-y-5 leading-relaxed border-t border-[#303743] pt-6">
          <p>
            {lang === 'bn' 
              ? 'সানভিলোজ ক্লিন কেয়ারে স্বাগতম। আমাদের ওয়াটার ট্যাংক বা পাইপলাইন ক্লিনিং সেবা বুকিং করার মাধ্যমে আপনি নিচের সেবামূলক নীতিমালা মেনে নিচ্ছেন।' 
              : 'Welcome to Sunviloz Clean Care. By requesting a service or quotation, you agree to these operational terms.'}
          </p>

          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2585FF]" />
              <span>{lang === 'bn' ? '১. সাইট পরিদর্শন ও প্রবেশাধিকার' : '1. Service Execution & Site Access'}</span>
            </h3>
            <p>
              {lang === 'bn'
                ? 'ক্লায়েন্ট বা ভবন কর্তৃপক্ষ ছাদ, আন্ডারগ্রাউন্ড রিজার্ভার এবং বিদ্যুৎ ও পানি নিষ্কাশনের ড্রেইনেজে অনুমোদিত প্রবেশাধিকার প্রদান করবেন।'
                : 'Clients are requested to grant authorized access to rooftops, reservoirs, and standard electrical supply for operating jet wash equipment.'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2585FF]" />
              <span>{lang === 'bn' ? '২. কোটেশন ও চূড়ান্ত মূল্য নির্ধারণ' : '2. Quotation & Pricing Confirmation'}</span>
            </h3>
            <p>
              {lang === 'bn'
                ? 'অনলাইন বা ফোনের প্রাথমিক কোটেশন ট্যাংকের সাধারণ ধারণক্ষমতার ওপর ভিত্তি করে আনুমানিক খরচ নির্দেশ করে। কাদার অস্বাভাবিক গভীরতা বা জটিল প্রবেশপথ থাকলে কাজ শুরুর পূর্বেই ক্লায়েন্টকে চূড়ান্ত মূল্য স্পষ্ট করা হবে।'
                : 'Initial automated calculations serve as upfront estimates. Complex structural access or severely degraded infrastructure will be confirmed before commencement.'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#28C76F]" />
              <span>{lang === 'bn' ? '৩. স্বাস্থ্য নিরাপত্তা ও ফুড-গ্রেড জীবাণুমুক্তকরণ' : '3. Safety & Food-Grade Sanitization Standards'}</span>
            </h3>
            <p>
              {lang === 'bn'
                ? 'আমরা মানুষের স্বাস্থ্য ও খাবার পানির জন্য সম্পূর্ণ নিরাপদ, অনুমোদিত ফুড-গ্রেড ও দুর্গন্ধহীন জীবাণুনাশক ব্যবহার করি যা খাওয়ার পানির মান সম্পূর্ণ অক্ষুণ্ণ রাখে।'
                : 'We use non-toxic, certified food-grade safe antibacterial formulations compliant with drinking water sanitation guidelines, leaving zero harsh chemical odors.'}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TermsPage;
