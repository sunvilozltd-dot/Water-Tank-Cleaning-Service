import { FullSiteConfig, SectionConfig, HeroConfig, AnnouncementConfig, WhyChooseUsItem } from '../types/siteConfig';
import { 
  BUSINESS_CONFIG, 
  DHAKA_AREAS, 
  CLEANING_STEPS, 
  WHY_CHOOSE_US, 
  FAQS_DATA, 
  REVIEWS_DATA 
} from '../data/config';
import { safeGetItem, safeSetItem } from './safeLocalStorage';

const SITE_CONFIG_STORAGE_KEY = 'sunviloz_site_master_config_v3';
export const SITE_CONFIG_EVENT = 'sunviloz_site_config_changed';

export const DEFAULT_HOMEPAGE_SECTIONS: SectionConfig[] = [
  { id: 'hero', name: 'Hero Banner & Video Cover', nameBn: 'হিরো কভার ও ব্যাকগ্রাউন্ড ভিডিও', enabled: true, order: 1 },
  { id: 'trust', name: 'Verified Standards & Trust Facts', nameBn: 'প্রমাণিত স্ট্যান্ডার্ড ও সেবা নীতি', enabled: true, order: 2 },
  { id: 'services', name: 'Services Grid & Cards', nameBn: 'সেবাসমূহের তালিকা', enabled: true, order: 3 },
  { id: 'instantEstimation', name: 'Instant Price Estimator', nameBn: 'কোটেশন রিকোয়েস্ট ফর্ম', enabled: true, order: 4 },
  { id: 'beforeAfter', name: 'Before & After Video & Gallery', nameBn: 'বিফোর/আফটার ফলাফল ও ভিডিও', enabled: true, order: 5 },
  { id: 'process', name: 'Cleaning Process Steps', nameBn: 'ক্লিনিংয়ের বিজ্ঞানসম্মত ধাপ', enabled: true, order: 6 },
  { id: 'pricing', name: 'Pricing Plans & Rate Card', nameBn: 'সার্ভিস প্যাকেজ ও কোটেশন প্রক্রিয়া', enabled: true, order: 7 },
  { id: 'serviceArea', name: 'Dhaka Service Areas & Coverage', nameBn: 'ঢাকা শহরের কভারেজ এলাকা', enabled: true, order: 8 },
  { id: 'reviews', name: 'Customer Reviews & Feedback', nameBn: 'গ্রাহকদের বাস্তব রিভিউ', enabled: true, order: 9 },
  { id: 'blog', name: 'Cleaning Tips & Guides (Blog)', nameBn: 'পানি সুরক্ষা গাইড (ব্লগ)', enabled: true, order: 10 },
  { id: 'faq', name: 'Frequently Asked Questions (FAQ)', nameBn: 'সাধারণ প্রশ্নোত্তর (FAQ)', enabled: true, order: 11 },
  { id: 'finalCta', name: 'Final Booking CTA Banner', nameBn: 'চূড়ান্ত বুকিং ও হটলাইন ব্যানার', enabled: true, order: 12 },
  { id: 'whyChoose', name: 'Why Choose Us Benefits', nameBn: 'কেন আমাদের বেছে নেবেন', enabled: false, order: 13 },
  { id: 'problem', name: 'Tank Contamination & Warning Signs', nameBn: 'ট্যাংক অপরিচ্ছন্নতার লক্ষণ', enabled: false, order: 14 },
  { id: 'howItWorks', name: 'How It Works (3 Steps)', nameBn: 'সহজ ৩ ধাপে সার্ভিস', enabled: false, order: 15 },
];

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  headingEn: 'Professional Water Tank Cleaning Service in Dhaka',
  headingBn: 'ঢাকায় প্রফেশনাল ওয়াটার ট্যাংক ক্লিনিং সার্ভিস',
  subheadingEn: 'Deep cleaning for rooftop and underground water tanks with a professional, hygienic and customer-focused cleaning process.',
  subheadingBn: 'নিয়মিত পানির ট্যাংক পরিষ্কার রাখা আপনার ও পরিবারের সুস্থতার জন্য জরুরি। আপনার ট্যাংকের তথ্য জানিয়ে রিকোয়েস্ট করুন, আমাদের টিম সঠিক কোটেশন প্রদান করবে।',
  subheadlineEn: 'Deep cleaning for rooftop and underground water tanks with a professional, hygienic and customer-focused cleaning process.',
  subheadlineBn: 'নিয়মিত পানির ট্যাংক পরিষ্কার রাখা আপনার ও পরিবারের সুস্থতার জন্য জরুরি। আপনার ট্যাংকের তথ্য জানিয়ে রিকোয়েস্ট করুন, আমাদের টিম সঠিক কোটেশন প্রদান করবে।',
  servingAreaBadgeEn: 'Serving All Areas Across Dhaka',
  servingAreaBadgeBn: 'ঢাকা শহরের সকল এলাকায় সার্ভিস প্রদান',
  ctaQuoteTextEn: 'Request a Quote',
  ctaQuoteTextBn: 'কোটেশন রিকোয়েস্ট করুন',
  ctaCallTextEn: 'Call 01609-999612',
  ctaCallTextBn: 'কল করুন 01609-999612',
  bgImageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
  // Hero Full-Width Video Settings
  videoEnabled: true,
  videoUrl: '/videos/tank-cleaning-desktop.mp4',
  mobileVideoUrl: '/videos/tank-cleaning-mobile.mp4',
  posterImageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
  overlayOpacity: 0.72,
  overlayColor: 'navy',
  visualHeadingBn: 'অত্যাধুনিক মেকানাইজড ওয়াটার ট্যাংক ক্লিনিং',
  visualHeadingEn: 'Advanced Hygienic Water Tank Cleaning Technology',
  visualSubtitleBn: '১৫০ বার রোটারি জেট ও ফুড-গ্রেড জীবাণুমুক্তকরণে শতভাগ নিরাপদ পানি',
  visualSubtitleEn: 'High-pressure rotary jet washing with certified food-grade disinfectant for pure safe water'
};

export const DEFAULT_ANNOUNCEMENT_CONFIG: AnnouncementConfig = {
  enabled: true,
  badgeEn: 'Dhaka Water Tank Cleaning Team On Standby',
  badgeBn: 'ঢাকা শহরের প্রতিটি এলাকায় আমাদের টিম প্রস্তুত',
  textEn: 'Professional Rooftop & Underground Tank Cleaning • Transparent Quotations',
  textBn: 'ছাদ ও মাটির নিচের ট্যাংকের গভীর মেকানাইজড ক্লিনিং • স্বচ্ছ ও সাশ্রয়ী কোটেশন'
};

export const INITIAL_FULL_SITE_CONFIG: FullSiteConfig = {
  business: {
    ...BUSINESS_CONFIG,
    trustBadges: [...BUSINESS_CONFIG.trustBadges],
    pricing: { ...BUSINESS_CONFIG.pricing }
  },
  announcement: { ...DEFAULT_ANNOUNCEMENT_CONFIG },
  hero: { ...DEFAULT_HERO_CONFIG },
  sections: [...DEFAULT_HOMEPAGE_SECTIONS],
  whyChooseUs: [...WHY_CHOOSE_US],
  cleaningSteps: [...CLEANING_STEPS],
  faqs: [...FAQS_DATA],
  reviews: [...REVIEWS_DATA],
  areas: [...DHAKA_AREAS],
  seo: {
    defaultMetaTitle: 'Professional Water Tank Cleaning Service in Dhaka | Sunviloz Clean Care',
    defaultMetaDescription: 'Professional rooftop & underground water tank cleaning, pipeline cleaning, and sanitization in Dhaka. Transparent pricing, modern equipment, hygienic service.',
    canonicalBaseUrl: 'https://sunvilozcleancare.com',
    indexingAllowed: true,
    socialOgImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75'
  },
  images: {
    heroPoster: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
    heroBg: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
    aboutStoryImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
    popularTankImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
    popularPipelineImage: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=75'
  }
};

export const getStoredSiteConfig = (): FullSiteConfig => {
  if (typeof window === 'undefined') return INITIAL_FULL_SITE_CONFIG;
  try {
    const raw = safeGetItem(SITE_CONFIG_STORAGE_KEY);
    if (!raw) {
      safeSetItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(INITIAL_FULL_SITE_CONFIG));
      return INITIAL_FULL_SITE_CONFIG;
    }
    const parsed = JSON.parse(raw) as Partial<FullSiteConfig>;
    
    // Merge with defaults to ensure full backwards compatibility
    const mergedSections = [...DEFAULT_HOMEPAGE_SECTIONS].map(defSec => {
      const existing = parsed.sections?.find(s => s.id === defSec.id);
      return existing ? { ...defSec, ...existing } : defSec;
    });

    // Add custom sections
    if (parsed.sections) {
      parsed.sections.forEach(s => {
        if (s.isCustom && !mergedSections.some(m => m.id === s.id)) {
          mergedSections.push(s);
        }
      });
    }

    mergedSections.sort((a, b) => a.order - b.order);

    return {
      business: { 
        ...INITIAL_FULL_SITE_CONFIG.business, 
        ...(parsed.business || {}),
        pricing: {
          ...INITIAL_FULL_SITE_CONFIG.business.pricing,
          ...(parsed.business?.pricing || {})
        }
      },
      announcement: { ...INITIAL_FULL_SITE_CONFIG.announcement, ...(parsed.announcement || {}) },
      hero: { ...INITIAL_FULL_SITE_CONFIG.hero, ...(parsed.hero || {}) },
      sections: mergedSections,
      whyChooseUs: parsed.whyChooseUs || INITIAL_FULL_SITE_CONFIG.whyChooseUs,
      cleaningSteps: parsed.cleaningSteps || INITIAL_FULL_SITE_CONFIG.cleaningSteps,
      faqs: parsed.faqs || INITIAL_FULL_SITE_CONFIG.faqs,
      reviews: parsed.reviews || INITIAL_FULL_SITE_CONFIG.reviews,
      areas: parsed.areas || INITIAL_FULL_SITE_CONFIG.areas,
      seo: { ...INITIAL_FULL_SITE_CONFIG.seo, ...(parsed.seo || {}) },
      images: { ...INITIAL_FULL_SITE_CONFIG.images, ...(parsed.images || {}) }
    };
  } catch (err) {
    console.error('Failed to parse stored site config:', err);
    return INITIAL_FULL_SITE_CONFIG;
  }
};

export const saveSiteConfig = (config: FullSiteConfig): void => {
  if (typeof window === 'undefined') return;
  try {
    safeSetItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(SITE_CONFIG_EVENT, { detail: config }));
  } catch (err) {
    console.error('Failed to save site config:', err);
  }
};

export const resetSiteConfigToDefaults = (): FullSiteConfig => {
  saveSiteConfig(INITIAL_FULL_SITE_CONFIG);
  return INITIAL_FULL_SITE_CONFIG;
};

export const toggleSectionVisibility = (sectionId: string, enabled?: boolean): FullSiteConfig => {
  const current = getStoredSiteConfig();
  const updatedSections = current.sections.map(s => {
    if (s.id === sectionId) {
      return { ...s, enabled: enabled !== undefined ? enabled : !s.enabled };
    }
    return s;
  });
  const updated: FullSiteConfig = { ...current, sections: updatedSections };
  saveSiteConfig(updated);
  return updated;
};

export const moveSectionOrder = (sectionId: string, direction: 'up' | 'down'): FullSiteConfig => {
  const current = getStoredSiteConfig();
  const sorted = [...current.sections].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex(s => s.id === sectionId);
  if (idx === -1) return current;

  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= sorted.length) return current;

  const tempOrder = sorted[idx].order;
  sorted[idx].order = sorted[targetIdx].order;
  sorted[targetIdx].order = tempOrder;

  sorted.sort((a, b) => a.order - b.order);
  sorted.forEach((item, i) => { item.order = i + 1; });

  const updated: FullSiteConfig = { ...current, sections: sorted };
  saveSiteConfig(updated);
  return updated;
};

export const addCustomSection = (customSection: {
  name: string;
  nameBn: string;
  headingEn: string;
  headingBn: string;
  subheadingEn: string;
  subheadingBn: string;
  bgStyle: 'blue' | 'white' | 'slate' | 'cyan';
  ctaTextEn?: string;
  ctaTextBn?: string;
  ctaLink?: string;
  contentEn?: string;
  contentBn?: string;
  badgeTextEn?: string;
  badgeTextBn?: string;
  imageUrl?: string;
}): SectionConfig => {
  const current = getStoredSiteConfig();
  const id = `custom-sec-${Date.now()}`;
  const maxOrder = Math.max(...current.sections.map(s => s.order), 0);

  const newSection: SectionConfig = {
    id,
    name: customSection.name,
    nameBn: customSection.nameBn,
    enabled: true,
    order: maxOrder + 1,
    isCustom: true,
    customData: {
      headingEn: customSection.headingEn,
      headingBn: customSection.headingBn,
      subheadingEn: customSection.subheadingEn,
      subheadingBn: customSection.subheadingBn,
      bgStyle: customSection.bgStyle,
      ctaTextEn: customSection.ctaTextEn,
      ctaTextBn: customSection.ctaTextBn,
      ctaLink: customSection.ctaLink,
      contentEn: customSection.contentEn,
      contentBn: customSection.contentBn,
      badgeTextEn: customSection.badgeTextEn,
      badgeTextBn: customSection.badgeTextBn,
      imageUrl: customSection.imageUrl
    }
  };

  const updatedSections = [...current.sections, newSection];
  saveSiteConfig({ ...current, sections: updatedSections });
  return newSection;
};

export const deleteCustomSection = (sectionId: string): boolean => {
  const current = getStoredSiteConfig();
  const filtered = current.sections.filter(s => s.id !== sectionId);
  if (filtered.length === current.sections.length) return false;

  filtered.sort((a, b) => a.order - b.order);
  filtered.forEach((s, idx) => { s.order = idx + 1; });

  saveSiteConfig({ ...current, sections: filtered });
  return true;
};

export const updateHeroVideoConfig = (updates: Partial<HeroConfig>): FullSiteConfig => {
  const current = getStoredSiteConfig();
  const updatedHero = { ...current.hero, ...updates };
  const updated = { ...current, hero: updatedHero };
  saveSiteConfig(updated);
  return updated;
};

export const updateSiteImagesConfig = (updates: Partial<NonNullable<FullSiteConfig['images']>>): FullSiteConfig => {
  const current = getStoredSiteConfig();
  const currentImages = current.images || INITIAL_FULL_SITE_CONFIG.images || {};
  const updatedImages = { ...currentImages, ...updates };
  const updated = { ...current, images: updatedImages };
  saveSiteConfig(updated);
  return updated;
};

