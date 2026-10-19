import React, { useState, useRef } from 'react';
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
  Camera
} from 'lucide-react';
import { ServiceItem } from '../types';
import { updateService } from '../utils/servicesStore';
import { useLanguage } from '../context/LanguageContext';
import { compressImageFile } from '../utils/imageCompressor';

export interface ChangeServiceImageModalProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onImageUpdated?: (serviceId: string, newImageUrl: string) => void;
}

// Curated high-resolution, realistic water-tank cleaning stock images
export const CURATED_WATER_TANK_IMAGES = [
  {
    id: 'rooftop-tank-1',
    titleBn: 'ছাদের পিভিসি ও আরসিসি ট্যাংক',
    titleEn: 'Rooftop PVC & Concrete Tank',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80',
    description: 'Clean rooftop water storage tank under clear sky'
  },
  {
    id: 'underground-wash-1',
    titleBn: 'আন্ডারগ্রাউন্ড রিজার্ভার মেকানাইজড ডিপ ক্লিন',
    titleEn: 'Underground Reservoir Deep Wash',
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
    description: 'Professional high-pressure industrial pressure cleaning'
  },
  {
    id: 'crystal-water-1',
    titleBn: 'স্বচ্ছ ও বিশুদ্ধ পানি স্টোরেজ (Both Tanks)',
    titleEn: 'Pure Crystal Stored Water',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80',
    description: 'Spotless hygienic drinking water reservoir'
  },
  {
    id: 'pressure-jet-1',
    titleBn: 'হাই-প্রেসার ওয়াটার জেট ফ্লাশিং',
    titleEn: 'High-Pressure Rotary Jet Wash',
    url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80',
    description: 'Industrial high-pressure descaling hose & rotary jet'
  },
  {
    id: 'clean-faucet-1',
    titleBn: 'স্বচ্ছ পানির ট্যাপ ও পাইপলাইন',
    titleEn: 'Pure Clear Tap Water Flow',
    url: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=1200&q=80',
    description: 'Crystal-clear domestic tap water discharge'
  },
  {
    id: 'sanitized-tank-1',
    titleBn: 'ফুড-গ্রেড জীবাণুমুক্ত ওয়াটার ট্যাংক',
    titleEn: 'Sanitized Drinking Water Tank',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    description: 'Hygienic spotless tank interior with sparkling water'
  },
  {
    id: 'plumbing-lines-1',
    titleBn: 'পাইপলাইন আয়রন ও মরিচা ক্লিন',
    titleEn: 'Plumbing Pipeline Descaling',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    description: 'Heavy distribution pipeline maintenance'
  },
  {
    id: 'fresh-water-flow-1',
    titleBn: 'বিশুদ্ধ পানির ঘূর্ণি ও ওয়েভ',
    titleEn: 'Pure Flowing Fresh Water',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    description: 'Hygienic fresh drinking water supply'
  }
];

export const ChangeServiceImageModal: React.FC<ChangeServiceImageModalProps> = ({
  service,
  isOpen,
  onClose,
  onImageUpdated
}) => {
  const { lang } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState<string>(service?.image || '');
  const [urlInput, setUrlInput] = useState<string>('');
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Sync with service prop
  React.useEffect(() => {
    if (service) {
      setImageUrl(service.image || '');
      setUrlInput(service.image || '');
      setErrorMessage('');
      setSaveSuccess(false);
    }
  }, [service, isOpen]);

  if (!isOpen || !service) return null;

  // Handle local file upload (converts to lightweight compressed data URL)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(lang === 'bn' ? 'অনুগ্রহ করে একটি সঠিক ছবির ফাইল নির্বাচন করুন (JPG, PNG, WebP)' : 'Please select a valid image file (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage(lang === 'bn' ? 'ছবির সাইজ ২০ মেগাবাইটের কম হতে হবে' : 'Image size must be less than 20MB');
      return;
    }

    setUploadLoading(true);
    setErrorMessage('');

    try {
      const compressedDataUrl = await compressImageFile(file, {
        maxWidth: 1000,
        maxHeight: 750,
        quality: 0.72
      });
      setImageUrl(compressedDataUrl);
      setUrlInput('');
    } catch (err) {
      console.error('Image compression failed:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImageUrl(result);
        setUrlInput('');
      };
      reader.onerror = () => {
        setErrorMessage(lang === 'bn' ? 'ছবি পড়তে সমস্যা হয়েছে, আবার চেষ্টা করুন' : 'Failed to read image file');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadLoading(false);
    }
  };

  // Apply custom URL
  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setErrorMessage(lang === 'bn' ? 'অনুগ্রহ করে একটি বৈধ ইমেজ URL দিন' : 'Please provide a valid image URL');
      return;
    }
    setImageUrl(urlInput.trim());
    setErrorMessage('');
  };

  // Save the selected image
  const handleSave = () => {
    if (!imageUrl) {
      setErrorMessage(lang === 'bn' ? 'কোনো ছবি নির্বাচন করা হয়নি' : 'No image selected');
      return;
    }

    try {
      // Update service in localStorage & broadcast event
      updateService(service.id, { image: imageUrl });

      setSaveSuccess(true);
      if (onImageUpdated) {
        onImageUpdated(service.id, imageUrl);
      }

      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 500);
    } catch (err) {
      console.error('Failed to save service image:', err);
      setErrorMessage(lang === 'bn' ? 'ছবি সংরক্ষণ করতে সমস্যা হয়েছে' : 'Failed to save image');
    }
  };

  const serviceTitle = lang === 'bn' ? (service.titleBn || service.title) : service.title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#08162A] border border-cyan-500/30 rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-950/80 p-5 sm:p-7 space-y-5 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {lang === 'bn' ? 'সার্ভিসের ছবি পরিবর্তন করুন' : 'Change Service Image'}
              </h3>
              <p className="text-xs text-cyan-300 font-medium">
                {serviceTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-cyan-950/50 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{lang === 'bn' ? 'ছবি সফলভাবে আপডেট করা হয়েছে!' : 'Service image updated successfully!'}</span>
          </div>
        )}

        {/* Live Preview of Current / Selected Image */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            {lang === 'bn' ? 'বর্তমান প্রিভিউ (16:9 রেশিও):' : 'Current Preview (16:9 Aspect Ratio):'}
          </label>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-[#040D1A] border border-cyan-800/60 shadow-inner group">
            {imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt={serviceTitle}
                  className="w-full h-full object-cover transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2.5 left-3 right-3 text-xs text-white font-medium flex items-center justify-between">
                  <span className="truncate">{serviceTitle}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/30 border border-cyan-400/40 text-cyan-200">
                    Active Preview
                  </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <ImageIcon className="w-8 h-8 text-slate-600" />
                <span>{lang === 'bn' ? 'কোনো ছবি নির্বাচন করা হয়নি' : 'No image selected'}</span>
              </div>
            )}

            {uploadLoading && (
              <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 text-white text-xs">
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                <span>{lang === 'bn' ? 'ছবি প্রসেস হচ্ছে...' : 'Processing image...'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Option 1: Upload from Device */}
        <div className="p-4 bg-[#06152B] rounded-xl border border-cyan-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'bn' ? '১. কম্পিউটার বা মোবাইল থেকে আপলোড করুন' : '1. Upload from Device'}</span>
            </span>
            <span className="text-[11px] text-slate-400">JPG, PNG, WebP (Max 10MB)</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-950/60 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ডিভাইস থেকে ছবি ফাইল বেছে নিন' : 'Choose Image File from Computer/Phone'}</span>
          </button>
        </div>

        {/* Option 2: Direct Image URL */}
        <div className="p-4 bg-[#06152B] rounded-xl border border-cyan-900/60 space-y-3">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'bn' ? '২. অনলাইন ছবির সরাসরি লিঙ্ক (URL) দিন' : '2. Enter Direct Image URL'}</span>
          </span>

          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 px-3 py-2 rounded-xl bg-[#040D1A] border border-cyan-900/80 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-colors cursor-pointer"
            >
              {lang === 'bn' ? 'প্রয়োগ করুন' : 'Apply'}
            </button>
          </div>
        </div>

        {/* Option 3: Curated Gallery of Realistic Tank Cleaning Stock Images */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{lang === 'bn' ? '৩. এক ক্লিকে সেরা প্রফেশনাল ছবি বাছাই করুন:' : '3. Pick from Curated Tank Cleaning Stock:'}</span>
            </span>
            <span className="text-[11px] text-slate-400">
              {CURATED_WATER_TANK_IMAGES.length} {lang === 'bn' ? 'টি ছবি' : 'Photos'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CURATED_WATER_TANK_IMAGES.map((img) => {
              const isSelected = imageUrl === img.url;
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => {
                    setImageUrl(img.url);
                    setUrlInput(img.url);
                    setErrorMessage('');
                  }}
                  className={`group relative aspect-video rounded-xl overflow-hidden border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-md shadow-cyan-500/30'
                      : 'border-cyan-900/50 hover:border-cyan-500/60 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-1.5 left-2 right-2 text-[10px] font-semibold text-white leading-tight">
                    <span className="line-clamp-1">{lang === 'bn' ? img.titleBn : img.titleEn}</span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-cyan-400 text-[#040D1A] flex items-center justify-center font-bold">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-cyan-900/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-cyan-950/40 transition-colors cursor-pointer"
          >
            {lang === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={uploadLoading || saveSuccess}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ছবি পরিবর্তন সংরক্ষণ করুন' : 'Save & Update Image'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ChangeServiceImageModal;
