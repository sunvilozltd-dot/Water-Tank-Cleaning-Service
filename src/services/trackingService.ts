import { TrackingSettings, ConsentPreferences, TrackingEventLogItem, StandardTrackParams, TrackEventPlatform } from '../types/tracking';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

const TRACKING_SETTINGS_KEY = 'sunviloz_tracking_settings_v3';
const CONSENT_STORAGE_KEY = 'sunviloz_cookie_consent_v3';
const RECENT_EVENTS_KEY = 'sunviloz_recent_tracking_events_v3';

export const TRACKING_SETTINGS_EVENT = 'sunviloz_tracking_settings_changed';
export const TRACKING_LOG_EVENT = 'sunviloz_tracking_event_logged';
export const CONSENT_CHANGED_EVENT = 'sunviloz_consent_preferences_changed';
export const OPEN_CONSENT_MODAL_EVENT = 'sunviloz_open_consent_preferences';

export const DEFAULT_TRACKING_SETTINGS: TrackingSettings = {
  id: 'primary',
  metaEnabled: true,
  metaPixelId: '',
  metaTestEventCode: '',
  metaCapiEnabled: false,
  googleAnalyticsEnabled: true,
  ga4MeasurementId: '',
  googleTagManagerEnabled: false,
  gtmContainerId: '',
  googleAdsEnabled: false,
  googleAdsConversionId: '',
  googleAdsConversionLabel: '',
  googleSearchConsoleCode: '',
  debugMode: false,
  consentRequired: true, // Default: consent is strictly required before non-essential tracking
  consentBannerTitle: 'We value your privacy & water safety',
  consentBannerDesc: 'We use essential cookies for website operation. Analytics and marketing cookies are only enabled if you explicitly grant permission.',
  updatedAt: new Date().toISOString()
};

/**
 * Strips PII (Personally Identifiable Information) before logging or sending to analytics
 */
function sanitizeParams(params: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  const forbiddenKeys = [
    'name', 
    'phone', 
    'whatsapp', 
    'email', 
    'customerName', 
    'customerPhone', 
    'address', 
    'userEmail', 
    'password',
    'notes',
    'message'
  ];
  for (const [key, value] of Object.entries(params)) {
    if (!forbiddenKeys.includes(key)) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function generateEventId(): string {
  return 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

// 3.5s deduplication cache to prevent accidental double-firing of high-value conversion events
const recentEventTimestamps = new Map<string, number>();

function isDuplicateConversionEvent(eventName: string, params: Record<string, any>): boolean {
  const conversionEvents = [
    'lead_saved', 
    'quote_submitted', 
    'quote_form_submit',
    'contact_form_submit', 
    'phone_call_click', 
    'whatsapp_click',
    'google_maps_click',
    'google_review_click',
    'booking_confirmed'
  ];
  if (!conversionEvents.includes(eventName)) return false;

  const key = `${eventName}_${params.lead_number || params.source || params.channel || ''}`;
  const now = Date.now();
  const lastTime = recentEventTimestamps.get(key) || 0;
  if (now - lastTime < 3500) {
    return true;
  }
  recentEventTimestamps.set(key, now);
  return false;
}

/**
 * Returns user consent preferences.
 * CRITICAL RULE: For new visitors (no stored preference), analytics and marketing MUST default to false!
 */
export function getUserConsent(): ConsentPreferences {
  if (typeof window === 'undefined') {
    return { necessary: true, analytics: false, marketing: false };
  }
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        necessary: true,
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
        timestamp: parsed.timestamp
      };
    }
  } catch {
    // Ignore
  }
  // New visitor: analytics=false, marketing=false strictly until explicit consent
  return { necessary: true, analytics: false, marketing: false };
}

/**
 * Checks whether user has made an explicit choice regarding cookie consent
 */
export function hasUserDecidedConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    return Boolean(raw && JSON.parse(raw)?.timestamp);
  } catch {
    return false;
  }
}

/**
 * Updates user consent preferences and adjusts Google Consent Mode v2 + scripts
 */
export function setUserConsent(prefs: Partial<ConsentPreferences>): void {
  const full: ConsentPreferences = {
    necessary: true,
    analytics: Boolean(prefs.analytics),
    marketing: Boolean(prefs.marketing),
    timestamp: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(full));
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: full }));
  }

  // Update Google Consent Mode v2
  updateGoogleConsentMode(full);

  // Apply or update tracking scripts dynamically based on updated consent
  getTrackingSettings().then(settings => {
    applyTrackingScripts(settings);
  });
}

/**
 * Consent Withdrawal: Allows the user to revoke all non-essential consent at any time.
 * Stops future tracking, updates Consent Mode v2 to denied, and cleans up active script sessions.
 */
export function withdrawUserConsent(): void {
  setUserConsent({ analytics: false, marketing: false });
  // Remove or disable trackers if active
  if (typeof window !== 'undefined') {
    // Notify window that consent was withdrawn
    console.info('[Sunviloz Privacy] Non-essential tracking consent withdrawn by user.');
  }
}

/**
 * Initializes Google Consent Mode v2 with default 'denied' settings
 */
export function initGoogleConsentMode(): void {
  if (typeof window === 'undefined') return;

  const currentConsent = getUserConsent();
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  function gtag(...args: any[]) {
    w.dataLayer.push(args);
  }
  w.gtag = w.gtag || gtag;

  // Set Consent Mode v2 default
  gtag('consent', 'default', {
    ad_storage: currentConsent.marketing ? 'granted' : 'denied',
    ad_user_data: currentConsent.marketing ? 'granted' : 'denied',
    ad_personalization: currentConsent.marketing ? 'granted' : 'denied',
    analytics_storage: currentConsent.analytics ? 'granted' : 'denied',
    wait_for_update: 500
  });
}

/**
 * Updates Google Consent Mode v2 dynamically
 */
export function updateGoogleConsentMode(consent: ConsentPreferences): void {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (typeof w.gtag === 'function') {
    w.gtag('consent', 'update', {
      ad_storage: consent.marketing ? 'granted' : 'denied',
      ad_user_data: consent.marketing ? 'granted' : 'denied',
      ad_personalization: consent.marketing ? 'granted' : 'denied',
      analytics_storage: consent.analytics ? 'granted' : 'denied'
    });
  }
}

export async function getTrackingSettings(): Promise<TrackingSettings> {
  let settings = DEFAULT_TRACKING_SETTINGS;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(TRACKING_SETTINGS_KEY);
      if (raw) {
        settings = { ...DEFAULT_TRACKING_SETTINGS, ...JSON.parse(raw) };
      }
    } catch {
      // Ignore
    }
  }

  // Also check environment variables for fallback IDs
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (!settings.ga4MeasurementId && import.meta.env.VITE_GA_MEASUREMENT_ID) {
      settings.ga4MeasurementId = String(import.meta.env.VITE_GA_MEASUREMENT_ID).trim();
    }
    if (!settings.metaPixelId && import.meta.env.VITE_META_PIXEL_ID) {
      settings.metaPixelId = String(import.meta.env.VITE_META_PIXEL_ID).trim();
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('tracking_settings')
        .select('*')
        .eq('id', 'primary')
        .maybeSingle();

      if (!error && data) {
        settings = {
          id: data.id || 'primary',
          metaEnabled: Boolean(data.meta_enabled),
          metaPixelId: data.meta_pixel_id || settings.metaPixelId,
          metaTestEventCode: data.meta_test_event_code || '',
          metaCapiEnabled: Boolean(data.meta_capi_enabled),
          googleAnalyticsEnabled: Boolean(data.google_analytics_enabled),
          ga4MeasurementId: data.ga4_measurement_id || settings.ga4MeasurementId,
          googleTagManagerEnabled: Boolean(data.google_tag_manager_enabled),
          gtmContainerId: data.gtm_container_id || '',
          googleAdsEnabled: Boolean(data.google_ads_enabled),
          googleAdsConversionId: data.google_ads_conversion_id || '',
          googleAdsConversionLabel: data.google_ads_conversion_label || '',
          googleSearchConsoleCode: data.google_search_console_code || '',
          debugMode: Boolean(data.debug_mode),
          consentRequired: data.consent_required !== undefined ? Boolean(data.consent_required) : true,
          consentBannerTitle: data.consent_banner_title || DEFAULT_TRACKING_SETTINGS.consentBannerTitle,
          consentBannerDesc: data.consent_banner_desc || DEFAULT_TRACKING_SETTINGS.consentBannerDesc,
          updatedAt: data.updated_at
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(TRACKING_SETTINGS_KEY, JSON.stringify(settings));
        }
      }
    } catch (err) {
      console.warn('Could not retrieve tracking_settings from Supabase:', err);
    }
  }

  return settings;
}

export async function saveTrackingSettings(settings: TrackingSettings): Promise<boolean> {
  const updated: TrackingSettings = {
    ...settings,
    updatedAt: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(TRACKING_SETTINGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(TRACKING_SETTINGS_EVENT, { detail: updated }));
  }

  applyTrackingScripts(updated);

  if (isSupabaseConfigured()) {
    try {
      const payload = {
        id: 'primary',
        meta_enabled: updated.metaEnabled,
        meta_pixel_id: updated.metaPixelId || null,
        meta_test_event_code: updated.metaTestEventCode || null,
        meta_capi_enabled: updated.metaCapiEnabled,
        google_analytics_enabled: updated.googleAnalyticsEnabled,
        ga4_measurement_id: updated.ga4MeasurementId || null,
        google_tag_manager_enabled: updated.googleTagManagerEnabled,
        gtm_container_id: updated.gtmContainerId || null,
        google_ads_enabled: updated.googleAdsEnabled,
        google_ads_conversion_id: updated.googleAdsConversionId || null,
        google_ads_conversion_label: updated.googleAdsConversionLabel || null,
        google_search_console_code: updated.googleSearchConsoleCode || null,
        debug_mode: updated.debugMode,
        consent_required: updated.consentRequired,
        consent_banner_title: updated.consentBannerTitle,
        consent_banner_desc: updated.consentBannerDesc,
        updated_at: updated.updatedAt
      };

      await supabase.from('tracking_settings').upsert(payload, { onConflict: 'id' });
      return true;
    } catch {
      return false;
    }
  }

  return true;
}

/**
 * Centralized Tracking Script Manager:
 * Only injects GA4, GTM, or Meta Pixel scripts AFTER user grants explicit consent!
 * Prevents duplicate script tags and enforces format validations.
 */
export function applyTrackingScripts(settings: TrackingSettings): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // 1. Google Search Console Verification (Essential meta tag, safe without consent)
  const gscCode = settings.googleSearchConsoleCode?.trim();
  const existingGsc = document.querySelector('meta[name="google-site-verification"]');
  if (gscCode) {
    if (existingGsc) {
      existingGsc.setAttribute('content', gscCode);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'google-site-verification';
      meta.content = gscCode;
      document.head.appendChild(meta);
    }
  } else if (existingGsc && !existingGsc.getAttribute('content')) {
    existingGsc.remove();
  }

  const consent = getUserConsent();

  // 2. Google Analytics 4 (Requires Analytics Consent!)
  const ga4Id = settings.ga4MeasurementId?.trim();
  const isValidGa4 = ga4Id && /^G-[A-Z0-9]+$/i.test(ga4Id);

  if (settings.googleAnalyticsEnabled && isValidGa4 && consent.analytics) {
    if (!document.getElementById('sunviloz-ga4-script')) {
      const gScript = document.createElement('script');
      gScript.id = 'sunviloz-ga4-script';
      gScript.async = true;
      gScript.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
      document.head.appendChild(gScript);

      const w = window as any;
      w.dataLayer = w.dataLayer || [];
      function gtag(...args: any[]) {
        w.dataLayer.push(args);
      }
      w.gtag = w.gtag || gtag;
      gtag('js', new Date());
      gtag('config', ga4Id, { send_page_view: false });
    }
  } else if (!consent.analytics) {
    // If analytics consent is not granted, remove injected script tag if present
    const existing = document.getElementById('sunviloz-ga4-script');
    if (existing) existing.remove();
  }

  // 3. Google Tag Manager (Requires Analytics or Marketing Consent)
  const gtmId = settings.gtmContainerId?.trim();
  const isValidGtm = gtmId && /^GTM-[A-Z0-9]+$/i.test(gtmId);

  if (settings.googleTagManagerEnabled && isValidGtm && (consent.analytics || consent.marketing)) {
    if (!document.getElementById('sunviloz-gtm-script')) {
      const script = document.createElement('script');
      script.id = 'sunviloz-gtm-script';
      script.async = true;
      script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'dataLayer','${gtmId}');`;
      document.head.appendChild(script);
    }
  }

  // 4. Meta Pixel (Requires Marketing Consent!)
  const pixelId = settings.metaPixelId?.trim();
  const isValidPixel = pixelId && /^[0-9]{8,18}$/.test(pixelId);

  if (settings.metaEnabled && isValidPixel && consent.marketing) {
    if (!document.getElementById('sunviloz-meta-pixel')) {
      const pScript = document.createElement('script');
      pScript.id = 'sunviloz-meta-pixel';
      pScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
      `;
      document.head.appendChild(pScript);
    }
  } else if (!consent.marketing) {
    const existing = document.getElementById('sunviloz-meta-pixel');
    if (existing) existing.remove();
  }
}

function logDebugEvent(item: TrackingEventLogItem) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(RECENT_EVENTS_KEY);
    const list: TrackingEventLogItem[] = raw ? JSON.parse(raw) : [];
    list.unshift(item);
    if (list.length > 80) list.length = 80;
    localStorage.setItem(RECENT_EVENTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(TRACKING_LOG_EVENT, { detail: item }));
  } catch {
    // Ignore
  }
}

export function getRecentTrackingLogs(): TrackingEventLogItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearRecentTrackingLogs(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_EVENTS_KEY);
    window.dispatchEvent(new CustomEvent(TRACKING_LOG_EVENT));
  } catch {
    // Ignore
  }
}

/**
 * Dispatches tracking events to GA4 and Meta Pixel only when user consent is granted.
 * Strict privacy enforcement: NO customer PII is ever sent.
 */
export function trackEvent(
  eventName: string,
  params: StandardTrackParams = {},
  options: { eventId?: string; isConversion?: boolean; platform?: TrackEventPlatform } = {}
): void {
  if (typeof window === 'undefined') return;

  const safeParams = sanitizeParams(params);

  // Deduplicate rapid repeat events
  if (isDuplicateConversionEvent(eventName, safeParams)) {
    return;
  }

  const consent = getUserConsent();
  const eventId = options.eventId || generateEventId();
  const timestamp = new Date().toISOString();

  // 1. Google Analytics 4 (Requires Analytics Consent)
  let gaStatus: 'dispatched' | 'blocked' | 'consent_denied' = 'consent_denied';
  if (consent.analytics) {
    try {
      const w = window as any;
      if (typeof w.gtag === 'function') {
        w.gtag('event', eventName, {
          event_id: eventId,
          ...safeParams
        });
        gaStatus = 'dispatched';
      } else {
        gaStatus = 'blocked';
      }
    } catch {
      gaStatus = 'blocked';
    }
  }

  // 2. Meta Pixel (Requires Marketing Consent)
  let metaStatus: 'dispatched' | 'blocked' | 'consent_denied' = 'consent_denied';
  if (consent.marketing) {
    try {
      const w = window as any;
      if (typeof w.fbq === 'function') {
        if (eventName === 'quote_submitted' || eventName === 'quote_form_submit' || eventName === 'lead_saved') {
          w.fbq('track', 'Lead', safeParams, { eventID: eventId });
        } else if (eventName === 'whatsapp_click') {
          w.fbq('track', 'Contact', { channel: 'whatsapp', ...safeParams }, { eventID: eventId });
        } else if (eventName === 'phone_call_click' || eventName === 'phone_click') {
          w.fbq('track', 'Contact', { channel: 'phone', ...safeParams }, { eventID: eventId });
        } else if (eventName === 'booking_confirmed') {
          w.fbq('track', 'Schedule', safeParams, { eventID: eventId });
        } else {
          w.fbq('trackCustom', eventName, safeParams, { eventID: eventId });
        }
        metaStatus = 'dispatched';
      } else {
        metaStatus = 'blocked';
      }
    } catch {
      metaStatus = 'blocked';
    }
  }

  // 3. Local Audit Log (Safe, no PII)
  logDebugEvent({
    id: eventId,
    eventId,
    eventName,
    timestamp,
    platform: options.platform || 'all',
    status: (metaStatus === 'dispatched' || gaStatus === 'dispatched') ? 'dispatched' : 'blocked_by_consent',
    channel: options.isConversion ? 'conversion' : 'event',
    metaStatus,
    gaStatus,
    params: safeParams,
    isConversion: options.isConversion
  });
}

/**
 * Convenience helper to track video play events
 */
export function trackVideoPlay(title: string, videoId: string): void {
  trackEvent('video_play', {
    video_title: title,
    video_id: videoId
  });
}

