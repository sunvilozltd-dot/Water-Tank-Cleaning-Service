// Centralized Production Domain & Canonical URL Configuration for Sunviloz Clean Care

/**
 * Default production canonical domain without trailing slash.
 */
export const SITE_DOMAIN = 'https://sunvilozcleancare.com';

export const getProductionDomain = (): string => {
  try {
    const viteEnvUrl =
      typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL
        ? String(import.meta.env.VITE_SITE_URL).trim()
        : '';
    const nodeEnvUrl =
      typeof process !== 'undefined' && process.env?.VITE_SITE_URL
        ? String(process.env.VITE_SITE_URL).trim()
        : '';

    const raw = (viteEnvUrl || nodeEnvUrl).replace(/\/+$/, '');
    if (
      raw &&
      raw.startsWith('https://') &&
      !raw.includes('localhost') &&
      !raw.includes('vercel.app') &&
      !raw.includes('run.app')
    ) {
      return raw;
    }
  } catch {
    // Fallback cleanly to SITE_DOMAIN
  }
  return SITE_DOMAIN;
};

/**
 * Generates an absolute canonical URL for a given path.
 */
export const getCanonicalUrl = (path: string = '/'): string => {
  const base = getProductionDomain();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/') return `${base}/`;
  return `${base}${cleanPath}`;
};

/**
 * Standard business Google integration defaults.
 * Configurable via Site Settings or environment variables.
 */
export const DEFAULT_GOOGLE_CONFIG = {
  businessProfileUrl: 'https://www.google.com/maps/place/Sunviloz+Clean+Care/@23.8267734,90.4179331,17z/data=!4m8!3m7!1s0x4caea8c73c1a3949:0x3a92e0082947d375!8m2!3d23.8267734!4d90.4179331!9m1!1b1!16s%2Fg%2F11zdmdqbwt',
  reviewsUrl: 'https://www.google.com/maps/place/Sunviloz+Clean+Care/@23.8266213,90.4190328,15z/data=!4m8!3m7!1s0x4caea8c73c1a3949:0x3a92e0082947d375!8m2!3d23.8267734!4d90.4179331!9m1!1b1!16s%2Fg%2F11zdmdqbwt?entry=ttu',
  directionsUrl: 'https://maps.google.com/maps/dir//Sunviloz+Clean+Care,+Dhaka/@23.8267734,90.4179331',
};
