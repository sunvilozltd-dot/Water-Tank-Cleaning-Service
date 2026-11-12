import { HomepageSection, HomepageRevisionMetadata } from '../types/homepageCms';

/**
 * Authoritative Published Homepage Sections Snapshot & Revision
 * 
 * Sourced directly from Sunviloz Clean Care production database and media storage.
 * Contains 0 demo images, 0 placeholder videos, and 0 stock Unsplash assets.
 * Guarantees that first-time visitors, slow networks, crawlers, and hydration
 * always render the genuine published content from frame 1.
 */
export const PUBLISHED_HOMEPAGE_REVISION: HomepageRevisionMetadata = {
  revisionId: 'rev_1794503818912',
  version: 12,
  publishedAt: '2026-11-12T17:16:40.000Z',
  publishedBy: 'administrator',
  source: 'bundled'
};

export const PUBLISHED_HOMEPAGE_SECTIONS: HomepageSection[] = [
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
    mediaType: 'youtube',
    imageUrl: 'https://img.youtube.com/vi/vaVkY5afSSE/hqdefault.jpg',
    videoUrl: 'https://youtu.be/vaVkY5afSSE?si=h0czPzjN6VtSIvXZ',
    video2Url: 'https://youtu.be/WY01Mrj5tzc?si=T6DQpEJagoLttn4j',
    mobileVideoUrl: 'https://youtu.be/WY01Mrj5tzc?si=T6DQpEJagoLttn4j',
    video3Url: 'https://youtu.be/aE30Yl5Qpt4?si=WyubHkRWWDhyR8OF',
    posterImageUrl: 'https://img.youtube.com/vi/vaVkY5afSSE/hqdefault.jpg',
    posterImage2Url: 'https://img.youtube.com/vi/WY01Mrj5tzc/hqdefault.jpg',
    posterImage3Url: 'https://img.youtube.com/vi/aE30Yl5Qpt4/hqdefault.jpg',
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
    imageUrl: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg',
    buttonText: 'Request a Quote',
    buttonTextBn: 'ট্যাংক পরিষ্কারের কোটেশন জানুন',
    buttonUrl: '#quote',
    buttonEvent: 'cta_click',
    settings: {
      bgStyle: 'slate',
      layout: 'split'
    },
    isEnabled: true,
    sortOrder: 7,
    status: 'published'
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
    youtubeUrl: 'https://www.youtube.com/watch?v=vaVkY5afSSE',
    youtubeVideoId: 'vaVkY5afSSE',
    settings: {
      bgStyle: 'slate',
      autoplayVideo: false
    },
    isEnabled: true,
    sortOrder: 8,
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
    sortOrder: 9,
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
    sortOrder: 10,
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
    sortOrder: 14,
    status: 'published'
  }
];
