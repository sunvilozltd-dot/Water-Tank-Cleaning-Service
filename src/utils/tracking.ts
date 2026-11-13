// Analytics and Conversion Tracking utility for Sunviloz Clean Care
// Unified with trackingService to enforce strict privacy, Google Consent Mode v2, and zero PII.

import { 
  trackEvent as serviceTrackEvent, 
  initGoogleConsentMode, 
  getTrackingSettings, 
  applyTrackingScripts,
  getUserConsent,
  setUserConsent,
  withdrawUserConsent,
  logCtaEvent
} from '../services/trackingService';

export interface TrackingEvent {
  id: string;
  name: string;
  timestamp: string;
  params?: Record<string, any>;
}

/**
 * Dispatches an event to the centralized tracking manager.
 * Respects user consent, strips all PII, and logs to local debug stream.
 */
export function trackEvent(
  eventName: string, 
  params: Record<string, any> = {}, 
  options: { isConversion?: boolean } = {}
): void {
  serviceTrackEvent(eventName, params, options);
}

export function trackPhoneClick(sourceOrMetadata: string | Record<string, any> = {}): void {
  const metadata = typeof sourceOrMetadata === 'string' ? { source: sourceOrMetadata } : (sourceOrMetadata || {});
  trackEvent('click_call', { channel: 'phone', ...metadata }, { isConversion: true });
  logCtaEvent('click_call', {
    sourcePage: String(metadata.source || (typeof window !== 'undefined' ? window.location.pathname : '/')),
    area: metadata.area ? String(metadata.area) : undefined,
    service: metadata.service ? String(metadata.service) : undefined
  });
}

export function trackWhatsAppClick(sourceOrMetadata: string | Record<string, any> = {}): void {
  const metadata = typeof sourceOrMetadata === 'string' ? { source: sourceOrMetadata } : (sourceOrMetadata || {});
  trackEvent('click_whatsapp', { channel: 'whatsapp', ...metadata }, { isConversion: true });
  logCtaEvent('click_whatsapp', {
    sourcePage: String(metadata.source || (typeof window !== 'undefined' ? window.location.pathname : '/')),
    area: metadata.area ? String(metadata.area) : undefined,
    service: metadata.service ? String(metadata.service) : undefined
  });
}

export function trackFormStarted(source = 'quote_wizard'): void {
  trackEvent('quote_form_start', { source });
}

export function trackFormStepCompleted(stepNumber: number, stepName: string, metadata: Record<string, any> = {}): void {
  trackEvent('quote_form_step_completed', {
    step_number: stepNumber,
    step_name: stepName,
    ...metadata
  });
}

/**
 * Only fire successful form conversion events AFTER Supabase confirms cloud persistence.
 */
export function trackLeadSaved(leadNumber: string, metadata: Record<string, any> = {}): void {
  trackEvent('lead_submit_success', {
    lead_number: leadNumber,
    service_type: metadata.serviceType || 'Water Tank Cleaning',
    tank_type: metadata.tankType,
    area: metadata.area || 'Dhaka',
    estimated_amount: metadata.estimatedPrice ? Number(metadata.estimatedPrice) : undefined
  }, { isConversion: true });
}

export function trackContactFormSubmit(metadata: Record<string, any> = {}): void {
  trackEvent('contact_form_submit', metadata, { isConversion: true });
}

export function trackGoogleMapsClick(metadata: Record<string, any> = {}): void {
  trackEvent('google_maps_click', { platform: 'google_maps', ...metadata }, { isConversion: true });
}

export function trackGoogleReviewClick(metadata: Record<string, any> = {}): void {
  trackEvent('google_review_click', { platform: 'google_reviews', ...metadata }, { isConversion: true });
}

export function trackPageView(pagePath: string, pageTitle?: string): void {
  const consent = getUserConsent();
  if (consent.analytics && typeof window !== 'undefined') {
    const w = window as any;
    if (typeof w.gtag === 'function') {
      w.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: pageTitle || document.title
      });
    }
  }
}

/**
 * Initializes tracking safely:
 * Sets Google Consent Mode v2 default 'denied' states first.
 * Does NOT inject non-essential scripts unless consent is already verified.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;

  try {
    initGoogleConsentMode();
    getTrackingSettings().then(settings => {
      applyTrackingScripts(settings);
    });
  } catch (err) {
    console.warn('Analytics initialization safe notice:', err);
  }
}

export { getUserConsent, setUserConsent, withdrawUserConsent };
