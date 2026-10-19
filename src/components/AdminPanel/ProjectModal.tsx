import React, { useState, useRef } from 'react';
import { ProjectItem } from '../../types';
import { X, Save, Upload, Image as ImageIcon, Sparkles, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { CURATED_CLEANING_GALLERY } from '../UniversalImageChangeModal';
import { compressImageFile } from '../../utils/imageCompressor';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onSave: (project: ProjectItem) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, onSave }) => {
  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProjectItem>(
    project || {
      id: `proj-${Date.now()}`,
      title: '',
      titleBn: '',
      category: 'Rooftop',
      location: 'Bashundhara, Dhaka',
      locationBn: 'বসুন্ধরা, ঢাকা',
      capacity: '3,000 Liters',
      beforeImage: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=75',
      afterImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=75',
      description: '',
      descriptionBn: '',
      completedDate: '2026-09-15'
    }
  );

  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [showCuratedBefore, setShowCuratedBefore] = useState(false);
  const [showCuratedAfter, setShowCuratedAfter] = useState(false);

  const handleBeforeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে একটি ছবি ফাইল সিলেক্ট করুন');
      return;
    }

    setUploadingBefore(true);
    try {
      const dataUrl = await compressImageFile(file, {
        maxWidth: 900,
        maxHeight: 650,
        quality: 0.75
      });
      setFormData(prev => ({
        ...prev,
        beforeImage: dataUrl,
        beforeImg: dataUrl
      }));
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          beforeImage: dataUrl,
          beforeImg: dataUrl
        }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingBefore(false);
      if (beforeFileInputRef.current) beforeFileInputRef.current.value = '';
    }
  };

  const handleAfterFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে একটি ছবি ফাইল সিলেক্ট করুন');
      return;
    }

    setUploadingAfter(true);
    try {
      const dataUrl = await compressImageFile(file, {
        maxWidth: 900,
        maxHeight: 650,
        quality: 0.75
      });
      setFormData(prev => ({
        ...prev,
        afterImage: dataUrl,
        afterImg: dataUrl
      }));
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          afterImage: dataUrl,
          afterImg: dataUrl
        }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingAfter(false);
      if (afterFileInputRef.current) afterFileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('অনুগ্রহ করে প্রজেক্টের নাম (Title) দিন');
      return;
    }

    // Ensure both beforeImg/beforeImage and afterImg/afterImage are set
    const finalData: ProjectItem = {
      ...formData,
      beforeImage: formData.beforeImage || formData.beforeImg || '',
      beforeImg: formData.beforeImage || formData.beforeImg || '',
      afterImage: formData.afterImage || formData.afterImg || '',
      afterImg: formData.afterImage || formData.afterImg || ''
    };

    onSave(finalData);
  };

  const beforeSrc = formData.beforeImage || formData.beforeImg || '';
  const afterSrc = formData.afterImage || formData.afterImg || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">
              {project ? 'Edit Before/After Project' : 'Add New Before/After Project'}
            </h3>
            <p className="text-xs text-slate-400">ক্লিনিং প্রজেক্টের তথ্য ও বিফোর/আফটার ছবি পরিচালনা করুন</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">প্রজেক্ট টাইটেল (Title - English &amp; Bengali)</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white mb-2"
              placeholder="Rooftop PVC Overhead Tank Cleaning in Gulshan"
            />
            <input
              type="text"
              value={formData.titleBn || ''}
              onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              placeholder="বাংলা নাম (ঐচ্ছিক): গুলশানে ছাদের পিভিসি ট্যাংক ডিপ ক্লিন"
            />
          </div>

          {/* Location & Capacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">অবস্থান (Location)</label>
              <input
                type="text"
                value={formData.location || formData.area || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value, area: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                placeholder="Bashundhara R/A, Block C"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ক্যাপাসিটি (Capacity)</label>
              <input
                type="text"
                value={formData.capacity || ''}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                placeholder="1,500 Liters"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">ক্যাটাগরি (Category)</label>
            <select
              value={formData.category || 'Rooftop'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
            >
              <option value="Rooftop">Rooftop Overhead Tank (ছাদের ট্যাংক)</option>
              <option value="Underground">Underground Reserve Tank (মাটির নিচের ট্যাংক)</option>
              <option value="Apartment">Apartment Multi-Tank (অ্যাপার্টমেন্ট ভবন)</option>
              <option value="Pipeline">Water Pipeline (পানির পাইপলাইন)</option>
              <option value="Commercial">Commercial Facility (বাণিজ্যিক প্রতিষ্ঠান)</option>
            </select>
          </div>

          {/* BEFORE IMAGE SECTION */}
          <div className="p-3 bg-slate-950 rounded-xl border border-red-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>পূর্বে (Before Cleaning) ছবি</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCuratedBefore(!showCuratedBefore)}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>গ্যালারি থেকে নিন</span>
                </button>
                <button
                  type="button"
                  onClick={() => beforeFileInputRef.current?.click()}
                  className="px-2 py-1 bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-800 rounded text-[11px] font-semibold flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  <span>আপলোড করুন</span>
                </button>
              </div>
            </div>

            <input
              ref={beforeFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBeforeFileUpload}
            />

            {showCuratedBefore && (
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 max-h-32 overflow-y-auto">
                {CURATED_CLEANING_GALLERY.map((cg) => (
                  <div
                    key={cg.id}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, beforeImage: cg.url, beforeImg: cg.url }));
                      setShowCuratedBefore(false);
                    }}
                    className="relative aspect-video rounded overflow-hidden border border-slate-700 hover:border-red-400 cursor-pointer"
                  >
                    <img src={cg.url} alt={cg.titleBn} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 items-center">
              <div className="w-20 h-14 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                {beforeSrc ? (
                  <img src={beforeSrc} alt="Before" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-slate-600" />
                )}
              </div>
              <input
                type="text"
                value={beforeSrc}
                onChange={(e) => setFormData({ ...formData, beforeImage: e.target.value, beforeImg: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono"
                placeholder="https://... অথবা আপলোড করুন"
              />
            </div>
            {uploadingBefore && <span className="text-[11px] text-red-400 animate-pulse">ছবি আপলোড হচ্ছে...</span>}
          </div>

          {/* AFTER IMAGE SECTION */}
          <div className="p-3 bg-slate-950 rounded-xl border border-emerald-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>পরে (After Cleaning) ছবি</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCuratedAfter(!showCuratedAfter)}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>গ্যালারি থেকে নিন</span>
                </button>
                <button
                  type="button"
                  onClick={() => afterFileInputRef.current?.click()}
                  className="px-2 py-1 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 rounded text-[11px] font-semibold flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  <span>আপলোড করুন</span>
                </button>
              </div>
            </div>

            <input
              ref={afterFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAfterFileUpload}
            />

            {showCuratedAfter && (
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 max-h-32 overflow-y-auto">
                {CURATED_CLEANING_GALLERY.map((cg) => (
                  <div
                    key={cg.id}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, afterImage: cg.url, afterImg: cg.url }));
                      setShowCuratedAfter(false);
                    }}
                    className="relative aspect-video rounded overflow-hidden border border-slate-700 hover:border-emerald-400 cursor-pointer"
                  >
                    <img src={cg.url} alt={cg.titleBn} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 items-center">
              <div className="w-20 h-14 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                {afterSrc ? (
                  <img src={afterSrc} alt="After" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-slate-600" />
                )}
              </div>
              <input
                type="text"
                value={afterSrc}
                onChange={(e) => setFormData({ ...formData, afterImage: e.target.value, afterImg: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono"
                placeholder="https://... অথবা আপলোড করুন"
              />
            </div>
            {uploadingAfter && <span className="text-[11px] text-emerald-400 animate-pulse">ছবি আপলোড হচ্ছে...</span>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">ক্লিনিং বিবরণী (Description / Summary)</label>
            <textarea
              rows={2}
              value={formData.description || formData.summary || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value, summary: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white mb-2"
              placeholder="১৮ মাস জমে থাকা শক্ত শ্যাওলা ও বালুর আস্তরণ দূর করে রোটারি জেটে জীবাণুমুক্ত করা হয়েছে।"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700">
            বাতিল (Cancel)
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow"
          >
            <Save className="w-3.5 h-3.5" />
            <span>প্রজেক্ট ও ছবি সেভ করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
