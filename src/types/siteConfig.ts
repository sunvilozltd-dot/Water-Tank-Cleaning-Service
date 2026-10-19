import { AreaInfo, FaqItem, ProcessStep, ReviewItem } from './index';

export interface SectionConfig {
  id: string;
  name: string;
  nameBn: string;
  enabled: boolean;
  order: number;
  isCustom?: boolean;
  customData?: {
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
  };
}

export interface HeroConfig {
  headingEn: string;
  headingBn: string;
  subheadingEn?: string;
  subheadingBn?: string;
  subheadlineEn?: string;
  subheadlineBn?: string;
  servingAreaBadgeEn: string;
  servingAreaBadgeBn: string;
  ctaQuoteTextEn: string;
  ctaQuoteTextBn: string;
  ctaCallTextEn: string;
  ctaCallTextBn: string;
  bgImageUrl?: string;
  bgVideoUrl?: string;
  // Hero Video & Background Customization
  videoEnabled?: boolean;
  videoUrl?: string; // Desktop video URL or local path
  mobileVideoUrl?: string; // Mobile video URL or local path
  posterImageUrl?: string; // Fallback / preload poster image
  overlayOpacity?: number; // Subtle dark overlay opacity e.g. 0.70 (70%)
  overlayColor?: 'navy' | 'black' | 'darkBlue';
  visualHeadingEn?: string;
  visualHeadingBn?: string;
  visualSubtitleEn?: string;
  visualSubtitleBn?: string;
}

export interface AnnouncementConfig {
  enabled: boolean;
  badgeEn: string;
  badgeBn: string;
  textEn: string;
  textBn: string;
}

export interface BusinessConfig {
  name: string;
  tagline: string;
  taglineBn: string;
  phone: string;
  displayPhone: string;
  whatsappNumber: string;
  whatsappUrl: string;
  messengerUrl: string;
  email: string;
  address: string;
  operatingHours: string;
  operatingHoursBn: string;
  googleSiteVerification?: string;
  googleAnalyticsId?: string;
  metaPixelId?: string;
  canonicalBaseUrl: string;
  trustBadges: { en: string; bn: string }[];
  pricing: {
    rooftopStartingPrice: number;
    rooftopPvcStartingPrice?: number;
    rooftopRccStartingPrice?: number;
    undergroundStartingPrice: number;
    bothStartingPrice?: number;
    pipelineStartingPrice: number;
    maintenanceAnnualPrice: number;
    buildingBulkStartingPrice?: number;
    disclaimerEn: string;
    disclaimerBn: string;
  };
}

export interface WhyChooseUsItem {
  id: number;
  title: string;
  titleBn: string;
  desc: string;
  descBn: string;
  icon: string;
}

export interface SeoConfig {
  defaultMetaTitle?: string;
  defaultMetaDescription?: string;
  canonicalBaseUrl?: string;
  indexingAllowed?: boolean;
  socialOgImage?: string;
}

export interface SiteImagesConfig {
  logo?: string;
  heroPoster?: string;
  heroBg?: string;
  aboutStoryImage?: string;
  popularTankImage?: string;
  popularPipelineImage?: string;
  beforeAfterCase1Before?: string;
  beforeAfterCase1After?: string;
  beforeAfterCase2Before?: string;
  beforeAfterCase2After?: string;
  beforeAfterCase3Before?: string;
  beforeAfterCase3After?: string;
}

export interface FullSiteConfig {
  business: BusinessConfig;
  announcement: AnnouncementConfig;
  hero: HeroConfig;
  sections: SectionConfig[];
  whyChooseUs: WhyChooseUsItem[];
  cleaningSteps: ProcessStep[];
  faqs: FaqItem[];
  reviews: ReviewItem[];
  areas: AreaInfo[];
  seo?: SeoConfig;
  images?: SiteImagesConfig;
}
