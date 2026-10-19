import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { trackVideoPlay } from '../../services/trackingService';

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  thumbnailUrl?: string;
  autoplay?: boolean;
  muted?: boolean;
  className?: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  title = 'Sunviloz Clean Care Video',
  thumbnailUrl,
  autoplay = false,
  muted = false,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);

  if (!videoId) return null;

  const poster = thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const handleStartPlay = () => {
    setIsPlaying(true);
    trackVideoPlay(title, videoId);
  };

  const embedSrc = `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&mute=${muted ? 1 : 0}&rel=0&modestbranding=1`;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden shadow-xl bg-slate-950 aspect-video ${className}`}>
      {isPlaying ? (
        <iframe
          src={embedSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      ) : (
        <div 
          onClick={handleStartPlay}
          className="relative w-full h-full cursor-pointer group flex items-center justify-center overflow-hidden"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleStartPlay();
            }
          }}
          aria-label={`Play ${title}`}
        >
          {/* Poster Image */}
          <img
            src={poster}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/30 transition-colors" />

          {/* Big Play Button */}
          <div className="absolute z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-cyan-500/90 group-hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-2xl transition-all transform group-hover:scale-110 active:scale-95">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-slate-950 ml-1" />
          </div>

          {/* Title tag at bottom */}
          <div className="absolute bottom-3 left-4 right-4 z-10 bg-slate-900/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 text-white text-xs sm:text-sm font-bold truncate">
            {title}
          </div>
        </div>
      )}
    </div>
  );
};
