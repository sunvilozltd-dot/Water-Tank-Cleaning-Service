import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  Droplet, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Wrench,
  Clock,
  Waves
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SendTankPhotoCta } from './SendTankPhotoCta';

interface CustomerProblemSectionProps {
  onOpenQuoteModal?: () => void;
  showPhotoCta?: boolean;
}

export const CustomerProblemSection: React.FC<CustomerProblemSectionProps> = ({
  onOpenQuoteModal,
  showPhotoCta = true
}) => {
  const { lang } = useLanguage();

  const problemsList = [
    {
      titleBn: 'ট্যাংকের নিচে কাদা জমে আছে',
      titleEn: 'Sludge & mud accumulation at the base',
      descBn: 'ওয়াসার পাইপলাইন বা ডিপ টিউবওয়েল থেকে আসা সূক্ষ্ম বালু ও পলি ট্যাংকের তলায় পুরু স্তর তৈরি করে।'
    },
    {
      titleBn: 'দেয়ালে শ্যাওলা বা buildup দেখা যাচ্ছে',
      titleEn: 'Algae or surface biofilm on walls',
      descBn: 'রোদে থাকা ওভারহেড পিভিসি ট্যাংকের ভেতরের দেয়ালে পিচ্ছিল সবুজ বা খয়েরি শ্যাওলার আস্তরণ তৈরি হয়।'
    },
    {
      titleBn: 'পানিতে গন্ধ হচ্ছে',
      titleEn: 'Unpleasant smell in stored water',
      descBn: 'তলদেশে কাদা ও জৈব পদার্থ দীর্ঘ সময় স্থির থাকায় গোসলের বা ব্যবহারের পানিতে গন্ধ সৃষ্টি হয়।'
    },
    {
      titleBn: 'পানিতে sediment দেখা যাচ্ছে',
      titleEn: 'Visible sediment or floating particles',
      descBn: 'ট্যাপ বা শাওয়ার চালু করলে লালচে, ঘোলা বা ছোট ছোট কণা ভেসে আসতে দেখা যায়।'
    },
    {
      titleBn: 'অনেকদিন ধরে ট্যাংক পরিষ্কার করা হয়নি',
      titleEn: 'Tank has not been cleaned in over 6 months',
      descBn: 'সাধারণ নিয়ম অনুযায়ী প্রতি ৪–৬ মাস অন্তর ডিপ ক্লিন না করলে ধীরে ধীরে পানি ধারণের স্বাস্থ্যসম্মত পরিবেশ ব্যাহত হয়।'
    },
    {
      titleBn: 'পাইপে flow কমে গেছে',
      titleEn: 'Reduced water flow in taps & showers',
      descBn: 'ট্যাংকের কাদা ও আয়রন কণা পানির আউটলেট লাইন ও ট্যাপের ফিল্টার নজলে আটকে স্বাভাবিক পানির গতি ব্যাহত করে।'
    },
    {
      titleBn: 'ট্যাংকের ভেতরে ময়লা জমেছে',
      titleEn: 'Dust, debris or loose lid contamination',
      descBn: 'বাতাস, ভাঙা ঢাকনা বা ওভারফ্লো পাইপের নিরাপত্তা জালি না থাকায় বাইরের ধুলাবালি ও ময়লা ভেতরে প্রবেশ করে।'
    }
  ];

  const educationalPoints = [
    {
      icon: Layers,
      titleBn: 'পলি ও বালুকণা জমা রোধ',
      titleEn: 'Sediment buildup prevention',
      descBn: 'ওয়াসার পানিতে থাকা অদৃশ্য ভারী খনিজ ও পলি তলদেশে জমতে না দিয়ে ট্যাংকের মোট ওয়াটার ক্যাপাসিটি শতভাগ কার্যকর রাখে।'
    },
    {
      icon: Waves,
      titleBn: 'পাইপলাইন ব্লকেজ সুরক্ষা',
      titleEn: 'Protects pipeline plumbing',
      descBn: 'ট্যাংকের স্লাজ ওয়াটার সাপ্লাই লাইনে নেমে বাথরুম ও কিচেন ফিটিংস, গিজার ও শাওয়ার নজলে জ্যাম তৈরি হওয়া থেকে রক্ষা করে।'
    },
    {
      icon: ShieldCheck,
      titleBn: 'পানির স্বাস্থ্যসম্মত ব্যবহার',
      titleEn: 'Hygienic everyday water',
      descBn: 'রান্নাবান্না, থালাবাসন ধোয়া ও গোসলের জন্য ব্যবহৃত পানির উৎসকে ব্যাকটেরিয়া ও শ্যাওলামুক্ত রাখতে সাহায্য করে।'
    },
    {
      icon: Sparkles,
      titleBn: 'ট্যাংকের দীর্ঘস্থায়িত্ব',
      titleEn: 'Extends storage tank lifespan',
      descBn: 'পিভিসি বা আরসিসি কাঠামোর ক্ষয়রোধ করে পানির ট্যাংকের স্বাভাবিক আয়ুষ্কাল বহু বছর বৃদ্ধি করে।'
    },
    {
      icon: Wrench,
      titleBn: 'পাম্প ও মোটরের চাপ হ্রাস',
      titleEn: 'Reduces strain on water pumps',
      descBn: 'ট্যাংক ও লাইনে অতিরিক্ত আয়রন ও স্লাজ আটকে মোটরের উপর অপ্রয়োজনীয় চাপ সৃষ্টি হওয়া থেকে বিরত রাখে।'
    },
    {
      icon: Clock,
      titleBn: 'সাশ্রয়ী দীর্ঘমেয়াদী সমাধান',
      titleEn: 'Cost-effective preventive care',
      descBn: 'হঠাৎ পাইপ পরিবর্তন বা বড় ধরণের প্লাম্বিং মেরামতের ব্যয়বহুল খরচ থেকে আপনাকে নিরাপদে রাখে।'
    }
  ];

  return (
    <section className="py-12 bg-transparent text-[#172B3A]">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* 1. Customer Problems Section */}
        <div className="space-y-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#0D9488] uppercase mb-2 bg-[#E8F5F3] px-3 py-1 rounded-full border border-[#0D9488]/30">
              <AlertCircle className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
              <span>{lang === 'bn' ? 'সাধারণ সমস্যাসমূহ' : 'Common Water Tank Problems'}</span>
            </div>

            <h2 
              id="customer-problem-heading" 
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#123047] tracking-tight"
            >
              {lang === 'bn' ? 'আপনার ট্যাংকে কি এই সমস্যাগুলো আছে?' : 'Does Your Water Tank Have These Issues?'}
            </h2>

            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#0D9488] to-transparent mx-auto my-3.5 rounded-full" />

            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
              {lang === 'bn'
                ? 'দৈনন্দিন ব্যবহারে নিচের যেকোনো লক্ষণ দেখা দিলে আপনার পানির ট্যাংক ও পাইপলাইনের জন্য একটি পেশাদার ডিপ ক্লিনিং প্রয়োজন।'
                : 'If you notice any of these signs in your residential or commercial building, a professional deep clean is recommended.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {problemsList.map((item, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0D9488]/50 transition-all flex items-start gap-3.5 group shadow-sm hover:shadow-md"
              >
                <div className="w-8 h-8 rounded-lg bg-[#E8F5F3] border border-[#0D9488]/30 text-[#0D9488] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#0D9488] group-hover:text-white transition-colors">
                  <span className="text-xs font-bold font-mono">0{idx + 1}</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-[#123047] leading-snug">
                    {lang === 'bn' ? item.titleBn : item.titleEn}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {lang === 'bn' ? item.descBn : item.descBn}
                  </p>
                </div>
              </div>
            ))}

            {/* Quick Solution Card */}
            <div className="p-5 rounded-2xl bg-[#E8F5F3] border border-[#0D9488]/40 flex flex-col justify-between shadow-sm">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider block">
                  {lang === 'bn' ? 'সানভিলোজ সমাধান' : 'Professional Care'}
                </span>
                <h3 className="text-base font-bold text-[#123047]">
                  {lang === 'bn' ? 'সরাসরি পরিদর্শন ও সাশ্রয়ী কোটেশন' : 'Inspection & Quotation'}
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {lang === 'bn'
                    ? 'আমাদের অভিজ্ঞ টিম ঢাকা শহরের প্রতিটি এলাকায় নির্ধারিত শিডিউলে দ্রুত সেবা প্রদান করে।'
                    : 'Our team coordinates with building committees and homeowners for scheduled tank cleaning.'}
                </p>
              </div>

              {onOpenQuoteModal && (
                <button
                  type="button"
                  onClick={onOpenQuoteModal}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#0D9488]/20"
                >
                  <span>{lang === 'bn' ? 'কোটেশন রিকোয়েস্ট করুন' : 'Request a Quote'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Educational Section */}
        <div className="pt-10 border-t border-[#E2E8F0] space-y-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#16A34A] uppercase mb-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" aria-hidden="true" />
              <span>{lang === 'bn' ? 'সচেতনতা ও যত্ন' : 'Water Storage Maintenance'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#123047] tracking-tight">
              {lang === 'bn' ? 'নিয়মিত ট্যাংক পরিষ্কার কেন গুরুত্বপূর্ণ?' : 'Why Regular Water Tank Cleaning is Important'}
            </h2>

            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#16A34A] to-transparent mx-auto my-3.5 rounded-full" />

            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
              {lang === 'bn'
                ? 'পানির ট্যাংক নিয়মিত পরিষ্কার রাখা একটি দায়িত্বশীল গৃহস্থালি ও ভবন রক্ষণাবেক্ষণ প্রক্রিয়া।'
                : 'Routine tank cleaning prevents thick sludge buildup and maintains proper water storage performance.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {educationalPoints.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#16A34A]/40 transition-all space-y-3 shadow-sm hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-[#16A34A] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#123047]">
                    {lang === 'bn' ? item.titleBn : item.titleEn}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {lang === 'bn' ? item.descBn : item.descBn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Send Tank Photo Feature */}
        {showPhotoCta && (
          <div className="pt-6">
            <SendTankPhotoCta source="customer_problem_section" />
          </div>
        )}

      </div>
    </section>
  );
};

export default CustomerProblemSection;
