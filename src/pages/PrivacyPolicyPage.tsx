import React from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ShieldCheck, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PrivacyPolicyPageProps {
  onNavigate?: (path: string) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
  const { lang } = useLanguage();

  return (
    <main className="min-h-screen bg-[#080A0D] text-white py-10 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
      <SeoHead
        title={lang === 'bn' ? 'গোপনীয়তা নীতি | সানভিলোজ ক্লিন কেয়ার' : 'Privacy Policy - Sunviloz Clean Care Dhaka'}
        description="Privacy policy and data handling information for Sunviloz Clean Care in Dhaka."
        canonicalUrl="https://sunvilozcleancare.com/privacy-policy"
      />
      <Breadcrumbs items={[{ label: lang === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy', href: '/privacy-policy' }]} />

      <div className="bg-[#11151B] border border-[#303743] rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#28C76F]/15 text-[#28C76F] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {lang === 'bn' ? 'গোপনীয়তা নীতি (Privacy Policy)' : 'Privacy Policy'}
            </h1>
            <p className="text-xs text-[#B8C0CC]">
              {lang === 'bn' ? 'সর্বশেষ আপডেট: অক্টোবর ২০২৬' : 'Last Updated: October 2026'}
            </p>
          </div>
        </div>

        <div className="text-[#B8C0CC] text-xs sm:text-sm space-y-4 leading-relaxed border-t border-[#303743] pt-6">
          <p>
            {lang === 'bn'
              ? 'সানভিলোজ ক্লিন কেয়ার আপনার তথ্যের গোপনীয়তাকে সর্বোচ্চ গুরুত্ব দেয়। কোটেশন বা বুকিংয়ের সময় আপনার নাম, মোবাইল নম্বর এবং ভবনের ঠিকানা শুধুমাত্র সার্ভিস ডেলিভারি ও শিডিউল সমন্বয়ের জন্য ব্যবহৃত হয়।'
              : 'Your privacy is important to us. When you request a water tank cleaning quote, we collect your contact information (name, phone number, and building area) strictly for scheduling and service dispatch.'}
          </p>
          <p>
            {lang === 'bn'
              ? 'আমরা আপনার কোনো ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি, ভাড়া বা শেয়ার করি না।'
              : 'We do not sell, rent, or trade your personal information with any third-party marketing companies.'}
          </p>
          <p>
            {lang === 'bn'
              ? 'যেকোনো জিজ্ঞাসায় আমাদের সাথে সরাসরি 01609-999612 নম্বরে অথবা info@sunvilozcleancare.com ঠিকানায় যোগাযোগ করতে পারেন।'
              : 'If you have questions regarding data privacy, reach out to info@sunvilozcleancare.com or call 01609-999612.'}
          </p>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicyPage;
