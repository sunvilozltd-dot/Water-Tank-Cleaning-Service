import { useState, useEffect } from 'react';
import { ServiceItem } from '../types';
import { 
  AUTHORITATIVE_SERVICES, 
  CANONICAL_SERVICE_ALIASES, 
  ExtensibleServiceItem 
} from '../services/serviceRegistry';
import { safeGetItem, safeSetItem } from './safeLocalStorage';

const STORAGE_KEY = 'sunviloz_authoritative_services_v7';
const EVENT_NAME = 'sunviloz_services_changed';

export const INITIAL_SERVICES: ExtensibleServiceItem[] = AUTHORITATIVE_SERVICES;

/**
 * Retrieve stored services with fallback to authoritative defaults.
 * Preserves all active and customized services and merges newly added authoritative services.
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
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_SERVICES;
  } catch (err) {
    console.error('Failed to parse stored services:', err);
    return INITIAL_SERVICES;
  }
};

/**
 * Returns only active services sorted by display_order.
 * Excludes discontinued/archived services from public view.
 */
export const getActiveServices = (): ExtensibleServiceItem[] => {
  const all = getStoredServices();
  return all
    .filter(s => s.is_active !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
};

/**
 * Returns active services marked to show on the homepage.
 */
export const getHomepageServices = (): ExtensibleServiceItem[] => {
  return getActiveServices().filter(s => s.show_on_homepage !== false);
};

/**
 * Returns active services marked to show in navigation.
 */
export const getNavigationServices = (): ExtensibleServiceItem[] => {
  return getActiveServices().filter(s => s.show_in_navigation !== false);
};

/**
 * Returns active services marked to show in the quotation form.
 */
export const getQuoteFormServices = (): ExtensibleServiceItem[] => {
  return getActiveServices().filter(s => s.show_in_quote_form !== false);
};

/**
 * Save all services to storage and broadcast update event.
 */
export const saveAllServices = (services: ExtensibleServiceItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    safeSetItem(STORAGE_KEY, JSON.stringify(services));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: services }));
  } catch (err) {
    console.error('Failed to save services:', err);
  }
};

/**
 * Find service by slug or canonical alias.
 */
export const findServiceBySlug = (slug: string, servicesList?: ExtensibleServiceItem[]): ExtensibleServiceItem | undefined => {
  const list = servicesList || getStoredServices();
  const cleanSlug = slug.replace(/^\/+/, '').replace(/\/+$/, '');

  // 1. Direct match among all services
  const direct = list.find(s => s.slug === cleanSlug);
  if (direct) return direct;

  // 2. Canonical alias resolution
  const targetSlug = CANONICAL_SERVICE_ALIASES[cleanSlug];
  if (targetSlug) {
    const matched = list.find(s => s.slug === targetSlug);
    if (matched) return matched;
  }

  // 3. Partial contains fallback
  return list.find(s => s.slug.includes(cleanSlug) || cleanSlug.includes(s.slug));
};

/**
 * Add a new service dynamically.
 */
export const addNewService = (serviceData: Partial<ExtensibleServiceItem>): ExtensibleServiceItem => {
  const current = getStoredServices();
  const id = serviceData.id || `custom-srv-${Date.now()}`;
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
  saveAllServices(updated);
  return newService;
};

/**
 * Update existing service.
 */
export const updateService = (id: string, updates: Partial<ExtensibleServiceItem>): boolean => {
  const current = getStoredServices();
  const index = current.findIndex(s => s.id === id);
  if (index === -1) return false;

  current[index] = {
    ...current[index],
    ...updates,
    updated_at: new Date().toISOString()
  };

  saveAllServices(current);
  return true;
};

/**
 * Toggle active state.
 */
export const toggleServiceActive = (id: string, isActive?: boolean): boolean => {
  const current = getStoredServices();
  const index = current.findIndex(s => s.id === id);
  if (index === -1) return false;

  const newStatus = isActive !== undefined ? isActive : !current[index].is_active;
  current[index].is_active = newStatus;
  current[index].updated_at = new Date().toISOString();

  saveAllServices(current);
  return true;
};

/**
 * Delete a service.
 */
export const deleteService = (id: string): boolean => {
  const current = getStoredServices();
  const filtered = current.filter(s => s.id !== id);
  if (filtered.length === current.length) return false;
  saveAllServices(filtered);
  return true;
};

/**
 * Reorder services.
 */
export const reorderServices = (orderedIds: string[]): boolean => {
  const current = getStoredServices();
  const updated = current.map(s => {
    const idx = orderedIds.indexOf(s.id);
    return idx !== -1 ? { ...s, display_order: idx + 1 } : s;
  });
  updated.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  saveAllServices(updated);
  return true;
};

/**
 * Reset to default 3 active services.
 */
export const resetServicesToDefault = (): ExtensibleServiceItem[] => {
  saveAllServices(INITIAL_SERVICES);
  return INITIAL_SERVICES;
};

/**
 * React hook for services.
 */
export const useServices = () => {
  const [allServices, setAllServices] = useState<ExtensibleServiceItem[]>(() => getStoredServices());

  useEffect(() => {
    const handleUpdate = () => {
      setAllServices(getStoredServices());
    };
    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(EVENT_NAME, handleUpdate);
  }, []);

  const activeServices = allServices
    .filter(s => s.is_active !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const homepageServices = activeServices.filter(s => s.show_on_homepage !== false);
  const navigationServices = activeServices.filter(s => s.show_in_navigation !== false);
  const quoteFormServices = activeServices.filter(s => s.show_in_quote_form !== false);

  return {
    // For backwards compatibility, `services` refers to active services
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
export const saveService = (service: ServiceItem): boolean => {
  const all = getStoredServices();
  const index = all.findIndex(s => s.id === service.id);
  if (index >= 0) {
    return updateService(service.id, service);
  } else {
    addNewService(service);
    return true;
  }
};
