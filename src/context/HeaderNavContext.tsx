import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { HeaderConfig, NavItem } from '../types/header';
import { 
  getHeaderConfig, 
  saveHeaderConfig, 
  getNavItems, 
  saveNavItem, 
  deleteNavItem, 
  reorderNavItems, 
  buildNavTree, 
  uploadLogoToStorage,
  DEFAULT_HEADER_CONFIG, 
  DEFAULT_NAV_ITEMS,
  HEADER_CHANGE_EVENT 
} from '../services/headerService';

interface HeaderNavContextType {
  headerConfig: HeaderConfig;
  navItems: NavItem[];
  navTree: NavItem[];
  isLoading: boolean;
  saveHeader: (config: HeaderConfig) => Promise<boolean>;
  saveNav: (item: NavItem) => Promise<boolean>;
  deleteNav: (id: string) => Promise<boolean>;
  reorderNav: (items: NavItem[]) => Promise<boolean>;
  uploadLogo: (file: File) => Promise<{ url: string | null; error: string | null }>;
  refresh: () => Promise<void>;
}

const HeaderNavContext = createContext<HeaderNavContextType | undefined>(undefined);

export const HeaderNavProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(DEFAULT_HEADER_CONFIG);
  const [navItems, setNavItems] = useState<NavItem[]>(DEFAULT_NAV_ITEMS);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [cfg, items] = await Promise.all([
        getHeaderConfig(),
        getNavItems()
      ]);
      setHeaderConfig(cfg);
      setNavItems(items);
    } catch (err) {
      console.error('Failed to load header data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener(HEADER_CHANGE_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(HEADER_CHANGE_EVENT, handleUpdate);
    };
  }, [loadData]);

  const saveHeader = async (config: HeaderConfig): Promise<boolean> => {
    setHeaderConfig(config);
    return await saveHeaderConfig(config);
  };

  const saveNav = async (item: NavItem): Promise<boolean> => {
    const success = await saveNavItem(item);
    if (success) {
      await loadData();
    }
    return success;
  };

  const deleteNav = async (id: string): Promise<boolean> => {
    const success = await deleteNavItem(id);
    if (success) {
      await loadData();
    }
    return success;
  };

  const reorderNav = async (items: NavItem[]): Promise<boolean> => {
    setNavItems(items);
    return await reorderNavItems(items);
  };

  const uploadLogo = async (file: File) => {
    return await uploadLogoToStorage(file);
  };

  const navTree = useMemo(() => {
    return buildNavTree(navItems);
  }, [navItems]);

  return (
    <HeaderNavContext.Provider
      value={{
        headerConfig,
        navItems,
        navTree,
        isLoading,
        saveHeader,
        saveNav,
        deleteNav,
        reorderNav,
        uploadLogo,
        refresh: loadData
      }}
    >
      {children}
    </HeaderNavContext.Provider>
  );
};

export const useHeaderNav = (): HeaderNavContextType => {
  const context = useContext(HeaderNavContext);
  if (!context) {
    console.warn('useHeaderNav accessed outside HeaderNavProvider. Returning fallback defaults.');
    return {
      headerConfig: DEFAULT_HEADER_CONFIG,
      navItems: DEFAULT_NAV_ITEMS,
      navTree: buildNavTree(DEFAULT_NAV_ITEMS),
      isLoading: false,
      saveHeader: async () => false,
      saveNav: async () => false,
      deleteNav: async () => false,
      reorderNav: async () => false,
      uploadLogo: async () => ({ url: null, error: 'Provider not initialized' }),
      refresh: async () => {}
    };
  }
  return context;
};
