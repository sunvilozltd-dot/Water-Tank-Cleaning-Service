import { LOCATIONS_DATA } from '../data/locationsData';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { safeGetItem, safeSetItem } from '../utils/safeLocalStorage';
import { sanitizeRichHtml, stripHtmlToPlainText } from '../utils/htmlSanitizer';
import { SITE_DOMAIN } from '../config/siteDomain';

export const ZONES_CHANGED_EVENT = 'sunviloz_zones_changed';
const ZONES_CACHE_KEY = 'sunviloz_zones_cache_v1';
const STORAGE_ZONES_PATH = 'config/service_zones.json';

export interface VerifiedFinding {
  summary: string;
  source: string;
  testedDate: string;
}

export interface ZoneAreaFaq {
  question: string;
  answer: string;
}

export interface ZoneAreaContent {
  title: string;
  titleBn: string;
  metaDesc: string;
  seoTitle?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  heroImage?: string;
  heroImageAlt?: string;
  intro: string;
  introBn: string;
  waterProblemsBn: string;
  waterProblemsEn: string;
  potentialCausesBn: string;
  potentialCausesEn: string;
  waterConditionNote: string;
  waterConditionNoteBn: string;
  practicalAdviceBn: string;
  practicalAdviceEn: string;
  verifiedFindings: VerifiedFinding[];
  coverageDetails: string[];
  pricingFactors: string[];
  faqs: ZoneAreaFaq[];
}

export interface ZoneAreaRecord {
  id: string;
  zoneId: string;
  zoneSlug: string;
  slug: string;
  areaName: string;
  areaNameBn: string;
  isCoreCity: boolean;
  isVisible: boolean;
  status: 'draft' | 'published';
  sortOrder: number;
  version: number;
  publishedAt?: string;
  updatedAt?: string;
  draftData: ZoneAreaContent;
  publishedData: ZoneAreaContent;
}

export interface ServiceZoneContent {
  summaryEn: string;
  summaryBn: string;
  placesText: string;
  featuredSlug: string;
  highlightsBn?: string[];
  highlightsEn?: string[];
  seoTitle?: string;
  metaDesc?: string;
}

export interface ServiceZoneRecord {
  id: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  summaryEn: string;
  summaryBn: string;
  featuredSlug: string;
  placesText: string;
  sortOrder: number;
  isVisible: boolean;
  status: 'draft' | 'published';
  version: number;
  publishedAt?: string;
  updatedAt?: string;
  draftData: ServiceZoneContent;
  publishedData: ServiceZoneContent;
}

export interface ContentRevisionRecord {
  id: string;
  entityType: 'service_zone' | 'zone_area' | 'site_config';
  entityId: string;
  version: number;
  snapshot: any;
  createdBy: string | null;
  createdAt: string;
}

export interface UrlRedirectRecord {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302;
  isActive: boolean;
  createdAt?: string;
}

const AREA_TO_ZONE_SLUG: Record<string, string> = {
  uttara: 'north-dhaka-zone',
  bashundhara: 'north-dhaka-zone',
  khilkhet: 'north-dhaka-zone',
  gulshan: 'diplomatic-commercial-zone',
  banani: 'diplomatic-commercial-zone',
  baridhara: 'diplomatic-commercial-zone',
  dhanmondi: 'central-west-dhaka-zone',
  mirpur: 'central-west-dhaka-zone',
  mohammadpur: 'central-west-dhaka-zone',
  badda: 'east-south-dhaka-zone',
  rampura: 'east-south-dhaka-zone',
  dhaka: 'east-south-dhaka-zone',
  gazipur: 'greater-dhaka-corridor',
  savar: 'greater-dhaka-corridor',
  narayanganj: 'greater-dhaka-corridor'
};

const CORE_CITY_SLUGS = new Set(['dhaka', 'narayanganj', 'gazipur', 'savar']);

export const DEFAULT_SERVICE_ZONES: ServiceZoneRecord[] = [
  {
    id: 'zone-north-dhaka',
    slug: 'north-dhaka-zone',
    nameEn: 'North Dhaka Zone',
    nameBn: 'উত্তর ঢাকা জোন',
    summaryEn: 'Dedicated mobile cleaning crews stationed daily across Uttara, Bashundhara, Nikunja, Khilkhet, and Kuril.',
    summaryBn: 'উত্তরা, বসুন্ধরা, নিকুঞ্জ, খিলক্ষেত ও কুড়িল এলাকার বাসাবাড়ি ও ভবনে প্রতিদিন মোবাইল টিম সেবা দিচ্ছে।',
    featuredSlug: 'uttara',
    placesText: 'Uttara (Sectors 1–18), Bashundhara R/A, Nikunja 1 & 2, Khilkhet, Kuril',
    sortOrder: 1,
    isVisible: true,
    status: 'published',
    version: 1,
    draftData: {
      summaryEn: 'Dedicated mobile cleaning crews stationed daily across Uttara, Bashundhara, Nikunja, Khilkhet, and Kuril.',
      summaryBn: 'উত্তরা, বসুন্ধরা, নিকুঞ্জ, খিলক্ষেত ও কুড়িল এলাকার বাসাবাড়ি ও ভবনে প্রতিদিন মোবাইল টিম সেবা দিচ্ছে।',
      placesText: 'Uttara (Sectors 1–18), Bashundhara R/A, Nikunja 1 & 2, Khilkhet, Kuril',
      featuredSlug: 'uttara'
    },
    publishedData: {
      summaryEn: 'Dedicated mobile cleaning crews stationed daily across Uttara, Bashundhara, Nikunja, Khilkhet, and Kuril.',
      summaryBn: 'উত্তরা, বসুন্ধরা, নিকুঞ্জ, খিলক্ষেত ও কুড়িল এলাকার বাসাবাড়ি ও ভবনে প্রতিদিন মোবাইল টিম সেবা দিচ্ছে।',
      placesText: 'Uttara (Sectors 1–18), Bashundhara R/A, Nikunja 1 & 2, Khilkhet, Kuril',
      featuredSlug: 'uttara'
    }
  },
  {
    id: 'zone-diplomatic',
    slug: 'diplomatic-commercial-zone',
    nameEn: 'Diplomatic & Commercial Zone',
    nameBn: 'ডিপ্লোম্যাটিক ও বাণিজ্যিক জোন',
    summaryEn: 'Specialized high-hygiene operations for residential towers, offices, embassies, and commercial buildings in Gulshan, Banani, and Baridhara.',
    summaryBn: 'গুলশান, বনানী, বারিধারা ও নিকেতনের আবাসিক টাওয়ার, দূতাবাস ও করপোরেট অফিসের জন্য বিশেষায়িত সেবা।',
    featuredSlug: 'gulshan',
    placesText: 'Gulshan 1 & 2, Banani, Banani DOHS, Baridhara Diplomatic Zone, Niketan',
    sortOrder: 2,
    isVisible: true,
    status: 'published',
    version: 1,
    draftData: {
      summaryEn: 'Specialized high-hygiene operations for residential towers, offices, embassies, and commercial buildings in Gulshan, Banani, and Baridhara.',
      summaryBn: 'গুলশান, বনানী, বারিধারা ও নিকেতনের আবাসিক টাওয়ার, দূতাবাস ও করপোরেট অফিসের জন্য বিশেষায়িত সেবা।',
      placesText: 'Gulshan 1 & 2, Banani, Banani DOHS, Baridhara Diplomatic Zone, Niketan',
      featuredSlug: 'gulshan'
    },
    publishedData: {
      summaryEn: 'Specialized high-hygiene operations for residential towers, offices, embassies, and commercial buildings in Gulshan, Banani, and Baridhara.',
      summaryBn: 'গুলশান, বনানী, বারিধারা ও নিকেতনের আবাসিক টাওয়ার, দূতাবাস ও করপোরেট অফিসের জন্য বিশেষায়িত সেবা।',
      placesText: 'Gulshan 1 & 2, Banani, Banani DOHS, Baridhara Diplomatic Zone, Niketan',
      featuredSlug: 'gulshan'
    }
  },
  {
    id: 'zone-central-west',
    slug: 'central-west-dhaka-zone',
    nameEn: 'Central & West Dhaka Zone',
    nameBn: 'সেন্ট্রাল ও পশ্চিম ঢাকা জোন',
    summaryEn: 'Fast dispatch for underground reservoirs, rooftop PVC/RCC tanks, and pipeline flushing across Dhanmondi, Mirpur, and Mohammadpur.',
    summaryBn: 'ধানমন্ডি, মিরপুর, মোহাম্মদপুর, লালমাটিয়া ও তেজগাঁও এলাকার রিজার্ভার, ছাদের ট্যাংক ও পাইপলাইন পরিষ্কার সেবা।',
    featuredSlug: 'dhanmondi',
    placesText: 'Dhanmondi, Mirpur (1–14 & DOHS), Mohammadpur, Lalmatia, Tejgaon',
    sortOrder: 3,
    isVisible: true,
    status: 'published',
    version: 1,
    draftData: {
      summaryEn: 'Fast dispatch for underground reservoirs, rooftop PVC/RCC tanks, and pipeline flushing across Dhanmondi, Mirpur, and Mohammadpur.',
      summaryBn: 'ধানমন্ডি, মিরপুর, মোহাম্মদপুর, লালমাটিয়া ও তেজগাঁও এলাকার রিজার্ভার, ছাদের ট্যাংক ও পাইপলাইন পরিষ্কার সেবা।',
      placesText: 'Dhanmondi, Mirpur (1–14 & DOHS), Mohammadpur, Lalmatia, Tejgaon',
      featuredSlug: 'dhanmondi'
    },
    publishedData: {
      summaryEn: 'Fast dispatch for underground reservoirs, rooftop PVC/RCC tanks, and pipeline flushing across Dhanmondi, Mirpur, and Mohammadpur.',
      summaryBn: 'ধানমন্ডি, মিরপুর, মোহাম্মদপুর, লালমাটিয়া ও তেজগাঁও এলাকার রিজার্ভার, ছাদের ট্যাংক ও পাইপলাইন পরিষ্কার সেবা।',
      placesText: 'Dhanmondi, Mirpur (1–14 & DOHS), Mohammadpur, Lalmatia, Tejgaon',
      featuredSlug: 'dhanmondi'
    }
  },
  {
    id: 'zone-east-south',
    slug: 'east-south-dhaka-zone',
    nameEn: 'East & South Dhaka Zone',
    nameBn: 'পূর্ব ও দক্ষিণ ঢাকা জোন',
    summaryEn: 'High-pressure mud extraction and water storage cleaning across Badda, Rampura, Banasree, Motijheel, and Old Dhaka.',
    summaryBn: 'বাড্ডা, রামপুরা, বনশ্রী, খিলগাঁও, মতিঝিল ও পুরান ঢাকার বাসাবাড়ি ও বাণিজ্যিক ভবনে নিয়মিত সেবা।',
    featuredSlug: 'badda',
    placesText: 'Badda, Rampura, Banasree, Aftabnagar, Khilgaon, Motijheel, Puran Dhaka',
    sortOrder: 4,
    isVisible: true,
    status: 'published',
    version: 1,
    draftData: {
      summaryEn: 'High-pressure mud extraction and water storage cleaning across Badda, Rampura, Banasree, Motijheel, and Old Dhaka.',
      summaryBn: 'বাড্ডা, রামপুরা, বনশ্রী, খিলগাঁও, মতিঝিল ও পুরান ঢাকার বাসাবাড়ি ও বাণিজ্যিক ভবনে নিয়মিত সেবা।',
      placesText: 'Badda, Rampura, Banasree, Aftabnagar, Khilgaon, Motijheel, Puran Dhaka',
      featuredSlug: 'badda'
    },
    publishedData: {
      summaryEn: 'High-pressure mud extraction and water storage cleaning across Badda, Rampura, Banasree, Motijheel, and Old Dhaka.',
      summaryBn: 'বাড্ডা, রামপুরা, বনশ্রী, খিলগাঁও, মতিঝিল ও পুরান ঢাকার বাসাবাড়ি ও বাণিজ্যিক ভবনে নিয়মিত সেবা।',
      placesText: 'Badda, Rampura, Banasree, Aftabnagar, Khilgaon, Motijheel, Puran Dhaka',
      featuredSlug: 'badda'
    }
  },
  {
    id: 'zone-greater-corridor',
    slug: 'greater-dhaka-corridor',
    nameEn: 'Greater Dhaka Corridor',
    nameBn: 'বৃহত্তর ঢাকা করিডোর',
    summaryEn: 'Scheduled mobile team dispatch for residential and commercial buildings in Gazipur, Savar, and Narayanganj.',
    summaryBn: 'ঢাকা সংলগ্ন গাজীপুর, সাভার ও নারায়ণগঞ্জ এলাকার আবাসিক ও বাণিজ্যিক ভবনে নির্ধারিত শিডিউলে সেবা।',
    featuredSlug: 'gazipur',
    placesText: 'Gazipur (Tongi, Joydebpur, Chowrasta), Savar & Ashulia, Narayanganj (Chashara, Fatullah)',
    sortOrder: 5,
    isVisible: true,
    status: 'published',
    version: 1,
    draftData: {
      summaryEn: 'Scheduled mobile team dispatch for residential and commercial buildings in Gazipur, Savar, and Narayanganj.',
      summaryBn: 'ঢাকা সংলগ্ন গাজীপুর, সাভার ও নারায়ণগঞ্জ এলাকার আবাসিক ও বাণিজ্যিক ভবনে নির্ধারিত শিডিউলে সেবা।',
      placesText: 'Gazipur (Tongi, Joydebpur, Chowrasta), Savar & Ashulia, Narayanganj (Chashara, Fatullah)',
      featuredSlug: 'gazipur'
    },
    publishedData: {
      summaryEn: 'Scheduled mobile team dispatch for residential and commercial buildings in Gazipur, Savar, and Narayanganj.',
      summaryBn: 'ঢাকা সংলগ্ন গাজীপুর, সাভার ও নারায়ণগঞ্জ এলাকার আবাসিক ও বাণিজ্যিক ভবনে নির্ধারিত শিডিউলে সেবা।',
      placesText: 'Gazipur (Tongi, Joydebpur, Chowrasta), Savar & Ashulia, Narayanganj (Chashara, Fatullah)',
      featuredSlug: 'gazipur'
    }
  }
];

function buildDefaultAreaContent(loc: typeof LOCATIONS_DATA[number]): ZoneAreaContent {
  const localNoteBn = loc.waterConditionNoteBn?.trim();
  const localNoteEn = loc.waterConditionNote?.trim();
  const isCorridorCity = ['gazipur', 'savar', 'narayanganj'].includes(loc.slug);

  return {
    title: loc.title || `Water Tank Cleaning Service in ${loc.areaName} | SUNVILOZ CLEAN CARE`,
    titleBn: loc.titleBn || `${loc.areaNameBn} এলাকায় পানির ট্যাংক পরিষ্কার সার্ভিস`,
    metaDesc: loc.metaDesc || `Water tank cleaning and pipeline cleaning service in ${loc.areaName}.`,
    seoTitle: loc.title || `Water Tank Cleaning Service in ${loc.areaName} | SUNVILOZ CLEAN CARE`,
    ogTitle: loc.title || `Water Tank Cleaning Service in ${loc.areaName} | SUNVILOZ CLEAN CARE`,
    ogDescription: loc.metaDesc || `Water tank cleaning and pipeline cleaning service in ${loc.areaName}.`,
    intro: loc.intro || '',
    introBn: loc.introBn || '',
    waterProblemsBn: localNoteBn
      ? `${loc.areaNameBn} (${loc.zone}) এলাকার ভবনগুলোতে সাধারণত দেখা যায়: ${localNoteBn} এর ফলে রিজার্ভারের তলায় কাদা-বালু জমে পানি ঘোলা হওয়া, দুর্গন্ধ ও পাইপে প্রেশার কমে যাওয়ার সমস্যা তৈরি হয়।`
      : `${loc.areaNameBn} এলাকার আবাসিক ও বাণিজ্যিক ভবনের রিজার্ভার ও ওভারহেড ট্যাংকে তলদেশের কাদা-বালু, দেয়ালের শ্যাওলা এবং পাইপলাইনে আয়রন বা পলির আস্তরণ জমে পানি ঘোলা হওয়া ও প্রেশার কমে যাওয়ার সমস্যা দেখা দেয়।`,
    waterProblemsEn: localNoteEn
      ? `Key local storage issues observed in ${loc.areaName} (${loc.zone}): ${localNoteEn} Over time this causes cloudy tap water, biofilm odor, and reduced pipe flow.`
      : `Buildings in ${loc.areaName} commonly experience bottom mud/sand buildup in underground reserves, algal biofilm on rooftop tanks, and iron or silt deposits inside supply pipes.`,
    potentialCausesBn: isCorridorCity
      ? `${loc.areaNameBn} অঞ্চলে গভীর নলকূপ বা সরবরাহ লাইনের আয়রন-বালু, ছাদের ট্যাংকে সরাসরি সূর্যের আলো এবং শুধু ওভারহেড ট্যাংক পরিষ্কার করে নিচের রিজার্ভার বাদ রাখাই প্রধান কারণ। পাশাপাশি ফাটা ম্যানহোল কভার, ত্রুটিপূর্ণ ফুট-ভালভ বা অভ্যন্তরীণ প্লাম্বিং ত্রুটিও পানি দূষিত করতে পারে।`
      : `${loc.areaNameBn} জোনে ওয়াসা বা ডিপ-টিউবওয়েল লাইনের পলি, ছাদের ট্যাংকে সরাসরি রোদ পড়া, রিজার্ভ ও ছাদের ট্যাংক আলাদা সময়ে পরিষ্কার করা এবং ভাঙা ঢাকনা বা প্লাম্বিং লিকেজের মতো পরিষ্কার-বহির্ভূত কারণেও সমস্যা ফিরে আসতে পারে।`,
    potentialCausesEn: isCorridorCity
      ? `In ${loc.areaName}, high groundwater iron/sand, sunlight penetrating rooftop tank covers, and cleaning only one tank while leaving the reserve untouched are common triggers—alongside cracked manhole lids or plumbing valve leaks.`
      : `In ${loc.areaName}, sediment from WASA or borehole lines, direct rooftop sun exposure, uncoordinated cleaning of reserve vs. overhead tanks, and non-cleaning faults like broken covers or leaking valves can all degrade water quality.`,
    waterConditionNote: loc.waterConditionNote || '',
    waterConditionNoteBn: loc.waterConditionNoteBn || '',
    practicalAdviceBn: isCorridorCity
      ? `${loc.areaNameBn} এলাকায় ঢাকা থেকে আমাদের মোবাইল টিম নির্ধারিত শিডিউলে সার্ভিস প্রদান করে। প্রতি ৪–৬ মাস অন্তর রিজার্ভ ও ওভারহেড ট্যাংক একসাথে পরিষ্কার রাখুন, ছাদের ট্যাংকের ঢাকনা সিল রাখুন এবং ইনকামিং লাইনে বেশি পলি থাকলে সেডিমেন্ট ফিল্টার ব্যবহার করুন। পানযোগ্যতা যাচাইয়ে ল্যাব টেস্ট জরুরি।`
      : `${loc.areaNameBn} এলাকায় আমাদের মোবাইল টিম নির্ধারিত শিডিউলে এসে রিজার্ভার ও ওভারহেড ট্যাংক পরিষ্কার করে। প্রতি ৪–৬ মাস পরপর উভয় ট্যাংক একসাথে পরিষ্কার করুন, প্লাম্বিং লিকেজ মেরামত রাখুন এবং পানযোগ্যতা নিশ্চিত করতে অনুমোদিত ল্যাবে পরীক্ষা করান।`,
    practicalAdviceEn: isCorridorCity
      ? `Our Dhaka-dispatched mobile crew serves ${loc.areaName} on scheduled bookings. Clean underground and rooftop tanks together every 4–6 months, keep covers UV-sealed, and verify drinking potability through certified lab testing.`
      : `Our mobile team serves ${loc.areaName} on scheduled appointments. Coordinate underground and overhead cleaning every 4–6 months, fix leaking valves/covers promptly, and rely on certified lab testing for drinking potability.`,
    verifiedFindings: [],
    coverageDetails: loc.coverageDetails || [],
    pricingFactors: loc.pricingFactors || [],
    faqs: loc.faqs || []
  };
}

export const DEFAULT_ZONE_AREAS: ZoneAreaRecord[] = LOCATIONS_DATA.map((loc, idx) => {
  const zoneSlug = AREA_TO_ZONE_SLUG[loc.slug] || 'east-south-dhaka-zone';
  const matchedZone = DEFAULT_SERVICE_ZONES.find(z => z.slug === zoneSlug) || DEFAULT_SERVICE_ZONES[0];
  const content = buildDefaultAreaContent(loc);
  return {
    id: `area-${loc.slug}`,
    zoneId: matchedZone.id,
    zoneSlug,
    slug: loc.slug,
    areaName: loc.areaName,
    areaNameBn: loc.areaNameBn,
    isCoreCity: CORE_CITY_SLUGS.has(loc.slug),
    isVisible: true,
    status: 'published',
    sortOrder: idx + 1,
    version: 1,
    draftData: content,
    publishedData: content
  };
});

function sanitizeAreaContent(content: ZoneAreaContent): ZoneAreaContent {
  return {
    ...content,
    intro: sanitizeRichHtml(content.intro),
    introBn: sanitizeRichHtml(content.introBn),
    waterProblemsBn: sanitizeRichHtml(content.waterProblemsBn),
    waterProblemsEn: sanitizeRichHtml(content.waterProblemsEn),
    potentialCausesBn: sanitizeRichHtml(content.potentialCausesBn),
    potentialCausesEn: sanitizeRichHtml(content.potentialCausesEn),
    waterConditionNote: sanitizeRichHtml(content.waterConditionNote),
    waterConditionNoteBn: sanitizeRichHtml(content.waterConditionNoteBn),
    practicalAdviceBn: sanitizeRichHtml(content.practicalAdviceBn),
    practicalAdviceEn: sanitizeRichHtml(content.practicalAdviceEn),
    title: stripHtmlToPlainText(content.title),
    titleBn: stripHtmlToPlainText(content.titleBn),
    metaDesc: stripHtmlToPlainText(content.metaDesc),
    seoTitle: content.seoTitle ? stripHtmlToPlainText(content.seoTitle) : undefined,
    ogTitle: content.ogTitle ? stripHtmlToPlainText(content.ogTitle) : undefined,
    ogDescription: content.ogDescription ? stripHtmlToPlainText(content.ogDescription) : undefined,
    ogImageAlt: content.ogImageAlt ? stripHtmlToPlainText(content.ogImageAlt) : undefined,
    heroImageAlt: content.heroImageAlt ? stripHtmlToPlainText(content.heroImageAlt) : undefined
  };
}

function mapZoneRow(row: any): ServiceZoneRecord {
  const fallback = DEFAULT_SERVICE_ZONES.find(z => z.slug === row.slug) || DEFAULT_SERVICE_ZONES[0];
  const pub: ServiceZoneContent = {
    summaryEn: row.published_data?.summaryEn ?? row.summary_en ?? fallback.summaryEn,
    summaryBn: row.published_data?.summaryBn ?? row.summary_bn ?? fallback.summaryBn,
    placesText: row.published_data?.placesText ?? row.places_text ?? fallback.placesText,
    featuredSlug: row.published_data?.featuredSlug ?? row.featured_slug ?? fallback.featuredSlug,
    highlightsBn: row.published_data?.highlightsBn || [],
    highlightsEn: row.published_data?.highlightsEn || [],
    seoTitle: row.published_data?.seoTitle || '',
    metaDesc: row.published_data?.metaDesc || ''
  };
  const draft: ServiceZoneContent = {
    summaryEn: row.draft_data?.summaryEn ?? row.summary_en ?? pub.summaryEn,
    summaryBn: row.draft_data?.summaryBn ?? row.summary_bn ?? pub.summaryBn,
    placesText: row.draft_data?.placesText ?? row.places_text ?? pub.placesText,
    featuredSlug: row.draft_data?.featuredSlug ?? row.featured_slug ?? pub.featuredSlug,
    highlightsBn: row.draft_data?.highlightsBn || pub.highlightsBn || [],
    highlightsEn: row.draft_data?.highlightsEn || pub.highlightsEn || [],
    seoTitle: row.draft_data?.seoTitle || pub.seoTitle || '',
    metaDesc: row.draft_data?.metaDesc || pub.metaDesc || ''
  };

  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.name_en,
    nameBn: row.name_bn,
    summaryEn: pub.summaryEn,
    summaryBn: pub.summaryBn,
    featuredSlug: pub.featuredSlug,
    placesText: pub.placesText,
    sortOrder: Number(row.sort_order ?? 1),
    isVisible: row.is_visible !== false,
    status: row.status === 'draft' ? 'draft' : 'published',
    version: Number(row.version ?? 1),
    publishedAt: row.published_at || undefined,
    updatedAt: row.updated_at || undefined,
    draftData: draft,
    publishedData: pub
  };
}

function mapAreaRow(row: any, zones: ServiceZoneRecord[]): ZoneAreaRecord {
  const fallback = DEFAULT_ZONE_AREAS.find(a => a.slug === row.slug);
  const matchedZone = zones.find(z => z.id === row.zone_id) || zones.find(z => z.slug === (fallback?.zoneSlug || '')) || zones[0];
  const baseContent = fallback?.publishedData || buildDefaultAreaContent({
    slug: row.slug,
    areaName: row.area_name,
    areaNameBn: row.area_name_bn,
    zone: matchedZone?.nameEn || 'Dhaka',
    title: `Water Tank Cleaning Service in ${row.area_name} | Sunviloz Clean Care`,
    titleBn: `${row.area_name_bn} এলাকায় পানির ট্যাংক পরিষ্কার সার্ভিস`,
    metaDesc: `Water tank and pipeline cleaning service in ${row.area_name}.`,
    intro: '',
    introBn: '',
    waterConditionNote: '',
    waterConditionNoteBn: '',
    coverageDetails: [],
    pricingFactors: [],
    faqs: []
  });

  const pub: ZoneAreaContent = { ...baseContent, ...(row.published_data || {}) };
  const draft: ZoneAreaContent = { ...pub, ...(row.draft_data || {}) };

  return {
    id: row.id,
    zoneId: row.zone_id || matchedZone?.id || '',
    zoneSlug: matchedZone?.slug || fallback?.zoneSlug || 'east-south-dhaka-zone',
    slug: row.slug,
    areaName: row.area_name,
    areaNameBn: row.area_name_bn,
    isCoreCity: Boolean(row.is_core_city || CORE_CITY_SLUGS.has(row.slug)),
    isVisible: row.is_visible !== false,
    status: row.status === 'draft' ? 'draft' : 'published',
    sortOrder: Number(row.sort_order ?? 1),
    version: Number(row.version ?? 1),
    publishedAt: row.published_at || undefined,
    updatedAt: row.updated_at || undefined,
    draftData: draft,
    publishedData: pub
  };
}

function readCachedBundle(): { zones: ServiceZoneRecord[]; areas: ZoneAreaRecord[] } | null {
  try {
    const raw = safeGetItem(ZONES_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.zones) && Array.isArray(parsed?.areas)) {
      return { zones: parsed.zones, areas: parsed.areas };
    }
    return null;
  } catch {
    return null;
  }
}

function writeCachedBundle(zones: ServiceZoneRecord[], areas: ZoneAreaRecord[]) {
  try {
    safeSetItem(ZONES_CACHE_KEY, JSON.stringify({ zones, areas, cachedAt: new Date().toISOString() }));
  } catch {
    // Ignore cache write errors
  }
}

async function syncZonesBackupToStorage(zones: ServiceZoneRecord[], areas: ZoneAreaRecord[]) {
  if (!isSupabaseConfigured()) return;
  try {
    const payload = JSON.stringify({ zones, areas, updatedAt: new Date().toISOString() });
    const blob = new Blob([payload], { type: 'application/json' });
    await supabase.storage.from('media').upload(STORAGE_ZONES_PATH, blob, { upsert: true, cacheControl: '60' });
  } catch {
    // Non-blocking cloud backup
  }
}

async function verifyZoneOrAreaPublicState(
  table: 'service_zones' | 'zone_areas',
  slug: string,
  publicPath: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('slug, status, is_visible')
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('is_visible', true)
      .maybeSingle();

    if (error || !data) return false;

    if (typeof window !== 'undefined') {
      try {
        const resp = await fetch(publicPath, { method: 'GET', cache: 'no-store' });
        return resp.status === 200;
      } catch {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function fetchZonesAndAreas(options: { includeDrafts?: boolean } = {}): Promise<{
  zones: ServiceZoneRecord[];
  areas: ZoneAreaRecord[];
  fromDatabase: boolean;
  error?: string;
}> {
  const { includeDrafts = false } = options;

  if (!isSupabaseConfigured()) {
    return {
      zones: DEFAULT_SERVICE_ZONES,
      areas: DEFAULT_ZONE_AREAS,
      fromDatabase: false
    };
  }

  try {
    let zQuery = supabase.from('service_zones').select('*').order('sort_order', { ascending: true });
    let aQuery = supabase.from('zone_areas').select('*').order('sort_order', { ascending: true });

    if (!includeDrafts) {
      zQuery = zQuery.eq('is_visible', true).eq('status', 'published');
      aQuery = aQuery.eq('is_visible', true).eq('status', 'published');
    }

    const [zRes, aRes] = await Promise.all([zQuery, aQuery]);
    if (!zRes.error && !aRes.error) {
      const zones = Array.isArray(zRes.data) ? zRes.data.map(mapZoneRow) : [];
      const areas = Array.isArray(aRes.data) ? aRes.data.map(r => mapAreaRow(r, zones)) : [];

      if (!includeDrafts) {
        writeCachedBundle(zones, areas);
      }
      return { zones, areas, fromDatabase: true };
    }

    const errMessage = zRes.error?.message || aRes.error?.message || 'Database query error';
    const cached = readCachedBundle();
    if (cached) {
      return {
        zones: includeDrafts ? cached.zones : cached.zones.filter(z => z.isVisible && z.status === 'published'),
        areas: includeDrafts ? cached.areas : cached.areas.filter(a => a.isVisible && a.status === 'published'),
        fromDatabase: false,
        error: errMessage
      };
    }

    return { zones: [], areas: [], fromDatabase: false, error: errMessage };
  } catch (err: any) {
    const cached = readCachedBundle();
    if (cached) {
      return {
        zones: includeDrafts ? cached.zones : cached.zones.filter(z => z.isVisible && z.status === 'published'),
        areas: includeDrafts ? cached.areas : cached.areas.filter(a => a.isVisible && a.status === 'published'),
        fromDatabase: false,
        error: err?.message || 'Network error'
      };
    }
    return { zones: [], areas: [], fromDatabase: false, error: err?.message || 'Network error' };
  }
}

export async function findAreaBySlug(
  rawSlug: string,
  options: { includeDraft?: boolean } = {}
): Promise<{ area: ZoneAreaRecord; zone?: ServiceZoneRecord } | null> {
  if (!rawSlug) return null;
  const normalized = rawSlug.toLowerCase().trim().replace(/^water-tank-cleaning-/, '').replace(/-dhaka$/, '');
  const { zones, areas } = await fetchZonesAndAreas({ includeDrafts: Boolean(options.includeDraft) });

  const matched = areas.find(a =>
    a.slug === rawSlug ||
    a.slug === normalized ||
    a.areaName.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized.replace(/[^a-z0-9]/g, '') ||
    `water-tank-cleaning-${a.slug}` === rawSlug
  );

  if (!matched) return null;
  const zone = zones.find(z => z.id === matched.zoneId || z.slug === matched.zoneSlug);
  return { area: matched, zone };
}

export async function saveZoneDraft(zone: ServiceZoneRecord): Promise<{ success: boolean; error?: string; zone?: ServiceZoneRecord }> {
  const sanitizedDraft: ServiceZoneContent = {
    summaryEn: stripHtmlToPlainText(zone.draftData.summaryEn),
    summaryBn: stripHtmlToPlainText(zone.draftData.summaryBn),
    placesText: stripHtmlToPlainText(zone.draftData.placesText),
    featuredSlug: zone.draftData.featuredSlug.trim() || 'dhaka',
    highlightsBn: (zone.draftData.highlightsBn || []).map(stripHtmlToPlainText).filter(Boolean),
    highlightsEn: (zone.draftData.highlightsEn || []).map(stripHtmlToPlainText).filter(Boolean),
    seoTitle: zone.draftData.seoTitle ? stripHtmlToPlainText(zone.draftData.seoTitle) : '',
    metaDesc: zone.draftData.metaDesc ? stripHtmlToPlainText(zone.draftData.metaDesc) : ''
  };

  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase সংযুক্ত নয়।' };
  }

  try {
    const payload: any = {
      slug: zone.slug.trim(),
      name_en: stripHtmlToPlainText(zone.nameEn),
      name_bn: stripHtmlToPlainText(zone.nameBn),
      summary_en: sanitizedDraft.summaryEn,
      summary_bn: sanitizedDraft.summaryBn,
      featured_slug: sanitizedDraft.featuredSlug,
      places_text: sanitizedDraft.placesText,
      sort_order: zone.sortOrder,
      is_visible: zone.isVisible,
      draft_data: sanitizedDraft,
      updated_at: new Date().toISOString()
    };

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(zone.id);
    const { data, error } = isUuid
      ? await supabase.from('service_zones').update(payload).eq('id', zone.id).select('*').single()
      : await supabase.from('service_zones').upsert(payload, { onConflict: 'slug' }).select('*').single();

    if (error || !data) {
      return { success: false, error: error?.message || 'ড্রাফট সেভ ব্যর্থ হয়েছে।' };
    }

    const updated = mapZoneRow(data);
    return { success: true, zone: updated };
  } catch (err: any) {
    return { success: false, error: err?.message || 'ড্রাফট সেভ ব্যর্থ হয়েছে।' };
  }
}

export async function publishZone(zone: ServiceZoneRecord): Promise<{
  success: boolean;
  publicVerified?: boolean;
  error?: string;
  indexNowNote?: string;
}> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase সংযুক্ত নয়।' };

  try {
    const { data: userRes } = await supabase.auth.getUser();
    const adminEmail = userRes?.user?.email || 'admin';
    const nextVersion = (zone.version || 1) + 1;
    const publishedData = { ...zone.draftData };

    await supabase.from('content_revisions').insert([
      {
        entity_type: 'service_zone',
        entity_id: zone.slug,
        version: zone.version || 1,
        snapshot: { zone, publishedData: zone.publishedData },
        created_by: adminEmail
      }
    ]);

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(zone.id);
    const payload = {
      name_en: stripHtmlToPlainText(zone.nameEn),
      name_bn: stripHtmlToPlainText(zone.nameBn),
      summary_en: publishedData.summaryEn,
      summary_bn: publishedData.summaryBn,
      featured_slug: publishedData.featuredSlug,
      places_text: publishedData.placesText,
      is_visible: zone.isVisible,
      status: 'published',
      draft_data: publishedData,
      published_data: publishedData,
      version: nextVersion,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = isUuid
      ? await supabase.from('service_zones').update(payload).eq('id', zone.id)
      : await supabase.from('service_zones').upsert({ slug: zone.slug, ...payload }, { onConflict: 'slug' });

    if (error) return { success: false, error: error.message };

    const bundle = await fetchZonesAndAreas({ includeDrafts: false });
    if (bundle.fromDatabase) {
      writeCachedBundle(bundle.zones, bundle.areas);
      await syncZonesBackupToStorage(bundle.zones, bundle.areas);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ZONES_CHANGED_EVENT));
    }

    if (!zone.isVisible) {
      return {
        success: true,
        publicVerified: false,
        indexNowNote: 'জোনটি ডাটাবেজে সেভ হয়েছে কিন্তু Hidden অবস্থায় থাকায় পাবলিক সাইটে প্রদর্শিত হচ্ছে না।'
      };
    }

    const publicVerified = await verifyZoneOrAreaPublicState('service_zones', zone.slug, '/service-areas');

    const { enqueueIndexNowUrls } = await import('./indexnowService');
    const idxRes = await enqueueIndexNowUrls(
      [`${SITE_DOMAIN}/`, `${SITE_DOMAIN}/service-areas`, `${SITE_DOMAIN}/service-areas/${publishedData.featuredSlug}`],
      {
        action: 'publish_service_zone',
        entityType: 'service_zone',
        entitySlug: zone.slug,
        verifyPublic: true
      }
    );

    return {
      success: true,
      publicVerified,
      indexNowNote: idxRes.message
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'পাবলিশ ব্যর্থ হয়েছে।' };
  }
}

export async function saveAreaDraft(area: ZoneAreaRecord, oldSlug?: string): Promise<{ success: boolean; error?: string; area?: ZoneAreaRecord }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase সংযুক্ত নয়।' };

  const cleanSlug = area.slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
  if (!cleanSlug) return { success: false, error: 'সঠিক URL slug দিন।' };

  const sanitizedDraft = sanitizeAreaContent(area.draftData);

  try {
    const zonesRes = await fetchZonesAndAreas({ includeDrafts: true });
    const targetZone = zonesRes.zones.find(z => z.id === area.zoneId || z.slug === area.zoneSlug);
    const dbZoneId = targetZone && /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(targetZone.id) ? targetZone.id : null;

    const payload: any = {
      zone_id: dbZoneId,
      slug: cleanSlug,
      area_name: stripHtmlToPlainText(area.areaName),
      area_name_bn: stripHtmlToPlainText(area.areaNameBn),
      is_core_city: area.isCoreCity,
      is_visible: area.isVisible,
      sort_order: area.sortOrder,
      draft_data: sanitizedDraft,
      updated_at: new Date().toISOString()
    };

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(area.id);
    const { data, error } = isUuid
      ? await supabase.from('zone_areas').update(payload).eq('id', area.id).select('*').single()
      : await supabase.from('zone_areas').upsert({ ...payload, status: area.status, published_data: area.publishedData }, { onConflict: 'slug' }).select('*').single();

    if (error || !data) {
      return { success: false, error: error?.message || 'এরিয়া ড্রাফট সেভ করা যায়নি।' };
    }

    if (oldSlug && oldSlug !== cleanSlug) {
      await createSlugRedirect(`/service-areas/${oldSlug}`, `/service-areas/${cleanSlug}`, 301);
    }

    const updated = mapAreaRow(data, zonesRes.zones);
    return { success: true, area: updated };
  } catch (err: any) {
    return { success: false, error: err?.message || 'এরিয়া ড্রাফট সেভ ব্যর্থ হয়েছে।' };
  }
}

export async function publishArea(area: ZoneAreaRecord): Promise<{
  success: boolean;
  publicVerified?: boolean;
  error?: string;
  indexNowNote?: string;
}> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase সংযুক্ত নয়।' };

  try {
    const { data: userRes } = await supabase.auth.getUser();
    const adminEmail = userRes?.user?.email || 'admin';
    const nextVersion = (area.version || 1) + 1;
    const sanitizedPublished = sanitizeAreaContent(area.draftData);

    await supabase.from('content_revisions').insert([
      {
        entity_type: 'zone_area',
        entity_id: area.slug,
        version: area.version || 1,
        snapshot: { area, publishedData: area.publishedData },
        created_by: adminEmail
      }
    ]);

    const zonesRes = await fetchZonesAndAreas({ includeDrafts: true });
    const targetZone = zonesRes.zones.find(z => z.id === area.zoneId || z.slug === area.zoneSlug);
    const dbZoneId = targetZone && /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(targetZone.id) ? targetZone.id : null;
    const cleanSlug = area.slug.toLowerCase().trim();

    const payload: any = {
      zone_id: dbZoneId,
      slug: cleanSlug,
      area_name: stripHtmlToPlainText(area.areaName),
      area_name_bn: stripHtmlToPlainText(area.areaNameBn),
      is_core_city: area.isCoreCity,
      is_visible: area.isVisible,
      status: 'published',
      sort_order: area.sortOrder,
      draft_data: sanitizedPublished,
      published_data: sanitizedPublished,
      version: nextVersion,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(area.id);
    const { error } = isUuid
      ? await supabase.from('zone_areas').update(payload).eq('id', area.id)
      : await supabase.from('zone_areas').upsert(payload, { onConflict: 'slug' });

    if (error) return { success: false, error: error.message };

    const bundle = await fetchZonesAndAreas({ includeDrafts: false });
    if (bundle.fromDatabase) {
      writeCachedBundle(bundle.zones, bundle.areas);
      await syncZonesBackupToStorage(bundle.zones, bundle.areas);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ZONES_CHANGED_EVENT));
    }

    if (!area.isVisible) {
      return {
        success: true,
        publicVerified: false,
        indexNowNote: 'এরিয়া প্রকাশিত অবস্থায় সেভ হয়েছে কিন্তু Hidden থাকায় পাবলিক সাইটে দৃশ্যমান নয়।'
      };
    }

    const publicVerified = await verifyZoneOrAreaPublicState(
      'zone_areas',
      cleanSlug,
      `/service-areas/${cleanSlug}`
    );

    const { enqueueIndexNowUrls } = await import('./indexnowService');
    const idxRes = await enqueueIndexNowUrls(
      [`${SITE_DOMAIN}/service-areas/${cleanSlug}`, `${SITE_DOMAIN}/service-areas`],
      {
        action: 'publish_zone_area',
        entityType: 'zone_area',
        entitySlug: cleanSlug,
        verifyPublic: true
      }
    );

    return {
      success: true,
      publicVerified,
      indexNowNote: idxRes.message
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'এরিয়া পাবলিশ ব্যর্থ হয়েছে।' };
  }
}

export async function toggleAreaVisibility(area: ZoneAreaRecord, isVisible: boolean): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(area.id);
    if (isUuid) {
      const { error } = await supabase
        .from('zone_areas')
        .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
        .eq('id', area.id);
      if (error) return false;
    } else {
      const saveRes = await saveAreaDraft({ ...area, isVisible });
      if (!saveRes.success) return false;
    }

    const bundle = await fetchZonesAndAreas({ includeDrafts: false });
    if (bundle.fromDatabase) {
      writeCachedBundle(bundle.zones, bundle.areas);
      await syncZonesBackupToStorage(bundle.zones, bundle.areas);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ZONES_CHANGED_EVENT));
    }

    if (area.status === 'published') {
      import('./indexnowService')
        .then(({ enqueueIndexNowUrls }) =>
          enqueueIndexNowUrls([`${SITE_DOMAIN}/service-areas`, `${SITE_DOMAIN}/service-areas/${area.slug}`], {
            action: isVisible ? 'show_zone_area' : 'hide_zone_area',
            entityType: 'zone_area',
            entitySlug: area.slug,
            verifyPublic: isVisible
          })
        )
        .catch(() => {});
    }

    return true;
  } catch {
    return false;
  }
}

export async function deleteZoneArea(area: ZoneAreaRecord): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(area.id);
    if (isUuid) {
      const { error } = await supabase.from('zone_areas').delete().eq('id', area.id);
      if (error) return false;
    } else {
      const { error } = await supabase.from('zone_areas').delete().eq('slug', area.slug);
      if (error) return false;
    }
    const bundle = await fetchZonesAndAreas({ includeDrafts: false });
    if (bundle.fromDatabase) {
      writeCachedBundle(bundle.zones, bundle.areas);
      await syncZonesBackupToStorage(bundle.zones, bundle.areas);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ZONES_CHANGED_EVENT));
    }
    import('./indexnowService')
      .then(({ enqueueIndexNowUrls }) =>
        enqueueIndexNowUrls([`${SITE_DOMAIN}/service-areas`, `${SITE_DOMAIN}/service-areas/${area.slug}`], {
          action: 'delete_zone_area',
          entityType: 'zone_area',
          entitySlug: area.slug,
          verifyPublic: false
        })
      )
      .catch(() => {});
    return true;
  } catch {
    return false;
  }
}

export async function reorderZones(zones: ServiceZoneRecord[]): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    for (let i = 0; i < zones.length; i++) {
      const z = zones[i];
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(z.id);
      if (isUuid) {
        await supabase.from('service_zones').update({ sort_order: i + 1 }).eq('id', z.id);
      }
    }
    const bundle = await fetchZonesAndAreas({ includeDrafts: false });
    writeCachedBundle(bundle.zones, bundle.areas);
    await syncZonesBackupToStorage(bundle.zones, bundle.areas);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ZONES_CHANGED_EVENT));
    }
    return true;
  } catch {
    return false;
  }
}

export async function listContentRevisions(
  entityType: 'service_zone' | 'zone_area' | 'site_config',
  entityId: string
): Promise<ContentRevisionRecord[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('content_revisions')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      entityType: r.entity_type,
      entityId: r.entity_id,
      version: r.version,
      snapshot: r.snapshot,
      createdBy: r.created_by,
      createdAt: r.created_at
    }));
  } catch {
    return [];
  }
}

export async function fetchUrlRedirects(): Promise<UrlRedirectRecord[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('url_redirects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      fromPath: r.from_path,
      toPath: r.to_path,
      statusCode: r.status_code === 302 ? 302 : 301,
      isActive: r.is_active !== false,
      createdAt: r.created_at
    }));
  } catch {
    return [];
  }
}

export async function createSlugRedirect(
  fromPath: string,
  toPath: string,
  statusCode: 301 | 302 = 301
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase সংযুক্ত নয়।' };
  const cleanFrom = '/' + fromPath.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  const cleanTo = '/' + toPath.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  if (cleanFrom === cleanTo || cleanFrom === '/') {
    return { success: false, error: 'উৎস এবং গন্তব্য পাথ একই বা রুট হতে পারবে না।' };
  }
  try {
    const { error } = await supabase.from('url_redirects').upsert(
      { from_path: cleanFrom, to_path: cleanTo, status_code: statusCode, is_active: true },
      { onConflict: 'from_path' }
    );
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'রিডাইরেক্ট যোগ করা যায়নি।' };
  }
}

export async function deleteUrlRedirect(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('url_redirects').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}
