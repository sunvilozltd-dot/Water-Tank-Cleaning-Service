import React, { useState } from 'react';
import { Droplets } from 'lucide-react';
import { isDemoOrStockUrl } from '../services/imageSyncService';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string; // e.g. "16/9", "4/3", "1/1", "16/10"
  priority?: boolean;
  className?: string;
  sizes?: string;
}

/**
 * OptimizedImage Component
 * - Automatically enforces loading="lazy" and decoding="async" for non-priority images
 * - Uses fetchPriority="high" strictly for hero/critical images
 * - Preserves aspect ratio and prevents Cumulative Layout Shift (CLS)
 * - Safe neutral unavailable state on error (zero demo or stock photo fallbacks)
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  aspectRatio,
  priority = false,
  className = '',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  // If the URL is explicitly an unwanted demo or stock photo, trigger unavailable state immediately
  const isRejectedSource = isDemoOrStockUrl(src);

  const containerStyle: React.CSSProperties = aspectRatio
    ? { aspectRatio, position: 'relative' }
    : {};

  if (hasError || isRejectedSource || !src) {
    if (isRejectedSource) {
      console.warn('[OptimizedImage] Rejected demo/stock image source:', src);
    }
    return (
      <div 
        style={containerStyle} 
        className={`w-full h-full flex flex-col items-center justify-center bg-[#F1F7F9] border border-[#E2E8F0] p-4 text-center select-none ${className}`}
        aria-label={alt}
      >
        <div className="w-10 h-10 rounded-full bg-[#E0F2FE] flex items-center justify-center mb-1.5 text-[#0D9488]">
          <Droplets className="w-5 h-5 opacity-80" aria-hidden="true" />
        </div>
        <span className="text-[11px] font-medium text-[#64748B] line-clamp-1">{alt}</span>
      </div>
    );
  }

  return (
    <div style={containerStyle} className="inline-block w-full h-full overflow-hidden bg-[#F5FAFC]">
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onError={() => {
          console.warn('[OptimizedImage] Failed to load image from URL:', src);
          setHasError(true);
        }}
        className={`${className} transition-opacity duration-300`}
        {...rest}
      />
    </div>
  );
};

export default OptimizedImage;
