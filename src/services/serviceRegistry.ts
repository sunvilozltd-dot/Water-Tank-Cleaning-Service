import { ServiceItem } from '../types';

export interface ServiceFormConfig {
  requiresTankMaterial?: boolean;
  requiresTankCapacity?: boolean;
  requiresPropertyDetails?: boolean;
  requiresPipelineDetails?: boolean;
  supportedMaterials?: ('Plastic' | 'Steel' | 'Concrete')[];
  capacityOptions?: string[];
  allowCustomCapacity?: boolean;
  allowUnknownCapacity?: boolean;
}

export interface ExtensibleServiceItem extends ServiceItem {
  name?: string;
  short_description?: string;
  full_description?: string;
  category?: string;
  icon?: string;
  featured_image?: string;
  gallery_images?: string[];
  is_active: boolean;
  display_order: number;
  show_on_homepage: boolean;
  show_in_navigation: boolean;
  show_in_quote_form: boolean;
  seo_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  formConfig?: ServiceFormConfig;
}

/**
 * Authoritative Initial Service Registry
 * Focuses exclusively on the 3 active services.
 * Discontinued services are marked is_active: false for historical lead reference.
 */
export const AUTHORITATIVE_SERVICES: ExtensibleServiceItem[] = [
  // 1. Overhead Water Tank Cleaning Service
  {
    id: 'srv-overhead-water-tank',
    slug: 'overhead-water-tank-cleaning',
    title: 'Overhead Water Tank Cleaning Service',
    titleBn: 'ওভারহেড ওয়াটার ট্যাংক ক্লিনিং সার্ভিস',
    name: 'Overhead Water Tank Cleaning Service',
    shortDesc: 'Professional cleaning of overhead water tanks made from plastic, steel, or concrete with high-pressure rotary jet and sanitization.',
    shortDescBn: 'প্লাস্টিক, স্টিল ও কংক্রিটের ছাদের ওভারহেড পানির ট্যাংক রোটারি হাই-প্রেসার জেট ও ফুড-গ্রেড জীবাণুমুক্তকরণে নির্ভরযোগ্য সেবা।',
    short_description: 'Professional cleaning of overhead water tanks made from plastic, steel, or concrete with high-pressure rotary jet and sanitization.',
    fullDesc: 'Overhead water tanks on residential and commercial rooftops face intense sunlight, heat, and municipal sediment accumulation. Over months, thick layers of green algae, bio-films, and slime settle on tank walls and floors. Our specialized team uses calibrated 120-150 bar high-pressure rotary water jets, wet vacuum sludge extraction, and food-grade non-toxic sanitization to completely eliminate algae and bacteria without eroding plastic or concrete surfaces.',
    full_description: 'Overhead water tanks on residential and commercial rooftops face intense sunlight, heat, and municipal sediment accumulation. Over months, thick layers of green algae, bio-films, and slime settle on tank walls and floors. Our specialized team uses calibrated 120-150 bar high-pressure rotary water jets, wet vacuum sludge extraction, and food-grade non-toxic sanitization to completely eliminate algae and bacteria without eroding plastic or concrete surfaces.',
    category: 'Overhead Tank',
    iconName: 'Building',
    icon: 'Building',
    image: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=1200&q=75',
    featured_image: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=1200&q=75',
    is_active: true,
    display_order: 1,
    show_on_homepage: true,
    show_in_navigation: true,
    show_in_quote_form: true,
    isPrimary: true,
    popular: true,
    startingPrice: 1200,
    startingPriceBn: '৳ ১,২০০',
    seo_title: 'Overhead Water Tank Cleaning Service in Dhaka | Sunviloz Clean Care',
    metaTitle: 'Overhead Water Tank Cleaning Service in Dhaka | Sunviloz Clean Care',
    meta_description: 'Professional overhead water tank cleaning service for plastic, steel, and concrete tanks in Dhaka. High pressure rotary jet wash and food-grade sanitization.',
    metaDesc: 'Professional overhead water tank cleaning service for plastic, steel, and concrete tanks in Dhaka. High pressure rotary jet wash and food-grade sanitization.',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: new Date().toISOString(),
    formConfig: {
      requiresTankMaterial: true,
      requiresTankCapacity: true,
      requiresPropertyDetails: false,
      requiresPipelineDetails: false,
      supportedMaterials: ['Plastic', 'Steel', 'Concrete'],
      capacityOptions: ['1,000 Liters', '2,000 Liters', '5,000 Liters'],
      allowCustomCapacity: true,
      allowUnknownCapacity: true
    },
    benefits: [
      'Safe for Plastic, Stainless Steel, and Concrete RCC tanks',
      '120-150 bar calibrated high-pressure rotary wash without wall damage',
      'Food-grade non-toxic odorless disinfectant treatment',
      'Complete sludge extraction using heavy-duty slurry pump & wet vacuum'
    ],
    benefitsBn: [
      'প্লাস্টিক, স্টেইনলেস স্টিল ও আরসিসি কংক্রিট সব ধরনের ট্যাংকে নিরাপদ',
      'দেয়াল অক্ষত রেখে ১২০-১৫০ বার হাই-প্রেসার রোটারি জেট ওয়াশ',
      'ফুড-গ্রেড ও সম্পূর্ণ স্বাস্থ্যসম্মত নিরাপদ জীবাণুনাশক প্রয়োগ',
      'হেভি পাম্প ও ওয়েট ভ্যাকুয়ামে কাদা ও শ্যাওলা ১০০% নিষ্কাশন'
    ],
    equipment: [
      '120-150 Bar High-Pressure Rotary Jet Cleaner',
      'Submersible Sediment Slurry Pump',
      'Heavy-Duty Wet Vacuum Extractor',
      'Approved Food-Grade Non-Toxic Sanitizer'
    ],
    equipmentBn: [
      '১২০-১৫০ বার হাই-প্রেসার রোটারি জেট ওয়াশার',
      'সাবমারসিবল স্লাজ সেচ পাম্প',
      'ইন্ডাস্ট্রিয়াল ওয়েট ভ্যাকুয়াম ক্লিনার',
      'ফুড-গ্রেড নন-টক্সিক জীবাণুনাশক'
    ],
    process: [
      'Pre-service inspection of tank inlet, float valve, and structural walls',
      'Controlled drainage of standing water using slurry pump',
      'Biofilm and wall algae scrubbing with non-scratch tools',
      '120-150 bar high-pressure rotary jet wall and floor wash',
      'Food-grade disinfectant spray and dwell time',
      'Fresh water rinse, vacuum suction of leftover residue, and lid sealing'
    ],
    processBn: [
      'ট্যাংকের ঢাকনা, ইনলেট ও দেয়ালের সার্বিক অবস্থা পরিদর্শন',
      'সাবমারসিবল পাম্পে তলদেশের অবশিষ্ট পানি ও ময়লা ড্রেন করা',
      'নন-স্ক্র্যাচ ব্রাশে দেয়ালের শ্যাওলা ও পিচ্ছিল আস্তরণ আলগা করা',
      '১২০-১৫০ বার উচ্চচাপের রোটারি ওয়াটার জেটে গভীর ধৌতকরণ',
      'ফুড-গ্রেড নিরাপদ জীবাণুনাশক স্প্রে ও স্যানিটাইজেশন',
      'বিশুদ্ধ পানি দিয়ে ফাইনাল রিন্স ও ভ্যাকুয়ামে শতভাগ পরিচ্ছন্ন হ্যান্ডওভার'
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
    faqs: [
      {
        question: 'Will high-pressure water jet damage my plastic or steel overhead tank?',
        answer: 'No. Our high-pressure jet cleaners are calibrated specifically to remove algae and slime without eroding plastic, fiberglass, or stainless steel seams.',
        questionBn: 'হাই-প্রেসার জেটে ছাদের পিভিসি বা স্টিল ট্যাংকের কোনো ক্ষতি হবে কি?',
        answerBn: 'না, কোনো ক্ষতি হবে না। আমাদের রোটারি জেট মেশিনগুলো এমনভাবে ক্যালিব্রেট করা যা ট্যাংকের মেটেরিয়াল সম্পূর্ণ অক্ষত রেখেই শ্যাওলা তুলে ফেলে।'
      },
      {
        question: 'How long does overhead tank cleaning take?',
        answer: 'A standard residential overhead tank (1,000L to 2,000L) takes between 1.5 to 2.5 hours to thoroughly scrub, pressure wash, and sanitize.',
        questionBn: 'ছাদের ট্যাংক পরিষ্কার করতে কতক্ষণ সময় লাগে?',
        answerBn: 'একটি ১,০০০ বা ২,০০০ লিটার ছাদের ট্যাংক ডিপ ক্লিন করতে সাধারণত ১.৫ থেকে ২.৫ ঘণ্টা সময় লাগে।'
      }
    ]
  },

  // 2. Underground Water Reserve Tank Cleaning Service
  {
    id: 'srv-underground-water-tank',
    slug: 'underground-water-tank-cleaning',
    title: 'Underground Water Reserve Tank Cleaning Service',
    titleBn: 'আন্ডারগ্রাউন্ড ওয়াটার রিজার্ভ ট্যাংক ক্লিনিং সার্ভিস',
    name: 'Underground Water Reserve Tank Cleaning Service',
    shortDesc: 'Professional cleaning and heavy sludge extraction for underground water reserve tanks made from plastic, steel, or concrete.',
    shortDescBn: 'মাটির নিচের আরসিসি কংক্রিট, প্লাস্টিক ও স্টিল রিজার্ভারের ভারী কাদা, স্লাজ ও শ্যাওলা মেকানাইজড ডিপ-ক্লিন ও স্যানিটাইজেশন।',
    short_description: 'Professional cleaning and heavy sludge extraction for underground water reserve tanks made from plastic, steel, or concrete.',
    fullDesc: 'Underground water reserve tanks directly receive municipal supply water containing dense iron silt, clay, sand, and organic sludge. Over time, 2 to 6 inches of mud accumulates at the base, fostering anaerobic bacteria that cause foul odors and contaminate roof tanks. Our confined-space trained technicians use heavy submersible sludge pumps, fresh air ventilation blowers, high-lumen safety lights, and 150-bar rotary scouring to restore pure water storage.',
    full_description: 'Underground water reserve tanks directly receive municipal supply water containing dense iron silt, clay, sand, and organic sludge. Over time, 2 to 6 inches of mud accumulates at the base, fostering anaerobic bacteria that cause foul odors and contaminate roof tanks. Our confined-space trained technicians use heavy submersible sludge pumps, fresh air ventilation blowers, high-lumen safety lights, and 150-bar rotary scouring to restore pure water storage.',
    category: 'Underground Tank',
    iconName: 'Droplets',
    icon: 'Droplets',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=75',
    featured_image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=75',
    is_active: true,
    display_order: 2,
    show_on_homepage: true,
    show_in_navigation: true,
    show_in_quote_form: true,
    isPrimary: true,
    popular: true,
    startingPrice: 2500,
    startingPriceBn: '৳ ২,৫০০',
    seo_title: 'Underground Water Reserve Tank Cleaning Service Dhaka | Sunviloz Clean Care',
    metaTitle: 'Underground Water Reserve Tank Cleaning Service Dhaka | Sunviloz Clean Care',
    meta_description: 'Specialized subterranean concrete, plastic and steel water reserve tank cleaning in Dhaka. Heavy mud suction, confined space safety, and non-toxic disinfection.',
    metaDesc: 'Specialized subterranean concrete, plastic and steel water reserve tank cleaning in Dhaka. Heavy mud suction, confined space safety, and non-toxic disinfection.',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: new Date().toISOString(),
    formConfig: {
      requiresTankMaterial: true,
      requiresTankCapacity: true,
      requiresPropertyDetails: false,
      requiresPipelineDetails: false,
      supportedMaterials: ['Plastic', 'Steel', 'Concrete'],
      capacityOptions: ['2,000 Liters', '5,000 Liters', '10,000+ Liters'],
      allowCustomCapacity: true,
      allowUnknownCapacity: true
    },
    benefits: [
      'Specialized confined-space safety with fresh air ventilation blowers',
      'Heavy submersible slurry mud extraction pump removes thick municipal sludge',
      'Cleans reservoirs of all sizes (from 2,000 to 50,000+ Liters)',
      'Prevents silt from entering suction pipes that supply the roof overhead tanks'
    ],
    benefitsBn: [
      'কনফাইন্ড স্পেস নিরাপত্তা প্রটোকল ও তাজা বাতাস সরবরাহকারী ব্লোয়ার সিস্টেম',
      'হেভি সাবমারসিবল স্লাজ পাম্প দিয়ে নিচের ঘন কাদা ও বালি দ্রুত উত্তোলন',
      'ছোট-বড় সব ক্ষমতার রিজার্ভার (২,০০০ থেকে ৫০,০০০+ লিটার) সফল পরিচ্ছন্নকরণ',
      'ছাদের মোটরে কাদা যাওয়া বন্ধ করে মোটর ও সম্পূর্ণ পানি সরবরাহের সুরক্ষা'
    ],
    equipment: [
      'Submersible Heavy-Duty Slurry/Mud Pump',
      'Confined Space Fresh Air Ventilation Blower',
      'Waterproof Safety LED Illumination Kit',
      '150-Bar High Pressure Rotary Surface Washer',
      'Industrial Wet Silt Vacuum Extractor'
    ],
    equipmentBn: [
      'হেভি-ডিউটি স্লাজ ও কাদা তোলার সাবমারসিবল পাম্প',
      'কনফাইন্ড স্পেস ভেন্টিলেশন ফ্রেস এয়ার ব্লোয়ার',
      'ওয়াটারপ্রুফ সেফটি এলইডি লাইটিং সেট',
      '১৫০ বার মেকানাইজড ফ্লোর ও দেয়াল রোটারি ওয়াশার',
      'ইন্ডাস্ট্রিয়াল ওয়েট সিল্ট ভ্যাকুয়াম ক্লিনার'
    ],
    process: [
      'Atmospheric safety check and setup of continuous air blower ventilation',
      'Heavy submersible pump deployment to evacuate muddy water and sludge',
      'Wet vacuuming of sump pit to clear compacted gravel and municipal silt',
      '150-bar rotary jet wash on floor and all concrete walls',
      'Application of food-grade antibacterial sanitization',
      'Fresh water rinse, final vacuuming, and manhole securing'
    ],
    processBn: [
      'নিরাপত্তা পর্যবেক্ষণ ও সার্বক্ষণিক তাজা বাতাসের ব্লোয়ার চালু',
      'হেভি সাবমারসিবল পাম্পে নোংরা পানি ও ভারী কাদার স্তুপ সেচ',
      'মেঝের সাম্প পিটের কাদা ও শক্ত পলি ইন্ডাস্ট্রিয়াল ভ্যাকুয়ামে পরিষ্কার',
      '১৫০ বার উচ্চচাপের রোটারি জেটে দেয়াল ও মেঝের ময়লা দূরীকরণ',
      'ফুড-গ্রেড নিরাপদ অ্যান্টি-ব্যাকটেরিয়াল জীবাণুনাশক স্প্রে',
      'বিশুদ্ধ পানির ফাইনাল রিন্স, ভ্যাকুমিং ও গ্রাহককে কাজ হস্তান্তর'
    ],
    idealFor: [
      'Apartment buildings, residential societies & housing complexes',
      'Commercial buildings, shopping malls & plazas',
      'Hospitals, factories, hotels & schools'
    ],
    idealForBn: [
      'আবাসিক অ্যাপার্টমেন্ট ও ফ্ল্যাট মালিক সমিতি',
      'বাণিজ্যিক কমপ্লেক্স, শপিং মল ও কর্পোরেট ভবন',
      'হাসপাতাল, শিল্পপ্রতিষ্ঠান, হোটেল ও শিক্ষাপ্রতিষ্ঠান'
    ],
    faqs: [
      {
        question: 'How long does cleaning an underground reserve tank take?',
        answer: 'Depending on capacity and sludge thickness, a standard residential underground tank takes between 3 to 5 hours. We coordinate with building management to minimize water disruption.',
        questionBn: 'আন্ডারগ্রাউন্ড রিজার্ভার পরিষ্কার করতে কতক্ষণ সময় লাগে?',
        answerBn: 'রিজার্ভারের ধারণক্ষমতা ও কাদার পরিমাণের ওপর ভিত্তি করে সাধারণত ৩ থেকে ৫ ঘণ্টার মধ্যে পুরো কাজ শেষ হয়।'
      }
    ]
  },

  // 3. Water Pipeline Cleaning Service
  {
    id: 'srv-water-pipeline',
    slug: 'water-pipeline-cleaning',
    title: 'Water Pipeline Cleaning Service',
    titleBn: 'ওয়াটার পাইপলাইন ক্লিনিং সার্ভিস',
    name: 'Water Pipeline Cleaning Service',
    shortDesc: 'Professional water pipeline cleaning for residential and commercial properties to eliminate rust, iron scale, and restore water pressure.',
    shortDescBn: 'দেয়াল না ভেঙে আধুনিক হাইড্রো-পালস প্রযুক্তিতে বাসা ও ভবনের পানির পাইপলাইনের ভেতরের জমে থাকা আয়রন, মরিচা ও দুর্গন্ধ দূরীকরণ।',
    short_description: 'Professional water pipeline cleaning for residential and commercial properties to eliminate rust, iron scale, and restore water pressure.',
    fullDesc: 'Even when water tanks are spotless, internal distribution pipes can harbor years of accumulated iron oxide, mineral scaling, and microbial biofilms. This leads to brown or reddish tap water, foul plumbing odors, and low shower pressure. Our specialized non-invasive hydro-pneumatic pulse technology flushes plumbing lines room-by-room directly through faucet connections without breaking walls, cutting tiles, or damaging pipes.',
    full_description: 'Even when water tanks are spotless, internal distribution pipes can harbor years of accumulated iron oxide, mineral scaling, and microbial biofilms. This leads to brown or reddish tap water, foul plumbing odors, and low shower pressure. Our specialized non-invasive hydro-pneumatic pulse technology flushes plumbing lines room-by-room directly through faucet connections without breaking walls, cutting tiles, or damaging pipes.',
    category: 'Pipeline',
    iconName: 'Wrench',
    icon: 'Wrench',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=75',
    featured_image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=75',
    is_active: true,
    display_order: 3,
    show_on_homepage: true,
    show_in_navigation: true,
    show_in_quote_form: true,
    isPrimary: false,
    popular: true,
    startingPrice: 1500,
    startingPriceBn: '৳ ১,৫০০',
    seo_title: 'Water Pipeline Cleaning Service Dhaka | Sunviloz Clean Care',
    metaTitle: 'Water Pipeline Cleaning Service Dhaka | Sunviloz Clean Care',
    meta_description: 'Non-invasive water pipeline cleaning and descaling in Dhaka. Removes rust and iron deposits without breaking walls or damaging tiles.',
    metaDesc: 'Non-invasive water pipeline cleaning and descaling in Dhaka. Removes rust and iron deposits without breaking walls or damaging tiles.',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: new Date().toISOString(),
    formConfig: {
      requiresTankMaterial: false,
      requiresTankCapacity: false,
      requiresPropertyDetails: true,
      requiresPipelineDetails: true
    },
    benefits: [
      'Zero wall damage or tile breaking — operates directly through faucet valves',
      'Completely clears internal rust scaling, iron slime, and tap odors',
      'Restores original shower flow and faucet water pressure',
      '100% safe for PVC, CPVC, PPR, and GI galvanized plumbing lines'
    ],
    benefitsBn: [
      'কোনো দেয়াল বা টাইলস না ভেঙে বিদ্যমান কলের মুখ থেকে কাজ সম্পন্ন',
      'পাইপের ভেতরের মরিচা, আয়রনের স্তর ও দুর্গন্ধ স্থায়ীভাবে অপসারণ',
      'শাওয়ার ও বেসিন কলে পানির স্বাভাবিক গতি ও স্পিড পুনরুদ্ধার',
      'পিভিসি, সিপিভিসি, পিপিআর ও জিআই সব ধরনের পাইপলাইনে সম্পূর্ণ নিরাপদ'
    ],
    equipment: [
      'High-Frequency Hydro-Pneumatic Pulse Pipeline Cleaning Generator',
      'Non-Corrosive Food-Grade Safe Descaling Flush Agent',
      'Multi-Point Tap Effluent Monitoring Filter Set'
    ],
    equipmentBn: [
      'হাই-ফ্রিকোয়েন্সি হাইড্রো-নিউম্যাটিক পালস মেশিন',
      'ফুড-গ্রেড নন-করোসিভ পাইপলাইন সল্যুশন',
      'মাল্টি-পয়েন্ট আউটলেট মনিটরিং ফিল্টার'
    ],
    process: [
      'Plumbing network pressure testing and line connection inspection',
      'Connecting hydro-pulse unit to isolated supply lines at faucet points',
      'Pulsed air-water flushing to dislodge inner pipe scaling and rust',
      'Continuous drainage monitoring until effluent runs crystal clear',
      'Aerator nozzle cleaning, pressure verification, and final walkthrough'
    ],
    processBn: [
      'লাইনের সংযোগ ও বর্তমান প্রেশার নিরীক্ষণ',
      'মেশিন সংযুক্ত করে পালসিং পদ্ধতিতে লাইন পরিষ্কার শুরু',
      'প্রতিটি বাথরুম ও কিচেনের কল দিয়ে ভেতরের আয়রন ও মরিচা বের করা',
      'স্বচ্ছ পানি না আসা পর্যন্ত পাইপলাইন ফ্লাশ করা',
      'কলের ফিল্টার নজল পরিষ্কার করে পানির প্রবাহ গ্রাহককে বুঝিয়ে দেওয়া'
    ],
    idealFor: [
      'Apartments with brown, rusty, or yellow water from taps',
      'Older plumbing networks with low shower pressure and blockage',
      'Families seeking completely clean and safe water at every faucet'
    ],
    idealForBn: [
      'যেসব বাসাবাড়িতে আয়রনযুক্ত লালচে বা গন্ধযুক্ত পানি আসে',
      'ভবনের পাইপলাইনের স্বাভাবিক পানির গতি ও প্রেসার ফেরাতে',
      'কল বা শাওয়ারের মুখে আটকে থাকা ময়লা স্থায়ীভাবে পরিষ্কারে'
    ],
    faqs: [
      {
        question: 'Do you need to break walls or replace tiles for pipeline cleaning?',
        answer: 'No! Our hydro-pulse machinery connects directly to existing faucet connection points without any wall breaking or tile cutting.',
        questionBn: 'পাইপলাইন পরিষ্কার করতে দেয়াল বা টাইলস ভাঙতে হয়?',
        answerBn: 'না, কোনো দেয়াল ভাঙতে হয় না। বিদ্যমান কলের মুখ থেকেই বিশেষ মেশিনের মাধ্যমে পুরো লাইনের ময়লা বের করা হয়।'
      }
    ]
  },

  ];

export const CANONICAL_SERVICE_ALIASES: Record<string, string> = {
  // Overhead Tank
  'overhead-tank-cleaning': 'overhead-water-tank-cleaning',
  'overhead-water-tank-cleaning': 'overhead-water-tank-cleaning',
  'overhead-water-tank': 'overhead-water-tank-cleaning',
  'rooftop-tank-cleaning': 'overhead-water-tank-cleaning',
  'overhead-tank': 'overhead-water-tank-cleaning',

  // Underground Tank
  'underground-tank-cleaning': 'underground-water-tank-cleaning',
  'underground-water-tank-cleaning': 'underground-water-tank-cleaning',
  'underground-water-tank': 'underground-water-tank-cleaning',
  'water-reserve-tank-cleaning': 'underground-water-tank-cleaning',
  'reserve-tank-cleaning': 'underground-water-tank-cleaning',

  // Water Pipeline
  'water-pipeline-cleaning': 'water-pipeline-cleaning',
  'pipeline-cleaning': 'water-pipeline-cleaning',
  'pipeline-cleaning-service': 'water-pipeline-cleaning',
  'pipe-line-cleaning': 'water-pipeline-cleaning',
  'water-pipeline': 'water-pipeline-cleaning',

  // Legacy / Combo aliases mapped to best matching active service
  'water-tank-cleaning': 'overhead-water-tank-cleaning',
  'water-tank-cleaning-service': 'overhead-water-tank-cleaning',
  'both-water-tank-cleaning': 'overhead-water-tank-cleaning',
  'both-water-tank-cleaning-with-pipeline': 'overhead-water-tank-cleaning',
  'water-pipeline-cleaning-both-water-tank': 'water-pipeline-cleaning'
};
