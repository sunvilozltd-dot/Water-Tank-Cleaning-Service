// Centralized Production Domain & Canonical URL Configuration for Sunviloz Clean Care

/**
 * Returns the centralized production domain without trailing slash.
 * Respects VITE_SITE_URL or SITE_URL environment variables, falling back to the production Vercel domain.
 */
export const getProductionDomain = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) {
    const custom = String(import.meta.env.VITE_SITE_URL).trim().replace(/\/+$/, '');
    // Ensure preview environments (e.g. vercel.app, run.app) do not override the primary production domain
    if (!custom.includes('localhost') && !custom.includes('vercel.app') && !custom.includes('run.app')) {
      return custom;
    }
  }
  return 'https://sunvilozcleancare.com';
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
  // Configurable Google Business Profile URL
  businessProfileUrl: 'https://www.google.com/maps/place/Sunviloz+Clean+Care/@23.8267734,90.4179331,17z/data=!4m8!3m7!1s0x4caea8c73c1a3949:0x3a92e0082947d375!8m2!3d23.8267734!4d90.4179331!9m1!1b1!16s%2Fg%2F11zdmdqbwt',
  // Direct Google Review submission link
  reviewsUrl: 'https://www.google.com/maps/place/Sunviloz+Clean+Care/@23.8266213,90.4190328,15z/data=!4m8!3m7!1s0x4caea8c73c1a3949:0x3a92e0082947d375!8m2!3d23.8267734!4d90.4179331!9m1!1b1!16s%2Fg%2F11zdmdqbwt?entry=ttu',
  // Google Maps Directions link
  directionsUrl: 'https://maps.google.com/maps/dir//Sunviloz+Clean+Care,+Dhaka/@23.8267734,90.4179331',
};
