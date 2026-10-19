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
      descBn: 'নিয়মিত পরিষ্কারে পাইপলাইন থেকে আসা সূক্ষ্ম বালু ও পলি দূর হয়, ফলে ট্যাংক তার আসল পানি ধারণক্ষমতা বজায় রাখে।'
    },
    {
      icon: Waves,
      titleBn: 'কাদার স্তর ও স্লাজ নিয়ন্ত্রণ',
      titleEn: 'Sludge accumulation control',
      descBn: 'ট্যাংকের তলদেশের জমাট বাঁধা কাদা সরিয়ে ফেললে মোটরের সাকশন পাইপে কাদা প্রবেশ বন্ধ থাকে।'
    },
    {
      icon: Sparkles,
      titleBn: 'শ্যাওলা ও বায়োফিল্ম দূরীকরণ',
      titleEn: 'Algae & biofilm management',
      descBn: 'দেয়ালে লেগে থাকা পিচ্ছিল আস্তরণ মেকানিক্যাল স্ক্রাবিং ও হাই-প্রেসার জেটে পরিষ্কার করে স্বাস্থ্যসম্মত রাখা যায়।'
    },
    {
      icon: Droplet,
      titleBn: 'পানির স্বাভাবিক স্বচ্ছতা ও গন্ধ বজায় রাখা',
      titleEn: 'Water appearance & odor maintenance',
      descBn: 'ট্যাংক পরিষ্কার থাকলে রান্নাবান্না, থালাবাসন ধোয়া ও গোসলের পানি থাকে স্বচ্ছ এবং অনাকাঙ্ক্ষিত দুর্গন্ধমুক্ত।'
    },
    {
      icon: Wrench,
      titleBn: 'স্যানিটারি ফিটিংসের আয়ু বৃদ্ধি',
      titleEn: 'Plumbing & fixtures protection',
      descBn: 'লাইনে বালু ও মরিচা না গেলে কনসিল্ড শাওয়ার, গিজার, ট্যাপ ও ওয়াশিং মেশিনের সলিনয়েড ভালভ দীর্ঘস্থায়ী হয়।'
    },
    {
      icon: Clock,
      titleBn: 'নিয়মিত রক্ষণাবেক্ষণ ও সাশ্রয়',
      titleEn: 'Routine preventive maintenance',
      descBn: 'বছরে অন্তত দুই বার রুটিন ক্লিন করলে পরবর্তীতে বড় ধরনের পাইপ ব্লকেজ বা ট্যাংক মেরামতের বাড়তি খরচ থেকে রক্ষা মেলে।'
    }
  ];

  return (
    <section 
      id="tank-problems-educational" 
      aria-labelledby="customer-problem-heading"
      className="py-16 sm:py-24 bg-[#080A0D] border-b border-[#303743]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* 1. Problem Checklist Section */}
        <div className="space-y-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#2585FF] uppercase mb-2">
              <AlertCircle className="w-4 h-4 text-[#2585FF]" aria-hidden="true" />
              <span>{lang === 'bn' ? 'ট্যাংক লক্ষণ পর্যবেক্ষণ' : 'Tank Condition Checklist'}</span>
            </div>

            <h2 
              id="customer-problem-heading" 
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight"
            >
              {lang === 'bn' ? 'আপনার ট্যাংকে কি এই সমস্যাগুলো আছে?' : 'Does Your Water Tank Have These Issues?'}
            </h2>

            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#2585FF] to-transparent mx-auto my-3.5 rounded-full" />

            <p className="text-sm sm:text-base text-[#B8C0CC] leading-relaxed">
              {lang === 'bn'
                ? 'দৈনন্দিন ব্যবহারে নিচের যেকোনো লক্ষণ দেখা দিলে আপনার পানির ট্যাংক ও পাইপলাইনের জন্য একটি পেশাদার ডিপ ক্লিনিং প্রয়োজন।'
                : 'If you notice any of these signs in your residential or commercial building, a professional deep clean is recommended.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {problemsList.map((item, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl bg-[#171C24] border border-[#303743] hover:border-[#2585FF]/50 transition-all flex items-start gap-3.5 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#202630] border border-[#303743] text-[#2585FF] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#2585FF] group-hover:text-white transition-colors">
                  <span className="text-xs font-bold font-mono">0{idx + 1}</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {lang === 'bn' ? item.titleBn : item.titleEn}
                  </h3>
                  <p className="text-xs text-[#B8C0CC] leading-relaxed">
                    {lang === 'bn' ? item.descBn : item.descBn}
                  </p>
                </div>
              </div>
            ))}

            {/* Quick Solution Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#171C24] to-[#202630] border border-[#2585FF]/40 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#28C76F] uppercase tracking-wider block">
                  {lang === 'bn' ? 'সানভিলোজ সমাধান' : 'Professional Care'}
                </span>
                <h3 className="text-base font-bold text-white">
                  {lang === 'bn' ? 'সরাসরি পরিদর্শন ও সাশ্রয়ী কোটেশন' : 'Inspection & Quotation'}
                </h3>
                <p className="text-xs text-[#B8C0CC] leading-relaxed">
                  {lang === 'bn'
                    ? 'আমাদের অভিজ্ঞ টিম ঢাকা শহরের প্রতিটি এলাকায় নির্ধারিত শিডিউলে দ্রুত সেবা প্রদান করে।'
                    : 'Our team coordinates with building committees and homeowners for scheduled tank cleaning.'}
                </p>
              </div>

              {onOpenQuoteModal && (
                <button
                  type="button"
                  onClick={onOpenQuoteModal}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-[#2585FF] hover:bg-[#1a73e8] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{lang === 'bn' ? 'কোটেশন রিকোয়েস্ট করুন' : 'Request a Quote'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Educational Section */}
        <div className="pt-10 border-t border-[#303743] space-y-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#28C76F] uppercase mb-2">
              <ShieldCheck className="w-4 h-4 text-[#28C76F]" aria-hidden="true" />
              <span>{lang === 'bn' ? 'সচেতনতা ও যত্ন' : 'Water Storage Maintenance'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {lang === 'bn' ? 'নিয়মিত ট্যাংক পরিষ্কার কেন গুরুত্বপূর্ণ?' : 'Why Regular Water Tank Cleaning is Important'}
            </h2>

            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#28C76F] to-transparent mx-auto my-3.5 rounded-full" />

            <p className="text-sm sm:text-base text-[#B8C0CC] leading-relaxed">
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
                  className="p-5 rounded-2xl bg-[#11151B] border border-[#303743] hover:border-[#28C76F]/40 transition-all space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#171C24] border border-[#303743] text-[#28C76F] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {lang === 'bn' ? item.titleBn : item.titleEn}
                  </h3>
                  <p className="text-xs text-[#B8C0CC] leading-relaxed">
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
