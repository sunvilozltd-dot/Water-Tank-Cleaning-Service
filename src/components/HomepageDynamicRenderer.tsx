import React from 'react';
import { useHomepageCms } from '../context/HomepageCmsContext';
import { useSsrHomepageSections } from '../context/SsrHomepageSectionsContext';
import { Hero } from './Hero';
import { RunningSpecialOffers } from './RunningSpecialOffers';
import { PopularServicesSection } from './PopularServicesSection';
import { WaterWaveDivider } from './WaterWaveDivider';

const LazyAboutPreviewSection = React.lazy(() =>
  import('./AboutPreviewSection').then(m => ({ default: m.AboutPreviewSection }))
);
const LazyWhyChooseUsSection = React.lazy(() =>
  import('./WhyChooseUsSection').then(m => ({ default: m.WhyChooseUsSection }))
);
const LazyAllServicesFaqSection = React.lazy(() =>
  import('./AllServicesFaqSection').then(m => ({ default: m.AllServicesFaqSection }))
);
const LazyTrustSection = React.lazy(() =>
  import('./TrustSection').then(m => ({ default: m.TrustSection }))
);
const LazySmartQuoteWizard = React.lazy(() =>
  import('./SmartQuoteWizard').then(m => ({ default: m.SmartQuoteWizard }))
);
const LazyServiceAreaSection = React.lazy(() =>
  import('./ServiceAreaSection').then(m => ({ default: m.ServiceAreaSection }))
);
const LazyReviewsSection = React.lazy(() =>
  import('./ReviewsSection').then(m => ({ default: m.ReviewsSection }))
);
const LazyBlogSection = React.lazy(() =>
  import('./BlogSection').then(m => ({ default: m.BlogSection }))
);
const LazyProjectVideoSliderSection = React.lazy(() =>
  import('./ProjectVideoSliderSection').then(m => ({ default: m.ProjectVideoSliderSection }))
);
const LazyOurWorkVideosSection = React.lazy(() =>
  import('./OurWorkVideosSection').then(m => ({ default: m.OurWorkVideosSection }))
);
const LazyFinalCtaSection = React.lazy(() =>
  import('./FinalCtaSection').then(m => ({ default: m.FinalCtaSection }))
);
const LazyCustomSectionRenderer = React.lazy(() =>
  import('./CustomSectionRenderer').then(m => ({ default: m.CustomSectionRenderer }))
);

interface HomepageDynamicRendererProps {
  onOpenQuoteModal: (serviceName?: string) => void;
  onOpenBlogModal?: (post: any) => void;
  onNavigate?: (path: string) => void;
  onVisibleFaqsChange?: (visibleFaqs: { question: string; answer: string }[]) => void;
}

export const HomepageDynamicRenderer: React.FC<HomepageDynamicRendererProps> = ({
  onOpenQuoteModal,
  onOpenBlogModal,
  onNavigate,
  onVisibleFaqsChange
}) => {
  const { sections, loading } = useHomepageCms();
  const ssr = useSsrHomepageSections();

  const AboutPreview = ssr?.AboutPreviewSection || LazyAboutPreviewSection;
  const WhyChooseUs = ssr?.WhyChooseUsSection || LazyWhyChooseUsSection;
  const AllServicesFaq = ssr?.AllServicesFaqSection || LazyAllServicesFaqSection;
  const Trust = ssr?.TrustSection || LazyTrustSection;
  const SmartQuote = ssr?.SmartQuoteWizard || LazySmartQuoteWizard;
  const ServiceArea = ssr?.ServiceAreaSection || LazyServiceAreaSection;
  const Reviews = ssr?.ReviewsSection || LazyReviewsSection;
  const Blog = ssr?.BlogSection || LazyBlogSection;
  const ProjectVideoSlider = ssr?.ProjectVideoSliderSection || LazyProjectVideoSliderSection;
  const OurWorkVideos = ssr?.OurWorkVideosSection || LazyOurWorkVideosSection;
  const FinalCta = ssr?.FinalCtaSection || LazyFinalCtaSection;
  const CustomSection = ssr?.CustomSectionRenderer || LazyCustomSectionRenderer;

  const wrapLazy = (node: React.ReactNode) =>
    ssr ? <>{node}</> : <React.Suspense fallback={null}>{node}</React.Suspense>;

  // Standard ordered homepage flow strictly respecting existing layout and visual hierarchy:
  const renderStandardHomepage = () => (
    <>
      {/* 1. Hero Section (Eager above-the-fold) */}
      <Hero onOpenQuoteModal={() => onOpenQuoteModal()} />

      {/* 2. Running Special Offers (Eager above-the-fold) */}
      <RunningSpecialOffers onNavigate={onNavigate} />

      {/* 3. Popular Services (Eager above-the-fold) */}
      <PopularServicesSection onOpenQuoteModal={onOpenQuoteModal} onNavigate={onNavigate} />

      {/* 4+. Below-the-fold sections (Code-split in browser, eager via context in SSR) */}
      {wrapLazy(
        <>
          <AboutPreview
            onNavigate={onNavigate}
            onOpenQuoteModal={() => onOpenQuoteModal()}
          />
          <WhyChooseUs />
          <AllServicesFaq onNavigate={onNavigate} onVisibleFaqsChange={onVisibleFaqsChange} />
          <Trust />
          <ProjectVideoSlider />
          <Reviews />
          <WaterWaveDivider variant="flowing" fillColor="#FFFFFF" />
          <section id="quote" className="py-14 sm:py-20 bg-white border-b border-[#E2E8F0] relative overflow-hidden" aria-label="Smart Quote Wizard">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <SmartQuote />
            </div>
          </section>
          <ServiceArea />
          <Blog onNavigate={onNavigate} onOpenPostModal={onOpenBlogModal} />
          <WaterWaveDivider variant="crest" fillColor="#123047" />
          <FinalCta onOpenQuoteModal={onOpenQuoteModal} />
        </>
      )}
    </>
  );

  if (loading || !sections || sections.length === 0) {
    return renderStandardHomepage();
  }

  const sortedSections = [...sections]
    .filter(s => s.isEnabled)
    .sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0));

  const hasCustomRequiredFlow = sortedSections.some(s => s.sectionKey === 'popularServices' || s.sectionKey === 'offers');
  if (!hasCustomRequiredFlow) {
    return renderStandardHomepage();
  }

  return (
    <>
      {sortedSections.map((section) => {
        switch (section.sectionKey) {
          case 'hero':
            return (
              <React.Fragment key={section.id}>
                <Hero onOpenQuoteModal={() => onOpenQuoteModal()} />
                <RunningSpecialOffers onNavigate={onNavigate} />
              </React.Fragment>
            );
          case 'offers':
          case 'specialOffers':
            return <RunningSpecialOffers key={section.id} onNavigate={onNavigate} />;
          case 'popularServices':
          case 'services':
            return (
              <React.Fragment key={section.id}>
                <PopularServicesSection onOpenQuoteModal={onOpenQuoteModal} onNavigate={onNavigate} />
              </React.Fragment>
            );
          case 'otherServices':
            return null;
          case 'about':
            return wrapLazy(
              <AboutPreview
                key={section.id}
                onNavigate={onNavigate}
                onOpenQuoteModal={() => onOpenQuoteModal()}
              />
            );
          case 'whyChoose':
            return wrapLazy(<WhyChooseUs key={section.id} />);
          case 'allServicesFaq':
            return wrapLazy(
              <AllServicesFaq
                key={section.id}
                onNavigate={onNavigate}
                onVisibleFaqsChange={onVisibleFaqsChange}
              />
            );
          case 'trust':
            return wrapLazy(<Trust key={section.id} />);
          case 'beforeAfter':
          case 'projectVideos':
          case 'videos':
            return wrapLazy(<ProjectVideoSlider key={section.id} />);
          case 'pricing':
            return null;
          case 'calculator':
            return wrapLazy(
              <React.Fragment key={section.id}>
                <WaterWaveDivider variant="flowing" fillColor="#FFFFFF" />
                <section id="quote" className="py-14 sm:py-20 bg-white border-b border-[#E2E8F0] relative overflow-hidden" aria-label="Smart Quote Wizard">
                  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <SmartQuote />
                  </div>
                </section>
              </React.Fragment>
            );
          case 'video':
            if (sortedSections.some(s => s.sectionKey === 'beforeAfter' && s.isEnabled)) {
              return null;
            }
            return wrapLazy(<OurWorkVideos key={section.id} />);
          case 'reviews':
            return wrapLazy(<Reviews key={section.id} />);
          case 'areas':
            return wrapLazy(<ServiceArea key={section.id} />);
          case 'blog':
            return wrapLazy(<Blog key={section.id} onNavigate={onNavigate} onOpenPostModal={onOpenBlogModal} />);
          case 'cta':
            return wrapLazy(<FinalCta key={section.id} onOpenQuoteModal={onOpenQuoteModal} />);
          case 'custom':
            return wrapLazy(<CustomSection key={section.id} section={section} onOpenQuoteModal={onOpenQuoteModal} />);
          default:
            return null;
        }
      })}
    </>
  );
};

export default HomepageDynamicRenderer;
