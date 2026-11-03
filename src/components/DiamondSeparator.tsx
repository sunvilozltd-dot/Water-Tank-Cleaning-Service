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
      {/* Horizontal subtle line with brand teal shimmer */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#0D9488]/30 to-transparent" />
      
      {/* Center-aligned diamond icon on clean soft background */}
      <div className="absolute px-4 bg-[#F5FAFC] flex items-center justify-center">
        <span className="relative flex items-center justify-center">
          {/* Subtle glow effect */}
          <span className="absolute w-5 h-5 rounded-full bg-[#0D9488]/20 blur-xs animate-ping" />
          {/* Official teal diamond with water blue accent border */}
          <span 
            className="w-2.5 h-2.5 rotate-45 bg-[#0D9488] border border-[#38BDF8] shadow-[0_0_8px_rgba(13,148,136,0.35)]" 
          />
        </span>
      </div>
    </div>
  );
};

export default DiamondSeparator;
