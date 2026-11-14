import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Static literal Vite env accesses so `vite build` reliably inlines VITE_* variables
 * at compile time without needing dynamic bracket lookup.
 * Server-only secrets (like SUPABASE_SERVICE_ROLE_KEY) are NEVER read in client code.
 */
const viteSupabaseUrl =
  typeof import.meta !== 'undefined' && import.meta.env
    ? String(import.meta.env.VITE_SUPABASE_URL || '').trim()
    : '';
const viteSupabaseAnonKey =
  typeof import.meta !== 'undefined' && import.meta.env
    ? String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()
    : '';

const nodeSupabaseUrl =
  typeof process !== 'undefined' && process.env
    ? String(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim()
    : '';
const nodeSupabaseAnonKey =
  typeof process !== 'undefined' && process.env
    ? String(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim()
    : '';

const rawSupabaseUrl = viteSupabaseUrl || nodeSupabaseUrl;
const rawSupabaseAnonKey = viteSupabaseAnonKey || nodeSupabaseAnonKey;

const isPlaceholderValue = (val: string): boolean => {
  const lower = val.toLowerCase();
  return (
    !val ||
    lower.includes('your-project') ||
    lower.includes('placeholder') ||
    lower.includes('unconfigured.invalid')
  );
};

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    rawSupabaseUrl &&
      rawSupabaseAnonKey &&
      rawSupabaseUrl.startsWith('https://') &&
      !isPlaceholderValue(rawSupabaseUrl) &&
      !isPlaceholderValue(rawSupabaseAnonKey)
  );
};

// Use inert syntactically valid placeholders ONLY to instantiate the exported client
// when env vars are missing; all callers check isSupabaseConfigured() before querying.
const clientUrl = isSupabaseConfigured() ? rawSupabaseUrl : 'https://unconfigured.invalid';
const clientAnonKey = isSupabaseConfigured() ? rawSupabaseAnonKey : 'unconfigured-anon-key';

export const supabase: SupabaseClient = createClient(clientUrl, clientAnonKey, {
  auth: {
    persistSession: typeof window !== 'undefined' && isSupabaseConfigured(),
    autoRefreshToken: typeof window !== 'undefined' && isSupabaseConfigured(),
    detectSessionInUrl: typeof window !== 'undefined' && isSupabaseConfigured()
  }
});
