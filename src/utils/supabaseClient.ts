import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnvVar = (key: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch {
    // Ignore access errors
  }
  return '';
};

const DEFAULT_SUPABASE_URL = 'https://ldzhzeyeuthdkobzxzlm.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkemh6ZXlldXRoZGtvYnp4emxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NDI3NjAsImV4cCI6MjEwOTExODc2MH0.lwdie6wt0M8nxjgeo0Z_DfEiYz5iKc5pWa5St9qOazY';

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || DEFAULT_SUPABASE_ANON_KEY;

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
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
