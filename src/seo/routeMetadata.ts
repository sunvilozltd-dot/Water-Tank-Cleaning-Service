import { BUSINESS_CONFIG } from '../data/config';
import { PROBLEM_QA_ITEMS } from '../data/problemQaData';
import {
  LiveSeoDataset,
  getCanonicalBaseUrl,
  isSliceAvailable
} from './siteDataFetcher';
import { escapeAttr, safeJsonForHtmlScript } from './safeSerialize';

export interface ResolvedSeoRoute {
  path: string;
  title: string;
  description: string;
  h1: string;
  summary: string;
  features?: string[];
  faqs?: { question: string; answer: string }[];
  breadcrumbs: { name: string; path: string }[];
  serviceType?: string;
  ogImage?: string;
  ogImageAlt?: string;
  noIndex?: boolean;
  lastmod?: string | null;
  articleMeta?: {
    publishedAt?: string;
    updatedAt?: string;
    imageUrl?: string;
    category?: string;
    readTime?: string;
    content?: string;
  };
  priority: number;
  changefreq?: 'daily' | 'weekly' | 'monthly';
}

export type RouteResolutionResult =
  | { kind: 'redirect'; destination: string; statusCode: 301 | 302 }
  | { kind: 'page'; statusCode: 200; route: ResolvedSeoRoute; fromLastKnownGood?: boolean }
  | { kind: 'not_found'; statusCode: 404 }
  | { kind: 'unavailable'; statusCode: 503; reason: string };

const DEFAULT_LOGO_URL =
  'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/branding/sunviloz-logo-official.png';

const STATIC_REDIRECTS: Record<string, { destination: string; statusCode: 301 | 302 }> = {
  '/water-tank-cleaning-service': { destination: '/services/water-tank-cleaning', statusCode: 301 },
  '/pipeline-cleaning-service': { destination: '/services/pipeline-cleaning', statusCode: 301 },
  '/services/pipe-line-cleaning': { destination: '/services/pipeline-cleaning', statusCode: 301 },
  '/services/underground-tank-cleaning': { destination: '/services/underground-water-tank-cleaning', statusCode: 301 },
  '/services/overhead-water-tank-cleaning': { destination: '/services/overhead-tank-cleaning', statusCode: 301 },
  '/areas': { destination: '/service-areas', statusCode: 301 },
  '/projects': { destination: '/portfolio', statusCode: 301 },
  '/terms-and-conditions': { destination: '/terms', statusCode: 301 },
  '/pricing': { destination: '/get-quote', statusCode: 301 },
  '/services-faq': { destination: '/faq', statusCode: 301 },
  '/quote': { destination: '/get-quote', statusCode: 301 },
  '/tips': { destination: '/blog', statusCode: 301 }
};

const CORE_SERVICE_SLUGS = new Set([
  'water-tank-cleaning',
  'pipeline-cleaning',
  'overhead-tank-cleaning',
  'underground-water-tank-cleaning'
]);

const CORE_CITIES = ['Dhaka', 'Narayanganj', 'Gazipur', 'Savar'];

export function normalizePathname(rawPath: string): string {
  const withoutQuery = (rawPath || '/').split('?')[0].split('#')[0].trim();
  if (!withoutQuery || withoutQuery === '/') return '/';
  const clean = `/${withoutQuery.replace(/^\/+|\/+$/g, '')}`;
  return clean || '/';
}

function resolveAbsoluteImageUrl(rawUrl: string | undefined, baseUrl: string): string {
  if (!rawUrl || !rawUrl.trim()) return DEFAULT_LOGO_URL;
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `${baseUrl}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

export function buildAllRoutes(dataset: LiveSeoDataset): ResolvedSeoRoute[] {
  const seoCfg = dataset.siteConfig?.seo;
  const overrides = seoCfg?.pageSeoOverrides || {};
  const globalOgImage = seoCfg?.socialOgImage || DEFAULT_LOGO_URL;
  const phoneDisplay = dataset.siteConfig?.business?.phone || BUSINESS_CONFIG.phone;

  const problemFaqs = PROBLEM_QA_ITEMS.map(item => ({
    question: item.questionBn,
    answer: item.directAnswerBn
  }));

  const routes: ResolvedSeoRoute[] = [
    {
      path: '/',
      title: `Water Tank Cleaning Service in Dhaka, Narayanganj, Gazipur & Savar | SUNVILOZ CLEAN CARE`,
      description: `পানির ট্যাংক পরিষ্কার ও ওয়াটার পাইপলাইন ক্লিনিং সার্ভিস—ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভারে ওভারহেড, আন্ডারগ্রাউন্ড রিজার্ভ ট্যাংক ও পাইপলাইন পরিষ্কার। কল করুন: ${phoneDisplay}।`,
      h1:
        dataset.siteConfig?.hero?.headingBn ||
        'ঢাকায় প্রফেশনাল ওয়াটার ট্যাংক ও পাইপলাইন পরিষ্কার সার্ভিস — Water Tank Cleaning Service in Dhaka',
      summary:
        dataset.siteConfig?.hero?.subheadingBn ||
        'ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভার জুড়ে আবাসিক ভবন, অ্যাপার্টমেন্ট ও বাণিজ্যিক স্থাপনায় ছাদের ওভারহেড ট্যাংক, আন্ডারগ্রাউন্ড রিজার্ভার ও পানির পাইপলাইন আধুনিক মেকানাইজড রোটারি ওয়াটার জেট এবং ফুড-গ্রেড স্যানিটাইজারে পরিষ্কার সেবা।',
      features: [
        'আন্ডারগ্রাউন্ড রিজার্ভ ও ওভারহেড পানির ট্যাংক পরিষ্কার সার্ভিস (Water Tank Cleaning Service)',
        'হাইড্রো-পালস প্রেসারাইজড ওয়াটার পাইপলাইন ফ্লাশিং — দেয়াল বা টাইলস না ভেঙে',
        'হাই-প্রেসার রোটারি ওয়াটার জেট ও সাবমারসিবল স্লাজ পাম্পে কাদা-শ্যাওলা অপসারণ',
        'ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভার জুড়ে নির্ধারিত শিডিউলে মোবাইল টিম সার্ভিস'
      ],
      faqs: problemFaqs.slice(0, 6),
      breadcrumbs: [{ name: 'Home', path: '/' }],
      lastmod: dataset.homepageRevision?.publishedAt || dataset.siteConfigUpdatedAt || null,
      priority: 1.0,
      changefreq: 'daily'
    },
    {
      path: '/services/water-tank-cleaning',
      title: 'Water Tank Cleaning Service in Dhaka | Overhead & Underground Tank Wash | SUNVILOZ CLEAN CARE',
      description: `পানির ট্যাংক পরিষ্কার সার্ভিস ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভারে। ওভারহেড PVC/RCC এবং আন্ডারগ্রাউন্ড রিজার্ভ ট্যাংক মেকানাইজড জেট ওয়াশ ও স্যানিটাইজিং। কল: ${phoneDisplay}।`,
      h1: 'পানির ট্যাংক পরিষ্কার সার্ভিস (Water Tank Cleaning Service in Dhaka)',
      summary:
        'বাসাবাড়ি, অ্যাপার্টমেন্ট ও বাণিজ্যিক ভবনের ওভারহেড ও আন্ডারগ্রাউন্ড পানির রিজার্ভ ট্যাংকের কাদা, বালু, শ্যাওলা ও জীবাণু মেকানাইজড রোটারি জেট ও ফুড-গ্রেড স্যানিটাইজারের মাধ্যমে পরিষ্কার সেবা।',
      faqs: problemFaqs.slice(0, 4),
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
        { name: 'Water Tank Cleaning', path: '/services/water-tank-cleaning' }
      ],
      serviceType: 'Water Tank Cleaning Service',
      lastmod: dataset.siteConfigUpdatedAt || null,
      priority: 0.95,
      changefreq: 'weekly'
    },
    {
      path: '/services/pipeline-cleaning',
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
      serviceType: 'Water Pipeline Cleaning Service',
      lastmod: dataset.siteConfigUpdatedAt || null,
      priority: 0.9,
      changefreq: 'weekly'
    },
    {
      path: '/services/overhead-tank-cleaning',
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
      serviceType: 'Overhead Water Tank Cleaning Service',
      lastmod: dataset.siteConfigUpdatedAt || null,
      priority: 0.9,
      changefreq: 'weekly'
    },
    {
      path: '/services/underground-water-tank-cleaning',
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
      serviceType: 'Underground Water Tank Cleaning Service',
      lastmod: dataset.siteConfigUpdatedAt || null,
      priority: 0.9,
      changefreq: 'weekly'
    },
    {
      path: '/services',
      title: 'Water Tank & Pipeline Cleaning Services | SUNVILOZ CLEAN CARE',
      description: `ওভারহেড ট্যাংক, আন্ডারগ্রাউন্ড রিজার্ভার ও পানির পাইপলাইন পরিষ্কারের সম্পূর্ণ সার্ভিস তালিকা — ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভার। ${phoneDisplay}।`,
      h1: 'সানভিলোজ ক্লিন কেয়ারের পানির ট্যাংক ও পাইপলাইন পরিষ্কার সেবাসমূহ',
      summary:
        'আবাসিক অ্যাপার্টমেন্ট, বাড়ি, অফিস ও প্রতিষ্ঠানের জন্য নিরাপদ পানির ট্যাংক ও পাইপলাইন রক্ষণাবেক্ষণ ও পরিষ্কার সেবা।',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' }
      ],
      lastmod: dataset.services[0]?.updatedAt || dataset.siteConfigUpdatedAt || null,
      priority: 0.9,
      changefreq: 'weekly'
    },
    {
      path: '/service-areas',
      title: 'Service Areas — Dhaka, Narayanganj, Gazipur & Savar | SUNVILOZ CLEAN CARE',
      description: `ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভারের সকল আবাসিক ও বাণিজ্যিক এলাকায় পানির ট্যাংক ও পাইপলাইন পরিষ্কার সার্ভিস। কল: ${phoneDisplay}।`,
      h1: 'আমাদের সার্ভিস এরিয়া — ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভার',
      summary:
        'ঢাকা শহরের প্রধান আবাসিক জোন ছাড়াও নারায়ণগঞ্জ, গাজীপুর ও সাভারে আমাদের মোবাইল টিম নির্ধারিত শিডিউলে ওয়াটার ট্যাংক ও পাইপলাইন পরিষ্কার সেবা দিচ্ছে।',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Service Areas', path: '/service-areas' }
      ],
      lastmod: dataset.areas[0]?.updatedAt || dataset.zones[0]?.updatedAt || null,
      priority: 0.9,
      changefreq: 'weekly'
    },
    {
      path: '/get-quote',
      title: 'Water Tank Cleaning Cost & Free Quotation | SUNVILOZ CLEAN CARE',
      description: `আপনার ওভারহেড বা আন্ডারগ্রাউন্ড পানির ট্যাংক ও পাইপলাইন পরিষ্কারের আনুমানিক খরচ জানুন ও দ্রুত কোটেশন নিন। WhatsApp বা কল: ${phoneDisplay}।`,
      h1: 'পানির ট্যাংক ও পাইপলাইন পরিষ্কারের ফ্রি কোটেশন',
      summary:
        'ট্যাংকের ধরন, ধারণক্ষমতা ও এলাকা নির্বাচন করে স্বচ্ছ খরচের ধারণা নিন এবং দ্রুত বুকিং অনুরোধ পাঠান।',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Get Quote', path: '/get-quote' }
      ],
      lastmod: dataset.siteConfigUpdatedAt || null,
      priority: 0.9,
      changefreq: 'weekly'
    },
    {
      path: '/faq',
      title: 'পানির ট্যাংক ও পাইপলাইনের সমস্যা এবং সমাধান (FAQ & Q&A) | SUNVILOZ CLEAN CARE',
      description:
        'পানির ট্যাংকে ময়লা, দুর্গন্ধ, সবুজ শ্যাওলা, পোকা ও পাইপলাইনে আয়রন বা কম প্রেশারের বাস্তব কারণ এবং সমাধান সম্পর্কে সরাসরি প্রশ্নোত্তর।',
      h1: 'পানির ট্যাংক ও পাইপলাইনের সাধারণ সমস্যা এবং সমাধান (FAQ & AI Overview Q&A)',
      summary:
        'বাসাবাড়ির রিজার্ভার, ছাদের ট্যাংক ও পাইপলাইনের বাস্তব সমস্যা, পরিষ্কার-বহির্ভূত কারণ ও ব্যবহারিক করণীয়।',
      faqs: problemFaqs,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'FAQ', path: '/faq' }
      ],
      lastmod: dataset.siteConfigUpdatedAt || null,
      priority: 0.8,
      changefreq: 'weekly'
    },
    {
      path: '/portfolio',
      title: 'Before & After Tank Cleaning Portfolio | SUNVILOZ CLEAN CARE',
      description:
        'ঢাকা ও আশপাশের এলাকায় সম্পন্ন ওভারহেড ও আন্ডারগ্রাউন্ড পানির ট্যাংক পরিষ্কার কাজের বাস্তব আগে ও পরের নমুনা দেখুন।',
      h1: 'সম্পন্ন পানির ট্যাংক পরিষ্কার কাজের নমুনা (Portfolio)',
      summary: 'আবাসিক ও বাণিজ্যিক ভবনের ট্যাংক থেকে কাদা, শ্যাওলা ও পলি অপসারণের বাস্তব উদাহরণ।',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Portfolio', path: '/portfolio' }
      ],
      priority: 0.75,
      changefreq: 'weekly'
    },
    {
      path: '/about',
      title: 'About Us | SUNVILOZ CLEAN CARE — Water Tank & Pipeline Cleaning Service',
      description:
        '২০২০ সাল থেকে ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভারে মেকানাইজড ওয়াটার ট্যাংক ও পাইপলাইন পরিষ্কার সেবা প্রদানকারী প্রতিষ্ঠান SUNVILOZ CLEAN CARE।',
      h1: 'আমাদের সম্পর্কে — SUNVILOZ CLEAN CARE',
      summary: 'আবাসিক ও বাণিজ্যিক ভবনের পানি সংরক্ষণ ব্যবস্থা পরিষ্কার ও রক্ষণাবেক্ষণে স্বচ্ছ কোটেশন ও দায়িত্বশীল সেবা।',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'About Us', path: '/about' }
      ],
      priority: 0.8,
      changefreq: 'monthly'
    },
    {
      path: '/contact',
      title: `Contact Us | SUNVILOZ CLEAN CARE — Hotline ${phoneDisplay}`,
      description: `পানির ট্যাংক ও পাইপলাইন পরিষ্কার সার্ভিসের কোটেশন ও বুকিংয়ের জন্য যোগাযোগ করুন। সরাসরি কল বা WhatsApp: ${phoneDisplay}।`,
      h1: 'আমাদের সাথে যোগাযোগ করুন (Contact & WhatsApp Quote)',
      summary: 'ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভারের যেকোনো এলাকায় সার্ভিসের জন্য WhatsApp-এ কোটেশন নিন অথবা সরাসরি কল করুন।',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Contact', path: '/contact' }
      ],
      lastmod: dataset.siteConfigUpdatedAt || null,
      priority: 0.8,
      changefreq: 'monthly'
    },
    {
      path: '/blog',
      title: 'পানির ট্যাংক পরিষ্কার ও রক্ষণাবেক্ষণ গাইড | Blog | SUNVILOZ CLEAN CARE',
      description:
        'পানির ট্যাংক ও পাইপলাইন পরিষ্কার রাখার নিয়ম, পানির পলি ও আয়রন সমস্যা এবং মৌসুমভিত্তিক সতর্কতা নিয়ে পরামর্শ।',
      h1: 'পানির ট্যাংক ও পাইপলাইন পরিষ্কারের ব্যবহারিক গাইড ও প্রবন্ধ',
      summary: 'ট্যাংক পরিষ্কার ও পানি সংরক্ষণ স্বাস্থ্যবিধি নিয়ে বাস্তবমুখী তথ্য ও পরামর্শ।',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' }
      ],
      lastmod: dataset.blogPosts[0]?.updatedAt || dataset.blogPosts[0]?.publishedAt || null,
      priority: 0.8,
      changefreq: 'weekly'
    },
    {
      path: '/privacy-policy',
      title: 'Privacy Policy | SUNVILOZ CLEAN CARE',
      description: 'Privacy Policy and data handling disclosure for SUNVILOZ CLEAN CARE website visitors and service inquiries.',
      h1: 'Privacy Policy — SUNVILOZ CLEAN CARE',
      summary: 'How SUNVILOZ CLEAN CARE collects and protects inquiry contact details and consent preferences.',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Privacy Policy', path: '/privacy-policy' }
      ],
      priority: 0.4,
      changefreq: 'monthly'
    },
    {
      path: '/terms',
      title: 'Terms & Conditions | SUNVILOZ CLEAN CARE',
      description: 'Service terms, scheduling policy, and scope disclosure for SUNVILOZ CLEAN CARE water tank and pipeline cleaning services.',
      h1: 'Terms & Conditions — SUNVILOZ CLEAN CARE',
      summary: 'Service terms, quotation conditions, and customer responsibilities.',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Terms & Conditions', path: '/terms' }
      ],
      priority: 0.4,
      changefreq: 'monthly'
    }
  ];

  // Dynamic Active Services added/edited in Admin (excluding slugs redirected statically)
  for (const srv of dataset.services) {
    const routePath = `/services/${srv.slug}`;
    if (STATIC_REDIRECTS[routePath] || CORE_SERVICE_SLUGS.has(srv.slug)) {
      // Update lastmod on matching core service route if available
      const existing = routes.find(r => r.path === routePath);
      if (existing && (srv.updatedAt || srv.publishedAt)) {
        existing.lastmod = srv.updatedAt || srv.publishedAt || existing.lastmod;
      }
      continue;
    }

    routes.push({
      path: routePath,
      title: srv.metaTitle || `${srv.title} | SUNVILOZ CLEAN CARE`,
      description:
        srv.metaDesc ||
        srv.shortDesc ||
        srv.shortDescBn ||
        `${srv.title} — SUNVILOZ CLEAN CARE`,
      h1: srv.titleBn || srv.title,
      summary: srv.shortDescBn || srv.shortDesc || '',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
        { name: srv.title, path: routePath }
      ],
      serviceType: srv.title,
      ogImage: srv.image,
      ogImageAlt: srv.title,
      lastmod: srv.updatedAt || srv.publishedAt || null,
      priority: 0.85,
      changefreq: 'weekly'
    });
  }

  // Dynamic visible & published Zone Area detail pages
  for (const area of dataset.areas) {
    if (!area.isVisible || area.status !== 'published') continue;
    const content = area.publishedData;
    const baseTitle = content.seoTitle || content.title || `Water Tank Cleaning Service in ${area.areaName}`;
    const cleanTitle = baseTitle
      .replace(/ \| Sunviloz Clean Care/i, '')
      .replace(/ \| SUNVILOZ CLEAN CARE/i, '');

    routes.push({
      path: `/service-areas/${area.slug}`,
      title: `${cleanTitle} | SUNVILOZ CLEAN CARE`,
      description:
        content.metaDesc ||
        `Water tank cleaning and pipeline cleaning service in ${area.areaName}. WhatsApp or call ${phoneDisplay}.`,
      h1: content.titleBn || `${area.areaNameBn} এলাকায় পানির ট্যাংক পরিষ্কার সার্ভিস`,
      summary:
        content.introBn ||
        content.intro ||
        `${area.areaNameBn} এলাকায় আবাসিক ও বাণিজ্যিক ভবনের ওভারহেড, আন্ডারগ্রাউন্ড রিজার্ভ ট্যাংক ও পাইপলাইন পরিষ্কার সার্ভিস।`,
      features: content.coverageDetails,
      faqs: (content.faqs || []).map(f => ({ question: f.question, answer: f.answer })),
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Service Areas', path: '/service-areas' },
        { name: area.areaName, path: `/service-areas/${area.slug}` }
      ],
      serviceType: `Water Tank Cleaning Service in ${area.areaName}`,
      ogImage: content.ogImage || content.heroImage,
      ogImageAlt: content.ogImageAlt || content.heroImageAlt,
      lastmod: area.updatedAt || area.publishedAt || null,
      priority: area.isCoreCity ? 0.9 : 0.85,
      changefreq: 'weekly'
    });
  }

  // Published Blog Articles strictly from Supabase blog_posts (published = true)
  for (const article of dataset.blogPosts) {
    routes.push({
      path: `/blog/${article.slug}`,
      title: article.metaTitle || `${article.title} | SUNVILOZ CLEAN CARE`,
      description:
        article.metaDescription ||
        article.excerpt ||
        article.excerptBn ||
        `${article.title} — SUNVILOZ CLEAN CARE.`,
      h1: article.titleBn || article.title,
      summary: article.excerptBn || article.excerpt,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: article.title, path: `/blog/${article.slug}` }
      ],
      articleMeta: {
        publishedAt: article.publishedAt,
        updatedAt: article.updatedAt,
        imageUrl: article.imageUrl,
        category: article.category,
        readTime: article.readTime,
        content: article.content
      },
      ogImage: article.imageUrl,
      ogImageAlt: article.title,
      lastmod: article.updatedAt || article.publishedAt || null,
      priority: 0.75,
      changefreq: 'monthly'
    });
  }

  // Apply admin per-route SEO overrides safely
  for (const r of routes) {
    const ov = overrides[r.path];
    if (ov) {
      if (ov.title) r.title = ov.title;
      if (ov.description) r.description = ov.description;
      if (ov.ogImage) r.ogImage = ov.ogImage;
      if (ov.ogImageAlt) r.ogImageAlt = ov.ogImageAlt;
      if (ov.noIndex) r.noIndex = true;
    }
    if (!r.ogImage) {
      r.ogImage = globalOgImage;
    }
  }

  return routes;
}

/**
 * Resolves an incoming URL path to a redirect, an authoritative 200 route, a true 404,
 * or a temporary 503 when a required database query failed without last-known-good fallback.
 */
export function resolveRoute(rawPath: string, dataset: LiveSeoDataset): RouteResolutionResult {
  const cleanPath = normalizePathname(rawPath);
  const status = dataset.status;
  const stale = new Set(status?.staleSlices || []);

  // 1. Dynamic DB redirects
  const dbRedirect = dataset.redirects.find(
    r => r.isActive && normalizePathname(r.fromPath) === cleanPath
  );
  if (dbRedirect && normalizePathname(dbRedirect.toPath) !== cleanPath) {
    return {
      kind: 'redirect',
      destination: dbRedirect.toPath,
      statusCode: dbRedirect.statusCode === 302 ? 302 : 301
    };
  }

  // 2. Canonical static redirects
  if (STATIC_REDIRECTS[cleanPath]) {
    return {
      kind: 'redirect',
      destination: STATIC_REDIRECTS[cleanPath].destination,
      statusCode: STATIC_REDIRECTS[cleanPath].statusCode
    };
  }
  if (cleanPath.startsWith('/areas/')) {
    const slug = cleanPath.replace('/areas/', '').replace(/^water-tank-cleaning-/, '');
    return { kind: 'redirect', destination: `/service-areas/${slug}`, statusCode: 301 };
  }
  if (cleanPath.startsWith('/tips/')) {
    const slug = cleanPath.replace('/tips/', '');
    return { kind: 'redirect', destination: `/blog/${slug}`, statusCode: 301 };
  }

  // 3. Hub pages that depend directly on live tables — return 503 if unrecovered DB outage
  if (cleanPath === '/blog' && status && !isSliceAvailable(status, 'blogPosts')) {
    return {
      kind: 'unavailable',
      statusCode: 503,
      reason: 'Blog database query failed without fallback snapshot.'
    };
  }
  if (
    cleanPath === '/service-areas' &&
    status &&
    !isSliceAvailable(status, 'areas') &&
    !isSliceAvailable(status, 'zones')
  ) {
    return {
      kind: 'unavailable',
      statusCode: 503,
      reason: 'Service areas database query failed without fallback snapshot.'
    };
  }
  if (cleanPath === '/services' && status && !isSliceAvailable(status, 'services')) {
    return {
      kind: 'unavailable',
      statusCode: 503,
      reason: 'Services database query failed without fallback snapshot.'
    };
  }

  // 4. Match published route
  const allRoutes = buildAllRoutes(dataset);
  const matched = allRoutes.find(r => r.path === cleanPath);
  if (matched) {
    let fromLkg = Boolean(status?.usedLastKnownGood);
    if (cleanPath.startsWith('/blog/') && stale.has('blogPosts')) fromLkg = true;
    if (cleanPath.startsWith('/service-areas/') && stale.has('areas')) fromLkg = true;
    if (cleanPath.startsWith('/services/') && stale.has('services')) fromLkg = true;
    return { kind: 'page', statusCode: 200, route: matched, fromLastKnownGood: fromLkg };
  }

  // 5. Distinguish true 404 from database/query failures for dynamic routes or unknown redirect paths
  if (status) {
    if (!status.configured) {
      return {
        kind: 'unavailable',
        statusCode: 503,
        reason: 'Database client is not configured.'
      };
    }

    if (cleanPath.startsWith('/blog/') && !status.blogPostsOk) {
      return {
        kind: 'unavailable',
        statusCode: 503,
        reason: 'Unable to verify blog article slug due to database query failure.'
      };
    }

    if (cleanPath.startsWith('/service-areas/') && !status.areasOk) {
      return {
        kind: 'unavailable',
        statusCode: 503,
        reason: 'Unable to verify service area slug due to database query failure.'
      };
    }

    if (cleanPath.startsWith('/services/') && !status.servicesOk) {
      return {
        kind: 'unavailable',
        statusCode: 503,
        reason: 'Unable to verify service slug due to database query failure.'
      };
    }

    if (!status.redirectsOk) {
      return {
        kind: 'unavailable',
        statusCode: 503,
        reason: 'Unable to verify redirect rules due to database query failure.'
      };
    }
  }

  // 6. Authoritatively missing URL (all relevant queries succeeded) -> true 404
  return { kind: 'not_found', statusCode: 404 };
}

function renderCrawlableBody(route: ResolvedSeoRoute, dataset: LiveSeoDataset, baseUrl: string): string {
  const isHome = route.path === '/';
  const biz = dataset.siteConfig?.business;
  const phone = biz?.phone || BUSINESS_CONFIG.phone;
  const displayPhone = biz?.displayPhone || BUSINESS_CONFIG.displayPhone;
  const whatsappUrl = biz?.whatsappUrl || BUSINESS_CONFIG.whatsappUrl;
  const logoUrl = resolveAbsoluteImageUrl(dataset.siteConfig?.images?.logo, baseUrl);

  return `
    <header style="padding: 1rem 1.5rem; border-bottom: 1px solid #E2E8F0; background: #123047;">
      <nav style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <a href="/" style="color: #38BDF8; font-weight: 900; text-decoration: none; font-size: 1.35rem; display: flex; align-items: center; gap: 0.5rem;">
          <img src="${escapeAttr(logoUrl)}" alt="SUNVILOZ CLEAN CARE Logo" style="height: 38px; width: auto;" />
          <span>SUNVILOZ CLEAN CARE</span>
        </a>
        <div style="display: flex; gap: 1.25rem; align-items: center; flex-wrap: wrap;">
          <a href="/services/water-tank-cleaning" style="color: #E2E8F0; text-decoration: none; font-size: 0.9rem;">Water Tank Cleaning</a>
          <a href="/services/pipeline-cleaning" style="color: #E2E8F0; text-decoration: none; font-size: 0.9rem;">Pipeline Cleaning</a>
          <a href="/service-areas" style="color: #E2E8F0; text-decoration: none; font-size: 0.9rem;">Service Areas</a>
          <a href="/blog" style="color: #E2E8F0; text-decoration: none; font-size: 0.9rem;">Tips &amp; Guides</a>
          <a href="/get-quote" style="color: #38BDF8; font-weight: bold; text-decoration: none; font-size: 0.9rem;">Get Quote</a>
        </div>
      </nav>
    </header>

    <main id="main-content" style="max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #172B3A;">
      ${
        !isHome
          ? `
        <nav aria-label="Breadcrumb" style="margin-bottom: 1.5rem; font-size: 0.85rem; color: #64748B;">
          ${route.breadcrumbs
            .map(
              (bc, idx) => `
            ${idx > 0 ? ' <span style="margin: 0 0.4rem; color: #CBD5E1;">/</span> ' : ''}
            <a href="${escapeAttr(bc.path)}" style="color: ${idx === route.breadcrumbs.length - 1 ? '#0D9488' : '#64748B'}; text-decoration: none; font-weight: ${idx === route.breadcrumbs.length - 1 ? 'bold' : 'normal'};">${escapeAttr(bc.name)}</a>
          `
            )
            .join('')}
        </nav>
      `
          : ''
      }

      <div style="margin-bottom: 2rem;">
        <h1 style="font-size: 2.15rem; font-weight: 900; color: #123047; line-height: 1.25; margin-bottom: 1rem;">
          ${escapeAttr(route.h1)}
        </h1>
        <p style="font-size: 1.1rem; color: #475569; max-width: 850px; line-height: 1.7; margin-bottom: 1.75rem;">
          ${escapeAttr(route.summary)}
        </p>

        <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; margin-bottom: 2.5rem;">
          <a href="${escapeAttr(whatsappUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.5rem; background: #25D366; color: #FFFFFF; padding: 0.85rem 1.75rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold; font-size: 0.95rem;">
            <span>WhatsApp-এ কোটেশন নিন</span>
          </a>
          <a href="tel:${escapeAttr(phone)}" style="display: inline-flex; align-items: center; gap: 0.5rem; background: #123047; color: #FFFFFF; padding: 0.85rem 1.75rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold; font-size: 0.95rem;">
            <span>সরাসরি কল করুন: ${escapeAttr(displayPhone)}</span>
          </a>
        </div>
      </div>

      ${
        route.features && route.features.length > 0
          ? `
        <section style="margin-bottom: 2.5rem;">
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #123047; margin-bottom: 1rem;">সেবা ও কভারেজের মূল বৈশিষ্ট্য</h2>
          <ul style="padding-left: 1.25rem; color: #334155; line-height: 1.8;">
            ${route.features.map(f => `<li>${escapeAttr(f)}</li>`).join('')}
          </ul>
        </section>
      `
          : ''
      }

      ${
        route.faqs && route.faqs.length > 0
          ? `
        <section style="margin-bottom: 3rem;">
          <h2 style="font-size: 1.5rem; font-weight: 800; color: #123047; margin-bottom: 1.25rem;">
            সাধারণ প্রশ্ন ও উত্তর (Frequently Asked Questions)
          </h2>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${route.faqs
              .map(
                faq => `
              <article style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 0.75rem; padding: 1.25rem;">
                <h3 style="font-size: 1.05rem; font-weight: 700; color: #123047; margin-top: 0; margin-bottom: 0.5rem;">
                  ${escapeAttr(faq.question)}
                </h3>
                <p style="color: #64748B; font-size: 0.95rem; line-height: 1.6; margin: 0;">
                  ${escapeAttr(faq.answer)}
                </p>
              </article>
            `
              )
              .join('')}
          </div>
        </section>
      `
          : ''
      }
    </main>

    <footer style="background: #123047; color: #CBD5E1; padding: 2rem 1.5rem; font-size: 0.85rem; margin-top: 4rem;">
      <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <strong style="color: #FFFFFF;">SUNVILOZ CLEAN CARE</strong> — Water Tank &amp; Pipeline Cleaning Service
        </div>
        <div>
          হটলাইন: <a href="tel:${escapeAttr(phone)}" style="color: #38BDF8; text-decoration: none; font-weight: bold;">${escapeAttr(displayPhone)}</a>
        </div>
      </div>
    </footer>
  `;
}

/**
 * Generates complete HTML with route metadata, safe JSON-LD, safe hydration snapshots,
 * and crawlable SSR body HTML inside `#root`.
 */
export function renderRouteHtmlFromTemplate(
  baseTemplate: string,
  route: ResolvedSeoRoute,
  dataset: LiveSeoDataset,
  renderedRootHtmlOverride?: string
): string {
  const baseUrl = getCanonicalBaseUrl();
  const canonicalUrl = `${baseUrl}${route.path === '/' ? '/' : route.path}`;
  const biz = dataset.siteConfig?.business;
  const seoCfg = dataset.siteConfig?.seo;
  const phone = biz?.phone || BUSINESS_CONFIG.phone;
  const logoUrl = resolveAbsoluteImageUrl(dataset.siteConfig?.images?.logo, baseUrl);
  const resolvedSocialImage = resolveAbsoluteImageUrl(route.ogImage || seoCfg?.socialOgImage, baseUrl);
  const ogAlt = route.ogImageAlt || seoCfg?.ogImageAlt || 'SUNVILOZ CLEAN CARE — Water Tank & Pipeline Cleaning Service';
  const gbpVerified = Boolean(biz?.gbpVerified && biz?.googleBusinessProfileUrl);
  const indexingDisabled = seoCfg?.indexingAllowed === false || route.noIndex;

  let html = baseTemplate.replace(/<title>.*?<\/title>/i, `<title>${escapeAttr(route.title)}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${escapeAttr(route.description)}" />`
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
    `<link rel="canonical" href="${escapeAttr(canonicalUrl)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${escapeAttr(route.title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${escapeAttr(route.description)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${escapeAttr(canonicalUrl)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:image" content="${escapeAttr(resolvedSocialImage)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image:alt"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:image:alt" content="${escapeAttr(ogAlt)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeAttr(route.title)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeAttr(route.description)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:image" content="${escapeAttr(resolvedSocialImage)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:image:alt"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:image:alt" content="${escapeAttr(ogAlt)}" />`
  );

  // Inject robots + GSC / Bing Webmaster verification tags if configured
  const extraMetaTags: string[] = [
    `<meta name="robots" content="${indexingDisabled ? 'noindex, nofollow' : 'index, follow'}" />`
  ];
  if (biz?.googleSiteVerification?.trim()) {
    extraMetaTags.push(
      `<meta name="google-site-verification" content="${escapeAttr(biz.googleSiteVerification.trim())}" />`
    );
  }
  if (biz?.bingSiteVerification?.trim()) {
    extraMetaTags.push(`<meta name="msvalidate.01" content="${escapeAttr(biz.bingSiteVerification.trim())}" />`);
  }
  html = html.replace('</head>', `  ${extraMetaTags.join('\n    ')}\n  </head>`);

  // Structured JSON-LD
  const localBusinessSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
    '@id': `${baseUrl}/#localbusiness`,
    name: biz?.name || 'SUNVILOZ CLEAN CARE',
    url: baseUrl,
    telephone: `+88${phone}`,
    email: biz?.email || BUSINESS_CONFIG.email,
    image: logoUrl,
    logo: logoUrl,
    description:
      'Water tank cleaning service and water pipeline cleaning service across Dhaka, Narayanganj, Gazipur, and Savar for overhead PVC/RCC tanks and underground reservoirs.',
    areaServed: CORE_CITIES.map(c => ({ '@type': 'City', name: c }))
  };

  if (biz?.operatingHours?.trim()) {
    localBusinessSchema.openingHours = biz.operatingHours.trim();
  }

  if (gbpVerified && biz?.googleBusinessProfileUrl) {
    localBusinessSchema.sameAs = [biz.googleBusinessProfileUrl];
    localBusinessSchema.hasMap = biz.googleBusinessProfileUrl;
  }

  const schemas: any[] = [localBusinessSchema];

  if (route.breadcrumbs && route.breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: route.breadcrumbs.map((bc, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: bc.name,
        item: `${baseUrl}${bc.path.startsWith('/') ? bc.path : `/${bc.path}`}`
      }))
    });
  }

  if (route.serviceType) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: route.serviceType,
      serviceType: route.serviceType,
      description: route.summary,
      provider: {
        '@type': 'HomeAndConstructionBusiness',
        name: biz?.name || 'SUNVILOZ CLEAN CARE',
        telephone: `+88${phone}`,
        url: baseUrl
      },
      areaServed: CORE_CITIES.map(c => ({ '@type': 'City', name: c }))
    });
  }

  if (route.faqs && route.faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: route.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    });
  }

  if (route.articleMeta) {
    const blogPosting: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: route.h1,
      description: route.description,
      image: [resolvedSocialImage],
      author: {
        '@type': 'Organization',
        name: biz?.name || 'SUNVILOZ CLEAN CARE',
        url: baseUrl
      },
      publisher: {
        '@type': 'Organization',
        name: biz?.name || 'SUNVILOZ CLEAN CARE',
        logo: {
          '@type': 'ImageObject',
          url: logoUrl
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl
      }
    };
    if (route.articleMeta.publishedAt) {
      blogPosting.datePublished = route.articleMeta.publishedAt;
    }
    if (route.articleMeta.updatedAt || route.articleMeta.publishedAt) {
      blogPosting.dateModified = route.articleMeta.updatedAt || route.articleMeta.publishedAt;
    }
    schemas.push(blogPosting);
  }

  const schemasMarkup = schemas
    .map(
      s =>
        `\n    <script type="application/ld+json">\n    ${safeJsonForHtmlScript(s, true).replace(/\n/g, '\n    ')}\n    </script>`
    )
    .join('\n');

  html = html.replace(/<script\s+id="jsonld-local-business"[^>]*>[\s\S]*?<\/script>/i, schemasMarkup);

  const rootBody = renderedRootHtmlOverride || renderCrawlableBody(route, dataset, baseUrl);
  html = html.replace(/<div\s+id="root">[\s\S]*?<\/div>/i, `<div id="root">${rootBody}</div>`);

  // Safe hydration snapshots using safeJsonForHtmlScript (prevents </script> and XSS breakout)
  const snapshotScripts: string[] = [];
  if (dataset.homepageSections.length > 0) {
    snapshotScripts.push(
      `window.__INITIAL_HOMEPAGE_SECTIONS__ = ${safeJsonForHtmlScript(dataset.homepageSections)}; window.__HOMEPAGE_REVISION__ = ${safeJsonForHtmlScript(dataset.homepageRevision)};`
    );
  }
  if (dataset.imageRegistry) {
    snapshotScripts.push(
      `window.__INITIAL_IMAGE_REGISTRY__ = ${safeJsonForHtmlScript(dataset.imageRegistry)};`
    );
  }

  if (snapshotScripts.length > 0) {
    const snapshotTag = `<script id="__SUNVILOZ_HOMEPAGE_SNAPSHOT__">${snapshotScripts.join(' ')}</script>`;
    html = html.replace('</head>', `  ${snapshotTag}\n</head>`);
  }

  return html;
}

export function render404HtmlFromTemplate(
  baseTemplate: string,
  dataset: LiveSeoDataset,
  renderedRootHtmlOverride?: string
): string {
  const baseUrl = getCanonicalBaseUrl();
  const logoUrl = resolveAbsoluteImageUrl(dataset.siteConfig?.images?.logo, baseUrl);
  let html = baseTemplate.replace(
    /<title>.*?<\/title>/i,
    '<title>404 — Page Not Found | SUNVILOZ CLEAN CARE</title>'
  );
  html = html.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    '<meta name="description" content="Requested page could not be found on SUNVILOZ CLEAN CARE." />'
  );
  html = html.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, '');
  html = html.replace('</head>', '  <meta name="robots" content="noindex, nofollow" />\n</head>');

  const fallback404Body = `
      <main style="max-width: 720px; margin: 4rem auto; padding: 2rem; text-align: center; font-family: sans-serif;">
        <img src="${escapeAttr(logoUrl)}" alt="SUNVILOZ CLEAN CARE" style="height: 48px; margin: 0 auto 1rem;" />
        <h1 style="font-size: 2rem; color: #123047;">৪০৪ — পৃষ্ঠাটি পাওয়া যায়নি (Page Not Found)</h1>
        <p style="color: #475569; margin: 1rem 0 2rem;">আপনি যে লিংকটি খুঁজছেন তা পরিবর্তন হয়েছে অথবা বর্তমানে উপলব্ধ নয়।</p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <a href="/" style="background: #123047; color: #fff; padding: 0.75rem 1.5rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold;">হোমপেজে ফিরুন</a>
          <a href="/service-areas" style="background: #0D9488; color: #fff; padding: 0.75rem 1.5rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold;">সার্ভিস এরিয়া দেখুন</a>
        </div>
      </main>
    `;

  html = html.replace(
    /<div\s+id="root">[\s\S]*?<\/div>/i,
    `<div id="root">${renderedRootHtmlOverride || fallback404Body}</div>`
  );
  return html;
}

export function render503HtmlFromTemplate(
  baseTemplate: string,
  dataset: LiveSeoDataset
): string {
  const baseUrl = getCanonicalBaseUrl();
  const logoUrl = resolveAbsoluteImageUrl(dataset.siteConfig?.images?.logo, baseUrl);
  const phone = dataset.siteConfig?.business?.phone || BUSINESS_CONFIG.phone;
  const displayPhone = dataset.siteConfig?.business?.displayPhone || BUSINESS_CONFIG.displayPhone;

  let html = baseTemplate.replace(
    /<title>.*?<\/title>/i,
    '<title>503 — Temporarily Unavailable | SUNVILOZ CLEAN CARE</title>'
  );
  html = html.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    '<meta name="description" content="This page is temporarily unavailable while reconnecting to the content database. Please retry shortly." />'
  );
  html = html.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, '');
  html = html.replace('</head>', '  <meta name="robots" content="noindex, nofollow" />\n</head>');

  const fallback503Body = `
      <main style="max-width: 720px; margin: 4rem auto; padding: 2rem; text-align: center; font-family: sans-serif;">
        <img src="${escapeAttr(logoUrl)}" alt="SUNVILOZ CLEAN CARE" style="height: 48px; margin: 0 auto 1rem;" />
        <h1 style="font-size: 1.85rem; color: #123047;">সাময়িক সংযোগ ত্রুটি (503 — Service Temporarily Unavailable)</h1>
        <p style="color: #475569; margin: 1rem 0 2rem; line-height: 1.6;">
          সার্ভারের ডেটাবেজ সংযোগে সাময়িক সমস্যা হওয়ায় এই মুহূর্তে পৃষ্ঠাটি লোড করা যাচ্ছে না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <a href="/" style="background: #123047; color: #fff; padding: 0.75rem 1.5rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold;">হোমপেজে যান</a>
          <a href="tel:${escapeAttr(phone)}" style="background: #0D9488; color: #fff; padding: 0.75rem 1.5rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold;">কল করুন: ${escapeAttr(displayPhone)}</a>
        </div>
      </main>
    `;

  html = html.replace(/<div\s+id="root">[\s\S]*?<\/div>/i, `<div id="root">${fallback503Body}</div>`);
  return html;
}
