import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App, { SsrPageComponents } from '../src/App';
import { BUSINESS_CONFIG, SERVICES_DATA } from '../src/data/config';
import { LOCATIONS_DATA } from '../src/data/locationsData';
import { DEFAULT_GOOGLE_CONFIG } from '../src/config/siteDomain';
import { WATER_TANK_ARTICLES } from '../src/data/waterTankArticles';
import { fetchCentralImageRegistry, DEFAULT_IMAGE_REGISTRY } from '../src/services/imageSyncService';
import { getHomepageSectionsWithRevision } from '../src/services/homepageCmsService';
import { PUBLISHED_HOMEPAGE_REVISION } from '../src/data/publishedHomepageSnapshot';

// Synchronous page imports specifically for Node SSR prerendering (bypasses Suspense)
import { AboutPage } from '../src/pages/AboutPage';
import { ServicesPage } from '../src/pages/ServicesPage';
import { WaterTankCleaningPage } from '../src/pages/WaterTankCleaningPage';
import { PipelineCleaningPage } from '../src/pages/PipelineCleaningPage';
import { ContactPage } from '../src/pages/ContactPage';
import { ServiceAreaPage } from '../src/pages/ServiceAreaPage';
import { LocationDetailPage } from '../src/pages/LocationDetailPage';
import { BlogPage } from '../src/pages/BlogPage';
import { BlogPostDetailPage } from '../src/pages/BlogPostDetailPage';
import { PortfolioPage } from '../src/pages/PortfolioPage';
import { TermsPage } from '../src/pages/TermsPage';
import { PrivacyPolicyPage } from '../src/pages/PrivacyPolicyPage';
import { FaqPage } from '../src/pages/FaqPage';
import { ServiceDetailPage } from '../src/pages/ServiceDetailPage';
import { GetQuotePage } from '../src/pages/GetQuotePage';
import { NotFoundPage } from '../src/pages/NotFoundPage';

const ssrComponents: SsrPageComponents = {
  AboutPage,
  ServicesPage,
  WaterTankCleaningPage,
  PipelineCleaningPage,
  ContactPage,
  ServiceAreaPage,
  LocationDetailPage,
  BlogPage,
  BlogPostDetailPage,
  PortfolioPage,
  TermsPage,
  PrivacyPolicyPage,
  FaqPage,
  ServiceDetailPage,
  GetQuotePage,
  NotFoundPage
};

interface PrerenderRoute {
  path: string;
  title: string;
  description: string;
  h1: string;
  summary: string;
  features?: string[];
  processSteps?: string[];
  faqs?: { question: string; answer: string }[];
  breadcrumbs: { name: string; path: string }[];
  serviceType?: string;
  articleMeta?: {
    publishedAt: string;
    imageUrl?: string;
    category?: string;
    readTime?: string;
    content?: string;
  };
  priority: number;
}

const BASE_URL = 'https://sunvilozcleancare.com';
const PHONE = BUSINESS_CONFIG.phone;
const DISPLAY_PHONE = BUSINESS_CONFIG.displayPhone;
const WHATSAPP_URL = BUSINESS_CONFIG.whatsappUrl;
const LOGO_URL = 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/branding/sunviloz-logo-official.png';
const POSTER_URL = 'https://img.youtube.com/vi/vaVkY5afSSE/hqdefault.jpg';
const GOOGLE_PROFILE_URL = DEFAULT_GOOGLE_CONFIG.businessProfileUrl;

const routes: PrerenderRoute[] = [
  // 1. Homepage
  {
    path: '/',
    title: 'Water Tank Cleaner & Cleaning Service in Dhaka | SUNVILOZ CLEAN CARE',
    description: 'Professional water tank cleaner & water tank cleaning service in Dhaka. Overhead, underground reserve tank and water pipeline cleaning. Contact SUNVILOZ CLEAN CARE: 01609999612.',
    h1: 'Water Tank Cleaner & Cleaning Service in Dhaka — পেশাদার পানির ট্যাংক ও পাইপলাইন ক্লিনিং সার্ভিস',
    summary: 'ঢাকা, গাজীপুর, সাভার এবং নারায়ণগঞ্জে আবাসিক বাসা, অ্যাপার্টমেন্ট ও বাণিজ্যিক ভবনের ছাদের ওভারহেড ট্যাংক, ভূগর্ভস্থ রিজার্ভার এবং পানির পাইপলাইন আধুনিক মেকানাইজড রোটারি ওয়াটার জেটে পরিষ্কার ও খাদ্য-বান্ধব স্যানিটাইজিং সেবা। অভিজ্ঞ পেশাদার ওয়াটার ট্যাংক ক্লিনার (Professional Water Tank Cleaner in Dhaka) টিম।',
    features: [
      'অভিজ্ঞ প্রফেশনাল ওয়াটার ট্যাংক ক্লিনার (Professional Water Tank Cleaner) দ্বারা কাজ পরিচালনা',
      'হাই-প্রেসার মেকানাইজড রোটারি ওয়াটার জেটে গভীর শ্যাওলা ও ময়লা নিস্কাশন',
      'সাবমারসিবল পাম্প ও ইন্ডাস্ট্রিয়াল স্লাজ সেচে তলদেশের বালু-কাদা অপসারণ',
      'দেয়াল বা টাইলস না ভেঙে হাইড্রো-পালস ওয়াটার পাইপলাইন ফ্লাশিং',
      'খাদ্য-বান্ধব অনুমোদিত নন-টক্সিক জীবাণুনাশক প্রয়োগে স্বাস্থ্যসম্মত পানি সংরক্ষণ',
      'উত্তরা, গুলশান, বনানী, মিরপুর, ধানমন্ডি, বসুন্ধরা সহ ঢাকা শহরের সব এলাকায় দৈনিক টিম সক্রিয়'
    ],
    faqs: [
      {
        question: 'How often should water tanks be cleaned in Dhaka?',
        answer: 'Due to municipal water sedimentation and heat, overhead and underground reserve water tanks in Dhaka should be deep cleaned every 4 to 6 months by a professional water tank cleaner.'
      },
      {
        question: 'How long does water tank cleaning take?',
        answer: 'Standard 1,000 to 3,000-liter rooftop tanks take 2 to 3 hours. Large residential or commercial underground reserve tanks take approximately 3 to 5 hours.'
      },
      {
        question: 'How is the water tank cleaning price calculated?',
        answer: 'Pricing depends on tank type (overhead PVC/RCC or underground reserve), storage capacity in liters, accessibility, and sediment volume. Overhead tanks start from BDT 1,200.'
      },
      {
        question: 'What cleaning technology and disinfectants are used?',
        answer: 'We use modern high-pressure rotary jet washers, submersible sludge extraction pumps, and certified food-grade non-toxic water tank sanitizers.'
      },
      {
        question: 'Do you need to break walls or tiles for water pipeline cleaning?',
        answer: 'No. Our specialized hydro-pulse pressurized flushing machine connects directly to existing faucet connections, flushing all internal rust and sludge without any wall damage.'
      },
      {
        question: 'Will pipeline cleaning eliminate iron, rust, and foul tap odor?',
        answer: 'Yes. Heavy iron oxidation, mineral scales, rust, and bio-slime inside pipes are dislodged and thoroughly flushed out, restoring clear water flow.'
      }
    ],
    breadcrumbs: [{ name: 'Home', path: '/' }],
    priority: 1.0
  },

  // 2. Core Service: Water Tank Cleaning (Both / Main)
  {
    path: '/services/water-tank-cleaning',
    title: 'Professional Water Tank Cleaner & Cleaning in Dhaka | SUNVILOZ CLEAN CARE',
    description: 'Expert water tank cleaner in Dhaka for rooftop overhead & underground reserve tanks. Safe mechanized cleaning, sludge extraction & food-grade sanitization. 01609999612.',
    h1: 'ঢাকায় পেশাদার পানির ট্যাংক পরিষ্কার সার্ভিস (Professional Water Tank Cleaner in Dhaka)',
    summary: 'বাসাবাড়ি, অ্যাপার্টমেন্ট ও বাণিজ্যিক ভবনের ছাদের ওভারহেড (PVC / RCC) এবং ভূগর্ভস্থ আন্ডারগ্রাউন্ড পানির ট্যাংক পরিষ্কারে সানভিলোজ ক্লিন কেয়ারের মেকানাইজড স্লাজ নিষ্কাশন ও হাই-প্রেসার রোটারি জেট ওয়াশ প্রযুক্তি। আপনার এলাকায় সেরা ওয়াটার ট্যাংক ক্লিনার সার্ভিস।',
    features: [
      'অভিজ্ঞ প্রফেশনাল ওয়াটার ট্যাংক ক্লিনার (Professional Water Tank Cleaner)',
      'কোনো ক্ষতিকর এসিড ছাড়াই হাই-প্রেসার ওয়াটার জেটে সুশৃঙ্খল পরিষ্কার',
      'তলদেশের ভারী কাদা ও দেয়ালের শক্ত শ্যাওলা কার্যকর দূরীকরণ',
      'ফুড-গ্রেড জীবাণুনাশক প্রয়োগে স্বাস্থ্যসম্মত পরিচ্ছন্ন পানি সংরক্ষণ',
      'পেশাদার ও প্রশিক্ষিত টেকনিশিয়ান দ্বারা সুচারু বাস্তবায়ন'
    ],
    faqs: [
      {
        question: 'পানির ট্যাংক কত দিন পরপর পরিষ্কার করা উচিত?',
        answer: 'স্বাস্থ্যসম্মত ব্যবহারের জন্য প্রতি ৬ মাস অন্তর (বছরে অন্তত দুই বার) ছাদের ওভারহেড ট্যাংক এবং আন্ডারগ্রাউন্ড রিজার্ভার অভিজ্ঞ ওয়াটার ট্যাংক ক্লিনার দিয়ে ডিপ ক্লিন করা বিশ্ব স্বাস্থ্য মানদণ্ড অনুযায়ী সুপারিশকৃত।'
      },
      {
        question: 'পানির ট্যাংক পরিষ্কার করতে কত সময় লাগে?',
        answer: 'ট্যাংকের ধারণক্ষমতা এবং ময়লার স্তরের ওপর সময় নির্ভর করে। সাধারণ ১,০০০–৩,০০০ লিটার ওভারহেড ট্যাংকে ২ থেকে ৩ ঘণ্টা এবং বড় ভূগর্ভস্থ রিজার্ভারে ৩ থেকে ৫ ঘণ্টা সময় লাগে।'
      },
      {
        question: 'পানির ট্যাংক পরিষ্কারের খরচ কীভাবে নির্ধারণ করা হয়?',
        answer: 'ট্যাংকের ধরন (পিভিসি, আরসিসি বা আন্ডারগ্রাউন্ড), ধারণক্ষমতা (লিটার বা গ্যালন) এবং প্রবেশগম্যতা যাচাই করে স্বচ্ছ কোটেশন দেওয়া হয়।'
      }
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: 'Water Tank Cleaning', path: '/services/water-tank-cleaning' }
    ],
    serviceType: 'Water Tank Cleaning',
    priority: 0.95
  },

  // 3. Core Service: Pipeline Cleaning
  {
    path: '/services/pipeline-cleaning',
    title: 'Water Pipeline Cleaning Service in Dhaka | SUNVILOZ CLEAN CARE',
    description: 'Professional water pipeline cleaning service in Dhaka. Non-invasive hydro-pulse flushing to clear rust, iron, and foul tap odor without wall damage. 01609999612.',
    h1: 'পেশাদার পানির পাইপলাইন পরিষ্কার ও ফ্লাশিং সার্ভিস (Water Pipeline Cleaning)',
    summary: 'বাসা ও বাণিজ্যিক ভবনের পানির পাইপলাইনে জমে থাকা আয়রন, মরিচা ও ক্ষতিকর স্লাগ দেয়াল বা টাইলস অক্ষত রেখে আধুনিক হাইড্রো-পালস প্রেসারাইজড পদ্ধতিতে অপসারণ।',
    features: [
      'কলের পানিতে আয়রন ও দুর্গন্ধ কার্যকরভাবে দূর করে',
      'কোনো দেয়াল বা টাইলস না ভেঙে সম্পূর্ণ কাজ সম্পন্ন',
      'শাওয়ার ও ট্যাপের পানির আসল স্পিড ফিরে আসে',
      'সিপিভিসি, পিপিআর, পিভিসি ও জিআই পাইপের জন্য বিশেষভাবে নিরাপদ'
    ],
    faqs: [
      {
        question: 'পাইপলাইন পরিষ্কার করতে দেয়াল বা টাইলস কি ভাঙতে হয়?',
        answer: 'না, একদমই কোনো ভাঙচুর করতে হয় না। আমাদের আধুনিক হাইড্রো-পালস প্রযুক্তি ট্যাপের মুখ থেকে সরাসরি লাইনের ভেতর কাজ করে।'
      },
      {
        question: 'পাইপলাইন ফ্লাশিংয়ে কত সময় লাগে?',
        answer: 'একটি সাধারণ ৩-৪ বাথরুমের আবাসিক ফ্ল্যাটের সম্পূর্ণ পাইপলাইন ফ্লাশিং করতে ২ থেকে ৩ ঘণ্টার মতো সময় প্রয়োজন হয়।'
      }
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: 'Pipeline Cleaning', path: '/services/pipeline-cleaning' }
    ],
    serviceType: 'Water Pipeline Cleaning',
    priority: 0.9
  },

  // 4. Overhead Tank Cleaning
  {
    path: '/services/overhead-tank-cleaning',
    title: 'Overhead Water Tank Cleaner & Cleaning Dhaka | SUNVILOZ CLEAN CARE',
    description: 'High-pressure mechanized rooftop overhead water tank cleaner in Dhaka. Algae scrubbing, safe disinfection for PVC & concrete RCC tanks. 01609999612.',
    h1: 'ওভারহেড ও ছাদের পানির ট্যাংক পরিষ্কার সার্ভিস (Overhead Tank Cleaning)',
    summary: 'ছাদের পিভিসি ও আরসিসি কংক্রিট ওভারহেড ট্যাংক উচ্চচাপের রোটারি ওয়াটার জেটে শ্যাওলা, কাদা ও বায়ুবাহিত ধুলোবালি মুক্তকরণ। দক্ষ ওভারহেড ওয়াটার ট্যাংক ক্লিনার টিম।',
    features: [
      'ছাদের রোদজনিত শ্যাওলা ও ব্যাকটেরিয়াল স্লাইম কার্যকর পরিষ্কার',
      'ট্যাংকের তলদেশের শক্ত বালু ও ময়লা নিষ্কাশন',
      'খাদ্য-বান্ধব গন্ধহীন জীবাণুনাশক ওয়াশ',
      'ক্লিনিংয়ের পরপরই ফ্রেশ পানি ভর্তি করে ব্যবহারের নিশ্চয়তা'
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: 'Overhead Tank Cleaning', path: '/services/overhead-tank-cleaning' }
    ],
    serviceType: 'Overhead Water Tank Cleaning',
    priority: 0.9
  },

  // 5. Underground Water Tank Cleaning
  {
    path: '/services/underground-water-tank-cleaning',
    title: 'Underground Reserve Water Tank Cleaner Dhaka | SUNVILOZ CLEAN CARE',
    description: 'Industrial sludge extraction & professional water tank cleaner for subterranean concrete reserve tanks in Dhaka buildings. 01609999612.',
    h1: 'আন্ডারগ্রাউন্ড ও রিজার্ভ পানির ট্যাংক পরিষ্কার সার্ভিস (Underground Tank Cleaning)',
    summary: 'ভূগর্ভস্থ আরসিসি রিজার্ভারের তলদেশের ভারী ওয়াসা কাদা, স্লাজ ও দুর্গন্ধ সম্পূর্ণ ভ্যাকুমিং, রোটারি প্রেশার ওয়াশ ও জীবাণুমুক্তকরণ। অভিজ্ঞ আন্ডারগ্রাউন্ড ওয়াটার ট্যাংক ক্লিনার সার্ভিস।',
    features: [
      'হেভি স্লাজ পাম্পে গভীর কাদা ও নোংরা পানি দ্রুত নিস্কাশন',
      'কনফাইন্ড স্পেস নিরাপত্তা প্রটোকল ও ফ্রেশ এয়ার ব্লোয়ার ব্যবহার',
      '৫,০০০ থেকে ৫০,০০০+ লিটার বড় রিজার্ভার সফলভাবে পরিষ্কারের সক্ষমতা',
      'ছাদের মোটরে কাদা যাওয়া বন্ধ করে মোটর ও পাইপের দীর্ঘস্থায়িত্ব নিশ্চিতকরণ'
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: 'Underground Tank Cleaning', path: '/services/underground-water-tank-cleaning' }
    ],
    serviceType: 'Underground Water Tank Cleaning',
    priority: 0.9
  },

  // 6. Pricing & Quotation Page
  {
    path: '/get-quote',
    title: 'Water Tank Cleaning Price in Dhaka | SUNVILOZ CLEAN CARE',
    description: 'Calculate estimated water tank cleaning and pipeline descaling costs in Dhaka. Transparent pricing starting from BDT 1,200 with instant WhatsApp booking: 01609999612.',
    h1: 'পানির ট্যাংক পরিষ্কারের খরচ ও ইনস্ট্যান্ট ফ্রি কোটেশন',
    summary: 'আপনার ওভারহেড বা আন্ডারগ্রাউন্ড ট্যাংকের সাইজ অনুযায়ী আনুমানিক খরচ জানুন এবং সরাসরি হোয়াটসঅ্যাপে বুকিং নিশ্চিত করুন।',
    features: [
      'ওভারহেড পিভিসি ট্যাংক শুরু মাত্র ৳ ১,২০০ থেকে',
      'আন্ডারগ্রাউন্ড রিজার্ভার ট্যাংক শুরু মাত্র ৳ ২,৫০০ থেকে',
      'পাইপলাইন ফ্লাশিং শুরু মাত্র ৳ ১,৫০০ থেকে',
      'একসাথে একাধিক ট্যাংক ও ভবনের জন্য সাশ্রয়ী প্যাকেজ'
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Get Quote', path: '/get-quote' }
    ],
    priority: 0.95
  },

  // 7. Service Areas Hub
  {
    path: '/service-areas',
    title: 'Water Tank Cleaning Service Areas in Dhaka | SUNVILOZ CLEAN CARE',
    description: 'Water tank and pipeline cleaning coverage across all Dhaka locations: Gulshan, Banani, Uttara, Dhanmondi, Bashundhara, Mirpur, Mohammadpur, Gazipur, Savar, Narayanganj. 01609999612.',
    h1: 'ঢাকা ও সংলগ্ন এলাকায় আমাদের সার্ভিস এরিয়া ও কভারেজ',
    summary: 'ঢাকা শহরের উত্তর, দক্ষিণ, মধ্য অঞ্চল ছাড়াও গাজীপুর, সাভার এবং নারায়ণগঞ্জে আমাদের মোবাইল ক্লিনিং ভ্যান ও দক্ষ টেকনিশিয়ান টিম প্রতিদিন সেবা প্রদান করছে।',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Service Areas', path: '/service-areas' }
    ],
    priority: 0.9
  },

  // 8. Services Catalog
  {
    path: '/services',
    title: 'Water Tank & Pipeline Cleaning Services in Dhaka | SUNVILOZ CLEAN CARE',
    description: 'Comprehensive water tank cleaning services including underground reservoir deep wash, rooftop overhead tank sanitization, and pipeline descaling in Dhaka. 01609999612.',
    h1: 'সানভিলোজ ক্লিন কেয়ারের বিশেষায়িত পরিচ্ছন্নতা সেবাসমূহ',
    summary: 'আবাসিক অ্যাপার্টমেন্ট, করপোরেট অফিস, হোটেল এবং শিল্প প্রতিষ্ঠানের জন্য নিরাপদ ও স্বাস্থ্যসম্মত পানির ট্যাংক ও পাইপলাইন ক্লিনিং সল্যুশন।',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' }
    ],
    priority: 0.9
  },

  // 9. About Page
  {
    path: '/about',
    title: 'About Us | SUNVILOZ CLEAN CARE — Professional Cleaning Service Dhaka',
    description: 'Learn about SUNVILOZ CLEAN CARE, established in 2020 in Dhaka. Specializing in mechanized water tank and pipeline cleaning with transparent quotations. 01609999612.',
    h1: 'আমাদের সম্পর্কে — SUNVILOZ CLEAN CARE',
    summary: '২০২০ সাল থেকে ঢাকায় পানির ট্যাংক ও পাইপলাইন পরিষ্কারে নির্ভরযোগ্য, নিরাপদ ও আধুনিক মেকানাইজড প্রযুক্তি নিয়ে আমরা কাজ করছি।',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'About Us', path: '/about' }
    ],
    priority: 0.8
  },

  // 10. Contact Page
  {
    path: '/contact',
    title: 'Contact Us | SUNVILOZ CLEAN CARE — Hotline 01609999612',
    description: 'Contact SUNVILOZ CLEAN CARE for water tank and pipeline cleaning in Dhaka. Call 01609999612 or WhatsApp for instant service booking and quick response.',
    h1: 'আমাদের সাথে সরাসরি যোগাযোগ করুন (Contact & Hotline)',
    summary: 'যেকোনো অনুসন্ধান, শিডিউল বুকিং বা জরুরি সাইট পরিদর্শনের জন্য আমাদের ২৪/৭ সাপোর্ট নম্বরে কল অথবা হোয়াটসঅ্যাপ করুন।',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact' }
    ],
    priority: 0.8
  },

  // 11. FAQ Page
  {
    path: '/faq',
    title: 'Frequently Asked Questions (FAQ) | SUNVILOZ CLEAN CARE',
    description: 'Comprehensive answers to common questions about water tank cleaning costs, process, time needed, chemicals used, and pipeline flushing in Dhaka. 01609999612.',
    h1: 'পানির ট্যাংক ও পাইপলাইন ক্লিনিং সংক্রান্ত সাধারণ জিজ্ঞাসা (FAQ)',
    summary: 'ক্লিনিংয়ের সময়সূচি, খরচ, ব্যবহৃত যন্ত্রপাতি, রাসায়নিক নিরাপত্তা ও প্রস্তুতি সম্পর্কে গ্রাহকদের সচরাচর করা প্রশ্নের উত্তর।',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'FAQ', path: '/faq' }
    ],
    priority: 0.6
  }
];

// Add all 15 location routes dynamically from LOCATIONS_DATA
for (const loc of LOCATIONS_DATA) {
  const baseTitle = loc.title || `Water Tank Cleaning Service in ${loc.areaName}`;
  const cleanTitle = baseTitle.replace(/ \| Sunviloz Clean Care/i, '').replace(/ \| SUNVILOZ CLEAN CARE/i, '');
  routes.push({
    path: `/service-areas/${loc.slug}`,
    title: `${cleanTitle} & Water Tank Cleaner | SUNVILOZ CLEAN CARE`,
    description: loc.metaDesc ? `${loc.metaDesc} Professional water tank cleaner in ${loc.areaName}, Dhaka. 01609999612.` : `Professional water tank cleaner & water tank cleaning service in ${loc.areaName}, Dhaka. Call 01609999612.`,
    h1: `${loc.titleBn || `${loc.areaName} এলাকায় পেশাদার পানির ট্যাংক পরিষ্কার সার্ভিস`}`,
    summary: loc.introBn || loc.intro || `${loc.areaName} এলাকায় আমাদের দক্ষ ওয়াটার ট্যাংক ক্লিনার টিম প্রতিদিন আন্ডারগ্রাউন্ড ও ওভারহেড ট্যাংক আধুনিক প্রযুক্তিতে পরিষ্কার করে।`,
    features: [
      `${loc.areaName}-এর জন্য দ্রুত টিম ডিসপ্যাচ ও শিডিউলিং`,
      'উচ্চচাপের মেকানাইজড রোটারি ওয়াটার জেট ওয়াশ',
      'তলদেশের ওয়াসা পলি ও আয়রন স্লাজ অপসারণ',
      'ফুড-গ্রেড অনুমোদিত নিরাপদ স্যানিটাইজার'
    ],
    faqs: loc.faqs ? loc.faqs.map(f => ({ question: f.question, answer: f.answer })) : undefined,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Service Areas', path: '/service-areas' },
      { name: loc.areaName, path: `/service-areas/${loc.slug}` }
    ],
    serviceType: `Water Tank Cleaning in ${loc.areaName}`,
    priority: 0.85
  });
}

// Also ensure alias routes are pre-rendered
routes.push({
  path: '/services/overhead-water-tank-cleaning',
  title: 'Overhead Water Tank Cleaning Dhaka | SUNVILOZ CLEAN CARE',
  description: 'High-pressure mechanized rooftop overhead water tank cleaning in Dhaka. Algae scrubbing, safe disinfection for PVC & concrete RCC tanks. 01609999612.',
  h1: 'ওভারহেড ও ছাদের পানির ট্যাংক পরিষ্কার সার্ভিস',
  summary: 'ছাদের পিভিসি ও আরসিসি কংক্রিট ওভারহেড ট্যাংক উচ্চচাপের রোটারি ওয়াটার জেটে শ্যাওলা ও ময়লামুক্তকরণ।',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Overhead Tank Cleaning', path: '/services/overhead-water-tank-cleaning' }
  ],
  serviceType: 'Overhead Water Tank Cleaning',
  priority: 0.85
});

routes.push({
  path: '/services/water-pipeline-cleaning',
  title: 'Water Pipeline Cleaning Service in Dhaka | SUNVILOZ CLEAN CARE',
  description: 'Professional water pipeline cleaning service in Dhaka. Non-invasive hydro-pulse flushing to clear rust, iron, and foul tap odor without wall damage. 01609999612.',
  h1: 'পেশাদার পানির পাইপলাইন পরিষ্কার ও ফ্লাশিং সার্ভিস',
  summary: 'বাসা ও বাণিজ্যিক ভবনের পানির পাইপলাইনে জমে থাকা আয়রন, মরিচা ও ক্ষতিকর স্লাগ দেয়াল বা টাইলস অক্ষত রেখে আধুনিক হাইড্রো-পালস প্রেসারাইজড পদ্ধতিতে অপসারণ।',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Pipeline Cleaning', path: '/services/water-pipeline-cleaning' }
  ],
  serviceType: 'Water Pipeline Cleaning',
  priority: 0.85
});

// Blog index route
routes.push({
  path: '/blog',
  title: 'পানির ট্যাংক পরিষ্কার ও রক্ষণাবেক্ষণ গাইড | Tips & Blog | SUNVILOZ CLEAN CARE',
  description: 'পানির ট্যাংক ও পাইপলাইন পরিষ্কারের নিয়ম, সতর্কতা, খরচ ও স্বাস্থ্যবিধি সম্পর্কিত প্রয়োজনীয় তথ্য ও পরামর্শ। SUNVILOZ CLEAN CARE: 01609999612.',
  h1: 'পানির ট্যাংক ও পাইপলাইন পরিষ্কারের দরকারি পরামর্শ ও গাইড',
  summary: 'বাসা ও অ্যাপার্টমেন্টের রিজার্ভার ও ওভারহেড ট্যাংক স্বাস্থ্যসম্মত রাখতে অভিজ্ঞ টেকনিশিয়ানদের পরামর্শ ও ঢাকা শহরের জন্য বাস্তবমুখী সমাধান।',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Tips & Guides', path: '/blog' }
  ],
  priority: 0.8
});

// Add all 10 authoritative water tank SEO articles dynamically
for (const article of WATER_TANK_ARTICLES) {
  routes.push({
    path: `/blog/${article.slug}`,
    title: `${article.title} | SUNVILOZ CLEAN CARE`,
    description: article.excerpt,
    h1: article.title,
    summary: article.excerpt,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Tips & Guides', path: '/blog' },
      { name: article.title, path: `/blog/${article.slug}` }
    ],
    articleMeta: {
      publishedAt: article.publishedAt,
      imageUrl: article.imageUrl,
      category: article.category,
      readTime: article.readTime,
      content: article.content
    },
    priority: 0.75
  });
}

function renderCrawlableBody(route: PrerenderRoute): string {
  const isHome = route.path === '/';
  
  return `
    <header style="padding: 1rem 1.5rem; border-bottom: 1px solid #E2E8F0; background: #123047;">
      <nav style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <a href="/" style="color: #38BDF8; font-weight: 900; text-decoration: none; font-size: 1.35rem; display: flex; align-items: center; gap: 0.5rem;">
          <img src="${LOGO_URL}" alt="SUNVILOZ CLEAN CARE Logo" style="height: 38px; width: auto;" />
          <span>SUNVILOZ CLEAN CARE</span>
        </a>
        <div style="display: flex; gap: 1.25rem; align-items: center; flex-wrap: wrap;">
          <a href="/services/water-tank-cleaning" style="color: #E2E8F0; text-decoration: none; font-size: 0.9rem;">Water Tank Cleaning</a>
          <a href="/services/pipeline-cleaning" style="color: #E2E8F0; text-decoration: none; font-size: 0.9rem;">Pipeline Cleaning</a>
          <a href="/service-areas" style="color: #E2E8F0; text-decoration: none; font-size: 0.9rem;">Service Areas</a>
          <a href="/get-quote" style="color: #38BDF8; font-weight: bold; text-decoration: none; font-size: 0.9rem;">Get Quote</a>
        </div>
      </nav>
    </header>

    <main id="main-content" style="max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #172B3A;">
      ${!isHome ? `
        <nav aria-label="Breadcrumb" style="margin-bottom: 1.5rem; font-size: 0.85rem; color: #64748B;">
          ${route.breadcrumbs.map((bc, idx) => `
            ${idx > 0 ? ' <span style="margin: 0 0.4rem; color: #CBD5E1;">/</span> ' : ''}
            <a href="${bc.path}" style="color: ${idx === route.breadcrumbs.length - 1 ? '#0D9488' : '#64748B'}; text-decoration: none; font-weight: ${idx === route.breadcrumbs.length - 1 ? 'bold' : 'normal'};">${bc.name}</a>
          `).join('')}
        </nav>
      ` : ''}

      <div style="margin-bottom: 2rem;">
        <h1 style="font-size: 2.25rem; font-weight: 900; color: #123047; line-height: 1.25; margin-bottom: 1rem;">
          ${route.h1}
        </h1>
        <p style="font-size: 1.125rem; color: #475569; max-width: 850px; line-height: 1.7; margin-bottom: 1.75rem;">
          ${route.summary}
        </p>

        <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; margin-bottom: 2.5rem;">
          <a href="tel:${PHONE}" style="display: inline-flex; align-items: center; gap: 0.5rem; background: #123047; color: #FFFFFF; padding: 0.85rem 1.75rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold; font-size: 0.95rem;">
            <span>কল করুন: ${DISPLAY_PHONE}</span>
          </a>
          <a href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.5rem; background: #25D366; color: #FFFFFF; padding: 0.85rem 1.75rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold; font-size: 0.95rem;">
            <span>WhatsApp: ${PHONE}</span>
          </a>
          <a href="/get-quote" style="display: inline-flex; align-items: center; gap: 0.5rem; background: #0D9488; color: #FFFFFF; padding: 0.85rem 1.75rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold; font-size: 0.95rem;">
            <span>ফ্রি কোটেশন নিন</span>
          </a>
        </div>
      </div>

      ${route.articleMeta?.content ? `
        <article style="background: #FFFFFF; padding: 2rem; border-radius: 1rem; border: 1px solid #E2E8F0; margin-bottom: 3rem; line-height: 1.8; color: #334155;">
          ${route.articleMeta.imageUrl ? `
            <img src="${route.articleMeta.imageUrl}" alt="${route.h1}" style="width: 100%; max-height: 420px; object-fit: cover; border-radius: 0.75rem; margin-bottom: 1.75rem;" />
          ` : ''}
          <div style="font-size: 1rem; line-height: 1.8;">
            ${route.articleMeta.content
              .replace(/## (.*)/g, '<h2 style="color: #123047; font-size: 1.4rem; font-weight: 800; margin-top: 1.75rem; margin-bottom: 0.75rem;">$1</h2>')
              .replace(/### (.*)/g, '<h3 style="color: #123047; font-size: 1.2rem; font-weight: 700; margin-top: 1.25rem; margin-bottom: 0.5rem;">$1</h3>')
              .replace(/\n\n/g, '<br/><br/>')}
          </div>
        </article>
      ` : ''}

      ${route.features && route.features.length > 0 ? `
        <section style="margin-bottom: 3rem; background: #FFFFFF; padding: 2rem; border-radius: 1rem; border: 1px solid #E2E8F0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <h2 style="font-size: 1.5rem; font-weight: 800; color: #123047; margin-bottom: 1.25rem;">
            প্রধান বৈশিষ্ট্য ও সেবার সুবিধা (Service Highlights)
          </h2>
          <ul style="list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
            ${route.features.map(feat => `
              <li style="display: flex; align-items: flex-start; gap: 0.75rem; color: #334155; font-size: 0.95rem; line-height: 1.5;">
                <span style="color: #0D9488; font-weight: bold; font-size: 1.2rem; line-height: 1;">✓</span>
                <span>${feat}</span>
              </li>
            `).join('')}
          </ul>
        </section>
      ` : ''}

      ${route.faqs && route.faqs.length > 0 ? `
        <section style="margin-bottom: 3rem;">
          <h2 style="font-size: 1.5rem; font-weight: 800; color: #123047; margin-bottom: 1.25rem;">
            সচরাচর জিজ্ঞাসিত প্রশ্ন ও উত্তর (Frequently Asked Questions)
          </h2>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${route.faqs.map(faq => `
              <article style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
                <h3 style="font-size: 1.05rem; font-weight: 700; color: #123047; margin-top: 0; margin-bottom: 0.5rem;">
                  ${faq.question}
                </h3>
                <p style="color: #64748B; font-size: 0.95rem; line-height: 1.6; margin: 0;">
                  ${faq.answer}
                </p>
              </article>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <section style="margin-top: 3.5rem; padding-top: 2rem; border-top: 1px solid #E2E8F0;">
        <h2 style="font-size: 1.35rem; font-weight: 800; color: #123047; margin-bottom: 1rem;">
          ঢাকা ও আশেপাশের প্রধান সার্ভিস এরিয়াসমূহ
        </h2>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${['Uttara', 'Gulshan', 'Banani', 'Mirpur', 'Bashundhara', 'Badda', 'Dhanmondi', 'Mohammadpur', 'Baridhara', 'Khilkhet', 'Gazipur', 'Savar', 'Narayanganj'].map(area => `
            <a href="/service-areas/${area.toLowerCase()}" style="display: inline-block; padding: 0.4rem 0.85rem; background: #F1F5F9; color: #123047; border-radius: 9999px; text-decoration: none; font-size: 0.85rem; font-weight: 600;">
              ${area}
            </a>
          `).join('')}
        </div>
      </section>
    </main>

    <footer style="background: #123047; color: #CBD5E1; padding: 2rem 1.5rem; font-size: 0.85rem; margin-top: 4rem;">
      <div style="max-w: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <strong style="color: #FFFFFF;">SUNVILOZ CLEAN CARE</strong> — Professional Water Tank & Pipeline Cleaning Service in Dhaka
        </div>
        <div>
          হটলাইন: <a href="tel:${PHONE}" style="color: #38BDF8; text-decoration: none; font-weight: bold;">${DISPLAY_PHONE}</a> | WhatsApp: <a href="${WHATSAPP_URL}" style="color: #25D366; text-decoration: none; font-weight: bold;">${PHONE}</a>
        </div>
      </div>
    </footer>
  `;
}

function generatePrerenderedHtml(baseTemplate: string, route: PrerenderRoute): string {
  const canonicalUrl = `${BASE_URL}${route.path === '/' ? '/' : route.path}`;

  // 1. Title replacement
  let html = baseTemplate.replace(
    /<title>.*?<\/title>/i,
    `<title>${route.title}</title>`
  );

  // 2. Meta description replacement
  html = html.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${route.description.replace(/"/g, '&quot;')}" />`
  );

  // 3. Canonical replacement
  html = html.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  // 4. OpenGraph replacements
  html = html.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${route.title.replace(/"/g, '&quot;')}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${route.description.replace(/"/g, '&quot;')}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );

  const resolvedSocialImage = route.articleMeta?.imageUrl
    ? (route.articleMeta.imageUrl.startsWith('http://') || route.articleMeta.imageUrl.startsWith('https://')
        ? route.articleMeta.imageUrl
        : `${BASE_URL}${route.articleMeta.imageUrl.startsWith('/') ? route.articleMeta.imageUrl : `/${route.articleMeta.imageUrl}`}`)
    : POSTER_URL;

  html = html.replace(
    /<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:image" content="${resolvedSocialImage}" />`
  );

  // 5. Twitter Card replacements
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${route.title.replace(/"/g, '&quot;')}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${route.description.replace(/"/g, '&quot;')}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:image" content="${resolvedSocialImage}" />`
  );

  // 6. JSON-LD structured schemas
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
    name: 'SUNVILOZ CLEAN CARE',
    url: BASE_URL,
    telephone: '+88' + PHONE,
    image: LOGO_URL,
    logo: LOGO_URL,
    description: 'Professional water tank cleaner & water tank cleaning service in Dhaka, Gazipur, Savar and Narayanganj for rooftop overhead tanks, underground reserve tanks, and water pipeline flushing.',
    sameAs: [GOOGLE_PROFILE_URL],
    hasMap: GOOGLE_PROFILE_URL,
    areaServed: [
      'Dhaka', 'Gazipur', 'Savar', 'Narayanganj', 'Uttara', 'Gulshan', 'Banani', 
      'Mirpur', 'Bashundhara', 'Mohammadpur', 'Dhanmondi', 'Badda', 'Baridhara', 
      'Khilkhet', 'Rampura'
    ],
    priceRange: 'BDT 1200 - 15000',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dhaka',
      addressRegion: 'Dhaka Division',
      addressCountry: 'BD'
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '08:00',
      closes: '20:00'
    }
  };

  const schemas: any[] = [localBusinessSchema];

  if (route.breadcrumbs && route.breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: route.breadcrumbs.map((bc, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: bc.name,
        item: `${BASE_URL}${bc.path.startsWith('/') ? bc.path : `/${bc.path}`}`
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
        name: 'SUNVILOZ CLEAN CARE',
        telephone: '+88' + PHONE,
        url: BASE_URL
      },
      areaServed: [
        { '@type': 'City', name: 'Dhaka' },
        { '@type': 'City', name: 'Gazipur' },
        { '@type': 'City', name: 'Savar' },
        { '@type': 'City', name: 'Narayanganj' }
      ]
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
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: route.h1,
      description: route.description,
      image: [resolvedSocialImage],
      author: {
        '@type': 'Organization',
        name: 'SUNVILOZ CLEAN CARE',
        url: BASE_URL
      },
      publisher: {
        '@type': 'Organization',
        name: 'SUNVILOZ CLEAN CARE',
        logo: {
          '@type': 'ImageObject',
          url: LOGO_URL
        }
      },
      datePublished: route.articleMeta.publishedAt,
      dateModified: route.articleMeta.publishedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl
      }
    });
  }

  // Replace default local business script with consolidated page schemas
  const schemasMarkup = schemas.map(s => `\n    <script type="application/ld+json">\n    ${JSON.stringify(s, null, 2).replace(/\n/g, '\n    ')}\n    </script>`).join('\n');
  
  html = html.replace(
    /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
    schemasMarkup
  );

  // 7. Inject genuine React-rendered HTML inside <div id="root">
  let renderedRootHtml = '';
  try {
    renderedRootHtml = renderToString(React.createElement(App, { initialPath: route.path, ssrComponents }));
  } catch (renderError) {
    console.warn(`[SEO Prerender] Warning: React renderToString failed for route ${route.path}, using crawlable fallback:`, renderError);
    renderedRootHtml = renderCrawlableBody(route);
  }

  html = html.replace(
    /<div\s+id="root">[\s\S]*?<\/div>/i,
    `<div id="root">${renderedRootHtml}</div>`
  );

  // 8. Inject authoritative published homepage sections snapshot script and image registry for zero-flash hydration
  const snapshotScripts: string[] = [];
  if (authoritativeHomepageSections && authoritativeHomepageSections.length > 0) {
    snapshotScripts.push(`window.__INITIAL_HOMEPAGE_SECTIONS__ = ${JSON.stringify(authoritativeHomepageSections)}; window.__HOMEPAGE_REVISION__ = ${JSON.stringify(authoritativeHomepageRevision)};`);
  }
  if (authoritativeImageRegistry) {
    snapshotScripts.push(`window.__INITIAL_IMAGE_REGISTRY__ = ${JSON.stringify(authoritativeImageRegistry)};`);
  }

  if (snapshotScripts.length > 0) {
    const snapshotTag = `<script id="__SUNVILOZ_HOMEPAGE_SNAPSHOT__">${snapshotScripts.join(' ')}</script>`;
    if (html.includes('</head>')) {
      html = html.replace('</head>', `  ${snapshotTag}\n</head>`);
    } else {
      html = html.replace(/<script\s+type="module"/i, `${snapshotTag}\n    <script type="module"`);
    }
  }

  return html;
}

let authoritativeHomepageSections: any[] = [];
let authoritativeHomepageRevision: any = PUBLISHED_HOMEPAGE_REVISION;
let authoritativeImageRegistry: any = DEFAULT_IMAGE_REGISTRY;

async function runPrerender() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const templatePath = path.join(distDir, 'index.html');

  if (!fs.existsSync(templatePath)) {
    console.error('Error: dist/index.html not found! Run "vite build" first.');
    process.exit(1);
  }

  const baseTemplate = fs.readFileSync(templatePath, 'utf-8');
  try {
    console.log('[SEO Prerender] Pre-fetching authoritative image registry from Supabase...');
    const liveRegistry = await fetchCentralImageRegistry();
    const serviceImgCount = Object.keys(liveRegistry?.serviceImages || {}).length;
    const siteImgCount = Object.keys(liveRegistry?.siteImages || {}).length;
    if (liveRegistry && (serviceImgCount > 0 || siteImgCount > 0)) {
      authoritativeImageRegistry = liveRegistry;
      console.log(`[SEO Prerender] ✓ Live image registry verified: Revision ${liveRegistry.version || 'authoritative'} (${serviceImgCount} service images, ${siteImgCount} site images).`);
    } else {
      const isProductionBuild = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.STRICT_PRERENDER === 'true';
      const msg = '[SEO Prerender Error] Authoritative image registry could not be verified from Supabase.';
      console.error(msg);
      if (isProductionBuild) {
        throw new Error(`${msg} Aborting production build to prevent deploying unverified images.`);
      }
    }
  } catch (syncErr: any) {
    console.error('[SEO Prerender Error] Failed to fetch authoritative image registry:', syncErr?.message || syncErr);
    const isProductionBuild = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.STRICT_PRERENDER === 'true';
    if (isProductionBuild) {
      process.exit(1);
    }
  }

  // Expose image registry to Node global environment for SSR
  (global as any).__INITIAL_IMAGE_REGISTRY__ = authoritativeImageRegistry;
  (global as any).window = (global as any).window || {};
  (global as any).window.__INITIAL_IMAGE_REGISTRY__ = authoritativeImageRegistry;

  try {
    console.log('[SEO Prerender] Pre-fetching authoritative homepage sections and revision from Supabase...');
    const result = await getHomepageSectionsWithRevision();
    
    const isProductionBuild = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.STRICT_PRERENDER === 'true';

    // Explicit build-time validation: do not silently publish bundled fallback content
    if (result.revision.source === 'database') {
      console.log(`[SEO Prerender] ✓ Live Supabase Database verified: Revision ${result.revision.revisionId} (v${result.revision.version})`);
    } else if (result.revision.source === 'storage_config') {
      console.log(`[SEO Prerender] ✓ Live Supabase Storage config verified: Revision ${result.revision.revisionId} (v${result.revision.version})`);
    } else {
      const msg = `[SEO Prerender Alert] ATTENTION: Live Supabase content could not be reached during build. Source: ${result.revision.source}.`;
      console.warn(msg);
      if (isProductionBuild) {
        throw new Error(`${msg} Aborting production build: live database or storage config verification is mandatory.`);
      }
    }

    authoritativeHomepageSections = result.sections;
    authoritativeHomepageRevision = {
      ...result.revision,
      source: result.revision.source === 'bundled' ? 'bundled_fallback' : 'prerender_snapshot'
    };
    // Expose on Node global for server rendering
    (global as any).__INITIAL_HOMEPAGE_SECTIONS__ = authoritativeHomepageSections;
    (global as any).__HOMEPAGE_REVISION__ = authoritativeHomepageRevision;
    (global as any).window.__INITIAL_HOMEPAGE_SECTIONS__ = authoritativeHomepageSections;
    (global as any).window.__HOMEPAGE_REVISION__ = authoritativeHomepageRevision;
  } catch (secErr: any) {
    console.error('[SEO Prerender Error] Failed during authoritative content pre-fetch:', secErr?.message || secErr);
    const isProductionBuild = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.STRICT_PRERENDER === 'true';
    if (isProductionBuild) {
      process.exit(1);
    }
  }

  console.log(`[SEO Prerender] Starting build-time prerendering for ${routes.length} public routes...`);

  let count = 0;
  for (const route of routes) {
    const pageHtml = generatePrerenderedHtml(baseTemplate, route);
    
    let targetFile: string;
    if (route.path === '/' || route.path === '') {
      targetFile = path.join(distDir, 'index.html');
    } else {
      const cleanPath = route.path.replace(/^\/+/, '');
      const routeDir = path.join(distDir, cleanPath);
      if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
      }
      targetFile = path.join(routeDir, 'index.html');
    }

    fs.writeFileSync(targetFile, pageHtml, 'utf-8');
    count++;
  }

  console.log(`[SEO Prerender] Successfully generated ${count} static prerendered HTML pages in dist/!`);
}

runPrerender();
