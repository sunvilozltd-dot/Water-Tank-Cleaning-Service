import React, { createContext, useContext } from 'react';

export interface SsrHomepageSectionComponents {
  AboutPreviewSection?: React.ComponentType<any>;
  WhyChooseUsSection?: React.ComponentType<any>;
  AllServicesFaqSection?: React.ComponentType<any>;
  TrustSection?: React.ComponentType<any>;
  ProjectVideoSliderSection?: React.ComponentType<any>;
  ReviewsSection?: React.ComponentType<any>;
  SmartQuoteWizard?: React.ComponentType<any>;
  ServiceAreaSection?: React.ComponentType<any>;
  BlogSection?: React.ComponentType<any>;
  OurWorkVideosSection?: React.ComponentType<any>;
  FinalCtaSection?: React.ComponentType<any>;
  CustomSectionRenderer?: React.ComponentType<any>;
}

const SsrHomepageSectionsContext = createContext<SsrHomepageSectionComponents | null>(null);

export const SsrHomepageSectionsProvider: React.FC<{
  components: SsrHomepageSectionComponents;
  children: React.ReactNode;
}> = ({ components, children }) => (
  <SsrHomepageSectionsContext.Provider value={components}>
    {children}
  </SsrHomepageSectionsContext.Provider>
);

export const useSsrHomepageSections = (): SsrHomepageSectionComponents | null =>
  useContext(SsrHomepageSectionsContext);
