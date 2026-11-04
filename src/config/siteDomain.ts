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
  businessProfileUrl: 'https://maps.google.com/?q=Sunviloz+Clean+Care+Dhaka',
  // Direct Google Review submission link
  reviewsUrl: 'https://search.google.com/local/writereview?placeid=ChIJc123_sunviloz_clean_care',
  // Google Maps Directions link
  directionsUrl: 'https://maps.google.com/maps/dir//Dhaka,+Bangladesh/@23.8103,90.4125',
};
