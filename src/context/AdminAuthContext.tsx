import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  adminUser: { name: string; email: string; role: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);
const LOCAL_ADMIN_SESSION_KEY = 'sunviloz_admin_temp_session';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localAuthenticated, setLocalAuthenticated] = useState(false);

  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isConfigured) {
        try {
          const { data } = await supabase.auth.getSession();
          if (mounted) {
            setSession(data.session);
            setUser(data.session?.user || null);
          }
        } catch (err) {
          console.error('Supabase getSession error:', err);
        }
      } else {
        // Fallback local session if Supabase env vars not set yet
        const local = sessionStorage.getItem(LOCAL_ADMIN_SESSION_KEY);
        if (local === 'true' && mounted) {
          setLocalAuthenticated(true);
        }
      }
      if (mounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    let subscription: { unsubscribe: () => void } | null = null;
    if (isConfigured) {
      const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
        if (mounted) {
          setSession(newSession);
          setUser(newSession?.user || null);
          setIsLoading(false);
        }
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [isConfigured]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    if (isConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.session) {
          setSession(data.session);
          setUser(data.user);
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Login failed. Please check your credentials.' };
      }
    } else {
      if (email.toLowerCase() === 'sunvilozcleancare@gmail.com' || email.toLowerCase() === 'sunvilozltd@gmail.com' || email.toLowerCase().includes('admin')) {
        sessionStorage.setItem(LOCAL_ADMIN_SESSION_KEY, 'true');
        setLocalAuthenticated(true);
        return { success: true };
      }
      return { 
        success: false, 
        error: 'Invalid login credentials. Set up your Supabase project in .env or login with the administrator email.' 
      };
    }

    return { success: false, error: 'Unknown login error.' };
  };

  const logout = async () => {
    if (isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    sessionStorage.removeItem(LOCAL_ADMIN_SESSION_KEY);
    setLocalAuthenticated(false);
    setUser(null);
    setSession(null);
  };

  const isAuthenticated = Boolean((isConfigured && session) || (!isConfigured && localAuthenticated));

  const adminUser = isAuthenticated ? {
    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Administrator',
    email: user?.email || 'admin@sunviloz.com',
    role: 'super_admin'
  } : null;

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        adminUser,
        isAuthenticated,
        isLoading,
        isDemoMode: !isConfigured,
        login,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
