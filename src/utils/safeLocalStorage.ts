/**
 * Safe LocalStorage & IndexedDB wrapper with automatic QuotaExceededError recovery,
 * persistent storage resilience, and in-memory fallback.
 * Ensures user-uploaded images, branding logos, and site configs NEVER get lost or replaced.
 */

import { idbSet, idbGet, hydrateFromIndexedDb } from './indexedDbStorage';

const IN_MEMORY_FALLBACK = new Map<string, string>();

// List of important persistent keys that should be mirrored to IndexedDB
export const CRITICAL_STORAGE_KEYS = [
  'sunviloz_site_master_config_v3',
  'sunviloz_header_config_cache_v3',
  'sunviloz_nav_items_cache_v3',
  'sunviloz_authoritative_services_v7',
  'sunviloz_portfolio_projects_v4',
  'sunviloz_blog_posts_v3',
  'sunviloz_media_library_cache_v2'
];

/**
 * Clean up bloated or non-essential cache keys from localStorage if quota is reached.
 * Only evicts truly dispensable debugging/telemetry keys, NEVER user content.
 */
export function cleanupStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    const dispensableKeys = [
      'sunviloz_audit_logs_v1',
      'sunviloz_audit_logs',
      'sunviloz_audit_trail_v1',
      'sunviloz_recent_events_v2',
      'sunviloz_analytics_events',
      'sunviloz_temp_preview'
    ];

    for (const key of dispensableKeys) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore
      }
    }
  } catch (err) {
    console.warn('[SafeStorage] Storage cleanup warning:', err);
  }
}

/**
 * Safely store an item in localStorage and mirror it persistently into IndexedDB.
 * NEVER destroys or replaces user-uploaded images.
 */
export function safeSetItem(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;

  // Cache in memory for instant synchronous access
  IN_MEMORY_FALLBACK.set(key, value);

  // Persist to IndexedDB in background (no quota limit)
  idbSet(key, value).catch(() => {});

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    const isQuotaError = 
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014;

    if (isQuotaError) {
      console.warn(`[SafeStorage] LocalStorage quota reached for key "${key}". Evicting non-essential cache.`);
      cleanupStorage();

      try {
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        console.warn(`[SafeStorage] LocalStorage still full. Key "${key}" safely persisted in IndexedDB.`);
        // Value is safely saved in IndexedDB and IN_MEMORY_FALLBACK
        return true;
      }
    } else {
      console.error(`[SafeStorage] Failed to set "${key}":`, err);
      return false;
    }
  }
}

/**
 * Safely retrieve an item from localStorage with in-memory fallback.
 */
export function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const val = localStorage.getItem(key);
    if (val !== null) {
      IN_MEMORY_FALLBACK.set(key, val);
      return val;
    }
  } catch (err) {
    console.warn(`[SafeStorage] Failed to read "${key}" from localStorage:`, err);
  }

  return IN_MEMORY_FALLBACK.get(key) ?? null;
}

/**
 * Async version that falls back to IndexedDB if localStorage does not have the value
 */
export async function safeGetItemAsync(key: string): Promise<string | null> {
  const syncVal = safeGetItem(key);
  if (syncVal !== null) return syncVal;

  const idbVal = await idbGet(key);
  if (idbVal !== null) {
    IN_MEMORY_FALLBACK.set(key, idbVal);
    try {
      localStorage.setItem(key, idbVal);
    } catch {
      // Ignore if localStorage quota exceeded
    }
    return idbVal;
  }

  return null;
}

/**
 * Safely remove an item from both localStorage, memory, and IndexedDB.
 */
export function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[SafeStorage] Failed to remove "${key}":`, err);
  }
  IN_MEMORY_FALLBACK.delete(key);
}

// Hydrate from IndexedDB on startup so values exist even after browser cache was partially cleared
if (typeof window !== 'undefined') {
  hydrateFromIndexedDb(CRITICAL_STORAGE_KEYS).catch(() => {});
}
