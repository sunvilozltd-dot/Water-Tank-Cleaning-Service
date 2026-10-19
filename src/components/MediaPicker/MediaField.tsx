import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Youtube, 
  Link as LinkIcon, 
  Trash2, 
  FolderOpen, 
  Check, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { uploadMediaFile, registerExternalMedia, getYouTubeMetadata, extractYouTubeId } from '../../services/mediaService';
import { MediaItem, MediaType } from '../../types/media';

interface MediaFieldProps {
  label: string;
  mediaType: 'image' | 'video' | 'any';
  valueUrl?: string;
  valueYoutubeId?: string;
  valueAlt?: string;
  onChange: (data: {
    url?: string;
    youtubeId?: string;
    altText?: string;
    mediaType?: 'image' | 'video' | 'youtube' | 'none';
  }) => void;
  onOpenMediaLibraryModal?: (onSelect: (item: MediaItem) => void) => void;
}

export const MediaField: React.FC<MediaFieldProps> = ({
  label,
  mediaType,
  valueUrl = '',
  valueYoutubeId = '',
  valueAlt = '',
  onChange,
  onOpenMediaLibraryModal
}) => {
  const [sourceMode, setSourceMode] = useState<'upload' | 'youtube' | 'url'>(
    valueYoutubeId ? 'youtube' : 'upload'
  );
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(valueUrl);
  const [altInput, setAltInput] = useState(valueAlt);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg(null);
    try {
      const res = await uploadMediaFile(file, { altText: altInput });
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.item) {
        onChange({
          url: res.item.publicUrl,
          mediaType: res.item.fileType,
          altText: altInput || res.item.altText
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    const trimmed = urlInput.trim();

    if (sourceMode === 'youtube' || trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
      const yt = getYouTubeMetadata(trimmed);
      if (!yt.isValid) {
        setErrorMsg('Invalid YouTube URL. Please provide a standard YouTube link.');
        return;
      }
      setErrorMsg(null);
      registerExternalMedia(trimmed, 'youtube', { altText: altInput });
      onChange({
        url: trimmed,
        youtubeId: yt.videoId,
        mediaType: 'youtube',
        altText: altInput
      });
    } else {
      setErrorMsg(null);
      const detectedType = trimmed.endsWith('.mp4') || trimmed.endsWith('.webm') ? 'video' : 'image';
      registerExternalMedia(trimmed, detectedType, { altText: altInput });
      onChange({
        url: trimmed,
        mediaType: detectedType,
        altText: altInput
      });
    }
  };

  const handleClear = () => {
    setUrlInput('');
    onChange({
      url: '',
      youtubeId: '',
      mediaType: 'none',
      altText: ''
    });
  };

  const isVideoOrYouTube = Boolean(valueYoutubeId || (valueUrl && (valueUrl.endsWith('.mp4') || valueUrl.endsWith('.webm'))));

  return (
    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <label className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
          {mediaType === 'video' ? <VideoIcon className="w-4 h-4 text-cyan-600" /> : <ImageIcon className="w-4 h-4 text-cyan-600" />}
          <span>{label}</span>
        </label>
        {/* Source Mode selector tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setSourceMode('upload')}
            className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              sourceMode === 'upload' ? 'bg-[#0B2545] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>আপলোড</span>
          </button>
          {(mediaType === 'video' || mediaType === 'any') && (
            <button
              type="button"
              onClick={() => setSourceMode('youtube')}
              className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                sourceMode === 'youtube' ? 'bg-[#0B2545] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Youtube className="w-3 h-3 text-rose-500" />
              <span>YouTube</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setSourceMode('url')}
            className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              sourceMode === 'url' ? 'bg-[#0B2545] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>URL লিংক</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-bold flex items-center gap-1.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input controls based on mode */}
      {sourceMode === 'upload' && (
        <div className="space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept={mediaType === 'video' ? 'video/mp4,video/webm' : 'image/png,image/jpeg,image/webp,image/svg+xml'}
            className="hidden"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[40px] px-3.5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'আপলোড হচ্ছে...' : 'ফাইল আপলোড করুন'}</span>
            </button>
            {onOpenMediaLibraryModal && (
              <button
                type="button"
                onClick={() => onOpenMediaLibraryModal((item) => {
                  onChange({
                    url: item.publicUrl,
                    youtubeId: item.youtubeVideoId,
                    mediaType: item.fileType,
                    altText: item.altText
                  });
                })}
                className="min-h-[40px] px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <FolderOpen className="w-4 h-4 text-amber-500" />
                <span>মিডিয়া লাইব্রেরি</span>
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {mediaType === 'video' ? 'ভিডিও ফরম্যাট: MP4, WebM (সর্বোচ্চ ১০০MB)' : 'ছবি ফরম্যাট: WebP, PNG, JPG, SVG (সর্বোচ্চ ১০MB)'}
          </p>
        </div>
      )}

      {sourceMode === 'youtube' && (
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-600">YouTube Watch লিংক বা Video ID দিন:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=ScMzIvxBSi4 বা ScMzIvxBSi4"
              className="flex-1 px-3 py-2 min-h-[40px] border border-slate-300 rounded-xl bg-white font-mono text-xs"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="min-h-[40px] px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>যুক্ত করুন</span>
            </button>
          </div>
        </div>
      )}

      {sourceMode === 'url' && (
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-600">সরাসরি মিডিয়া URL দিন:</label>
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/... বা https://cdn.../video.mp4"
              className="flex-1 px-3 py-2 min-h-[40px] border border-slate-300 rounded-xl bg-white font-mono text-xs"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="min-h-[40px] px-4 py-2 bg-[#0B2545] hover:bg-[#071E3D] text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>যুক্ত করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* Alt Text Field */}
      <div>
        <label className="block text-[11px] font-bold text-slate-600 mb-1">Alt Text (বিবরণ):</label>
        <input
          type="text"
          value={altInput}
          onChange={e => {
            setAltInput(e.target.value);
            onChange({ altText: e.target.value });
          }}
          placeholder="যেমন: ছাদের ট্যাংক ক্লিনিং কাজের ছবি"
          className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
        />
      </div>

      {/* Preview Box */}
      {(valueUrl || valueYoutubeId) && (
        <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {valueYoutubeId ? (
              <div className="relative w-28 h-18 rounded-lg overflow-hidden border shrink-0 bg-slate-900">
                <img
                  src={`https://img.youtube.com/vi/${valueYoutubeId}/hqdefault.jpg`}
                  alt="YouTube Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                  <Youtube className="w-6 h-6 text-rose-500" />
                </div>
              </div>
            ) : isVideoOrYouTube ? (
              <div className="w-28 h-18 rounded-lg overflow-hidden border shrink-0 bg-slate-900 flex items-center justify-center text-white">
                <VideoIcon className="w-6 h-6 text-cyan-400" />
              </div>
            ) : (
              <img
                src={valueUrl}
                alt={valueAlt || 'Preview'}
                className="w-20 h-16 rounded-lg object-cover border shrink-0 bg-white"
              />
            )}
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {valueYoutubeId ? 'YouTube Video Connected' : isVideoOrYouTube ? 'Video Connected' : 'Image Connected'}
              </span>
              <p className="text-[11px] text-slate-600 font-mono truncate max-w-xs mt-1">
                {valueYoutubeId ? `ID: ${valueYoutubeId}` : valueUrl}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            {valueUrl && (
              <a
                href={valueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 min-h-[36px] min-w-[36px] rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 flex items-center justify-center"
                title="ব্রাউজারে খুলুন"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={handleClear}
              className="p-2 min-h-[36px] min-w-[36px] rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center cursor-pointer"
              title="মুছুন"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
