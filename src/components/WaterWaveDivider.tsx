import React from 'react';

interface WaterWaveDividerProps {
  variant?: 'flowing' | 'ripple' | 'crest' | 'subtle';
  flip?: boolean;
  className?: string;
  fillColor?: string;
  topColor?: string;
}

export const WaterWaveDivider: React.FC<WaterWaveDividerProps> = ({
  variant = 'flowing',
  flip = false,
  className = '',
  fillColor = '#06152A',
  topColor = 'transparent'
}) => {
  return (
    <div 
      className={`relative w-full overflow-hidden leading-none pointer-events-none select-none z-10 ${flip ? 'rotate-180 -scale-x-100' : ''} ${className}`}
      aria-hidden="true"
    >
      {variant === 'flowing' && (
        <div className="w-full">
          {/* Wave silhouette */}
          <svg 
            viewBox="0 0 1440 96" 
            className="w-full h-10 sm:h-16 block"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="wave-grad-accent" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284C7" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.25" />
              </linearGradient>
            </defs>

            {/* Back subtle wave in accent gradient */}
            <path 
              d="M0,32 C240,64 480,16 720,40 C960,64 1200,24 1440,48 L1440,96 L0,96 Z" 
              fill="url(#wave-grad-accent)" 
            />

            {/* Front main wave in solid section fill color */}
            <path 
              d="M0,48 C320,16 640,64 960,32 C1200,8 1360,40 1440,32 L1440,96 L0,96 Z" 
              fill={fillColor} 
            />
          </svg>

          {/* Glowing water crest hairline */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.4)]" />
        </div>
      )}

      {variant === 'crest' && (
        <div className="w-full">
          <svg 
            viewBox="0 0 1440 80" 
            className="w-full h-8 sm:h-14 block"
            preserveAspectRatio="none"
          >
            <path 
              d="M0,0 C360,55 720,70 1080,45 C1240,32 1360,18 1440,8 L1440,80 L0,80 Z" 
              fill={fillColor} 
            />
          </svg>
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-sky-400/35 to-transparent" />
        </div>
      )}

      {variant === 'ripple' && (
        <div className="w-full flex items-center justify-center py-2">
          <div className="w-full max-w-5xl px-4 flex items-center justify-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
            <div className="px-4 flex items-center gap-1.5 shrink-0 text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
            </div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          </div>
        </div>
      )}

      {variant === 'subtle' && (
        <div className="w-full">
          <svg 
            viewBox="0 0 1440 48" 
            className="w-full h-6 sm:h-10 block"
            preserveAspectRatio="none"
          >
            <path 
              d="M0,24 C480,44 960,4 1440,24 L1440,48 L0,48 Z" 
              fill={fillColor} 
            />
          </svg>
        </div>
      )}
    </div>
  );
};
