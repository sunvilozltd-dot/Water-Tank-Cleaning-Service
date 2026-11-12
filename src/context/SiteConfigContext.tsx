import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  FullSiteConfig, 
  SectionConfig, 
  BusinessConfig, 
  HeroConfig, 
  AnnouncementConfig,
  WhyChooseUsItem 
} from '../types/siteConfig';
import { 
  getStoredSiteConfig, 
  saveSiteConfig, 
  toggleSectionVisibility, 
  moveSectionOrder, 
  addCustomSection, 
  deleteCustomSection, 
  resetSiteConfigToDefaults,
  fetchSiteConfigFromSupabase,
  sanitizeAndMergeConfig,
  SITE_CONFIG_EVENT 
} from '../utils/siteConfigStore';
import { CENTRAL_IMAGES_EVENT } from '../services/imageSyncService';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { FaqItem, ProcessStep, ReviewItem, AreaInfo } from '../types';

interface SiteConfigContextType {
  config: FullSiteConfig;
  sections: SectionConfig[];
  business: BusinessConfig;
  hero: HeroConfig;
  announcement: AnnouncementConfig;
  whyChooseUs: WhyChooseUsItem[];
  cleaningSteps: ProcessStep[];
  faqs: FaqItem[];
  reviews: ReviewItem[];
  areas: AreaInfo[];
  pricing: BusinessConfig['pricing'];
  images: NonNullable<FullSiteConfig['images']>;
  updateSiteImages: (updates: Partial<NonNullable<FullSiteConfig['images']>>) => void;
  
  // Section control
  toggleSection: (id: string, enabled?: boolean) => void;
  moveSection: (id: string, direction: 'up' | 'down') => void;
  createCustomSection: (data: Parameters<typeof addCustomSection>[0]) => void;
  removeCustomSection: (id: string) => void;

  // Content updates
  updateBusiness: (updates: Partial<BusinessConfig>) => void;
  updateBusinessConfig: (updates: Partial<BusinessConfig>) => void;
  updateHero: (updates: Partial<HeroConfig>) => void;
  updateHeroConfig: (updates: Partial<HeroConfig>) => void;
  refreshConfig: () => void;
  updateAnnouncement: (updates: Partial<AnnouncementConfig>) => void;
  updateWhyChooseUsList: (items: WhyChooseUsItem[]) => void;
  updateStepsList: (steps: ProcessStep[]) => void;
  updateFaqsList: (faqs: FaqItem[]) => void;
  updateReviewsList: (reviews: ReviewItem[]) => void;
  updateAreasList: (areas: AreaInfo[]) => void;
  updatePricingConfig: (pricing: Partial<BusinessConfig['pricing']>) => void;

  // Backup & Reset
  resetToFactory: () => void;
  exportConfigJson: () => string;
  importConfigJson: (json: string) => boolean;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<FullSiteConfig>(getStoredSiteConfig());

  useEffect(() => {
    // 1. Authoritative initial fetch from Supabase Central Source of Truth
    fetchSiteConfigFromSupabase().then((latest) => {
      if (latest) {
        setConfig(latest);
      }
    });

    // 2. Local event listener for fast in-tab responses
    const handleConfigChange = (e: any) => {
      setConfig(e?.detail || getStoredSiteConfig());
    };
    window.addEventListener(SITE_CONFIG_EVENT, handleConfigChange);

    const handleCentralImagesChange = () => {
      setConfig(getStoredSiteConfig());
    };
    window.addEventListener(CENTRAL_IMAGES_EVENT, handleCentralImagesChange);

    // 3. Supabase Realtime subscription for cross-browser, cross-device instant sync
    // Polite 2-second deferral allows critical LCP paint and font rendering to finish first
    let channel: any = null;
    const realtimeTimer = setTimeout(() => {
      if (isSupabaseConfigured() && typeof window !== 'undefined') {
        try {
          channel = supabase
            .channel('realtime:site_settings')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'site_settings' },
              (payload) => {
                if (payload.new && (payload.new as any).config) {
                  const updated = sanitizeAndMergeConfig((payload.new as any).config);
                  setConfig(updated);
                }
              }
            )
            .subscribe();
        } catch (err) {
          console.warn('Realtime subscription notice for site_settings:', err);
        }
      }
    }, 2000);

    return () => {
      clearTimeout(realtimeTimer);
      window.removeEventListener(SITE_CONFIG_EVENT, handleConfigChange);
      window.removeEventListener(CENTRAL_IMAGES_EVENT, handleCentralImagesChange);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const toggleSection = (id: string, enabled?: boolean) => {
    const updated = toggleSectionVisibility(id, enabled);
    setConfig(updated);
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const updated = moveSectionOrder(id, direction);
    setConfig(updated);
  };

  const createCustomSection = (data: Parameters<typeof addCustomSection>[0]) => {
    addCustomSection(data);
    setConfig(getStoredSiteConfig());
  };

  const removeCustomSection = (id: string) => {
    deleteCustomSection(id);
    setConfig(getStoredSiteConfig());
  };

  const updateBusiness = (updates: Partial<BusinessConfig>) => {
    const updated: FullSiteConfig = {
      ...config,
      business: { ...config.business, ...updates }
    };
    saveSiteConfig(updated);
    setConfig(updated);
  };

  const updateHero = (updates: Partial<HeroConfig>) => {
    const updated: FullSiteConfig = {
      ...config,
      hero: { ...config.hero, ...updates }
    };
    saveSiteConfig(updated);
    setConfig(updated);
  };

  const updateAnnouncement = (updates: Partial<AnnouncementConfig>) => {
    const updated: FullSiteConfig = {
      ...config,
      announcement: { ...config.announcement, ...updates }
    };
    saveSiteConfig(updated);
    setConfig(updated);
  };

  const updateWhyChooseUsList = (items: WhyChooseUsItem[]) => {
    const updated: FullSiteConfig = {
      ...config,
      whyChooseUs: items
    };
    saveSiteConfig(updated);
    setConfig(updated);
  };

  const updateStepsList = (steps: ProcessStep[]) => {
    const updated: FullSiteConfig = {
      ...config,
      cleaningSteps: steps
    };
    saveSiteConfig(updated);
    setConfig(updated);
  };

  const updateFaqsList = (faqs: FaqItem[]) => {
    const updated: FullSiteConfig = {
      ...config,
      faqs: faqs
    };
    saveSiteConfig(updated);
    setConfig(updated);
  };

  const updateReviewsList = (reviews: ReviewItem[]) => {
    const updated: FullSiteConfig = {
      ...config,
      reviews: reviews
    };
    saveSiteConfig(updated);
    setConfig(updated);
  };

  const updateAreasList = (areas: AreaInfo[]) => {
    const updated: FullSiteConfig = {
      ...config,
      areas: areas
    };
    saveSiteConfig(updated);
    setConfig(updated);
  };

  const updatePricingConfig = (pricing: Partial<BusinessConfig['pricing']>) => {
    const updated: FullSiteConfig = {
      ...config,
      business: {
        ...config.business,
        pricing: { ...config.business.pricing, ...pricing }
      }
    };
    saveSiteConfig(updated);
    setConfig(updated);
  };

  const resetToFactory = () => {
    resetSiteConfigToDefaults().then(def => {
      setConfig(def);
    });
  };

  const exportConfigJson = () => {
    return JSON.stringify(config, null, 2);
  };

  const importConfigJson = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (parsed && typeof parsed === 'object' && parsed.business && parsed.sections) {
        saveSiteConfig(parsed as FullSiteConfig);
        setConfig(getStoredSiteConfig());
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to import config:', err);
      return false;
    }
  };

  const updateSiteImages = (updates: Partial<NonNullable<FullSiteConfig['images']>>) => {
    const currentImages = config.images || {
      heroPoster: 'https://img.youtube.com/vi/vaVkY5afSSE/hqdefault.jpg',
      heroBg: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg',
      aboutStoryImage: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/hero/aboutstoryimage_1794136892339.png',
      popularTankImage: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg',
      popularUndergroundImage: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/underground-water-tank-cleaning_1794133736994.png',
      popularPipelineImage: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/water-pipeline-cleaning_1794133710278.jpg'
    };
    const updatedImages = { ...currentImages, ...updates };
    const updated: FullSiteConfig = {
      ...config,
      images: updatedImages
    };
    saveSiteConfig(updated);
    setConfig(updated);
  };

  const sortedSections = [...config.sections].sort((a, b) => a.order - b.order);

  const imagesValue = config.images || {
    heroPoster: 'https://img.youtube.com/vi/vaVkY5afSSE/hqdefault.jpg',
    heroBg: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg',
    aboutStoryImage: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/hero/aboutstoryimage_1794136892339.png',
    popularTankImage: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg',
    popularUndergroundImage: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/underground-water-tank-cleaning_1794133736994.png',
    popularPipelineImage: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/water-pipeline-cleaning_1794133710278.jpg'
  };

  return (
    <SiteConfigContext.Provider
      value={{
        config,
        sections: sortedSections,
        business: config.business,
        hero: config.hero,
        announcement: config.announcement,
        whyChooseUs: config.whyChooseUs,
        cleaningSteps: config.cleaningSteps,
        faqs: config.faqs,
        reviews: config.reviews,
        areas: config.areas,
        pricing: config.business.pricing,
        images: imagesValue,
        updateSiteImages,
        toggleSection,
        moveSection,
        createCustomSection,
        removeCustomSection,
        updateBusiness,
        updateBusinessConfig: updateBusiness,
        updateHero,
        updateHeroConfig: updateHero,
        refreshConfig: () => setConfig(getStoredSiteConfig()),
        updateAnnouncement,
        updateWhyChooseUsList,
        updateStepsList,
        updateFaqsList,
        updateReviewsList,
        updateAreasList,
        updatePricingConfig,
        resetToFactory,
        exportConfigJson,
        importConfigJson
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
};
