import React, { useState } from 'react';
import { VideoItem } from '../../types';
import { X, Save } from 'lucide-react';

interface VideoModalProps {
  video: VideoItem | null;
  onClose: () => void;
  onSave: (video: VideoItem) => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose, onSave }) => {
  const [formData, setFormData] = useState<VideoItem>(
    video || {
      id: `vid-${Date.now()}`,
      title: '',
      titleBn: '',
      description: '',
      youtubeId: '',
      url: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=75',
      duration: '3:45'
    }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">
            {video ? 'Edit Video' : 'Add Work Video'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              placeholder="Underground Tank Sludge Cleaning"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">YouTube Video ID (or URL)</label>
            <input
              type="text"
              value={formData.youtubeId}
              onChange={(e) => {
                let id = e.target.value;
                if (id.includes('v=')) {
                  id = id.split('v=')[1].split('&')[0];
                } else if (id.includes('youtu.be/')) {
                  id = id.split('youtu.be/')[1].split('?')[0];
                }
                setFormData({ 
                  ...formData, 
                  youtubeId: id,
                  thumbnailUrl: id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : formData.thumbnailUrl
                });
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
              placeholder="e.g. dQw4w9WgXcQ"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Thumbnail URL</label>
            <input
              type="text"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
            />
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
            <span>Save Video</span>
          </button>
        </div>
      </div>
    </div>
  );
};
