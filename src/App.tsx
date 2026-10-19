import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { SiteConfigProvider } from './context/SiteConfigContext';
import { HeaderNavProvider } from './context/HeaderNavContext';
import { HomepageCmsProvider } from './context/HomepageCmsContext';
import { TrackingProvider } from './context/TrackingContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileStickyBar } from './components/MobileStickyBar';
import { FloatingContactButtons } from './components/FloatingContactButtons';
import { PrivacyConsentBanner } from './components/PrivacyConsentBanner';
import { QuoteModal } from './components/QuoteModal';
import { BlogDetailModal } from './components/BlogDetailModal';
import { AmbientWaterBackground } from './components/AmbientWaterBackground';
import { initUtmTracking } from './utils/utmTracking';
import { initAnalytics } from './utils/tracking';

// Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { WaterTankCleaningPage } from './pages/WaterTankCleaningPage';
import { PipelineCleaningPage } from './pages/PipelineCleaningPage';
import { PricingPage } from './pages/PricingPage';
import { ContactPage } from './pages/ContactPage';
import { ServiceAreaPage } from './pages/ServiceAreaPage';
import { LocationDetailPage } from './pages/LocationDetailPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostDetailPage } from './pages/BlogPostDetailPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { FaqPage } from './pages/FaqPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { GetQuotePage } from './pages/GetQuotePage';

import { BlogPost } from './types/blog';

function AppContent() {
  const { isAuthenticated } = useAdminAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  // Modal states
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedServiceName, setSelectedServiceName] = useState<string | undefined>(undefined);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);

  const handleOpenQuoteModal = (serviceName?: string) => {
    setSelectedServiceName(serviceName);
    setIsQuoteModalOpen(true);
  };

  const handleCloseQuoteModal = () => {
    setIsQuoteModalOpen(false);
    setSelectedServiceName(undefined);
  };

  // Sync with browser history and hash/pathname changes
  useEffect(() => {
    initUtmTracking();
    initAnalytics();
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global route-change scroll reset - ALWAYS start every page from the very top!
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [currentPath]);

  // Canonical redirection for service landing pages, legacy areas, and legal routes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentPath === '/water-tank-cleaning-service') {
        window.history.replaceState(null, '', '/services/water-tank-cleaning');
        setCurrentPath('/services/water-tank-cleaning');
      } else if (currentPath === '/pipeline-cleaning-service') {
        window.history.replaceState(null, '', '/services/pipeline-cleaning');
        setCurrentPath('/services/pipeline-cleaning');
      } else if (currentPath === '/services/pipe-line-cleaning') {
        window.history.replaceState(null, '', '/services/pipeline-cleaning');
        setCurrentPath('/services/pipeline-cleaning');
      } else if (currentPath === '/services/underground-tank-cleaning') {
        window.history.replaceState(null, '', '/services/underground-water-tank-cleaning');
        setCurrentPath('/services/underground-water-tank-cleaning');
      } else if (currentPath === '/areas' || currentPath === '/areas/') {
        window.history.replaceState(null, '', '/service-areas');
        setCurrentPath('/service-areas');
      } else if (currentPath.startsWith('/areas/')) {
        const areaSlug = currentPath.replace('/areas/', '').replace(/^water-tank-cleaning-/, '');
        window.history.replaceState(null, '', `/service-areas/${areaSlug}`);
        setCurrentPath(`/service-areas/${areaSlug}`);
      } else if (currentPath === '/projects' || currentPath === '/projects/') {
        window.history.replaceState(null, '', '/portfolio');
        setCurrentPath('/portfolio');
      } else if (currentPath === '/terms-and-conditions') {
        window.history.replaceState(null, '', '/terms');
        setCurrentPath('/terms');
      } else if (currentPath.startsWith('/tips/')) {
        const tipSlug = currentPath.replace('/tips/', '');
        window.history.replaceState(null, '', `/blog#${tipSlug}`);
        setCurrentPath('/blog');
      } else if (currentPath === '/services-faq' || currentPath === '/services-faq/') {
        window.history.replaceState(null, '', '/#homepage-all-faq');
        setCurrentPath('/');
      }
    }
  }, [currentPath]);

  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    setCurrentPath(path);
  };

  // Intercept normal anchor clicks that point to internal paths
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith('//') && !target.hasAttribute('download')) {
        // If it's a hash anchor like /#quote or /#services while on home
        if (href.startsWith('/#')) {
          if (currentPath === '/') {
            e.preventDefault();
            const id = href.replace('/#', '');
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            return;
          }
        }

        e.preventDefault();
        navigate(href);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [currentPath]);

  // Handle Admin Routes
  if (currentPath.startsWith('/admin')) {
    if (currentPath === '/admin/login' || !isAuthenticated) {
      return (
        <AdminLoginPage
          onLoginSuccess={() => navigate('/admin/dashboard')}
          onNavigateHome={() => navigate('/')}
        />
      );
    }
    return <AdminDashboardPage onNavigateHome={() => navigate('/')} />;
  }

  // Render Public Website Page
  const renderPage = () => {
    if (currentPath === '/about') {
      return <AboutPage onOpenQuoteModal={() => handleOpenQuoteModal()} />;
    }
    if (currentPath === '/services') {
      return <ServicesPage onOpenQuoteModal={() => handleOpenQuoteModal()} onNavigate={navigate} />;
    }
    if (currentPath === '/get-quote' || currentPath === '/quote') {
      return <GetQuotePage onNavigate={navigate} />;
    }
    if (currentPath === '/water-tank-cleaning-service' || currentPath === '/services/water-tank-cleaning') {
      return (
        <WaterTankCleaningPage 
          onOpenQuoteModal={() => handleOpenQuoteModal('Water Tank Cleaning Service')} 
          onNavigate={navigate}
        />
      );
    }
    if (currentPath === '/pipeline-cleaning-service' || currentPath === '/services/pipeline-cleaning') {
      return (
        <PipelineCleaningPage 
          onOpenQuoteModal={() => handleOpenQuoteModal('Pipeline Cleaning Service')} 
          onNavigate={navigate}
        />
      );
    }
    if (currentPath.endsWith('-service') && !currentPath.startsWith('/services/')) {
      const slug = currentPath.replace('/', '');
      return (
        <ServiceDetailPage
          slug={slug}
          onOpenQuoteModal={handleOpenQuoteModal}
          onNavigate={navigate}
        />
      );
    }
    if (currentPath.startsWith('/services/')) {
      const slug = currentPath.replace('/services/', '');
      return (
        <ServiceDetailPage
          slug={slug}
          onOpenQuoteModal={handleOpenQuoteModal}
          onNavigate={navigate}
        />
      );
    }
    if (currentPath === '/pricing') {
      return <PricingPage onOpenQuoteModal={() => handleOpenQuoteModal()} />;
    }
    if (currentPath === '/contact') {
      return <ContactPage />;
    }
    if (currentPath === '/service-areas') {
      return <ServiceAreaPage onNavigate={navigate} onOpenQuoteModal={handleOpenQuoteModal} />;
    }
    if (currentPath.startsWith('/service-areas/')) {
      const slug = currentPath.replace('/service-areas/', '');
      return <LocationDetailPage slug={slug} onOpenQuoteModal={() => handleOpenQuoteModal()} onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/blog/') || currentPath.startsWith('/tips/')) {
      const slug = currentPath.replace(/^\/(blog|tips)\//, '').split('?')[0].split('#')[0];
      if (slug) {
        return (
          <BlogPostDetailPage
            slug={slug}
            onNavigate={navigate}
            onOpenQuoteModal={handleOpenQuoteModal}
          />
        );
      }
    }
    if (currentPath === '/blog' || currentPath === '/tips') {
      return (
        <BlogPage
          onNavigate={navigate}
          onOpenPostModal={(post) => setSelectedBlogPost(post)}
        />
      );
    }
    if (currentPath === '/portfolio') {
      return <PortfolioPage onNavigate={navigate} />;
    }
    if (currentPath === '/terms') {
      return <TermsPage onNavigate={navigate} />;
    }
    if (currentPath === '/privacy-policy') {
      return <PrivacyPolicyPage onNavigate={navigate} />;
    }
    if (currentPath === '/faq') {
      return <FaqPage />;
    }

    // Default: Home Page
    return (
      <HomePage
        onOpenQuoteModal={handleOpenQuoteModal}
        onOpenBlogModal={(post) => setSelectedBlogPost(post)}
        onNavigate={navigate}
      />
    );
  };

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[#040D1A] text-white flex flex-col font-sans selection:bg-[#0284C7] selection:text-white">
      {/* Global Ambient Water Atmosphere (Layered fixed behind content) */}
      <AmbientWaterBackground />

      {/* Top Header */}
      <Header
        onOpenQuoteModal={() => handleOpenQuoteModal()}
        onNavigate={navigate}
      />

      {/* Main Page Content */}
      <div className="relative z-10 flex-1">
        {renderPage()}
      </div>

      {/* Footer */}
      <Footer onNavigate={navigate} />

      {/* Mobile Sticky Bar & Floating Action Buttons */}
      <MobileStickyBar onOpenQuoteModal={() => handleOpenQuoteModal()} />
      <FloatingContactButtons onOpenQuoteModal={() => handleOpenQuoteModal()} />

      {/* GDPR / Privacy Consent Banner */}
      <PrivacyConsentBanner />

      {/* Instant Quote Request Modal */}
      {isQuoteModalOpen && (
        <QuoteModal 
          serviceName={selectedServiceName}
          onClose={handleCloseQuoteModal} 
        />
      )}

      {/* Blog Post Detail Modal */}
      {selectedBlogPost && (
        <BlogDetailModal
          post={selectedBlogPost}
          onClose={() => setSelectedBlogPost(null)}
          onOpenQuoteModal={() => {
            setSelectedBlogPost(null);
            handleOpenQuoteModal();
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <SiteConfigProvider>
        <HeaderNavProvider>
          <HomepageCmsProvider>
            <TrackingProvider>
              <AdminAuthProvider>
                <AppContent />
              </AdminAuthProvider>
            </TrackingProvider>
          </HomepageCmsProvider>
        </HeaderNavProvider>
      </SiteConfigProvider>
    </LanguageProvider>
  );
}
