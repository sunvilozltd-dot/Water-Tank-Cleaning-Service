import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Link2, 
  Check, 
  Sparkles, 
  AlertCircle,
  Trash2,
  RefreshCw,
  FolderOpen,
  Eye,
  Camera
} from 'lucide-react';
import { getMediaItems } from '../services/mediaService';
import { MediaItem } from '../types/media';
import { compressImageFile } from '../utils/imageCompressor';

export interface UniversalImageChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleBn?: string;
  subtitle?: string;
  currentImageUrl: string;
  defaultImageUrl?: string;
  onSave: (newImageUrl: string) => void;
}

export const CURATED_CLEANING_GALLERY = [
  {
    id: 'team-modern-equipment',
    titleBn: 'পেশাদার ক্লিনিং টিম ও আধুনিক সরঞ্জাম',
    titleEn: 'Professional Cleaning Team with Modern Equipment',
    category: 'Team & Equipment',
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
    description: 'Technicians with high-pressure gear and safety uniforms'
  },
  {
    id: 'rooftop-pvc-clean',
    titleBn: 'ছাদের ওভারহেড পিভিসি ও আরসিসি ট্যাংক',
    titleEn: 'Rooftop PVC & Concrete Overhead Tank',
    category: 'Rooftop Tanks',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80',
    description: 'Clean rooftop water storage tank on apartment roof'
  },
  {
    id: 'underground-reservoir-deep',
    titleBn: 'আন্ডারগ্রাউন্ড রিজার্ভার মেকানাইজড ডিপ ক্লিন',
    titleEn: 'Underground Reservoir Deep Sludge Extraction',
    category: 'Underground Reserve',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    description: 'Industrial pump sludge extraction and floor scoured'
  },
  {
    id: 'rotary-pressure-jet',
    titleBn: '১৫০-বার হাই-প্রেসার রোটারি জেট ওয়াশ',
    titleEn: '150-Bar Rotary High-Pressure Jet Wash',
    category: 'Jet Wash',
    url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80',
    description: 'Rotary nozzle blasting stubborn algae biofilm'
  },
  {
    id: 'sanitized-spotless-tank',
    titleBn: 'জীবাণুমুক্ত স্ফটিক স্বচ্ছ পানির ট্যাংক',
    titleEn: 'Sanitized Spotless Interior Water Tank',
    category: 'Sanitization',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    description: 'Pristine, sterilized walls and floor ready for fresh water'
  },
  {
    id: 'pure-crystal-water',
    titleBn: 'স্ফটিক স্বচ্ছ পানযোগ্য বিশুদ্ধ পানি',
    titleEn: 'Crystal Clear Pure Safe Drinking Water',
    category: 'Clean Water',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80',
    description: 'Fresh flowing safe water free from iron & dirt'
  },
  {
    id: 'pipeline-descaling-lines',
    titleBn: 'পানির পাইপলাইন আয়রন ও মরিচা ক্লিন',
    titleEn: 'Plumbing Pipeline Descaling & Hydro Flushing',
    category: 'Pipelines',
    url: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=1200&q=80',
    description: 'Internal water pipe hydro flushing'
  },
  {
    id: 'dirty-tank-before',
    titleBn: 'পূর্বে: ভারী শ্যাওলা ও ঘন কাদার আস্তরণ',
    titleEn: 'Before: Thick Mud Sludge & Biofilm Accumulation',
    category: 'Before Cleaning',
    url: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=1200&q=80',
    description: 'Uncleaned water tank with brown silt and algae'
  }
];

export const UniversalImageChangeModal: React.FC<UniversalImageChangeModalProps> = ({
  isOpen,
  onClose,
  title,
  titleBn,
  subtitle,
  currentImageUrl,
  defaultImageUrl,
  onSave
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'curated' | 'url' | 'media'>('upload');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(currentImageUrl || '');
  const [urlInput, setUrlInput] = useState<string>('');
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    setSelectedImageUrl(currentImageUrl || '');
    setUrlInput('');
    setSaveSuccess(false);
    setErrorMessage('');
  }, [currentImageUrl, isOpen]);

  useEffect(() => {
    if (activeTab === 'media') {
      loadMedia();
    }
  }, [activeTab]);

  const loadMedia = async () => {
    try {
      setLoadingMedia(true);
      const items = await getMediaItems();
      setMediaItems(items.filter(i => i.fileType === 'image'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMedia(false);
    }
  };

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('অনুগ্রহ করে একটি ছবি ফাইল আপলোড করুন (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('ছবির সাইজ ২০ মেগাবাইটের কম হতে হবে');
      return;
    }

    setUploadLoading(true);
    setErrorMessage('');

    try {
      // Compress and resize image client-side to prevent QuotaExceededError
      const compressedDataUrl = await compressImageFile(file, {
        maxWidth: 1000,
        maxHeight: 750,
        quality: 0.72
      });
      setSelectedImageUrl(compressedDataUrl);
    } catch (err: any) {
      console.error('Image compression failed:', err);
      // Fallback to FileReader if canvas compression encounters issues
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImageUrl(event.target?.result as string);
      };
      reader.onerror = () => {
        setErrorMessage('ছবি লোড করতে সমস্যা হয়েছে');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://') && !urlInput.startsWith('/')) {
      setErrorMessage('সঠিক ইমেজ URL দিন (https://...)');
      return;
    }
    setSelectedImageUrl(urlInput.trim());
    setErrorMessage('');
  };

  const handleSave = () => {
    if (!selectedImageUrl) {
      setErrorMessage('একটি ছবি নির্বাচন বা আপলোড করুন');
      return;
    }

    try {
      onSave(selectedImageUrl);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('Save image failed:', err);
      setErrorMessage('ছবি সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  const handleRestoreDefault = () => {
    if (defaultImageUrl) {
      setSelectedImageUrl(defaultImageUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="universal-image-modal-title"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <h3 id="universal-image-modal-title" className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              <span>{title}</span>
            </h3>
            {titleBn && (
              <p className="text-xs text-cyan-400 mt-0.5">{titleBn}</p>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Current vs Selected Image Preview */}
          <div className="bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>লাইভ প্রিভিউ (Selected Image Preview)</span>
              </span>
              {defaultImageUrl && selectedImageUrl !== defaultImageUrl && (
                <button
                  type="button"
                  onClick={handleRestoreDefault}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>ডিফল্ট ছবি ফিরিয়ে আনুন</span>
                </button>
              )}
            </div>

            <div className="relative aspect-video max-h-56 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
              {selectedImageUrl ? (
                <img 
                  src={selectedImageUrl} 
                  alt="Selected preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-slate-500">
                  <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">কোনো ছবি নির্বাচন করা হয়নি</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabs: Upload / Curated / Direct URL / Media */}
          <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'upload' 
                  ? 'bg-cyan-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>ডিভাইস থেকে আপলোড</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('curated')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'curated' 
                  ? 'bg-cyan-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>প্রস্তাবিত ক্লিন গ্যালারি</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'url' 
                  ? 'bg-cyan-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>ইমেজ লিংক (URL)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'media' 
                  ? 'bg-cyan-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>মিডিয়া লাইব্রেরি</span>
            </button>
          </div>

          {/* TAB 1: File Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40 hover:bg-cyan-950/10 group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-cyan-900/40 flex items-center justify-center mx-auto mb-3 transition-colors">
                  <Upload className="w-6 h-6 text-cyan-400" />
                </div>
                <p className="text-sm font-semibold text-white">
                  ছবি আপলোড করতে এখানে ক্লিক করুন
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  JPG, PNG, WebP ফরম্যাট সাপোর্ট করে (সর্বোচ্চ ১০ MB)
                </p>
                {uploadLoading && (
                  <div className="mt-3 inline-flex items-center gap-2 text-xs text-cyan-400 font-semibold">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>ছবি প্রস্তুত হচ্ছে...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Curated Cleaning Gallery */}
          {activeTab === 'curated' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400">
                নিচে থেকে আপনার পছন্দের ওয়াটার ট্যাংক ও পাইপলাইন ক্লিনিং ছবি সিলেক্ট করুন:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto p-1">
                {CURATED_CLEANING_GALLERY.map((item) => {
                  const isSelected = selectedImageUrl === item.url;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedImageUrl(item.url)}
                      className={`relative rounded-lg overflow-hidden border cursor-pointer group transition-all aspect-video ${
                        isSelected 
                          ? 'border-cyan-400 ring-2 ring-cyan-500/50' 
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <img 
                        src={item.url} 
                        alt={item.titleBn} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                        <span className="text-[10px] text-white font-medium truncate">
                          {item.titleBn}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Direct URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                অনলাইন ইমেজের সরাসরি লিঙ্ক (Direct Image URL):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
                >
                  প্রিভিউ দেখুন
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Media Library */}
          {activeTab === 'media' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400">
                মিডিয়া লাইব্রেরিতে পূর্বে আপলোড করা ছবিসমূহ:
              </p>
              {loadingMedia ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                  <span>মিডিয়া লোড হচ্ছে...</span>
                </div>
              ) : mediaItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  <span>মিডিয়া লাইব্রেরিতে কোনো ছবি পাওয়া যায়নি। "ডিভাইস থেকে আপলোড" ব্যবহার করুন।</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto p-1">
                  {mediaItems.map((item) => {
                    const isSelected = selectedImageUrl === item.storagePath;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedImageUrl(item.storagePath || '')}
                        className={`relative rounded-lg overflow-hidden border cursor-pointer group transition-all aspect-video ${
                          isSelected 
                            ? 'border-cyan-400 ring-2 ring-cyan-500/50' 
                            : 'border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <img 
                          src={item.storagePath} 
                          alt={item.fileName} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                          <span className="text-[10px] text-white font-medium truncate">
                            {item.fileName}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            বাতিল (Cancel)
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedImageUrl}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
              saveSuccess 
                ? 'bg-emerald-600 text-white' 
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>পরিবর্তন সেভ হয়েছে!</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>ছবি পরিবর্তন নিশ্চিত করুন (Save &amp; Apply)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
