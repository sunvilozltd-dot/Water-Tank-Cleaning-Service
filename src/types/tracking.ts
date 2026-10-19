export interface TrackingSettings {
  id: string; // 'primary'
  metaEnabled: boolean;
  metaPixelId?: string;
  metaTestEventCode?: string;
  metaCapiEnabled: boolean;
  googleAnalyticsEnabled: boolean;
  ga4MeasurementId?: string;
  googleTagManagerEnabled: boolean;
  gtmEnabled?: boolean;
  gtmContainerId?: string;
  googleTagManagerId?: string;
  googleAdsEnabled: boolean;
  googleAdsConversionId?: string;
  googleAdsConversionLabel?: string;
  googleSearchConsoleCode?: string;
  debugMode: boolean;
  consentRequired: boolean;
  consentBannerTitle: string;
  consentBannerDesc: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ConsentPreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  timestamp?: string;
}

export type TrackEventPlatform = 'all' | 'meta' | 'ga4' | 'gtm' | 'gads' | 'capi';

export interface TrackingEventLogItem {
  id: string;
  eventName: string;
  eventId: string;
  platform: TrackEventPlatform;
  params: Record<string, any>;
  timestamp: string;
  status: 'dispatched' | 'blocked_by_consent' | 'deduplicated' | 'simulated';
}

export interface StandardTrackParams {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  currency?: string;
  value?: number;
  service_id?: string;
  service_name?: string;
  service_slug?: string;
  button_name?: string;
  button_location?: string;
  page_path?: string;
  section_id?: string;
  section_name?: string;
  lead_number?: string;
  transaction_id?: string;
  channel?: string;
  [key: string]: any;
}
