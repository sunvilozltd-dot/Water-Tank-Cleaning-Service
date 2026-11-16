import React from 'react';
import {
  CheckCircle2,
  XCircle,
  ClipboardList,
  Clock,
  Calculator,
  Camera,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ServiceItem } from '../types';
import { usePortfolioProjects, isPublicPublishedCaseStudy } from '../utils/portfolioStore';
import { AUTHORITATIVE_SERVICES } from '../services/serviceRegistry';

interface ServiceDetailsMatrixProps {
  serviceSlug: string;
  dbService?: ServiceItem | null;
  onNavigate?: (path: string) => void;
  onOpenQuoteModal?: (serviceName?: string) => void;
}

const WATER_TANK_COMBINED_DEFAULTS = {
  includedItems: [
    'Pre-service inspection of rooftop PVC/RCC and underground reserve tank valves & access',
    'Submersible pumping of standing water and settled bottom sludge',
    'Non-scratch brushing + 120-150 bar high-pressure rotary jet washing of walls',
    'Odorless food-grade non-toxic sanitization and fresh water rinse',
    'Wet vacuum extraction of residual wash water and lid securing'
  ],
  includedItemsBn: [
    'ছাদের ওভারহেড (PVC/RCC) ও মাটির নিচের রিজার্ভারের প্রবেশপথ ও ভালভ পরিদর্শন',
    'সাবমারসিবল স্লাজ পাম্পের সাহায্যে অবশিষ্ট পানি ও তলদেশের ভারী কাদা সেচ',
    'নন-স্ক্র্যাচ ব্রাশ ও ১২০–১৫০ বার রোটারি জেট ওয়াশে দেয়াল ও মেঝের শ্যাওলা অপসারণ',
    'ফুড-গ্রেড নিরাপদ জীবাণুনাশক প্রয়োগ ও পরিষ্কার পানিতে ফাইনাল রিন্স',
    'ভ্যাকুয়াম এক্সট্র্যাক্টরে শেষ ময়লা তুলে ঢাকনা সুরক্ষিতভাবে বন্ধ করা'
  ],
  excludedItems: [
    'Broken pipe plumbing repair, pump motor rewiring, or float valve hardware replacement',
    'Structural concrete waterproofing, tank crack grouting, or masonry repair',
    'Certified microbiological laboratory water potability testing (separate service if needed)'
  ],
  excludedItemsBn: [
    'ফাটা পাইপ, নষ্ট পানির মোটর বা ভাঙা ফ্লোট বল ভালভ মেরামতের প্লাম্বিং কাজ',
    'কংক্রিট ট্যাংকের ফাটল গ্রাউটিং বা ওয়াটারপ্রুফিং নির্মাণকাজ',
    'ল্যাবরেটরি ভিত্তিক পানীয় জলের টিডিএস বা মাইক্রোবায়োলজিক্যাল টেস্ট'
  ],
  customerPrep: [
    'Use stored water normally 3-4 hours before service to minimize fresh water wastage',
    'Ensure electricity socket access for pumps/washers and an active drain outlet nearby',
    'Keep rooftop door and underground tank manhole keys unlocked upon team arrival'
  ],
  customerPrepBn: [
    'পানি অপচয় কমাতে সার্ভিসের ৩–৪ ঘণ্টা আগে ট্যাংকে নতুন পানি তোলা কমিয়ে রাখুন',
    'পাম্প ও প্রেশার ওয়াশার চালানোর জন্য বৈদ্যুতিক সকেট ও ড্রেন আউটলেটের সুবিধা রাখুন',
    'টিম পৌঁছানোর সময় ছাদের দরজা ও আন্ডারগ্রাউন্ড ম্যানহোলের চাবি প্রস্তুত রাখুন'
  ],
  durationFactors: [
    'Tank type (overhead PVC vs concrete RCC vs subterranean reserve tank)',
    'Total storage volume in liters and number of connected tanks',
    'Depth of settled clay, municipal sand, and wall algae buildup',
    'Accessibility of rooftop stairs and proximity to drainage outlets'
  ],
  durationFactorsBn: [
    'ট্যাংকের ধরন (ছাদের পিভিসি/আরসিসি বনাম মাটির নিচের আন্ডারগ্রাউন্ড রিজার্ভার)',
    'ট্যাংকের ধারণক্ষমতা (লিটার) এবং মোট ট্যাংকের সংখ্যা',
    'তলদেশে জমা কাদা-বালু ও দেয়ালের শ্যাওলার ঘনত্ব',
    'ছাদ বা ম্যানহোলে যাতায়াত এবং নোংরা পানি নিষ্কাশনের দূরত্ব'
  ],
  pricingFactors: [
    'Tank type and material (PVC/plastic, overhead RCC, or underground concrete)',
    'Capacity in liters and total number of tanks included in one booking',
    'Sediment level, manhole accessibility, and building location across Dhaka/Savar/Gazipur/Narayanganj',
    'Single-service booking vs combined rooftop + underground + pipeline package'
  ],
  pricingFactorsBn: [
    'ট্যাংকের ধরন ও উপাদান (প্লাস্টিক/পিভিসি, ছাদের আরসিসি বা আন্ডারগ্রাউন্ড)',
    'মোট লিটার ধারণক্ষমতা ও একই সাথে পরিষ্কারযোগ্য ট্যাংকের সংখ্যা',
    'কাদার পরিমাণ, প্রবেশপথের সুবিধা এবং ভবনের এলাকা',
    'শুধু ট্যাংক নাকি পাইপলাইন ফ্লাশিং সহ যৌথ বুকিং নেওয়া হচ্ছে'
  ]
};

export const ServiceDetailsMatrix: React.FC<ServiceDetailsMatrixProps> = ({
  serviceSlug,
  dbService,
  onNavigate,
  onOpenQuoteModal
}) => {
  const { lang } = useLanguage();
  const { projects } = usePortfolioProjects();

  const normalizedSlug =
    serviceSlug === 'overhead-water-tank-cleaning'
      ? 'overhead-tank-cleaning'
      : serviceSlug === 'water-pipeline-cleaning' || serviceSlug === 'pipe-line-cleaning'
      ? 'pipeline-cleaning'
      : serviceSlug === 'underground-tank-cleaning'
      ? 'underground-water-tank-cleaning'
      : serviceSlug;

  const fallbackMeta =
    normalizedSlug === 'water-tank-cleaning'
      ? WATER_TANK_COMBINED_DEFAULTS
      : AUTHORITATIVE_SERVICES.find(s => s.slug === normalizedSlug) || WATER_TANK_COMBINED_DEFAULTS;

  const pickList = (dbBn?: string[], dbEn?: string[], fbBn?: string[], fbEn?: string[]): string[] => {
    if (lang === 'bn') {
      if (Array.isArray(dbBn) && dbBn.length > 0) return dbBn;
      if (Array.isArray(fbBn) && fbBn.length > 0) return fbBn;
      if (Array.isArray(dbEn) && dbEn.length > 0) return dbEn;
      return fbEn || [];
    }
    if (Array.isArray(dbEn) && dbEn.length > 0) return dbEn;
    if (Array.isArray(fbEn) && fbEn.length > 0) return fbEn;
    if (Array.isArray(dbBn) && dbBn.length > 0) return dbBn;
    return fbBn || [];
  };

  const included = pickList(
    dbService?.includedItemsBn,
    dbService?.includedItems,
    fallbackMeta.includedItemsBn,
    fallbackMeta.includedItems
  );
  const excluded = pickList(
    dbService?.excludedItemsBn,
    dbService?.excludedItems,
    fallbackMeta.excludedItemsBn,
    fallbackMeta.excludedItems
  );
  const prep = pickList(
    dbService?.customerPrepBn,
    dbService?.customerPrep,
    fallbackMeta.customerPrepBn,
    fallbackMeta.customerPrep
  );
  const durationFactors = pickList(
    dbService?.durationFactorsBn,
    dbService?.durationFactors,
    fallbackMeta.durationFactorsBn,
    fallbackMeta.durationFactors
  );
  const pricingFactors = pickList(
    dbService?.pricingFactorsBn,
    dbService?.pricingFactors,
    fallbackMeta.pricingFactorsBn,
    fallbackMeta.pricingFactors
  );

  // Linked published, customer-consented Case Studies matching this service
  const matchedCases = projects
    .filter(isPublicPublishedCaseStudy)
    .filter(p => {
      if (normalizedSlug === 'water-tank-cleaning') {
        return (
          !p.relatedServiceSlug ||
          p.relatedServiceSlug === 'water-tank-cleaning' ||
          p.relatedServiceSlug === 'overhead-tank-cleaning' ||
          p.relatedServiceSlug === 'underground-water-tank-cleaning' ||
          p.category !== 'Pipeline'
        );
      }
      if (p.relatedServiceSlug) {
        return p.relatedServiceSlug === normalizedSlug;
      }
      if (normalizedSlug === 'overhead-tank-cleaning') return p.category === 'Overhead Tank';
      if (normalizedSlug === 'underground-water-tank-cleaning') return p.category === 'Underground Tank';
      if (normalizedSlug === 'pipeline-cleaning') return p.category === 'Pipeline';
      return true;
    })
    .slice(0, 3);

  const handleLinkClick = (path: string, e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <div className="space-y-10">
      {/* Scope Matrix: Included vs Excluded */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-labelledby="service-scope-heading">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
            <h2 id="service-scope-heading" className="text-lg sm:text-xl font-extrabold text-[#123047]">
              {lang === 'bn' ? 'সার্ভিসে যা যা অন্তর্ভুক্ত (Included Scope)' : 'What Is Included'}
            </h2>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#475569] leading-relaxed">
            {included.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <XCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <h2 className="text-lg sm:text-xl font-extrabold text-[#123047]">
              {lang === 'bn' ? 'যা সার্ভিসের অন্তর্ভুক্ত নয় (Excluded)' : 'What Is Not Included'}
            </h2>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#475569] leading-relaxed">
            {excluded.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Homeowner Preparation, Duration Factors & Pricing Factors */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-[#123047] font-extrabold text-base">
            <ClipboardList className="w-5 h-5 text-[#0D9488] shrink-0" />
            <h2>{lang === 'bn' ? 'কাজের আগে গ্রাহকের প্রস্তুতি' : 'Homeowner Preparation'}</h2>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-[#475569] leading-relaxed">
            {prep.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#0D9488] font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-[#123047] font-extrabold text-base">
            <Clock className="w-5 h-5 text-[#0D9488] shrink-0" />
            <h2>{lang === 'bn' ? 'কাজে সময় নির্ধারণের বিষয়' : 'What Affects Work Duration'}</h2>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-[#475569] leading-relaxed">
            {durationFactors.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#0D9488] font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-[#123047] font-extrabold text-base">
            <Calculator className="w-5 h-5 text-[#0D9488] shrink-0" />
            <h2>{lang === 'bn' ? 'খরচ ও কোটেশনের বিষয়সমূহ' : 'What Determines the Quote'}</h2>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-[#475569] leading-relaxed">
            {pricingFactors.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#0D9488] font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Linked Published Case Studies */}
      <section className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488] flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'বাস্তব কাজের ডকুমেন্টেশন' : 'Verified Field Case Studies'}</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#123047] mt-1">
              {lang === 'bn'
                ? 'এই সার্ভিসের আগে ও পরের বাস্তব কাজের কেস স্টাডি'
                : 'Before & After Case Studies for This Service'}
            </h2>
          </div>

          <a
            href="/portfolio"
            onClick={(e) => handleLinkClick('/portfolio', e)}
            className="text-xs sm:text-sm font-bold text-[#0D9488] hover:underline flex items-center gap-1"
          >
            <span>{lang === 'bn' ? 'সকল কেস স্টাডি দেখুন' : 'View All Case Studies'}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {matchedCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {matchedCases.map(cs => {
              const csTitle = lang === 'bn' ? (cs.titleBn || cs.title) : cs.title;
              const csSlug = cs.slug || cs.id;
              return (
                <a
                  key={cs.id}
                  href={`/portfolio/${csSlug}`}
                  onClick={(e) => handleLinkClick(`/portfolio/${csSlug}`, e)}
                  className="group bg-[#F5FAFC] border border-[#E2E8F0] hover:border-[#0D9488]/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between no-underline text-inherit"
                >
                  <div className="grid grid-cols-2 gap-0.5 bg-[#E2E8F0] aspect-video">
                    <img
                      src={cs.beforeImage}
                      alt={`${csTitle} — Before`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <img
                      src={cs.afterImage}
                      alt={`${csTitle} — After`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0D9488]">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{cs.locationBn || cs.location}</span>
                      </div>
                      <h3 className="font-bold text-sm text-[#123047] group-hover:text-[#0D9488] transition-colors line-clamp-2">
                        {csTitle}
                      </h3>
                      {(cs.actualResultBn || cs.workDoneBn) && (
                        <p className="text-xs text-[#64748B] line-clamp-2">
                          {cs.actualResultBn || cs.workDoneBn}
                        </p>
                      )}
                    </div>
                    <div className="pt-2 text-xs font-bold text-[#0D9488] flex items-center gap-1">
                      <span>{lang === 'bn' ? 'কেস স্টাডি দেখুন' : 'Read Case Study'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="p-5 sm:p-6 rounded-2xl bg-[#F5FAFC] border border-dashed border-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              {lang === 'bn'
                ? 'গ্রাহকের লিখিত সম্মতি সহ অনুমোদিত আগে-পরের কেস স্টাডি প্রকাশিত হলে এখানে যুক্ত হয়। কাজের ধরন ও কোটেশন সম্পর্কে সরাসরি জানতে ফর্ম বা WhatsApp ব্যবহার করুন।'
                : 'Consent-verified before-and-after field case studies appear here as soon as they are published. Request a tailored quotation via form or WhatsApp.'}
            </p>
            {onOpenQuoteModal && (
              <button
                type="button"
                onClick={() => onOpenQuoteModal(dbService?.title || serviceSlug)}
                className="px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs rounded-xl shrink-0 cursor-pointer"
              >
                {lang === 'bn' ? 'কোটেশন নিন' : 'Request Quote'}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ServiceDetailsMatrix;
