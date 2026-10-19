/**
 * Client-side image compression and resizing utility.
 * Compresses uploaded images using HTML5 Canvas to ensure they are lightweight
 * (typically under 40KB), crystal-clear, and preserve transparency for PNG/SVG/WebP logos.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
  preserveTransparency?: boolean;
}

/**
 * Compresses an image file (PNG, JPG, WebP, SVG) to a lightweight Base64 Data URL.
 * Preserves transparency for PNG/WebP/SVG logos!
 */
export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
  const isWebp = file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp');
  const shouldPreserveTransparency = options.preserveTransparency ?? (isPng || isSvg || isWebp);

  // SVG files are already vector code; preserve directly as data URL if small
  if (isSvg && file.size < 200 * 1024) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read SVG file'));
      reader.readAsDataURL(file);
    });
  }

  const {
    maxWidth = 900,
    maxHeight = 700,
    quality = 0.75,
    format = shouldPreserveTransparency ? (isPng ? 'image/png' : 'image/webp') : 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        // Fallback to original data URL if decode fails
        resolve(event.target?.result as string);
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate aspect ratio scale
          if (width > maxWidth || height > maxHeight) {
            const widthRatio = maxWidth / width;
            const heightRatio = maxHeight / height;
            const ratio = Math.min(widthRatio, heightRatio);

            width = Math.max(1, Math.round(width * ratio));
            height = Math.max(1, Math.round(height * ratio));
          }

          // Offscreen Canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d', { alpha: shouldPreserveTransparency });
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          // For non-transparent JPEG images only, fill white background to prevent black edges
          if (!shouldPreserveTransparency && format === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          } else {
            // Clear transparent rect for transparent PNG/WebP
            ctx.clearRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Export compressed data URL
          let compressedDataUrl: string;
          try {
            compressedDataUrl = canvas.toDataURL(format, quality);
          } catch {
            compressedDataUrl = canvas.toDataURL('image/png');
          }

          // If still over 150KB for JPEG/WebP, do a second lighter pass
          if (compressedDataUrl.length > 150000 && format !== 'image/png' && quality > 0.5) {
            try {
              const lowerQualityUrl = canvas.toDataURL(format, 0.58);
              resolve(lowerQualityUrl);
              return;
            } catch {
              // Ignore
            }
          }

          resolve(compressedDataUrl);
        } catch (err) {
          console.warn('Canvas compression failed, falling back to original data:', err);
          resolve(event.target?.result as string);
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
