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
  SITE_CONFIG_EVENT 
} from '../utils/siteConfigStore';
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
    const handleConfigChange = () => {
      setConfig(getStoredSiteConfig());
    };
    window.addEventListener(SITE_CONFIG_EVENT, handleConfigChange);
    return () => window.removeEventListener(SITE_CONFIG_EVENT, handleConfigChange);
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
    const def = resetSiteConfigToDefaults();
    setConfig(def);
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
      heroPoster: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
      heroBg: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
      aboutStoryImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
      popularTankImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
      popularPipelineImage: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=75'
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
    heroPoster: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
    heroBg: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
    aboutStoryImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
    popularTankImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
    popularPipelineImage: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=75'
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
