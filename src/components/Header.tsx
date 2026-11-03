import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  MessageCircle, 
  Menu, 
  X, 
  Droplets, 
  ShieldCheck, 
  Send,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useHeaderNav } from '../context/HeaderNavContext';
import { NavItem } from '../types/header';

interface HeaderProps {
  onOpenQuoteModal: (serviceName?: string) => void;
  activeView?: 'home' | 'quote' | 'contact' | 'service' | 'blog';
  setActiveView?: (view: 'home' | 'quote' | 'contact' | 'service' | 'blog') => void;
  onSelectService?: (slug: string) => void;
  onOpenAdmin?: () => void;
  onNavigate?: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenQuoteModal,
  activeView = 'home',
  setActiveView,
  onNavigate
}) => {
  const { lang, setLang } = useLanguage();
  const { announcement, images } = useSiteConfig();
  const { headerConfig, navTree } = useHeaderNav();
  const activeLogoUrl = headerConfig.logoUrl || images?.logo;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [mobileExpandedIds, setMobileExpandedIds] = useState<Record<string, boolean>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleNavClick = (item: NavItem) => {
    setMobileMenuOpen(false);
    setActiveDropdownId(null);

    const href = item.url;
    if (!href) return;

    if (item.openNewTab || href.startsWith('http://') || href.startsWith('https://')) {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }

    if (href === '#quote') {
      onOpenQuoteModal();
      return;
    }

    if (onNavigate && href.startsWith('/')) {
      onNavigate(href);
      return;
    }

    if (href.startsWith('/')) {
      const pageKey = href.replace(/^\//, '');
      if (pageKey === '' || pageKey === 'home') {
        if (setActiveView) setActiveView('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (pageKey === 'contact' && setActiveView) {
        setActiveView('contact');
      } else if ((pageKey === 'areas' || pageKey === 'service-areas') && setActiveView) {
        (setActiveView as any)('areas');
      } else if ((pageKey === 'quote' || pageKey === 'get-quote') && setActiveView) {
        setActiveView('quote');
      } else if (pageKey === 'projects' && setActiveView) {
        (setActiveView as any)('projects');
      } else {
        window.location.href = href;
      }
      return;
    }

    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (onNavigate) {
        onNavigate('/' + href);
      }
    }
  };

  const toggleMobileSubmenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMobileExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Determine CTA background style (Fresh Teal #0D9488)
  const getCtaBgClass = () => {
    return 'bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold shadow-sm shadow-[#0D9488]/20 active:scale-95';
  };

  // Header height classes
  const getHeaderHeightPadding = () => {
    if (headerConfig.headerHeight === 'compact') {
      return isScrolled ? 'py-1.5' : 'py-2';
    }
    if (headerConfig.headerHeight === 'spacious') {
      return isScrolled ? 'py-3.5' : 'py-4.5';
    }
    return isScrolled ? 'py-2.5' : 'py-3.5';
  };

  // Visible menu items from navTree
  const visibleNavItems = navTree.filter(item => item.isVisible);

  return (
    <>
      {/* Skip to Main Content Link for Accessibility */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#0D9488] focus:text-white focus:rounded-xl focus:shadow-xl focus:font-bold focus:outline-none"
      >
        {lang === 'bn' ? 'মূল বিষয়বস্তুতে যান (Skip to Main Content)' : 'Skip to main content'}
      </a>

      {/* Top Announcement & Hotline strip */}
      {announcement.enabled && (
        <div className="bg-[#F5FAFC] text-[#172B3A] text-xs py-1.5 px-4 border-b border-[#E2E8F0]" role="region" aria-label="Announcement">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 font-bold text-[#0D9488]">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" aria-hidden="true" />
                {lang === 'bn' ? (announcement.badgeBn || announcement.badgeEn) : announcement.badgeEn}
              </span>
              <span className="hidden md:inline text-[#CBD5E1]" aria-hidden="true">|</span>
              <span className="hidden md:inline text-[#64748B]">
                {lang === 'bn' ? announcement.textBn : announcement.textEn}
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 text-xs">
              {headerConfig.phoneVisible && (
                <a 
                  href={`tel:${headerConfig.phone}`}
                  className="flex items-center gap-1.5 font-bold text-[#123047] hover:text-[#0D9488] transition-colors py-1 focus-visible:outline-2 focus-visible:outline-[#0D9488]"
                  aria-label={`Call hotline ${headerConfig.phoneDisplay}`}
                >
                  <Phone className="w-3.5 h-3.5 text-[#0D9488]" aria-hidden="true" />
                  <span>{headerConfig.phoneDisplay}</span>
                </a>
              )}
              
              {/* Language Switcher */}
              <div className="flex items-center bg-[#E8F5F3] rounded-md p-0.5 border border-[#E2E8F0]" role="group" aria-label="Language selection">
                <button 
                  type="button"
                  onClick={() => setLang('en')}
                  aria-pressed={lang === 'en'}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    lang === 'en' ? 'bg-[#0D9488] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#172B3A]'
                  }`}
                >
                  EN
                </button>
                <button 
                  type="button"
                  onClick={() => setLang('bn')}
                  aria-pressed={lang === 'bn'}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    lang === 'bn' ? 'bg-[#0D9488] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#172B3A]'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dynamic Header - Clean White Background */}
      <header 
        className={`${headerConfig.isSticky ? 'sticky top-0 z-40' : 'relative z-20'} w-full transition-all duration-200 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] ${isScrolled ? 'shadow-sm' : ''} ${getHeaderHeightPadding()}`}
        ref={dropdownRef}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo & Brand Display */}
          <button 
            type="button"
            onClick={() => {
              if (onNavigate) {
                onNavigate('/');
              } else if (setActiveView) {
                setActiveView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                window.location.href = '/';
              }
            }}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-2 focus-visible:outline-[#0D9488] rounded-xl cursor-pointer"
            aria-label={`${headerConfig.brandName} ${headerConfig.brandSuffix} Home`}
          >
            {/* Custom Logo Image or Default Droplet */}
            {headerConfig.logoEnabled && activeLogoUrl ? (
              <img
                src={activeLogoUrl}
                alt={headerConfig.logoAlt || `${headerConfig.brandName} Logo`}
                style={{
                  width: `${headerConfig.logoWidth || 40}px`,
                  height: `${headerConfig.logoHeight || 40}px`
                }}
                className="object-contain group-hover:scale-105 transition-transform bg-transparent"
              />
            ) : headerConfig.logoEnabled ? (
              <div 
                style={{
                  width: `${headerConfig.logoWidth || 40}px`,
                  height: `${headerConfig.logoHeight || 40}px`
                }}
                className="flex items-center justify-center text-[#0D9488] group-hover:scale-105 transition-transform shrink-0 bg-transparent" 
                aria-hidden="true"
              >
                <Droplets className="w-8 h-8 text-[#0D9488]" />
              </div>
            ) : null}

            {/* Brand Title and Tagline */}
            {headerConfig.brandVisible && (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-black tracking-tight text-[#123047] ${
                    headerConfig.brandFontSize === 'sm' ? 'text-lg sm:text-xl' :
                    headerConfig.brandFontSize === 'lg' ? 'text-2xl sm:text-3xl' :
                    headerConfig.brandFontSize === 'xl' ? 'text-3xl sm:text-4xl' :
                    'text-xl sm:text-2xl'
                  }`}>
                    {headerConfig.brandName}
                  </span>
                  {headerConfig.brandSuffix && (
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488] bg-[#E8F5F3] px-1.5 py-0.5 rounded border border-[#0D9488]/30">
                      {headerConfig.brandSuffix}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#64748B] font-medium tracking-wide">
                  {lang === 'bn' ? headerConfig.brandTaglineBn : headerConfig.brandTaglineEn}
                </p>
              </div>
            )}
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Desktop Navigation">
            {visibleNavItems.map((item) => {
              const hasDropdown = item.children && item.children.length > 0;
              const isDropdownOpen = activeDropdownId === item.id;
              const itemLabel = lang === 'bn' ? item.labelBn : (item.labelEn || item.label);

              if (hasDropdown) {
                return (
                  <div key={item.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveDropdownId(isDropdownOpen ? null : item.id)}
                      onMouseEnter={() => setActiveDropdownId(item.id)}
                      className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                        isDropdownOpen ? 'text-[#0D9488] bg-[#E8F5F3]' : 'text-[#172B3A] hover:text-[#0D9488] hover:bg-[#F5FAFC]'
                      }`}
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="true"
                    >
                      <span>{itemLabel}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-[#64748B] ${isDropdownOpen ? 'rotate-180 text-[#0D9488]' : ''}`} />
                    </button>

                    {/* Dropdown Menu Popup */}
                    {isDropdownOpen && (
                      <div 
                        onMouseLeave={() => setActiveDropdownId(null)}
                        className="absolute left-0 top-full mt-1 w-56 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] py-2 z-50 animate-scaleUp"
                      >
                        {item.children!.filter(c => c.isVisible).map(child => (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => handleNavClick(child)}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#172B3A] hover:text-[#0D9488] hover:bg-[#F5FAFC] transition-colors flex items-center justify-between cursor-pointer"
                          >
                            <span>{lang === 'bn' ? child.labelBn : (child.labelEn || child.label)}</span>
                            {child.openNewTab && <ExternalLink className="w-3 h-3 text-[#0D9488]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className="px-3 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer text-[#172B3A] hover:text-[#0D9488] hover:bg-[#F5FAFC] focus-visible:outline-2 focus-visible:outline-[#0D9488]"
                >
                  {itemLabel}
                </button>
              );
            })}
          </nav>

          {/* Desktop & Tablet Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Direct Call Button (Deep Navy #123047) */}
            {headerConfig.phoneVisible && (
              <a
                href={`tel:${headerConfig.phone}`}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 text-xs font-bold text-white bg-[#123047] hover:bg-[#0f2638] rounded-xl transition-all shadow-xs focus-visible:outline-2 focus-visible:outline-[#123047]"
                aria-label={`Call ${headerConfig.phoneDisplay}`}
              >
                <Phone className="w-3.5 h-3.5 text-[#38BDF8]" aria-hidden="true" />
                <span>{headerConfig.phoneDisplay}</span>
              </a>
            )}

            {/* Primary WhatsApp CTA (#25D366) */}
            {headerConfig.whatsappVisible && (
              <a
                href={`https://wa.me/${headerConfig.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(headerConfig.whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba5a] rounded-xl shadow-xs transition-all focus-visible:outline-2 focus-visible:outline-[#25D366]"
              >
                <MessageCircle className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                <span>{headerConfig.whatsappLabelBn || 'WhatsApp'}</span>
              </a>
            )}

            {/* Primary Quote / Action CTA (Fresh Teal #0D9488) */}
            {headerConfig.ctaVisible && (
              <button
                type="button"
                onClick={() => onOpenQuoteModal()}
                className={`inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0D9488] ${getCtaBgClass()}`}
              >
                <Send className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                <span>{lang === 'bn' ? headerConfig.ctaTextBn : headerConfig.ctaTextEn}</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Action Triggers */}
          <div className="flex items-center gap-2 sm:hidden">
            {headerConfig.ctaVisible && (
              <button
                type="button"
                onClick={() => onOpenQuoteModal()}
                className="px-3 min-h-[40px] text-xs font-bold rounded-xl bg-[#0D9488] text-white flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
              >
                {lang === 'bn' ? headerConfig.ctaTextBn : headerConfig.ctaTextEn}
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-[#F5FAFC] border border-[#E2E8F0] text-[#123047] hover:bg-[#E8F5F3] focus-visible:outline-2 focus-visible:outline-[#0D9488] cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#123047]" aria-hidden="true" /> : <Menu className="w-5 h-5 text-[#123047]" aria-hidden="true" />}
            </button>
          </div>

        </div>

        {/* Dynamic Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E2E8F0] bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-fadeIn text-[#172B3A]" role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu">
            {/* Quick Contact Row */}
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#E2E8F0]">
              {headerConfig.phoneVisible && (
                <a
                  href={`tel:${headerConfig.phone}`}
                  className="flex items-center justify-center gap-1.5 min-h-[44px] py-2 text-xs font-bold text-white bg-[#123047] rounded-xl hover:bg-[#0f2638]"
                >
                  <Phone className="w-3.5 h-3.5 text-[#38BDF8]" aria-hidden="true" />
                  <span>{headerConfig.phoneDisplay}</span>
                </a>
              )}

              {headerConfig.whatsappVisible && (
                <a
                  href={`https://wa.me/${headerConfig.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(headerConfig.whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 min-h-[44px] py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba5a] rounded-xl shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                  <span>{headerConfig.whatsappLabelBn || 'WhatsApp'}</span>
                </a>
              )}
            </div>

            {/* Dynamic Mobile Nav Links & Dropdowns */}
            <nav className="flex flex-col space-y-1" aria-label="Mobile Menu Links">
              {visibleNavItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = Boolean(mobileExpandedIds[item.id]);
                const itemLabel = lang === 'bn' ? item.labelBn : (item.labelEn || item.label);

                if (hasChildren) {
                  return (
                    <div key={item.id} className="space-y-1">
                      <div className="flex items-center justify-between rounded-xl hover:bg-[#F5FAFC]">
                        <button
                          type="button"
                          onClick={() => handleNavClick(item)}
                          className="flex-1 text-left py-2.5 px-3 min-h-[44px] flex items-center text-sm font-semibold text-[#172B3A] cursor-pointer"
                        >
                          {itemLabel}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => toggleMobileSubmenu(item.id, e)}
                          className="p-3 text-[#64748B] hover:text-[#172B3A] cursor-pointer"
                          aria-label={`Toggle sub-menu for ${itemLabel}`}
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180 text-[#0D9488]' : ''}`} />
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="pl-6 space-y-1 border-l-2 border-[#E2E8F0] ml-3">
                          {item.children!.filter(c => c.isVisible).map(child => (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => handleNavClick(child)}
                              className="w-full text-left py-2 px-3 rounded-lg text-xs font-semibold text-[#64748B] hover:text-[#0D9488] hover:bg-[#F5FAFC] flex items-center justify-between cursor-pointer"
                            >
                              <span>{lang === 'bn' ? child.labelBn : (child.labelEn || child.label)}</span>
                              {child.openNewTab && <ExternalLink className="w-3 h-3 text-[#0D9488]" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item)}
                    className="text-left py-2.5 px-3 min-h-[44px] flex items-center rounded-xl text-sm font-semibold text-[#172B3A] hover:text-[#0D9488] hover:bg-[#F5FAFC] cursor-pointer"
                  >
                    {itemLabel}
                  </button>
                );
              })}
            </nav>

            {/* Bottom Mobile Booking CTA Button */}
            {headerConfig.ctaVisible && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenQuoteModal();
                  }}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-sm cursor-pointer active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4 text-white" aria-hidden="true" />
                  <span>{lang === 'bn' ? headerConfig.ctaTextBn : headerConfig.ctaTextEn}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};
