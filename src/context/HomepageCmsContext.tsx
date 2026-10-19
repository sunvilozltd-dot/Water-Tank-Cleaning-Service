import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HomepageSection, CustomSectionTemplate } from '../types/homepageCms';
import { 
  getHomepageSections, 
  saveHomepageSection, 
  reorderHomepageSections, 
  deleteHomepageSection, 
  duplicateHomepageSection, 
  createCustomSection,
  DEFAULT_HOMEPAGE_SECTIONS,
  HOMEPAGE_CMS_EVENT 
} from '../services/homepageCmsService';

interface HomepageCmsContextType {
  sections: HomepageSection[];
  isLoading: boolean;
  loading: boolean;
  saveSection: (section: HomepageSection) => Promise<boolean>;
  updateSection: (section: HomepageSection) => Promise<boolean>;
  saveAllSections: (sections: HomepageSection[]) => Promise<boolean>;
  reorder: (sections: HomepageSection[]) => Promise<boolean>;
  deleteSection: (id: string) => Promise<boolean>;
  duplicateSection: (section: HomepageSection) => Promise<HomepageSection>;
  addCustomSection: (template: CustomSectionTemplate, titleBn: string, titleEn: string) => Promise<HomepageSection>;
  refresh: () => Promise<void>;
}

const HomepageCmsContext = createContext<HomepageCmsContextType | undefined>(undefined);

export const HomepageCmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sections, setSections] = useState<HomepageSection[]>(DEFAULT_HOMEPAGE_SECTIONS);
  const [isLoading, setIsLoading] = useState(true);

  const loadSections = useCallback(async () => {
    try {
      const data = await getHomepageSections();
      setSections(data);
    } catch (err) {
      console.error('Failed to load homepage sections:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSections();
    const handleUpdate = () => {
      loadSections();
    };
    window.addEventListener(HOMEPAGE_CMS_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(HOMEPAGE_CMS_EVENT, handleUpdate);
    };
  }, [loadSections]);

  const saveSection = async (section: HomepageSection): Promise<boolean> => {
    const success = await saveHomepageSection(section);
    if (success) {
      await loadSections();
    }
    return success;
  };

  const reorder = async (newSections: HomepageSection[]): Promise<boolean> => {
    setSections(newSections);
    return await reorderHomepageSections(newSections);
  };

  const deleteSection = async (id: string): Promise<boolean> => {
    const success = await deleteHomepageSection(id);
    if (success) {
      await loadSections();
    }
    return success;
  };

  const duplicate = async (section: HomepageSection): Promise<HomepageSection> => {
    const created = await duplicateHomepageSection(section);
    await loadSections();
    return created;
  };

  const addCustom = async (template: CustomSectionTemplate, titleBn: string, titleEn: string): Promise<HomepageSection> => {
    const created = await createCustomSection(template, titleBn, titleEn);
    await loadSections();
    return created;
  };

  return (
    <HomepageCmsContext.Provider
      value={{
        sections,
        isLoading,
        loading: isLoading,
        saveSection,
        updateSection: saveSection,
        saveAllSections: reorder,
        reorder,
        deleteSection,
        duplicateSection: duplicate,
        addCustomSection: addCustom,
        refresh: loadSections
      }}
    >
      {children}
    </HomepageCmsContext.Provider>
  );
};

export const useHomepageCms = (): HomepageCmsContextType => {
  const context = useContext(HomepageCmsContext);
  if (!context) {
    console.warn('useHomepageCms accessed outside HomepageCmsProvider. Returning fallback defaults.');
    return {
      sections: DEFAULT_HOMEPAGE_SECTIONS,
      isLoading: false,
      loading: false,
      saveSection: async () => false,
      updateSection: async () => false,
      saveAllSections: async () => false,
      reorder: async () => false,
      deleteSection: async () => false,
      duplicateSection: async (s) => s,
      addCustomSection: async () => ({} as any),
      refresh: async () => {}
    };
  }
  return context;
};
