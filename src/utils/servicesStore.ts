import { useState, useEffect } from 'react';
import { ServiceItem } from '../types';
import { 
  AUTHORITATIVE_SERVICES, 
  CANONICAL_SERVICE_ALIASES, 
  ExtensibleServiceItem 
} from '../services/serviceRegistry';
import { safeGetItem, safeSetItem } from './safeLocalStorage';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { 
  getStoredImageRegistry, 
  fetchCentralImageRegistry, 
  CENTRAL_IMAGES_EVENT,
  isDemoOrStockUrl 
} from '../services/imageSyncService';
import { enqueueIndexNowUrls } from '../services/indexnowService';

const STORAGE_KEY = 'sunviloz_authoritative_services_v9';
const EVENT_NAME = 'sunviloz_services_changed';

export const INITIAL_SERVICES: ExtensibleServiceItem[] = AUTHORITATIVE_SERVICES;

/**
 * Ensures canonical image assets for the core 3 services
 */
const sanitizeStoredService = (s: ExtensibleServiceItem): ExtensibleServiceItem => {
  const reg = getStoredImageRegistry();
  const rawOverride = reg?.serviceImages?.[s.id] || reg?.serviceImages?.[s.slug];
  const overrideImg = rawOverride && !isDemoOrStockUrl(rawOverride) ? rawOverride : undefined;

  if (overrideImg) {
    return {
      ...s,
      image: overrideImg,
      featured_image: overrideImg
    };
  }

  const cleanExistingImg = (s.image && !isDemoOrStockUrl(s.image)) ? s.image : undefined;
  const cleanExistingFeatured = (s.featured_image && !isDemoOrStockUrl(s.featured_image)) ? s.featured_image : undefined;

  if (s.id === 'srv-overhead-water-tank' || s.slug === 'overhead-water-tank-cleaning') {
    const fallback = 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg';
    return {
      ...s,
      image: cleanExistingImg || fallback,
      featured_image: cleanExistingFeatured || cleanExistingImg || fallback
    };
  }
  if (s.id === 'srv-underground-water-tank' || s.slug === 'underground-water-tank-cleaning') {
    const fallback = 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/underground-water-tank-cleaning_1794133736994.png';
    return {
      ...s,
      image: cleanExistingImg || fallback,
      featured_image: cleanExistingFeatured || cleanExistingImg || fallback
    };
  }
  if (s.id === 'srv-water-pipeline' || s.slug === 'water-pipeline-cleaning') {
    const fallback = 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/water-pipeline-cleaning_1794133710278.jpg';
    return {
      ...s,
      image: cleanExistingImg || fallback,
      featured_image: cleanExistingFeatured || cleanExistingImg || fallback
    };
  }
  return {
    ...s,
    image: cleanExistingImg || 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg',
    featured_image: cleanExistingFeatured || cleanExistingImg || 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg'
  };
};

/**
 * Maps a database row from public.services to an ExtensibleServiceItem.
 */
function mapRowToService(d: any): ExtensibleServiceItem {
  return sanitizeStoredService({
    id: d.id,
    slug: d.slug,
    title: d.title,
    titleBn: d.title_bn || d.title,
    name: d.name || d.title,
    shortDesc: d.short_desc || '',
    shortDescBn: d.short_desc_bn || d.short_desc || '',
    short_description: d.short_desc || '',
    fullDesc: d.full_desc || '',
    fullDescBn: d.full_desc_bn || d.full_desc || '',
    full_description: d.full_desc || '',
    category: d.category || 'General Water Hygiene',
    iconName: d.icon_name || d.icon || 'Droplets',
    icon: d.icon || d.icon_name || 'Droplets',
    image: d.image || d.featured_image || 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg',
    featured_image: d.featured_image || d.image || 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg',
    is_active: d.is_active !== false,
    display_order: Number(d.display_order ?? 1),
    show_on_homepage: d.show_on_homepage !== false,
    show_in_navigation: d.show_in_navigation !== false,
    show_in_quote_form: d.show_in_quote_form !== false,
    startingPrice: Number(d.starting_price ?? 1500),
    startingPriceBn: d.starting_price_bn || `৳ ${Number(d.starting_price ?? 1500).toLocaleString('bn-BD')}`,
    popular: Boolean(d.popular),
    isCustomAdded: Boolean(d.is_custom_added),
    seo_title: d.seo_title || d.meta_title || `${d.title} in Dhaka | Sunviloz Clean Care`,
    metaTitle: d.meta_title || d.seo_title || `${d.title} in Dhaka | Sunviloz Clean Care`,
    meta_description: d.meta_description || d.meta_desc || d.short_desc || '',
    metaDesc: d.meta_desc || d.meta_description || d.short_desc || '',
    created_at: d.created_at || new Date().toISOString(),
    updated_at: d.updated_at || new Date().toISOString(),
    formConfig: d.form_config || {
      requiresTankMaterial: false,
      requiresTankCapacity: false,
      requiresPropertyDetails: true,
      requiresPipelineDetails: false
    },
    benefits: Array.isArray(d.benefits) ? d.benefits : ['মেকানাইজড ওয়াশ', 'ফুড-গ্রেড জীবাণুমুক্তকরণ'],
    benefitsBn: Array.isArray(d.benefits_bn) ? d.benefits_bn : (Array.isArray(d.benefits) ? d.benefits : []),
    process: Array.isArray(d.process) ? d.process : ['পরিদর্শন', 'মেকানাইজড পরিষ্কার', 'জীবাণুমুক্তকরণ', 'হ্যান্ডওভার'],
    processBn: Array.isArray(d.process_bn) ? d.process_bn : (Array.isArray(d.process) ? d.process : []),
    idealFor: Array.isArray(d.ideal_for) ? d.ideal_for : ['আবাসিক বাড়ি', 'অ্যাপার্টমেন্ট ভবন'],
    idealForBn: Array.isArray(d.ideal_for_bn) ? d.ideal_for_bn : (Array.isArray(d.ideal_for) ? d.ideal_for : []),
    faqs: Array.isArray(d.faqs) ? d.faqs : []
  });
}

/**
 * Maps an ExtensibleServiceItem to a database row for public.services.
 */
function mapServiceToRow(s: ExtensibleServiceItem): any {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    title_bn: s.titleBn || s.title,
    name: s.name || s.title,
    short_desc: s.shortDesc || s.short_description || null,
    short_desc_bn: s.shortDescBn || s.shortDesc || null,
    full_desc: s.fullDesc || s.full_description || null,
    full_desc_bn: s.fullDescBn || s.fullDesc || null,
    category: s.category || null,
    icon_name: s.iconName || s.icon || 'Droplets',
    icon: s.icon || s.iconName || 'Droplets',
    image: s.image || s.featured_image || null,
    featured_image: s.featured_image || s.image || null,
    is_active: s.is_active !== false,
    display_order: s.display_order ?? 1,
    show_on_homepage: s.show_on_homepage !== false,
    show_in_navigation: s.show_in_navigation !== false,
    show_in_quote_form: s.show_in_quote_form !== false,
    starting_price: s.startingPrice ?? 1500,
    starting_price_bn: s.startingPriceBn || null,
    popular: Boolean(s.popular),
    is_custom_added: Boolean(s.isCustomAdded),
    seo_title: s.seo_title || s.metaTitle || null,
    meta_title: s.metaTitle || s.seo_title || null,
    meta_description: s.meta_description || s.metaDesc || null,
    meta_desc: s.metaDesc || s.meta_description || null,
    form_config: s.formConfig || {},
    benefits: s.benefits || [],
    benefits_bn: s.benefitsBn || s.benefits || [],
    process: s.process || [],
    process_bn: s.processBn || s.process || [],
    ideal_for: s.idealFor || [],
    ideal_for_bn: s.idealForBn || s.idealFor || [],
    faqs: s.faqs || [],
    updated_at: new Date().toISOString()
  };
}

/**
 * Retrieve cached services when Supabase is configured, or bundled defaults strictly in offline/unconfigured mode.
 */
export const getStoredServices = (): ExtensibleServiceItem[] => {
  if (typeof window === 'undefined') {
    return isSupabaseConfigured() ? [] : INITIAL_SERVICES;
  }
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(sanitizeStoredService);
      }
    }
  } catch (err) {
    console.error('Failed to parse stored services:', err);
  }
  return isSupabaseConfigured() ? [] : INITIAL_SERVICES;
};

export interface ServiceFetchResult {
  services: ExtensibleServiceItem[];
  fromDatabase: boolean;
  error?: string;
}

/**
 * Authoritative Supabase fetch for services.
 * Separates DB query/network errors from legitimate empty results (`[]`).
 * Never auto-reseeds INITIAL_SERVICES on read.
 */
export const fetchServicesWithStatus = async (): Promise<ServiceFetchResult> => {
  if (!isSupabaseConfigured()) {
    return { services: INITIAL_SERVICES, fromDatabase: false };
  }

  let registryServiceImages: Record<string, string> = {};
  try {
    const registry = await fetchCentralImageRegistry();
    if (registry?.serviceImages) {
      registryServiceImages = registry.serviceImages;
    }
  } catch (regErr) {
    console.warn('[ServicesStore] Central registry hydration notice:', regErr);
  }

  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      return {
        services: getStoredServices(),
        fromDatabase: false,
        error: error.message
      };
    }

    let list: ExtensibleServiceItem[] = Array.isArray(data) ? data.map(mapRowToService) : [];

    if (list.length > 0 && Object.keys(registryServiceImages).length > 0) {
      list = list.map(item => {
        const rawUrl = registryServiceImages[item.id] || registryServiceImages[item.slug];
        const customUrl = rawUrl && !isDemoOrStockUrl(rawUrl) ? rawUrl : undefined;
        if (customUrl) {
          return {
            ...item,
            image: customUrl,
            featured_image: customUrl
          };
        }
        return item;
      });
    }

    if (typeof window !== 'undefined') {
      safeSetItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: list }));
    }

    return { services: list, fromDatabase: true };
  } catch (err: any) {
    return {
      services: getStoredServices(),
      fromDatabase: false,
      error: err?.message || 'Could not query services from Supabase'
    };
  }
};

export const fetchServicesFromSupabase = async (): Promise<ExtensibleServiceItem[]> => {
  const res = await fetchServicesWithStatus();
  return res.services;
};

/**
 * Returns only active services sorted by display_order.
 */
export const getActiveServices = (): ExtensibleServiceItem[] => {
  const all = getStoredServices();
  return all
    .filter(s => s.is_active !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
};

export const getHomepageServices = (): ExtensibleServiceItem[] => {
  return getActiveServices().filter(s => s.show_on_homepage !== false);
};

export const getNavigationServices = (): ExtensibleServiceItem[] => {
  return getActiveServices().filter(s => s.show_in_navigation !== false);
};

export const getQuoteFormServices = (): ExtensibleServiceItem[] => {
  return getActiveServices().filter(s => s.show_in_quote_form !== false);
};

/**
 * Save all services to storage, broadcast update event, and persist to Supabase.
 */
export const saveAllServices = async (services: ExtensibleServiceItem[]): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      if (services.length > 0) {
        const rows = services.map(mapServiceToRow);
        const { error } = await supabase.from('services').upsert(rows, { onConflict: 'id' });
        if (error) {
          console.error('Failed to sync services to Supabase:', error.message);
          return false;
        }
      }
    } catch (err) {
      console.error('Database connection error saving services:', err);
      return false;
    }
  }

  if (typeof window !== 'undefined') {
    safeSetItem(STORAGE_KEY, JSON.stringify(services));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: services }));
  }

  return true;
};

/**
 * Find service by slug or canonical alias.
 */
export const findServiceBySlug = (slug: string, servicesList?: ExtensibleServiceItem[]): ExtensibleServiceItem | undefined => {
  const list = servicesList || getStoredServices();
  const cleanSlug = slug.replace(/^\/+/, '').replace(/\/+$/, '');

  const direct = list.find(s => s.slug === cleanSlug);
  if (direct) return direct;

  const targetSlug = CANONICAL_SERVICE_ALIASES[cleanSlug];
  if (targetSlug) {
    const matched = list.find(s => s.slug === targetSlug);
    if (matched) return matched;
  }

  return list.find(s => s.slug.includes(cleanSlug) || cleanSlug.includes(s.slug));
};

/**
 * Add a new service dynamically and persist to Supabase.
 */
export const addNewService = async (serviceData: Partial<ExtensibleServiceItem>): Promise<ExtensibleServiceItem> => {
  const currentRes = await fetchServicesWithStatus();
  const current = currentRes.services;
  const id = serviceData.id || `srv-${Date.now()}`;
  let slug = serviceData.slug?.trim() || (serviceData.title || serviceData.name || 'service')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  if (current.some(s => s.slug === slug)) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const maxOrder = current.reduce((max, s) => Math.max(max, s.display_order || 0), 0);

  const newService: ExtensibleServiceItem = {
    id,
    slug,
    title: serviceData.title || serviceData.name || 'Custom Service',
    titleBn: serviceData.titleBn || serviceData.title || 'কাস্টম সার্ভিস',
    name: serviceData.name || serviceData.title || 'Custom Service',
    shortDesc: serviceData.shortDesc || serviceData.short_description || '',
    shortDescBn: serviceData.shortDescBn || serviceData.shortDesc || '',
    short_description: serviceData.short_description || serviceData.shortDesc || '',
    fullDesc: serviceData.fullDesc || serviceData.full_description || '',
    fullDescBn: serviceData.fullDescBn || serviceData.fullDesc || '',
    full_description: serviceData.full_description || serviceData.fullDesc || '',
    category: serviceData.category || 'General Water Hygiene',
    iconName: serviceData.iconName || serviceData.icon || 'Droplets',
    icon: serviceData.icon || serviceData.iconName || 'Droplets',
    image: serviceData.image || serviceData.featured_image || 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg',
    featured_image: serviceData.featured_image || serviceData.image || 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg',
    is_active: serviceData.is_active !== undefined ? serviceData.is_active : true,
    display_order: serviceData.display_order ?? (maxOrder + 1),
    show_on_homepage: serviceData.show_on_homepage !== undefined ? serviceData.show_on_homepage : true,
    show_in_navigation: serviceData.show_in_navigation !== undefined ? serviceData.show_in_navigation : true,
    show_in_quote_form: serviceData.show_in_quote_form !== undefined ? serviceData.show_in_quote_form : true,
    startingPrice: serviceData.startingPrice || 1500,
    startingPriceBn: serviceData.startingPriceBn || '৳ ১,৫০০',
    popular: !!serviceData.popular,
    isCustomAdded: true,
    seo_title: serviceData.seo_title || serviceData.metaTitle || `${serviceData.title || 'Service'} in Dhaka | Sunviloz Clean Care`,
    metaTitle: serviceData.metaTitle || serviceData.seo_title || `${serviceData.title || 'Service'} in Dhaka | Sunviloz Clean Care`,
    meta_description: serviceData.meta_description || serviceData.metaDesc || serviceData.shortDesc || '',
    metaDesc: serviceData.metaDesc || serviceData.meta_description || serviceData.shortDesc || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    formConfig: serviceData.formConfig || {
      requiresTankMaterial: false,
      requiresTankCapacity: false,
      requiresPropertyDetails: true,
      requiresPipelineDetails: false
    },
    benefits: serviceData.benefits && serviceData.benefits.length > 0
      ? serviceData.benefits
      : ['মেকানাইজড ওয়াশ', 'ফুড-গ্রেড জীবাণুমুক্তকরণ', 'দ্রুত সময়ে ডেলিভারি', 'সাশ্রয়ী কোটেশন'],
    benefitsBn: serviceData.benefitsBn || serviceData.benefits || ['মেকানাইজড ওয়াশ', 'ফুড-গ্রেড জীবাণুমুক্তকরণ'],
    process: serviceData.process && serviceData.process.length > 0
      ? serviceData.process
      : ['পরিদর্শন', 'মেকানাইজড পরিষ্কার', 'জীবাণুমুক্তকরণ', 'হ্যান্ডওভার'],
    processBn: serviceData.processBn || serviceData.process || ['পরিদর্শন', 'মেকানাইজড পরিষ্কার'],
    idealFor: serviceData.idealFor || ['আবাসিক বাড়ি', 'অ্যাপার্টমেন্ট ভবন'],
    idealForBn: serviceData.idealForBn || ['আবাসিক বাড়ি', 'অ্যাপার্টমেন্ট ভবন'],
    faqs: serviceData.faqs || []
  };

  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('services').upsert(mapServiceToRow(newService), { onConflict: 'id' });
    if (error) {
      throw new Error(error.message);
    }
    await fetchServicesWithStatus();
  } else {
    const updated = [...current, newService];
    await saveAllServices(updated);
  }

  if (newService.is_active !== false && newService.slug) {
    enqueueIndexNowUrls(['/services', `/services/${newService.slug}`], {
      action: 'publish_service',
      entityType: 'service',
      entitySlug: newService.slug,
      verifyPublic: true
    }).catch(() => {});
  }

  return newService;
};

/**
 * Update existing service and persist to Supabase.
 */
export const updateService = async (id: string, updates: Partial<ExtensibleServiceItem>): Promise<boolean> => {
  const currentRes = await fetchServicesWithStatus();
  const current = currentRes.services;
  const index = current.findIndex(s => s.id === id);
  if (index === -1) return false;

  const updatedItem: ExtensibleServiceItem = {
    ...current[index],
    ...updates,
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('services').upsert(mapServiceToRow(updatedItem), { onConflict: 'id' });
    if (error) {
      console.error('Supabase update service error:', error.message);
      return false;
    }
    await fetchServicesWithStatus();
  } else {
    current[index] = updatedItem;
    await saveAllServices(current);
  }

  if (updatedItem.slug) {
    const isActive = updatedItem.is_active !== false;
    enqueueIndexNowUrls(['/services', `/services/${updatedItem.slug}`], {
      action: isActive ? 'update_service' : 'hide_service',
      entityType: 'service',
      entitySlug: updatedItem.slug,
      verifyPublic: isActive
    }).catch(() => {});
  }

  return true;
};

/**
 * Toggle active state.
 */
export const toggleServiceActive = async (id: string, isActive?: boolean): Promise<boolean> => {
  const currentRes = await fetchServicesWithStatus();
  const current = currentRes.services;
  const index = current.findIndex(s => s.id === id);
  if (index === -1) return false;

  const newStatus = isActive !== undefined ? isActive : !current[index].is_active;
  return await updateService(id, { is_active: newStatus });
};

/**
 * Delete a service from local cache and Supabase.
 */
export const deleteService = async (id: string): Promise<boolean> => {
  const current = getStoredServices();
  const matched = current.find(s => s.id === id);
  const targetSlug = matched?.slug || '';

  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete service error:', error.message);
      return false;
    }
    await fetchServicesWithStatus();
  } else {
    const filtered = current.filter(s => s.id !== id);
    await saveAllServices(filtered);
  }

  enqueueIndexNowUrls(['/services', ...(targetSlug ? [`/services/${targetSlug}`] : [])], {
    action: 'delete_service',
    entityType: 'service',
    entitySlug: targetSlug || id,
    verifyPublic: false
  }).catch(() => {});

  return true;
};

/**
 * Reorder services.
 */
export const reorderServices = async (orderedIds: string[]): Promise<boolean> => {
  const currentRes = await fetchServicesWithStatus();
  const current = currentRes.services;
  const updated = current.map(s => {
    const idx = orderedIds.indexOf(s.id);
    return idx !== -1 ? { ...s, display_order: idx + 1 } : s;
  });
  updated.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  return await saveAllServices(updated);
};

export const seedDefaultServices = async (): Promise<{ success: boolean; count: number; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, count: 0, error: 'Supabase সংযুক্ত নয়।' };
  }
  const rows = INITIAL_SERVICES.map(mapServiceToRow);
  const { error } = await supabase.from('services').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
  if (error) return { success: false, count: 0, error: error.message };
  await fetchServicesWithStatus();
  return { success: true, count: rows.length };
};

export const resetServicesToDefault = async (): Promise<ExtensibleServiceItem[]> => {
  await saveAllServices(INITIAL_SERVICES);
  return INITIAL_SERVICES;
};

/**
 * React hook for services with live Supabase Realtime synchronization.
 */
export const useServices = () => {
  const [allServices, setAllServices] = useState<ExtensibleServiceItem[]>(() => getStoredServices());
  const [loading, setLoading] = useState<boolean>(() => isSupabaseConfigured());
  const [fromDatabase, setFromDatabase] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadLatest = async () => {
    const res = await fetchServicesWithStatus();
    setAllServices(res.services);
    setFromDatabase(res.fromDatabase);
    setError(res.error || null);
    setLoading(false);
  };

  useEffect(() => {
    loadLatest();

    const handleUpdate = (e: any) => {
      if (Array.isArray(e?.detail)) {
        setAllServices(e.detail);
      } else {
        setAllServices(getStoredServices());
      }
    };
    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener(CENTRAL_IMAGES_EVENT, handleUpdate);

    let channel: any = null;
    const realtimeTimer = setTimeout(() => {
      if (isSupabaseConfigured() && typeof window !== 'undefined') {
        try {
          channel = supabase
            .channel('realtime:services')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'services' },
              () => {
                loadLatest();
              }
            )
            .subscribe();
        } catch (err) {
          console.warn('Realtime services notice:', err);
        }
      }
    }, 2500);

    return () => {
      clearTimeout(realtimeTimer);
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener(CENTRAL_IMAGES_EVENT, handleUpdate);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const activeServices = allServices
    .filter(s => s.is_active !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const homepageServices = activeServices.filter(s => s.show_on_homepage !== false);
  const navigationServices = activeServices.filter(s => s.show_in_navigation !== false);
  const quoteFormServices = activeServices.filter(s => s.show_in_quote_form !== false);

  return {
    services: activeServices,
    activeServices,
    allServices,
    homepageServices,
    navigationServices,
    quoteFormServices,
    loading,
    fromDatabase,
    error,
    addNewService,
    updateService,
    toggleServiceActive,
    deleteService,
    reorderServices,
    resetServicesToDefault,
    refreshServices: loadLatest,
    getServiceBySlug: (slug: string) => findServiceBySlug(slug, allServices)
  };
};

export const getServices = getActiveServices;
export const getAllServicesForAdmin = getStoredServices;

export const saveService = async (service: ServiceItem): Promise<boolean> => {
  const res = await fetchServicesWithStatus();
  const all = res.services;
  const index = all.findIndex(s => s.id === service.id);
  if (index >= 0) {
    return await updateService(service.id, service);
  } else {
    await addNewService(service);
    return true;
  }
};
