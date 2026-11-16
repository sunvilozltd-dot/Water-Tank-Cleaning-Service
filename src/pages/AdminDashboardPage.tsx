import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../components/AdminPanel/AdminHeader';
import { AdminSidebar, AdminTab } from '../components/AdminPanel/AdminSidebar';
import { LeadsTab } from '../components/AdminPanel/LeadsTab';
import { LeadDetailModal } from '../components/AdminPanel/LeadDetailModal';
import { ExportCsvModal } from '../components/AdminPanel/ExportCsvModal';
import { HomepageCmsTab } from '../components/AdminPanel/HomepageCmsTab';
import { ServicesTab } from '../components/AdminPanel/ServicesTab';
import { ServicesFaqTab } from '../components/AdminPanel/ServicesFaqTab';
import { ServiceFormBuilderTab } from '../components/AdminPanel/ServiceFormBuilderTab';
import { PortfolioTab } from '../components/AdminPanel/PortfolioTab';
import { ProjectVideosTab } from '../components/AdminPanel/ProjectVideosTab';
import { VideosTab } from '../components/AdminPanel/VideosTab';
import { BlogTab } from '../components/AdminPanel/BlogTab';
import { MediaLibraryTab } from '../components/AdminPanel/MediaLibraryTab';
import { WebsiteImagesTab } from '../components/AdminPanel/WebsiteImagesTab';
import { HeaderNavTab } from '../components/AdminPanel/HeaderNavTab';
import { TrackingTab } from '../components/AdminPanel/TrackingTab';
import { SettingsTab } from '../components/AdminPanel/SettingsTab';
import { AuditLogsTab } from '../components/AdminPanel/AuditLogsTab';
import { AdminUsersTab } from '../components/AdminPanel/AdminUsersTab';
import { ReviewsTab } from '../components/AdminPanel/ReviewsTab';
import { FreeUsageMonitoringTab } from '../components/AdminPanel/FreeUsageMonitoringTab';
import { ServiceZoneManagerTab } from '../components/AdminPanel/ServiceZoneManagerTab';

import { QuoteLead, LeadStatus, ServiceItem, ProjectItem, VideoItem } from '../types';
import { BlogPost } from '../types/blog';
import { getAllReviewsForAdmin, REVIEWS_CHANGED_EVENT } from '../services/reviewService';
import { getLeads, updateLeadStatus, updateLeadDetails, deleteLead } from '../services/leadService';
import { getServices, saveService, deleteService, fetchServicesFromSupabase } from '../utils/servicesStore';
import { fetchProjectsFromSupabase, saveProject, deleteProject } from '../utils/portfolioStore';
import { getVideos, saveVideo, deleteVideo, fetchVideosFromSupabase } from '../utils/videosStore';
import { getBlogPosts, saveBlogPost, deleteBlogPost, fetchBlogPostsFromSupabase, seedDefaultBlogPosts } from '../utils/blogStore';
import { SeoHead } from '../components/SeoHead';
import {
  CACHE_INVALIDATION_EVENT,
  CacheInvalidationResult,
  invalidateServerSeoCache
} from '../services/indexnowService';

interface AdminDashboardPageProps {
  onNavigateHome: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateHome }) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('homepage-cms'); // Default to Customize Homepage Hero Video so user sees it right away!
  const [leads, setLeads] = useState<QuoteLead[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cacheAlert, setCacheAlert] = useState<CacheInvalidationResult | null>(null);
  const [retryingCache, setRetryingCache] = useState(false);

  // Modals
  const [selectedLead, setSelectedLead] = useState<QuoteLead | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsData, srvData, projData, vidData, postData, revData] = await Promise.all([
        getLeads(),
        fetchServicesFromSupabase(),
        fetchProjectsFromSupabase({ includeDrafts: true }),
        fetchVideosFromSupabase(),
        fetchBlogPostsFromSupabase({ includeUnpublished: true }),
        getAllReviewsForAdmin()
      ]);
      setLeads(leadsData);
      setServices(srvData);
      setProjects(projData);
      setVideos(vidData);
      setPosts(postData);
      setPendingReviewsCount(revData.filter(r => r.status === 'pending' && !r.isSpam).length);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleDataChanged = () => {
      loadData();
    };
    const handleCacheInvalidationStatus = (evt: Event) => {
      const detail = (evt as CustomEvent<CacheInvalidationResult>).detail;
      if (!detail) return;
      if (detail.success) {
        setCacheAlert(null);
      } else {
        setCacheAlert(detail);
      }
    };
    window.addEventListener('sunviloz_services_changed', handleDataChanged);
    window.addEventListener(REVIEWS_CHANGED_EVENT, handleDataChanged);
    window.addEventListener(CACHE_INVALIDATION_EVENT, handleCacheInvalidationStatus);
    return () => {
      window.removeEventListener('sunviloz_services_changed', handleDataChanged);
      window.removeEventListener(REVIEWS_CHANGED_EVENT, handleDataChanged);
      window.removeEventListener(CACHE_INVALIDATION_EVENT, handleCacheInvalidationStatus);
    };
  }, []);

  const handleRetryCacheInvalidation = async () => {
    setRetryingCache(true);
    try {
      const res = await invalidateServerSeoCache();
      if (res.success) {
        setCacheAlert(null);
      } else {
        setCacheAlert(res);
      }
    } finally {
      setRetryingCache(false);
    }
  };

  const handleUpdateLeadStatus = async (id: string, status: LeadStatus) => {
    await updateLeadStatus(id, status);
    loadData();
  };

  const handleSaveLead = async (lead: QuoteLead) => {
    await updateLeadDetails(lead);
    loadData();
  };

  const handleDeleteLead = async (id: string) => {
    await deleteLead(id);
    loadData();
  };

  const handleSaveService = async (service: ServiceItem) => {
    await saveService(service);
    loadData();
  };

  const handleDeleteService = async (id: string) => {
    await deleteService(id);
    loadData();
  };

  const handleSaveProject = async (project: ProjectItem) => {
    await saveProject(project);
    loadData();
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    loadData();
  };

  const handleSaveVideo = async (video: VideoItem) => {
    await saveVideo(video);
    loadData();
  };

  const handleDeleteVideo = async (id: string) => {
    await deleteVideo(id);
    loadData();
  };

  const handleSavePost = async (post: BlogPost) => {
    await saveBlogPost(post);
    loadData();
  };

  const handleDeletePost = async (id: string) => {
    await deleteBlogPost(id);
    loadData();
  };

  const handleSeedDefaultPosts = async () => {
    await seedDefaultBlogPosts();
    loadData();
  };

  const pendingLeadsCount = leads.filter(l => l.status === 'New' || (l.status as string) === 'new').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <SeoHead
        title="Admin Dashboard - Sunviloz Clean Care"
        description="Admin dashboard to manage Customize Homepage Hero Video, quote leads, and services."
        noIndex={true}
      />

      <AdminHeader 
        onNavigateHome={onNavigateHome} 
        onRefresh={loadData}
        isRefreshing={loading}
      />

      {cacheAlert && !cacheAlert.success && (
        <div
          role="alert"
          className="bg-amber-950/90 border-b border-amber-700/60 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-100"
        >
          <div>
            <strong className="font-bold text-amber-300">সতর্কতা: সার্ভার SEO ক্যাশ রিফ্রেশ সম্পূর্ণ হয়নি</strong>{' '}
            <span>— {cacheAlert.message} ({cacheAlert.attempts} বার চেষ্টা করা হয়েছে)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={retryingCache}
              onClick={handleRetryCacheInvalidation}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors disabled:opacity-60 cursor-pointer"
            >
              {retryingCache ? 'চেষ্টা চলছে...' : 'পুনরায় ক্যাশ রিফ্রেশ করুন'}
            </button>
            <button
              type="button"
              onClick={() => setCacheAlert(null)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row">
        <AdminSidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          pendingLeadsCount={pendingLeadsCount}
          pendingReviewsCount={pendingReviewsCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl overflow-y-auto">
          {currentTab === 'homepage-cms' && <HomepageCmsTab />}

          {currentTab === 'service-zones' && <ServiceZoneManagerTab />}

          {currentTab === 'leads' && (
            <LeadsTab
              leads={leads}
              onSelectLead={setSelectedLead}
              onUpdateStatus={handleUpdateLeadStatus}
              onOpenExportModal={() => setIsExportModalOpen(true)}
              onDeleteLead={handleDeleteLead}
            />
          )}

          {currentTab === 'reviews' && (
            <ReviewsTab />
          )}

          {currentTab === 'services' && (
            <ServicesTab
              services={services}
              onSaveService={handleSaveService}
              onDeleteService={handleDeleteService}
            />
          )}

          {currentTab === 'services-faq' && (
            <ServicesFaqTab />
          )}

          {currentTab === 'booking-forms' && (
            <ServiceFormBuilderTab />
          )}

          {currentTab === 'portfolio' && (
            <PortfolioTab
              projects={projects}
              onSaveProject={handleSaveProject}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {currentTab === 'videos' && (
            <ProjectVideosTab />
          )}

          {currentTab === 'blog' && (
            <BlogTab
              posts={posts}
              onSavePost={handleSavePost}
              onDeletePost={handleDeletePost}
              onSeedDefaults={handleSeedDefaultPosts}
            />
          )}

          {currentTab === 'website-images' && <WebsiteImagesTab />}

          {currentTab === 'media' && <MediaLibraryTab />}

          {currentTab === 'headernav' && <HeaderNavTab />}

          {currentTab === 'tracking' && <TrackingTab />}

          {currentTab === 'settings' && (
            <SettingsTab onGoToHeroVideo={() => setCurrentTab('homepage-cms')} />
          )}

          {currentTab === 'admin-users' && <AdminUsersTab />}

          {currentTab === 'audit' && <AuditLogsTab />}

          {currentTab === 'free-usage' && <FreeUsageMonitoringTab />}
        </main>
      </div>

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onSave={handleSaveLead}
          onDelete={handleDeleteLead}
        />
      )}

      {isExportModalOpen && (
        <ExportCsvModal
          leads={leads}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
};
