import React, { useState, useRef } from 'react';
import { BlogPost } from '../../types/blog';
import { X, Save, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { compressImageFile } from '../../utils/imageCompressor';

interface BlogPostModalProps {
  post: BlogPost | null;
  onClose: () => void;
  onSave: (post: BlogPost) => void;
}

export const BlogPostModal: React.FC<BlogPostModalProps> = ({ post, onClose, onSave }) => {
  const [formData, setFormData] = useState<BlogPost>(
    post || {
      id: `post-${Date.now()}`,
      slug: '',
      category: 'Water Hygiene',
      title: '',
      titleBn: '',
      excerpt: '',
      excerptBn: '',
      content: '',
      contentBn: '',
      imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=75',
      author: 'Sunviloz Tech Team',
      publishedAt: new Date().toISOString().slice(0, 10),
      readTime: '4 min read',
      published: true,
      seo: {
        metaTitle: '',
        metaDescription: ''
      }
    }
  );

  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    setUploadingImage(true);
    setErrorMessage('');

    try {
      const compressedDataUrl = await compressImageFile(file, {
        maxWidth: 900,
        maxHeight: 600,
        quality: 0.75
      });
      setFormData(prev => ({ ...prev, imageUrl: compressedDataUrl }));
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, imageUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = () => {
    if (!formData.title.trim() && !formData.titleBn?.trim()) {
      setErrorMessage('Please enter an Article Title.');
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
    if (!finalSlug) {
      finalSlug = `article-${Date.now().toString(36)}`;
    }

    const payload: BlogPost = {
      ...formData,
      slug: finalSlug,
      title: formData.title.trim() || formData.titleBn?.trim() || 'Untitled Article',
      titleBn: formData.titleBn?.trim() || formData.title.trim(),
      excerpt: formData.excerpt || formData.excerptBn || '',
      content: formData.content || formData.contentBn || '',
      contentBn: formData.contentBn || formData.content || '',
      publishedAt: formData.publishedAt || new Date().toISOString().slice(0, 10)
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">
            {post ? 'Edit Article' : 'Write New Article'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Title (English)</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              placeholder="Why Rooftop Water Tanks Need Cleaning Every 6 Months"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Title (Bengali)</label>
            <input
              type="text"
              value={formData.titleBn || ''}
              onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              placeholder="ছাদের পানির ট্যাংক কেন প্রতি ৬ মাসে পরিষ্কার করা জরুরি?"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Slug (URL Path)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                placeholder="why-clean-tank-every-6-months"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                placeholder="Water Hygiene / Cleaning Tips"
              />
            </div>
          </div>

          {/* Image Upload & URL */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <label className="block text-slate-300 font-medium">Article Cover Image</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.imageUrl || ''}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                placeholder="https://... or upload below"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingImage ? 'Uploading...' : 'Browse Image'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {formData.imageUrl && (
              <div className="w-32 h-20 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 relative mt-1">
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Excerpt / Summary</label>
            <textarea
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              placeholder="Brief summary of the article displayed on blog cards..."
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Full Article Content</label>
            <textarea
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
              placeholder="Detailed article explanation, instructions, precautions..."
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Article</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogPostModal;
