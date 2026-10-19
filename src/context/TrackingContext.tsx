import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TrackingSettings, ConsentPreferences, TrackingEventLogItem } from '../types/tracking';
import { 
  getTrackingSettings, 
  saveTrackingSettings, 
  getUserConsent, 
  setUserConsent, 
  getRecentTrackingLogs, 
  clearRecentTrackingLogs,
  applyTrackingScripts, 
  trackEvent, 
  DEFAULT_TRACKING_SETTINGS,
  TRACKING_SETTINGS_EVENT,
  TRACKING_LOG_EVENT 
} from '../services/trackingService';

interface TrackingContextType {
  settings: TrackingSettings;
  consent: ConsentPreferences;
  recentLogs: TrackingEventLogItem[];
  loading: boolean;
  saveSettings: (newSettings: TrackingSettings) => Promise<boolean>;
  updateSettings: (newSettings: Partial<TrackingSettings>) => Promise<boolean>;
  updateConsent: (prefs: Partial<ConsentPreferences>) => void;
  clearLogs: () => void;
  trackCustomEvent: (eventName: string, params?: Record<string, any>, isConversion?: boolean) => void;
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export const TrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<TrackingSettings>(DEFAULT_TRACKING_SETTINGS);
  const [consent, setConsentState] = useState<ConsentPreferences>(getUserConsent());
  const [recentLogs, setRecentLogs] = useState<TrackingEventLogItem[]>(getRecentTrackingLogs());

  const loadSettings = useCallback(async () => {
    const s = await getTrackingSettings();
    setSettings(s);
    applyTrackingScripts(s);
  }, []);

  useEffect(() => {
    loadSettings();
    const handleSettingsChanged = () => {
      loadSettings();
    };
    const handleLogUpdated = () => {
      setRecentLogs(getRecentTrackingLogs());
    };
    window.addEventListener(TRACKING_SETTINGS_EVENT, handleSettingsChanged);
    window.addEventListener(TRACKING_LOG_EVENT, handleLogUpdated);
    return () => {
      window.removeEventListener(TRACKING_SETTINGS_EVENT, handleSettingsChanged);
      window.removeEventListener(TRACKING_LOG_EVENT, handleLogUpdated);
    };
  }, [loadSettings]);

  const saveSettings = async (newSettings: TrackingSettings): Promise<boolean> => {
    setSettings(newSettings);
    return await saveTrackingSettings(newSettings);
  };

  const updateConsent = (prefs: Partial<ConsentPreferences>) => {
    setUserConsent(prefs);
    setConsentState(getUserConsent());
  };

  const clearLogs = () => {
    clearRecentTrackingLogs();
    setRecentLogs([]);
  };

  const trackCustomEvent = (eventName: string, params: Record<string, any> = {}, isConversion = false) => {
    trackEvent(eventName, params, { isConversion });
  };

  const updateSettings = async (newSettings: Partial<TrackingSettings>): Promise<boolean> => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    return await saveTrackingSettings(merged);
  };

  return (
    <TrackingContext.Provider
      value={{
        settings,
        consent,
        recentLogs,
        loading: false,
        saveSettings,
        updateSettings,
        updateConsent,
        clearLogs,
        trackCustomEvent
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = (): TrackingContextType => {
  const context = useContext(TrackingContext);
  if (!context) {
    console.warn('useTracking accessed outside TrackingProvider. Returning fallback defaults.');
    return {
      settings: DEFAULT_TRACKING_SETTINGS,
      consent: { necessary: true, analytics: false, marketing: false },
      recentLogs: [],
      loading: false,
      saveSettings: async () => false,
      updateSettings: async () => false,
      updateConsent: () => {},
      clearLogs: () => {},
      trackCustomEvent: () => {}
    };
  }
  return context;
};
