import { ServiceItem, FaqItem, ReviewItem, ProcessStep, AreaInfo, ArticleItem } from '../types';

export const BUSINESS_CONFIG = {
  name: 'Sunviloz Clean Care',
  tagline: 'Professional Water Tank Cleaning Service in Dhaka',
  taglineBn: 'ঢাকায় প্রফেশনাল ওয়াটার ট্যাংক ক্লিনিং সার্ভিস',
  
  // Contact Configuration (Central & Configurable)
  phone: '01609999612',
  displayPhone: '01609-999612',
  whatsappNumber: '8801609999612',
  whatsappUrl: 'https://wa.me/8801609999612',
  messengerUrl: 'https://m.me/sunvilozcleancare',
  email: 'sunvilozltd@gmail.com',
  address: 'Dhaka, Bangladesh',
  operatingHours: '8:00 AM - 8:00 PM (Everyday, 7 Days a week)',
  operatingHoursBn: 'সকাল ৮:০০ - রাত ৮:০০ (সপ্তাহের ৭ দিন খোলা)',
  
  // SEO & Verification Config
  googleSiteVerification: '',
  googleAnalyticsId: '',
  metaPixelId: '',
  canonicalBaseUrl: 'https://sunvilozcleancare.com',

  // Value propositions
  trustBadges: [
    { en: 'Professional Cleaning Team', bn: 'প্রশিক্ষিত প্রফেশনাল টিম' },
    { en: 'Rooftop & Underground Tanks', bn: 'রূফটপ ও আন্ডারগ্রাউন্ড ট্যাংক' },
    { en: 'Residential & Commercial Service', bn: 'আবাসিক ও বাণিজ্যিক ভবন' },
    { en: 'Transparent Quotation', bn: 'স্বচ্ছ ও সাশ্রয়ী কোটেশন' },
  ],

  // Pricing configuration
  pricing: {
    rooftopStartingPrice: 1200,
    rooftopPvcStartingPrice: 1200,
    rooftopRccStartingPrice: 1800,
    undergroundStartingPrice: 2500,
    bothStartingPrice: 3700,
    pipelineStartingPrice: 1500,
    maintenanceAnnualPrice: 3500,
    buildingBulkStartingPrice: 4500,
    disclaimerEn: 'Final pricing may depend on tank size, number of tanks, location, accessibility and cleaning requirements.',
    disclaimerBn: 'ট্যাংকের সাইজ, সংখ্যা, অবস্থান ও ময়লার পরিমাণের ওপর ভিত্তি করে চূড়ান্ত কোটেশন নির্ধারিত হয়।'
  }
};

export const DHAKA_AREAS: AreaInfo[] = [
  { name: 'Kuril', nameBn: 'কুড়িল', zone: 'North Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Bashundhara R/A', nameBn: 'বসুন্ধরা আ/এ', zone: 'North Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Baridhara', nameBn: 'বারিধারা', zone: 'North Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Baridhara DOHS', nameBn: 'বারিধারা ডিওএইচএস', zone: 'North Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Gulshan 1 & 2', nameBn: 'গুলশান ১ ও ২', zone: 'North Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Banani', nameBn: 'বনানী', zone: 'North Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Banani DOHS', nameBn: 'বনানী ডিওএইচএস', zone: 'North Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Uttara (All Sectors)', nameBn: 'উত্তরা (সব সেক্টর)', zone: 'North Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Khilkhet', nameBn: 'খিলক্ষেত', zone: 'North Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Badda & Merul Badda', nameBn: 'বাড্ডা ও মেরুল বাড্ডা', zone: 'Central Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Rampura & Banasree', nameBn: 'রামপুরা ও বনশ্রী', zone: 'Central Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Mirpur (1 to 14)', nameBn: 'মিরপুর (১ হতে ১৪)', zone: 'North Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Mirpur DOHS', nameBn: 'মিরপুর ডিওএইচএস', zone: 'North Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Mohammadpur', nameBn: 'মোহাম্মদপুর', zone: 'Central Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Dhanmondi', nameBn: 'ধানমন্ডি', zone: 'Central Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Mohakhali & DOHS', nameBn: 'মহাখালী ও ডিওএইচএস', zone: 'Central Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Nikunja 1 & 2', nameBn: 'নিকুঞ্জ ১ ও ২', zone: 'North Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Tejgaon', nameBn: 'তেজগাঁও', zone: 'Central Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Lalmatia', nameBn: 'লালমাটিয়া', zone: 'Central Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Malibagh & Mouchak', nameBn: 'মালিবাগ ও মৌচাক', zone: 'Central Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Khilgaon', nameBn: 'খিলগাঁও', zone: 'Central Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
  { name: 'Old Dhaka (Puran Dhaka)', nameBn: 'পুরান ঢাকা', zone: 'South Dhaka', active: true, typicalResponseTime: 'Prior Booking' },
  { name: 'Shantinagar & Kakrail', nameBn: 'শান্তিনগর ও কাকরাইল', zone: 'Central Dhaka', active: true, typicalResponseTime: 'Same Day / Scheduled' },
];

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'service-water-tank-cleaning',
    slug: 'water-tank-cleaning',
    title: 'Water Tank Cleaning Service',
    titleBn: 'পানির ট্যাংক পরিষ্কার সার্ভিস',
    shortDesc: 'Underground and overhead water tank cleaning service for residences, apartments, and commercial buildings.',
    shortDescBn: 'বাসা, অ্যাপার্টমেন্ট ও বাণিজ্যিক ভবনের আন্ডারগ্রাউন্ড এবং ওভারহেড পানির ট্যাংক পরিষ্কারের সার্ভিস।',
    fullDesc: 'Complete mechanized deep cleaning for both rooftop overhead tanks (PVC and concrete RCC) and underground reserve tanks. Our specialized team uses calibrated 120-150 bar high-pressure rotary water jets, sludge extraction pumps, and food-grade sanitization for hygienic water storage.',
    whatIsThis: 'Water Tank Cleaning Service is a mechanized deep-cleaning service specifically designed for both rooftop and subterranean water storage reservoirs.',
    whatIsThisBn: 'পানির ট্যাংক পরিষ্কার সার্ভিস হলো বাসা, অ্যাপার্টমেন্ট ও বাণিজ্যিক ভবনের আন্ডারগ্রাউন্ড এবং ওভারহেড পানির ট্যাংক আধুনিক মেশিনে নিখুঁতভাবে পরিষ্কার করার পেশাদার সেবা।',
    whyNeeded: 'Tanks develop heavy sludge, municipal sand, and green algae that cultivate harmful bacteria, causing foul odors and clogged taps.',
    whyNeededBn: 'নিয়মিত পরিষ্কার না করলে ট্যাংকে ময়লা, কাদা ও শ্যাওলা জমে পানির স্বাভাবিক গন্ধ ও স্বচ্ছতা নষ্ট করে এবং পাইপলাইনে প্রতিবন্ধকতা সৃষ্টি করে।',
    whenNeeded: [
      'Visible murky or discolored water from taps',
      'Foul or stagnant odor in bathroom or kitchen water',
      'Tank has not been cleaned in the last 4-6 months'
    ],
    whenNeededBn: [
      'ট্যাপের পানিতে ঘোলাটে বা ময়লা ভাব দেখা দিলে',
      'পানিতে কাদা বা শ্যাওলার দুর্গন্ধ পাওয়া গেলে',
      'গত ৪-৬ মাসের মধ্যে ট্যাংক ডিপ ক্লিন না করা হলে'
    ],
    equipment: [
      '120-150 Bar High-Pressure Rotary Jet Cleaner',
      'Submersible Sediment Slurry Pump',
      'Approved Food-Grade Non-Toxic Sanitizer'
    ],
    equipmentBn: [
      '১২০-১৫০ বার হাই-প্রেসার রোটারি জেট ওয়াশার',
      'সাবমারসিবল স্লাজ সেচ পাম্প ও ওয়েট ভ্যাকুয়াম',
      'ফুড-গ্রেড নন-টক্সিক জীবাণুনাশক'
    ],
    iconName: 'Droplets',
    isPrimary: true,
    popular: true,
    benefits: [
      'Controlled-pressure jet cleaning without surface erosion',
      'Deep extraction of sludge, algae, and municipal sediment',
      'Approved food-grade sanitization for clean, fresh water storage',
      'Systematic 9-step cleaning process by experienced team'
    ],
    benefitsBn: [
      'কোনো ক্ষতিকর এসিড ছাড়াই হাই-প্রেসার ওয়াটার জেটে সুশৃঙ্খল পরিষ্কার',
      'তলদেশের ভারী কাদা ও দেয়ালের শক্ত শ্যাওলা কার্যকর দূরীকরণ',
      'ফুড-গ্রেড জীবাণুনাশক প্রয়োগে স্বাস্থ্যসম্মত পরিচ্ছন্ন পানি সংরক্ষণ',
      'পেশাদার ও অভিজ্ঞ টেকনিশিয়ান দ্বারা সুচারু বাস্তবায়ন'
    ],
    idealFor: [
      'Residential apartments and private houses',
      'Commercial buildings and offices',
      'Schools, hotels, and hospitals'
    ],
    idealForBn: [
      'আবাসিক ফ্ল্যাট ও ব্যক্তিগত বাড়ি',
      'বাণিজ্যিক ভবন ও কর্পোরেট অফিস',
      'হাসপাতাল, স্কুল ও রেস্টুরেন্ট'
    ],
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
    faqs: [
      {
        question: 'How often should water tanks be cleaned in Dhaka?',
        answer: 'Due to municipal water sedimentation and heat, overhead and underground tanks should be deep cleaned every 4 to 6 months.',
        questionBn: 'ঢাকায় কত দিন পর পর পানির ট্যাংক পরিষ্কার করা উচিত?',
        answerBn: 'ঢাকা শহরের ওয়াসা পানি ও আবহাওয়ার কারণে প্রতি ৪ থেকে ৬ মাস পর পর ছাদের ও নিচের ট্যাংক পরিষ্কার করা স্বাস্থ্যসম্মত।'
      }
    ]
  },
  {
    id: 'service-pipeline-cleaning',
    slug: 'pipeline-cleaning',
    title: 'Pipeline Cleaning Service',
    titleBn: 'পানির পাইপলাইন পরিষ্কার সার্ভিস',
    shortDesc: 'Professional service to remove dirt, iron sludge, and unwanted deposits from residential and commercial water pipelines.',
    shortDescBn: 'বাসা ও ভবনের পানির পাইপলাইনের ময়লা ও জমে থাকা অবাঞ্ছিত পদার্থ পরিষ্কারের জন্য পেশাদার সার্ভিস।',
    fullDesc: 'Clean water in your storage tank can still get contaminated if the distribution pipes are clogged with iron deposits, rust, or microbial biofilm. We provide non-corrosive pressurized hydro-pulse pipeline flushing to restore crystal clear water flow and eliminate tap odors without damaging walls or tiles.',
    whatIsThis: 'Pipeline Cleaning Service is a specialized mechanized non-invasive flushing service that clears rust, iron sediments, and mineral scale from internal plumbing.',
    whatIsThisBn: 'পানির পাইপলাইন পরিষ্কার সার্ভিস হলো আধুনিক হাইড্রো-পালস প্রযুক্তিতে বাসা ও ভবনের পানির পাইপের ভেতরের জমে থাকা ময়লা, আয়রন ও অবাঞ্ছিত পদার্থ পরিষ্কার করার বিশেষায়িত সার্ভিস।',
    whyNeeded: 'Over time, mineral deposits and iron settle on pipe walls, narrowing water passage and turning water yellow or red. It stains sanitary fittings and causes foul smells.',
    whyNeededBn: 'পাইপ পরিষ্কার না রাখায় ভেতরে আয়রনের শক্ত আস্তরণ পড়ে ট্যাপে দুর্গন্ধযুক্ত ও লালচে পানি আসে।',
    whenNeeded: [
      'Reddish, brown, or discolored water from bathroom faucets',
      'Water pressure declining in showers and taps',
      'Foul plumbing odor in running tap water'
    ],
    whenNeededBn: [
      'ট্যাপের পানিতে মরিচা বা লালচে ভাব দেখা দিলে',
      'শাওয়ার বা বেসিন কলে পানির প্রেসার কমে গেলে',
      'পাইপলাইনের পানি থেকে দুর্গন্ধ বের হলে'
    ],
    equipment: [
      'Hydro-Pneumatic Pulse Generator (Non-destructive)',
      'Multi-Outlet Sediment Monitoring Gauges',
      'Food-Grade Safe Descaling Flush Solution'
    ],
    equipmentBn: [
      'হাইড্রো-পালস পাইপলাইন ফ্লাশিং মেশিন (দেয়াল অক্ষত রেখে)',
      'মাল্টি-আউটলেট প্রেসার মনিটর',
      'ফুড-গ্রেড নিরাপদ ডেস্কেলিং সল্যুশন'
    ],
    iconName: 'Wrench',
    isPrimary: false,
    popular: true,
    benefits: [
      'Restores clear water flow and eliminates tap odor',
      'Zero wall damage or tile breaking required',
      'Increases water pressure across all faucets',
      '100% safe for PVC, CPVC, PPR, and metal pipes'
    ],
    benefitsBn: [
      'কলের পানিতে আয়রন ও দুর্গন্ধ স্থায়ীভাবে দূর করে',
      'কোনো দেয়াল বা টাইলস না ভেঙে সম্পূর্ণ কাজ সম্পন্ন',
      'শাওয়ার ও ট্যাপের পানির আসল স্পিড ফিরে আসে',
      'সব ধরনের পাইপলাইনের জন্য সম্পূর্ণ নিরাপদ'
    ],
    idealFor: [
      'Apartments and multi-family residential buildings',
      'Commercial buildings and office washrooms',
      'Older plumbing networks with heavy iron deposits'
    ],
    idealForBn: [
      'আবাসিক ফ্ল্যাট ও বহুতল ভবন',
      'বাণিজ্যিক অফিস ও শপিং মল',
      'আয়রনযুক্ত পুরানো পানির পাইপলাইন'
    ],
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=75',
    faqs: [
      {
        question: 'Do you need to break walls for pipeline cleaning?',
        answer: 'No! Our hydro-pulse machinery connects directly to existing faucet connection points without any wall breaking.',
        questionBn: 'পাইপলাইন পরিষ্কার করতে দেয়াল বা টাইলস ভাঙতে হয়?',
        answerBn: 'না, কোনো দেয়াল ভাঙতে হয় না। বিদ্যমান কলের মুখ থেকেই বিশেষ মেশিনের মাধ্যমে পুরো লাইনের ময়লা বের করা হয়।'
      }
    ]
  },
  {
    id: 'service-overhead-tank',
    slug: 'overhead-tank-cleaning',
    title: 'Overhead / Rooftop Water Tank Cleaning',
    titleBn: 'ওভারহেড ও ছাদের পানির ট্যাংক পরিষ্কার সার্ভিস',
    shortDesc: 'Mechanized deep cleaning and food-grade sanitization for rooftop PVC and concrete RCC overhead tanks.',
    shortDescBn: 'ছাদের পিভিসি ও আরসিসি কংক্রিট ওভারহেড ট্যাংক উচ্চচাপের রোটারি ওয়াটার জেটে শ্যাওলা ও ময়লামুক্তকরণ।',
    fullDesc: 'Rooftop water tanks face direct sunlight and heat, accelerating green algae formation, bio-film slime, and airborne dust contamination. We use calibrated 120-150 bar high-pressure rotary wash, manual biofilm scrubbing, safe odorless disinfection, and wet vacuum extraction to restore clean water flow to all building taps.',
    whatIsThis: 'Overhead Tank Cleaning is a mechanized descaling and sanitization service for rooftop storage units, ensuring safe gravity-fed water throughout the property.',
    whatIsThisBn: 'ওভারহেড ট্যাংক ক্লিনিং হলো ভবনের ছাদের পিভিসি ও আরসিসি ট্যাংকের ভেতর জমে থাকা শ্যাওলা, কাদা ও ব্যাক্টেরিয়া মেকানাইজড পদ্ধতিতে পরিষ্কার করার সেবা।',
    whyNeeded: 'Direct sun exposure fosters algae buildup and warm water accelerates bacterial biofilms, causing murky tap water and clogged plumbing.',
    whyNeededBn: 'রোদের তাপে ছাদের ট্যাংকে দ্রুত শ্যাওলা জন্ম নেয় এবং তলদেশে কাদার আস্তরণ জমে খাবার ও ব্যবহারের পানি নোংরা করে তোলে।',
    whenNeeded: [
      'Algae or green tint visible in stored rooftop water',
      'Water smells musty or stale when taps are opened',
      'Tank has not been scrubbed in over 4-6 months'
    ],
    whenNeededBn: [
      'ট্যাপের পানিতে শ্যাওলা বা সবুজ আভা দেখা দিলে',
      'পানিতে ভ্যাপসা বা শ্যাওলার গন্ধ পাওয়া গেলে',
      'গত ৪-৬ মাসের মধ্যে ছাদের ট্যাংক ডিপ ক্লিন না করা হলে'
    ],
    equipment: [
      '120-150 Bar High-Pressure Rotary Jet Washer',
      'Non-Scratch Soft Mechanical Scrubbing Tools',
      'Approved Food-Grade Non-Toxic Sanitizer',
      'Heavy-Duty Wet Vacuum Extractor'
    ],
    equipmentBn: [
      '১২০-১৫০ বার হাই-প্রেসার রোটারি জেট ওয়াশার',
      'নন-স্ক্র্যাচ মেকানিক্যাল স্ক্রাবিং ব্রাশ',
      'ফুড-গ্রেড নন-টক্সিক জীবাণুনাশক',
      'ইন্ডাস্ট্রিয়াল ওয়েট ভ্যাকুয়াম ক্লিনার'
    ],
    iconName: 'Building',
    isPrimary: false,
    popular: true,
    benefits: [
      'Zero damage to PVC, rotomold, or concrete surfaces',
      'Complete eradication of green algae and bacterial biofilms',
      'Approved food-grade non-toxic sanitization',
      'Experienced rooftop technician team with safety rigging'
    ],
    benefitsBn: [
      'ট্যাংকের দেয়ালে কোনো ক্ষতি না করে রোটারি জেটে পরিষ্কার',
      'সবুজ শ্যাওলা ও ব্যাক্টেরিয়ার আস্তরণ সম্পূর্ণ দূরীকরণ',
      'ফুড-গ্রেড ও দুর্গন্ধহীন জীবাণুনাশক প্রয়োগ',
      'নিরাপদ ও প্রশিক্ষিত টেকনিশিয়ান দ্বারা কাজ পরিচালনা'
    ],
    process: [
      'Tank structural and inlet inspection',
      'Controlled de-watering through drainage lines',
      'Mechanical scrubbing of wall algae and bottom sediment',
      '120-150 bar high-pressure rotary wall jet wash',
      'Food-grade safe disinfection treatment',
      'Fresh water rinse and wet vacuuming extraction',
      'Lid sealing and client inspection handover'
    ],
    processBn: [
      'ট্যাংকের অবস্থা ও ইনলেট লাইন পরিদর্শন',
      'সাবমারসিবল পাম্পে অবশিষ্ট পানি ড্রেন আউট করা',
      'দেয়ালের শক্ত শ্যাওলা স্ক্রাবিং করে আলগা করা',
      'হাই-প্রেসার ওয়াটার জেটে খাঁজ ও কোণা নিখুঁতভাবে ধৌতকরণ',
      'ফুড-গ্রেড নিরাপদ স্যানিটাইজার স্প্রে',
      'বিশুদ্ধ পানি দিয়ে ফাইনাল ওয়াশ ও ভ্যাকুমিং',
      'ঢাকনা সিলিং ও গ্রাহকের নিকট সন্তোষজনক হস্তান্তর'
    ],
    idealFor: [
      'Residential houses and multi-story apartment buildings',
      'Commercial buildings and corporate offices',
      'Duplex homes and rooftop water battery systems'
    ],
    idealForBn: [
      'বাসাবাড়ি ও বহুতল আবাসিক অ্যাপার্টমেন্ট ভবন',
      'বাণিজ্যিক ভবন ও কর্পোরেট অফিস',
      'ডুপ্লেক্স বাড়ি ও ছাদের পিভিসি ব্যাটারি ট্যাংক'
    ],
    image: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=1200&q=75',
    faqs: [
      {
        question: 'Will high pressure water jet damage my PVC rooftop tank?',
        answer: 'No. Our high-pressure jet cleaners are calibrated specifically to remove algae without eroding or stressing the PVC or fiberglass inner wall.',
        questionBn: 'হাই-প্রেসার জেটে ছাদের পিভিসি ট্যাংকের কোনো ক্ষতি হবে কি?',
        answerBn: 'না, কোনো ক্ষতি হবে না। আমাদের রোটারি জেট মেশিনগুলো এমনভাবে ক্যালিব্রেট করা যা ট্যাংকের মেটেরিয়াল অক্ষত রেখেই শ্যাওলা তুলে ফেলে।'
      },
      {
        question: 'How long does overhead tank cleaning take?',
        answer: 'A standard residential overhead tank (1,000L to 2,000L) typically takes between 1.5 to 2.5 hours to thoroughly scrub, pressure wash, and sanitize.',
        questionBn: 'ছাদের ট্যাংক পরিষ্কার করতে কতক্ষণ সময় লাগে?',
        answerBn: 'একটি ১,০০০ বা ২,০০০ লিটার ছাদের ট্যাংক ডিপ ক্লিন করতে সাধারণত ১.৫ থেকে ২.৫ ঘণ্টা সময় লাগে।'
      }
    ]
  },
  {
    id: 'service-underground-tank',
    slug: 'underground-water-tank-cleaning',
    title: 'Water Reserve/Underground Tank Cleaning',
    titleBn: 'আন্ডারগ্রাউন্ড ওয়াটার ট্যাংক ক্লিনিং (Underground Tank Cleaning)',
    shortDesc: 'Heavy-duty extraction of deep sludge, municipal silt, and biofilms from subterranean concrete reserve tanks.',
    shortDescBn: 'ভূগর্ভস্থ আরসিসি রিজার্ভারের তলদেশের ভারী ওয়াসা কাদা, স্লাজ ও দুর্গন্ধ সম্পূর্ণ ভ্যাকুমিং ও জীবাণুমুক্তকরণ।',
    fullDesc: 'Underground reserve tanks receive raw municipal water and accumulate thick layers of mud, sand, and organic sediment at the bottom. Our specialized confined-space crew uses submersible heavy-slurry pumps, explosion-proof LED illumination, fresh-air blowers, and high-pressure jet scowering.',
    whatIsThis: 'Water Reserve/Underground Tank Cleaning is a heavy-duty specialized service designed for subterranean concrete reservoirs. It combines confined-space safety protocols with industrial slurry extraction to eliminate heavy mud and municipal silt.',
    whatIsThisBn: 'আন্ডারগ্রাউন্ড ওয়াটার ট্যাংক ক্লিনিং হলো মাটির নিচের কংক্রিট রিজার্ভার থেকে ওয়াসা সাপ্লাই লাইনের বালু, কাদা ও ভারী স্লাজ উত্তোলন এবং দেয়াল উচ্চচাপে ধুয়ে জীবাণুমুক্ত করার বিশেষায়িত সেবা।',
    whyNeeded: 'All municipal water enters the underground reservoir first, settling thick mud and iron at the bottom. When water is pumped to the roof, this sludge enters the entire building water system.',
    whyNeededBn: 'ওয়াসার লাইনের পানি সরাসরি আন্ডারগ্রাউন্ড রিজার্ভারে এসে জমা হয়, ফলে সেখানে কয়েক ইঞ্চি ঘন কাদা জমে। ছাদের মোটরে এই কাদা উঠলে পুরো ভবনের পানি নোংরা হয়ে যায়।',
    whenNeeded: [
      'When bottom sludge exceeds 2 to 3 inches in depth',
      'Foul swamp-like odor emerging from reserve manhole',
      'Water motor pumping brown murky water to the roof',
      'At least once a year or every 6-8 months'
    ],
    whenNeededBn: [
      'রিজার্ভারের তলদেশে ২-৩ ইঞ্চি বা তার বেশি কাদা জমে গেলে',
      'রিজার্ভারের ম্যানহোল খুললে পচা বা ভ্যাপসা গন্ধ বের হলে',
      'মোটর দিয়ে ছাদে ঘোলা ও ময়লা পানি উঠলে',
      'গত ৬ থেকে ৮ মাস কোনো স্লাজ ক্লিনিং না হয়ে থাকলে'
    ],
    equipment: [
      'Submersible Heavy-Duty Slurry/Mud Pump',
      'Industrial Wet Silt Vacuum Extractor',
      'Confined Space Fresh Air Ventilation Blower',
      'Waterproof High-Lumen Safety LED Lighting',
      '150 Bar Floor & Wall Rotary Jet Washer'
    ],
    equipmentBn: [
      'হেভি-ডিউটি স্লাজ ও কাদা তোলার সাবমারসিবল পাম্প',
      'ইন্ডাস্ট্রিয়াল ওয়েট সিল্ট ভ্যাকুয়াম ক্লিনার',
      'কনফাইন্ড স্পেস ভেন্টিলেশন ফ্রেস এয়ার ব্লোয়ার',
      'ওয়াটারপ্রুফ হাই-লুমেন সেফটি এলইডি লাইট',
      '১৫০ বার মেকানাইজড ওয়াল ও ফ্লোর রোটারি ওয়াশার'
    ],
    iconName: 'ShieldAlert',
    isPrimary: false,
    benefits: [
      'Heavy-duty submersible mud extraction pump for thick silt',
      'Equipped for confined space safety with fresh air ventilation',
      'Cleans large capacities (5,000 to 50,000+ Liters)',
      'Examines walls for seepage, hairline cracks, or root intrusions',
      'Prevents dirt from entering the suction pipes that feed the roof'
    ],
    benefitsBn: [
      'হেভি স্লাজ পাম্পে গভীর কাদা ও নোংরা পানি দ্রুত নিস্কাশন',
      'কনফাইন্ড স্পেস নিরাপত্তা প্রটোকল ও সুরক্ষাসামগ্রী ব্যবহার',
      '৫,০০০ থেকে ৫০,০০০+ লিটার বড় রিজার্ভার সফলভাবে পরিষ্কারের সক্ষমতা',
      'দেয়ালের ক্র্যাক বা বাইরের নোংরা পানির অনুপ্রবেশ পরীক্ষা',
      'ছাদের মোটরে কাদা যাওয়া বন্ধ করে মোটর ও পাইপের দীর্ঘস্থায়িত্ব নিশ্চিতকরণ'
    ],
    process: [
      'Site risk & atmospheric safety inspection',
      'Blower ventilation & safety illumination setup',
      'Complete de-watering and thick sludge slurry pumping',
      'Industrial wet vacuuming of base silt from sump pit',
      '150 bar high-pressure rotary floor & wall scouring',
      'Food-grade sanitization wash and fresh water rinse',
      'Final clearance, sealing, and client inspection'
    ],
    processBn: [
      'সাইট নিরাপত্তা যাচাই ও এয়ার ভেন্টিলেশন চালু করা',
      'সাবমারসিবল পাম্পে নোংরা পানি ও ভারী কাদার স্তুপ উত্তোলন',
      'ওয়েট ভ্যাকুয়ামে তলদেশের ড্রেন পিটের অবশিষ্টাংশ পরিষ্কার',
      '১৫০ বার রোটারি জেটে দেয়াল ও মেঝের ময়লা দূরীকরণ',
      'জীবাণুনাশক ওয়াশ ও পুনরায় স্বচ্ছ পানি দিয়ে ফ্লাশিং',
      'ম্যানহোল সিলিং ও গ্রাহককে কাজ বুঝিয়ে দিয়ে হ্যান্ডওভার'
    ],
    idealFor: [
      'Apartment buildings, societies & housing complexes',
      'Commercial buildings, shopping malls & plazas',
      'Factories, hospitals, universities & schools'
    ],
    idealForBn: [
      'আবাসিক অ্যাপার্টমেন্ট ও ফ্ল্যাট মালিক সমিতি',
      'বাণিজ্যিক কমপ্লেক্স, শপিং মল ও কর্পোরেট অফিস',
      'হাসপাতাল, শিক্ষাপ্রতিষ্ঠান ও আবাসিক হোটেল'
    ],
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=75',
    beforeAfterImage: {
      before: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=75',
      after: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=75'
    },
    faqs: [
      {
        question: 'How long does it take to clean an underground reserve tank?',
        answer: 'Depending on capacity and sludge depth, a residential reserve tank typically takes between 3 to 5 hours. We coordinate with building management to minimize water downtime.',
        questionBn: 'আন্ডারগ্রাউন্ড রিজার্ভার পরিষ্কার করতে কতক্ষণ সময় লাগে?',
        answerBn: 'রিজার্ভারের ধারণক্ষমতা ও কাদার পরিমাণের ওপর ভিত্তি করে সাধারণত ৩ থেকে ৫ ঘণ্টার মধ্যে পুরো কাজ শেষ হয়।'
      }
    ]
  },
  {
    id: 'service-both-water-tank',
    slug: 'both-water-tank-cleaning',
    title: 'Both Water Tank Cleaning',
    titleBn: 'বোথ ওয়াটার ট্যাংক ক্লিনিং (Both Water Tank Cleaning)',
    shortDesc: 'Comprehensive dual-tank deep cleaning package for both rooftop overhead and subterranean reserve tanks.',
    shortDescBn: 'ছাদের ট্যাংক এবং মাটির নিচের রিজার্ভার একই দিনে সমন্বিতভাবে পরিষ্কার করার সাশ্রয়ী প্যাকেজ।',
    fullDesc: 'Cleaning only the rooftop tank while the underground reservoir remains full of mud leads to immediate re-contamination within days. Our Both Water Tank package deploys synchronized technician teams to clean and sanitize both tanks systematically.',
    whatIsThis: 'Both Water Tank Cleaning is a coordinated package that cleans both the subterranean reservoir and the rooftop overhead tank in a single service visit to eliminate cross-contamination.',
    whatIsThisBn: 'বোথ ওয়াটার ট্যাংক ক্লিনিং হলো একই দিনে একই সঙ্গে আন্ডারগ্রাউন্ড রিজার্ভার এবং ছাদের ওভারহেড ট্যাংক পরিষ্কার করার পূর্ণাঙ্গ সেবা, যাতে ছাদের পানি পুনরায় নোংরা না হয়।',
    whyNeeded: 'If you only clean the roof tank, the sediment from the underground reserve will be pumped back up. Cleaning both ensures the entire building water storage remains hygienic and sludge-free.',
    whyNeededBn: 'নিচের ট্যাংক অপরিষ্কার রেখে শুধু ছাদের ট্যাংক পরিষ্কার করলে পাম্প চালানোর সাথে সাথে নিচের কাদা আবার ছাদে উঠে যায়। তাই দুটো ট্যাংক একসাথে পরিষ্কার করাই সুশৃঙ্খল সমাধান।',
    whenNeeded: [
      'Annual or semi-annual comprehensive building water hygiene maintenance',
      'When taking possession of a new building, flat, or rental property',
      'Persistent water turbidity despite previous single-tank cleans'
    ],
    whenNeededBn: [
      'ভবনের নিয়মিত বাৎসরিক বা ষান্মাসিক সার্বিক পানি ব্যবস্থাপনা কার্যক্রমে',
      'নতুন ফ্ল্যাট বা বাড়িতে ওঠার পূর্বে পানির স্বচ্ছতা নিশ্চিত করতে',
      'যেকোনো একটি ট্যাংক পরিষ্কার করার পরও পানিতে দুর্গন্ধ বা ঘোলা ভাব থেকে গেলে'
    ],
    equipment: [
      'Dual High-Pressure Rotary Jet Washers',
      'Heavy Submersible Slurry Extraction Pump',
      'Deep Silt Vacuum Extraction Machine',
      'Safe Odorless Disinfection Sprayers'
    ],
    equipmentBn: [
      'দ্বৈত হাই-প্রেসার রোটারি ওয়াশার ইউনিট',
      'হেভি সাবমারসিবল কাদা তোলার পাম্প ও পাইপলাইন',
      'ওয়েট ভ্যাকুয়াম এক্সট্রাকশন মেশিন',
      'নিরাপদ খাদ্য-বান্ধব স্যানিটাইজার স্প্রেয়ার'
    ],
    iconName: 'Building',
    isPrimary: false,
    benefits: [
      'Minimizes sediment transfer between underground and rooftop tanks',
      'Synchronized multi-crew deployment minimizes building downtime',
      'Cost-effective bundled quotation compared to individual bookings',
      'Comprehensive inspection and cleaning for all building residents'
    ],
    benefitsBn: [
      'নিচের কাদা ছাদে ওঠা বন্ধ করে স্বচ্ছ ও পরিচ্ছন্ন পানি সংরক্ষণ',
      'একই দিনে একসাথে কাজ সম্পন্ন হওয়ায় পানির ঘাটতি বা ভোগান্তি কমে',
      'আলাদা আলাদা বুকিংয়ের তুলনায় উল্লেখযোগ্য সাশ্রয়ী বান্ডেল কোটেশন',
      'ভবনের সকল বাসিন্দাদের জন্য স্বাস্থ্যসম্মত পরিচ্ছন্ন পানির নিশ্চয়তা'
    ],
    process: [
      'Building water management briefing & simultaneous staging',
      'Underground tank dewatering & sludge pumping',
      'Rooftop overhead tank rotary jet cleaning & biofilm descaling',
      'Underground floor scrubbing, silt vacuuming & sanitization',
      'Both tanks food-grade sanitization rinse',
      'Combined inspection with caretaker / client and handover'
    ],
    processBn: [
      'ভবনের পানির ব্যবহার নিয়ন্ত্রণ ও টেকনিশিয়ানদের প্রস্তুতি',
      'মাটির নিচের রিজার্ভার থেকে পানি ও কাদা দ্রুত সেচে ফেলা',
      'ছাদের ট্যাংকের দেয়াল ও তলা রোটারি জেটে পরিষ্কার ও জীবানুনাশক স্প্রে',
      'আন্ডারগ্রাউন্ডের মেঝের সিল্ট ও দেয়াল হাই-প্রেসারে ডিপ ক্লিন করা',
      'উভয় ট্যাংকে বিশুদ্ধ পানির ফাইনাল ওয়াশ ও ভ্যাকুমিং',
      'ভবন কমিটি বা কেয়ারটেকারকে দেখিয়ে সন্তোষজনক হ্যান্ডওভার'
    ],
    idealFor: [
      'Apartment buildings and residential societies',
      'Duplex and multi-story private residences',
      'Commercial buildings and office premises'
    ],
    idealForBn: [
      'আবাসিক অ্যাপার্টমেন্ট ভবন ও ডুপ্লেক্স বাড়ি',
      'বহুতল বাণিজ্যিক ভবন ও কর্পোরেট সেন্টার',
      'শিক্ষাপ্রতিষ্ঠান, রেস্তোরাঁ ও কারখানা'
    ],
    image: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=75',
    faqs: [
      {
        question: 'Can both tanks be cleaned on the same day?',
        answer: 'Yes, our team is equipped with dual machinery to handle both the underground reservoir and rooftop tanks simultaneously or sequentially on the same day.',
        questionBn: 'দুটো ট্যাংকই কি একই দিনে পরিষ্কার করা সম্ভব?',
        answerBn: 'হ্যাঁ, আমাদের কাছে একাধিক মেশিন ও টেকনিশিয়ান টিম থাকায় একই দিনে নিচের ও ছাদের দুটো ট্যাংকই সুচারুভাবে পরিষ্কার করা হয়।'
      }
    ]
  },
  {
    id: 'service-both-tanks-pipeline',
    slug: 'both-water-tank-cleaning-with-pipeline',
    title: 'Both Water Tank Cleaning With Pipeline',
    titleBn: 'ট্যাংক ও পাইপলাইন সম্পূর্ণ ক্লিনিং (Both Tanks + Pipeline)',
    shortDesc: 'The ultimate water hygiene package: Underground reservoir + rooftop overhead tank + pressurized pipeline flushing.',
    shortDescBn: 'মাটির নিচের রিজার্ভার, ছাদের ট্যাংক এবং ঘরের অভ্যন্তরীণ সম্পূর্ণ পানির পাইপলাইন ফ্লাশিং প্যাকেজ।',
    fullDesc: 'Even with spotless tanks, rusty pipes and accumulated iron scale inside internal plumbing will continue to deliver discolored water to your taps and showers. This flagship package cleans your entire water distribution ecosystem from municipal intake to your bathroom faucet.',
    whatIsThis: 'Both Water Tank Cleaning With Pipeline is an end-to-end water distribution sanitization package. It covers the underground reservoir, the rooftop tank, and every connected internal water pipeline.',
    whatIsThisBn: 'এটি ভবনের পানির সার্বিক বিশুদ্ধতার জন্য আমাদের সেরা প্যাকেজ। এতে মাটির নিচের রিজার্ভার, ছাদের ট্যাংক এবং প্রতিটি বাথরুম ও কিচেনের সরবরাহ পাইপ মেকানাইজড পদ্ধতিতে পরিষ্কার করা হয়।',
    whyNeeded: 'Often customers clean their tanks but still get yellow or smelly water because pipes harbor rust and iron biofilms. Bundling tank cleaning with pipeline descaling provides a complete solution.',
    whyNeededBn: 'ট্যাংক পরিষ্কার করার পরও অনেকের কলে লালচে বা গন্ধযুক্ত পানি আসে, কারণ পাইপলাইনের ভেতরে মরিচা ও আয়রনের কোটিং জমে থাকে। পাইপলাইন ফ্লাশ না করলে শতভাগ পরিষ্কার পানি পাওয়া যায় না।',
    whenNeeded: [
      'Rusty, reddish or yellowish water emerging from taps even after tank clean',
      'Low water pressure in showers and washbasin taps due to scale blockage',
      'Renovating an apartment or moving into an older residential property'
    ],
    whenNeededBn: [
      'ট্যাংক পরিষ্কারের পরও কলে লাল বা দুর্গন্ধযুক্ত পানি আসলে',
      'আয়রন বা ময়লার কারণে শাওয়ার ও কলের পানির স্পিড কমে গেলে',
      'পুরাতন ভবনের পানি ব্যবস্থার সার্বিক আধুনিকীকরণ ও ডিপ ক্লিন চাইলে'
    ],
    equipment: [
      'Hydro-Pneumatic Pulse Pipeline Cleaning System',
      'Dual 150-Bar Rotary Pressure Washers',
      'Heavy Submersible Silt Pump',
      'Multi-Outlet Pressure Test Gauges'
    ],
    equipmentBn: [
      'হাইড্রো-পালস পাইপলাইন ফ্লাশিং মেশিন (ওয়াল না ভেঙে)',
      '১৫০ বার রোটারি জেট ওয়াশার ইউনিট',
      'সাবমারসিবল কাদা তোলার পাম্প ও নিষ্কাশন হোস',
      'প্রেসার টেস্টিং ও ওয়াটার কোয়ালিটি মিটার'
    ],
    iconName: 'Wrench',
    isPrimary: false,
    benefits: [
      'Complete end-to-end building water hygiene with zero compromise',
      'Eliminates rusty water and bad odor from every tap and shower',
      'Restores original water pressure across bathroom and kitchen outlets',
      'Significant cost savings compared to booking services separately'
    ],
    benefitsBn: [
      'ওয়াসার ইনলেট থেকে বাথরুমের কল পর্যন্ত পানির পুরো সিস্টেম শতভাগ পরিষ্কার',
      'পানির পাইপলাইন না ভেঙে ভেতরের মরিচা ও আয়রনের স্তর দূরীকরণ',
      'শাওয়ার ও বেসিনের কমে যাওয়া পানির স্পিড পুনরায় বৃদ্ধি',
      'আলাদা আলাদা সার্ভিসের চেয়ে বান্ডেল প্যাকেজে সর্বোচ্চ সাশ্রয়'
    ],
    process: [
      'Building water network blueprint and pressure audit',
      'Underground reservoir sludge pumping and deep sanitation',
      'Overhead rooftop tank rotary jet wash and disinfection',
      'Pressurized hydro-pulse line flushing room by room',
      'Sediment discharge until crystal clear water emerges at every faucet',
      'Final pressure testing, aerator cleaning, and client sign-off'
    ],
    processBn: [
      'ভবনের পাইপলাইন লেআউট ও প্রেসার পরীক্ষা',
      'আন্ডারগ্রাউন্ড ও ওভারহেড ট্যাংকের গভীর কাদা ও শ্যাওলা পরিষ্কার',
      'হাইড্রো-পালস প্রযুক্তিতে প্রতিটি বাথরুমের পাইপলাইন ধুয়ে ময়লা বের করা',
      'যতক্ষণ না পর্যন্ত কলে সম্পূর্ণ স্বচ্ছ পানি বের হয় ততক্ষণ ফ্লাশিং চালানো',
      'কলের ফিল্টার ও নেট পরিষ্কার করে স্বাভাবিক প্রেশার নিশ্চিত করা',
      'গ্রাহককে প্রতিটি কলে স্বচ্ছ পানি দেখিয়ে নিশ্চিত করা'
    ],
    idealFor: [
      'Apartments with brown/iron water coming from faucets',
      'Older buildings with low shower pressure and pipe deposits',
      'Families prioritizing total clean water safety for drinking and bathing'
    ],
    idealForBn: [
      'যেসকল ফ্ল্যাটে কলে লালচে বা গন্ধযুক্ত পানি আসে',
      'পুরাতন বিল্ডিং যেখানে পাইপের মুখে আয়রন আটকে প্রেশার কমে গেছে',
      'শিশুদের ত্বক ও পরিবারের সুস্বাস্থ্যে সচেতন পরিবারসমূহ'
    ],
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=75',
    faqs: [
      {
        question: 'Will pipeline cleaning damage internal CPVC, PPR, or PVC pipes?',
        answer: 'No. Our hydro-pulse technology uses controlled water-air pulses without corrosive acids, keeping plastic and metal plumbing entirely safe.',
        questionBn: 'পাইপলাইন পরিষ্কার করতে গিয়ে ঘরের দেয়াল কাটা বা পাইপ ফাটার ঝুঁকি আছে?',
        answerBn: 'একদমই না। কোনো দেয়াল বা টাইলস কাটা হয় না। কন্ট্রোলড হাইড্রো-পালস এয়ার-ওয়াটার প্রেসারে পাইপের ভেতর সুরক্ষিত রেখেই ভেতরের আয়রন বের করে দেওয়া হয়।'
      }
    ]
  },
  {
    id: 'service-water-pipeline',
    slug: 'water-pipeline-cleaning',
    title: 'Water Pipeline Cleaning',
    titleBn: 'ওয়াটার পাইপলাইন ক্লিনিং (Water Pipeline Cleaning)',
    shortDesc: 'Flushing and descaling internal plumbing lines to eliminate rust, iron sediment, and low water pressure.',
    shortDescBn: 'দেয়াল না ভেঙে আধুনিক হাইড্রো-পালস প্রযুক্তিতে পাইপের ভেতরের জমে থাকা আয়রন, মরিচা ও শ্যাওলা দূরীকরণ।',
    fullDesc: 'Clean water in your tank can still get contaminated if the distribution pipes are clogged with iron deposits, rust, or microbial biofilm. We provide pressurized pipeline flushing to restore clear flow and eliminate brown water and faucet clogging.',
    whatIsThis: 'Water Pipeline Cleaning is a specialized non-corrosive flushing service that removes accumulated iron sludge, rust scale, and microbial biofilms from the inside of your water supply lines.',
    whatIsThisBn: 'ওয়াটার পাইপলাইন ক্লিনিং হলো ঘরের পানির পাইপের ভেতর জমে থাকা আয়রন, মরিচা ও ব্যাক্টেরিয়ার স্তর আধুনিক মেশিনের সাহায্যে দেওয়াল না ভেঙে পরিষ্কার করার আধুনিক পদ্ধতি।',
    whyNeeded: 'Over time, mineral deposits and iron settle on the pipe walls, narrowing water passage and turning water yellow or red. It stains sanitary fittings and causes foul smells.',
    whyNeededBn: 'বছরের পর বছর পাইপ পরিষ্কার না করায় ভেতরে আয়রনের শক্ত আস্তরণ পড়ে পানির পথ সরু হয়ে যায় এবং ট্যাপে ময়লা পানি আসে। বাথরুমের ফিটিংস ও গিজার নষ্ট হয়ে যায়।',
    whenNeeded: [
      'When tap water comes out brown, reddish, or cloudy',
      'Shower flow has reduced to a trickle despite full tank',
      'Bathroom tiles and sanitary wares are getting yellow iron stains'
    ],
    whenNeededBn: [
      'ট্যাপের মুখ খুললেই শুরুতে লাল বা ময়লা পানি বের হলে',
      'ট্যাংকে পানি থাকা সত্ত্বেও শাওয়ার বা বেসিন কলে পর্যাপ্ত প্রেশার না পেলে',
      'স্যানিটারি ফিটিংস ও বেসিনে স্থায়ী আয়রনের হলুদ ছোপ পড়লে'
    ],
    equipment: [
      'High-Frequency Hydro-Pneumatic Pulse Generator',
      'Non-Corrosive Line Descaling Solution (Food-Grade Safe)',
      'Multi-Point Tap Effluent Monitoring Filter'
    ],
    equipmentBn: [
      'হাই-ফ্রিকোয়েন্সি হাইড্রো-নিউম্যাটিক পালস মেশিন',
      'ফুড-গ্রেড নন-করোসিভ পাইপলাইন সল্যুশন',
      'মাল্টি-পয়েন্ট আউটলেট মনিটরিং ফিল্টার'
    ],
    iconName: 'Wrench',
    isPrimary: false,
    benefits: [
      'Removes reddish iron water and foul plumbing odors',
      'Restores normal water pressure in showers and faucets',
      'Flushes accumulated sediment from line elbows and valves',
      'Non-corrosive, safe for PVC, CPVC, PPR, and GI pipes'
    ],
    benefitsBn: [
      'কলের লাইনে জমে থাকা আয়রন ও দুর্গন্ধ কার্যকরভাবে অপসারিত হয়',
      'ব্লকেজ দূর হলে শাওয়ার ও ট্যাপের স্বাভাবিক পানির প্রবাহ পুনরুদ্ধার হতে পারে',
      'দেয়াল না কেটে কোনো ভাঙচুর ছাড়াই বিশেষ মেশিনের মাধ্যমে কাজ সম্পন্ন',
      'পাইপের ধরন অনুযায়ী নিয়ন্ত্রিত চাপে কাজ পরিচালনা'
    ],
    process: [
      'Plumbing pressure test & line mapping',
      'Isolation of main supply and connection of pulse unit',
      'Controlled pulsed flushing of lines segment by segment',
      'Discharge monitoring until effluent runs clear',
      'Aerator nozzle cleaning & flow verification'
    ],
    processBn: [
      'লাইনের সংযোগ ও বর্তমান প্রেশার নিরীক্ষণ',
      'মেশিন সংযুক্ত করে পালসিং পদ্ধতিতে লাইন পরিষ্কার শুরু',
      'প্রতিটি বাথরুম ও কিচেনের কল দিয়ে ভেতরের আয়রন ও মরিচা বের করে দেওয়া',
      'স্বচ্ছ পানি না আসা পর্যন্ত পাইপলাইন ফ্লাশ করা',
      'কলের ফিল্টার নজল পরিষ্কার করে পানির প্রবাহ বুঝিয়ে দেওয়া'
    ],
    idealFor: [
      'Flats with rusty or yellow water coming from taps',
      'Older plumbing systems with low shower pressure',
      'Buildings experiencing persistent line smell'
    ],
    idealForBn: [
      'যেসব বাসাবাড়িতে আয়রনযুক্ত লালচে পানি আসে',
      'ভবনের পাইপলাইনের স্বাভাবিক পানির গতি ফেরাতে',
      'কল বা শাওয়ারের মুখে আটকে থাকা ময়লা পরিষ্কার করতে'
    ],
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=75',
    faqs: [
      {
        question: 'Do I need to break any walls or replace pipes?',
        answer: 'No! Our pulse cleaning connects directly to existing faucet and valve connection points without breaking any walls or removing tiles.',
        questionBn: 'পাইপলাইন ওয়াশ করতে কোনো দেয়াল ভাঙতে হবে?',
        answerBn: 'একদমই না। কোনো দেয়াল বা প্লাস্টার ভাঙতে হয় না। বিদ্যমান কলের পয়েন্ট থেকেই বিশেষ মেশিনের মাধ্যমে লাইনের ময়লা বের করা হয়।'
      }
    ]
  },
  {
    id: 'service-pipeline-both-tanks',
    slug: 'water-pipeline-cleaning-both-water-tank',
    title: 'Water Pipeline Cleaning + Both Water Tank Cleaning',
    titleBn: 'কমপ্লিট ওয়াটার হাইজিন সল্যুশন (All Tanks + Pipeline)',
    shortDesc: 'Complete water hygiene package: High-pressure line flushing plus both underground and rooftop tank cleaning.',
    shortDescBn: 'মাটির নিচের রিজার্ভার, ছাদের ওভারহেড ট্যাংক এবং ভবনের পানির লাইনের সমন্বিত মেকানাইজড ডিপ-ক্লিন।',
    fullDesc: 'A comprehensive whole-system service for buildings and residences demanding thorough water storage and plumbing hygiene. We systematically clean the intake reservoir, the rooftop header tanks, and internal pipeline networks.',
    whatIsThis: 'Water Pipeline Cleaning + Both Water Tank Cleaning is our most comprehensive package, covering underground tanks, roof tanks, and internal pipeline networks in a synchronized manner.',
    whatIsThisBn: 'এটি হলো একটি ভবনের পানি সরবরাহ ব্যবস্থার প্রতিটি স্তরের মেকানাইজড ডিপ-ক্লিন ও স্যানিটাইজেশন নিশ্চিত করার মাস্টার প্যাকেজ।',
    whyNeeded: 'Municipal water brings silt to underground tanks, rooftop tanks develop biofilm, and pipes accumulate rust. Cleaning all components together provides a coordinated and thorough result.',
    whyNeededBn: 'নিচে কাদা, ছাদে শ্যাওলা এবং পাইপে আয়রন—তিনটি অংশ একসাথে পরিষ্কার করলে পুরো ভবনের পানি সরবরাহ ব্যবস্থা পরিষ্কার থাকে।',
    whenNeeded: [
      'Comprehensive whole-building hygiene maintenance',
      'Commercial institutions with high clean water demand',
      'Multi-flat housing societies prior to peak summer or monsoon'
    ],
    whenNeededBn: [
      'ভবনের পানির সার্বিক সমস্যার সমন্বিত সমাধানে',
      'স্কুল, অফিস ও প্রতিষ্ঠানের পরিচ্ছন্ন পানি নিশ্চিতকরণে',
      'বর্ষা মৌসুমের আগে ও পরে ভবনের পুরো ওয়াটার সিস্টেম পরিষ্কার রাখতে'
    ],
    equipment: [
      'Complete Mobile Water Hygiene Fleet',
      'Hydro-Pulse Pipeline Descaling Unit',
      'Dual 150-Bar Rotary Pressure Jet Systems',
      'Submersible Slurry Dewatering Extraction Equipment'
    ],
    equipmentBn: [
      'সম্পূর্ণ ওয়াটার হাইজিন মোবাইল টেকনিক্যাল ইউনিট',
      'হাইড্রো-পালস পাইপ ডেস্কেলিং মেশিন',
      '১৫০ বার মেকানাইজড ডুয়েল রোটারি জেট ওয়াশার',
      'হেভি সাবমারসিবল স্লাজ সেচ পাম্প ও ভ্যাকুয়াম'
    ],
    iconName: 'Sparkles',
    isPrimary: false,
    benefits: [
      'Coordinated cleaning for the entire residential building',
      'Cost discount compared to three separate service orders',
      'Dedicated multi-member specialist team completing work in a single scheduled day',
      'Transparent quotation with zero hidden charges'
    ],
    benefitsBn: [
      'পুরো ভবনের সকল পরিবারের জন্য পরিচ্ছন্ন ও স্বাস্থ্যসম্মত পানি ব্যবস্থা',
      'তিনটি আলাদা সেবার চেয়ে এই কম্বো প্যাকেজে সাশ্রয়ী কোটেশন',
      'একই দিনে অভিজ্ঞ কারিগরি দল দ্বারা সুশৃঙ্খল বাস্তবায়ন',
      'পানির পাইপলাইন, মোটর ও স্যানিটারি ফিটিংসের আয়ু বৃদ্ধি'
    ],
    process: [
      'Comprehensive building water ecosystem assessment',
      'Simultaneous underground and overhead tank deep clean',
      'High-pressure rotary wall jetting & disinfection',
      'Pressurized hydro-pulse pipeline flushing for all lines',
      'Multi-point purity and water flow verification',
      'Formal client walkthrough and handover'
    ],
    processBn: [
      'ভবনের সামগ্রিক পানি ব্যবস্থার টেকনিক্যাল নিরীক্ষা',
      'নিচের রিজার্ভার ও ছাদের ট্যাংকের সমন্বিত মেকানাইজড ডিপ-ক্লিন',
      'ফুড-গ্রেড জীবাণুনাশক প্রয়োগ ও ভ্যাকুমিং',
      'ভবনের সকল বাথরুম ও কিচেন পাইপলাইনের ভেতর থেকে আয়রন বের করা',
      'প্রতিটি কলে স্বাভাবিক পানির স্পিড ও স্বচ্ছতা নিশ্চিতকরণ',
      'গ্রাহককে আনুষ্ঠানিকভাবে ফলাফল বুঝিয়ে দেওয়া'
    ],
    idealFor: [
      'Multi-story residential apartment buildings in Dhaka',
      'Commercial institutions, schools, clinics, and offices',
      'Homeowners demanding the absolute highest water cleanliness standards'
    ],
    idealForBn: [
      'ঢাকা শহরের বহুতল আবাসিক অ্যাপার্টমেন্ট ভবন',
      'হাসপাতাল, কিন্ডারগার্টেন, কলেজ ও বিশ্ববিদ্যালয় হোস্টেল',
      'স্বাস্থ্য সচেতন আধুনিক পরিবারবর্গ'
    ],
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=75',
    faqs: [
      {
        question: 'How do you coordinate with tenants so water is not shut off for too long?',
        answer: 'We provide prior notices and scheduling advice. By deploying multiple technicians with heavy-duty equipment, we complete the entire pipeline and tank package in just 4 to 6 hours.',
        questionBn: 'ভবনের বাসিন্দাদের পানির সমস্যা না করে কীভাবে কাজ করেন?',
        answerBn: 'আমরা কাজ শুরুর আগে পানি ব্যবস্থাপনার পরামর্শ দিই এবং একাধিক টিম একযোগে কাজ করে মাত্র ৪-৬ ঘণ্টার মধ্যে পুরো ভবনের কাজ সুসম্পন্ন করে পানি সরবরাহ পুনরায় চালু করি।'
      }
    ]
  },
  {
    id: 'service-home-cleaning',
    slug: 'professional-home-cleaning-service',
    title: 'Professional Home Cleaning Service',
    titleBn: 'প্রফেশনাল হোম ক্লিনিং সার্ভিস',
    shortDesc: 'Complete residential sanitization, floor scrubbing, furniture dusting, and deep hygiene for your home.',
    shortDescBn: 'বাসাবাড়ি ও অ্যাপার্টমেন্টের ফ্লোর, আসবাবপত্র ও প্রতিটি রুমের গভীর পরিচ্ছন্নতা ও জীবাণুমুক্তকরণ সেবা।',
    fullDesc: 'Comprehensive home cleaning designed to make your living spaces hygienic and sparkling. Our trained cleaning specialists thoroughly sanitize living rooms, bedrooms, balconies, and common areas using eco-friendly solutions.',
    iconName: 'Home',
    isPrimary: false,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=75'
  },
  {
    id: 'service-office-cleaning',
    slug: 'office-cleaning-service',
    title: 'Office Cleaning Service',
    titleBn: 'অফিস ক্লিনিং সার্ভিস',
    shortDesc: 'Scheduled and on-demand professional cleaning for corporate offices, conference rooms, and commercial workspaces.',
    shortDescBn: 'কর্পোরেট অফিস, কনফারেন্স রুম ও ওয়ার্কস্টেশনের নির্ভরযোগ্য ও পেশাদার পরিচ্ছন্নতা সার্ভিস।',
    fullDesc: 'Keep your workplace spotless, hygienic, and productive with our commercial office cleaning services. We sanitize workstations, meeting rooms, glass partitions, and executive suites.',
    iconName: 'Briefcase',
    isPrimary: false,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=75'
  },
  {
    id: 'service-deep-cleaning',
    slug: 'professional-deep-cleaning-service',
    title: 'Professional Deep Cleaning Service',
    titleBn: 'প্রফেশনাল ডিপ ক্লিনিং সার্ভিস',
    shortDesc: 'Intensive top-to-bottom scrub, dirt extraction, and sanitization for newly moved or heavily soiled properties.',
    shortDescBn: 'নতুন ফ্ল্যাটে ওঠা বা পুরনো ময়লা জমার পর নিবিড় মেকানাইজড ডিপ ক্লিনিং ও স্যানিটাইজেশন।',
    fullDesc: 'Goes beyond routine surface dusting. Our deep cleaning tackles hidden grime, tile grout calcification, appliance exteriors, light fixtures, and neglected corners.',
    iconName: 'Sparkles',
    isPrimary: false,
    image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=75'
  },
  {
    id: 'service-sofa-cleaning',
    slug: 'sofa-cleaning-service',
    title: 'Sofa Cleaning Service',
    titleBn: 'সোফা ক্লিনিং সার্ভিস',
    shortDesc: 'Fabric and leather upholstery shampooing, dust mite removal, and high-suction stain extraction.',
    shortDescBn: 'ফেব্রিক ও লেদার সোফার বিশেষ শ্যাম্পু ওয়াশ, ডাস্টমাইট নিধন ও গভীর দাগ তোলার সেবা।',
    fullDesc: 'Restore freshness and hygiene to your sofas and armchairs. We use specialized injection-extraction vacuum machines that lift deep grime, food stains, and allergen dust mites.',
    iconName: 'Layers',
    isPrimary: false,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=75'
  },
  {
    id: 'service-bathroom-cleaning',
    slug: 'bathroom-cleaning-service',
    title: 'Bathroom Cleaning Service',
    titleBn: 'বাথরুম ক্লিনিং সার্ভিস',
    shortDesc: 'Hard water tile descaling, commode sanitization, tap polishing, and total odor elimination.',
    shortDescBn: 'টাইলসের আয়রন ও হলুদ দাগ দূরীকরণ, কমোড ও বেসিনের ডিপ ডিসইনফেকশন।',
    fullDesc: 'Intensive descaling and bacterial disinfection for washrooms. Removes stubborn yellowish iron stains from floor tiles, glass shower enclosures, mirrors, and sanitary fittings.',
    iconName: 'Droplets',
    isPrimary: false,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=75'
  },
  {
    id: 'service-kitchen-cleaning',
    slug: 'kitchen-cleaning-service',
    title: 'Kitchen Cleaning Service',
    titleBn: 'কিচেন ক্লিনিং সার্ভিস',
    shortDesc: 'Degreasing kitchen hoods, stovetops, cabinets, sinks, and wall tiles with safe grease lifters.',
    shortDescBn: 'রান্নাঘরের তেলচিটে দাগ, কিচেন হুড, চুলা ও সিঙ্কের গভীর গ্রিজ অপসারণ সেবা।',
    fullDesc: 'Thorough grease removal and kitchen hygiene. Eliminates oily films from exhaust hoods, cooktops, countertops, cabinets, and splashback tiles.',
    iconName: 'Wrench',
    isPrimary: false,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=75'
  },
  {
    id: 'service-pest-control',
    slug: 'pest-control-service',
    title: 'Pest Control Service',
    titleBn: 'পেস্ট কন্ট্রোল সার্ভিস',
    shortDesc: 'Eco-friendly and odorless eradication of cockroaches, bedbugs, termites, and rodents.',
    shortDescBn: 'তেলাপোকা, ছারপোকা, উইপোকা ও ইঁদুর দমনে নিরাপদ ও পরিবেশবান্ধব পেস্ট কন্ট্রোল।',
    fullDesc: 'Certified pest eradication using WHO-approved, odorless formulations that protect your children and pets while permanently eradicating harmful infestations.',
    iconName: 'ShieldAlert',
    isPrimary: false,
    image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=800&q=75'
  },
  {
    id: 'service-glass-window-cleaning',
    slug: 'glass-window-cleaning-service',
    title: 'Glass & Window Cleaning Service',
    titleBn: 'গ্লাস ও উইন্ডো ক্লিনিং সার্ভিস',
    shortDesc: 'Spotless exterior and interior window washing, pane descaling, and high-rise glass washing.',
    shortDescBn: 'ভবন ও অ্যাপার্টমেন্টের কাঁচের জানালা ও গ্লাস পার্টিশন দাগহীন স্বচ্ছ পরিষ্কার সেবা।',
    fullDesc: 'Crystal clear glass cleaning for residential windows, high-rise building facades, and office glass partitions using scratch-free squeegees and purified water rinses.',
    iconName: 'Building',
    isPrimary: false,
    image: 'https://images.unsplash.com/photo-1527515545081-5db817172677?auto=format&fit=crop&w=800&q=75'
  },
  {
    id: 'service-carpet-cleaning',
    slug: 'carpet-cleaning-service',
    title: 'Carpet Cleaning Service',
    titleBn: 'কার্পেট ক্লিনিং সার্ভিস',
    shortDesc: 'High-suction foam shampooing and rapid drying to remove embedded mud and allergen dust.',
    shortDescBn: 'অফিস ও বাসার কার্পেটের গভীর ধুলাবালি, জীবাণু ও দাগ অপসারণের ফোম শ্যাম্পু ওয়াশ।',
    fullDesc: 'Deep carpet shampooing using industrial injection-extraction equipment that lifts trapped mud and dust mites without over-wetting, ensuring fast drying.',
    iconName: 'Layers',
    isPrimary: false,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=75'
  },
  {
    id: 'service-commercial-cleaning',
    slug: 'commercial-cleaning-service',
    title: 'Commercial Cleaning Service',
    titleBn: 'কমার্শিয়াল ক্লিনিং সার্ভিস',
    shortDesc: 'Heavy-duty cleaning for shopping malls, healthcare centers, schools, and industrial facilities.',
    shortDescBn: 'শপিং মল, হাসপাতাল, স্কুল ও বাণিজ্যিক ভবনের সার্বিক পেশাদার ক্লিনিং সল্যুশন।',
    fullDesc: 'Turnkey facility maintenance and post-renovation commercial scrubbing with multi-person squads equipped with rotary floor scrubbers and wet vacuum extractors.',
    iconName: 'Building',
    isPrimary: false,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=75'
  }
];

export const CLEANING_STEPS: ProcessStep[] = [
  {
    step: 'Step 01',
    number: '01',
    title: 'Inspection',
    titleBn: 'প্রাথমিক পরিদর্শন (Inspection)',
    description: 'Comprehensive physical examination of tank condition, water level, sediment depth, access hatch, ventilation, and structural integrity.',
    descriptionBn: 'ট্যাংকের বর্তমান অবস্থা, কাদার পুরুত্ব, শ্যাওলা, পাইপ ফিটিংস এবং লিকেজ আছে কি না তা বিশদভাবে পরীক্ষা করা।',
    icon: 'Search'
  },
  {
    step: 'Step 02',
    number: '02',
    title: 'Water Drainage',
    titleBn: 'পানি নিষ্কাশন (Water Drainage)',
    description: 'Controlled de-watering using submersible electric pumps to safely evacuate remaining water while avoiding flooded rooftops or basements.',
    descriptionBn: 'সাবমারসিবল পাম্পের সাহায্যে ট্যাংকের পানি দ্রুত ও সুশৃঙ্খলভাবে ড্রেন দিয়ে নিরাপদে বের করে দেওয়া।',
    icon: 'ArrowDownCircle'
  },
  {
    step: 'Step 03',
    number: '03',
    title: 'Sediment Removal',
    titleBn: 'কাদা ও স্লাজ উত্তোলন (Sludge Extraction)',
    description: 'Thick municipal sludge, sand, rust, and silt collected at the bottom sump are extracted using industrial slurry pumps and containment buckets.',
    descriptionBn: 'ট্যাংকের তলদেশে বছরের পর বছর জমে থাকা ভারী কাদা, বালু ও বিষাক্ত স্লাজ বিশেষ পাম্প ও পাত্রে উঠিয়ে অপসারণ।',
    icon: 'Trash2'
  },
  {
    step: 'Step 04',
    number: '04',
    title: 'Surface Scrubbing',
    titleBn: 'মেকানিক্যাল স্ক্রাবিং (Mechanical Scrubbing)',
    description: 'Rigorous mechanical wall and floor scrubbing to loosen stubborn algae film, calcified mineral crusts, and microscopic fungal layers.',
    descriptionBn: 'ট্যাংকের দেয়াল ও মেঝের শক্ত শ্যাওলা, ফাংগাস ও আয়রনের কোটিং সফট ব্রাশ দিয়ে নিখুঁতভাবে ঘষে আলগা করা।',
    icon: 'Sparkles'
  },
  {
    step: 'Step 05',
    number: '05',
    title: 'Deep Cleaning',
    titleBn: 'হাই-প্রেসার ওয়াশ (150-Bar Rotary Jet)',
    description: 'High-pressure 120-150 bar rotary water jets blast every internal rib, corner, and pipe joint to strip away embedded grime without damaging waterproofing.',
    descriptionBn: '১৫০ বার উচ্চ চাপের রোটারি জেট দিয়ে ট্যাংকের প্রতিটি কোণা, ছাদ ও খাঁজ থেকে অবশিষ্ট দাগ ও ময়লা ধুয়ে ফেলা।',
    icon: 'Waves'
  },
  {
    step: 'Step 06',
    number: '06',
    title: 'Appropriate Disinfection',
    titleBn: 'নিরাপদ জীবাণুমুক্তকরণ (Sanitization)',
    description: 'Application of food-grade, certified non-toxic antibacterial agent to neutralize pathogens, bacteria, and spores without lingering odors.',
    descriptionBn: 'মানুষের স্বাস্থ্যের জন্য সম্পূর্ণ নিরাপদ, ফুড-গ্রেড ও দুর্গন্ধহীন জীবাণুনাশক দিয়ে ব্যাকটেরিয়া ও ভাইরাস ধ্বংস করা।',
    icon: 'ShieldCheck'
  },
  {
    step: 'Step 07',
    number: '07',
    title: 'Final Rinse',
    titleBn: 'ফাইনাল ওয়াশ ও ভ্যাকুমিং (Fresh Water Rinse)',
    description: 'Complete fresh water high-volume flushing followed by heavy-duty wet vacuuming to evacuate 100% of rinse residue and particulates.',
    descriptionBn: 'সম্পূর্ণ পরিষ্কার পানি দিয়ে ধুয়ে তলদেশের অবশিষ্ট পানি ভ্যাকুয়াম মেশিনে টেনে সম্পূর্ণ শুকনো ও ঝকঝকে করা।',
    icon: 'Droplets'
  },
  {
    step: 'Step 08',
    number: '08',
    title: 'Final Inspection',
    titleBn: 'ফাইনাল কোয়ালিটি চেক (Final Quality Audit)',
    description: 'Meticulous check of tank surface cleanliness, float valves, overflow mesh, lid seals, and ensuring zero residual odor.',
    descriptionBn: 'ট্যাংকের ইনলেট-আউটলেট, ফ্লোট ভাল্ব, ওভারফ্লো পাইপ এবং ঢাকনা সঠিকভাবে সিল হয়েছে কি না চূড়ান্ত পরীক্ষা।',
    icon: 'CheckCircle2'
  },
  {
    step: 'Step 09',
    number: '09',
    title: 'Handover',
    titleBn: 'গ্রাহকের নিকট হস্তান্তর (Handover)',
    description: 'Transparent client walkthrough, securing tank lids, initiating fresh refill, and providing official handover confirmation.',
    descriptionBn: 'গ্রাহক বা ভবন কমিটিকে পরিষ্কার ট্যাংক সশরীরে দেখিয়ে সন্তুষ্টি সাপেক্ষে পানি লোড দিয়ে কাজ সম্পন্ন করা।',
    icon: 'Shield'
  }
];

export const WHY_CHOOSE_US = [
  {
    id: 1,
    title: 'Rooftop Tank Cleaning',
    titleBn: 'ছাদের ট্যাংক ক্লিনিং স্পেশালিস্ট',
    desc: 'Specialized for overhead PVC, plastic, fiberglass, and concrete rooftop tanks with safe roof rigging.',
    descBn: 'ছাদের পিভিসি, প্লাস্টিক ও আরসিসি কংক্রিট ট্যাংক আধুনিক রোটারি জেটে কোনো ক্ষতি ছাড়াই পরিষ্কারের অভিজ্ঞতা।',
    icon: 'Building'
  },
  {
    id: 2,
    title: 'Underground Tank Cleaning',
    titleBn: 'আন্ডারগ্রাউন্ড হেভি স্লাজ এক্সট্রাকশন',
    desc: 'Heavy-duty submersible mud slurry pumps and fresh air ventilation for subterranean concrete reservoirs.',
    descBn: 'মাটির নিচের রিজার্ভারের গভীর কাদা ও ওয়াসা পলি তোলার জন্য হেভি-ডিউটি কাদা পাম্প ও ফ্রেস এয়ার ভেন্টিলেশন।',
    icon: 'ShieldAlert'
  },
  {
    id: 3,
    title: 'Pipeline Cleaning',
    titleBn: 'দেয়াল না ভেঙে পাইপলাইন ওয়াশ',
    desc: 'Pressurized non-corrosive flushing to dislodge iron sediment, rust flakes, and restore tap flow pressure.',
    descBn: 'হাইড্রো-পালস প্রযুক্তিতে বাথরুম ও কিচেন পাইপের আয়রন, মরিচা ও ময়লা ধুয়ে স্বাভাবিক পানির গতি ফিরিয়ে আনা।',
    icon: 'Wrench'
  },
  {
    id: 4,
    title: 'Building & Apartment Service',
    titleBn: 'আবাসিক অ্যাপার্টমেন্টে বিশেষ অভিজ্ঞতা',
    desc: 'Coordinated cleaning packages for multi-unit buildings, managing rooftop and reserve tanks in single visits.',
    descBn: 'ঢাকা শহরের বহুতল আবাসিক সমিতি ও ভবনে বাসিন্দাদের পানির ভোগান্তি কমিয়ে সুশৃঙ্খল সার্ভিস প্রদান।',
    icon: 'Building2'
  },
  {
    id: 5,
    title: 'WhatsApp Quotation',
    titleBn: 'হোয়াটসঅ্যাপে দ্রুত স্বচ্ছ কোটেশন',
    desc: 'Instant, transparent price estimates sent directly to your WhatsApp with no hidden fees or unexpected extras.',
    descBn: 'ট্যাংকের সাইজ জানালে সরাসরি হোয়াটসঅ্যাপে কোনো গোপন চার্জ ছাড়াই নির্ভরযোগ্য কোটেশন।',
    icon: 'MessageCircle'
  },
  {
    id: 6,
    title: 'Flexible Scheduling',
    titleBn: 'সপ্তাহের ৭ দিন সুবিধাজনক শিডিউল',
    desc: 'Convenient morning, weekend, and holiday time slots to match resident schedules and building water demands.',
    descBn: 'ছুটির দিন বা শুক্রবার ভবনের বাসিন্দাদের সুবিধামতো যেকোনো সময়ে পূর্ব-নির্ধারিত টাইমে দ্রুত সার্ভিস প্রদান।',
    icon: 'CalendarCheck'
  }
];

export const FAQS_DATA: FaqItem[] = [
  {
    id: 1,
    question: 'How often should I clean my water tank?',
    questionBn: 'কত দিন পর পর ওয়াটার ট্যাংক পরিষ্কার করা উচিত?',
    answer: 'Water hygiene experts recommend cleaning residential and commercial water storage tanks at least once every 6 months (twice a year). In areas with high sediment, iron, or municipal supply fluctuations like Dhaka, cleaning every 4 to 6 months helps maintain water clarity and prevent thick mud accumulation.',
    answerBn: 'সাধারণ সুপারিশ অনুযায়ী বাসাবাড়ি ও ভবনের পানির ট্যাংক প্রতি ৪ থেকে ৬ মাস অন্তর (বছরে ন্যূনতম ২ বার) পরিষ্কার করা স্বাস্থ্যসম্মত। ঢাকা শহরে পানিতে কাদা ও আয়রন বেশি থাকায় নিয়মিত পরিষ্কার না করলে পানিতে দুর্গন্ধ ও কল বন্ধ হওয়ার মতো সমস্যা দেখা দেয়।',
    category: 'General'
  },
  {
    id: 2,
    question: 'Do you clean rooftop water tanks?',
    questionBn: 'আপনারা কি ছাদের সব ধরনের ট্যাংক পরিষ্কার করেন?',
    answer: 'Yes! We clean all types of rooftop water tanks, including PVC, plastic rotomold, fiberglass, and overhead RCC concrete tanks. We bring portable high-pressure equipment designed for rooftop access without splashing dirty water around your roof.',
    answerBn: 'হ্যাঁ! ছাদের পিভিসি, প্লাস্টিক বা কংক্রিট আরসিসি যেকোনো সাইজের ট্যাংক আমরা আধুনিক হাই-প্রেসার জেটে ছাদে কোনো নোংরা পানি না ছড়িয়ে যত্নসহকারে পরিষ্কার করি।',
    category: 'General'
  },
  {
    id: 3,
    question: 'Do you clean underground reserve tanks?',
    questionBn: 'মাটির নিচের আন্ডারগ্রাউন্ড রিজার্ভার কীভাবে পরিষ্কার করেন?',
    answer: 'Yes, underground reserve tank cleaning is one of our core specialties. We are equipped with submersible mud slurry pumps, safety illumination, and heavy-duty wet vacuums to extract thick sludge and sediment that settles at the bottom of underground tanks.',
    answerBn: 'আন্ডারগ্রাউন্ড রিজার্ভার আমাদের মূল বিশেষত্ব। শক্তিশালী সাবমারসিবল কাদা পাম্প দিয়ে নিচের ঘন পলি তুলে ফেলে দেয়াল ও মেঝের ময়লা সম্পূর্ণ পরিষ্কার করে ফুড-গ্রেড স্যানিটাইজ করা হয়।',
    category: 'General'
  },
  {
    id: 4,
    question: 'Do you provide water pipeline cleaning?',
    questionBn: 'আপনারা কি ঘরের ভেতরের পানির পাইপলাইন পরিষ্কার করেন?',
    answer: 'Yes, we provide pressurized pipeline flushing to dislodge accumulated iron deposits, rust, and silt from internal supply pipes that cause brownish water or low water pressure in taps and showers.',
    answerBn: 'হ্যাঁ, আমরা হাইড্রো-পালস প্রযুক্তিতে কোনো দেয়াল না ভেঙে বাথরুম ও কিচেন পাইপলাইনের ভেতরের মরিচা, কাদা ও আয়রনের স্তর ফ্লাশ করে বের করে দিই, যাতে পানির স্পিড বাড়ে।',
    category: 'General'
  },
  {
    id: 5,
    question: 'How long does tank cleaning take?',
    questionBn: 'একটি ট্যাংক পরিষ্কার করতে কত সময় লাগে?',
    answer: 'A standard residential rooftop PVC tank (500 to 2,000 Liters) typically takes about 1.5 to 2.5 hours. Underground reserve tanks or large building tanks (5,000 to 20,000+ Liters) usually take between 3 to 5 hours, depending on capacity and sediment thickness.',
    answerBn: 'একটি সাধারণ ছাদের পিভিসি ট্যাংকে প্রায় ১.৫ থেকে ২ ঘণ্টা সময় লাগে। আর মাটির নিচের বড় রিজার্ভারে কাদার পরিমাণ অনুযায়ী ৩ থেকে ৫ ঘণ্টার মধ্যে কাজ শেষ হয়।',
    category: 'Process'
  },
  {
    id: 6,
    question: 'How much does water tank cleaning cost?',
    questionBn: 'ট্যাংক পরিষ্কারের সার্ভিস চার্জ কত?',
    answer: 'Our rooftop tank cleaning starts from ৳ 1,200 for standard residential sizes, while underground reserve tanks start from ৳ 2,500. The exact price depends on tank capacity, the number of tanks, your area in Dhaka, and accessibility. You can request a fast free quote on our website or over WhatsApp for an exact quotation.',
    answerBn: 'ছাদের সাধারণ পিভিসি ট্যাংক ১২০০ টাকা থেকে শুরু এবং মাটির নিচের রিজার্ভার ২৫০০ টাকা থেকে শুরু। ট্যাংকের সাইজ, সংখ্যা ও অবস্থানের ওপর নির্ভর করে সঠিক কোটেশন পেতে আমাদের ওয়েবসাইটে কোটেশন ফর্ম পূরণ করুন অথবা হোয়াটসঅ্যাপে জানান।',
    category: 'Pricing'
  },
  {
    id: 7,
    question: 'Do you clean apartment building tanks?',
    questionBn: 'আপনারা কি বড় অ্যাপার্টমেন্ট ভবনের কাজ করেন?',
    answer: 'Yes, we regularly service multi-unit residential apartment buildings and housing societies. We coordinate with building management committees to arrange convenient service hours that minimize disruption to tenants.',
    answerBn: 'হ্যাঁ, আমরা নিয়মিত ঢাকা শহরের বহুতল আবাসিক অ্যাপার্টমেন্ট ও সোসাইটিতে কাজ করি। ভবন কমিটির সাথে আলোচনা করে বাসিন্দাদের পানির অসুবিধা না ঘটিয়ে দ্রুত কাজ সম্পন্ন করি।',
    category: 'General'
  },
  {
    id: 8,
    question: 'Do you provide commercial tank cleaning?',
    questionBn: 'বাণিজ্যিক ভবন, হাসপাতাল বা কারখানায় সার্ভিস দেওয়া হয়?',
    answer: 'Yes, we provide commercial tank cleaning for corporate offices, hotels, restaurants, factories, hospitals, and educational institutions with flexible weekend and evening scheduling.',
    answerBn: 'হ্যাঁ, হাসপাতাল, করপোরেট অফিস, রেস্তোরাঁ, স্কুল ও কারখানার বিশাল ওয়াটার রিজার্ভারের জন্য আমাদের বিশেষায়িত ইন্ডাস্ট্রিয়াল টিম ও যন্ত্রপাতি রয়েছে।',
    category: 'General'
  },
  {
    id: 9,
    question: 'Do I need to empty the tank before the team arrives?',
    questionBn: 'কাজ করার আগে কি আমাদের পুরো ট্যাংক খালি করে রাখতে হবে?',
    answer: 'No, you do not need to empty the entire tank beforehand. We recommend using as much water as possible for regular household chores so minimal water is wasted. Our team brings submersible drainage pumps to quickly drain the remaining water and sludge.',
    answerBn: 'না, আগে থেকে পানি নষ্ট করে ফেলতে হবে না। স্বাভাবিক ব্যবহারে যতটুকু পানি কমানো যায় রাখবেন, বাকি পানি আমাদের শক্তিশালী পাম্প দিয়ে মাত্র ১৫-২০ মিনিটেই বের করে নেওয়া হয়।',
    category: 'Process'
  },
  {
    id: 10,
    question: 'How can I book your service?',
    questionBn: 'কীভাবে বুকিং বা কোটেশন নেওয়া যাবে?',
    answer: 'Booking is simple! You can fill out our Quick Quote form on this website, call our team directly at 01609-999612, or send us a message on WhatsApp or Messenger. We will confirm your location, tank details, preferred time slot, and provide a transparent quote.',
    answerBn: 'খুব সহজ! ওয়েবসাইটের কোটেশন বাটনে চাপুন, অথবা সরাসরি 01609-999612 নম্বরে কল বা হোয়াটসঅ্যাপ করুন। আপনার ঠিকানা ও ট্যাংকের বিবরণ দিলে তৎক্ষণাৎ শিডিউল ও কোটেশন দেওয়া হবে।',
    category: 'Booking'
  }
];

export const REVIEWS_DATA: ReviewItem[] = [
  {
    id: 'rev-1',
    customerName: 'Tanvir Hossain',
    area: 'Bashundhara R/A, Block C',
    service: 'Rooftop & Underground Tank Cleaning',
    rating: 5,
    date: '2026-08-14',
    comment: 'Sunviloz Clean Care cleaned both our underground reserve and 2 rooftop tanks in Bashundhara. The team arrived on time with proper high-pressure equipment. The amount of mud they removed was unbelievable. Very polite and professional work.',
    isVerified: true
  },
  {
    id: 'rev-2',
    customerName: 'Nasrin Akhter',
    area: 'Uttara, Sector 7',
    service: 'Rooftop Water Tank Cleaning',
    rating: 5,
    date: '2026-07-28',
    comment: 'Booked via WhatsApp. They responded within minutes and came the next morning. Cleaned our 1500L PVC tank thoroughly and did not make any mess on the roof. Transparent pricing as discussed.',
    isVerified: true
  },
  {
    id: 'rev-3',
    customerName: 'M. Rahman (Building Secretary)',
    area: 'Gulshan 2',
    service: 'Apartment Building Tank Cleaning',
    rating: 5,
    date: '2026-08-02',
    comment: 'Arranged cleaning for our 6-story residential building. They managed the water drain timing carefully so residents had minimal water downtime. Highly recommended for apartment committees.',
    isVerified: true
  },
  {
    id: 'rev-4',
    customerName: 'Dr. Shahriar Kabir',
    area: 'Dhanmondi, Road 11/A',
    service: 'Underground Reserve Tank Cleaning',
    rating: 5,
    date: '2026-06-19',
    comment: 'Cleaned a 15-year-old reserve tank that had thick sludge at the bottom. Used mud pump and suction vacuum. The water is visibly clearer now and the bad smell is completely gone.',
    isVerified: true
  }
];
