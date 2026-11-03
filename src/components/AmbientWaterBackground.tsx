import React, { useEffect, useState } from 'react';

export const AmbientWaterBackground: React.FC = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mq.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, []);

  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* 1. Base Clean Fresh Water Foundation Gradient */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F5FAFC 35%, #F0F9FB 70%, #F5FAFC 100%)'
        }}
      />

      {/* 2. Soft Ambient Aqua & Water Blue Glimmers */}
      <div 
        className={`absolute top-[8%] -left-32 w-[550px] h-[550px] rounded-full blur-[140px] opacity-25 ${reducedMotion ? '' : 'animate-water-glow'}`}
        style={{
          background: 'radial-gradient(circle, #38BDF8 0%, #E0F2FE 50%, transparent 75%)'
        }}
      />

      <div 
        className={`absolute top-[45%] -right-32 w-[600px] h-[600px] rounded-full blur-[160px] opacity-20 ${reducedMotion ? '' : 'animate-water-glow'}`}
        style={{
          background: 'radial-gradient(circle, #0D9488 0%, #CCFBF1 50%, transparent 75%)',
          animationDelay: '-4s'
        }}
      />

      <div 
        className={`absolute top-[80%] left-1/3 w-[550px] h-[550px] rounded-full blur-[150px] opacity-20 ${reducedMotion ? '' : 'animate-water-glow'}`}
        style={{
          background: 'radial-gradient(circle, #38BDF8 0%, #E8F5F3 50%, transparent 75%)',
          animationDelay: '-8s'
        }}
      />

      {/* 3. Subtle Caustic Refraction Lines */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.025]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <pattern id="global-water-caustic-pattern" width="280" height="280" patternUnits="userSpaceOnUse">
          <path 
            d="M 0,70 C 70,30 140,110 210,70 C 280,30 350,110 420,70" 
            fill="none" 
            stroke="#0D9488" 
            strokeWidth="1.2" 
          />
          <path 
            d="M 0,140 C 70,180 140,100 210,140 C 280,180 350,100 420,140" 
            fill="none" 
            stroke="#38BDF8" 
            strokeWidth="1" 
          />
          <path 
            d="M 0,210 C 70,170 140,250 210,210 C 280,170 350,250 420,210" 
            fill="none" 
            stroke="#0D9488" 
            strokeWidth="1" 
          />
        </pattern>
        <rect width="100%" height="100%" fill="url(#global-water-caustic-pattern)" />
      </svg>
    </div>
  );
};
