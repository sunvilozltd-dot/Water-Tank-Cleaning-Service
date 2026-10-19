export interface SpecialOfferItem {
  id: string;
  titleBn: string;
  titleEn: string;
  badgeBn?: string;
  badgeEn?: string;
  linkUrl: string;
  isActive: boolean;
  sortOrder: number;
}

import { safeGetItem, safeSetItem } from './safeLocalStorage';

const STORAGE_KEY = 'sunviloz_special_offers_v2';
export const SPECIAL_OFFERS_CHANGE_EVENT = 'sunviloz_special_offers_changed';

export const DEFAULT_SPECIAL_OFFERS: SpecialOfferItem[] = [
  {
    id: 'offer-1',
    titleBn: 'পানির ট্যাংক পরিষ্কার সার্ভিসের জন্য বিশেষ প্যাকেজ সুবিধা',
    titleEn: 'Special Package Offers on Water Tank Cleaning Service',
    badgeBn: 'ট্যাংক অফার',
    badgeEn: 'Tank Offer',
    linkUrl: '/services/water-tank-cleaning',
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'offer-2',
    titleBn: 'বাসা ও বাণিজ্যিক ভবনের পানির পাইপলাইন ক্লিনিং অফার',
    titleEn: 'Pipeline Cleaning Service Offers for Residential & Commercial Buildings',
    badgeBn: 'পাইপলাইন',
    badgeEn: 'Pipeline',
    linkUrl: '/services/pipeline-cleaning',
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'offer-3',
    titleBn: 'হোম ও অফিস ডিপ ক্লিনিং সার্ভিসের আকর্ষণীয় কম্বো প্যাকেজ',
    titleEn: 'Home & Office Deep Cleaning Service Package Inquiries',
    badgeBn: 'ডিপ ক্লিনিং',
    badgeEn: 'Deep Clean',
    linkUrl: '/services/home-deep-cleaning',
    isActive: true,
    sortOrder: 3
  },
  {
    id: 'offer-4',
    titleBn: 'সার্ভিস প্যাকেজ ও ফ্রি কোটেশনের জন্য সরাসরি WhatsApp বা হটলাইনে যোগাযোগ করুন',
    titleEn: 'Contact Us for Custom Service Packages and Free Estimation',
    badgeBn: 'হটলাইন',
    badgeEn: 'Hotline',
    linkUrl: '/get-quote',
    isActive: true,
    sortOrder: 4
  }
];

export const getSpecialOffers = (): SpecialOfferItem[] => {
  if (typeof window === 'undefined') return DEFAULT_SPECIAL_OFFERS;
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) {
      safeSetItem(STORAGE_KEY, JSON.stringify(DEFAULT_SPECIAL_OFFERS));
      return DEFAULT_SPECIAL_OFFERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return DEFAULT_SPECIAL_OFFERS;
  } catch (e) {
    console.error('Failed to parse special offers:', e);
    return DEFAULT_SPECIAL_OFFERS;
  }
};

export const saveSpecialOffers = (offers: SpecialOfferItem[]): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    safeSetItem(STORAGE_KEY, JSON.stringify(offers));
    window.dispatchEvent(new Event(SPECIAL_OFFERS_CHANGE_EVENT));
    return true;
  } catch (e) {
    console.error('Failed to save special offers:', e);
    return false;
  }
};

export const addSpecialOffer = (offer: Omit<SpecialOfferItem, 'id' | 'sortOrder'>): SpecialOfferItem => {
  const current = getSpecialOffers();
  const newOffer: SpecialOfferItem = {
    ...offer,
    id: `offer-${Date.now()}`,
    sortOrder: current.length + 1
  };
  saveSpecialOffers([...current, newOffer]);
  return newOffer;
};

export const updateSpecialOffer = (updated: SpecialOfferItem): boolean => {
  const current = getSpecialOffers();
  const next = current.map(item => item.id === updated.id ? updated : item);
  return saveSpecialOffers(next);
};

export const deleteSpecialOffer = (id: string): boolean => {
  const current = getSpecialOffers();
  const next = current.filter(item => item.id !== id);
  return saveSpecialOffers(next);
};
