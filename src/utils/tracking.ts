// Analytics and Conversion Tracking utility for Sunviloz Clean Care

export interface TrackingEvent {
  id: string;
  name: string;
  timestamp: string;
  params?: Record<string, any>;
}

const EVENTS_STORAGE_KEY = 'sunviloz_events_log';

/**
 * Strips PII (Personally Identifiable Information) like full names, phone numbers,
 * and emails before sending to public analytics scripts (GA4 / Meta Pixel) or client logs.
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
    'password'
  ];
  
  for (const [key, value] of Object.entries(params)) {
    if (!forbiddenKeys.includes(key)) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Dispatches an event to Google Analytics (GA4), Meta Pixel (FB), and local event log.
 * Guaranteed never to crash or block user actions. Never logs sensitive customer PII.
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}): void {
  const timestamp = new Date().toISOString();
  const safeParams = sanitizeParams(params);

  // 1. Log sanitized events in dev mode
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      // Safe development debug log without PII
      console.log(`[Event Tracked: ${eventName}]`, safeParams);
    }
  } catch {
    // Ignore environment error
  }

  // 2. Local event log for lead review & analytics verification
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    const events: TrackingEvent[] = raw ? JSON.parse(raw) : [];
    events.unshift({
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: eventName,
      timestamp,
      params: safeParams
    });
    // Keep max 100 recent events
    if (events.length > 100) events.length = 100;
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    // Safe failure
  }

  // 3. Google Analytics 4 (gtag) dispatch
  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, safeParams);
    }
  } catch (err) {
    // Safe failure
  }

  // 4. Meta Pixel (fbq) dispatch
  try {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      if (eventName === 'lead_saved' || eventName === 'quote_submitted') {
        (window as any).fbq('track', 'Lead', safeParams);
      } else if (eventName === 'whatsapp_click' || eventName === 'whatsapp_opened') {
        (window as any).fbq('track', 'Contact', { channel: 'whatsapp', ...safeParams });
      } else if (eventName === 'booking_confirmed') {
        (window as any).fbq('track', 'Schedule', safeParams);
      } else {
        (window as any).fbq('trackCustom', eventName, safeParams);
      }
    }
  } catch (err) {
    // Safe failure
  }
}

/**
 * Standardized Journey Event Trackers
 */
export function trackFormStarted(source = 'quote_wizard'): void {
  trackEvent('form_started', { source });
}

export function trackFormStepCompleted(stepNumber: number, stepName: string, metadata: Record<string, any> = {}): void {
  trackEvent('form_step_completed', {
    step_number: stepNumber,
    step_name: stepName,
    ...metadata
  });
}

export function trackLeadSaved(leadNumber: string, metadata: Record<string, any> = {}): void {
  trackEvent('lead_saved', {
    lead_number: leadNumber,
    ...metadata
  });
}

export function trackWhatsAppClick(
  leadNumberOrOptions?: string | { leadNumber?: string; source?: string }, 
  source = 'quote_modal'
): void {
  let leadNumber: string | undefined;
  let finalSource = source;

  if (typeof leadNumberOrOptions === 'object' && leadNumberOrOptions !== null) {
    leadNumber = leadNumberOrOptions.leadNumber;
    finalSource = leadNumberOrOptions.source || source;
  } else {
    leadNumber = leadNumberOrOptions;
  }

  trackEvent('whatsapp_click', {
    lead_number: leadNumber,
    source: finalSource
  });
}

export function trackBookingConfirmed(leadNumber: string): void {
  trackEvent('booking_confirmed', {
    lead_number: leadNumber
  });
}

export function trackPageView(pagePath: string, metadata: Record<string, any> = {}): void {
  trackEvent('page_view', {
    page_path: pagePath,
    ...metadata
  });
}

export function getTrackedEvents(): TrackingEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearTrackedEvents(): void {
  try {
    localStorage.removeItem(EVENTS_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Dynamically bootstraps Google Analytics 4 and Meta Pixel if IDs are configured in environment variables.
 * Safe fallback when unconfigured, preventing any script errors or ad blockers from breaking the site.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;

  try {
    const gaId = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID) || '';
    if (gaId && typeof gaId === 'string' && gaId.startsWith('G-')) {
      if (!document.getElementById('ga4-script')) {
        const script = document.createElement('script');
        script.id = 'ga4-script';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script);

        (window as any).dataLayer = (window as any).dataLayer || [];
        function gtag(...args: any[]) {
          (window as any).dataLayer.push(args);
        }
        (window as any).gtag = gtag;
        gtag('js', new Date());
        gtag('config', gaId, { send_page_view: false });
      }
    }

    const pixelId = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_META_PIXEL_ID) || '';
    if (pixelId && typeof pixelId === 'string' && pixelId.length >= 8) {
      if (!document.getElementById('meta-pixel-script')) {
        (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
          if (f.fbq) return;
          n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = true;
          n.version = '2.0';
          n.queue = [];
          t = b.createElement(e);
          t.async = true;
          t.id = 'meta-pixel-script';
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          if (s && s.parentNode) {
            s.parentNode.insertBefore(t, s);
          } else {
            b.head.appendChild(t);
          }
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        if (typeof (window as any).fbq === 'function') {
          (window as any).fbq('init', pixelId);
        }
      }
    }
  } catch {
    // Non-blocking
  }
}

