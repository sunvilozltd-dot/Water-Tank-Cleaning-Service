import { HomepageSection, HomepageSectionItem, BuiltinSectionType, CustomSectionTemplate } from '../types/homepageCms';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { safeGetItem, safeSetItem } from '../utils/safeLocalStorage';

const HOMEPAGE_CACHE_KEY = 'sunviloz_homepage_sections_v2';
export const HOMEPAGE_CMS_EVENT = 'sunviloz_homepage_sections_changed';

// Default built-in homepage sections matching existing professional branding
export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  {
    id: 'sec-hero',
    sectionKey: 'hero',
    sectionType: 'hero',
    title: 'Professional Water Tank Cleaning Service in Dhaka',
    titleBn: 'ঢাকায় প্রফেশনাল ওয়াটার ট্যাংক ক্লিনিং সার্ভিস',
    subtitle: 'Deep cleaning for rooftop and underground water tanks with a professional, hygienic and customer-focused cleaning process.',
    subtitleBn: 'নিয়মিত পানির ট্যাংক পরিষ্কার রাখা আপনার ও পরিবারের সুস্থতার জন্য জরুরি। আপনার ট্যাংকের তথ্য জানিয়ে রিকোয়েস্ট করুন, আমাদের টিম সঠিক কোটেশন প্রদান করবে।',
    description: 'Serving residential apartments, corporate offices, and commercial buildings across all areas in Dhaka.',
    descriptionBn: 'ঢাকা শহরের সকল এলাকায় বাসা-বাড়ি ও বাণিজ্যিক ভবনের ওয়াটার ট্যাংক ও পাইপলাইন গভীর পরিষ্কার সেবা।',
    badge: 'Serving All Areas Across Dhaka',
    badgeBn: 'ঢাকা শহরের সকল এলাকায় সার্ভিস প্রদান',
    mediaType: 'video',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
    videoUrl: '/videos/tank-cleaning-desktop.mp4',
    mobileVideoUrl: '/videos/tank-cleaning-mobile.mp4',
    posterImageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
    buttonText: 'Request a Quote',
    buttonTextBn: 'কোটেশন রিকোয়েস্ট করুন',
    buttonUrl: '#quote',
    buttonEvent: 'quote_request',
    secondaryButtonText: 'Chat on WhatsApp',
    secondaryButtonTextBn: 'WhatsApp-এ যোগাযোগ',
    secondaryButtonUrl: 'https://wa.me/8801609999612',
    secondaryButtonEvent: 'whatsapp_click',
    settings: {
      bgStyle: 'white',
      layout: 'centered',
      videoEnabled: true,
      overlayOpacity: 0.72,
      overlayColor: 'navy'
    },
    isEnabled: true,
    sortOrder: 1,
    status: 'published'
  },
  {
    id: 'sec-popular-services',
    sectionKey: 'popularServices',
    sectionType: 'services',
    title: 'Popular Services',
    titleBn: 'আমাদের জনপ্রিয় সেবাসমূহ',
    subtitle: 'Reliable water tank and pipeline cleaning for homes and buildings',
    subtitleBn: 'আপনার বাসা ও ভবনের পানির ট্যাংক এবং পানির পাইপলাইন পরিষ্কারে নির্ভরযোগ্য সার্ভিস।',
    mediaType: 'none',
    settings: {
      bgStyle: 'dark'
    },
    isEnabled: true,
    sortOrder: 2,
    status: 'published'
  },
  {
    id: 'sec-other-services',
    sectionKey: 'otherServices',
    sectionType: 'services',
    title: 'Our Other Services',
    titleBn: 'আমাদের অন্যান্য সেবা',
    subtitle: 'Explore our additional cleaning services for homes, offices, and commercial spaces',
    subtitleBn: 'আপনার বাসা, অফিস ও বাণিজ্যিক স্থাপনার পরিচ্ছন্নতার জন্য আমাদের অন্যান্য সেবাগুলো দেখুন।',
    mediaType: 'none',
    settings: {
      bgStyle: 'dark'
    },
    isEnabled: true,
    sortOrder: 3,
    status: 'published'
  },
  {
    id: 'sec-about',
    sectionKey: 'about',
    sectionType: 'about',
    title: 'About SUNVILOZ Clean Care',
    titleBn: 'আমাদের সম্পর্কে',
    subtitle: 'Dedicated Water Hygiene Specialist in Dhaka',
    subtitleBn: 'নিরাপদ খাদ্য-বান্ধব উপাদান ও আধুনিক প্রযুক্তিতে পরিষ্কার',
    description: 'Serving residential apartments, corporate offices, and commercial buildings across all areas in Dhaka.',
    descriptionBn: 'আমরা ক্ষতিকর এসিডমুক্ত আধুনিক মেশিনারিজ এবং ফুড-গ্রেড ডিসইনফেক্ট্যান্ট ব্যবহার করি।',
    mediaType: 'none',
    settings: {
      bgStyle: 'dark',
      layout: 'cards'
    },
    isEnabled: true,
    sortOrder: 4,
    status: 'published'
  },
  {
    id: 'sec-whyChoose',
    sectionKey: 'whyChoose',
    sectionType: 'whyChoose',
    title: 'Why SUNVILOZ Clean Care?',
    titleBn: 'কেন সানভিলোজ ক্লিন কেয়ার বেছে নেবেন?',
    subtitle: 'Dependable, professional cleaning through genuine operational competence',
    subtitleBn: 'প্রশিক্ষিত টেকনিশিয়ান ও আধুনিক মেশিনের সুনিশ্চিত সেবা',
    mediaType: 'none',
    settings: {
      bgStyle: 'dark'
    },
    isEnabled: true,
    sortOrder: 5,
    status: 'published'
  },
  {
    id: 'sec-allServicesFaq',
    sectionKey: 'allServicesFaq',
    sectionType: 'faq',
    title: 'All Services FAQ Discovery',
    titleBn: 'সকল সার্ভিসের সচরাচর জিজ্ঞাসিত প্রশ্নাবলী',
    subtitle: 'Find comprehensive answers and information for all our specialized services',
    subtitleBn: 'আমাদের বিভিন্ন সার্ভিসের পদ্ধতি, খরচ, বুকিং এবং প্রয়োজনীয় তথ্য জানতে আপনার পছন্দের সার্ভিস নির্বাচন করুন।',
    mediaType: 'none',
    settings: {
      bgStyle: 'dark'
    },
    isEnabled: true,
    sortOrder: 6,
    status: 'published'
  },
  {
    id: 'sec-problem',
    sectionKey: 'problem',
    sectionType: 'whyChoose',
    title: 'Is Your Water Tank Secretly Contaminated?',
    titleBn: 'আপনার পানির ট্যাংক কি দীর্ঘদিন ধরে অপরিচ্ছন্ন?',
    subtitle: 'Hidden dangers in untreated water storage',
    subtitleBn: 'শ্যাওলা, ওয়াসা পলি ও ব্যাকটেরিয়ার নীরব বিস্তার',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=75',
    buttonText: 'Check Cleaning Prices',
    buttonTextBn: 'ট্যাংক পরিষ্কারের কোটেশন জানুন',
    buttonUrl: '#pricing',
    buttonEvent: 'cta_click',
    settings: {
      bgStyle: 'slate',
      layout: 'split'
    },
    isEnabled: true,
    sortOrder: 4,
    status: 'published'
  },
  {
    id: 'sec-process',
    sectionKey: 'process',
    sectionType: 'process',
    title: 'Our Scientific 6-Stage Cleaning Process',
    titleBn: 'বিজ্ঞানসম্মত আধুনিক ৯-ধাপ ক্লিনিং পদ্ধতি',
    subtitle: 'Step-by-step mechanized sanitization',
    subtitleBn: 'নিরাপদ রোটারি ওয়াশ ও খাদ্য-বান্ধব জীবাণুমুক্তকরণ',
    mediaType: 'none',
    buttonText: 'Book a Cleaning Today',
    buttonTextBn: 'আজই বুক করুন',
    buttonUrl: '#quote',
    buttonEvent: 'service_booking_start',
    settings: {
      bgStyle: 'white'
    },
    isEnabled: false,
    sortOrder: 15,
    status: 'draft'
  },
  {
    id: 'sec-beforeAfter',
    sectionKey: 'beforeAfter',
    sectionType: 'beforeAfter',
    title: 'Real Work Transformation & Video Showcase',
    titleBn: 'ক্লিনিংয়ের বাস্তব ফলাফল: Before & After',
    subtitle: 'See the visible difference before and after our deep clean',
    subtitleBn: 'বাস্তব প্রজেক্টের ভিডিও ও ছবিসমূহ সরাসরি দেখুন',
    mediaType: 'youtube',
    youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    youtubeVideoId: 'ScMzIvxBSi4',
    settings: {
      bgStyle: 'slate',
      autoplayVideo: false
    },
    isEnabled: true,
    sortOrder: 6,
    status: 'published'
  },
  {
    id: 'sec-pricing',
    sectionKey: 'pricing',
    sectionType: 'pricing',
    title: 'Transparent Pricing & Packages',
    titleBn: 'সার্ভিস প্যাকেজ ও কোটেশন প্রক্রিয়া',
    subtitle: 'No hidden charges. Standardized rates across Dhaka.',
    subtitleBn: 'ট্যাংকের ধরন ও সাইজ অনুযায়ী সম্পূর্ণ স্বচ্ছ কোটেশন',
    mediaType: 'none',
    settings: {
      bgStyle: 'white'
    },
    isEnabled: true,
    sortOrder: 7,
    status: 'published'
  },
  {
    id: 'sec-calculator',
    sectionKey: 'calculator',
    sectionType: 'calculator',
    title: 'Instant Cost Estimator',
    titleBn: 'কোটেশন রিকোয়েস্ট ফর্ম',
    subtitle: 'Calculate estimated cost based on your tank type and size',
    subtitleBn: 'আপনার ট্যাংকের বিবরণ দিয়ে সঠিক কোটেশন গ্রহণ করুন',
    mediaType: 'none',
    settings: {
      bgStyle: 'slate'
    },
    isEnabled: true,
    sortOrder: 8,
    status: 'published'
  },
  {
    id: 'sec-howItWorks',
    sectionKey: 'howItWorks',
    sectionType: 'process',
    title: 'How It Works (Easy 3 Steps)',
    titleBn: 'সহজ ৩ ধাপে সার্ভিস গ্রহণ',
    subtitle: 'Quick and hassle-free scheduling',
    subtitleBn: 'বুকিং থেকে সম্পন্ন হওয়া পর্যন্ত নির্বিঘ্ন সেবা',
    mediaType: 'none',
    settings: {
      bgStyle: 'white'
    },
    isEnabled: true,
    sortOrder: 9,
    status: 'published'
  },
  {
    id: 'sec-areas',
    sectionKey: 'areas',
    sectionType: 'areas',
    title: 'Dhaka City Coverage & Areas',
    titleBn: 'ঢাকা শহরের কভারেজ এলাকাসমূহ',
    subtitle: 'Dedicated technician teams in Uttara, Gulshan, Dhanmondi, Mirpur & beyond',
    subtitleBn: 'উত্তরা, গুলশান, বনানী, ধানমন্ডি, মিরপুর ও সব প্রধান এলাকায় সক্রিয় টিম',
    mediaType: 'none',
    settings: {
      bgStyle: 'slate'
    },
    isEnabled: true,
    sortOrder: 10,
    status: 'published'
  },
  {
    id: 'sec-whyChoose',
    sectionKey: 'whyChooseUs',
    sectionType: 'whyChoose',
    title: 'Why Choose Sunviloz Clean Care',
    titleBn: 'কেন সানভিলোজ ক্লিন কেয়ার বেছে নেবেন?',
    subtitle: 'Excellence in customer satisfaction and clean water hygiene',
    subtitleBn: 'প্রশিক্ষিত টেকনিশিয়ান ও আধুনিক মেশিনের সুনিশ্চিত সেবা',
    mediaType: 'none',
    settings: {
      bgStyle: 'white'
    },
    isEnabled: true,
    sortOrder: 11,
    status: 'published'
  },
  {
    id: 'sec-reviews',
    sectionKey: 'reviews',
    sectionType: 'reviews',
    title: 'Real Customer Reviews & Feedback',
    titleBn: 'গ্রাহকদের বাস্তব অভিজ্ঞতা ও মতামত',
    subtitle: 'Trusted by over 1,500+ homes and institutions in Dhaka',
    subtitleBn: 'ঢাকা শহরের বিভিন্ন বাড়ি ও ভবনের সন্তুষ্ট গ্রাহকদের রিভিউ',
    mediaType: 'none',
    settings: {
      bgStyle: 'slate'
    },
    isEnabled: true,
    sortOrder: 12,
    status: 'published'
  },
  {
    id: 'sec-blog',
    sectionKey: 'blog',
    sectionType: 'blog',
    title: 'Water Health & Cleaning Tips (Blog)',
    titleBn: 'পানি সুরক্ষা ও ট্যাংক রক্ষণাবেক্ষণ গাইড',
    subtitle: 'Expert hygiene guides for homeowners and building managers',
    subtitleBn: 'নিয়মিত পরামর্শ ও বিজ্ঞানসম্মত গাইডলাইন',
    mediaType: 'none',
    settings: {
      bgStyle: 'white'
    },
    isEnabled: true,
    sortOrder: 13,
    status: 'published'
  },
  {
    id: 'sec-faq',
    sectionKey: 'faq',
    sectionType: 'faq',
    title: 'Frequently Asked Questions (FAQ)',
    titleBn: 'সাধারণ জিজ্ঞাসা ও প্রশ্নোত্তর (FAQ)',
    subtitle: 'Answers to common questions regarding tank cleaning',
    subtitleBn: 'ট্যাংক ক্লিনিং সম্পর্কিত আপনার যেকোনো প্রশ্নের উত্তর',
    mediaType: 'none',
    settings: {
      bgStyle: 'slate'
    },
    isEnabled: false,
    sortOrder: 16,
    status: 'draft'
  },
  {
    id: 'sec-finalCta',
    sectionKey: 'finalCta',
    sectionType: 'cta',
    title: 'Ready for 100% Hygienic Water?',
    titleBn: 'নিরাপদ ও বিশুদ্ধ পানির জন্য আজই যোগাযোগ করুন',
    subtitle: 'Book your service today or speak with our water hygiene engineer.',
    subtitleBn: 'আমরা ঢাকা শহরের যেকোনো প্রান্তে দ্রুততম সময়ে সেবা প্রদান করি।',
    mediaType: 'none',
    buttonText: 'Get Instant Free Quote',
    buttonTextBn: 'কোটেশন রিকোয়েস্ট করুন',
    buttonUrl: '#quote',
    buttonEvent: 'quote_request',
    secondaryButtonText: 'Chat on WhatsApp',
    secondaryButtonTextBn: 'WhatsApp এ চ্যাট করুন',
    secondaryButtonUrl: 'https://wa.me/8801609999612',
    secondaryButtonEvent: 'whatsapp_click',
    settings: {
      bgStyle: 'blue'
    },
    isEnabled: true,
    sortOrder: 15,
    status: 'published'
  }
];

function notifyHomepageCms() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(HOMEPAGE_CMS_EVENT));
  }
}

/**
 * Fetch all Homepage Sections from Supabase or Cache
 */
export async function getHomepageSections(): Promise<HomepageSection[]> {
  let sections: HomepageSection[] = DEFAULT_HOMEPAGE_SECTIONS;

  if (typeof window !== 'undefined') {
    try {
      const raw = safeGetItem(HOMEPAGE_CACHE_KEY);
      if (raw) {
        sections = JSON.parse(raw);
      }
    } catch {
      // Ignore
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        sections = data.map((d: any) => ({
          id: d.id,
          sectionKey: d.section_key,
          sectionType: d.section_type as BuiltinSectionType,
          title: d.title,
          titleBn: d.title_bn,
          subtitle: d.subtitle,
          subtitleBn: d.subtitle_bn,
          description: d.description,
          descriptionBn: d.description_bn,
          badge: d.badge,
          badgeBn: d.badge_bn,
          mediaType: d.media_type || 'image',
          imageUrl: d.image_url,
          videoUrl: d.video_url,
          mobileVideoUrl: d.mobile_video_url,
          posterImageUrl: d.poster_image_url,
          youtubeUrl: d.youtube_url,
          youtubeVideoId: d.youtube_video_id,
          buttonText: d.button_text,
          buttonTextBn: d.button_text_bn,
          buttonUrl: d.button_url,
          buttonIcon: d.button_icon,
          buttonEvent: d.button_event,
          secondaryButtonText: d.secondary_button_text,
          secondaryButtonTextBn: d.secondary_button_text_bn,
          secondaryButtonUrl: d.secondary_button_url,
          secondaryButtonEvent: d.secondary_button_event,
          content: d.content || {},
          settings: d.settings || {},
          isEnabled: Boolean(d.is_enabled),
          sortOrder: Number(d.sort_order),
          status: d.status || 'published',
          createdAt: d.created_at,
          updatedAt: d.updated_at
        }));

        if (typeof window !== 'undefined') {
          safeSetItem(HOMEPAGE_CACHE_KEY, JSON.stringify(sections));
        }
      }
    } catch (err) {
      console.warn('Could not query homepage_sections from Supabase:', err);
    }
  }

  return sections.sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Save single or updated section to Supabase
 */
export async function saveHomepageSection(section: HomepageSection): Promise<boolean> {
  const current = await getHomepageSections();
  const exists = current.some(s => s.id === section.id);
  const updatedSection: HomepageSection = {
    ...section,
    updatedAt: new Date().toISOString()
  };

  const updatedList = exists
    ? current.map(s => s.id === section.id ? updatedSection : s)
    : [...current, updatedSection];

  if (typeof window !== 'undefined') {
    safeSetItem(HOMEPAGE_CACHE_KEY, JSON.stringify(updatedList));
  }
  notifyHomepageCms();

  if (isSupabaseConfigured()) {
    try {
      const payload = {
        id: updatedSection.id,
        section_key: updatedSection.sectionKey,
        section_type: updatedSection.sectionType,
        title: updatedSection.title || null,
        title_bn: updatedSection.titleBn || null,
        subtitle: updatedSection.subtitle || null,
        subtitle_bn: updatedSection.subtitleBn || null,
        description: updatedSection.description || null,
        description_bn: updatedSection.descriptionBn || null,
        badge: updatedSection.badge || null,
        badge_bn: updatedSection.badgeBn || null,
        media_type: updatedSection.mediaType || 'none',
        image_url: updatedSection.imageUrl || null,
        video_url: updatedSection.videoUrl || null,
        mobile_video_url: updatedSection.mobileVideoUrl || null,
        poster_image_url: updatedSection.posterImageUrl || null,
        youtube_url: updatedSection.youtubeUrl || null,
        youtube_video_id: updatedSection.youtubeVideoId || null,
        button_text: updatedSection.buttonText || null,
        button_text_bn: updatedSection.buttonTextBn || null,
        button_url: updatedSection.buttonUrl || null,
        button_icon: updatedSection.buttonIcon || null,
        button_event: updatedSection.buttonEvent || null,
        secondary_button_text: updatedSection.secondaryButtonText || null,
        secondary_button_text_bn: updatedSection.secondaryButtonTextBn || null,
        secondary_button_url: updatedSection.secondaryButtonUrl || null,
        secondary_button_event: updatedSection.secondaryButtonEvent || null,
        content: updatedSection.content || {},
        settings: updatedSection.settings || {},
        is_enabled: updatedSection.isEnabled,
        sort_order: updatedSection.sortOrder,
        status: updatedSection.status || 'published',
        updated_at: updatedSection.updatedAt
      };

      const { error } = await supabase
        .from('homepage_sections')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('Supabase saveHomepageSection error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Failed to save homepage section:', err);
      return false;
    }
  }

  return true;
}

/**
 * Reorder sections and save new sort order in Supabase
 */
export async function reorderHomepageSections(sections: HomepageSection[]): Promise<boolean> {
  const normalized = sections.map((sec, idx) => ({
    ...sec,
    sortOrder: idx + 1,
    updatedAt: new Date().toISOString()
  }));

  if (typeof window !== 'undefined') {
    safeSetItem(HOMEPAGE_CACHE_KEY, JSON.stringify(normalized));
  }
  notifyHomepageCms();

  if (isSupabaseConfigured()) {
    try {
      const updates = normalized.map(sec => ({
        id: sec.id,
        section_key: sec.sectionKey,
        section_type: sec.sectionType,
        sort_order: sec.sortOrder,
        is_enabled: sec.isEnabled,
        status: sec.status,
        updated_at: sec.updatedAt
      }));

      const { error } = await supabase
        .from('homepage_sections')
        .upsert(updates, { onConflict: 'id' });

      if (error) {
        console.error('Supabase reorderHomepageSections error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Failed to reorder sections in Supabase:', err);
      return false;
    }
  }

  return true;
}

/**
 * Delete a section from Supabase
 */
export async function deleteHomepageSection(id: string): Promise<boolean> {
  const current = await getHomepageSections();
  const filtered = current.filter(s => s.id !== id);

  if (typeof window !== 'undefined') {
    safeSetItem(HOMEPAGE_CACHE_KEY, JSON.stringify(filtered));
  }
  notifyHomepageCms();

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('homepage_sections')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase deleteHomepageSection error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Failed to delete section in Supabase:', err);
      return false;
    }
  }

  return true;
}

/**
 * Duplicate a section
 */
export async function duplicateHomepageSection(section: HomepageSection): Promise<HomepageSection> {
  const current = await getHomepageSections();
  const newId = `sec-custom-${Date.now()}`;
  const newKey = `custom_${Date.now()}`;
  const maxOrder = Math.max(...current.map(s => s.sortOrder), 0);

  const duplicated: HomepageSection = {
    ...section,
    id: newId,
    sectionKey: newKey,
    title: `${section.title || 'Section'} (Copy)`,
    titleBn: `${section.titleBn || 'সেকশন'} (কপি)`,
    sortOrder: maxOrder + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await saveHomepageSection(duplicated);
  return duplicated;
}

/**
 * Add a new Custom Section with a safe predefined template
 */
export async function createCustomSection(
  template: CustomSectionTemplate,
  titleBn: string,
  titleEn: string
): Promise<HomepageSection> {
  const current = await getHomepageSections();
  const newId = `sec-custom-${Date.now()}`;
  const newKey = `custom_${Date.now()}`;
  const maxOrder = Math.max(...current.map(s => s.sortOrder), 0);

  const newSec: HomepageSection = {
    id: newId,
    sectionKey: newKey,
    sectionType: 'custom',
    title: titleEn,
    titleBn: titleBn,
    subtitle: 'Tailored hygiene and maintenance solutions',
    subtitleBn: 'বিশেষায়িত ওয়াটার ট্যাংক ও স্বাস্থ্যসেবা',
    description: 'Customized solutions for residential and commercial water reservoirs in Dhaka.',
    descriptionBn: 'ঢাকা শহরের বাসাবাড়ি ও ভবনের পানি সুরক্ষায় কাস্টমাইজড সমাধান।',
    mediaType: template === 'video' ? 'youtube' : template.includes('image') ? 'image' : 'none',
    imageUrl: template.includes('image') ? 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=75' : undefined,
    youtubeUrl: template === 'video' ? 'https://www.youtube.com/watch?v=ScMzIvxBSi4' : undefined,
    youtubeVideoId: template === 'video' ? 'ScMzIvxBSi4' : undefined,
    buttonText: 'Book Service',
    buttonTextBn: 'বুকিং করুন',
    buttonUrl: '#quote',
    buttonEvent: 'cta_click',
    settings: {
      customTemplate: template,
      bgStyle: template === 'banner' ? 'blue' : 'white',
      layout: template === 'two_column' ? 'split' : 'standard',
      columns: template === 'three_column' ? 3 : 2
    },
    isEnabled: true,
    sortOrder: maxOrder + 1,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await saveHomepageSection(newSec);
  return newSec;
}
