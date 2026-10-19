import React, { useState, useEffect, useRef } from 'react';
import { useHeaderNav } from '../../context/HeaderNavContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { compressImageFile } from '../../utils/imageCompressor';
import { NavItem, HeaderConfig } from '../../types/header';
import { 
  Compass, 
  Save, 
  MoveUp, 
  MoveDown, 
  Check, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  ExternalLink, 
  CornerDownRight, 
  Layers, 
  Phone, 
  MessageCircle, 
  Globe, 
  Hash, 
  Link2, 
  AlertTriangle, 
  Sparkles,
  Smartphone,
  Monitor,
  X,
  ChevronDown,
  Info,
  Droplets,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

type DestinationType = 'internal' | 'section' | 'external';

export const HeaderNavTab: React.FC = () => {
  const { headerConfig, navItems, navTree, saveHeader, saveNav, deleteNav, reorderNav, refresh } = useHeaderNav();
  const { updateSiteImages } = useSiteConfig();
  
  const [items, setItems] = useState<NavItem[]>(navItems);
  const [activeTab, setActiveTab] = useState<'links' | 'settings' | 'preview'>('links');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewLang, setPreviewLang] = useState<'bn' | 'en'>('bn');
  
  // Header Settings Form State
  const [configState, setConfigState] = useState<HeaderConfig>(headerConfig);
  
  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [labelEn, setLabelEn] = useState('');
  const [labelBn, setLabelBn] = useState('');
  const [destType, setDestType] = useState<DestinationType>('internal');
  const [destUrl, setDestUrl] = useState('/');
  const [parentId, setParentId] = useState<string | null>(null);
  const [openNewTab, setOpenNewTab] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [formError, setFormError] = useState('');
  
  // Delete Confirmation Modal
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Notification state
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Logo Upload State
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoMessage, setLogoMessage] = useState('');
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [showLogoUrlInput, setShowLogoUrlInput] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoMessage('অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন (PNG, SVG, JPG, WebP)');
      return;
    }

    setUploadingLogo(true);
    setLogoMessage('');

    try {
      const dataUrl = await compressImageFile(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.9,
        preserveTransparency: true
      });
      const updated = { ...configState, logoUrl: dataUrl, logoEnabled: true };
      setConfigState(updated);
      await saveHeader(updated);
      updateSiteImages({ logo: dataUrl });
      setLogoMessage('লোগো সফলভাবে আপলোড ও সেভ হয়েছে!');
      setTimeout(() => setLogoMessage(''), 4000);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const url = event.target?.result as string;
        const updated = { ...configState, logoUrl: url, logoEnabled: true };
        setConfigState(updated);
        await saveHeader(updated);
        updateSiteImages({ logo: url });
        setLogoMessage('লোগো সফলভাবে সেভ হয়েছে!');
        setTimeout(() => setLogoMessage(''), 4000);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingLogo(false);
      if (logoFileRef.current) logoFileRef.current.value = '';
    }
  };

  const handleApplyLogoUrl = async () => {
    if (!logoUrlInput.trim()) return;
    const updated = { ...configState, logoUrl: logoUrlInput.trim(), logoEnabled: true };
    setConfigState(updated);
    await saveHeader(updated);
    updateSiteImages({ logo: logoUrlInput.trim() });
    setShowLogoUrlInput(false);
    setLogoUrlInput('');
    setLogoMessage('লোগো URL সফলভাবে সেভ হয়েছে!');
    setTimeout(() => setLogoMessage(''), 4000);
  };

  const handleRemoveLogo = async () => {
    const updated = { ...configState, logoUrl: '', logoEnabled: true };
    setConfigState(updated);
    await saveHeader(updated);
    updateSiteImages({ logo: '' });
    setLogoMessage('লোগো মুছে ফেলা হয়েছে (ডিফল্ট ওয়াটার ড্রপ আইকন কার্যকর)');
    setTimeout(() => setLogoMessage(''), 4000);
  };

  useEffect(() => {
    setItems(navItems);
  }, [navItems]);

  useEffect(() => {
    setConfigState(headerConfig);
  }, [headerConfig]);

  // Standard Suggested Routes
  const INTERNAL_PAGES = [
    { label: 'Home Page', url: '/' },
    { label: 'All Services', url: '/services' },
    { label: 'Water Tank Cleaning', url: '/water-tank-cleaning' },
    { label: 'Pipeline Cleaning', url: '/pipeline-cleaning' },
    { label: 'Service Areas (Dhaka)', url: '/service-areas' },
    { label: 'Pricing & Rate Card', url: '/pricing' },
    { label: 'About Us', url: '/about' },
    { label: 'Contact Us', url: '/contact' },
    { label: 'Before/After Portfolio', url: '/portfolio' },
    { label: 'Get Free Quote', url: '/get-quote' },
    { label: 'FAQ (Frequently Asked Questions)', url: '/faq' }
  ];

  const SECTION_ANCHORS = [
    { label: 'Hero Quote Wizard', url: '#quote' },
    { label: 'Services Section', url: '#services' },
    { label: 'Pricing Calculator', url: '#pricing' },
    { label: '7-Step Cleaning Method', url: '#process' },
    { label: 'Why Choose Us', url: '#why-us' },
    { label: 'Dhaka Coverage Areas', url: '#coverage' },
    { label: 'Customer Reviews', url: '#reviews' },
    { label: 'FAQ Section', url: '#faq' }
  ];

  // Helper to determine destination type from URL
  const detectDestinationType = (url: string): DestinationType => {
    if (!url) return 'internal';
    if (url.startsWith('http://') || url.startsWith('https://')) return 'external';
    if (url.startsWith('#')) return 'section';
    return 'internal';
  };

  const handleOpenAddModal = (defaultParentId: string | null = null) => {
    setEditingItem(null);
    setLabelEn('');
    setLabelBn('');
    setDestType('internal');
    setDestUrl('/services');
    setParentId(defaultParentId);
    setOpenNewTab(false);
    setIsVisible(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: NavItem) => {
    setEditingItem(item);
    setLabelEn(item.labelEn || item.label);
    setLabelBn(item.labelBn || item.label);
    const type = detectDestinationType(item.url);
    setDestType(type);
    setDestUrl(item.url);
    setParentId(item.parentId || null);
    setOpenNewTab(Boolean(item.openNewTab));
    setIsVisible(item.isVisible);
    setFormError('');
    setIsModalOpen(true);
  };

  const validateUrl = (url: string, type: DestinationType): boolean => {
    const trimmed = url.trim();
    if (!trimmed) {
      setFormError('Destination URL or section cannot be empty.');
      return false;
    }

    if (type === 'external') {
      const lower = trimmed.toLowerCase();
      if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
        setFormError('Unsafe URL scheme detected. External URLs must begin with http:// or https://');
        return false;
      }
      if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
        setFormError('External URLs must begin with http:// or https://');
        return false;
      }
    }

    if (type === 'section') {
      if (!trimmed.startsWith('#')) {
        setFormError('Section anchors must begin with # (e.g. #pricing)');
        return false;
      }
    }

    return true;
  };

  const handleSaveModal = async () => {
    const trimmedEn = labelEn.trim();
    const trimmedBn = labelBn.trim();

    if (!trimmedEn && !trimmedBn) {
      setFormError('Please enter at least one label (English or Bengali).');
      return;
    }

    if (!validateUrl(destUrl, destType)) {
      return;
    }

    const finalLabel = trimmedEn || trimmedBn;
    const finalLabelBn = trimmedBn || trimmedEn;
    const finalLabelEn = trimmedEn || trimmedBn;

    let targetSortOrder = items.length + 1;
    if (editingItem) {
      targetSortOrder = editingItem.sortOrder;
    }

    const itemToSave: NavItem = {
      id: editingItem ? editingItem.id : 'nav-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      label: finalLabel,
      labelBn: finalLabelBn,
      labelEn: finalLabelEn,
      url: destUrl.trim(),
      openNewTab: destType === 'external' ? true : openNewTab,
      isVisible,
      sortOrder: targetSortOrder,
      parentId: parentId || null
    };

    setSaving(true);
    await saveNav(itemToSave);
    await refresh();
    setSaving(false);
    setIsModalOpen(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    await deleteNav(id);
    await refresh();
    setSaving(false);
    setDeletingId(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const toggleVisibility = async (item: NavItem) => {
    const updated = { ...item, isVisible: !item.isVisible };
    await saveNav(updated);
    await refresh();
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const next = [...items];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    setItems(next);
    await reorderNav(next);
    await refresh();
  };

  const handleSaveAllAndPublish = async () => {
    setSaving(true);
    await saveHeader(configState);
    await reorderNav(items);
    await refresh();
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Reset to recommended navigation structure
  const handleLoadRecommended = async () => {
    const recommended: NavItem[] = [
      { id: 'nav-home', label: 'Home', labelBn: 'হোম', labelEn: 'Home', url: '/', openNewTab: false, isVisible: true, sortOrder: 1, parentId: null },
      { id: 'nav-services', label: 'Services', labelBn: 'সার্ভিসসমূহ', labelEn: 'Services', url: '/services', openNewTab: false, isVisible: true, sortOrder: 2, parentId: null },
      { id: 'nav-tank-clean', label: 'Water Tank Cleaning', labelBn: 'ওয়াটার ট্যাংক ক্লিনিং', labelEn: 'Water Tank Cleaning', url: '/water-tank-cleaning', openNewTab: false, isVisible: true, sortOrder: 3, parentId: 'nav-services' },
      { id: 'nav-pipe-clean', label: 'Pipeline Cleaning', labelBn: 'পাইপলাইন ক্লিনিং', labelEn: 'Pipeline Cleaning', url: '/pipeline-cleaning', openNewTab: false, isVisible: true, sortOrder: 4, parentId: 'nav-services' },
      { id: 'nav-areas', label: 'Service Areas', labelBn: 'কভারেজ এলাকা', labelEn: 'Service Areas', url: '/service-areas', openNewTab: false, isVisible: true, sortOrder: 5, parentId: null },
      { id: 'nav-pricing', label: 'Pricing', labelBn: 'রেট কার্ড', labelEn: 'Pricing', url: '#pricing', openNewTab: false, isVisible: true, sortOrder: 6, parentId: null },
      { id: 'nav-about', label: 'About Us', labelBn: 'আমাদের সম্পর্কে', labelEn: 'About Us', url: '/about', openNewTab: false, isVisible: true, sortOrder: 7, parentId: null },
      { id: 'nav-contact', label: 'Contact Us', labelBn: 'যোগাযোগ', labelEn: 'Contact Us', url: '/contact', openNewTab: false, isVisible: true, sortOrder: 8, parentId: null }
    ];

    setSaving(true);
    for (const it of recommended) {
      await saveNav(it);
    }
    await reorderNav(recommended);
    await refresh();
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const topLevelItems = items.filter(it => !it.parentId);

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Header &amp; Navigation Management</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Sync
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage website header navigation links, dropdown menus, CTA buttons, and phone number without touching code.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLoadRecommended}
            disabled={saving}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Load default structured menu with dropdowns"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Recommended Menu</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddModal(null)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAllAndPublish}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Published Live!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? 'Publishing...' : 'Save & Publish Live'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('links')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'links'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Navigation Menu Links ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Header CTAs &amp; Contact Info</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Header Preview</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: NAVIGATION MENU LINKS & SUBMENUS                         */}
      {/* ============================================================== */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Live Menu Items Hierarchy</h3>
                <p className="text-xs text-slate-400">
                  Toggle items on/off, reorder items with Up/Down buttons, add submenus, or configure target pages.
                </p>
              </div>
              <span className="text-xs text-slate-500">
                {items.filter(i => i.isVisible).length} of {items.length} links active
              </span>
            </div>

            {items.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                <p>No navigation menu items configured yet.</p>
                <button
                  onClick={handleLoadRecommended}
                  className="mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                >
                  Load Recommended Menu
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => {
                  const isChild = Boolean(item.parentId);
                  const parentItem = items.find(p => p.id === item.parentId);
                  const childrenCount = items.filter(c => c.parentId === item.id).length;
                  const type = detectDestinationType(item.url);

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition-all ${
                        isChild 
                          ? 'ml-0 sm:ml-8 bg-slate-950/70 border-slate-800/80 border-l-4 border-l-cyan-500' 
                          : 'bg-slate-950 border-slate-800'
                      } ${!item.isVisible ? 'opacity-50' : ''}`}
                    >
                      {/* Left: Indicator, Title, URLs, Badges */}
                      <div className="flex items-start sm:items-center gap-3">
                        {isChild && (
                          <CornerDownRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 sm:mt-0" />
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.isVisible}
                            onChange={() => toggleVisibility(item)}
                            title={item.isVisible ? 'Click to disable' : 'Click to enable'}
                            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">
                              {item.label}
                            </span>
                            {item.labelBn && (
                              <span className="text-xs text-slate-400">
                                ({item.labelBn})
                              </span>
                            )}
                            {childrenCount > 0 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {childrenCount} Sub-items
                              </span>
                            )}
                            {isChild && parentItem && (
                              <span className="text-[10px] text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                                inside {parentItem.label}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[11px] font-mono text-blue-400 flex items-center gap-1">
                              {type === 'internal' && <Globe className="w-3 h-3 text-slate-400" />}
                              {type === 'section' && <Hash className="w-3 h-3 text-amber-400" />}
                              {type === 'external' && <ExternalLink className="w-3 h-3 text-emerald-400" />}
                              <span>{item.url}</span>
                            </span>

                            {item.openNewTab && (
                              <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                New Tab
                              </span>
                            )}

                            {!item.isVisible && (
                              <span className="text-[10px] text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40 font-semibold">
                                Disabled
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 mt-3 sm:mt-0 justify-end">
                        {!isChild && (
                          <button
                            type="button"
                            onClick={() => handleOpenAddModal(item.id)}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 rounded-lg text-xs flex items-center gap-1 transition-colors"
                            title="Add sub-item under this menu"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Submenu</span>
                          </button>
                        )}

                        <div className="flex items-center border border-slate-800 rounded-lg overflow-hidden bg-slate-900">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveOrder(index, 'up')}
                            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-20 hover:bg-slate-800"
                            title="Move Up"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === items.length - 1}
                            onClick={() => handleMoveOrder(index, 'down')}
                            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-20 hover:bg-slate-800"
                            title="Move Down"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-900 rounded-lg transition-colors"
                          title="Edit Menu Item"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingId(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
                          title="Delete Menu Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: HEADER SETTINGS & CONTACT CTAS                          */}
      {/* ============================================================== */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white">Header Branding &amp; Action Buttons</h3>
            <p className="text-xs text-slate-400">
              Configure company logo, phone helpline, WhatsApp action button, and Quote CTA button displayed in the header.
            </p>
          </div>

          {/* Logo Message Toast */}
          {logoMessage && (
            <div className="p-3 bg-cyan-950/70 border border-cyan-500/40 rounded-xl text-xs font-semibold text-cyan-300 flex items-center justify-between animate-fadeIn">
              <span>{logoMessage}</span>
              <button type="button" onClick={() => setLogoMessage('')} className="text-cyan-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* BRAND LOGO MANAGEMENT CARD */}
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <span>Website Brand Logo (ওয়েবসাইট ব্র্যান্ড লোগো)</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  কোম্পানির লোগো আপলোড করুন (স্বচ্ছ ব্যাকগ্রাউন্ড PNG, SVG বা WebP সমর্থিত)।
                </p>
              </div>

              {/* Logo Visibility Toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = !configState.logoEnabled;
                  const updated = { ...configState, logoEnabled: next };
                  setConfigState(updated);
                  saveHeader(updated);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  configState.logoEnabled 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {configState.logoEnabled ? '● সক্রিয় (Logo Enabled)' : '○ নিষ্ক্রিয় (Logo Hidden)'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Logo Preview on Navy Blue background */}
              <div className="flex flex-col items-center gap-2">
                <div 
                  className="w-24 h-24 rounded-xl bg-[#07172C] border-2 border-cyan-500/30 flex items-center justify-center p-2 shadow-inner shrink-0 relative group"
                  title="লোগো প্রিভিউ (হেডার নেভি ব্লু ব্যাকগ্রাউন্ডে)"
                >
                  {configState.logoUrl || headerConfig.logoUrl ? (
                    <img
                      src={configState.logoUrl || headerConfig.logoUrl}
                      alt="Brand Logo Preview"
                      style={{
                        width: `${configState.logoWidth || 40}px`,
                        height: `${configState.logoHeight || 40}px`
                      }}
                      className="object-contain bg-transparent max-w-full max-h-full transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-cyan-400">
                      <Droplets className="w-8 h-8 text-cyan-400" />
                      <span className="text-[9px] text-slate-400 mt-1">Default</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  আকার: {configState.logoWidth || 40}px
                </span>
              </div>

              {/* Upload & Actions */}
              <div className="flex-1 space-y-3 w-full">
                <input
                  type="file"
                  ref={logoFileRef}
                  accept="image/png,image/svg+xml,image/webp,image/jpeg"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => logoFileRef.current?.click()}
                    disabled={uploadingLogo}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-cyan-600/30 disabled:opacity-50 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingLogo ? 'আপলোড হচ্ছে...' : 'নতুন ছবি আপলোড করুন'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLogoUrlInput(!showLogoUrlInput)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1 border border-slate-700"
                  >
                    <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>URL দিন</span>
                  </button>

                  {(configState.logoUrl || headerConfig.logoUrl) && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-all flex items-center gap-1 border border-rose-500/20"
                      title="কাস্টম লোগো মুছে ডিফল্ট ড্রপলেট আইকন ফিরিয়ে আনুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>লোগো মুছুন</span>
                    </button>
                  )}
                </div>

                {/* URL Input dropdown */}
                {showLogoUrlInput && (
                  <div className="flex items-center gap-2 pt-1 animate-fadeIn">
                    <input
                      type="text"
                      value={logoUrlInput}
                      onChange={(e) => setLogoUrlInput(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyLogoUrl}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg"
                    >
                      প্রয়োগ
                    </button>
                  </div>
                )}

                {/* Logo Size Selector */}
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">সাইজ:</span>
                  {[32, 40, 48, 56, 64].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        const updated = { ...configState, logoWidth: size, logoHeight: size };
                        setConfigState(updated);
                        saveHeader(updated);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        (configState.logoWidth || 40) === size
                          ? 'bg-cyan-500 text-[#040D1A] font-bold shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Phone helpline */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                <Phone className="w-4 h-4" />
                <span>Phone Call CTA</span>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Display Phone Text</label>
                <input
                  type="text"
                  value={configState.phoneDisplay}
                  onChange={(e) => setConfigState({ ...configState, phoneDisplay: e.target.value })}
                  placeholder="01609-999612"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tel Link (with country code)</label>
                <input
                  type="text"
                  value={configState.phone}
                  onChange={(e) => setConfigState({ ...configState, phone: e.target.value })}
                  placeholder="+8801609999612"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* WhatsApp Integration */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp CTA (01609999612)</span>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={configState.whatsappNumber}
                  onChange={(e) => setConfigState({ ...configState, whatsappNumber: e.target.value })}
                  placeholder="8801609999612"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Default Pre-filled Message</label>
                <input
                  type="text"
                  value={configState.whatsappMessage}
                  onChange={(e) => setConfigState({ ...configState, whatsappMessage: e.target.value })}
                  placeholder="Hello Sunviloz Clean Care..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Quote Button CTA */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Quote / Booking CTA Button</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Bengali Label</label>
                  <input
                    type="text"
                    value={configState.ctaTextBn}
                    onChange={(e) => setConfigState({ ...configState, ctaTextBn: e.target.value })}
                    placeholder="কোটেশন নিন"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">English Label</label>
                  <input
                    type="text"
                    value={configState.ctaTextEn}
                    onChange={(e) => setConfigState({ ...configState, ctaTextEn: e.target.value })}
                    placeholder="Get Free Quote"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">CTA Destination URL</label>
                <input
                  type="text"
                  value={configState.ctaUrl}
                  onChange={(e) => setConfigState({ ...configState, ctaUrl: e.target.value })}
                  placeholder="/get-quote or #quote"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Brand Taglines */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
                <Compass className="w-4 h-4 text-blue-400" />
                <span>Branding Taglines</span>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Bengali Tagline</label>
                <input
                  type="text"
                  value={configState.brandTaglineBn}
                  onChange={(e) => setConfigState({ ...configState, brandTaglineBn: e.target.value })}
                  placeholder="ঢাকা শহরের নির্ভরযোগ্য ওয়াটার ট্যাংক ক্লিনিং সার্ভিস"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">English Tagline</label>
                <input
                  type="text"
                  value={configState.brandTaglineEn}
                  onChange={(e) => setConfigState({ ...configState, brandTaglineEn: e.target.value })}
                  placeholder="Water Tank Cleaning • Dhaka"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveAllAndPublish}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-blue-600/30"
            >
              {saving ? 'Saving...' : 'Save Header Settings'}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: LIVE HEADER PREVIEW                                     */}
      {/* ============================================================== */}
      {activeTab === 'preview' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Live Public Header Preview</h3>
              <p className="text-xs text-slate-400">
                Test how visitors on desktop and mobile view your navigation bar and interactive dropdown menus.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 ${
                    previewDevice === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 ${
                    previewDevice === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>

              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setPreviewLang('bn')}
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    previewLang === 'bn' ? 'bg-cyan-500 text-[#040D1A]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  বাং
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLang('en')}
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    previewLang === 'en' ? 'bg-cyan-500 text-[#040D1A]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Frame */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 overflow-x-auto">
            <div className={previewDevice === 'mobile' ? 'max-w-sm mx-auto border-2 border-slate-700 rounded-2xl overflow-hidden shadow-2xl' : 'w-full'}>
              
              {/* Simulated Header Navbar */}
              <div className="w-full bg-[#07172C] border-b border-cyan-800/40 px-4 py-3 flex items-center justify-between text-white">
                
                {/* Brand Logo - Transparent Background */}
                <div className="flex items-center gap-2">
                  {configState.logoEnabled && (configState.logoUrl || headerConfig.logoUrl) ? (
                    <img
                      src={configState.logoUrl || headerConfig.logoUrl}
                      alt="Brand Logo"
                      style={{
                        width: `${configState.logoWidth || 36}px`,
                        height: `${configState.logoHeight || 36}px`
                      }}
                      className="object-contain bg-transparent shrink-0"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-cyan-400 font-extrabold text-sm shrink-0 bg-transparent">
                      <Droplets className="w-6 h-6 text-cyan-400" />
                    </div>
                  )}
                  <div>
                    <div className="font-extrabold text-sm leading-tight text-white flex items-center gap-1">
                      <span>Sunviloz</span>
                      <span className="text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-1 py-0.5 rounded text-[10px] font-bold">Clean Care</span>
                    </div>
                    <p className="text-[10px] text-slate-300 truncate max-w-[160px]">
                      {previewLang === 'bn' ? configState.brandTaglineBn : configState.brandTaglineEn}
                    </p>
                  </div>
                </div>

                {/* Desktop Nav Items */}
                {previewDevice === 'desktop' && (
                  <nav className="flex items-center gap-1.5">
                    {navTree.filter(i => i.isVisible).map(item => (
                      <div key={item.id} className="relative group">
                        <button className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-1 transition-colors">
                          <span>{previewLang === 'bn' ? item.labelBn || item.label : item.labelEn || item.label}</span>
                          {item.children && item.children.length > 0 && (
                            <ChevronDown className="w-3 h-3 text-slate-300 group-hover:text-cyan-400" />
                          )}
                        </button>

                        {/* Hover Dropdown */}
                        {item.children && item.children.length > 0 && (
                          <div className="absolute top-full left-0 mt-1 w-48 bg-[#0E2445] border border-cyan-800/50 rounded-xl shadow-xl py-1 hidden group-hover:block z-50 animate-fadeIn text-white">
                            {item.children.filter(c => c.isVisible).map(child => (
                              <a
                                key={child.id}
                                href={child.url}
                                className="block px-3 py-1.5 text-xs text-slate-200 hover:text-white hover:bg-cyan-950/60 transition-colors"
                              >
                                {previewLang === 'bn' ? child.labelBn || child.label : child.labelEn || child.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </nav>
                )}

                {/* Right CTAs */}
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${configState.phone}`}
                    className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-200 hover:text-white"
                  >
                    <Phone className="w-3 h-3 text-cyan-400" />
                    <span>{configState.phoneDisplay}</span>
                  </a>

                  <a
                    href={configState.ctaUrl}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 font-extrabold text-xs shadow-md hover:from-cyan-300 hover:to-cyan-200"
                  >
                    {previewLang === 'bn' ? configState.ctaTextBn : configState.ctaTextEn}
                  </a>
                </div>
              </div>

              {/* Simulated Hero / Body underneath */}
              <div className="p-8 text-center bg-[#040D1A] text-slate-400 text-xs">
                <p className="text-cyan-300 font-semibold mb-1">Preview viewport representation</p>
                <p>Website content flows seamlessly beneath the dynamic header.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT NAVIGATION ITEM                              */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">
                  {editingItem ? 'Edit Navigation Item' : 'Add New Navigation Item'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Labels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    English Label *
                  </label>
                  <input
                    type="text"
                    value={labelEn}
                    onChange={(e) => {
                      setLabelEn(e.target.value);
                      setFormError('');
                    }}
                    placeholder="e.g. Water Tank Cleaning"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Bengali Label *
                  </label>
                  <input
                    type="text"
                    value={labelBn}
                    onChange={(e) => {
                      setLabelBn(e.target.value);
                      setFormError('');
                    }}
                    placeholder="উদা: ওয়াটার ট্যাংক ক্লিনিং"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Destination Type Select */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Destination Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDestType('internal');
                      setDestUrl('/services');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      destType === 'internal'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Internal Page</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDestType('section');
                      setDestUrl('#pricing');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      destType === 'section'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <Hash className="w-3.5 h-3.5" />
                    <span>Page Section</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDestType('external');
                      setDestUrl('https://');
                      setOpenNewTab(true);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      destType === 'external'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>External URL</span>
                  </button>
                </div>
              </div>

              {/* Quick Select Presets based on Type */}
              {destType === 'internal' && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Quick Select Common Page:
                  </label>
                  <select
                    value={destUrl}
                    onChange={(e) => setDestUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    {INTERNAL_PAGES.map(page => (
                      <option key={page.url} value={page.url}>
                        {page.label} ({page.url})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {destType === 'section' && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Quick Select Page Section:
                  </label>
                  <select
                    value={destUrl}
                    onChange={(e) => setDestUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    {SECTION_ANCHORS.map(sec => (
                      <option key={sec.url} value={sec.url}>
                        {sec.label} ({sec.url})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Destination URL field */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Destination URL or Path *
                </label>
                <input
                  type="text"
                  value={destUrl}
                  onChange={(e) => {
                    setDestUrl(e.target.value);
                    setFormError('');
                  }}
                  placeholder={destType === 'external' ? 'https://example.com' : destType === 'section' ? '#pricing' : '/services'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Parent Menu (for Dropdowns) */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Parent Menu (Dropdown Hierarchy)
                </label>
                <select
                  value={parentId || ''}
                  onChange={(e) => setParentId(e.target.value ? e.target.value : null)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="">None (Top-Level Menu Item)</option>
                  {topLevelItems
                    .filter(t => !editingItem || t.id !== editingItem.id)
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.label} ({t.labelBn})
                      </option>
                    ))}
                </select>
              </div>

              {/* Options */}
              <div className="pt-2 flex flex-col sm:flex-row gap-4 border-t border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={openNewTab}
                    onChange={(e) => setOpenNewTab(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-blue-600"
                  />
                  <span>Open in New Tab (target="_blank")</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-blue-600"
                  />
                  <span>Visible on Public Website</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-800 bg-slate-950">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30"
              >
                {saving ? 'Saving...' : editingItem ? 'Update Menu Item' : 'Create Menu Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DELETE CONFIRMATION                                     */}
      {/* ============================================================== */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-bold text-white text-base">Delete Menu Item?</h4>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove this navigation item from the header? Any child submenu items will also be removed.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-md shadow-rose-600/30"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderNavTab;
