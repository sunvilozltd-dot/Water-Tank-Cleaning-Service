import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://ldzhzeyeuthdkobzxzlm.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkemh6ZXlldXRoZGtvYnp4emxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NDI3NjAsImV4cCI6MjEwOTExODc2MH0.lwdie6wt0M8nxjgeo0Z_DfEiYz5iKc5pWa5St9qOazY';

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

const supabaseUrl = viteSupabaseUrl || nodeSupabaseUrl || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = viteSupabaseAnonKey || nodeSupabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl !== 'https://your-project.supabase.co' &&
      !supabaseUrl.includes('your-project') &&
      !supabaseUrl.includes('placeholder')
  );
};

// Create the Supabase client instance connected to Sunviloz Clean Care backend
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: typeof window !== 'undefined',
    detectSessionInUrl: typeof window !== 'undefined'
  }
});
