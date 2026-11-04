import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  Image, 
  Wrench, 
  Layers, 
  Settings, 
  Activity, 
  Film, 
  Sliders, 
  Compass, 
  BarChart3,
  Video,
  Paintbrush,
  Camera,
  HelpCircle,
  ShieldCheck,
  Server,
  Menu,
  X,
  ChevronDown,
  Star
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export type AdminTab = 
  | 'leads' 
  | 'reviews'
  | 'homepage-cms' 
  | 'services' 
  | 'services-faq'
  | 'booking-forms'
  | 'portfolio' 
  | 'videos' 
  | 'blog' 
  | 'website-images'
  | 'media' 
  | 'headernav' 
  | 'tracking' 
  | 'settings' 
  | 'admin-users'
  | 'audit'
  | 'free-usage';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  pendingLeadsCount?: number;
  pendingReviewsCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onTabChange,
  pendingLeadsCount = 0,
  pendingReviewsCount = 0
}) => {
  const { adminUser } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number; group?: string; highlight?: boolean }[] = [
    { id: 'leads', label: 'Leads & Quotes', icon: <Users className="w-4 h-4" />, badge: pendingLeadsCount, group: 'Operations' },
    { 
      id: 'reviews', 
      label: 'Customer Reviews (গ্রাহক রিভিউ)', 
      icon: <Star className="w-4 h-4 text-amber-400" />, 
      badge: pendingReviewsCount, 
      group: 'Operations',
      highlight: true 
    },
    { 
      id: 'homepage-cms', 
      label: 'Customize → Homepage (Hero Video)', 
      icon: <Video className="w-4 h-4 text-blue-400" />, 
      group: 'CMS & Customize',
      highlight: true 
    },
    { 
      id: 'website-images', 
      label: 'Website Images (ছবি পরিবর্তন)', 
      icon: <Camera className="w-4 h-4 text-cyan-400" />, 
      group: 'Assets',
      highlight: true 
    },
    { id: 'services', label: 'Services', icon: <Wrench className="w-4 h-4" />, group: 'Content' },
    { 
      id: 'services-faq', 
      label: 'FAQ (প্রশ্নোত্তর ব্যবস্থাপনা)', 
      icon: <HelpCircle className="w-4 h-4 text-cyan-400" />, 
      group: 'Content',
      highlight: true 
    },
    { 
      id: 'booking-forms', 
      label: 'Booking Forms (বুকিং ফরম বিল্ডার)', 
      icon: <FileText className="w-4 h-4 text-emerald-400" />, 
      group: 'Content',
      highlight: true 
    },
    { id: 'portfolio', label: 'Before/After Portfolio', icon: <Layers className="w-4 h-4" />, group: 'Content' },
    { id: 'videos', label: 'Our Work Videos', icon: <Film className="w-4 h-4" />, group: 'Content' },
    { id: 'blog', label: 'Articles & Blog', icon: <FileText className="w-4 h-4" />, group: 'Content' },
    { id: 'media', label: 'Media Library', icon: <Image className="w-4 h-4" />, group: 'Assets' },
    { id: 'headernav', label: 'Header & Navigation Management', icon: <Compass className="w-4 h-4" />, group: 'Site Setup' },
    { id: 'tracking', label: 'Tracking & Analytics', icon: <BarChart3 className="w-4 h-4" />, group: 'Site Setup' },
    { id: 'settings', label: 'Site Settings', icon: <Settings className="w-4 h-4" />, group: 'Site Setup' },
    { 
      id: 'admin-users', 
      label: 'Admin Roles & Access (RBAC)', 
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, 
      group: 'Security',
      highlight: true 
    },
    { id: 'audit', label: 'Audit Logs', icon: <Activity className="w-4 h-4" />, group: 'Security' },
    { 
      id: 'free-usage', 
      label: 'Free Tier Usage & Limits', 
      icon: <Server className="w-4 h-4 text-[#38BDF8]" />, 
      group: 'Site Setup',
      highlight: true 
    },
  ];

  const currentItem = navItems.find(i => i.id === currentTab) || navItems[0];

  const handleSelectTab = (tab: AdminTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Top Navigation Bar (< md) */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-3 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 truncate">
            <span className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg shrink-0">
              {currentItem.icon}
            </span>
            <div className="truncate">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Section</div>
              <div className="text-xs font-bold text-white truncate">{currentItem.label}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-h-[44px] min-w-[44px] px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle admin sections"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>{mobileMenuOpen ? 'Close' : 'Menu'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 max-h-[60vh] overflow-y-auto space-y-1">
            <div className="px-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Select Admin Section (16 Items)
            </div>
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : item.highlight
                      ? 'bg-blue-950/40 text-blue-300 hover:bg-blue-900/50 border border-blue-800/40'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-semibold ${
                      isActive ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Persistent Sidebar (>= md) */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex-col justify-between">
        <div className="p-3 sm:p-4 space-y-6">
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Navigation Menu
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : item.highlight
                        ? 'bg-blue-950/40 text-blue-300 hover:bg-blue-900/50 border border-blue-800/40'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                        isActive ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Help box */}
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
              <Paintbrush className="w-3.5 h-3.5 text-blue-400" />
              <span>Customize Hero Video</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Manage full-width desktop &amp; mobile background video, poster fallback, and dark navy overlay opacity under <strong>Customize → Homepage</strong>.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div>Sunviloz Clean Care v2.4</div>
          <div className="text-slate-400 mt-0.5">Admin &amp; Super Admin Portal</div>
        </div>
      </aside>
    </>
  );
};
