import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { User, Session } from '@supabase/supabase-js';
import { fetchAdminProfile, AdminRole } from '../services/adminUserService';

interface AdminAuthUser {
  name: string;
  email: string;
  role: AdminRole | string;
}

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  adminUser: AdminAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminUser, setAdminUser] = useState<AdminAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isConfigured = isSupabaseConfigured();

  // Validate and sync admin profile for a Supabase session
  const validateAndSetSession = async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setSession(null);
      setUser(null);
      setAdminUser(null);
      return false;
    }

    try {
      const profile = await fetchAdminProfile(currentSession.user.id, currentSession.user.email);
      if (profile) {
        setSession(currentSession);
        setUser(currentSession.user);
        setAdminUser({
          name: profile.name,
          email: profile.email,
          role: profile.role
        });
        return true;
      } else {
        // User exists in auth.users, but is NOT authorized in admin_users table!
        console.warn('[AdminAuth] User lacks admin privileges in admin_users table. Revoking session.');
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setAdminUser(null);
        return false;
      }
    } catch (err) {
      console.error('[AdminAuth] Error validating admin profile:', err);
      setSession(null);
      setUser(null);
      setAdminUser(null);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isConfigured) {
        try {
          const { data } = await supabase.auth.getSession();
          if (mounted && data.session) {
            await validateAndSetSession(data.session);
          }
        } catch (err) {
          console.error('[AdminAuth] Supabase getSession error:', err);
        }
      }
      if (mounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    let subscription: { unsubscribe: () => void } | null = null;
    if (isConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!mounted) return;
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setAdminUser(null);
          setIsLoading(false);
        } else if (newSession) {
          await validateAndSetSession(newSession);
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
      return { success: false, error: 'অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড উভয়ই প্রদান করুন।' };
    }

    if (!isConfigured) {
      return {
        success: false,
        error: 'ডাটাবেজ কনফিগার করা হয়নি। দয়া করে .env ফাইলে Supabase প্রজেক্ট লিংক ও কি (Key) প্রদান করুন।'
      };
    }

    try {
      // 1. Authenticate with Supabase Auth (server-side cryptographic verification)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('invalid login credentials') || msg.includes('invalid grant')) {
          return { success: false, error: 'ভুল ইমেইল বা পাসওয়ার্ড। অনুগ্রহ করে সঠিক তথ্য দিয়ে পুনরায় চেষ্টা করুন।' };
        }
        if (msg.includes('email not confirmed')) {
          return { success: false, error: 'আপনার ইমেইল অ্যাড্রেসটি এখনও ভেরিফাই করা হয়নি। Supabase ড্যাশবোর্ডে গিয়ে ইমেইল কনফার্ম করুন।' };
        }
        return { success: false, error: error.message };
      }

      if (!data.user || !data.session) {
        return { success: false, error: 'অথেনটিকেশন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' };
      }

      // 2. Cryptographic Role-Based Access Control (RBAC) Verification
      // Check if user ID or email exists in public.admin_users table with active status
      const profile = await fetchAdminProfile(data.user.id, data.user.email || email.trim());
      if (!profile) {
        // Immediate security defense: terminate session so unauthorized users cannot stay logged in
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setAdminUser(null);
        return {
          success: false,
          error: 'প্রবেশাধিকার সংরক্ষিত: আপনার অ্যাকাউন্টটি অ্যাডমিন হিসেবে অনুমোদিত নয়। শুধুমাত্র অনুমোদিত অ্যাডমিনরাই লগইন করতে পারবেন।'
        };
      }

      // 3. Grant access and set role
      setSession(data.session);
      setUser(data.user);
      setAdminUser({
        name: profile.name,
        email: profile.email,
        role: profile.role
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'লগইন করতে সমস্যা হচ্ছে। কিছুক্ষণ পর আবার চেষ্টা করুন।' };
    }
  };

  const logout = async () => {
    if (isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('[AdminAuth] Logout error:', err);
      }
    }
    setUser(null);
    setSession(null);
    setAdminUser(null);
  };

  const isAuthenticated = Boolean(isConfigured && session && adminUser);

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        adminUser,
        isAuthenticated,
        isLoading,
        isDemoMode: false,
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
