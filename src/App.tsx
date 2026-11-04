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
import { AmbientWaterBackground } from './components/AmbientWaterBackground';
import { initUtmTracking } from './utils/utmTracking';
import { initAnalytics, trackPageView } from './utils/tracking';

// Critical Homepage eagerly loaded for instant FCP / LCP
import { HomePage } from './pages/HomePage';

// Code-split secondary pages for fast initial bundle
const AboutPage = React.lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ServicesPage = React.lazy(() => import('./pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const WaterTankCleaningPage = React.lazy(() => import('./pages/WaterTankCleaningPage').then(m => ({ default: m.WaterTankCleaningPage })));
const PipelineCleaningPage = React.lazy(() => import('./pages/PipelineCleaningPage').then(m => ({ default: m.PipelineCleaningPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const ServiceAreaPage = React.lazy(() => import('./pages/ServiceAreaPage').then(m => ({ default: m.ServiceAreaPage })));
const LocationDetailPage = React.lazy(() => import('./pages/LocationDetailPage').then(m => ({ default: m.LocationDetailPage })));
const BlogPage = React.lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogPostDetailPage = React.lazy(() => import('./pages/BlogPostDetailPage').then(m => ({ default: m.BlogPostDetailPage })));
const PortfolioPage = React.lazy(() => import('./pages/PortfolioPage').then(m => ({ default: m.PortfolioPage })));
const TermsPage = React.lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const FaqPage = React.lazy(() => import('./pages/FaqPage').then(m => ({ default: m.FaqPage })));
const ServiceDetailPage = React.lazy(() => import('./pages/ServiceDetailPage').then(m => ({ default: m.ServiceDetailPage })));
const GetQuotePage = React.lazy(() => import('./pages/GetQuotePage').then(m => ({ default: m.GetQuotePage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Code-split Admin pages (Prevents downloading heavy admin tabs/tables on public site)
const AdminLoginPage = React.lazy(() => import('./pages/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));

// Code-split heavy modals
const QuoteModal = React.lazy(() => import('./components/QuoteModal').then(m => ({ default: m.QuoteModal })));
const BlogDetailModal = React.lazy(() => import('./components/BlogDetailModal').then(m => ({ default: m.BlogDetailModal })));

import { BlogPost } from './types/blog';

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3" role="status" aria-label="Loading page">
    <div className="w-9 h-9 rounded-full border-3 border-[#0D9488]/20 border-t-[#0D9488] animate-spin" />
    <span className="text-xs text-[#64748B] font-medium">লোড হচ্ছে...</span>
  </div>
);

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

  // Global route-change scroll reset & page view tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    trackPageView(currentPath);
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
      } else if (currentPath === '/services/overhead-water-tank-cleaning') {
        window.history.replaceState(null, '', '/services/overhead-tank-cleaning');
        setCurrentPath('/services/overhead-tank-cleaning');
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
      } else if (currentPath === '/pricing' || currentPath === '/pricing/') {
        window.history.replaceState(null, '', '/get-quote');
        setCurrentPath('/get-quote');
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
      return <GetQuotePage onNavigate={navigate} />;
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

    // Home Page
    if (currentPath === '/' || currentPath === '') {
      return (
        <HomePage
          onOpenQuoteModal={handleOpenQuoteModal}
          onOpenBlogModal={(post) => setSelectedBlogPost(post)}
          onNavigate={navigate}
        />
      );
    }

    // Explicit 404 Not Found Page for all invalid URLs
    return <NotFoundPage onNavigate={navigate} />;
  };

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[#F5FAFC] text-[#172B3A] flex flex-col font-sans selection:bg-[#0D9488] selection:text-white">
      {/* Global Ambient Water Atmosphere (Layered fixed behind content) */}
      <AmbientWaterBackground />

      {/* Top Header */}
      <Header
        onOpenQuoteModal={() => handleOpenQuoteModal()}
        onNavigate={navigate}
      />

      {/* Main Page Content */}
      <div className="relative z-10 flex-1">
        <React.Suspense fallback={<PageLoadingFallback />}>
          {renderPage()}
        </React.Suspense>
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
        <React.Suspense fallback={null}>
          <QuoteModal 
            serviceName={selectedServiceName}
            onClose={handleCloseQuoteModal} 
          />
        </React.Suspense>
      )}

      {/* Blog Post Detail Modal */}
      {selectedBlogPost && (
        <React.Suspense fallback={null}>
          <BlogDetailModal
            post={selectedBlogPost}
            onClose={() => setSelectedBlogPost(null)}
            onOpenQuoteModal={() => {
              setSelectedBlogPost(null);
              handleOpenQuoteModal();
            }}
          />
        </React.Suspense>
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
