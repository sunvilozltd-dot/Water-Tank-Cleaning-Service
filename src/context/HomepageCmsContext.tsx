import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HomepageSection, CustomSectionTemplate, HomepageRevisionMetadata } from '../types/homepageCms';
import { 
  getHomepageSectionsWithRevision, 
  getStoredHomepagePayload,
  saveHomepageSection, 
  reorderHomepageSections, 
  deleteHomepageSection, 
  duplicateHomepageSection, 
  createCustomSection,
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_HOMEPAGE_REVISION,
  sanitizeHomepageSection,
  HOMEPAGE_CMS_EVENT 
} from '../services/homepageCmsService';
import { PUBLISHED_HOMEPAGE_SECTIONS, PUBLISHED_HOMEPAGE_REVISION } from '../data/publishedHomepageSnapshot';
import { CENTRAL_IMAGES_EVENT } from '../services/imageSyncService';

export type HomepageCmsStatus = 'loading' | 'success' | 'empty' | 'error';

interface HomepageCmsContextType {
  sections: HomepageSection[];
  revision: HomepageRevisionMetadata;
  status: HomepageCmsStatus;
  isLoading: boolean;
  isSuccess: boolean;
  isEmpty: boolean;
  isError: boolean;
  loading: boolean;
  error: string | null;
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

/**
 * Authoritative initialization strategy:
 * 1. Checks window.__INITIAL_HOMEPAGE_SECTIONS__ & window.__HOMEPAGE_REVISION__ injected during SSR / static prerender
 *    Always hydrates with the authoritative server snapshot to guarantee 100% hydration consistency.
 *    Stale or inflated client localStorage is strictly blocked from overriding the server snapshot.
 * 2. Checks validated local cache payload only when no window snapshot is available (e.g. dynamic SPA route transition)
 * 3. Falls back to PUBLISHED_HOMEPAGE_SECTIONS snapshot
 */
function getInitialAuthoritativeState(): { sections: HomepageSection[]; revision: HomepageRevisionMetadata } {
  if (typeof window !== 'undefined') {
    const ssrSnapshot = (window as any).__INITIAL_HOMEPAGE_SECTIONS__;
    const ssrRevision: HomepageRevisionMetadata | undefined = (window as any).__HOMEPAGE_REVISION__;

    // 1. Authoritative Prerender / SSR Snapshot in HTML:
    // When the browser downloads the static HTML, window.__INITIAL_HOMEPAGE_SECTIONS__ matches
    // the static DOM exactly. We ALWAYS initialize with this snapshot to guarantee 100% hydration
    // consistency and prevent any unvalidated, corrupted or stale localStorage from overriding it.
    if (Array.isArray(ssrSnapshot) && ssrSnapshot.length > 0) {
      return {
        sections: ssrSnapshot.map(sanitizeHomepageSection),
        revision: ssrRevision || {
          ...DEFAULT_HOMEPAGE_REVISION,
          source: 'prerender_snapshot'
        }
      };
    }

    // 2. Client-only fallback when no window snapshot exists (e.g. testing or SPA navigation)
    const cachedPayload = getStoredHomepagePayload();
    if (cachedPayload && cachedPayload.sections.length > 0) {
      return {
        sections: cachedPayload.sections,
        revision: cachedPayload.revision
      };
    }
  }

  // 3. Production bundled snapshot
  return {
    sections: PUBLISHED_HOMEPAGE_SECTIONS,
    revision: PUBLISHED_HOMEPAGE_REVISION
  };
}

export const HomepageCmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{ sections: HomepageSection[]; revision: HomepageRevisionMetadata }>(getInitialAuthoritativeState);
  const [status, setStatus] = useState<HomepageCmsStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const loadSections = useCallback(async () => {
    try {
      const result = await getHomepageSectionsWithRevision();
      if (!result.sections || result.sections.length === 0) {
        setState(prev => ({ ...prev, sections: [] }));
        setStatus('empty');
        setError(null);
      } else {
        setState({
          sections: result.sections,
          revision: result.revision
        });
        setStatus('success');
        setError(null);
      }
    } catch (err: any) {
      console.error('[HomepageCmsContext] Failed to load homepage sections:', err);
      setStatus('error');
      setError(err?.message || 'Failed to load published sections');
    }
  }, []);

  useEffect(() => {
    loadSections();

    const handleUpdate = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (customEvt.detail?.sections && customEvt.detail?.revision) {
        setState({
          sections: customEvt.detail.sections,
          revision: customEvt.detail.revision
        });
        setStatus('success');
      } else {
        loadSections();
      }
    };

    window.addEventListener(HOMEPAGE_CMS_EVENT, handleUpdate);
    window.addEventListener(CENTRAL_IMAGES_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(HOMEPAGE_CMS_EVENT, handleUpdate);
      window.removeEventListener(CENTRAL_IMAGES_EVENT, handleUpdate);
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
    setState(prev => ({ ...prev, sections: newSections }));
    const success = await reorderHomepageSections(newSections);
    if (success) {
      await loadSections();
    }
    return success;
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

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';
  const isEmpty = status === 'empty';
  const isError = status === 'error';

  return (
    <HomepageCmsContext.Provider
      value={{
        sections: state.sections,
        revision: state.revision,
        status,
        isLoading,
        isSuccess,
        isEmpty,
        isError,
        loading: isLoading,
        error,
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
      revision: DEFAULT_HOMEPAGE_REVISION,
      status: 'success',
      isLoading: false,
      isSuccess: true,
      isEmpty: false,
      isError: false,
      loading: false,
      error: null,
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

export default HomepageCmsContext;
