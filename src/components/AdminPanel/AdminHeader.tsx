import React from 'react';
import { LogOut, Globe, Shield, RefreshCw, User } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface AdminHeaderProps {
  onNavigateHome: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  onNavigateHome, 
  onRefresh,
  isRefreshing = false 
}) => {
  const { adminUser, logout } = useAdminAuth();
  const { lang, setLang } = useLanguage();

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-white font-bold text-base tracking-tight">Sunviloz Admin</span>
              <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50 rounded">
                {adminUser?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
            <p className="text-xs text-slate-400">Water Tank Cleaning Service Portal</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/60 text-xs flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>
          )}

          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          <button
            onClick={onNavigateHome}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors hidden sm:flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>View Site</span>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center space-x-2">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-medium text-slate-200">{adminUser?.name || 'Administrator'}</span>
              <span className="text-[11px] text-slate-400">{adminUser?.email}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors border border-red-900/30"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
