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
import { supabase, isSupabaseConfigured } from './supabaseClient';

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

function mapRowToOffer(d: any): SpecialOfferItem {
  return {
    id: d.id,
    titleBn: d.title_bn,
    titleEn: d.title_en,
    badgeBn: d.badge_bn,
    badgeEn: d.badge_en,
    linkUrl: d.link_url,
    isActive: d.is_active !== false,
    sortOrder: Number(d.sort_order ?? 1)
  };
}

function mapOfferToRow(o: SpecialOfferItem): any {
  return {
    id: o.id,
    title_bn: o.titleBn,
    title_en: o.titleEn,
    badge_bn: o.badgeBn || null,
    badge_en: o.badgeEn || null,
    link_url: o.linkUrl,
    is_active: o.isActive,
    sort_order: o.sortOrder,
    updated_at: new Date().toISOString()
  };
}

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

export const fetchSpecialOffersFromSupabase = async (): Promise<SpecialOfferItem[]> => {
  let list = getSpecialOffers();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('special_offers')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        list = data.map(mapRowToOffer);
        if (typeof window !== 'undefined') {
          safeSetItem(STORAGE_KEY, JSON.stringify(list));
          window.dispatchEvent(new Event(SPECIAL_OFFERS_CHANGE_EVENT));
        }
      } else if (!error && Array.isArray(data) && data.length === 0) {
        const rows = DEFAULT_SPECIAL_OFFERS.map(mapOfferToRow);
        await supabase.from('special_offers').upsert(rows, { onConflict: 'id' });
      }
    } catch (err) {
      console.warn('Could not query special_offers from Supabase:', err);
    }
  }

  return list;
};

export const saveSpecialOffers = async (offers: SpecialOfferItem[]): Promise<boolean> => {
  if (typeof window !== 'undefined') {
    safeSetItem(STORAGE_KEY, JSON.stringify(offers));
    window.dispatchEvent(new Event(SPECIAL_OFFERS_CHANGE_EVENT));
  }

  if (isSupabaseConfigured()) {
    try {
      const rows = offers.map(mapOfferToRow);
      const { error } = await supabase.from('special_offers').upsert(rows, { onConflict: 'id' });
      if (error) {
        console.error('Supabase special_offers save error:', error.message);
        return false;
      }
    } catch (e) {
      console.error('Failed to save special offers to Supabase:', e);
      return false;
    }
  }

  return true;
};

export const addSpecialOffer = async (offer: Omit<SpecialOfferItem, 'id' | 'sortOrder'>): Promise<SpecialOfferItem> => {
  const current = getSpecialOffers();
  const newOffer: SpecialOfferItem = {
    ...offer,
    id: `offer-${Date.now()}`,
    sortOrder: current.length + 1
  };
  await saveSpecialOffers([...current, newOffer]);
  return newOffer;
};

export const updateSpecialOffer = async (updated: SpecialOfferItem): Promise<boolean> => {
  const current = getSpecialOffers();
  const next = current.map(item => item.id === updated.id ? updated : item);
  return await saveSpecialOffers(next);
};

export const deleteSpecialOffer = async (id: string): Promise<boolean> => {
  const current = getSpecialOffers();
  const next = current.filter(item => item.id !== id);
  await saveSpecialOffers(next);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('special_offers').delete().eq('id', id);
    } catch (err) {
      console.warn('Failed to delete special offer from Supabase:', err);
    }
  }
  return true;
};
