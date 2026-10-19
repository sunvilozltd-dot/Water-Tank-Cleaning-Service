import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  Eye, 
  Check, 
  Layers, 
  Droplets, 
  Wrench, 
  ShieldCheck, 
  AlertTriangle,
  FolderOpen,
  Image as ImageIcon,
  ExternalLink,
  Info
} from 'lucide-react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { useHeaderNav } from '../../context/HeaderNavContext';
import { useServices, updateService } from '../../utils/servicesStore';
import { usePortfolioProjects, updateProject } from '../../utils/portfolioStore';
import { UniversalImageChangeModal } from '../UniversalImageChangeModal';
import { recordAuditLog } from '../../services/auditService';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { compressImageFile } from '../../utils/imageCompressor';

export interface ImageSlotItem {
  id: string;
  category: 'homepage' | 'beforeAfter' | 'services';
  title: string;
  titleBn: string;
  locationLabel: string;
  currentUrl: string;
  defaultUrl: string;
  aspectRatio: string;
  badge: string;
  targetType: 'siteConfig' | 'service' | 'project';
  targetKey: string;
  targetId?: string;
  subTarget?: 'before' | 'after';
}

export const WebsiteImagesTab: React.FC = () => {
  const { images, updateSiteImages, hero, updateHero } = useSiteConfig();
  const { services } = useServices();
  const { projects } = usePortfolioProjects();
  const { adminUser } = useAdminAuth();

  const { headerConfig, saveHeader } = useHeaderNav();
  const [activeCategory, setActiveCategory] = useState<'all' | 'homepage' | 'beforeAfter' | 'services'>('all');
  const [editingSlot, setEditingSlot] = useState<ImageSlotItem | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Logo upload state
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [isLogoUrlOpen, setIsLogoUrlOpen] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const activeLogo = headerConfig.logoUrl || images?.logo || '';

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSuccessToast('অনুগ্রহ করে একটি ছবি ফাইল আপলোড করুন (PNG, SVG, JPG, WebP)');
      setTimeout(() => setSuccessToast(null), 4000);
      return;
    }

    setUploadingLogo(true);
    try {
      const dataUrl = await compressImageFile(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.9
      });
      await saveHeader({ ...headerConfig, logoUrl: dataUrl, logoEnabled: true });
      updateSiteImages({ logo: dataUrl });
      recordAuditLog(
        adminUser?.email || 'admin@sunviloz.com',
        'Uploaded Brand Logo',
        'Branding',
        'header-logo',
        'Updated brand logo image'
      );
      setSuccessToast('ওয়েবসাইট ব্র্যান্ড লোগো সফলভাবে আপলোড ও আপডেট হয়েছে!');
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const url = event.target?.result as string;
        await saveHeader({ ...headerConfig, logoUrl: url, logoEnabled: true });
        updateSiteImages({ logo: url });
        setSuccessToast('ওয়েবসাইট ব্র্যান্ড লোগো সফলভাবে আপলোড ও আপডেট হয়েছে!');
        setTimeout(() => setSuccessToast(null), 4000);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingLogo(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    }
  };

  const handleApplyLogoUrl = async () => {
    if (!logoUrlInput.trim()) return;
    await saveHeader({ ...headerConfig, logoUrl: logoUrlInput.trim(), logoEnabled: true });
    updateSiteImages({ logo: logoUrlInput.trim() });
    setIsLogoUrlOpen(false);
    setLogoUrlInput('');
    setSuccessToast('ব্র্যান্ড লোগো URL সফলভাবে সেভ করা হয়েছে!');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleRemoveLogo = async () => {
    await saveHeader({ ...headerConfig, logoUrl: '', logoEnabled: true });
    updateSiteImages({ logo: '' });
    setSuccessToast('কাস্টম লোগো মুছে ফেলা হয়েছে (ডিফল্ট ওয়াটারড্রপ আইকন সক্রিয়)');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Tank and Pipeline Services
  const tankService = services.find(s => s.slug === 'water-tank-cleaning') || services[0];
  const pipelineService = services.find(s => s.slug === 'pipeline-cleaning') || services[1];

  // Primary image slots across the entire site
  const imageSlots: ImageSlotItem[] = [
    // 0. Website Brand Logo
    {
      id: 'slot-brand-logo',
      category: 'homepage',
      title: 'Website Brand Logo (হেডার লোগো)',
      titleBn: 'ওয়েবসাইটের মূল ব্র্যান্ড লোগো (Header Brand Logo)',
      locationLabel: 'Website Header > Brand Logo',
      currentUrl: activeLogo,
      defaultUrl: '',
      aspectRatio: 'aspect-square',
      badge: 'Brand Logo',
      targetType: 'siteConfig',
      targetKey: 'logo'
    },
    // 1. Homepage Hero Poster
    {
      id: 'slot-hero-poster',
      category: 'homepage',
      title: 'Homepage Hero Video Poster / Fallback Image',
      titleBn: 'হিরো সেকশনের মূল ব্যানার ও ভিডিও পোস্টার ছবি',
      locationLabel: 'Homepage > Hero Section Cover',
      currentUrl: hero.posterImageUrl || hero.bgImageUrl || images?.heroPoster || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
      defaultUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
      aspectRatio: 'aspect-video',
      badge: 'Hero Cover',
      targetType: 'siteConfig',
      targetKey: 'heroPoster'
    },
    // 2. Popular Service 1: Water Tank Cleaning
    {
      id: 'slot-popular-tank',
      category: 'homepage',
      title: 'Water Tank Cleaning Service Card Image',
      titleBn: 'ওয়াটার ট্যাংক ক্লিনিং সার্ভিসের মূল কার্ড ছবি',
      locationLabel: 'Homepage > Top Priority Services (পানির ট্যাংক পরিষ্কার)',
      currentUrl: images?.popularTankImage || tankService?.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
      defaultUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
      aspectRatio: 'aspect-video',
      badge: 'Popular Service 1',
      targetType: 'service',
      targetKey: 'popularTankImage',
      targetId: tankService?.id || 'water-tank-cleaning'
    },
    // 3. Popular Service 2: Pipeline Cleaning
    {
      id: 'slot-popular-pipeline',
      category: 'homepage',
      title: 'Pipeline Cleaning Service Card Image',
      titleBn: 'পাইপলাইন ক্লিনিং সার্ভিসের মূল কার্ড ছবি',
      locationLabel: 'Homepage > Top Priority Services (পাইপলাইন পরিষ্কার)',
      currentUrl: images?.popularPipelineImage || pipelineService?.image || 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=75',
      defaultUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=75',
      aspectRatio: 'aspect-video',
      badge: 'Popular Service 2',
      targetType: 'service',
      targetKey: 'popularPipelineImage',
      targetId: pipelineService?.id || 'pipeline-cleaning'
    },
    // 4. About SUNVILOZ Clean Care Story Image
    {
      id: 'slot-about-story',
      category: 'homepage',
      title: 'About SUNVILOZ Clean Care Story Image',
      titleBn: 'আমাদের সম্পর্কে সেকশনের টিম ও কাজের ছবি',
      locationLabel: 'Homepage > About SUNVILOZ Clean Care',
      currentUrl: images?.aboutStoryImage || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
      defaultUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
      aspectRatio: 'aspect-[4/3]',
      badge: 'About Us Section',
      targetType: 'siteConfig',
      targetKey: 'aboutStoryImage'
    },
    // 5. Before & After Project 1 (Rooftop Tank)
    {
      id: 'slot-proj-1-before',
      category: 'beforeAfter',
      title: 'Case 1: Rooftop PVC Tank - Before Cleaning Photo',
      titleBn: 'কেস ১: ছাদের পিভিসি ট্যাংক — পূর্বে (ক্লিনিংয়ের আগের শ্যাওলা)',
      locationLabel: 'Homepage & Portfolio > Before & After Comparison (Case 1)',
      currentUrl: projects[0]?.beforeImage || projects[0]?.beforeImg || 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=75',
      defaultUrl: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=75',
      aspectRatio: 'aspect-[4/3]',
      badge: 'Before Photo (Case 1)',
      targetType: 'project',
      targetKey: 'before',
      targetId: projects[0]?.id || 'proj-bashundhara-pvc',
      subTarget: 'before'
    },
    {
      id: 'slot-proj-1-after',
      category: 'beforeAfter',
      title: 'Case 1: Rooftop PVC Tank - After Cleaning Photo',
      titleBn: 'কেস ১: ছাদের পিভিসি ট্যাংক — পরে (ক্লিনিংয়ের পরের নিরাপদ পানি)',
      locationLabel: 'Homepage & Portfolio > Before & After Comparison (Case 1)',
      currentUrl: projects[0]?.afterImage || projects[0]?.afterImg || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=75',
      defaultUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=75',
      aspectRatio: 'aspect-[4/3]',
      badge: 'After Photo (Case 1)',
      targetType: 'project',
      targetKey: 'after',
      targetId: projects[0]?.id || 'proj-bashundhara-pvc',
      subTarget: 'after'
    },
    // 6. Before & After Project 2 (Underground Tank)
    {
      id: 'slot-proj-2-before',
      category: 'beforeAfter',
      title: 'Case 2: Underground RCC Reserve - Before Photo',
      titleBn: 'কেস ২: আন্ডারগ্রাউন্ড আরসিসি রিজার্ভার — পূর্বে (কাদা ও স্লাজ)',
      locationLabel: 'Homepage & Portfolio > Before & After Comparison (Case 2)',
      currentUrl: projects[1]?.beforeImage || projects[1]?.beforeImg || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=75',
      defaultUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=75',
      aspectRatio: 'aspect-[4/3]',
      badge: 'Before Photo (Case 2)',
      targetType: 'project',
      targetKey: 'before',
      targetId: projects[1]?.id || 'proj-gulshan-reserve',
      subTarget: 'before'
    },
    {
      id: 'slot-proj-2-after',
      category: 'beforeAfter',
      title: 'Case 2: Underground RCC Reserve - After Photo',
      titleBn: 'কেস ২: আন্ডারগ্রাউন্ড আরসিসি রিজার্ভার — পরে (সম্পূর্ণ জীবাণুমুক্ত)',
      locationLabel: 'Homepage & Portfolio > Before & After Comparison (Case 2)',
      currentUrl: projects[1]?.afterImage || projects[1]?.afterImg || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=75',
      defaultUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=75',
      aspectRatio: 'aspect-[4/3]',
      badge: 'After Photo (Case 2)',
      targetType: 'project',
      targetKey: 'after',
      targetId: projects[1]?.id || 'proj-gulshan-reserve',
      subTarget: 'after'
    },
    // 7. Before & After Project 3 (Apartment Battery)
    {
      id: 'slot-proj-3-before',
      category: 'beforeAfter',
      title: 'Case 3: Apartment Multi-Tanks - Before Photo',
      titleBn: 'কেস ৩: অ্যাপার্টমেন্ট ভবনের ট্যাংকসমূহ — পূর্বে (মরিচা ও শ্যাওলা)',
      locationLabel: 'Homepage & Portfolio > Before & After Comparison (Case 3)',
      currentUrl: projects[2]?.beforeImage || projects[2]?.beforeImg || 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=75',
      defaultUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=75',
      aspectRatio: 'aspect-[4/3]',
      badge: 'Before Photo (Case 3)',
      targetType: 'project',
      targetKey: 'before',
      targetId: projects[2]?.id || 'proj-uttara-apartment',
      subTarget: 'before'
    },
    {
      id: 'slot-proj-3-after',
      category: 'beforeAfter',
      title: 'Case 3: Apartment Multi-Tanks - After Photo',
      titleBn: 'কেস ৩: অ্যাপার্টমেন্ট ভবনের ট্যাংকসমূহ — পরে (জীবাণুমুক্ত স্বচ্ছ পানি)',
      locationLabel: 'Homepage & Portfolio > Before & After Comparison (Case 3)',
      currentUrl: projects[2]?.afterImage || projects[2]?.afterImg || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=75',
      defaultUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=75',
      aspectRatio: 'aspect-[4/3]',
      badge: 'After Photo (Case 3)',
      targetType: 'project',
      targetKey: 'after',
      targetId: projects[2]?.id || 'proj-uttara-apartment',
      subTarget: 'after'
    },
    // 8. Other Services Cards
    ...services
      .filter(s => s.slug !== 'water-tank-cleaning' && s.slug !== 'pipeline-cleaning')
      .map(service => ({
        id: `slot-service-${service.id}`,
        category: 'services' as const,
        title: `${service.title} Card Image`,
        titleBn: `${service.titleBn || service.title} সার্ভিসের ছবি`,
        locationLabel: `Services > ${service.title}`,
        currentUrl: service.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=75',
        defaultUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=75',
        aspectRatio: 'aspect-video',
        badge: 'Service Card',
        targetType: 'service' as const,
        targetKey: 'serviceCard',
        targetId: service.id
      }))
  ];

  const filteredSlots = imageSlots.filter(slot => {
    if (activeCategory === 'all') return true;
    return slot.category === activeCategory;
  });

  const handleApplyNewImage = (newUrl: string) => {
    if (!editingSlot) return;

    try {
      if (editingSlot.targetType === 'siteConfig') {
        if (editingSlot.targetKey === 'logo') {
          saveHeader({ ...headerConfig, logoUrl: newUrl, logoEnabled: true });
          updateSiteImages({ logo: newUrl });
        } else if (editingSlot.targetKey === 'heroPoster') {
          updateHero({ posterImageUrl: newUrl, bgImageUrl: newUrl });
          updateSiteImages({ heroPoster: newUrl, heroBg: newUrl });
        } else if (editingSlot.targetKey === 'aboutStoryImage') {
          updateSiteImages({ aboutStoryImage: newUrl });
        }
      } else if (editingSlot.targetType === 'service') {
        if (editingSlot.targetId) {
          updateService(editingSlot.targetId, { image: newUrl });
        }
        if (editingSlot.targetKey === 'popularTankImage') {
          updateSiteImages({ popularTankImage: newUrl });
        } else if (editingSlot.targetKey === 'popularPipelineImage') {
          updateSiteImages({ popularPipelineImage: newUrl });
        }
      } else if (editingSlot.targetType === 'project') {
        if (editingSlot.targetId) {
          if (editingSlot.subTarget === 'before') {
            updateProject(editingSlot.targetId, { beforeImg: newUrl, beforeImage: newUrl });
          } else {
            updateProject(editingSlot.targetId, { afterImg: newUrl, afterImage: newUrl });
          }
        }
      }

      recordAuditLog(
        adminUser?.email || 'admin@sunviloz.com',
        'Changed Website Image',
        'MediaManager',
        editingSlot.id,
        `Updated image for ${editingSlot.title}`
      );

      setSuccessToast(`"${editingSlot.titleBn}" এর ছবি সফলভাবে পরিবর্তন ও প্রকাশ করা হয়েছে!`);
      setTimeout(() => setSuccessToast(null), 4000);
      setEditingSlot(null);
    } catch (err) {
      console.error('Failed to apply new image:', err);
      setSuccessToast('ছবি প্রয়োগ করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-[11px] font-bold mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>IMAGE &amp; MEDIA MANAGEMENT CENTER</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            ওয়েবসাইটের সকল ছবি পরিবর্তন ও ব্যবস্থাপনা
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            হিরো ব্যানার, পপুলার সার্ভিস কার্ড, বিফোর/আফটার ফলাফল এবং প্রতিটি ক্লিনিং সেবার ছবি এখান থেকেই ১-ক্লিকে আপলোড বা পরিবর্তন করতে পারেন। কোনো সোর্স কোড এডিট করার প্রয়োজন নেই।
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-3 rounded-xl shrink-0">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 flex items-center justify-center font-bold text-lg">
            {imageSlots.length}
          </div>
          <div>
            <span className="text-xs font-bold text-white block">ম্যানেজড ইমেজ স্লট</span>
            <span className="text-[11px] text-emerald-400 font-medium">লাইভ ওয়েবসাইটে যুক্ত</span>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-200 text-xs sm:text-sm flex items-center gap-2.5 shadow-lg animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-400 shrink-0 stroke-[3]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Dedicated Brand Logo Management Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-800 text-blue-400 text-[10px] font-extrabold uppercase tracking-wider mb-1">
              <Droplets className="w-3 h-3 text-blue-400" />
              <span>BRAND IDENTITY</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>ওয়েবসাইট ব্র্যান্ড লোগো (Website Brand Logo)</span>
            </h3>
            <p className="text-xs text-slate-400">
              হেডার ও নেভিগেশন বারে প্রদর্শিত মূল লোগো আপলোড বা পরিবর্তন করুন। স্বচ্ছ ব্যাকগ্রাউন্ডযুক্ত PNG বা SVG লোগো সবচেয়ে ভালো দেখায়।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">লোগো প্রদর্শন:</span>
            <button
              type="button"
              onClick={() => {
                const nextState = !headerConfig.logoEnabled;
                saveHeader({ ...headerConfig, logoEnabled: nextState });
                setSuccessToast(nextState ? 'লোগো প্রদর্শন সক্রিয় করা হয়েছে' : 'লোগো প্রদর্শন নিষ্ক্রিয় করা হয়েছে');
                setTimeout(() => setSuccessToast(null), 3000);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                headerConfig.logoEnabled 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {headerConfig.logoEnabled ? '● সক্রিয় (Enabled)' : '○ নিষ্ক্রিয় (Hidden)'}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Logo Visual Preview Box */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-950 border-2 border-slate-700/80 p-3 flex items-center justify-center relative shadow-inner overflow-hidden">
              {activeLogo ? (
                <img
                  src={activeLogo}
                  alt="Brand Logo Preview"
                  className="max-w-full max-h-full object-contain"
                  style={{ width: `${headerConfig.logoWidth || 48}px` }}
                />
              ) : (
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
                    <Droplets className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] text-slate-500 block font-medium">ডিফল্ট আইকন</span>
                </div>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              প্রদর্শন সাইজ: {headerConfig.logoWidth || 40}px
            </span>
          </div>

          {/* Action Buttons & File Uploader */}
          <div className="flex-1 space-y-3 w-full">
            <div className="flex flex-wrap gap-2.5">
              <input
                ref={logoFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleLogoFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoFileInputRef.current?.click()}
                disabled={uploadingLogo}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>{uploadingLogo ? 'আপলোড হচ্ছে...' : 'লোগো ফাইল আপলোড করুন (Upload File)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLogoUrlOpen(!isLogoUrlOpen)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                <span>ইমেজ URL থেকে দিন (Image URL)</span>
              </button>

              {activeLogo && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="px-3.5 py-2.5 bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-rose-900/40 transition-all cursor-pointer"
                  title="Remove custom logo and restore default icon"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>ডিফল্ট আইকনে ফিরুন</span>
                </button>
              )}
            </div>

            {/* Direct URL input accordion */}
            {isLogoUrlOpen && (
              <div className="flex gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl animate-fadeIn">
                <input
                  type="text"
                  value={logoUrlInput}
                  onChange={(e) => setLogoUrlInput(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleApplyLogoUrl}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow cursor-pointer shrink-0"
                >
                  প্রয়োগ করুন
                </button>
              </div>
            )}

            {/* Logo Dimensions Adjuster */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
              <span className="font-semibold text-slate-400">লোগোর প্রস্থ (Width):</span>
              <div className="flex items-center gap-1.5">
                {[36, 40, 48, 56, 64].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      saveHeader({ ...headerConfig, logoWidth: size, logoHeight: size });
                      setSuccessToast(`লোগো সাইজ ${size}px নির্ধারণ করা হয়েছে`);
                      setTimeout(() => setSuccessToast(null), 3000);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-colors cursor-pointer ${
                      (headerConfig.logoWidth || 40) === size
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          সব ছবি ({imageSlots.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('homepage')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeCategory === 'homepage'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          হোমপেজ প্রধান ছবি ({imageSlots.filter(s => s.category === 'homepage').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('beforeAfter')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeCategory === 'beforeAfter'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          বিফোর / আফটার প্রজেক্ট ছবি ({imageSlots.filter(s => s.category === 'beforeAfter').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('services')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeCategory === 'services'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          অন্যান্য সেবার ছবি ({imageSlots.filter(s => s.category === 'services').length})
        </button>
      </div>

      {/* Image Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSlots.map((slot) => {
          return (
            <div 
              key={slot.id} 
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg transition-all duration-200 group"
            >
              <div>
                {/* Image Preview with Badge */}
                <div className={`relative ${slot.aspectRatio} bg-slate-950 overflow-hidden border-b border-slate-800`}>
                  <img
                    src={slot.currentUrl}
                    alt={slot.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 rounded-md bg-slate-950/90 backdrop-blur-md text-cyan-300 text-[10px] font-bold border border-cyan-800/40 shadow">
                      {slot.badge}
                    </span>
                  </div>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <button
                      type="button"
                      onClick={() => setEditingSlot(slot)}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-xl flex items-center gap-2 transform translate-y-1 group-hover:translate-y-0 transition-transform cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>এই ছবিটি পরিবর্তন করুন</span>
                    </button>
                  </div>
                </div>

                {/* Content Info */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-cyan-400 truncate max-w-[220px]" title={slot.locationLabel}>
                      {slot.locationLabel}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-white text-sm line-clamp-1" title={slot.titleBn || slot.title}>
                    {slot.titleBn || slot.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1" title={slot.title}>
                    {slot.title}
                  </p>

                  <div className="pt-2 text-[11px] text-slate-500 font-mono truncate">
                    <span className="text-slate-400">উৎস: </span>
                    {slot.currentUrl.startsWith('data:') ? 'আপলোডকৃত ফাইল (Custom Upload)' : slot.currentUrl}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSlot(slot)}
                  className="flex-1 min-h-[38px] px-3 py-2 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>ছবি পরিবর্তন (Change)</span>
                </button>

                {slot.currentUrl !== slot.defaultUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSlot(slot);
                      handleApplyNewImage(slot.defaultUrl);
                    }}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                    title="ডিফল্ট ছবি ফিরিয়ে আনুন"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Universal Image Change Modal */}
      {editingSlot && (
        <UniversalImageChangeModal
          isOpen={!!editingSlot}
          onClose={() => setEditingSlot(null)}
          title={editingSlot.title}
          titleBn={editingSlot.titleBn}
          subtitle={`অবস্থান: ${editingSlot.locationLabel}`}
          currentImageUrl={editingSlot.currentUrl}
          defaultImageUrl={editingSlot.defaultUrl}
          onSave={handleApplyNewImage}
        />
      )}
    </div>
  );
};
