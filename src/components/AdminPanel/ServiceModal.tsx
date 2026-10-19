import React, { useState, useRef } from 'react';
import { ServiceItem } from '../../types';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Link2, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { CURATED_WATER_TANK_IMAGES } from '../ChangeServiceImageModal';
import { compressImageFile } from '../../utils/imageCompressor';

interface ServiceModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onSave: (service: ServiceItem) => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ service, onClose, onSave }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ServiceItem>(
    service || {
      id: `srv-${Date.now()}`,
      title: '',
      titleBn: '',
      slug: '',
      image: '',
      description: '',
      descriptionBn: '',
      icon: 'Droplets',
      features: ['High-Pressure Jet Wash', 'Sludge & Mud Removal', 'Disinfection'],
      featuresBn: ['হাই-প্রেসার ওয়াশ', 'কাদা ও শেওলা পরিষ্কার', 'জীবাণুমুক্তকরণ'],
      startingPrice: 2000,
      popular: false,
      idealFor: 'Residential Buildings',
      idealForBn: ['আবাসিক ভবন']
    }
  );

  const [featureInput, setFeatureInput] = useState('');
  const [urlInput, setUrlInput] = useState(formData.image || '');
  const [uploadLoading, setUploadLoading] = useState(false);

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setFormData({
      ...formData,
      features: [...(formData.features || []), featureInput.trim()]
    });
    setFeatureInput('');
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: (formData.features || []).filter((_, i) => i !== index)
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP).');
      return;
    }

    setUploadLoading(true);
    try {
      const dataUrl = await compressImageFile(file, {
        maxWidth: 900,
        maxHeight: 650,
        quality: 0.75
      });
      setFormData(prev => ({ ...prev, image: dataUrl }));
      setUrlInput('');
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData(prev => ({ ...prev, image: dataUrl }));
        setUrlInput('');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setFormData(prev => ({ ...prev, image: urlInput.trim() }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">
            {service ? 'Edit Service' : 'Add New Service'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Service Image Section */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>Service Cover Image (সার্ভিস ছবি)</span>
              </label>
              {formData.image && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, image: '' });
                    setUrlInput('');
                  }}
                  className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Image</span>
                </button>
              )}
            </div>

            {/* Current Image Preview */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
              {formData.image ? (
                <img
                  src={formData.image}
                  alt={formData.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-1.5">
                  <ImageIcon className="w-6 h-6 text-slate-600" />
                  <span>No image selected yet</span>
                </div>
              )}
              {uploadLoading && (
                <div className="absolute inset-0 bg-black/75 flex items-center justify-center gap-2 text-white">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                  <span>Reading file...</span>
                </div>
              )}
            </div>

            {/* Upload from Device */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>Upload from Device</span>
              </button>
            </div>

            {/* Enter URL */}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Or paste direct image URL (https://...)"
                className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-semibold"
              >
                Apply
              </button>
            </div>

            {/* Curated Presets */}
            <div className="pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Quick Curated Presets:</span>
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {CURATED_WATER_TANK_IMAGES.slice(0, 4).map((curated) => (
                  <button
                    key={curated.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, image: curated.url });
                      setUrlInput(curated.url);
                    }}
                    className={`relative aspect-video rounded overflow-hidden border text-left cursor-pointer ${
                      formData.image === curated.url ? 'border-blue-400 ring-2 ring-blue-500' : 'border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={curated.url} alt={curated.titleEn} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Title (English) *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                placeholder="Rooftop Overhead Tank Cleaning"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Title (Bengali) *</label>
              <input
                type="text"
                value={formData.titleBn}
                onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                placeholder="ছাদের ওভারহেড পানির ট্যাংক ক্লিনিং"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Starting Price (৳)</label>
              <input
                type="number"
                value={formData.startingPrice}
                onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">URL Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                placeholder="rooftop-tank-cleaning"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description (English)</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description (Bengali)</label>
            <textarea
              rows={2}
              value={formData.descriptionBn}
              onChange={(e) => setFormData({ ...formData, descriptionBn: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
            />
          </div>

          {/* Features */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Service Features</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="Add a key feature"
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs"
              >
                Add
              </button>
            </div>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {(formData.features || []).map((f, i) => (
                <div key={i} className="flex items-center justify-between p-1.5 bg-slate-950 rounded border border-slate-800 text-[11px]">
                  <span className="text-slate-300">{f}</span>
                  <button type="button" onClick={() => removeFeature(i)} className="text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="popular"
              checked={formData.popular}
              onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
              className="rounded bg-slate-950 border-slate-700"
            />
            <label htmlFor="popular" className="text-slate-300 cursor-pointer">Mark as Popular Service badge</label>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs">
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Service</span>
          </button>
        </div>
      </div>
    </div>
  );
};
