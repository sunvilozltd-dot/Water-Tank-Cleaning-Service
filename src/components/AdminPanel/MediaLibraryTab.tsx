import React, { useState, useEffect } from 'react';
import { MediaItem, MediaType } from '../../types/media';
import { getMediaItems, deleteMediaItem } from '../../services/mediaService';
import { Plus, Trash2, Image as ImageIcon, Video as VideoIcon, Upload, Copy, Check, ExternalLink } from 'lucide-react';
import { MediaUploadModal } from './MediaUploadModal';

export const MediaLibraryTab: React.FC = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await getMediaItems();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDeleteMedia = async () => {
    if (!mediaToDelete) return;
    setDeleteError(null);
    const res = await deleteMediaItem(mediaToDelete.id);
    if (!res.success) {
      setDeleteError(res.error || 'Failed to delete media item.');
      return;
    }
    setMediaToDelete(null);
    loadItems();
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = items.filter(item => {
    if (filterType === 'all') return true;
    return item.fileType === filterType;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-400" />
            <span>Media Library &amp; Video Assets</span>
          </h2>
          <p className="text-xs text-slate-400">Upload background cleaning videos, posters, logos, and before/after photos.</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
          >
            <option value="all">All Media ({items.length})</option>
            <option value="video">Videos Only</option>
            <option value="image">Images Only</option>
          </select>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between group">
            <div className="aspect-square bg-slate-950 relative overflow-hidden flex items-center justify-center">
              {item.fileType === 'video' ? (
                <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                  <video src={item.storagePath} className="w-full h-full object-cover" muted />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <VideoIcon className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
              ) : (
                <img src={item.storagePath} alt={item.fileName} className="w-full h-full object-cover" />
              )}
            </div>

            <div className="p-2.5">
              <p className="text-xs font-semibold text-white truncate" title={item.fileName}>
                {item.fileName}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">
                {item.fileType} • {item.fileSize ? `${Math.round(item.fileSize / 1024)} KB` : 'Local'}
              </p>

              <div className="flex items-center justify-between gap-1 pt-2 mt-2 border-t border-slate-800">
                <button
                  onClick={() => handleCopyUrl(item.storagePath || item.publicUrl || '', item.id)}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 text-[10px] flex items-center gap-1"
                  title="Copy Direct URL"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(null);
                    setMediaToDelete(item);
                  }}
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors"
                  title="Delete Media"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {mediaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">Delete Media Item?</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Are you sure you want to remove <span className="text-white font-semibold">&quot;{mediaToDelete.fileName || mediaToDelete.title || 'this item'}&quot;</span>?
                </p>
                {deleteError && (
                  <div className="mt-3 p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs leading-relaxed">
                    {deleteError}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMediaToDelete(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteMedia}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-900/30 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isUploadModalOpen && (
        <MediaUploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onUploadSuccess={() => {
            setIsUploadModalOpen(false);
            loadItems();
          }}
        />
      )}
    </div>
  );
};
