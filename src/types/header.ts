export interface HeaderConfig {
  id: string; // 'primary'
  logoUrl?: string;
  logoAlt: string;
  logoWidth: number; // in pixels (e.g. 40)
  logoHeight: number; // in pixels (e.g. 40)
  logoEnabled: boolean;
  logoDestination: string; // URL on click (default '/')
  logoPosition: 'left' | 'center';
  brandName: string; // 'Sunviloz'
  brandSuffix: string; // 'Clean Care'
  brandTaglineBn: string; // 'ঢাকা শহরের নির্ভরযোগ্য ওয়াটার ট্যাংক ক্লিনিং সার্ভিস'
  brandTaglineEn: string; // 'Water Tank Cleaning • Dhaka'
  brandVisible: boolean;
  brandFontSize: 'sm' | 'base' | 'lg' | 'xl';
  phone: string; // tel link '+8801609999612'
  phoneDisplay: string; // formatted text '01609-999612'
  phoneLabelBn?: string;
  phoneLabelEn?: string;
  phoneVisible: boolean;
  whatsappNumber: string; // '8801609999612'
  whatsappLabelBn: string; // 'WhatsApp'
  whatsappLabelEn: string; // 'WhatsApp'
  whatsappMessage: string; // Pre-filled template
  whatsappVisible: boolean;
  ctaTextBn: string; // 'কোটেশন নিন' (or 'ফ্রি কোটেশন')
  ctaTextEn: string; // 'Get Free Quote'
  ctaUrl: string; // '#quote', '/get-quote', or action
  ctaVisible: boolean;
  ctaStyle: 'navy' | 'emerald' | 'cyan' | 'gradient';
  // Design Settings
  headerHeight: 'compact' | 'standard' | 'spacious';
  isSticky: boolean;
  showShadow: boolean;
  headerBgColor: string; // '#ffffff'
  menuTextColor: string; // '#334155'
  menuActiveColor: string; // '#0B2545'
  menuHoverColor: string; // '#0284C7'
  updatedAt?: string;
}

export interface NavItem {
  id: string;
  label: string; // English
  labelBn: string; // Bangla
  labelEn?: string;
  url: string; // internal anchor or route
  icon?: string;
  openNewTab?: boolean;
  isVisible: boolean;
  sortOrder: number;
  parentId?: string | null;
  children?: NavItem[];
  createdAt?: string;
  updatedAt?: string;
}
