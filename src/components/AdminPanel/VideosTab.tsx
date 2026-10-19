import React, { useState } from 'react';
import { VideoItem } from '../../types';
import { Plus, Edit2, Trash2, Film, Play, AlertTriangle, X } from 'lucide-react';
import { VideoModal } from './VideoModal';

interface VideosTabProps {
  videos: VideoItem[];
  onSaveVideo: (video: VideoItem) => void;
  onDeleteVideo: (id: string) => void;
}

export const VideosTab: React.FC<VideosTabProps> = ({
  videos,
  onSaveVideo,
  onDeleteVideo
}) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<VideoItem | null>(null);

  const confirmDelete = () => {
    if (videoToDelete) {
      onDeleteVideo(videoToDelete.id);
      setVideoToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-blue-400" />
            <span>Our Work Videos Section</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/60 font-semibold">
              {videos.length} {videos.length === 1 ? 'Video' : 'Videos'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage real YouTube and MP4 cleaning footage displayed in &quot;Our Work Videos&quot;.</p>
        </div>
        <button
          onClick={() => {
            setSelectedVideo(null);
            setIsModalOpen(true);
          }}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition-colors cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Video</span>
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-3">
          <Film className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Videos Listed</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You have deleted all videos. Add a new water tank or pipeline cleaning footage to showcase your work.
          </p>
          <button
            onClick={() => {
              setSelectedVideo(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Video</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((vid) => (
            <div key={vid.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:border-slate-700 transition-colors">
              <div className="aspect-video bg-slate-950 relative">
                <img
                  src={vid.thumbnailUrl || (vid.youtubeId ? `https://img.youtube.com/vi/${vid.youtubeId}/mqdefault.jpg` : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=75')}
                  alt={vid.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm line-clamp-1">{vid.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{vid.description}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono truncate max-w-[150px]">{vid.youtubeId || vid.url}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVideo(vid);
                        setIsModalOpen(true);
                      }}
                      title="Edit Video"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoToDelete(vid)}
                      title="Delete Video"
                      className="p-1.5 text-rose-400 hover:bg-rose-950/60 rounded border border-rose-900/40 hover:border-rose-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal (In-App, iFrame Safe) */}
      {videoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">Delete Video?</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Are you sure you want to permanently remove <span className="text-white font-semibold">&quot;{videoToDelete.title}&quot;</span> from the website?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setVideoToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Video</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setIsModalOpen(false)}
          onSave={(saved) => {
            onSaveVideo(saved);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default VideosTab;
