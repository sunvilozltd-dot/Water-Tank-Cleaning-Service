import { useState, useEffect } from 'react';
import { ServiceItem } from '../types';
import { 
  AUTHORITATIVE_SERVICES, 
  CANONICAL_SERVICE_ALIASES, 
  ExtensibleServiceItem 
} from '../services/serviceRegistry';
import { safeGetItem, safeSetItem } from './safeLocalStorage';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'sunviloz_authoritative_services_v8';
const EVENT_NAME = 'sunviloz_services_changed';

export const INITIAL_SERVICES: ExtensibleServiceItem[] = AUTHORITATIVE_SERVICES;

/**
 * Ensures canonical image assets for the core 3 services
 */
const sanitizeStoredService = (s: ExtensibleServiceItem): ExtensibleServiceItem => {
  if (s.id === 'srv-overhead-water-tank' || s.slug === 'overhead-water-tank-cleaning') {
    return {
      ...s,
      image: s.image || 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=1200&q=75',
      featured_image: s.featured_image || s.image || 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=1200&q=75'
    };
  }
  if (s.id === 'srv-underground-water-tank' || s.slug === 'underground-water-tank-cleaning') {
    return {
      ...s,
      image: s.image || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=75',
      featured_image: s.featured_image || s.image || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=75'
    };
  }
  if (s.id === 'srv-water-pipeline' || s.slug === 'water-pipeline-cleaning') {
    return {
      ...s,
      image: s.image || 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=75',
      featured_image: s.featured_image || s.image || 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=75'
    };
  }
  return s;
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
    image: d.image || d.featured_image || 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=1200&q=75',
    featured_image: d.featured_image || d.image || 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=1200&q=75',
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
    benefits: Array.isArray(d.benefits) ? d.benefits : ['মেকানাইজড ওয়াশ', '১০০% জীবাণুমুক্তকরণ'],
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
 * Retrieve stored services with fallback to authoritative defaults.
 * Synchronous for instant render.
 */
export const getStoredServices = (): ExtensibleServiceItem[] => {
  if (typeof window === 'undefined') return INITIAL_SERVICES;
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) {
      safeSetItem(STORAGE_KEY, JSON.stringify(INITIAL_SERVICES));
      return INITIAL_SERVICES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(sanitizeStoredService);
    }
    return INITIAL_SERVICES;
  } catch (err) {
    console.error('Failed to parse stored services:', err);
    return INITIAL_SERVICES;
  }
};

/**
 * Authoritative Supabase fetch for services.
 * Populates local cache and returns latest database records.
 */
export const fetchServicesFromSupabase = async (): Promise<ExtensibleServiceItem[]> => {
  let list = getStoredServices();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        list = data.map(mapRowToService);
        if (typeof window !== 'undefined') {
          safeSetItem(STORAGE_KEY, JSON.stringify(list));
          window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: list }));
        }
      } else if (!error && Array.isArray(data) && data.length === 0) {
        // Table exists but empty, seed authoritative initial services to Supabase
        const rows = INITIAL_SERVICES.map(mapServiceToRow);
        await supabase.from('services').upsert(rows, { onConflict: 'id' });
      }
    } catch (err) {
      console.warn('Could not query services from Supabase, using local cache:', err);
    }
  }

  return list;
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
  if (typeof window !== 'undefined') {
    safeSetItem(STORAGE_KEY, JSON.stringify(services));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: services }));
  }

  if (isSupabaseConfigured()) {
    try {
      const rows = services.map(mapServiceToRow);
      const { error } = await supabase.from('services').upsert(rows, { onConflict: 'id' });
      if (error) {
        console.error('Failed to sync services to Supabase:', error.message);
        return false;
      }
    } catch (err) {
      console.error('Database connection error saving services:', err);
      return false;
    }
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
  const current = getStoredServices();
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
    image: serviceData.image || serviceData.featured_image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
    featured_image: serviceData.featured_image || serviceData.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
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
      : ['মেকানাইজড ওয়াশ', '১০০% জীবাণুমুক্তকরণ', 'দ্রুত সময়ে ডেলিভারি', 'সাশ্রয়ী কোটেশন'],
    benefitsBn: serviceData.benefitsBn || serviceData.benefits || ['মেকানাইজড ওয়াশ', '১০০% জীবাণুমুক্তকরণ'],
    process: serviceData.process && serviceData.process.length > 0
      ? serviceData.process
      : ['পরিদর্শন', 'মেকানাইজড পরিষ্কার', 'জীবাণুমুক্তকরণ', 'হ্যান্ডওভার'],
    processBn: serviceData.processBn || serviceData.process || ['পরিদর্শন', 'মেকানাইজড পরিষ্কার'],
    idealFor: serviceData.idealFor || ['আবাসিক বাড়ি', 'অ্যাপার্টমেন্ট ভবন'],
    idealForBn: serviceData.idealForBn || ['আবাসিক বাড়ি', 'অ্যাপার্টমেন্ট ভবন'],
    faqs: serviceData.faqs || []
  };

  const updated = [...current, newService];
  await saveAllServices(updated);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('services').upsert(mapServiceToRow(newService), { onConflict: 'id' });
    } catch (err) {
      console.warn('Direct service insert notice:', err);
    }
  }

  return newService;
};

/**
 * Update existing service and persist to Supabase.
 */
export const updateService = async (id: string, updates: Partial<ExtensibleServiceItem>): Promise<boolean> => {
  const current = getStoredServices();
  const index = current.findIndex(s => s.id === id);
  if (index === -1) return false;

  current[index] = {
    ...current[index],
    ...updates,
    updated_at: new Date().toISOString()
  };

  await saveAllServices(current);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('services').upsert(mapServiceToRow(current[index]), { onConflict: 'id' });
    } catch (err) {
      console.warn('Direct service update notice:', err);
    }
  }

  return true;
};

/**
 * Toggle active state.
 */
export const toggleServiceActive = async (id: string, isActive?: boolean): Promise<boolean> => {
  const current = getStoredServices();
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
  const filtered = current.filter(s => s.id !== id);
  if (filtered.length === current.length) return false;

  await saveAllServices(filtered);

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) {
        console.error('Supabase delete service error:', error.message);
      }
    } catch (err) {
      console.error('Failed to delete service from Supabase:', err);
    }
  }

  return true;
};

/**
 * Reorder services.
 */
export const reorderServices = async (orderedIds: string[]): Promise<boolean> => {
  const current = getStoredServices();
  const updated = current.map(s => {
    const idx = orderedIds.indexOf(s.id);
    return idx !== -1 ? { ...s, display_order: idx + 1 } : s;
  });
  updated.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  return await saveAllServices(updated);
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

  useEffect(() => {
    // 1. Initial authoritative fetch from Supabase
    fetchServicesFromSupabase().then(latest => {
      if (latest && latest.length > 0) {
        setAllServices(latest);
      }
    });

    // 2. In-tab event listener
    const handleUpdate = () => {
      setAllServices(getStoredServices());
    };
    window.addEventListener(EVENT_NAME, handleUpdate);

    // 3. Supabase Realtime subscription for cross-device updates
    let channel: any = null;
    if (isSupabaseConfigured()) {
      try {
        channel = supabase
          .channel('realtime:services')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'services' },
            () => {
              fetchServicesFromSupabase();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime services notice:', err);
      }
    }

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
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
    addNewService,
    updateService,
    toggleServiceActive,
    deleteService,
    reorderServices,
    resetServicesToDefault,
    getServiceBySlug: (slug: string) => findServiceBySlug(slug, allServices)
  };
};

export const getServices = getActiveServices;
export const getAllServicesForAdmin = getStoredServices;

export const saveService = async (service: ServiceItem): Promise<boolean> => {
  const all = getStoredServices();
  const index = all.findIndex(s => s.id === service.id);
  if (index >= 0) {
    return await updateService(service.id, service);
  } else {
    await addNewService(service);
    return true;
  }
};
