import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  name?: string;
  nameBn?: string;
  path?: string;
  label?: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (path: string) => void;
  lang?: 'en' | 'bn';
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items, 
  onNavigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, 
  lang = 'en' 
}) => {
  return (
    <nav aria-label="Breadcrumb" className="py-2.5 px-4 max-w-7xl mx-auto w-full text-xs text-slate-400">
      <ol className="flex items-center space-x-1.5 flex-wrap">
        <li>
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center hover:text-blue-400 transition font-medium focus-visible:outline-2 focus-visible:outline-[#0B2545] cursor-pointer"
            title="Home"
          >
            <Home className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span>{lang === 'bn' ? 'হোম' : 'Home'}</span>
          </button>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const label = item.label || (lang === 'bn' && item.nameBn ? item.nameBn : item.name) || '';
          const path = item.path || item.href || '/';

          return (
            <li key={path + idx} className="flex items-center space-x-1.5">
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
              {isLast ? (
                <span className="font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-none" aria-current="page">
                  {label}
                </span>
              ) : (
                <button
                  onClick={() => onNavigate(path)}
                  className="hover:text-blue-400 transition font-medium focus-visible:outline-2 focus-visible:outline-[#0B2545] truncate max-w-[150px] sm:max-w-none cursor-pointer"
                >
                  {label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
