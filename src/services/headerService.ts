import { HeaderConfig, NavItem } from '../types/header';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { safeGetItem, safeSetItem } from '../utils/safeLocalStorage';

export const HEADER_CHANGE_EVENT = 'sunviloz_header_nav_updated';

// Local storage cache keys for resilient fast initial loading
const HEADER_CACHE_KEY = 'sunviloz_header_config_cache_v3';
const NAV_CACHE_KEY = 'sunviloz_nav_items_cache_v3';

export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  id: 'primary',
  logoUrl: '',
  logoAlt: 'Sunviloz Clean Care Logo',
  logoWidth: 40,
  logoHeight: 40,
  logoEnabled: true,
  logoDestination: '/',
  logoPosition: 'left',
  brandName: 'Sunviloz',
  brandSuffix: 'Clean Care',
  brandTaglineBn: 'ঢাকা শহরের নির্ভরযোগ্য ওয়াটার ট্যাংক ক্লিনিং সার্ভিস',
  brandTaglineEn: 'Water Tank Cleaning • Dhaka',
  brandVisible: true,
  brandFontSize: 'base',
  phone: '+8801609999612',
  phoneDisplay: '01609-999612',
  phoneLabelBn: 'কল করুন',
  phoneLabelEn: 'Call Us',
  phoneVisible: true,
  whatsappNumber: '8801609999612',
  whatsappLabelBn: 'WhatsApp',
  whatsappLabelEn: 'WhatsApp',
  whatsappMessage: 'Hello Sunviloz Clean Care, I want to inquire about Water Tank Cleaning service in Dhaka.',
  whatsappVisible: true,
  ctaTextBn: 'কোটেশন নিন',
  ctaTextEn: 'Get Free Quote',
  ctaUrl: '/get-quote',
  ctaVisible: true,
  ctaStyle: 'navy',
  headerHeight: 'standard',
  isSticky: true,
  showShadow: true,
  headerBgColor: '#07172C',
  menuTextColor: '#e2e8f0',
  menuActiveColor: '#38bdf8',
  menuHoverColor: '#ffffff',
  updatedAt: new Date().toISOString()
};

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    id: 'nav-home',
    label: 'Home',
    labelBn: 'হোম',
    labelEn: 'Home',
    url: '/',
    openNewTab: false,
    isVisible: true,
    sortOrder: 1,
    parentId: null
  },
  {
    id: 'nav-services',
    label: 'Services',
    labelBn: 'সার্ভিসসমূহ',
    labelEn: 'Services',
    url: '/services',
    openNewTab: false,
    isVisible: true,
    sortOrder: 2,
    parentId: null
  },
  {
    id: 'nav-areas',
    label: 'Service Areas',
    labelBn: 'কভারেজ এলাকা',
    labelEn: 'Service Areas',
    url: '/service-areas',
    openNewTab: false,
    isVisible: true,
    sortOrder: 3,
    parentId: null
  },
  {
    id: 'nav-process',
    label: 'Method',
    labelBn: 'ক্লিনিং পদ্ধতি',
    labelEn: 'Cleaning Method',
    url: '#process',
    openNewTab: false,
    isVisible: true,
    sortOrder: 4,
    parentId: null
  },
  {
    id: 'nav-pricing',
    label: 'Pricing',
    labelBn: 'রেট কার্ড',
    labelEn: 'Pricing',
    url: '#pricing',
    openNewTab: false,
    isVisible: true,
    sortOrder: 5,
    parentId: null
  },
  {
    id: 'nav-blog',
    label: 'Cleaning Guide',
    labelBn: 'টিপস ও গাইড',
    labelEn: 'Cleaning Guide',
    url: '#blog',
    openNewTab: false,
    isVisible: true,
    sortOrder: 6,
    parentId: null
  },
  {
    id: 'nav-reviews',
    label: 'Reviews',
    labelBn: 'রিভিউ',
    labelEn: 'Reviews',
    url: '#reviews',
    openNewTab: false,
    isVisible: true,
    sortOrder: 7,
    parentId: null
  },
  {
    id: 'nav-faq',
    label: 'FAQ',
    labelBn: 'প্রশ্নোত্তর',
    labelEn: 'FAQ',
    url: '#faq',
    openNewTab: false,
    isVisible: true,
    sortOrder: 8,
    parentId: null
  },
  {
    id: 'nav-contact',
    label: 'Contact',
    labelBn: 'যোগাযোগ',
    labelEn: 'Contact Us',
    url: '/contact',
    openNewTab: false,
    isVisible: true,
    sortOrder: 9,
    parentId: null
  }
];

// Safe Storage Accessor for Browser and Node environments
function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  return null;
}

// Helper to notify all subscribers
function notifyHeaderSubscribers() {
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent(HEADER_CHANGE_EVENT));
  }
}

/**
 * Fetch Header configuration from Supabase (with resilient local cache fallback)
 */
export async function getHeaderConfig(): Promise<HeaderConfig> {
  // 1. Try local cache first for instant synchronous render
  let cached: HeaderConfig = DEFAULT_HEADER_CONFIG;
  try {
    const raw = safeGetItem(HEADER_CACHE_KEY);
    if (raw) {
      cached = { ...DEFAULT_HEADER_CONFIG, ...JSON.parse(raw) };
    }
  } catch {
    // Ignore cache parse error
  }

  // 2. Query Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('site_header')
        .select('*')
        .eq('id', 'primary')
        .maybeSingle();

      if (!error && data) {
        const merged: HeaderConfig = {
          id: data.id || 'primary',
          logoUrl: data.logo_url ?? cached.logoUrl,
          logoAlt: data.logo_alt ?? cached.logoAlt,
          logoWidth: Number(data.logo_width) || cached.logoWidth,
          logoHeight: Number(data.logo_height) || cached.logoHeight,
          logoEnabled: data.logo_enabled ?? cached.logoEnabled,
          logoDestination: data.logo_destination ?? cached.logoDestination,
          logoPosition: data.logo_position ?? cached.logoPosition,
          brandName: data.brand_name ?? cached.brandName,
          brandSuffix: data.brand_suffix ?? cached.brandSuffix,
          brandTaglineBn: data.brand_tagline_bn ?? cached.brandTaglineBn,
          brandTaglineEn: data.brand_tagline_en ?? cached.brandTaglineEn,
          brandVisible: data.brand_visible ?? cached.brandVisible,
          brandFontSize: data.brand_font_size ?? cached.brandFontSize,
          phone: data.phone_number ?? cached.phone,
          phoneDisplay: data.phone_label ?? cached.phoneDisplay,
          phoneLabelBn: cached.phoneLabelBn,
          phoneLabelEn: cached.phoneLabelEn,
          phoneVisible: data.phone_enabled ?? cached.phoneVisible,
          whatsappNumber: data.whatsapp_number ?? cached.whatsappNumber,
          whatsappLabelBn: data.whatsapp_label ?? cached.whatsappLabelBn,
          whatsappLabelEn: data.whatsapp_label ?? cached.whatsappLabelEn,
          whatsappMessage: data.whatsapp_message ?? cached.whatsappMessage,
          whatsappVisible: data.whatsapp_enabled ?? cached.whatsappVisible,
          ctaTextBn: data.cta_text ?? cached.ctaTextBn,
          ctaTextEn: data.cta_text_en ?? cached.ctaTextEn,
          ctaUrl: data.cta_url ?? cached.ctaUrl,
          ctaVisible: data.cta_enabled ?? cached.ctaVisible,
          ctaStyle: data.cta_style ?? cached.ctaStyle,
          headerHeight: data.header_height ?? cached.headerHeight,
          isSticky: data.is_sticky ?? cached.isSticky,
          showShadow: data.show_shadow ?? cached.showShadow,
          headerBgColor: data.header_bg_color ?? cached.headerBgColor,
          menuTextColor: data.menu_text_color ?? cached.menuTextColor,
          menuActiveColor: data.menu_active_color ?? cached.menuActiveColor,
          menuHoverColor: data.menu_hover_color ?? cached.menuHoverColor,
          updatedAt: data.updated_at
        };
        safeSetItem(HEADER_CACHE_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.warn('Could not retrieve site_header from Supabase:', err);
    }
  }

  return cached;
}

/**
 * Save Header configuration to Supabase
 */
export async function saveHeaderConfig(config: HeaderConfig): Promise<boolean> {
  const updatedConfig: HeaderConfig = {
    ...config,
    updatedAt: new Date().toISOString()
  };

  // Update local persistent cache immediately
  safeSetItem(HEADER_CACHE_KEY, JSON.stringify(updatedConfig));
  notifyHeaderSubscribers();

  if (isSupabaseConfigured()) {
    try {
      const payload = {
        id: 'primary',
        logo_url: updatedConfig.logoUrl || null,
        logo_alt: updatedConfig.logoAlt || 'Sunviloz Clean Care Logo',
        logo_width: updatedConfig.logoWidth,
        logo_height: updatedConfig.logoHeight,
        logo_enabled: updatedConfig.logoEnabled,
        logo_destination: updatedConfig.logoDestination || '/',
        logo_position: updatedConfig.logoPosition || 'left',
        brand_name: updatedConfig.brandName,
        brand_suffix: updatedConfig.brandSuffix,
        brand_tagline_bn: updatedConfig.brandTaglineBn,
        brand_tagline_en: updatedConfig.brandTaglineEn,
        brand_visible: updatedConfig.brandVisible,
        brand_font_size: updatedConfig.brandFontSize,
        phone_number: updatedConfig.phone,
        phone_label: updatedConfig.phoneDisplay,
        phone_enabled: updatedConfig.phoneVisible,
        whatsapp_number: updatedConfig.whatsappNumber,
        whatsapp_label: updatedConfig.whatsappLabelBn,
        whatsapp_message: updatedConfig.whatsappMessage,
        whatsapp_enabled: updatedConfig.whatsappVisible,
        cta_text: updatedConfig.ctaTextBn,
        cta_text_en: updatedConfig.ctaTextEn,
        cta_url: updatedConfig.ctaUrl,
        cta_enabled: updatedConfig.ctaVisible,
        cta_style: updatedConfig.ctaStyle,
        header_height: updatedConfig.headerHeight,
        is_sticky: updatedConfig.isSticky,
        show_shadow: updatedConfig.showShadow,
        header_bg_color: updatedConfig.headerBgColor,
        menu_text_color: updatedConfig.menuTextColor,
        menu_active_color: updatedConfig.menuActiveColor,
        menu_hover_color: updatedConfig.menuHoverColor,
        updated_at: updatedConfig.updatedAt
      };

      const { error } = await supabase
        .from('site_header')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('Supabase site_header save error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Failed to save header to Supabase:', err);
      return false;
    }
  }

  return true;
}

/**
 * Fetch Navigation items from Supabase
 */
export async function getNavItems(): Promise<NavItem[]> {
  let cached: NavItem[] = DEFAULT_NAV_ITEMS;
  try {
    const raw = safeGetItem(NAV_CACHE_KEY);
    if (raw) {
      cached = JSON.parse(raw);
    }
  } catch {
    // Ignore
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const items: NavItem[] = data.map((d: any) => ({
          id: d.id,
          label: d.label,
          labelBn: d.label_bn,
          labelEn: d.label_en || d.label,
          url: d.url,
          icon: d.icon || undefined,
          openNewTab: Boolean(d.open_new_tab),
          isVisible: Boolean(d.is_visible),
          sortOrder: Number(d.sort_order),
          parentId: d.parent_id || null
        }));
        safeSetItem(NAV_CACHE_KEY, JSON.stringify(items));
        return items;
      }
    } catch (err) {
      console.warn('Could not retrieve navigation_items from Supabase:', err);
    }
  }

  return cached;
}

/**
 * Build hierarchical navigation tree with children for dropdown support
 */
export function buildNavTree(items: NavItem[]): NavItem[] {
  const itemMap = new Map<string, NavItem>();
  const topLevel: NavItem[] = [];

  // Clone items to avoid mutating originals
  items.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  items.forEach(item => {
    const mappedItem = itemMap.get(item.id)!;
    if (item.parentId && itemMap.has(item.parentId)) {
      const parent = itemMap.get(item.parentId)!;
      if (!parent.children) parent.children = [];
      parent.children.push(mappedItem);
      parent.children.sort((a, b) => a.sortOrder - b.sortOrder);
    } else {
      topLevel.push(mappedItem);
    }
  });

  topLevel.sort((a, b) => a.sortOrder - b.sortOrder);
  return topLevel;
}

/**
 * Save single Navigation Item to Supabase
 */
export async function saveNavItem(item: NavItem): Promise<boolean> {
  const currentItems = await getNavItems();
  const exists = currentItems.some(i => i.id === item.id);
  const updatedList = exists
    ? currentItems.map(i => i.id === item.id ? item : i)
    : [...currentItems, item];

  safeSetItem(NAV_CACHE_KEY, JSON.stringify(updatedList));
  notifyHeaderSubscribers();

  if (isSupabaseConfigured()) {
    try {
      const payload = {
        id: item.id,
        label: item.label,
        label_bn: item.labelBn,
        label_en: item.labelEn || item.label,
        url: item.url,
        icon: item.icon || null,
        open_new_tab: Boolean(item.openNewTab),
        is_visible: Boolean(item.isVisible),
        sort_order: item.sortOrder,
        parent_id: item.parentId || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('navigation_items')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('Supabase nav item save error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Failed to save nav item to Supabase:', err);
      return false;
    }
  }

  return true;
}

/**
 * Delete Navigation Item from Supabase
 */
export async function deleteNavItem(id: string): Promise<boolean> {
  const currentItems = await getNavItems();
  const updatedList = currentItems.filter(i => i.id !== id && i.parentId !== id);

  safeSetItem(NAV_CACHE_KEY, JSON.stringify(updatedList));
  notifyHeaderSubscribers();

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('navigation_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase nav item delete error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Failed to delete nav item:', err);
      return false;
    }
  }

  return true;
}

/**
 * Reorder Navigation Items and save order to Supabase
 */
export async function reorderNavItems(items: NavItem[]): Promise<boolean> {
  // Normalize sortOrder (1, 2, 3...)
  const normalized = items.map((item, idx) => ({
    ...item,
    sortOrder: idx + 1
  }));

  safeSetItem(NAV_CACHE_KEY, JSON.stringify(normalized));
  notifyHeaderSubscribers();

  if (isSupabaseConfigured()) {
    try {
      const updates = normalized.map(item => ({
        id: item.id,
        label: item.label,
        label_bn: item.labelBn,
        label_en: item.labelEn || item.label,
        url: item.url,
        icon: item.icon || null,
        open_new_tab: Boolean(item.openNewTab),
        is_visible: Boolean(item.isVisible),
        sort_order: item.sortOrder,
        parent_id: item.parentId || null,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('navigation_items')
        .upsert(updates, { onConflict: 'id' });

      if (error) {
        console.error('Supabase reorder nav items error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Failed to reorder nav items in Supabase:', err);
      return false;
    }
  }

  return true;
}

/**
 * Reset Header and Navigation configuration to factory defaults
 */
export async function resetHeaderNavToDefault(): Promise<{ config: HeaderConfig; items: NavItem[] }> {
  const storage = getStorage();
  if (storage) {
    storage.setItem(HEADER_CACHE_KEY, JSON.stringify(DEFAULT_HEADER_CONFIG));
    storage.setItem(NAV_CACHE_KEY, JSON.stringify(DEFAULT_NAV_ITEMS));
  }
  notifyHeaderSubscribers();

  if (isSupabaseConfigured()) {
    try {
      await saveHeaderConfig(DEFAULT_HEADER_CONFIG);
      await reorderNavItems(DEFAULT_NAV_ITEMS);
    } catch (err) {
      console.warn('Could not reset Supabase header config to default:', err);
    }
  }

  return {
    config: DEFAULT_HEADER_CONFIG,
    items: DEFAULT_NAV_ITEMS
  };
}

/**
 * Upload logo file to Supabase Storage bucket 'site-assets'
 * Does NOT store Base64 in database or localStorage
 */
export async function uploadLogoToStorage(file: File): Promise<{ url: string | null; error: string | null }> {
  if (!file) {
    return { url: null, error: 'No file selected' };
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { url: null, error: 'File size must be under 5MB' };
  }

  // Check file type
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { url: null, error: 'Please upload a PNG, SVG, JPG, or WebP image.' };
  }

  if (!isSupabaseConfigured()) {
    return {
      url: null,
      error: 'Supabase is not configured yet. Configure Supabase credentials to use Supabase Storage, or enter an Image URL directly.'
    };
  }

  try {
    const bucket = 'site-assets';
    const ext = file.name.split('.').pop() || 'png';
    const filePath = `logos/brand-logo-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!publicData || !publicData.publicUrl) {
      return { url: null, error: 'Failed to generate public URL for uploaded logo' };
    }

    return { url: publicData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'Error uploading logo to Supabase Storage' };
  }
}
