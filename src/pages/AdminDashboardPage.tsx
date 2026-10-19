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
import { VideosTab } from '../components/AdminPanel/VideosTab';
import { BlogTab } from '../components/AdminPanel/BlogTab';
import { MediaLibraryTab } from '../components/AdminPanel/MediaLibraryTab';
import { WebsiteImagesTab } from '../components/AdminPanel/WebsiteImagesTab';
import { HeaderNavTab } from '../components/AdminPanel/HeaderNavTab';
import { TrackingTab } from '../components/AdminPanel/TrackingTab';
import { SettingsTab } from '../components/AdminPanel/SettingsTab';
import { AuditLogsTab } from '../components/AdminPanel/AuditLogsTab';

import { QuoteLead, LeadStatus, ServiceItem, ProjectItem, VideoItem } from '../types';
import { BlogPost } from '../types/blog';
import { getLeads, updateLeadStatus, updateLeadDetails, deleteLead } from '../services/leadService';
import { getServices, saveService, deleteService } from '../utils/servicesStore';
import { getProjects, saveProject, deleteProject } from '../utils/portfolioStore';
import { getVideos, saveVideo, deleteVideo } from '../utils/videosStore';
import { getBlogPosts, saveBlogPost, deleteBlogPost } from '../utils/blogStore';
import { SeoHead } from '../components/SeoHead';

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
  const [loading, setLoading] = useState(false);

  // Modals
  const [selectedLead, setSelectedLead] = useState<QuoteLead | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsData, srvData, projData, vidData, postData] = await Promise.all([
        getLeads(),
        getServices(),
        getProjects(),
        getVideos(),
        getBlogPosts()
      ]);
      setLeads(leadsData);
      setServices(srvData);
      setProjects(projData);
      setVideos(vidData);
      setPosts(postData);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleServicesChanged = () => {
      loadData();
    };
    window.addEventListener('sunviloz_services_changed', handleServicesChanged);
    return () => window.removeEventListener('sunviloz_services_changed', handleServicesChanged);
  }, []);

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

  const pendingLeadsCount = leads.filter(l => l.status === 'New' || (l.status as string) === 'new').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <SeoHead
        title="Admin Dashboard - Sunviloz Clean Care"
        description="Admin dashboard to manage Customize Homepage Hero Video, quote leads, and services."
      />

      <AdminHeader 
        onNavigateHome={onNavigateHome} 
        onRefresh={loadData}
        isRefreshing={loading}
      />

      <div className="flex-1 flex flex-col md:flex-row">
        <AdminSidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          pendingLeadsCount={pendingLeadsCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl overflow-y-auto">
          {currentTab === 'homepage-cms' && <HomepageCmsTab />}

          {currentTab === 'leads' && (
            <LeadsTab
              leads={leads}
              onSelectLead={setSelectedLead}
              onUpdateStatus={handleUpdateLeadStatus}
              onOpenExportModal={() => setIsExportModalOpen(true)}
              onDeleteLead={handleDeleteLead}
            />
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
            <VideosTab
              videos={videos}
              onSaveVideo={handleSaveVideo}
              onDeleteVideo={handleDeleteVideo}
            />
          )}

          {currentTab === 'blog' && (
            <BlogTab
              posts={posts}
              onSavePost={handleSavePost}
              onDeletePost={handleDeletePost}
            />
          )}

          {currentTab === 'website-images' && <WebsiteImagesTab />}

          {currentTab === 'media' && <MediaLibraryTab />}

          {currentTab === 'headernav' && <HeaderNavTab />}

          {currentTab === 'tracking' && <TrackingTab />}

          {currentTab === 'settings' && (
            <SettingsTab onGoToHeroVideo={() => setCurrentTab('homepage-cms')} />
          )}

          {currentTab === 'audit' && <AuditLogsTab />}
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
