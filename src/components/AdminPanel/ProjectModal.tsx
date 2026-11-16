import React, { useState, useRef } from 'react';
import { ProjectItem } from '../../types';
import { X, Save, Upload, Image as ImageIcon, AlertTriangle, ShieldCheck, Globe } from 'lucide-react';
import { compressImageFile } from '../../utils/imageCompressor';
import { uploadImageToSupabase, persistImageChange } from '../../services/imageSyncService';
import { slugifyCaseStudy } from '../../utils/portfolioStore';
import { LOCATIONS_DATA } from '../../data/locationsData';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onSave: (project: ProjectItem) => void;
}

const SERVICE_SLUG_OPTIONS = [
  { slug: 'water-tank-cleaning', label: 'Water Tank Cleaning (/services/water-tank-cleaning)' },
  { slug: 'overhead-tank-cleaning', label: 'Overhead Tank Cleaning (/services/overhead-tank-cleaning)' },
  { slug: 'underground-water-tank-cleaning', label: 'Underground Tank Cleaning (/services/underground-water-tank-cleaning)' },
  { slug: 'pipeline-cleaning', label: 'Pipeline Cleaning (/services/pipeline-cleaning)' }
];

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, onSave }) => {
  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProjectItem>(
    project || {
      id: `proj-${Date.now()}`,
      slug: '',
      title: '',
      titleBn: '',
      category: 'Rooftop',
      area: 'Dhaka',
      areaSlug: 'dhaka',
      location: 'Dhaka',
      locationBn: 'ঢাকা',
      tankType: 'PVC Overhead Tank',
      capacity: '',
      duration: '',
      serviceDate: new Date().toISOString().split('T')[0],
      completedDate: new Date().toISOString().split('T')[0],
      beforeImage: '',
      afterImage: '',
      beforeImg: '',
      afterImg: '',
      beforeCaption: '',
      beforeCaptionBn: '',
      afterCaption: '',
      afterCaptionBn: '',
      description: '',
      descriptionBn: '',
      customerProblem: '',
      customerProblemBn: '',
      workDone: '',
      workDoneBn: '',
      actualResult: '',
      actualResultBn: '',
      relatedServiceSlug: 'water-tank-cleaning',
      featured: false,
      status: 'draft',
      customerConsentGranted: false,
      metaTitle: '',
      metaDescription: '',
      sourceType: 'company_work'
    }
  );

  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const handleBeforeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationError('অনুগ্রহ করে একটি সঠিক ছবি ফাইল সিলেক্ট করুন।');
      return;
    }

    setUploadingBefore(true);
    setValidationError('');
    try {
      const uploadRes = await uploadImageToSupabase(file, 'projects', `${formData.id}_before`);
      let targetUrl = '';
      if (uploadRes.success && uploadRes.publicUrl) {
        targetUrl = uploadRes.publicUrl;
      } else {
        targetUrl = await compressImageFile(file, {
          maxWidth: 900,
          maxHeight: 650,
          quality: 0.78
        });
      }
      setFormData(prev => ({ ...prev, beforeImage: targetUrl, beforeImg: targetUrl }));
    } catch {
      setValidationError('Before ছবি আপলোড ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setUploadingBefore(false);
      if (beforeFileInputRef.current) beforeFileInputRef.current.value = '';
    }
  };

  const handleAfterFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationError('অনুগ্রহ করে একটি সঠিক ছবি ফাইল সিলেক্ট করুন।');
      return;
    }

    setUploadingAfter(true);
    setValidationError('');
    try {
      const uploadRes = await uploadImageToSupabase(file, 'projects', `${formData.id}_after`);
      let targetUrl = '';
      if (uploadRes.success && uploadRes.publicUrl) {
        targetUrl = uploadRes.publicUrl;
      } else {
        targetUrl = await compressImageFile(file, {
          maxWidth: 900,
          maxHeight: 650,
          quality: 0.78
        });
      }
      setFormData(prev => ({ ...prev, afterImage: targetUrl, afterImg: targetUrl }));
    } catch {
      setValidationError('After ছবি আপলোড ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setUploadingAfter(false);
      if (afterFileInputRef.current) afterFileInputRef.current.value = '';
    }
  };

  const beforeSrc = formData.beforeImage || formData.beforeImg || '';
  const afterSrc = formData.afterImage || formData.afterImg || '';

  const handleSave = async () => {
    setValidationError('');

    if (!formData.title.trim()) {
      setValidationError('অনুগ্রহ করে কেস স্টাডির নাম (English Title) দিন।');
      return;
    }

    const cleanSlug = slugifyCaseStudy(formData.slug || formData.title, formData.id);
    const isPublishing = formData.status === 'published';

    if (isPublishing) {
      if (formData.customerConsentGranted !== true) {
        setValidationError(
          'গ্রাহকের সম্মতি (Customer Consent) নিশ্চিত না করে কেস স্টাডি Publish করা যাবে না। অনুগ্রহ করে Draft হিসেবে সংরক্ষণ করুন অথবা সম্মতি নিশ্চিত করুন।'
        );
        return;
      }
      if (!beforeSrc.trim() || !afterSrc.trim()) {
        setValidationError('পাবলিশ করার আগে বাস্তব Before ও After দুটি ছবিই সংযুক্ত করুন।');
        return;
      }
      if (!formData.area?.trim() && !formData.location?.trim()) {
        setValidationError('পাবলিশ করার আগে কাজের এলাকা (Area) উল্লেখ করুন।');
        return;
      }
      if (
        !(formData.workDoneBn?.trim() || formData.workDone?.trim() || formData.descriptionBn?.trim() || formData.description?.trim())
      ) {
        setValidationError('পাবলিশ করার আগে বাস্তব কাজের বিবরণ (Work Done / Summary) লিখুন।');
        return;
      }
    }

    const finalData: ProjectItem = {
      ...formData,
      slug: cleanSlug,
      beforeImage: beforeSrc,
      beforeImg: beforeSrc,
      afterImage: afterSrc,
      afterImg: afterSrc,
      summary: formData.summary || formData.description || formData.workDone || '',
      summaryBn: formData.summaryBn || formData.descriptionBn || formData.workDoneBn || '',
      description: formData.description || formData.summary || formData.workDone || '',
      descriptionBn: formData.descriptionBn || formData.summaryBn || formData.workDoneBn || '',
      serviceDate: formData.serviceDate || formData.completedDate || new Date().toISOString().split('T')[0],
      completedDate: formData.completedDate || formData.serviceDate || new Date().toISOString().split('T')[0],
      status: formData.status === 'published' ? 'published' : 'draft',
      customerConsentGranted: formData.customerConsentGranted === true,
      sourceType: formData.sourceType || 'company_work'
    };

    if (finalData.beforeImage && !finalData.beforeImage.startsWith('data:')) {
      await persistImageChange('project', 'before', finalData.beforeImage, finalData.id);
    }
    if (finalData.afterImage && !finalData.afterImage.startsWith('data:')) {
      await persistImageChange('project', 'after', finalData.afterImage, finalData.id);
    }

    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">
              {project ? 'Edit Real Case Study' : 'Add Real Work Case Study'}
            </h3>
            <p className="text-xs text-slate-400">
              শুধুমাত্র প্রকৃত সম্পন্ন কাজের ছবি, এলাকা, সমস্যা ও ফলাফল যুক্ত করুন (কোনো ডেমো বা বানানো তথ্য ব্যবহার করবেন না)
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {validationError && (
          <div role="alert" className="p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Publish Status & URL Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">পাবলিশ স্ট্যাটাস (Status)</label>
              <select
                value={formData.status || 'draft'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                <option value="draft">Draft (প্রাইভেট — পাবলিক সাইটে দেখাবে না)</option>
                <option value="published">Published (লাইভ /portfolio ও সাইটম্যাপে যাবে)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">URL Slug (/portfolio/...)</label>
              <input
                type="text"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-cyan-300 font-mono"
                placeholder={slugifyCaseStudy(formData.title, formData.id)}
              />
            </div>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Case Study Title (English) *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  const nextTitle = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    title: nextTitle,
                    slug: prev.slug || slugifyCaseStudy(nextTitle, prev.id)
                  }));
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                placeholder="Underground Reserve Tank Cleaning in Uttara Sector 7"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">শিরোনাম (বাংলা)</label>
              <input
                type="text"
                value={formData.titleBn || ''}
                onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                placeholder="উত্তরা সেক্টর ৭-এ আন্ডারগ্রাউন্ড রিজার্ভার পরিষ্কারের কাজ"
              />
            </div>
          </div>

          {/* Area & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">সার্ভিস এরিয়া পেজ লিংক</label>
              <select
                value={formData.areaSlug || ''}
                onChange={(e) => {
                  const slugVal = e.target.value;
                  const matched = LOCATIONS_DATA.find(l => l.slug === slugVal);
                  setFormData(prev => ({
                    ...prev,
                    areaSlug: slugVal || undefined,
                    area: matched ? matched.areaName : prev.area,
                    location: matched ? matched.areaName : prev.location,
                    locationBn: matched ? matched.areaNameBn : prev.locationBn
                  }));
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                <option value="">-- এলাকা নির্বাচন করুন --</option>
                {LOCATIONS_DATA.map(loc => (
                  <option key={loc.slug} value={loc.slug}>
                    {loc.areaName} ({loc.areaNameBn})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">এলাকা / লোকেশন (English)</label>
              <input
                type="text"
                value={formData.area || formData.location || ''}
                onChange={(e) => setFormData({ ...formData, area: e.target.value, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                placeholder="Uttara Sector 7, Dhaka"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">এলাকা (বাংলা)</label>
              <input
                type="text"
                value={formData.locationBn || ''}
                onChange={(e) => setFormData({ ...formData, locationBn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                placeholder="উত্তরা সেক্টর ৭, ঢাকা"
              />
            </div>
          </div>

          {/* Work Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">কাজের তারিখ (Work Date)</label>
              <input
                type="date"
                value={formData.serviceDate || formData.completedDate || ''}
                onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value, completedDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ট্যাংক / পাইপের ধরন</label>
              <input
                type="text"
                value={formData.tankType || ''}
                onChange={(e) => setFormData({ ...formData, tankType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                placeholder="RCC Underground Tank / PVC Overhead"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ধারণক্ষমতা (ঐচ্ছিক)</label>
              <input
                type="text"
                value={formData.capacity || ''}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                placeholder="যেমন: ২,০০০ লিটার"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ব্যয়িত সময় (ঐচ্ছিক)</label>
              <input
                type="text"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                placeholder="যেমন: ২ ঘণ্টা ৩০ মিনিট"
              />
            </div>
          </div>

          {/* Category & Related Service */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ক্যাটাগরি (Category)</label>
              <select
                value={formData.category || 'Rooftop'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                <option value="Rooftop">Overhead / Rooftop Tank (ছাদের ট্যাংক)</option>
                <option value="Underground">Underground Reserve Tank (মাটির নিচের ট্যাংক)</option>
                <option value="Pipeline">Water Pipeline Cleaning (পানির পাইপলাইন)</option>
                <option value="Apartment">Apartment Multi-Tank (অ্যাপার্টমেন্ট ভবন)</option>
                <option value="Commercial">Commercial Facility (বাণিজ্যিক স্থাপনা)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">সংশ্লিষ্ট মূল সার্ভিস পেজ (Related Service)</label>
              <select
                value={formData.relatedServiceSlug || 'water-tank-cleaning'}
                onChange={(e) => setFormData({ ...formData, relatedServiceSlug: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                {SERVICE_SLUG_OPTIONS.map(opt => (
                  <option key={opt.slug} value={opt.slug}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer Problem / Work Done / Result */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">গ্রাহকের মূল সমস্যা (বাংলা)</label>
              <textarea
                rows={2}
                value={formData.customerProblemBn || ''}
                onChange={(e) => setFormData({ ...formData, customerProblemBn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                placeholder="যেমন: নিচের রিজার্ভারে কাদা-বালু জমা ও ছাদের ট্যাংকে সবুজ শ্যাওলা..."
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Customer Problem (English)</label>
              <textarea
                rows={2}
                value={formData.customerProblem || ''}
                onChange={(e) => setFormData({ ...formData, customerProblem: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                placeholder="Silt accumulation in reserve sump and algae film on inner tank wall."
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">কী কাজ করা হয়েছে (Work Done — বাংলা)</label>
              <textarea
                rows={3}
                value={formData.workDoneBn || formData.descriptionBn || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    workDoneBn: e.target.value,
                    descriptionBn: e.target.value,
                    summaryBn: e.target.value
                  })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                placeholder="পানি নিষ্কাশন, স্লাজ পাম্প, হাই-প্রেসার রোটারি জেট ওয়াশ ও স্যানিটাইজিং প্রক্রিয়ার বাস্তব বিবরণ..."
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Work Done (English)</label>
              <textarea
                rows={3}
                value={formData.workDone || formData.description || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    workDone: e.target.value,
                    description: e.target.value,
                    summary: e.target.value
                  })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                placeholder="Full dewatering, sludge extraction, rotary high-pressure wash, and rinse."
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">প্রকৃত ফলাফল (Actual Result — বাংলা)</label>
              <textarea
                rows={2}
                value={formData.actualResultBn || ''}
                onChange={(e) => setFormData({ ...formData, actualResultBn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                placeholder="তলদেশের কাদা ও দেয়ালের শ্যাওলা অপসারিত হয়ে ট্যাংক পরিষ্কার অবস্থায় হস্তান্তর।"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Actual Result (English)</label>
              <textarea
                rows={2}
                value={formData.actualResult || ''}
                onChange={(e) => setFormData({ ...formData, actualResult: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                placeholder="Removed sediment buildup and cleaned walls prior to tank refill handover."
              />
            </div>
          </div>

          {/* BEFORE & AFTER PHOTOS WITH CAPTIONS (No stock photos) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-red-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400">পূর্বে (Before Real Photo) *</span>
                <button
                  type="button"
                  onClick={() => beforeFileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-800 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>আসল ছবি আপলোড</span>
                </button>
              </div>
              <input ref={beforeFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleBeforeFileUpload} />
              <div className="flex gap-2 items-center">
                <div className="w-16 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                  {beforeSrc ? <img src={beforeSrc} alt="Before" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-slate-600" />}
                </div>
                <input
                  type="text"
                  value={beforeSrc}
                  onChange={(e) => setFormData({ ...formData, beforeImage: e.target.value, beforeImg: e.target.value })}
                  className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-[11px] font-mono"
                  placeholder="https://... (বাস্তব কাজের ছবি)"
                />
              </div>
              <input
                type="text"
                value={formData.beforeCaptionBn || ''}
                onChange={(e) => setFormData({ ...formData, beforeCaptionBn: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-[11px]"
                placeholder="Before ছবির ক্যাপশন (বাংলা)"
              />
              {uploadingBefore && <span className="text-[11px] text-red-400 animate-pulse block">ছবি আপলোড হচ্ছে...</span>}
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-emerald-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">পরে (After Real Photo) *</span>
                <button
                  type="button"
                  onClick={() => afterFileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>আসল ছবি আপলোড</span>
                </button>
              </div>
              <input ref={afterFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAfterFileUpload} />
              <div className="flex gap-2 items-center">
                <div className="w-16 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                  {afterSrc ? <img src={afterSrc} alt="After" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-slate-600" />}
                </div>
                <input
                  type="text"
                  value={afterSrc}
                  onChange={(e) => setFormData({ ...formData, afterImage: e.target.value, afterImg: e.target.value })}
                  className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-[11px] font-mono"
                  placeholder="https://... (বাস্তব কাজের ছবি)"
                />
              </div>
              <input
                type="text"
                value={formData.afterCaptionBn || ''}
                onChange={(e) => setFormData({ ...formData, afterCaptionBn: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-[11px]"
                placeholder="After ছবির ক্যাপশন (বাংলা)"
              />
              {uploadingAfter && <span className="text-[11px] text-emerald-400 animate-pulse block">ছবি আপলোড হচ্ছে...</span>}
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
              <Globe className="w-3.5 h-3.5" />
              <span>SEO Metadata (ঐচ্ছিক — খালি রাখলে টাইটেল ও সারসংক্ষেপ থেকে তৈরি হবে)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={formData.metaTitle || ''}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                placeholder="SEO Meta Title (<= 65 chars)"
              />
              <input
                type="text"
                value={formData.metaDescription || ''}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                placeholder="SEO Meta Description (<= 160 chars)"
              />
            </div>
          </div>

          {/* Mandatory Customer Privacy Consent Gate */}
          <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl space-y-1.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.customerConsentGranted === true}
                onChange={(e) => setFormData({ ...formData, customerConsentGranted: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-950 border-slate-700"
              />
              <div>
                <span className="text-xs font-semibold text-cyan-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>গ্রাহকের ছবি ও কাজের তথ্য প্রকাশের সম্মতি রয়েছে (Customer Consent Granted) *</span>
                </span>
                <span className="text-[11px] text-slate-400 block leading-relaxed mt-0.5">
                  গোপনীয়তা রক্ষার্থে গ্রাহকের পূর্ণ নাম বা বাসার সঠিক হোল্ডিং নম্বর প্রকাশ করবেন না। সম্মতি চেক করা না থাকলে কেস স্টাডি পাবলিক সাইটে দেখাবে না।
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(formData.featured)}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded bg-slate-950 border-slate-700"
            />
            <span>Featured Case Study</span>
          </label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700 cursor-pointer">
              বাতিল (Cancel)
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{formData.status === 'published' ? 'সেভ ও পাবলিশ করুন' : 'ড্রাফট সেভ করুন'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
