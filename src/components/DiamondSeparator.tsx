import React from 'react';

interface DiamondSeparatorProps {
  className?: string;
}

export const DiamondSeparator: React.FC<DiamondSeparatorProps> = ({ className = '' }) => {
  return (
    <div 
      className={`relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      {/* Horizontal subtle line with cyan shimmer */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      
      {/* Center-aligned diamond icon with brand's electric aqua cyan */}
      <div className="absolute px-4 bg-[#051122] flex items-center justify-center">
        <span className="relative flex items-center justify-center">
          {/* Subtle glow effect */}
          <span className="absolute w-5 h-5 rounded-full bg-cyan-400/25 blur-xs animate-ping" />
          {/* Electric aqua diamond */}
          <span 
            className="w-2.5 h-2.5 rotate-45 bg-cyan-400 border border-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.6)]" 
          />
        </span>
      </div>
    </div>
  );
};

export default DiamondSeparator;
