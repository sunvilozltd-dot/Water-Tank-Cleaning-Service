import React, { useState } from 'react';
import { X, Upload, Video, Image as ImageIcon } from 'lucide-react';
import { uploadMediaItem } from '../../services/mediaService';
import { MediaType } from '../../types/media';

interface MediaUploadModalProps {
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const MediaUploadModal: React.FC<MediaUploadModalProps> = ({ onClose, onUploadSuccess }) => {
  const [fileType, setFileType] = useState<MediaType>('video');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      await uploadMediaItem(file, fileType);
      onUploadSuccess();
    } catch (e) {
      console.error(e);
      alert('Upload failed. Please check file format.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">Upload Media Asset</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Asset Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFileType('video')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 ${
                  fileType === 'video' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-400'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video (MP4/WebM)</span>
              </button>
              <button
                type="button"
                onClick={() => setFileType('image')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 ${
                  fileType === 'image' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-400'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Image / Poster</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Select File from Device</label>
            <input
              type="file"
              accept={fileType === 'video' ? 'video/mp4,video/webm' : 'image/*'}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
            />
          </div>

          {file && (
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-300">
              <p className="font-semibold text-white truncate">{file.name}</p>
              <p className="text-slate-400 mt-0.5">Size: {Math.round(file.size / 1024)} KB</p>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Uploading...' : 'Confirm Upload'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
