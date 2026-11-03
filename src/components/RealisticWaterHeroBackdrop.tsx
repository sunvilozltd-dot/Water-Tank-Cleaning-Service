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
      {/* 1. Fresh Clean Water Foundation Gradient */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F5FAFC 40%, #E8F5F3 75%, #F0F9FB 100%)'
        }}
      />

      {/* 2. Soft Ambient Aqua & Teal Light Glow Spots */}
      <div 
        className={`absolute -top-20 left-1/4 w-[650px] h-[500px] rounded-full blur-3xl opacity-25 ${reducedMotion ? '' : 'animate-water-glow'}`}
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(13, 148, 136, 0.2) 50%, transparent 75%)'
        }}
      />

      <div 
        className={`absolute top-1/3 -right-20 w-[550px] h-[450px] rounded-full blur-3xl opacity-20 ${reducedMotion ? '' : 'animate-water-glow'}`}
        style={{
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.35) 0%, rgba(56, 189, 248, 0.2) 60%, transparent 80%)',
          animationDelay: '-5s'
        }}
      />

      {/* 3. Gentle Sunlight Shimmer Rays through Fresh Water */}
      <div className="absolute inset-0 opacity-15 overflow-hidden">
        <svg 
          viewBox="0 0 1440 900" 
          className="w-full h-full preserve-3d"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="hero-sun-ray-1" x1="0%" y1="0%" x2="60%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#0D9488" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#E8F5F3" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="hero-sun-ray-2" x1="30%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#E8F5F3" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points="120,0 260,0 650,900 480,900" fill="url(#hero-sun-ray-1)" />
          <polygon points="420,0 520,0 920,900 780,900" fill="url(#hero-sun-ray-2)" />
          <polygon points="760,0 860,0 1280,900 1150,900" fill="url(#hero-sun-ray-1)" />
          <polygon points="1020,0 1110,0 1440,750 1340,900" fill="url(#hero-sun-ray-2)" />
        </svg>
      </div>

      {/* 4. Realistic Water Caustics Grid Layer */}
      <svg 
        className={`absolute inset-0 w-full h-full opacity-10 ${reducedMotion ? '' : 'animate-wave-flow'}`} 
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="caustic-mesh-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path 
          d="M0,120 Q250,180 500,110 T1000,130 M0,240 Q230,190 480,260 T1000,230 M0,380 Q270,420 520,360 T1000,390 M0,490 Q220,530 490,480 T1000,510" 
          stroke="url(#caustic-mesh-stroke)" 
          strokeWidth="1.2" 
          fill="none" 
        />
        <path 
          d="M150,0 Q180,300 120,600 M350,0 Q410,280 370,600 M620,0 Q580,310 640,600 M830,0 Q880,290 820,600" 
          stroke="url(#caustic-mesh-stroke)" 
          strokeWidth="0.8" 
          strokeDasharray="4 8"
          fill="none" 
        />
      </svg>

      {/* 5. Concentric Water Ripples */}
      <div className="absolute top-[22%] right-[15%] w-72 h-72 -translate-x-1/2 -translate-y-1/2">
        <div className={`absolute inset-0 rounded-full border border-[#0D9488]/25 ${reducedMotion ? 'opacity-25 scale-100' : 'animate-water-ripple-1'}`} />
        <div className={`absolute inset-0 rounded-full border border-[#38BDF8]/20 ${reducedMotion ? 'opacity-15 scale-110' : 'animate-water-ripple-2'}`} />
        <div className={`absolute inset-0 rounded-full border border-[#0D9488]/15 ${reducedMotion ? 'opacity-10 scale-125' : 'animate-water-ripple-3'}`} />
      </div>

      <div className="absolute top-[65%] left-[18%] w-80 h-80 -translate-x-1/2 -translate-y-1/2 hidden sm:block">
        <div className={`absolute inset-0 rounded-full border border-[#38BDF8]/25 ${reducedMotion ? 'opacity-20 scale-100' : 'animate-water-ripple-2'}`} />
        <div className={`absolute inset-0 rounded-full border border-[#0D9488]/15 ${reducedMotion ? 'opacity-10 scale-115' : 'animate-water-ripple-3'}`} />
      </div>

      {/* 6. Realistic Specular Water Wave Crest Shimmer across Middle */}
      <div 
        className={`absolute top-1/2 left-0 right-0 h-32 opacity-15 pointer-events-none ${reducedMotion ? '' : 'animate-water-gleam'}`}
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(232, 245, 243, 0.7) 30%, rgba(56, 189, 248, 0.4) 50%, rgba(232, 245, 243, 0.7) 70%, transparent 100%)',
          filter: 'blur(8px)'
        }}
      />

      {/* 7. Flowing Organic Water Wave Crests at the Bottom */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10">
        <div className={`w-[120%] -ml-[10%] ${reducedMotion ? '' : 'animate-wave-flow-reverse'}`}>
          <svg 
            viewBox="0 0 1440 120" 
            className="w-full h-12 sm:h-16 text-[#F5FAFC]/80 fill-current"
            preserveAspectRatio="none"
          >
            <path d="M0,32L48,42.7C96,53,192,75,288,74.7C384,75,480,53,576,42.7C672,32,768,32,864,48C960,64,1056,96,1152,96C1248,96,1344,64,1392,48L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
          </svg>
        </div>

        <div className={`w-[120%] -ml-[5%] -mt-6 sm:-mt-8 ${reducedMotion ? '' : 'animate-wave-flow'}`}>
          <svg 
            viewBox="0 0 1440 120" 
            className="w-full h-14 sm:h-20 text-[#F5FAFC] fill-current"
            preserveAspectRatio="none"
          >
            <path d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,85.3C672,96,768,96,864,85.3C960,75,1056,53,1152,42.7C1248,32,1344,32,1392,32L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
          </svg>
        </div>

        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#0D9488]/30 to-transparent shadow-[0_0_8px_rgba(13,148,136,0.3)]" />
      </div>
    </div>
  );
};
