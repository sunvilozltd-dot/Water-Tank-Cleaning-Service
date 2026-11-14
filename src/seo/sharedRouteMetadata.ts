import { SeoConfig, PageSeoOverride } from '../types/siteConfig';
import {
  DEFAULT_HOME_SEO_DESCRIPTION,
  DEFAULT_HOME_SEO_TITLE,
  HOTLINE_DISPLAY,
  formatSeoTitle,
  normalizePathname
} from './seoResolver';

export interface RouteMetadataDefault {
  title: string;
  description: string;
  h1: string;
  summary: string;
  breadcrumbs: { name: string; path: string }[];
  ogType?: 'website' | 'article' | 'service';
  serviceType?: string;
  priority: number;
  changefreq: 'daily' | 'weekly' | 'monthly';
}

export function buildCoreRouteDefaults(phoneDisplay: string = HOTLINE_DISPLAY): Record<string, RouteMetadataDefault> {
  return {
    '/': {
      title: DEFAULT_HOME_SEO_TITLE,
      description: DEFAULT_HOME_SEO_DESCRIPTION,
      h1: 'ঢাকায় প্রফেশনাল ওয়াটার ট্যাংক ও পাইপলাইন পরিষ্কার সার্ভিস — Water Tank Cleaning Service in Dhaka',
      summary:
        'ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভার জুড়ে আবাসিক ভবন, অ্যাপার্টমেন্ট ও বাণিজ্যিক স্থাপনায় ছাদের ওভারহেড ট্যাংক, আন্ডারগ্রাউন্ড রিজার্ভার ও পানির পাইপলাইন আধুনিক মেকানাইজড রোটারি ওয়াটার জেট এবং ফুড-গ্রেড স্যানিটাইজারে পরিষ্কার সেবা।',
      breadcrumbs: [{ name: 'Home', path: '/' }],
      ogType: 'website',
      priority: 1.0,
      changefreq: 'daily'
    },
    '/services/water-tank-cleaning': {
      title: 'Water Tank Cleaning Service in Dhaka | Overhead & Underground Tank Wash | SUNVILOZ CLEAN CARE',
      description: `পানির ট্যাংক পরিষ্কার সার্ভিস ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভারে। ওভারহেড PVC/RCC এবং আন্ডারগ্রাউন্ড রিজার্ভ ট্যাংক মেকানাইজড জেট ওয়াশ ও স্যানিটাইজিং। কল: ${phoneDisplay}।`,
      h1: 'পানির ট্যাংক পরিষ্কার সার্ভিস (Water Tank Cleaning Service in Dhaka)',
      summary:
        'বাসাবাড়ি, অ্যাপার্টমেন্ট ও বাণিজ্যিক ভবনের ওভারহেড ও আন্ডারগ্রাউন্ড পানির রিজার্ভ ট্যাংকের কাদা, বালু, শ্যাওলা ও জীবাণু মেকানাইজড রোটারি জেট ও ফুড-গ্রেড স্যানিটাইজারের মাধ্যমে পরিষ্কার সেবা।',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
        { name: 'Water Tank Cleaning', path: '/services/water-tank-cleaning' }
      ],
      ogType: 'service',
      serviceType: 'Water Tank Cleaning Service',
      priority: 0.95,
      changefreq: 'weekly'
    },
    '/services/pipeline-cleaning': {
      title: 'Water Pipeline Cleaning Service in Dhaka | পানির পাইপলাইন পরিষ্কার | SUNVILOZ CLEAN CARE',
      description: `দেয়াল বা টাইলস না ভেঙে পানির পাইপলাইন পরিষ্কার ও হাইড্রো-পালস ফ্লাশিং সার্ভিস ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভারে। আয়রন ও মরিচা দূর করতে কল করুন: ${phoneDisplay}।`,
      h1: 'পানির পাইপলাইন পরিষ্কার ও ফ্লাশিং সার্ভিস (Water Pipeline Cleaning Service in Dhaka)',
      summary:
        'বাড়ির ভেতরের পানির লাইনে জমে থাকা আয়রন, মরিচা ও বায়ো-স্লাজ দেয়াল বা টাইলস না ভেঙে হাইড্রো-পালস প্রেসারাইজড ফ্লাশিংয়ের মাধ্যমে পরিষ্কার।',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
        { name: 'Pipeline Cleaning', path: '/services/pipeline-cleaning' }
      ],
      ogType: 'service',
      serviceType: 'Water Pipeline Cleaning Service',
      priority: 0.9,
      changefreq: 'weekly'
    },
    '/services/overhead-tank-cleaning': {
      title: 'Overhead Water Tank Cleaning Service in Dhaka | ছাদের পানির ট্যাংক পরিষ্কার | SUNVILOZ CLEAN CARE',
      description: `ছাদের PVC ও RCC ওভারহেড পানির ট্যাংক পরিষ্কার সার্ভিস ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভারে। শ্যাওলা, বালু ও দুর্গন্ধ দূর করতে WhatsApp বা কল: ${phoneDisplay}।`,
      h1: 'ওভারহেড ও ছাদের পানির ট্যাংক পরিষ্কার সার্ভিস (Overhead Water Tank Cleaning Service)',
      summary:
        'ছাদের পিভিসি ও আরসিসি ট্যাংকের রোদজনিত সবুজ শ্যাওলা, তলদেশের পলি ও দুর্গন্ধ হাই-প্রেসার রোটারি ওয়াটার জেটে পরিষ্কার।',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
        { name: 'Overhead Tank Cleaning', path: '/services/overhead-tank-cleaning' }
      ],
      ogType: 'service',
      serviceType: 'Overhead Water Tank Cleaning Service',
      priority: 0.9,
      changefreq: 'weekly'
    },
    '/services/underground-water-tank-cleaning': {
      title: 'Underground & Reserve Water Tank Cleaning Service in Dhaka | SUNVILOZ CLEAN CARE',
      description: `আন্ডারগ্রাউন্ড রিজার্ভ পানির ট্যাংক পরিষ্কার সার্ভিস ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভারে। হেভি স্লাজ পাম্প ও রোটারি জেট ওয়াশ। কল: ${phoneDisplay}।`,
      h1: 'আন্ডারগ্রাউন্ড ও রিজার্ভ পানির ট্যাংক পরিষ্কার সার্ভিস (Underground & Reserve Tank Cleaning Service)',
      summary:
        'ভূগর্ভস্থ আরসিসি রিজার্ভার ও রিজার্ভ ট্যাংকের তলদেশের ভারী কাদা, পলি ও দুর্গন্ধ ভ্যাকুমিং, রোটারি প্রেশার ওয়াশ ও ফুড-গ্রেড স্যানিটাইজেশন।',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
        { name: 'Underground Tank Cleaning', path: '/services/underground-water-tank-cleaning' }
      ],
      ogType: 'service',
      serviceType: 'Underground Water Tank Cleaning Service',
      priority: 0.9,
      changefreq: 'weekly'
    },
    '/services': {
      title: 'Water Tank & Pipeline Cleaning Services | SUNVILOZ CLEAN CARE',
      description: `ওভারহেড ট্যাংক, আন্ডারগ্রাউন্ড রিজার্ভার ও পানির পাইপলাইন পরিষ্কারের সম্পূর্ণ সার্ভিস তালিকা — ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভার। ${phoneDisplay}।`,
      h1: 'সানভিলোজ ক্লিন কেয়ারের পানির ট্যাংক ও পাইপলাইন পরিষ্কার সেবাসমূহ',
      summary:
        'আবাসিক অ্যাপার্টমেন্ট, বাড়ি, অফিস ও প্রতিষ্ঠানের জন্য নিরাপদ পানির ট্যাংক ও পাইপলাইন রক্ষণাবেক্ষণ ও পরিষ্কার সেবা।',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' }
      ],
      ogType: 'website',
      priority: 0.9,
      changefreq: 'weekly'
    },
    '/service-areas': {
      title: 'Service Areas — Dhaka, Narayanganj, Gazipur & Savar | SUNVILOZ CLEAN CARE',
      description: `ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভারের সকল আবাসিক ও বাণিজ্যিক এলাকায় পানির ট্যাংক ও পাইপলাইন পরিষ্কার সার্ভিস। কল: ${phoneDisplay}।`,
      h1: 'আমাদের সার্ভিস এরিয়া — ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভার',
      summary:
        'ঢাকা শহরের প্রধান আবাসিক জোন ছাড়াও নারায়ণগঞ্জ, গাজীপুর ও সাভারে আমাদের মোবাইল টিম নির্ধারিত শিডিউলে ওয়াটার ট্যাংক ও পাইপলাইন পরিষ্কার সেবা দিচ্ছে।',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Service Areas', path: '/service-areas' }
      ],
      ogType: 'website',
      priority: 0.9,
      changefreq: 'weekly'
    },
    '/get-quote': {
      title: 'Water Tank Cleaning Cost & Free Quotation | SUNVILOZ CLEAN CARE',
      description: `আপনার ওভারহেড বা আন্ডারগ্রাউন্ড পানির ট্যাংক ও পাইপলাইন পরিষ্কারের আনুমানিক খরচ জানুন ও দ্রুত কোটেশন নিন। WhatsApp বা কল: ${phoneDisplay}।`,
      h1: 'পানির ট্যাংক ও পাইপলাইন পরিষ্কারের ফ্রি কোটেশন',
      summary:
        'ট্যাংকের ধরন, ধারণক্ষমতা ও এলাকা নির্বাচন করে স্বচ্ছ খরচের ধারণা নিন এবং দ্রুত বুকিং অনুরোধ পাঠান।',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Get Quote', path: '/get-quote' }
      ],
      ogType: 'website',
      priority: 0.9,
      changefreq: 'weekly'
    },
    '/faq': {
      title: 'পানির ট্যাংক ও পাইপলাইনের সমস্যা এবং সমাধান (FAQ & Q&A) | SUNVILOZ CLEAN CARE',
      description:
        'পানির ট্যাংকে ময়লা, দুর্গন্ধ, সবুজ শ্যাওলা, পোকা ও পাইপলাইনে আয়রন বা কম প্রেশারের বাস্তব কারণ এবং সমাধান সম্পর্কে সরাসরি প্রশ্নোত্তর।',
      h1: 'পানির ট্যাংক ও পাইপলাইনের সাধারণ সমস্যা এবং সমাধান (FAQ & AI Overview Q&A)',
      summary:
        'বাসাবাড়ির রিজার্ভার, ছাদের ট্যাংক ও পাইপলাইনের বাস্তব সমস্যা, পরিষ্কার-বহির্ভূত কারণ ও ব্যবহারিক করণীয়।',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'FAQ', path: '/faq' }
      ],
      ogType: 'website',
      priority: 0.8,
      changefreq: 'weekly'
    },
    '/portfolio': {
      title: 'Before & After Tank Cleaning Portfolio | SUNVILOZ CLEAN CARE',
      description:
        'ঢাকা ও আশপাশের এলাকায় সম্পন্ন ওভারহেড ও আন্ডারগ্রাউন্ড পানির ট্যাংক পরিষ্কার কাজের বাস্তব আগে ও পরের নমুনা দেখুন।',
      h1: 'সম্পন্ন পানির ট্যাংক পরিষ্কার কাজের নমুনা (Portfolio)',
      summary: 'আবাসিক ও বাণিজ্যিক ভবনের ট্যাংক থেকে কাদা, শ্যাওলা ও পলি অপসারণের বাস্তব উদাহরণ।',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Portfolio', path: '/portfolio' }
      ],
      ogType: 'website',
      priority: 0.75,
      changefreq: 'weekly'
    },
    '/about': {
      title: 'About Us | SUNVILOZ CLEAN CARE — Water Tank & Pipeline Cleaning Service',
      description:
        '২০২০ সাল থেকে ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভারে মেকানাইজড ওয়াটার ট্যাংক ও পাইপলাইন পরিষ্কার সেবা প্রদানকারী প্রতিষ্ঠান SUNVILOZ CLEAN CARE।',
      h1: 'আমাদের সম্পর্কে — SUNVILOZ CLEAN CARE',
      summary: 'আবাসিক ও বাণিজ্যিক ভবনের পানি সংরক্ষণ ব্যবস্থা পরিষ্কার ও রক্ষণাবেক্ষণে স্বচ্ছ কোটেশন ও দায়িত্বশীল সেবা।',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'About Us', path: '/about' }
      ],
      ogType: 'website',
      priority: 0.8,
      changefreq: 'monthly'
    },
    '/contact': {
      title: `Contact Us | SUNVILOZ CLEAN CARE — Hotline ${phoneDisplay}`,
      description: `পানির ট্যাংক ও পাইপলাইন পরিষ্কার সার্ভিসের কোটেশন ও বুকিংয়ের জন্য যোগাযোগ করুন। সরাসরি কল বা WhatsApp: ${phoneDisplay}।`,
      h1: 'আমাদের সাথে যোগাযোগ করুন (Contact & WhatsApp Quote)',
      summary: 'ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভারের যেকোনো এলাকায় সার্ভিসের জন্য WhatsApp-এ কোটেশন নিন অথবা সরাসরি কল করুন।',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Contact', path: '/contact' }
      ],
      ogType: 'website',
      priority: 0.8,
      changefreq: 'monthly'
    },
    '/blog': {
      title: 'পানির ট্যাংক পরিষ্কার ও রক্ষণাবেক্ষণ গাইড | Blog | SUNVILOZ CLEAN CARE',
      description:
        'পানির ট্যাংক ও পাইপলাইন পরিষ্কার রাখার নিয়ম, পানির পলি ও আয়রন সমস্যা এবং মৌসুমভিত্তিক সতর্কতা নিয়ে পরামর্শ।',
      h1: 'পানির ট্যাংক ও পাইপলাইন পরিষ্কারের ব্যবহারিক গাইড ও প্রবন্ধ',
      summary: 'ট্যাংক পরিষ্কার ও পানি সংরক্ষণ স্বাস্থ্যবিধি নিয়ে বাস্তবমুখী তথ্য ও পরামর্শ।',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' }
      ],
      ogType: 'website',
      priority: 0.8,
      changefreq: 'weekly'
    },
    '/privacy-policy': {
      title: 'Privacy Policy | SUNVILOZ CLEAN CARE',
      description: 'Privacy Policy and data handling disclosure for SUNVILOZ CLEAN CARE website visitors and service inquiries.',
      h1: 'Privacy Policy — SUNVILOZ CLEAN CARE',
      summary: 'How SUNVILOZ CLEAN CARE collects and protects inquiry contact details and consent preferences.',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Privacy Policy', path: '/privacy-policy' }
      ],
      ogType: 'website',
      priority: 0.4,
      changefreq: 'monthly'
    },
    '/terms': {
      title: 'Terms & Conditions | SUNVILOZ CLEAN CARE',
      description: 'Service terms, scheduling policy, and scope disclosure for SUNVILOZ CLEAN CARE water tank and pipeline cleaning services.',
      h1: 'Terms & Conditions — SUNVILOZ CLEAN CARE',
      summary: 'Service terms, quotation conditions, and customer responsibilities.',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Terms & Conditions', path: '/terms' }
      ],
      ogType: 'website',
      priority: 0.4,
      changefreq: 'monthly'
    }
  };
}

export interface EntitySeoInput {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  noIndex?: boolean;
}

export interface ResolvedMetadataFields {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  ogImageAlt?: string;
  noIndex: boolean;
}

/**
 * Single authoritative metadata resolver shared identically by SSR (`routeMetadata.ts`)
 * and client `<SeoHead />`.
 *
 * Strict Precedence:
 *   1. Page SEO Override (`seoConfig.pageSeoOverrides[routeKey]`)
 *   2. Published Entity / Explicit Route SEO (`entitySeo`)
 *   3. Canonical Route Default (`routeDefault`, or on `/` `seoConfig.defaultMeta*` fallback)
 *
 * Never leaks `/` homepage overrides or defaults onto non-home routes.
 */
export function resolveRouteMetadata(params: {
  routeKey: string;
  seoConfig?: SeoConfig;
  entitySeo?: EntitySeoInput;
  routeDefault?: Partial<RouteMetadataDefault>;
}): ResolvedMetadataFields {
  const cleanKey = normalizePathname(params.routeKey);
  const isHome = cleanKey === '/';
  const override: PageSeoOverride | undefined = params.seoConfig?.pageSeoOverrides?.[cleanKey];
  const entity = params.entitySeo;
  const fallbackDefault = params.routeDefault || buildCoreRouteDefaults()[cleanKey];

  const customHomeTitle = params.seoConfig?.defaultMetaTitle?.trim();
  const customHomeDesc = params.seoConfig?.defaultMetaDescription?.trim();

  const effectiveDefaultTitle = isHome
    ? customHomeTitle || fallbackDefault?.title?.trim() || DEFAULT_HOME_SEO_TITLE
    : fallbackDefault?.title?.trim() || 'SUNVILOZ CLEAN CARE';

  const effectiveDefaultDesc = isHome
    ? customHomeDesc || fallbackDefault?.description?.trim() || DEFAULT_HOME_SEO_DESCRIPTION
    : fallbackDefault?.description?.trim() || DEFAULT_HOME_SEO_DESCRIPTION;

  const rawTitle =
    override?.title?.trim() ||
    entity?.title?.trim() ||
    effectiveDefaultTitle;

  const resolvedTitle = isHome
    ? rawTitle.trim()
    : formatSeoTitle(rawTitle);

  const resolvedDescription =
    override?.description?.trim() ||
    entity?.description?.trim() ||
    effectiveDefaultDesc;

  const rawOgTitle =
    override?.ogTitle?.trim() ||
    entity?.ogTitle?.trim() ||
    resolvedTitle;

  const resolvedOgTitle = rawOgTitle === resolvedTitle
    ? resolvedTitle
    : isHome
    ? rawOgTitle
    : formatSeoTitle(rawOgTitle);

  const resolvedOgDescription =
    override?.ogDescription?.trim() ||
    entity?.ogDescription?.trim() ||
    resolvedDescription;

  const resolvedOgImage =
    override?.ogImage?.trim() ||
    entity?.ogImage?.trim() ||
    params.seoConfig?.socialOgImage?.trim() ||
    undefined;

  const resolvedOgImageAlt =
    override?.ogImageAlt?.trim() ||
    entity?.ogImageAlt?.trim() ||
    params.seoConfig?.ogImageAlt?.trim() ||
    'SUNVILOZ CLEAN CARE — Water Tank & Pipeline Cleaning Service in Dhaka';

  const noIndex = Boolean(
    override?.noIndex ||
      entity?.noIndex ||
      params.seoConfig?.indexingAllowed === false
  );

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    ogTitle: resolvedOgTitle,
    ogDescription: resolvedOgDescription,
    ogImage: resolvedOgImage,
    ogImageAlt: resolvedOgImageAlt,
    noIndex
  };
}
