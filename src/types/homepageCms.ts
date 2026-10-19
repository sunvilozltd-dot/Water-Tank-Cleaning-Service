export type BuiltinSectionType = 
  | 'hero'
  | 'about'
  | 'services'
  | 'whyChoose'
  | 'process'
  | 'pricing'
  | 'calculator'
  | 'beforeAfter'
  | 'reviews'
  | 'areas'
  | 'faq'
  | 'blog'
  | 'video'
  | 'cta'
  | 'custom';

export type CustomSectionTemplate = 
  | 'text_image'
  | 'image_text'
  | 'cards'
  | 'features'
  | 'testimonials'
  | 'statistics'
  | 'gallery'
  | 'video'
  | 'faq'
  | 'cta'
  | 'banner'
  | 'two_column'
  | 'three_column';

export interface HomepageSectionItem {
  id: string;
  sectionId: string;
  title?: string;
  titleBn?: string;
  subtitle?: string;
  subtitleBn?: string;
  description?: string;
  descriptionBn?: string;
  imageUrl?: string;
  icon?: string;
  buttonText?: string;
  buttonTextBn?: string;
  buttonUrl?: string;
  buttonEvent?: string;
  content?: string;
  sortOrder: number;
  isEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomepageSection {
  id: string;
  sectionKey: string;
  sectionType: BuiltinSectionType;
  title?: string;
  titleBn?: string;
  subtitle?: string;
  subtitleBn?: string;
  description?: string;
  descriptionBn?: string;
  badge?: string;
  badgeBn?: string;
  mediaType: 'image' | 'video' | 'youtube' | 'none';
  imageUrl?: string;
  videoUrl?: string;
  mobileVideoUrl?: string;
  posterImageUrl?: string;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  buttonText?: string;
  buttonTextBn?: string;
  buttonUrl?: string;
  buttonIcon?: string;
  buttonEvent?: string; // Tracking event name (e.g. 'cta_click', 'service_booking_start')
  secondaryButtonText?: string;
  secondaryButtonTextBn?: string;
  secondaryButtonUrl?: string;
  secondaryButtonEvent?: string;
  items?: HomepageSectionItem[];
  content?: Record<string, any>;
  settings?: {
    bgStyle?: 'white' | 'slate' | 'blue' | 'cyan' | 'dark' | 'gradient';
    layout?: 'standard' | 'centered' | 'split' | 'grid' | 'cards';
    columns?: 1 | 2 | 3 | 4;
    padding?: 'compact' | 'normal' | 'spacious';
    serviceCount?: number;
    showServicePrices?: boolean;
    showServiceImages?: boolean;
    showServiceButtons?: boolean;
    selectedServiceIds?: string[];
    customTemplate?: CustomSectionTemplate;
    autoplayVideo?: boolean;
    mutedVideo?: boolean;
    loopVideo?: boolean;
    videoEnabled?: boolean;
    overlayOpacity?: number;
    overlayColor?: string;
    [key: string]: any;
  };
  isEnabled: boolean;
  sortOrder: number;
  order?: number;
  status: 'draft' | 'published' | 'hidden';
  createdAt?: string;
  updatedAt?: string;
}
