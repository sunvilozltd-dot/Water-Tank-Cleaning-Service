import React, { useState, useRef } from 'react';
import { BlogPost, ArticleImage } from '../../types/blog';
import { 
  X, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  AlertCircle, 
  Check, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  Plus, 
  Sparkles, 
  RefreshCw, 
  FileText,
  Search,
  Layers,
  HelpCircle
} from 'lucide-react';
import { uploadImageToSupabase, deleteArticleStorageImage } from '../../services/imageSyncService';

interface BlogPostModalProps {
  post: BlogPost | null;
  allPosts?: BlogPost[];
  onClose: () => void;
  onSave: (post: BlogPost) => void;
}

export const BlogPostModal: React.FC<BlogPostModalProps> = ({ 
  post, 
  allPosts = [], 
  onClose, 
  onSave 
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'images' | 'seo' | 'preview'>('content');

  // Form state
  const [formData, setFormData] = useState<BlogPost>(() => {
    if (post) {
      return {
        ...post,
        imageAlt: post.imageAlt || post.seo?.imageAlt || '',
        imageCaption: post.imageCaption || post.seo?.imageCaption || '',
        images: Array.isArray(post.images) 
          ? post.images 
          : (Array.isArray(post.seo?.images) ? post.seo.images : [])
      };
    }
    return {
      id: `post-${Date.now()}`,
      slug: '',
      category: 'Water Tank Cleaning',
      categoryBn: 'পানির ট্যাংক পরিষ্কার',
      title: '',
      titleBn: '',
      excerpt: '',
      excerptBn: '',
      content: '',
      contentBn: '',
      imageUrl: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg',
      imageAlt: 'পেশাদার পানির ট্যাংক পরিষ্কার সার্ভিস',
      imageCaption: '',
      images: [],
      author: 'সানভিলোজ হাইজিন টিম',
      publishedAt: new Date().toISOString().slice(0, 10),
      readTime: '5 min read',
      readTimeBn: '৫ মিনিট পাঠ',
      featured: false,
      published: true,
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: ['পানির ট্যাংক পরিষ্কার'],
        canonicalUrl: ''
      }
    };
  });

  // Upload and UI state
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);
  const [replacingImageId, setReplacingImageId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);

  const featuredFileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Helper to collect all active image URLs across all posts to prevent deleting shared images
  const getAllReferencedImageUrls = (): string[] => {
    const urls = new Set<string>();
    for (const p of allPosts) {
      if (p.id !== formData.id) {
        if (p.imageUrl) urls.add(p.imageUrl);
        if (p.images) {
          p.images.forEach(img => { if (img.url) urls.add(img.url); });
        }
      }
    }
    // Also include currently kept images in current form
    if (formData.imageUrl) urls.add(formData.imageUrl);
    formData.images?.forEach(img => { if (img.url) urls.add(img.url); });
    return Array.from(urls);
  };

  // 1. Upload or Replace Featured Cover Image directly to Supabase Storage
  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ text: 'অনুগ্রহ করে একটি সঠিক ছবি নির্বাচন করুন (PNG, JPG, WebP)।', type: 'error' });
      return;
    }

    setUploadingFeatured(true);
    setStatusMessage(null);

    const oldUrl = formData.imageUrl;
    const prefix = formData.slug ? `featured_${formData.slug.slice(0, 25)}` : 'featured_article';

    try {
      const result = await uploadImageToSupabase(file, 'articles', prefix);
      if (result.success && result.publicUrl) {
        setFormData(prev => ({
          ...prev,
          imageUrl: result.publicUrl,
          seo: {
            ...(prev.seo || {}),
            imageAlt: prev.imageAlt || prev.titleBn || prev.title
          }
        }));

        if (oldUrl && oldUrl !== result.publicUrl && oldUrl.includes('/storage/v1/object/public/site-media/')) {
          setPendingDeletions(prev => [...prev, oldUrl]);
        }

        setStatusMessage({ text: 'কভার ইমেজ সফলভাবে Supabase Storage-এ আপলোড হয়েছে।', type: 'success' });
      } else {
        setStatusMessage({ text: `আপলোড ব্যর্থ হয়েছে: ${result.error || 'অজানা ত্রুটি'}`, type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: `ছবি আপলোডে ত্রুটি: ${err?.message || 'ব্যর্থ'}`, type: 'error' });
    } finally {
      setUploadingFeatured(false);
      if (featuredFileInputRef.current) featuredFileInputRef.current.value = '';
    }
  };

  // 2. Add Additional / Inline Image
  const handleAddArticleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ text: 'অনুগ্রহ করে সঠিক ফরম্যাটের ছবি দিন (JPG, PNG, WebP)।', type: 'error' });
      return;
    }

    setUploadingAdditional(true);
    setStatusMessage(null);

    const prefix = formData.slug ? `inline_${formData.slug.slice(0, 20)}` : 'inline_article';

    try {
      const result = await uploadImageToSupabase(file, 'articles', prefix);
      if (result.success && result.publicUrl) {
        const currentImages = formData.images || [];
        const newImage: ArticleImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          url: result.publicUrl,
          storagePath: result.storagePath,
          alt: `${formData.titleBn || formData.title || 'পানির ট্যাংক ক্লিনিং'} - বিস্তারিত ছবি`,
          caption: '',
          position: 'inline',
          order: currentImages.length + 1
        };

        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), newImage]
        }));

        setStatusMessage({ text: 'আর্টিকেল ইমেজ সফলভাবে সংযুক্ত হয়েছে।', type: 'success' });
      } else {
        setStatusMessage({ text: `ছবি আপলোড ব্যর্থ: ${result.error}`, type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: `ছবি আপলোডে ত্রুটি: ${err?.message}`, type: 'error' });
    } finally {
      setUploadingAdditional(false);
      if (additionalFileInputRef.current) additionalFileInputRef.current.value = '';
    }
  };

  // 3. Replace an existing inline image
  const triggerReplaceImage = (imageId: string) => {
    setReplacingImageId(imageId);
    replaceFileInputRef.current?.click();
  };

  const handleExecuteReplaceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const imageId = replacingImageId;
    if (!file || !imageId) return;

    setStatusMessage({ text: 'নতুন ছবি আপলোড ও প্রতিস্থাপন হচ্ছে...', type: 'info' });

    const targetImg = formData.images?.find(i => i.id === imageId);
    const oldUrl = targetImg?.url;
    const prefix = `replaced_${formData.slug.slice(0, 15) || 'art'}`;

    try {
      const result = await uploadImageToSupabase(file, 'articles', prefix);
      if (result.success && result.publicUrl) {
        setFormData(prev => ({
          ...prev,
          images: (prev.images || []).map(img => 
            img.id === imageId ? { ...img, url: result.publicUrl!, storagePath: result.storagePath } : img
          )
        }));

        if (oldUrl && oldUrl !== result.publicUrl && oldUrl.includes('/storage/v1/object/public/site-media/')) {
          setPendingDeletions(prev => [...prev, oldUrl]);
        }

        setStatusMessage({ text: 'ছবি সফলভাবে প্রতিস্থাপিত হয়েছে।', type: 'success' });
      } else {
        setStatusMessage({ text: `প্রতিস্থাপন ব্যর্থ: ${result.error}`, type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: `প্রতিস্থাপন ব্যর্থ: ${err?.message}`, type: 'error' });
    } finally {
      setReplacingImageId(null);
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  // 4. Delete an image
  const handleDeleteArticleImage = (imageId: string) => {
    const imgToDelete = formData.images?.find(i => i.id === imageId);
    if (imgToDelete?.url && imgToDelete.url.includes('/storage/v1/object/public/site-media/')) {
      setPendingDeletions(prev => [...prev, imgToDelete.url]);
    }

    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter(img => img.id !== imageId)
    }));

    setStatusMessage({ text: 'ছবিটি তালিকা থেকে সরানো হয়েছে। সেভ করলে পার্মানেন্ট হবে।', type: 'info' });
  };

  // 5. Reorder images (Move Up / Down)
  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const images = [...(formData.images || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const temp = images[index];
    images[index] = images[targetIndex];
    images[targetIndex] = temp;

    // Recalculate order index
    images.forEach((img, idx) => { img.order = idx + 1; });

    setFormData(prev => ({ ...prev, images }));
  };

  // 6. Update individual image Alt or Caption
  const handleUpdateImageMeta = (id: string, field: 'alt' | 'caption' | 'position', value: string) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).map(img => img.id === id ? { ...img, [field]: value } : img)
    }));
  };

  // 7. Insert markdown snippet into content
  const insertImageMarkdown = (img: ArticleImage) => {
    const snippet = `\n\n![${img.alt || 'Water tank cleaning'}](${img.url})\n\n`;
    setFormData(prev => ({
      ...prev,
      contentBn: (prev.contentBn || '') + snippet,
      content: (prev.content || '') + snippet
    }));
    setStatusMessage({ text: 'আর্টিকেলের লেখার শেষে ছবির কোড যুক্ত হয়েছে।', type: 'success' });
  };

  // Save handler with safe storage cleanup
  const handleSave = async () => {
    if (!formData.titleBn?.trim() && !formData.title.trim()) {
      setStatusMessage({ text: 'অনুগ্রহ করে আর্টিকেলের বাংলা বা ইংরেজি শিরোনাম লিখুন।', type: 'error' });
      return;
    }

    let finalSlug = (formData.slug || '').trim().toLowerCase();
    if (!finalSlug) {
      finalSlug = (formData.title || formData.titleBn || 'article')
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
    }

    const payload: BlogPost = {
      ...formData,
      slug: finalSlug,
      title: formData.title.trim() || formData.titleBn?.trim() || 'Untitled Article',
      titleBn: formData.titleBn?.trim() || formData.title.trim(),
      excerpt: formData.excerpt || formData.excerptBn || '',
      excerptBn: formData.excerptBn || formData.excerpt || '',
      content: formData.content || formData.contentBn || '',
      contentBn: formData.contentBn || formData.content || '',
      imageAlt: formData.imageAlt || formData.titleBn || formData.title,
      imageCaption: formData.imageCaption || '',
      images: formData.images || [],
      publishedAt: formData.publishedAt || new Date().toISOString().slice(0, 10),
      seo: {
        metaTitle: formData.seo?.metaTitle || formData.titleBn || formData.title,
        metaDescription: formData.seo?.metaDescription || formData.excerptBn || formData.excerpt || '',
        keywords: formData.seo?.keywords || ['পানির ট্যাংক পরিষ্কার'],
        canonicalUrl: formData.seo?.canonicalUrl || `https://sunvilozcleancare.com/blog/${finalSlug}`,
        imageAlt: formData.imageAlt || formData.titleBn || formData.title,
        imageCaption: formData.imageCaption || '',
        images: formData.images || []
      }
    };

    // Execute safe storage purge for confirmed replaced/deleted media
    if (pendingDeletions.length > 0) {
      const referencedUrls = getAllReferencedImageUrls();
      for (const oldUrl of pendingDeletions) {
        if (!referencedUrls.includes(oldUrl)) {
          deleteArticleStorageImage(oldUrl, referencedUrls).catch(e => {
            console.warn('[BlogPostModal] Non-blocking media purge notice:', e);
          });
        }
      }
    }

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 text-xs">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" />
              <span>{post ? 'আর্টিকেল ও ছবি সম্পাদনা' : 'নতুন আর্টিকেল তৈরি করুন'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              প্রাকৃতিক বাংলা আর্টিকেল, ইমেজ আপলোড ও গুগল এসইও কন্ট্রোল প্যানেল
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 shrink-0 overflow-x-auto gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`py-3 px-3.5 font-bold border-b-2 text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'content'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>বিষয়বস্তু ও কন্টেন্ট</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`py-3 px-3.5 font-bold border-b-2 text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'images'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>ছবি ব্যবস্থাপনা</span>
            <span className="px-1.5 py-0.2 bg-teal-950 text-teal-400 border border-teal-800/60 rounded-full text-[10px]">
              {(formData.images?.length || 0) + (formData.imageUrl ? 1 : 0)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`py-3 px-3.5 font-bold border-b-2 text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'seo'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>এসইও ও মেটাট্যাগ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-3.5 font-bold border-b-2 text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'preview'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>লাইভ প্রিভিউ</span>
          </button>
        </div>

        {/* Status Toast / Alert */}
        {statusMessage && (
          <div className={`p-3 text-xs flex items-center justify-between border-b ${
            statusMessage.type === 'error' 
              ? 'bg-rose-950/80 border-rose-800 text-rose-300' 
              : statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-blue-950/80 border-blue-800 text-blue-300'
          }`}>
            <div className="flex items-center gap-2">
              {statusMessage.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: CONTENT & GENERAL */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  শিরোনাম (বাংলা - প্রধান ইউজার হেডিং) *
                </label>
                <input
                  type="text"
                  value={formData.titleBn || ''}
                  onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-medium"
                  placeholder="যেমন: পানির ট্যাংক কতদিন পরপর পরিষ্কার করা উচিত? সঠিক সময় ও নিয়ম"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Title (English / Internal reference)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  placeholder="Why Rooftop Water Tanks Need Regular Cleaning in Dhaka"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ইউআরএল স্লাগ (URL Slug) *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                    placeholder="why-water-tank-cleaning-is-important"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">URL: /blog/{formData.slug || '...'}</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ক্যাটাগরি (বাংলা)</label>
                  <input
                    type="text"
                    value={formData.categoryBn || ''}
                    onChange={(e) => setFormData({ ...formData, categoryBn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    placeholder="পানির ট্যাংক পরিষ্কার"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">পড়ার সময় (Read Time)</label>
                  <input
                    type="text"
                    value={formData.readTimeBn || ''}
                    onChange={(e) => setFormData({ ...formData, readTimeBn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    placeholder="৫ মিনিট পাঠ"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">সংক্ষিপ্ত সারসংক্ষেপ (Excerpt / Summary) *</label>
                <textarea
                  rows={2}
                  value={formData.excerptBn || formData.excerpt || ''}
                  onChange={(e) => setFormData({ ...formData, excerptBn: e.target.value, excerpt: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white leading-relaxed"
                  placeholder="আর্টিকেলের শুরুতে প্রদর্শিত ১-২ লাইনের বাস্তবমুখী আকর্ষণীয় সারাংশ..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-semibold">
                    সম্পূর্ণ আর্টিকেলের মূল লেখা (Bangla Markdown Content) *
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">## সাব-হেডিং</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">**বোল্ড টেক্সট**</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">[লিংক](/services)</span>
                  </div>
                </div>
                <textarea
                  rows={14}
                  value={formData.contentBn || formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, contentBn: e.target.value, content: e.target.value })}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-sans text-xs leading-relaxed focus:outline-none focus:border-teal-400"
                  placeholder="সহজ, সাবলীল বাংলায় বাস্তবসম্মত অভিজ্ঞতা দিয়ে আর্টিকেল লিখুন..."
                />
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="publishedToggle"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <label htmlFor="publishedToggle" className="text-slate-300 font-semibold cursor-pointer">
                  আর্টিকেলটি ওয়েবসাইটে প্রকাশিত থাকবে (Published Status)
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: IMAGE MANAGEMENT */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              
              {/* SECTION A: FEATURED HERO IMAGE */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-teal-400" />
                      <span>ফিচার্ড কভার ইমেজ (Featured Hero Image)</span>
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      আর্টিকেলের শীর্ষে ও গাইড লিস্ট কার্ডে প্রদর্শিত প্রধান ছবি (Supabase Storage: site-media/articles)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => featuredFileInputRef.current?.click()}
                      disabled={uploadingFeatured}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      {uploadingFeatured ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>{uploadingFeatured ? 'আপলোড হচ্ছে...' : 'নতুন ছবি আপলোড / পরিবর্তন'}</span>
                    </button>
                    <input
                      ref={featuredFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Featured preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                        <ImageIcon className="w-8 h-8 mb-1" />
                        <span>কোনো ছবি যুক্ত করা হয়নি</span>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2.5">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        ছবির অল্ট টেক্সট (Image Alt Text - Google Image SEO) *
                      </label>
                      <input
                        type="text"
                        value={formData.imageAlt || ''}
                        onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        placeholder="যেমন: ছাদের ওভারহেড পানির ট্যাংক পরিষ্কারের বাস্তব দৃশ্য"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        গুগল ইমেজ সার্চে র‍্যাংক পাওয়ার জন্য বর্ণনামূলক ও স্বাভাবিক টেক্সট লিখুন।
                      </span>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">ছবির ক্যাপশন (ঐচ্ছিক Caption)</label>
                      <input
                        type="text"
                        value={formData.imageCaption || ''}
                        onChange={(e) => setFormData({ ...formData, imageCaption: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        placeholder="যেমন: রোটারি জেট নজলে শ্যাওলা পরিষ্কার করার মুহূর্ত।"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">সরাসরি ইমেজ ইউআরএল (Direct URL)</label>
                      <input
                        type="text"
                        value={formData.imageUrl || ''}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 font-mono text-[11px]"
                        placeholder="https://...supabase.co/..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: MULTIPLE ARTICLE IMAGES & GALLERY */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-400" />
                      <span>আর্টিকেলের ভেতরের ছবি ও প্রজেক্ট গ্যালারি ({formData.images?.length || 0} টি ছবি)</span>
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      লেখার ভেতর বা নিচে একাধিক প্রাসঙ্গিক কাজের ছবি যুক্ত করুন এবং প্রতিটির অল্ট টেক্সট ও ক্যাপশন কন্ট্রোল করুন।
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => additionalFileInputRef.current?.click()}
                      disabled={uploadingAdditional}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {uploadingAdditional ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{uploadingAdditional ? 'আপলোড হচ্ছে...' : '+ ছবি যোগ করুন'}</span>
                    </button>
                    <input
                      ref={additionalFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAddArticleImage}
                      className="hidden"
                    />
                    <input
                      ref={replaceFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleExecuteReplaceImage}
                      className="hidden"
                    />
                  </div>
                </div>

                {(!formData.images || formData.images.length === 0) ? (
                  <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/40 text-slate-400 space-y-2">
                    <ImageIcon className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs">এখনো কোনো অতিরিক্ত ছবি যোগ করা হয়নি।</p>
                    <button
                      type="button"
                      onClick={() => additionalFileInputRef.current?.click()}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium cursor-pointer"
                    >
                      প্রথম ছবি আপলোড করুন
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.images.map((img, idx) => (
                      <div 
                        key={img.id || idx}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3 items-center"
                      >
                        {/* Image Preview & Order Controls */}
                        <div className="flex items-center gap-2.5">
                          <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                            <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                              title="উপরে নিন"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, 'down')}
                              disabled={idx === (formData.images?.length || 0) - 1}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                              title="নিচে নিন"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Alt Text Input */}
                        <div>
                          <label className="block text-[11px] text-slate-300 font-semibold mb-0.5">অল্ট টেক্সট (Alt)</label>
                          <input
                            type="text"
                            value={img.alt}
                            onChange={(e) => handleUpdateImageMeta(img.id, 'alt', e.target.value)}
                            className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-white text-xs"
                            placeholder="ছবির বর্ণনা..."
                          />
                        </div>

                        {/* Caption Input */}
                        <div>
                          <label className="block text-[11px] text-slate-300 font-semibold mb-0.5">ক্যাপশন (Caption)</label>
                          <input
                            type="text"
                            value={img.caption || ''}
                            onChange={(e) => handleUpdateImageMeta(img.id, 'caption', e.target.value)}
                            className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-white text-xs"
                            placeholder="কাজের সংক্ষিপ্ত বিবরণ..."
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => insertImageMarkdown(img)}
                            className="px-2.5 py-1 bg-teal-950 text-teal-300 hover:bg-teal-900 border border-teal-800/80 rounded font-semibold text-[11px] transition-colors cursor-pointer"
                            title="লেখার শেষে ছবির কোড যোগ করুন"
                          >
                            লেখায় যোগ
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerReplaceImage(img.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded font-semibold text-[11px] transition-colors cursor-pointer"
                            title="ছবিটি অন্য ফাইল দিয়ে পরিবর্তন করুন"
                          >
                            পরিবর্তন
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteArticleImage(img.id)}
                            className="p-1 text-rose-400 hover:bg-rose-950 rounded border border-rose-900/60 transition-colors cursor-pointer"
                            title="ছবিটি মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SEO & METADATA */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-teal-400" />
                  <span>Google সার্চ ফলাফল প্রিভিউ (SERP Snippet Preview)</span>
                </span>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 mt-2 space-y-1">
                  <span className="text-[11px] text-emerald-400 font-mono block">
                    https://sunvilozcleancare.com/blog/{formData.slug || 'article-slug'}
                  </span>
                  <h4 className="text-sm font-semibold text-blue-400 hover:underline cursor-pointer">
                    {formData.seo?.metaTitle || formData.titleBn || 'আর্টিকেল টাইটেল | SUNVILOZ CLEAN CARE'}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {formData.seo?.metaDescription || formData.excerptBn || 'আর্টিকেলের মেটা ডেসক্রিপশন গুগল সার্চে প্রদর্শিত হবে...'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  এসইও মেটা টাইটেল (SEO Meta Title - ৫৫-৬০ অক্ষরের মধ্যে সেরা) *
                </label>
                <input
                  type="text"
                  value={formData.seo?.metaTitle || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    seo: { ...(formData.seo || {}), metaTitle: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  placeholder="পানির ট্যাংক কতদিন পরপর পরিষ্কার করা উচিত? | SUNVILOZ"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  দৈর্ঘ্য: {(formData.seo?.metaTitle || '').length} অক্ষর (প্রস্তাবিত: ৫০-৬০)
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  এসইও মেটা ডেসক্রিপশন (Meta Description - ১২০-১৬০ অক্ষরের মধ্যে) *
                </label>
                <textarea
                  rows={3}
                  value={formData.seo?.metaDescription || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    seo: { ...(formData.seo || {}), metaDescription: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white leading-relaxed"
                  placeholder="পানির ট্যাংক কতদিন পরপর পরিষ্কার করা উচিত? ঢাকার আবহাওয়া ও ওয়াসার পানি বিবেচনায় ছাদের ও আন্ডারগ্রাউন্ড ট্যাংকের আদর্শ ক্লিন শিডিউল জানুন।"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  দৈর্ঘ্য: {(formData.seo?.metaDescription || '').length} অক্ষর (প্রস্তাবিত: ১২০-১৬০)
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  প্রধান টার্গেট কিওয়ার্ড (Primary Keyword)
                </label>
                <input
                  type="text"
                  value={(formData.seo?.keywords || [])[0] || ''}
                  onChange={(e) => {
                    const currentKeys = [...(formData.seo?.keywords || [])];
                    currentKeys[0] = e.target.value;
                    setFormData({
                      ...formData,
                      seo: { ...(formData.seo || {}), keywords: currentKeys }
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-medium"
                  placeholder="যেমন: পানির ট্যাংক কতদিন পরপর পরিষ্কার করা উচিত"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ক্যানোনিকাল ইউআরএল (Canonical URL)
                </label>
                <input
                  type="text"
                  value={formData.seo?.canonicalUrl || `https://sunvilozcleancare.com/blog/${formData.slug || ''}`}
                  onChange={(e) => setFormData({
                    ...formData,
                    seo: { ...(formData.seo || {}), canonicalUrl: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  placeholder="https://sunvilozcleancare.com/blog/..."
                />
              </div>
            </div>
          )}

          {/* TAB 4: LIVE PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4 bg-white text-[#172B3A] p-5 sm:p-7 rounded-2xl border border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="px-2.5 py-0.5 bg-[#E8F5F3] text-[#0D9488] font-bold rounded text-[11px]">
                  {formData.categoryBn || formData.category}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-500">{formData.readTimeBn || formData.readTime}</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-[#123047] leading-snug">
                {formData.titleBn || formData.title || 'শিরোনাম লিখুন'}
              </h1>

              {formData.imageUrl && (
                <div className="rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                  <img src={formData.imageUrl} alt={formData.imageAlt || ''} className="w-full h-full object-cover" />
                </div>
              )}

              {formData.imageCaption && (
                <p className="text-center text-xs text-slate-500 italic">
                  {formData.imageCaption}
                </p>
              )}

              {(formData.excerptBn || formData.excerpt) && (
                <div className="p-3.5 rounded-xl bg-[#E8F5F3] border border-[#0D9488]/30 text-xs sm:text-sm font-medium leading-relaxed text-[#123047]">
                  {formData.excerptBn || formData.excerpt}
                </div>
              )}

              <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed space-y-3 pt-2">
                {(formData.contentBn || formData.content || '').split('\n\n').map((block, bIdx) => {
                  const trimmed = block.trim();
                  if (trimmed.startsWith('## ')) {
                    return <h2 key={bIdx} className="text-lg font-bold text-[#123047] pt-2">{trimmed.replace(/^##\s*/, '')}</h2>;
                  }
                  if (trimmed.startsWith('### ')) {
                    return <h3 key={bIdx} className="text-base font-bold text-[#123047] pt-1">{trimmed.replace(/^###\s*/, '')}</h3>;
                  }
                  return <p key={bIdx} className="text-xs sm:text-sm">{trimmed}</p>;
                })}
              </div>

              {formData.images && formData.images.length > 0 && (
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <h4 className="font-bold text-xs text-[#123047]">প্রজেক্ট গ্যালারি:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {formData.images.map((img, i) => (
                      <div key={i} className="rounded-lg overflow-hidden border border-slate-200 aspect-4/3">
                        <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            {formData.published ? '🟢 আর্টিকেলটি প্রকাশিত অবস্থায় সেভ হবে' : '🟡 আর্টিকেলটি ড্রাফট হিসেবে সেভ হবে'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow transition-colors cursor-pointer active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>আর্টিকেল ও ছবি সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BlogPostModal;
