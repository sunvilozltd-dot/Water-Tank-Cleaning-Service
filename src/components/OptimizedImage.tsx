import React, { useState } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string; // e.g. "16/9", "4/3", "1/1"
  priority?: boolean; // if true, use fetchPriority="high" and loading="eager"
  fallbackSrc?: string;
  className?: string;
  sizes?: string;
}

/**
 * OptimizedImage Component
 * - Generates WebP/AVIF responsive URLs for Unsplash images
 * - Automatically enforces loading="lazy" and decoding="async" for non-priority images
 * - Uses fetchPriority="high" strictly for hero/critical images
 * - Preserves aspect ratio and prevents Cumulative Layout Shift (CLS)
 * - Safe error fallback
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  aspectRatio,
  priority = false,
  fallbackSrc = '/assets/aistudio/hero-rooftop-poster.jpg',
  className = '',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const activeSrc = hasError ? fallbackSrc : src;

  // Enhance Unsplash URLs with modern formats and responsive parameters
  const isUnsplash = activeSrc.includes('images.unsplash.com');

  let avifSrcSet: string | undefined;
  let webpSrcSet: string | undefined;
  let optimizedDefaultSrc = activeSrc;

  if (isUnsplash) {
    const cleanUrl = activeSrc.split('?')[0];
    
    // WebP sources for responsive viewport
    webpSrcSet = `
      ${cleanUrl}?auto=format&fit=crop&w=400&q=75&fm=webp 400w,
      ${cleanUrl}?auto=format&fit=crop&w=800&q=75&fm=webp 800w,
      ${cleanUrl}?auto=format&fit=crop&w=1200&q=75&fm=webp 1200w
    `.trim();

    // AVIF sources (superior compression for browsers that support it)
    avifSrcSet = `
      ${cleanUrl}?auto=format&fit=crop&w=400&q=70&fm=avif 400w,
      ${cleanUrl}?auto=format&fit=crop&w=800&q=70&fm=avif 800w,
      ${cleanUrl}?auto=format&fit=crop&w=1200&q=70&fm=avif 1200w
    `.trim();

    optimizedDefaultSrc = `${cleanUrl}?auto=format&fit=crop&w=800&q=75&fm=webp`;
  }

  const containerStyle: React.CSSProperties = aspectRatio
    ? { aspectRatio, position: 'relative' }
    : {};

  return (
    <picture style={containerStyle} className="inline-block w-full h-full overflow-hidden">
      {/* 1. Prefer AVIF for modern browsers */}
      {avifSrcSet && (
        <source
          type="image/avif"
          srcSet={avifSrcSet}
          sizes={sizes}
        />
      )}

      {/* 2. WebP fallback */}
      {webpSrcSet && (
        <source
          type="image/webp"
          srcSet={webpSrcSet}
          sizes={sizes}
        />
      )}

      {/* 3. Base img element */}
      <img
        src={optimizedDefaultSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onError={() => setHasError(true)}
        className={`${className} transition-opacity duration-300`}
        {...rest}
      />
    </picture>
  );
};

export default OptimizedImage;
