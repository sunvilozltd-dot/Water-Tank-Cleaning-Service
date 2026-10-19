// UTM and Marketing Campaign Attribution Tracking for Sunviloz Clean Care

export interface UtmAttribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
  captured_at?: string;
}

const ATTRIBUTION_STORAGE_KEY = 'sunviloz_utm_attribution_v1';

/**
 * Initializes and captures UTM parameters and referrer from the current URL.
 * Preserves the initial campaign touchpoint in sessionStorage and localStorage
 * so that attribution persists through multi-step forms and navigation.
 */
export function initUtmTracking(): UtmAttribution {
  if (typeof window === 'undefined') return {};

  try {
    const existing = getStoredAttribution();
    const urlParams = new URLSearchParams(window.location.search);

    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    const utmTerm = urlParams.get('utm_term');
    const utmContent = urlParams.get('utm_content');

    // Detect referrer source if no direct UTM
    let detectedSource = utmSource;
    let detectedMedium = utmMedium;

    if (!detectedSource && document.referrer) {
      const refUrl = document.referrer.toLowerCase();
      if (refUrl.includes('google.')) {
        detectedSource = 'google';
        detectedMedium = detectedMedium || 'organic';
      } else if (refUrl.includes('facebook.') || refUrl.includes('fb.')) {
        detectedSource = 'facebook';
        detectedMedium = detectedMedium || 'social';
      } else if (refUrl.includes('instagram.')) {
        detectedSource = 'instagram';
        detectedMedium = detectedMedium || 'social';
      } else if (refUrl.includes('whatsapp') || refUrl.includes('wa.me')) {
        detectedSource = 'whatsapp';
        detectedMedium = detectedMedium || 'messaging';
      } else if (!refUrl.includes(window.location.hostname)) {
        try {
          detectedSource = new URL(document.referrer).hostname;
          detectedMedium = 'referral';
        } catch {
          // ignore invalid url
        }
      }
    }

    // Only overwrite if new UTM campaign is explicitly provided, or if no attribution is stored yet
    if (utmSource || utmCampaign || !existing.captured_at) {
      const newAttribution: UtmAttribution = {
        utm_source: detectedSource || existing.utm_source || 'direct',
        utm_medium: detectedMedium || existing.utm_medium || (detectedSource ? 'referral' : 'none'),
        utm_campaign: utmCampaign || existing.utm_campaign || undefined,
        utm_term: utmTerm || existing.utm_term || undefined,
        utm_content: utmContent || existing.utm_content || undefined,
        referrer: document.referrer || existing.referrer || undefined,
        landing_page: window.location.pathname + window.location.search,
        captured_at: existing.captured_at || new Date().toISOString()
      };

      try {
        sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(newAttribution));
        localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(newAttribution));
      } catch {
        // Storage unavailable
      }
      return newAttribution;
    }

    return existing;
  } catch {
    return {};
  }
}

/**
 * Retrieves the currently captured marketing attribution for lead submission.
 */
export function getStoredAttribution(): UtmAttribution {
  if (typeof window === 'undefined') return {};

  try {
    const rawSession = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (rawSession) {
      return JSON.parse(rawSession);
    }
    const rawLocal = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (rawLocal) {
      return JSON.parse(rawLocal);
    }
  } catch {
    // Ignore parse errors
  }
  return {};
}
