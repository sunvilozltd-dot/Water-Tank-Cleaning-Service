import React from 'react';

interface RealisticWaterHeroBackdropProps {
  reducedMotion?: boolean;
  className?: string;
}

export const RealisticWaterHeroBackdrop: React.FC<RealisticWaterHeroBackdropProps> = ({
  reducedMotion = false,
  className = ''
}) => {
  return (
    <div 
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* 1. Deep Crystal Water Foundation Gradient */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'radial-gradient(ellipse 90% 80% at 50% -10%, #0c356a 0%, #061a38 45%, #030b18 85%, #020710 100%)'
        }}
      />

      {/* 2. Aqua & Cyan Sunlit Water Glow Spots */}
      <div 
        className={`absolute -top-24 left-1/4 w-[650px] h-[500px] rounded-full blur-3xl opacity-35 ${reducedMotion ? '' : 'animate-water-glow'}`}
        style={{
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.5) 0%, rgba(6, 182, 212, 0.25) 50%, transparent 75%)'
        }}
      />

      <div 
        className={`absolute top-1/3 -right-20 w-[550px] h-[450px] rounded-full blur-3xl opacity-25 ${reducedMotion ? '' : 'animate-water-glow'}`}
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, rgba(2, 132, 199, 0.2) 60%, transparent 80%)',
          animationDelay: '-5s'
        }}
      />

      {/* 3. Sunlight Rays through Water (Ethereal Caustic Rays) */}
      <div className="absolute inset-0 opacity-20 overflow-hidden mix-blend-screen">
        <svg 
          viewBox="0 0 1440 900" 
          className="w-full h-full preserve-3d"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="sun-ray-1" x1="0%" y1="0%" x2="60%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.7" />
              <stop offset="40%" stopColor="#06B6D4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sun-ray-2" x1="30%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0369A1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points="120,0 260,0 650,900 480,900" fill="url(#sun-ray-1)" />
          <polygon points="420,0 520,0 920,900 780,900" fill="url(#sun-ray-2)" />
          <polygon points="760,0 860,0 1280,900 1150,900" fill="url(#sun-ray-1)" />
          <polygon points="1020,0 1110,0 1440,750 1340,900" fill="url(#sun-ray-2)" />
        </svg>
      </div>

      {/* 4. Realistic Water Caustics Pattern Layer */}
      <div 
        className={`absolute inset-0 opacity-25 mix-blend-screen ${reducedMotion ? '' : 'animate-caustic-drift'}`}
        style={{
          backgroundImage: `radial-gradient(ellipse at 30% 40%, rgba(56, 189, 248, 0.45) 0%, transparent 60%),
                            radial-gradient(ellipse at 70% 30%, rgba(6, 182, 212, 0.4) 0%, transparent 55%),
                            radial-gradient(ellipse at 50% 80%, rgba(14, 165, 233, 0.35) 0%, transparent 65%)`
        }}
      />

      {/* Detailed SVG Caustic Web Grid */}
      <svg 
        className={`absolute inset-0 w-full h-full opacity-18 mix-blend-overlay ${reducedMotion ? '' : 'animate-wave-flow'}`} 
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="caustic-mesh-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path 
          d="M0,120 Q250,180 500,110 T1000,130 M0,240 Q230,190 480,260 T1000,230 M0,380 Q270,420 520,360 T1000,390 M0,490 Q220,530 490,480 T1000,510" 
          stroke="url(#caustic-mesh-stroke)" 
          strokeWidth="1.5" 
          fill="none" 
        />
        <path 
          d="M150,0 Q180,300 120,600 M350,0 Q410,280 370,600 M620,0 Q580,310 640,600 M830,0 Q880,290 820,600" 
          stroke="url(#caustic-mesh-stroke)" 
          strokeWidth="1" 
          strokeDasharray="4 8"
          fill="none" 
        />
      </svg>

      {/* 5. Concentric Water Ripples: Emitting from 2 natural focal points */}
      {/* Focal Point 1: Upper Right */}
      <div className="absolute top-[22%] right-[15%] w-72 h-72 -translate-x-1/2 -translate-y-1/2">
        <div className={`absolute inset-0 rounded-full border border-cyan-300/40 ${reducedMotion ? 'opacity-30 scale-100' : 'animate-water-ripple-1'}`} />
        <div className={`absolute inset-0 rounded-full border border-sky-300/30 ${reducedMotion ? 'opacity-20 scale-110' : 'animate-water-ripple-2'}`} />
        <div className={`absolute inset-0 rounded-full border border-blue-400/20 ${reducedMotion ? 'opacity-10 scale-125' : 'animate-water-ripple-3'}`} />
        <div className="absolute inset-[44%] rounded-full bg-cyan-200/50 blur-[2px]" />
      </div>

      {/* Focal Point 2: Center Left */}
      <div className="absolute top-[65%] left-[18%] w-80 h-80 -translate-x-1/2 -translate-y-1/2 hidden sm:block">
        <div className={`absolute inset-0 rounded-full border border-cyan-400/35 ${reducedMotion ? 'opacity-25 scale-100' : 'animate-water-ripple-2'}`} />
        <div className={`absolute inset-0 rounded-full border border-sky-400/25 ${reducedMotion ? 'opacity-15 scale-115' : 'animate-water-ripple-3'}`} />
        <div className={`absolute inset-0 rounded-full border border-teal-300/20 ${reducedMotion ? 'opacity-10 scale-130' : 'animate-water-ripple-1'}`} />
      </div>

      {/* 6. Realistic Specular Water Wave Crest Shimmer across Middle */}
      <div 
        className={`absolute top-1/2 left-0 right-0 h-40 opacity-20 pointer-events-none mix-blend-screen ${reducedMotion ? '' : 'animate-water-gleam'}`}
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(224, 242, 254, 0.4) 30%, rgba(56, 189, 248, 0.6) 50%, rgba(224, 242, 254, 0.4) 70%, transparent 100%)',
          filter: 'blur(10px)'
        }}
      />

      {/* 7. Flowing Organic Water Wave Crests at the Bottom (Transitioning gracefully to next section) */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10">
        {/* Wave Layer 1: Back slow wave */}
        <div className={`w-[120%] -ml-[10%] ${reducedMotion ? '' : 'animate-wave-flow-reverse'}`}>
          <svg 
            viewBox="0 0 1440 120" 
            className="w-full h-14 sm:h-20 text-[#08172c]/75 fill-current"
            preserveAspectRatio="none"
          >
            <path d="M0,32L48,42.7C96,53,192,75,288,74.7C384,75,480,53,576,42.7C672,32,768,32,864,48C960,64,1056,96,1152,96C1248,96,1344,64,1392,48L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
          </svg>
        </div>

        {/* Wave Layer 2: Front organic wave in pure deep ocean aqua navy */}
        <div className={`w-[120%] -ml-[5%] -mt-6 sm:-mt-9 ${reducedMotion ? '' : 'animate-wave-flow'}`}>
          <svg 
            viewBox="0 0 1440 120" 
            className="w-full h-16 sm:h-24 text-[#061426] fill-current"
            preserveAspectRatio="none"
          >
            <path d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,85.3C672,96,768,96,864,85.3C960,75,1056,53,1152,42.7C1248,32,1344,32,1392,32L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
          </svg>
        </div>

        {/* Subtle glowing wave rim line in electric cyan */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent shadow-[0_0_12px_rgba(56,189,248,0.5)]" />
      </div>
    </div>
  );
};
