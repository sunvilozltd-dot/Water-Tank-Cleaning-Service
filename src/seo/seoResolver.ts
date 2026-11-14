import { SITE_DOMAIN } from '../config/siteDomain';

export const HOTLINE_E164 = '+8809649112288';
export const HOTLINE_DIGITS = '09649112288';
export const HOTLINE_DISPLAY = '09649-112288';

export const WHATSAPP_E164 = '+8801609999612';
export const WHATSAPP_DIGITS = '8801609999612';
export const WHATSAPP_DISPLAY = '01609-999612';
export const WHATSAPP_LOCAL = '01609999612';

export function normalizePathname(rawPath?: string): string {
  const withoutQuery = (rawPath || '/').split('?')[0].split('#')[0].trim();
  if (!withoutQuery || withoutQuery === '/') return '/';
  const clean = `/${withoutQuery.replace(/^\/+|\/+$/g, '')}`;
  return clean || '/';
}

export function extractRouteKey(canonicalPath?: string, canonicalUrl?: string): string {
  if (canonicalPath && canonicalPath.trim()) {
    return normalizePathname(canonicalPath);
  }
  if (canonicalUrl && canonicalUrl.trim()) {
    try {
      const parsed = new URL(canonicalUrl.trim());
      return normalizePathname(parsed.pathname);
    } catch {
      if (canonicalUrl.trim().startsWith('/')) {
        return normalizePathname(canonicalUrl);
      }
    }
  }
  if (typeof window !== 'undefined' && window.location?.pathname) {
    return normalizePathname(window.location.pathname);
  }
  return '/';
}

export function normalizeBdE164(rawPhone?: string, fallback: string = HOTLINE_E164): string {
  let cleaned = (rawPhone || '').replace(/[\s\-().]/g, '').trim();
  if (!cleaned) return fallback;

  // Convert international 00 prefix (e.g. 008809649112288) to +
  if (cleaned.startsWith('00')) {
    cleaned = `+${cleaned.slice(2)}`;
  }

  const hadPlus = cleaned.startsWith('+');
  let digits = cleaned.replace(/[^0-9]/g, '');
  if (!digits) return fallback;

  // Preserve legitimate non-BD international numbers explicitly starting with + (not +880)
  if (hadPlus && !digits.startsWith('880') && !digits.startsWith('88')) {
    return `+${digits}`;
  }

  // Collapse accidental repeated 880 prefixes (e.g. 8808801609999612 -> 8801609999612)
  while (digits.startsWith('880880')) {
    digits = digits.slice(3);
  }

  // Strip 880 or 88 country code to normalize the local subscriber part cleanly
  if (digits.startsWith('880')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('88') && digits.length >= 11) {
    digits = digits.slice(2);
  }

  // Remove leading trunk 0 from local BD mobile/IP-telephony digits (01609... -> 1609..., 09649... -> 9649...)
  while (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (!digits) return fallback;
  return `+880${digits}`;
}

export function isLegacyWhatsAppAsHotline(rawPhone?: string): boolean {
  const digits = (rawPhone || '').replace(/[^0-9]/g, '');
  return digits === '01609999612' || digits === '8801609999612';
}

export function resolveAuthoritativeHotline(rawPhone?: string): string {
  if (!rawPhone || !rawPhone.trim() || isLegacyWhatsAppAsHotline(rawPhone)) {
    return HOTLINE_E164;
  }
  return normalizeBdE164(rawPhone, HOTLINE_E164);
}

export function resolveAuthoritativeHotlineDisplay(rawDisplay?: string, rawPhone?: string): string {
  if (!rawDisplay || !rawDisplay.trim() || isLegacyWhatsAppAsHotline(rawDisplay)) {
    if (rawPhone && rawPhone.trim() && !isLegacyWhatsAppAsHotline(rawPhone)) {
      return rawPhone.trim();
    }
    return HOTLINE_DISPLAY;
  }
  return rawDisplay.trim();
}

export function getCanonicalUrl(path: string, baseOrigin: string = SITE_DOMAIN): string {
  const cleanBase = (baseOrigin || SITE_DOMAIN).replace(/\/+$/, '');
  const cleanPath = normalizePathname(path);
  return `${cleanBase}${cleanPath === '/' ? '/' : cleanPath}`;
}

export const DEFAULT_HOME_SEO_TITLE = 'Water Tank Cleaning Service in Dhaka | SUNVILOZ';
export const DEFAULT_HOME_SEO_DESCRIPTION =
  'ঢাকায় ওভারহেড ও রিজার্ভ পানির ট্যাংক এবং পাইপলাইন পরিষ্কার সার্ভিস। কাজের বিবরণ জানিয়ে কোটেশন নিন। WhatsApp: 01609-999612।';

export function formatSeoTitle(rawTitle?: string): string {
  const brand = 'SUNVILOZ CLEAN CARE';
  if (!rawTitle || !rawTitle.trim()) return DEFAULT_HOME_SEO_TITLE;
  const trimmed = rawTitle.trim();
  if (trimmed.toLowerCase().includes('sunviloz')) {
    return trimmed;
  }
  return `${trimmed} | ${brand}`;
}
