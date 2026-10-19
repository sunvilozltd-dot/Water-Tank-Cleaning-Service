import { TrackingSettings, ConsentPreferences, TrackingEventLogItem, StandardTrackParams } from '../types/tracking';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

const TRACKING_SETTINGS_KEY = 'sunviloz_tracking_settings_v2';
const CONSENT_STORAGE_KEY = 'sunviloz_cookie_consent_v2';
const RECENT_EVENTS_KEY = 'sunviloz_recent_tracking_events_v2';

export const TRACKING_SETTINGS_EVENT = 'sunviloz_tracking_settings_changed';
export const TRACKING_LOG_EVENT = 'sunviloz_tracking_event_logged';

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
  consentRequired: false,
  consentBannerTitle: 'We value your privacy & clean water',
  consentBannerDesc: 'We use cookies and telemetry to improve your booking experience, measure site performance, and protect customer communications.',
  updatedAt: new Date().toISOString()
};

const recentEventIds = new Set<string>();

export function generateEventId(): string {
  return 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

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
          metaPixelId: data.meta_pixel_id || '',
          metaTestEventCode: data.meta_test_event_code || '',
          metaCapiEnabled: Boolean(data.meta_capi_enabled),
          googleAnalyticsEnabled: Boolean(data.google_analytics_enabled),
          ga4MeasurementId: data.ga4_measurement_id || '',
          googleTagManagerEnabled: Boolean(data.google_tag_manager_enabled),
          gtmContainerId: data.gtm_container_id || '',
          googleAdsEnabled: Boolean(data.google_ads_enabled),
          googleAdsConversionId: data.google_ads_conversion_id || '',
          googleAdsConversionLabel: data.google_ads_conversion_label || '',
          googleSearchConsoleCode: data.google_search_console_code || '',
          debugMode: Boolean(data.debug_mode),
          consentRequired: Boolean(data.consent_required),
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

      const { error } = await supabase
        .from('tracking_settings')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('Supabase save tracking_settings error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Failed to save tracking settings to Supabase:', err);
      return false;
    }
  }

  return true;
}

export function getUserConsent(): ConsentPreferences {
  if (typeof window === 'undefined') {
    return { necessary: true, analytics: true, marketing: true };
  }
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore
  }
  return { necessary: true, analytics: true, marketing: true };
}

export function setUserConsent(prefs: Partial<ConsentPreferences>): void {
  const full: ConsentPreferences = {
    necessary: true,
    analytics: prefs.analytics !== undefined ? prefs.analytics : true,
    marketing: prefs.marketing !== undefined ? prefs.marketing : true,
    timestamp: new Date().toISOString()
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(full));
  }
}

export function applyTrackingScripts(settings: TrackingSettings): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

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
  } else if (existingGsc) {
    existingGsc.remove();
  }

  const gtmId = settings.gtmContainerId?.trim();
  if (settings.googleTagManagerEnabled && gtmId && !document.getElementById('sunviloz-gtm-script')) {
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

  const ga4Id = settings.ga4MeasurementId?.trim();
  if (settings.googleAnalyticsEnabled && ga4Id && !document.getElementById('sunviloz-ga4-script')) {
    const gScript = document.createElement('script');
    gScript.id = 'sunviloz-ga4-script';
    gScript.async = true;
    gScript.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
    document.head.appendChild(gScript);

    const initScript = document.createElement('script');
    initScript.id = 'sunviloz-ga4-init';
    initScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${ga4Id}', { send_page_view: false });
    `;
    document.head.appendChild(initScript);
  }

  const pixelId = settings.metaPixelId?.trim();
  if (settings.metaEnabled && pixelId && !document.getElementById('sunviloz-meta-pixel')) {
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

export function trackEvent(
  eventName: string,
  params: StandardTrackParams = {},
  options: { eventId?: string; isConversion?: boolean } = {}
): string {
  const eventId = options.eventId || generateEventId();
  const safeParams = sanitizeParams(params);
  const now = new Date().toISOString();

  if (recentEventIds.has(eventId)) {
    return eventId;
  }
  recentEventIds.add(eventId);
  setTimeout(() => recentEventIds.delete(eventId), 30000);

  const consent = getUserConsent();
  const isMarketingAllowed = consent.marketing;
  const isAnalyticsAllowed = consent.analytics;

  if (isAnalyticsAllowed && typeof window !== 'undefined' && (window as any).gtag) {
    try {
      (window as any).gtag('event', eventName, {
        event_id: eventId,
        ...safeParams
      });
    } catch {
      // Safe failure
    }
  }

  if (isMarketingAllowed && options.isConversion && typeof window !== 'undefined' && (window as any).gtag) {
    try {
      (window as any).gtag('event', 'conversion', {
        event_id: eventId,
        ...safeParams
      });
    } catch {
      // Safe failure
    }
  }

  if (isMarketingAllowed && typeof window !== 'undefined' && (window as any).fbq) {
    try {
      if (eventName === 'page_view') {
        (window as any).fbq('track', 'PageView', {}, { eventID: eventId });
      } else if (eventName === 'service_view' || eventName === 'view_content') {
        (window as any).fbq('track', 'ViewContent', {
          content_name: safeParams.service_name || safeParams.content_name,
          content_category: safeParams.content_category || 'Cleaning Services',
          content_ids: safeParams.service_id ? [safeParams.service_id] : undefined,
          content_type: 'product'
        }, { eventID: eventId });
      } else if (eventName === 'lead' || eventName === 'generate_lead' || eventName === 'quote_submitted') {
        (window as any).fbq('track', 'Lead', safeParams, { eventID: eventId });
      } else if (eventName === 'contact' || eventName === 'phone_click' || eventName === 'whatsapp_click') {
        (window as any).fbq('track', 'Contact', safeParams, { eventID: eventId });
      } else if (eventName === 'schedule' || eventName === 'booking_confirmed') {
        (window as any).fbq('track', 'Schedule', safeParams, { eventID: eventId });
      } else if (eventName === 'purchase') {
        (window as any).fbq('track', 'Purchase', safeParams, { eventID: eventId });
      } else {
        (window as any).fbq('trackCustom', eventName, safeParams, { eventID: eventId });
      }
    } catch {
      // Safe failure
    }
  }

  logDebugEvent({
    id: eventId,
    eventName,
    eventId,
    platform: 'all',
    params: safeParams,
    timestamp: now,
    status: isAnalyticsAllowed || isMarketingAllowed ? 'dispatched' : 'blocked_by_consent'
  });

  return eventId;
}

export function trackPageView(pagePath: string, title?: string): void {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: title || (typeof document !== 'undefined' ? document.title : '')
  });
}

export function trackServiceView(service: { id?: string; title: string; slug: string; category?: string }): void {
  trackEvent('service_view', {
    service_id: service.id || service.slug,
    service_name: service.title,
    service_slug: service.slug,
    content_name: service.title,
    content_category: service.category || 'Water Tank Cleaning'
  });
}

export function trackPhoneClick(location: string): void {
  trackEvent('phone_click', {
    button_name: 'Hotline Call',
    button_location: location
  }, { isConversion: true });
}

export function trackWhatsAppClick(location: string, serviceSlug?: string): void {
  trackEvent('whatsapp_click', {
    button_name: 'WhatsApp Chat',
    button_location: location,
    service_slug: serviceSlug
  }, { isConversion: true });
}

export function trackCtaClick(ctaName: string, location: string, targetUrl?: string): void {
  trackEvent('cta_click', {
    button_name: ctaName,
    button_location: location,
    target_url: targetUrl
  });
}

export function trackBookingStart(serviceType?: string): void {
  trackEvent('service_booking_start', {
    service_type: serviceType || 'Water Tank Cleaning'
  });
}

export function trackBookingSubmit(leadNumber: string, serviceType?: string, estimatedPrice?: number | string): void {
  trackEvent('lead', {
    lead_number: leadNumber,
    service_type: serviceType || 'Water Tank Cleaning',
    value: typeof estimatedPrice === 'number' ? estimatedPrice : Number(String(estimatedPrice || '').replace(/\D/g, '')) || 1200,
    currency: 'BDT'
  }, { isConversion: true });
}

export function trackVideoPlay(videoTitle: string, videoId?: string): void {
  trackEvent('video_play', {
    video_title: videoTitle,
    video_id: videoId
  });
}
