import React from 'react';
import { renderToString } from 'react-dom/server';
import App, { SsrPageComponents } from '../App';
import {
  SsrHomepageSectionComponents,
  SsrHomepageSectionsProvider
} from '../context/SsrHomepageSectionsContext';
import {
  LiveSeoDataset,
  isSliceAvailable,
  stripSecretsFromSiteConfig
} from './siteDataFetcher';

// Synchronous page imports for Node/Serverless SSR (bypasses React.lazy Suspense fallbacks)
import { AboutPage } from '../pages/AboutPage';
import { ServicesPage } from '../pages/ServicesPage';
import { WaterTankCleaningPage } from '../pages/WaterTankCleaningPage';
import { PipelineCleaningPage } from '../pages/PipelineCleaningPage';
import { ContactPage } from '../pages/ContactPage';
import { ServiceAreaPage } from '../pages/ServiceAreaPage';
import { LocationDetailPage } from '../pages/LocationDetailPage';
import { BlogPage } from '../pages/BlogPage';
import { BlogPostDetailPage } from '../pages/BlogPostDetailPage';
import { PortfolioPage } from '../pages/PortfolioPage';
import { CaseStudyDetailPage } from '../pages/CaseStudyDetailPage';
import { TermsPage } from '../pages/TermsPage';
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage';
import { FaqPage } from '../pages/FaqPage';
import { ServiceDetailPage } from '../pages/ServiceDetailPage';
import { GetQuotePage } from '../pages/GetQuotePage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Synchronous below-the-fold homepage sections for complete homepage SSR
import { AboutPreviewSection } from '../components/AboutPreviewSection';
import { WhyChooseUsSection } from '../components/WhyChooseUsSection';
import { AllServicesFaqSection } from '../components/AllServicesFaqSection';
import { TrustSection } from '../components/TrustSection';
import { ProjectVideoSliderSection } from '../components/ProjectVideoSliderSection';
import { ReviewsSection } from '../components/ReviewsSection';
import { SmartQuoteWizard } from '../components/SmartQuoteWizard';
import { ServiceAreaSection } from '../components/ServiceAreaSection';
import { BlogSection } from '../components/BlogSection';
import { OurWorkVideosSection } from '../components/OurWorkVideosSection';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { CustomSectionRenderer } from '../components/CustomSectionRenderer';

export const SSR_PAGE_COMPONENTS: SsrPageComponents = {
  AboutPage,
  ServicesPage,
  WaterTankCleaningPage,
  PipelineCleaningPage,
  ContactPage,
  ServiceAreaPage,
  LocationDetailPage,
  BlogPage,
  BlogPostDetailPage,
  PortfolioPage,
  CaseStudyDetailPage,
  TermsPage,
  PrivacyPolicyPage,
  FaqPage,
  ServiceDetailPage,
  GetQuotePage,
  NotFoundPage
};

export const SSR_HOMEPAGE_SECTIONS: SsrHomepageSectionComponents = {
  AboutPreviewSection,
  WhyChooseUsSection,
  AllServicesFaqSection,
  TrustSection,
  ProjectVideoSliderSection,
  ReviewsSection,
  SmartQuoteWizard,
  ServiceAreaSection,
  BlogSection,
  OurWorkVideosSection,
  FinalCtaSection,
  CustomSectionRenderer
};

const SNAPSHOT_KEYS = [
  '__INITIAL_HOMEPAGE_SECTIONS__',
  '__HOMEPAGE_REVISION__',
  '__INITIAL_IMAGE_REGISTRY__',
  '__INITIAL_SERVICES_FAQS__',
  '__INITIAL_SERVICES__',
  '__INITIAL_BLOG_POSTS__',
  '__INITIAL_ZONES__',
  '__INITIAL_AREAS__',
  '__INITIAL_CASE_STUDIES__',
  '__INITIAL_SITE_CONFIG__'
] as const;

export function buildPublicSiteConfigSnapshot(dataset: LiveSeoDataset): Record<string, any> | undefined {
  const cleanCfg = stripSecretsFromSiteConfig(dataset.siteConfig);
  if (!cleanCfg) return undefined;
  return {
    business: cleanCfg.business || undefined,
    announcement: cleanCfg.announcement || undefined,
    hero: cleanCfg.hero || undefined,
    sections: cleanCfg.sections || undefined,
    whyChooseUs: cleanCfg.whyChooseUs || undefined,
    cleaningSteps: cleanCfg.cleaningSteps || undefined,
    faqs: cleanCfg.faqs || undefined,
    reviews: cleanCfg.reviews || undefined,
    areas: cleanCfg.areas || undefined,
    images: cleanCfg.images || undefined,
    seo: cleanCfg.seo ? { ...cleanCfg.seo, indexNowKey: '' } : undefined
  };
}

/**
 * Assigns global hydration snapshots strictly matching what `renderRouteHtmlFromTemplate`
 * injects into `<head>`, renders `<App />` synchronously via `renderToString`,
 * and cleanly restores global state afterward.
 */
export function renderSsrAppRootHtml(routePath: string, dataset: LiveSeoDataset): string {
  const globalAny = globalThis as any;
  const hadWindow = Object.prototype.hasOwnProperty.call(globalAny, 'window');
  const previousWindow = globalAny.window;
  const previousGlobalEntries: Record<string, { present: boolean; value: any }> = {};
  const previousWindowEntries: Record<string, { present: boolean; value: any }> = {};

  const hadLocation = hadWindow && globalAny.window
    ? Object.prototype.hasOwnProperty.call(globalAny.window, 'location')
    : false;
  const previousLocation = hadWindow && globalAny.window ? globalAny.window.location : undefined;

  if (!hadWindow || !globalAny.window) {
    globalAny.window = {};
  }
  const cleanPathname = routePath.split('?')[0].split('#')[0] || '/';
  const queryPart = routePath.includes('?') ? `?${routePath.split('?')[1].split('#')[0]}` : '';
  globalAny.window.location = {
    pathname: cleanPathname,
    search: queryPart,
    hash: '',
    origin: 'https://sunvilozcleancare.com',
    hostname: 'sunvilozcleancare.com',
    href: `https://sunvilozcleancare.com${routePath}`
  };

  for (const key of SNAPSHOT_KEYS) {
    previousGlobalEntries[key] = {
      present: Object.prototype.hasOwnProperty.call(globalAny, key),
      value: globalAny[key]
    };
    previousWindowEntries[key] = {
      present: Object.prototype.hasOwnProperty.call(globalAny.window, key),
      value: globalAny.window[key]
    };
  }

  const assignSnapshot = (key: string, value: any) => {
    if (value !== undefined) {
      globalAny[key] = value;
      globalAny.window[key] = value;
    } else {
      delete globalAny[key];
      delete globalAny.window[key];
    }
  };

  try {
    const hasHomepage = dataset.homepageSections && dataset.homepageSections.length > 0;
    assignSnapshot('__INITIAL_HOMEPAGE_SECTIONS__', hasHomepage ? dataset.homepageSections : undefined);
    assignSnapshot('__HOMEPAGE_REVISION__', hasHomepage ? dataset.homepageRevision : undefined);
    assignSnapshot('__INITIAL_IMAGE_REGISTRY__', dataset.imageRegistry || undefined);

    assignSnapshot(
      '__INITIAL_SERVICES_FAQS__',
      dataset.status?.configured && isSliceAvailable(dataset.status, 'servicesFaqs')
        ? dataset.servicesFaqs
        : undefined
    );
    assignSnapshot(
      '__INITIAL_SERVICES__',
      dataset.status?.configured && isSliceAvailable(dataset.status, 'services')
        ? dataset.services.filter(s => s.is_active !== false)
        : undefined
    );
    assignSnapshot(
      '__INITIAL_BLOG_POSTS__',
      dataset.status?.configured && isSliceAvailable(dataset.status, 'blogPosts')
        ? dataset.blogPosts.filter(p => p.published !== false)
        : undefined
    );
    assignSnapshot(
      '__INITIAL_ZONES__',
      dataset.status?.configured && isSliceAvailable(dataset.status, 'zones')
        ? dataset.zones.filter(z => z.isVisible !== false && z.status !== 'draft')
        : undefined
    );
    assignSnapshot(
      '__INITIAL_AREAS__',
      dataset.status?.configured && isSliceAvailable(dataset.status, 'areas')
        ? dataset.areas.filter(a => a.isVisible !== false && a.status === 'published')
        : undefined
    );
    assignSnapshot(
      '__INITIAL_CASE_STUDIES__',
      dataset.status?.configured && isSliceAvailable(dataset.status, 'caseStudies')
        ? (dataset.caseStudies || []).filter(
            c => c.status === 'published' && c.customerConsentGranted === true
          )
        : undefined
    );
    assignSnapshot('__INITIAL_SITE_CONFIG__', buildPublicSiteConfigSnapshot(dataset));

    return renderToString(
      <SsrHomepageSectionsProvider components={SSR_HOMEPAGE_SECTIONS}>
        <App initialPath={routePath} ssrComponents={SSR_PAGE_COMPONENTS} />
      </SsrHomepageSectionsProvider>
    );
  } finally {
    for (const key of SNAPSHOT_KEYS) {
      if (previousGlobalEntries[key].present) {
        globalAny[key] = previousGlobalEntries[key].value;
      } else {
        delete globalAny[key];
      }
      if (globalAny.window) {
        if (previousWindowEntries[key].present) {
          globalAny.window[key] = previousWindowEntries[key].value;
        } else {
          delete globalAny.window[key];
        }
      }
    }
    if (!hadWindow) {
      delete globalAny.window;
    } else {
      if (hadLocation) {
        globalAny.window.location = previousLocation;
      } else if (globalAny.window) {
        delete globalAny.window.location;
      }
      globalAny.window = previousWindow;
    }
  }
}
