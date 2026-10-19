import React from 'react';
import { useHomepageCms } from '../context/HomepageCmsContext';
import { Hero } from './Hero';
import { RunningSpecialOffers } from './RunningSpecialOffers';
import { PopularServicesSection } from './PopularServicesSection';
import { DiamondSeparator } from './DiamondSeparator';
import { OtherServicesSection } from './OtherServicesSection';
import { AboutPreviewSection } from './AboutPreviewSection';
import { WhyChooseUsSection } from './WhyChooseUsSection';
import { AllServicesFaqSection } from './AllServicesFaqSection';
import { TrustSection } from './TrustSection';
import { PricingSection } from './PricingSection';
import { SmartQuoteWizard } from './SmartQuoteWizard';
import { ServiceAreaSection } from './ServiceAreaSection';
import { ReviewsSection } from './ReviewsSection';
import { BlogSection } from './BlogSection';
import { OurWorkVideosSection } from './OurWorkVideosSection';
import { FinalCtaSection } from './FinalCtaSection';
import { CustomSectionRenderer } from './CustomSectionRenderer';
import { WaterWaveDivider } from './WaterWaveDivider';

interface HomepageDynamicRendererProps {
  onOpenQuoteModal: (serviceName?: string) => void;
  onOpenBlogModal?: (post: any) => void;
  onNavigate?: (path: string) => void;
}

export const HomepageDynamicRenderer: React.FC<HomepageDynamicRendererProps> = ({
  onOpenQuoteModal,
  onOpenBlogModal,
  onNavigate
}) => {
  const { sections, loading } = useHomepageCms();

  // Standard ordered homepage flow strictly respecting user requirements:
  // 1. Hero
  // 2. Running Special Offers (immediately connected beneath/within hero)
  // 3. Popular Services
  // [Diamond line separator in #2585FF]
  // 4. Our Other Services
  // 5. About SUNVILOZ Clean Care (immediately after Our Other Services)
  // 6. Why SUNVILOZ Clean Care? (immediately after About)
  // 7. All Services FAQ Section (concise discovery + button to /services-faq, no full 9-step or full FAQ on home)
  // 8. Remaining sections: Reviews, Calculator, Service Areas, Videos, Blog, Final CTA
  const renderStandardHomepage = () => (
    <>
      {/* 1. Hero Section */}
      <Hero onOpenQuoteModal={() => onOpenQuoteModal()} />

      {/* 2. Running Special Offers */}
      <RunningSpecialOffers onNavigate={onNavigate} />

      {/* 3. Popular Services */}
      <PopularServicesSection onOpenQuoteModal={onOpenQuoteModal} onNavigate={onNavigate} />

      {/* 5. About SUNVILOZ Clean Care */}
      <AboutPreviewSection 
        onNavigate={onNavigate} 
        onOpenQuoteModal={() => onOpenQuoteModal()} 
      />

      {/* 6. Why SUNVILOZ Clean Care? */}
      <WhyChooseUsSection />

      {/* 7. All Services FAQ Section with button to /services-faq */}
      <AllServicesFaqSection onNavigate={onNavigate} />

      {/* 8. Remaining Useful Sections */}
      <TrustSection />
      {/* Replaced BeforeAfterSection with Work Video Documentation */}
      <OurWorkVideosSection />
      <ReviewsSection />
      {/* Water Wave Divider leading into Smart Quote Section */}
      <WaterWaveDivider variant="flowing" fillColor="#08172C" />

      {/* 8. Smart Instant Quote Wizard Section */}
      <section id="quote" className="py-14 sm:py-20 bg-gradient-to-b from-[#08172C] via-[#0B203E] to-[#06152B] border-b border-cyan-900/35 relative overflow-hidden" aria-label="Smart Quote Wizard">
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-10 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" aria-hidden="true" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SmartQuoteWizard />
        </div>
      </section>

      {/* Note: Lower OurWorkVideosSection removed to prevent duplication */}
      <ServiceAreaSection />
      <BlogSection onNavigate={onNavigate} onOpenPostModal={onOpenBlogModal} />

      {/* Wave transition into Final CTA */}
      <WaterWaveDivider variant="crest" fillColor="#0B2545" />
      <FinalCtaSection onOpenQuoteModal={onOpenQuoteModal} />
    </>
  );

  if (loading || !sections || sections.length === 0) {
    return renderStandardHomepage();
  }

  // If custom sections configured, render with exact section ordering logic
  const sortedSections = [...sections]
    .filter(s => s.isEnabled)
    .sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0));

  // If CMS sections don't have specialOffers or allServicesFaq, fallback to standard flow for consistency
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
            return (
              <React.Fragment key={section.id}>
                <PopularServicesSection onOpenQuoteModal={onOpenQuoteModal} onNavigate={onNavigate} />
              </React.Fragment>
            );
          case 'otherServices':
            return null;
          case 'services':
            return (
              <React.Fragment key={section.id}>
                <PopularServicesSection onOpenQuoteModal={onOpenQuoteModal} onNavigate={onNavigate} />
              </React.Fragment>
            );
          case 'about':
            return (
              <AboutPreviewSection 
                key={section.id} 
                onNavigate={onNavigate} 
                onOpenQuoteModal={() => onOpenQuoteModal()} 
              />
            );
          case 'whyChoose':
            return <WhyChooseUsSection key={section.id} />;
          case 'allServicesFaq':
            return <AllServicesFaqSection key={section.id} onNavigate={onNavigate} />;
          case 'trust':
            return <TrustSection key={section.id} />;
          case 'beforeAfter':
            return <OurWorkVideosSection key={section.id} />;
          case 'pricing':
            return <PricingSection key={section.id} onOpenQuoteModal={onOpenQuoteModal} />;
          case 'calculator':
            return (
              <React.Fragment key={section.id}>
                <WaterWaveDivider variant="flowing" fillColor="#08172C" />
                <section id="quote" className="py-14 sm:py-20 bg-gradient-to-b from-[#08172C] via-[#0B203E] to-[#06152B] border-b border-cyan-900/35 relative overflow-hidden" aria-label="Smart Quote Wizard">
                  <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" aria-hidden="true" />
                  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <SmartQuoteWizard />
                  </div>
                </section>
              </React.Fragment>
            );
          case 'video':
            // If beforeAfter already placed the videos section, do not duplicate
            if (sortedSections.some(s => s.sectionKey === 'beforeAfter' && s.isEnabled)) {
              return null;
            }
            return <OurWorkVideosSection key={section.id} />;
          case 'reviews':
            return <ReviewsSection key={section.id} />;
          case 'areas':
            return <ServiceAreaSection key={section.id} />;
          case 'blog':
            return <BlogSection key={section.id} onNavigate={onNavigate} onOpenPostModal={onOpenBlogModal} />;
          case 'cta':
            return <FinalCtaSection key={section.id} onOpenQuoteModal={onOpenQuoteModal} />;
          case 'custom':
            return <CustomSectionRenderer key={section.id} section={section} onOpenQuoteModal={onOpenQuoteModal} />;
          default:
            return null;
        }
      })}
    </>
  );
};

export default HomepageDynamicRenderer;
