import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Play,
  ArrowUpDown,
  RefreshCw,
  X,
  Youtube
} from 'lucide-react';
import { ProjectVideoItem, ProjectVideoPayload } from '../../types/projectVideo';
import { useProjectVideos } from '../../context/ProjectVideosContext';
import { validateYouTubeUrl, extractYouTubeId } from '../../services/projectVideosService';

export const ProjectVideosTab: React.FC = () => {
  const { 
    videos, 
    loading, 
    refreshVideos, 
    addVideo, 
    updateVideo, 
    deleteVideo 
  } = useProjectVideos();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<ProjectVideoItem | null>(null);

  // Form states
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [orderInput, setOrderInput] = useState<number>(1);
  const [isActiveInput, setIsActiveInput] = useState<boolean>(true);

  // Form validation & submission state
  const [urlError, setUrlError] = useState<string | null>(null);
  const [previewVideoId, setPreviewVideoId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Delete confirmation modal state
  const [videoToDelete, setVideoToDelete] = useState<ProjectVideoItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Live URL validation on change
  useEffect(() => {
    if (!urlInput.trim()) {
      setUrlError(null);
      setPreviewVideoId('');
      return;
    }

    const res = validateYouTubeUrl(urlInput);
    if (res.isValid && res.videoId) {
      setUrlError(null);
      setPreviewVideoId(res.videoId);
    } else {
      setUrlError(res.error || 'সঠিক YouTube URL নয়');
      setPreviewVideoId('');
    }
  }, [urlInput]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedbackToast({ type, message });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4500);
  };

  const openAddModal = () => {
    setEditingVideo(null);
    setUrlInput('');
    setTitleInput('');
    // Next order number
    const maxOrder = videos.length > 0 ? Math.max(...videos.map(v => v.displayOrder || 0)) : 0;
    setOrderInput(maxOrder + 1);
    setIsActiveInput(true);
    setUrlError(null);
    setPreviewVideoId('');
    setIsModalOpen(true);
  };

  const openEditModal = (vid: ProjectVideoItem) => {
    setEditingVideo(vid);
    setUrlInput(vid.youtubeUrl);
    setTitleInput(vid.title || '');
    setOrderInput(vid.displayOrder || 1);
    setIsActiveInput(vid.isActive !== false);
    setUrlError(null);
    setPreviewVideoId(vid.youtubeId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVideo(null);
    setUrlInput('');
    setTitleInput('');
    setUrlError(null);
    setPreviewVideoId('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const val = validateYouTubeUrl(urlInput);
    if (!val.isValid || !val.videoId) {
      setUrlError(val.error || 'সঠিক YouTube লিঙ্ক প্রদান করুন।');
      return;
    }

    setIsSaving(true);
    try {
      const payload: ProjectVideoPayload = {
        youtubeUrl: urlInput.trim(),
        title: titleInput.trim(),
        displayOrder: Number(orderInput) || 1,
        isActive: isActiveInput
      };

      if (editingVideo) {
        const res = await updateVideo(editingVideo.id, payload);
        if (res.success) {
          showToast('success', 'ভিডিওটি সফলভাবে Supabase ডাটাবেজে আপডেট করা হয়েছে!');
          closeModal();
        } else {
          showToast('error', res.error || 'ভিডিও আপডেট ব্যর্থ হয়েছে।');
        }
      } else {
        const res = await addVideo(payload);
        if (res.success) {
          showToast('success', 'নতুন ভিডিও সফলভাবে Supabase ডাটাবেজে সংরক্ষণ করা হয়েছে!');
          closeModal();
        } else {
          showToast('error', res.error || 'ভিডিও যোগ করতে সমস্যা হয়েছে।');
        }
      }
    } catch (err: any) {
      showToast('error', err.message || 'একটি ত্রুটি ঘটেছে।');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (vid: ProjectVideoItem) => {
    const nextStatus = !vid.isActive;
    const res = await updateVideo(vid.id, { isActive: nextStatus });
    if (res.success) {
      showToast('success', `ভিডিও স্ট্যাটাস ${nextStatus ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'} করা হয়েছে!`);
    } else {
      showToast('error', 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
    }
  };

  const confirmDeleteVideo = async () => {
    if (!videoToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteVideo(videoToDelete.id);
      if (res.success) {
        showToast('success', 'ভিডিওটি সফলভাবে ডাটাবেজ থেকে মুছে ফেলা হয়েছে!');
        setVideoToDelete(null);
      } else {
        showToast('error', res.error || 'মুছে ফেলতে ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      showToast('error', err.message || 'একটি ত্রুটি ঘটেছে।');
    } finally {
      setIsDeleting(false);
    }
  };

  // Sort videos by display order for clean list
  const sortedVideos = [...videos].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const activeCount = videos.filter(v => v.isActive).length;

  return (
    <div className="space-y-6">
      
      {/* Toast Feedback */}
      {feedbackToast && (
        <div 
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slideUp text-sm font-semibold border ${
            feedbackToast.type === 'success' 
              ? 'bg-emerald-950 text-emerald-200 border-emerald-700/80' 
              : 'bg-rose-950 text-rose-200 border-rose-700/80'
          }`}
          role="status"
        >
          {feedbackToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{feedbackToast.message}</span>
        </div>
      )}

      {/* Top Banner & Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Project Video Management
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Website-এর YouTube Project Video Slider-এর জন্য সম্পন্ন করা কাজের ভিডিও যোগ, সম্পাদনা ও পরিচালনা করুন।
          </p>

          <div className="flex items-center gap-3 mt-3 text-xs">
            <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              মোট ভিডিও: {videos.length}
            </span>
            <span className={`px-2.5 py-0.5 rounded-md font-semibold border ${
              activeCount > 0 
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800/80' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              সক্রিয় (Public): {activeCount}
            </span>
            {activeCount === 0 && (
              <span className="text-[11px] text-amber-400 font-medium">
                (সক্রিয় ভিডিও না থাকায় পাবলিক ওয়েবসাইটে সেকশনটি বর্তমানে সম্পূর্ণ Hide রয়েছে)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshVideos}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer disabled:opacity-50"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0b7a6f] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#0D9488]/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ভিডিও যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Videos List / Empty State */}
      {videos.length === 0 ? (
        <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-12 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <Youtube className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">বর্তমানে কোনো প্রজেক্ট ভিডিও নেই</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
              Admin Panel থেকে কোনো YouTube Video যোগ না করা পর্যন্ত Frontend-এ এই Section-এর মধ্যে কোনো Demo বা Placeholder Video থাকবে না এবং সম্পূর্ণ সেকশনটি Hide থাকবে।
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0b7a6f] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>প্রথম ভিডিও যোগ করুন</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedVideos.map((vid) => (
            <div 
              key={vid.id}
              className={`bg-slate-900 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all ${
                vid.isActive 
                  ? 'border-slate-800 hover:border-slate-700' 
                  : 'border-slate-800/60 opacity-60 bg-slate-950'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="aspect-video bg-slate-950 relative overflow-hidden group">
                <img
                  src={`https://img.youtube.com/vi/${vid.youtubeId}/mqdefault.jpg`}
                  alt={vid.title || 'Video Thumbnail'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay Indicators */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-bold text-cyan-300 border border-white/10">
                    ক্রম: {vid.displayOrder}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border backdrop-blur-md ${
                    vid.isActive 
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80' 
                      : 'bg-rose-950/90 text-rose-300 border-rose-700/80'
                  }`}>
                    {vid.isActive ? '● সক্রিয়' : '○ নিষ্ক্রিয়'}
                  </span>
                </div>

                <a 
                  href={vid.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 text-xs font-semibold"
                >
                  <Play className="w-8 h-8 fill-red-600 text-red-600 drop-shadow-md" />
                </a>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-2">
                    {vid.title || <span className="text-slate-400 italic">শিরোনাম ছাড়া ভিডিও</span>}
                  </h4>
                  <a
                    href={vid.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-xs text-slate-400 hover:text-cyan-400 truncate flex items-center gap-1"
                  >
                    <span className="truncate">{vid.youtubeUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(vid)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      vid.isActive
                        ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
                    }`}
                    title={vid.isActive ? 'ক্লিক করে নিষ্ক্রিয় করুন' : 'ক্লিক করে সক্রিয় করুন'}
                  >
                    {vid.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{vid.isActive ? 'Active' : 'Inactive'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(vid)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700"
                      title="সম্পাদনা করুন"
                    >
                      <Edit3 className="w-4 h-4 text-cyan-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoToDelete(vid)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer border border-rose-500/20"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative my-8">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Youtube className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {editingVideo ? 'প্রজেক্ট ভিডিও সম্পাদনা' : 'নতুন প্রজেক্ট ভিডিও যোগ করুন'}
                </h3>
                <p className="text-xs text-slate-400">
                  YouTube ভিডিও লিঙ্ক দিলে সিস্টেম স্বয়ংক্রিয়ভাবে ভিডিও আইডি ও থাম্বনেইল প্রস্তুত করবে।
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* YouTube URL Input */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  YouTube Video URL <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... বা https://youtu.be/..."
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 text-white text-xs sm:text-sm border transition-colors focus:outline-none ${
                      urlError 
                        ? 'border-rose-500 focus:border-rose-400' 
                        : previewVideoId 
                          ? 'border-emerald-500/80 focus:border-emerald-400' 
                          : 'border-slate-800 focus:border-cyan-500'
                    }`}
                  />
                  {previewVideoId && !urlError && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {urlError ? (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{urlError}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">
                    সমর্থিত ফরম্যাট: watch, youtu.be, shorts, embed এবং live লিঙ্ক।
                  </p>
                )}
              </div>

              {/* Live Preview If Valid */}
              {previewVideoId && !urlError && (
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="w-24 aspect-video rounded-lg overflow-hidden bg-black shrink-0 relative">
                    <img 
                      src={`https://img.youtube.com/vi/${previewVideoId}/mqdefault.jpg`} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="w-4 h-4 fill-white text-white" />
                    </div>
                  </div>
                  <div className="text-xs min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      Video ID শনাক্ত হয়েছে
                    </span>
                    <span className="font-mono text-slate-300 font-bold truncate block">
                      {previewVideoId}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      স্লাইডারে এই ভিডিওর HD থাম্বনেইল ও প্লেয়ার দেখাবে।
                    </span>
                  </div>
                </div>
              )}

              {/* Video Title (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  ভিডিওর শিরোনাম (Video Title) <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="যেমন: ধানমন্ডি ১০ তলা ভবনের পানির ট্যাংক ডিপ ক্লিনিং"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 text-white text-xs sm:text-sm border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Display Order & Active Toggle */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Display Order (ক্রম)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={orderInput}
                    onChange={(e) => setOrderInput(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 text-white text-xs sm:text-sm border border-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">কম সংখ্যা আগে প্রদর্শিত হবে</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    স্ট্যাটাস (Status)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsActiveInput(!isActiveInput)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      isActiveInput
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {isActiveInput ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4" />}
                    <span>{isActiveInput ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}</span>
                  </button>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {isActiveInput ? 'ওয়েবসাইটে দেখা যাবে' : 'ওয়েবসাইট থেকে লুকানো থাকবে'}
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSaving || Boolean(urlError) || !urlInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0b7a6f] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <span>{editingVideo ? 'আপডেট সংরক্ষণ করুন' : 'ভিডিও সংরক্ষণ করুন'}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {videoToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">ভিডিওটি মুছে ফেলতে চান?</h3>
              <p className="text-xs text-slate-400 mt-1">
                মুছে ফেললে এটি ওয়েবসাইট ও Supabase ডাটাবেজ থেকে স্থায়ীভাবে অপসারিত হবে।
              </p>
              {videoToDelete.title && (
                <p className="mt-2 text-xs font-semibold text-cyan-300 bg-slate-950 p-2 rounded-lg truncate">
                  &quot;{videoToDelete.title}&quot;
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVideoToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                না, ফিরে যান
              </button>
              <button
                type="button"
                onClick={confirmDeleteVideo}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>মুছে ফেলা হচ্ছে...</span>
                  </>
                ) : (
                  <span>হ্যাঁ, মুছে ফেলুন</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
