import React from 'react';
import { 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  FileText,
  Sparkles,
  Layers,
  Wrench,
  Droplets,
  Building,
  Camera,
  Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { BUSINESS_CONFIG } from '../data/config';
import { SendTankPhotoCta } from './SendTankPhotoCta';

interface PricingSectionProps {
  onGetExactPrice?: (tankType?: string) => void;
  onOpenQuoteModal?: () => void;
  showPhotoCta?: boolean;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ 
  onGetExactPrice = () => {},
  onOpenQuoteModal,
  showPhotoCta = true
}) => {
  const { lang } = useLanguage();

  const pricingCards = [
    {
      title: 'Overhead PVC Tank Cleaning',
      titleBn: 'ছাদের ওভারহেড পিভিসি ট্যাংক',
      startingPrice: '৳ ১,২০০',
      startingPriceEn: 'BDT 1,200',
      tag: 'Starting from',
      tagBn: 'শুরু মাত্র',
      badgeBn: 'বাসাবাড়ির জন্য জনপ্রিয়',
      badgeEn: 'Popular Choice',
      idealForBn: 'আবাসিক বাড়ি ও ফ্ল্যাটের ছাদের সাধারণ পিভিসি ও প্লাস্টিক ট্যাংক',
      idealForEn: 'Standard rooftop PVC & plastic tanks (500L - 1,500L)',
      includesBn: [
        '১২০–১৫০ বার হাই-প্রেসার রোটারি জেট ওয়াশ',
        'দেয়ালের শক্ত শ্যাওলা ও পিচ্ছিল বায়োফিল্ম দূরীকরণ',
        'তলদেশের কাদা ও জমে থাকা পলি সম্পূর্ণ পাম্পিং',
        'অনুমোদিত নিরাপদ খাদ্য-মানসম্পন্ন জীবাণুমুক্তকরণ',
        'ফ্লোট ভাল্ব, ওভারফ্লো পাইপ ও ঢাকনা পর্যবেক্ষণ'
      ],
      includesEn: [
        '120-150 bar high-pressure rotary jet wash',
        'Algae descaling & biofilm removal',
        'Sediment drainage & sludge suction',
        'Approved food-grade sanitization',
        'Float valve & lid seal check'
      ],
      tankTypeParam: 'Rooftop Tank',
      featured: true
    },
    {
      title: 'Overhead RCC Concrete Tank',
      titleBn: 'ছাদের আরসিসি কংক্রিট ট্যাংক',
      startingPrice: '৳ ১,৮০০',
      startingPriceEn: 'BDT 1,800',
      tag: 'Starting from',
      tagBn: 'শুরু মাত্র',
      idealForBn: 'বহুতল ভবনের ছাদের পাকা কংক্রিট (RCC) ওভারহেড ওয়াটার ট্যাংক',
      idealForEn: 'Rooftop reinforced concrete (RCC) overhead tanks',
      includesBn: [
        'কংক্রিট সারফেসের মেকানিক্যাল ব্রাশ স্ক্রাবিং',
        'উচ্চ চাপের ওয়াটার জেটে জমাট বাঁধা পলি পরিষ্কার',
        'সাম্প পিটের কাদা উত্তোলন ও ড্রেইনেজ',
        'খাদ্য-বান্ধব স্যানিটাইজিং ওয়াশ ও ফাইনাল রিন্স',
        'ম্যানহোল ও সিলিং পরীক্ষা'
      ],
      includesEn: [
        'Mechanical surface scrubbing for concrete',
        'High-pressure rotary jet cleaning',
        'Sump pit sediment evacuation',
        'Food-grade sanitizing wash & rinse',
        'Manhole seal inspection'
      ],
      tankTypeParam: 'Rooftop Tank',
      featured: false
    },
    {
      title: 'Underground Reserve Tank',
      titleBn: 'আন্ডারগ্রাউন্ড রিজার্ভার ক্লিন',
      startingPrice: '৳ ২,৫০০',
      startingPriceEn: 'BDT 2,500',
      tag: 'Starting from',
      tagBn: 'শুরু মাত্র',
      badgeBn: 'ভারী স্লাজ উত্তোলন',
      badgeEn: 'Heavy Sludge Removal',
      idealForBn: 'বাসা, অ্যাপার্টমেন্ট ও বাণিজ্যিক ভবনের মাটির নিচের রিজার্ভার',
      idealForEn: 'Underground concrete water storage reservoirs',
      includesBn: [
        'সাবমারসিবল কাদা পাম্প দিয়ে ভারী স্লাজ সেচ',
        'ইন্ডাস্ট্রিয়াল ওয়েট সিল্ট ভ্যাকুয়ামে তলদেশ নিখুঁত সাফ',
        'কনফাইন্ড স্পেস ভেন্টিলেশন ও সেফটি লাইটিং ব্যবস্থা',
        '১৫০ বার রোটারি জেটে মেঝের পলি ও দেয়াল স্ক্রাবিং',
        'ব্যাকটেরিয়ারোধী স্যানিটাইজার স্প্রে ও ফাইনাল ফ্লাশ'
      ],
      includesEn: [
        'Submersible slurry mud extraction pump',
        'Industrial wet vacuuming of bottom silt',
        'Confined space safety ventilation',
        '150 bar rotary jet scouring for walls & floor',
        'Sanitizing spray & fresh water rinse'
      ],
      tankTypeParam: 'Underground Tank',
      featured: false
    },
    {
      title: 'Water Pipeline Flushing',
      titleBn: 'পানির পাইপলাইন ফ্লাশিং',
      startingPrice: '৳ ১,৫০০',
      startingPriceEn: 'BDT 1,500',
      tag: 'Starting from',
      tagBn: 'শুরু মাত্র',
      idealForBn: 'যেসব ফ্ল্যাটের ট্যাপ বা শাওয়ারে ঘোলা লালচে পানি আসে বা ফ্লো কম',
      idealForEn: 'Flats with rusty iron water or reduced shower pressure',
      includesBn: [
        'দেয়াল না কেটে আধুনিক হাইড্রো-পালস প্রযুক্তিতে ফ্লাশ',
        'পাইপের ভেতরের মরিচা, আয়রন ও জমা হওয়া পলি বের করা',
        'বাথরুমের শাওয়ার ও বেসিন কলে স্বাভাবিক পানির গতি ফেরাতে সহায়তা',
        'পিভিসি, সিপিভিসি ও পিপিআর পাইপের ধরন অনুযায়ী কাজ',
        'প্রতিটি কলের আউটলেট নেট ও ফিল্টার পরিষ্কার'
      ],
      includesEn: [
        'Hydro-pulse non-destructive line flushing',
        'Iron scale and rust sediment removal',
        'Helps restore normal shower and tap flow',
        'Selected according to pipe material & condition',
        'Faucet aerator nozzle cleaning'
      ],
      tankTypeParam: 'Water Pipeline',
      featured: false
    },
    {
      title: 'Tanks + Pipeline Master Combo',
      titleBn: 'উভয় ট্যাংক + পাইপলাইন কম্বো',
      startingPrice: '৳ ৩,৭০০',
      startingPriceEn: 'BDT 3,700',
      tag: 'Starting from',
      tagBn: 'শুরু মাত্র',
      badgeBn: 'সর্বাধিক সাশ্রয়ী প্যাকেজ',
      badgeEn: 'Best Value Bundle',
      idealForBn: 'পুরো ভবনের আন্ডারগ্রাউন্ড, ছাদের ট্যাংক ও লাইন সমন্বিত ডিপ-ক্লিন',
      idealForEn: 'Whole-building deep clean for reserve, rooftop and supply lines',
      includesBn: [
        'মাটির নিচের রিজার্ভার এবং ছাদের ট্যাংক একযোগে ডিপ ক্লিন',
        'ভবনের সকল বাথরুম ও কিচেনের সরবরাহ লাইন ফ্লাশ',
        'ইনলেট থেকে প্রতিটি কলের মুখ পর্যন্ত সার্বিক পরিচ্ছন্নতা',
        'আলাদা আলাদা বুকিংয়ের তুলনায় উল্লেখযোগ্য সাশ্রয়ী বান্ডেল রেট',
        'একই দিনে দক্ষ টিম দিয়ে সুশৃঙ্খল বাস্তবায়ন'
      ],
      includesEn: [
        'Underground reserve & rooftop tanks cleaned together',
        'Internal water supply lines flushed',
        'Comprehensive whole-building hygiene care',
        'Cost-effective bundled rate',
        'Synchronized single-day execution'
      ],
      tankTypeParam: 'Both',
      featured: true
    }
  ];

  const handleAction = (tankType?: string) => {
    if (onOpenQuoteModal) {
      onOpenQuoteModal();
    } else {
      onGetExactPrice(tankType);
    }
  };

  return (
    <section 
      className="py-16 sm:py-24 bg-[#080A0D] border-b border-[#303743]" 
      id="pricing" 
      aria-labelledby="packages-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2585FF]/10 text-[#2585FF] text-xs font-bold uppercase tracking-wider mb-2.5 border border-[#2585FF]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#2585FF]" aria-hidden="true" />
            <span>{lang === 'bn' ? 'স্বচ্ছ রেট কার্ড ও প্যাকেজ' : 'Transparent Pricing Guide'}</span>
          </div>
          <h2 id="packages-heading" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {lang === 'bn' ? 'সার্ভিস চার্জ ও প্রারম্ভিক মূল্য তালিকা' : 'Service Packages & Starting Rates in Dhaka'}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#2585FF] to-transparent mx-auto my-3.5 rounded-full" />
          <p className="text-sm sm:text-base text-[#B8C0CC] leading-relaxed max-w-2xl mx-auto">
            {lang === 'bn' 
              ? 'আপনার ভবনের ট্যাংকের ধরন, সংখ্যা ও ক্যাপাসিটি অনুযায়ী সম্পূর্ণ স্বচ্ছ ও নির্ভরযোগ্য কোটেশন গ্রহণ করুন।'
              : 'Clear starting rates based on tank structure and capacity. Final quotation confirmed with zero hidden costs.'}
          </p>
        </div>

        {/* Universal Pricing Disclaimer Box */}
        <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-[#11151B] border border-[#303743] flex items-start sm:items-center gap-3 text-xs text-[#B8C0CC]">
          <Info className="w-4 h-4 text-[#2585FF] shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
          <p className="leading-relaxed">
            <strong className="text-white font-semibold">
              {lang === 'bn' ? 'মূল্য নির্ধারণ নীতি:' : 'Pricing Policy:'}
            </strong>{' '}
            {lang === 'bn' ? BUSINESS_CONFIG.pricing.disclaimerBn : BUSINESS_CONFIG.pricing.disclaimerEn}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricingCards.map((pkg, idx) => (
            <div
              key={idx}
              className={`rounded-2xl sm:rounded-3xl p-6 sm:p-7 transition-all flex flex-col justify-between ${
                pkg.featured 
                  ? 'bg-[#171C24] border-2 border-[#2585FF] shadow-2xl shadow-[#2585FF]/10 relative' 
                  : 'bg-[#11151B] border border-[#303743] hover:border-[#2585FF]/40 shadow-xl'
              }`}
            >
              {pkg.badgeBn && (
                <div className="inline-block self-start mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-[#2585FF]/20 text-[#2585FF] text-[10px] font-bold uppercase tracking-wider border border-[#2585FF]/30">
                    {lang === 'bn' ? pkg.badgeBn : pkg.badgeEn}
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  {lang === 'bn' ? pkg.titleBn : pkg.title}
                </h3>
                
                {/* Price Display */}
                <div className="py-3 my-2 border-y border-[#303743]/80 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#28C76F] font-mono">
                    {lang === 'bn' ? pkg.startingPrice : pkg.startingPriceEn}
                  </span>
                  <span className="text-xs text-[#B8C0CC]">
                    ({lang === 'bn' ? pkg.tagBn : pkg.tag})
                  </span>
                </div>

                <p className="text-xs text-[#B8C0CC] mb-5 leading-relaxed min-h-[32px]">
                  {lang === 'bn' ? pkg.idealForBn : pkg.idealForEn}
                </p>

                {/* Scope of Work */}
                <div className="space-y-2 mb-6">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                    {lang === 'bn' ? 'সেবার অন্তর্ভুক্তি:' : 'What is Included:'}
                  </span>
                  {(lang === 'bn' ? pkg.includesBn : pkg.includesEn).map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#B8C0CC]">
                      <Check className="w-3.5 h-3.5 text-[#28C76F] shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-[#303743] space-y-2">
                <button
                  type="button"
                  onClick={() => handleAction(pkg.tankTypeParam)}
                  className={`w-full min-h-[46px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                    pkg.featured 
                      ? 'bg-[#2585FF] hover:bg-[#1a73e8] text-white shadow-lg shadow-[#2585FF]/20' 
                      : 'bg-[#202630] hover:bg-[#2a3240] text-white border border-[#303743]'
                  }`}
                >
                  <span>{lang === 'bn' ? 'সঠিক কোটেশন নিন' : 'Get Exact Quote'}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Send Tank Photo CTA Feature */}
        {showPhotoCta && (
          <div className="pt-4">
            <SendTankPhotoCta source="pricing_section" />
          </div>
        )}

      </div>
    </section>
  );
};

export default PricingSection;
