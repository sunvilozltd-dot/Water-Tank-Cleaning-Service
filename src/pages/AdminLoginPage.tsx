import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { SeoHead } from '../components/SeoHead';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome
}) => {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMsg(res.error || 'Invalid email or password. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080A0D] flex items-center justify-center p-4 relative overflow-hidden">
      <SeoHead
        title="Admin Portal Login | Sunviloz Clean Care"
        description="Administrative management portal for Sunviloz Clean Care."
      />

      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#2585FF]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#11151B] border border-[#303743] rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#2585FF] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#2585FF]/20">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sunviloz Admin Portal</h1>
          <p className="text-xs text-[#B8C0CC]">Sign in to manage Homepage CMS, running offers, leads &amp; settings</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#B8C0CC] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#B8C0CC]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#171C24] border border-[#303743] rounded-xl text-sm text-white placeholder-[#B8C0CC]/40 focus:outline-none focus:border-[#2585FF]"
                placeholder="admin@sunviloz.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#B8C0CC] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#B8C0CC]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#171C24] border border-[#303743] rounded-xl text-sm text-white placeholder-[#B8C0CC]/40 focus:outline-none focus:border-[#2585FF]"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2585FF] hover:bg-[#1a73e8] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#2585FF]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In as Administrator'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-[#303743] text-center">
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-xs text-[#B8C0CC] hover:text-white transition-colors cursor-pointer"
          >
            ← Back to Public Homepage
          </button>
        </div>
      </div>
    </main>
  );
};
