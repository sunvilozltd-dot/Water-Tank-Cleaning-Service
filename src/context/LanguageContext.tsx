import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const DICTIONARY: Record<Language, Record<string, string>> = {
  en: {
    // Header & Nav
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.howItWorks': 'How It Works',
    'nav.pricing': 'Pricing',
    'nav.reviews': 'Reviews',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'nav.getFreeQuote': 'Get Free Quote',
    'nav.callNow': 'Call Now',

    // Hero
    'hero.h1': 'Professional Water Tank Cleaning Service in Dhaka',
    'hero.sub': 'Deep cleaning for rooftop and underground water tanks with a professional, hygienic and customer-focused cleaning process.',
    'hero.cta.quote': 'Request a Quote',
    'hero.cta.call': 'Call Now',
    'hero.cta.whatsapp': 'WhatsApp',
    'hero.cta.messenger': 'Messenger',

    // Quick Quote Form
    'form.title': 'Get Your Free Quote',
    'form.subtitle': 'Get an accurate estimate in Dhaka within minutes.',
    'form.name': 'Your Full Name',
    'form.namePlaceholder': 'e.g. Tanvir Ahmed',
    'form.phone': 'Phone Number',
    'form.phonePlaceholder': '01XXXXXXXXX',
    'form.area': 'Area in Dhaka',
    'form.areaPlaceholder': 'Select or type area (e.g. Uttara, Gulshan)',
    'form.tankType': 'Tank Type',
    'form.tankCapacity': 'Tank Capacity (Liters)',
    'form.numberOfTanks': 'Number of Tanks',
    'form.preferredDate': 'Preferred Service Date',
    'form.submit': 'Get My Free Quote',
    'form.helperCapacity': "Don't know your tank capacity? No problem. Our team can help estimate it.",
    'form.submitting': 'Sending Request...',

    // Success State
    'success.title': 'Request Received!',
    'success.msg': 'Thank you for contacting Sunviloz Clean Care. Our team will review your information and contact you regarding your quotation shortly.',
    'success.callUs': 'Call Us Directly',
    'success.whatsappUs': 'WhatsApp Us',
    'success.back': 'Back to Website',

    // Problem Section
    'problem.tag': 'Cleanliness & Health',
    'problem.h2': 'When Was the Last Time You Cleaned Your Water Tank?',
    'problem.sub': 'Water stored in uncleaned tanks can quietly accumulate layers of unwanted matter that affect clarity and cleanliness.',
    'problem.cta': 'Check My Tank Cleaning Price',

    // Solution Section
    'solution.tag': 'Our Systematic Method',
    'solution.h2': 'A Professional Cleaning Process for Your Water Tank',
    'solution.sub': 'We follow a standardized, 9-step hygienic process using specialized equipment to ensure complete cleaning without damaging your water structure.',

    // Services
    'services.tag': 'Our Solutions',
    'services.h2': 'Our Water Tank Cleaning Services',
    'services.sub': 'Specialized water hygiene solutions tailored for Dhaka residential homes, apartment complexes, and commercial properties.',
    'services.learnMore': 'Learn More',
    'services.getQuote': 'Get Quote',

    // Before After
    'beforeAfter.tag': 'Real Transformations',
    'beforeAfter.h2': 'See the Difference',
    'beforeAfter.sub': 'Witness how our specialized pressure jet and vacuum extraction technology restores neglected tanks to pristine condition.',
    'beforeAfter.before': 'Before Cleaning',
    'beforeAfter.after': 'After Sunviloz Clean Care',

    // Why Choose Us
    'why.tag': 'The Sunviloz Difference',
    'why.h2': 'Why Choose Sunviloz Clean Care?',
    'why.sub': 'We believe in punctuality, professional equipment, transparent communication, and genuine hygienic results.',

    // Pricing
    'pricing.tag': 'Clear & Honest',
    'pricing.h2': 'Transparent Pricing',
    'pricing.sub': 'No surprise charges. Check our starting estimates or calculate your custom quote below.',
    'pricing.cta': 'Get Exact Price',

    // How It Works
    'how.tag': 'Fast & Convenient',
    'how.h2': 'How It Works',
    'how.sub': 'Getting your water tank professionally cleaned is simple and hassle-free.',
    'how.cta': 'Book My Cleaning',

    // Service Area
    'area.tag': 'Dhaka City Coverage',
    'area.h2': 'Water Tank Cleaning Service in Dhaka',
    'area.sub': 'Our mobile cleaning teams serve residential and commercial properties across all major areas of Dhaka.',
    'area.checkTitle': 'Check Service Availability',
    'area.checkPlaceholder': 'Type your area (e.g. Banani, Bashundhara)...',
    'area.checkBtn': 'Check Availability',

    // Reviews
    'reviews.tag': 'Customer Trust',
    'reviews.h2': 'Customer Reviews',
    'reviews.sub': 'Feedback from genuine homeowners and building managers in Dhaka who trusted Sunviloz Clean Care.',

    // FAQ
    'faq.tag': 'Answers to Common Inquiries',
    'faq.h2': 'Frequently Asked Questions',
    'faq.sub': 'Everything you need to know about our water tank cleaning process, pricing, and timing.',

    // Final CTA
    'finalCta.h2': 'Ready to Clean Your Water Tank?',
    'finalCta.sub': 'Get a quick quotation from Sunviloz Clean Care today. We guarantee prompt response and professional service.',
    'finalCta.quote': 'Request a Quote',
    'finalCta.call': 'Call Now',
    'finalCta.whatsapp': 'WhatsApp',
    'finalCta.messenger': 'Messenger',

    // Mobile bar
    'mobile.call': 'Call Now',
    'mobile.whatsapp': 'WhatsApp',
    'mobile.quote': 'Get Quote',
  },
  bn: {
    // Header & Nav
    'nav.home': 'হোম',
    'nav.services': 'সার্ভিসসমূহ',
    'nav.howItWorks': 'পদ্ধতি',
    'nav.pricing': 'মূল্যতালিকা',
    'nav.reviews': 'রিভিউ',
    'nav.faq': 'প্রশ্নোত্তর',
    'nav.contact': 'যোগাযোগ',
    'nav.getFreeQuote': 'কোটেশন নিন',
    'nav.callNow': 'কল করুন',

    // Hero
    'hero.h1': 'ঢাকায় প্রফেশনাল ওয়াটার ট্যাংক ক্লিনিং সার্ভিস',
    'hero.sub': 'ছাদ ও মাটির নিচের ওয়াটার ট্যাংকের গভীর পরিচ্ছন্নতা নিশ্চিত করতে আধুনিক ও মেকানাইজড ক্লিনিং সেবা।',
    'hero.cta.quote': 'কোটেশন রিকোয়েস্ট করুন',
    'hero.cta.call': 'কল করুন',
    'hero.cta.whatsapp': 'WhatsApp',
    'hero.cta.messenger': 'মেসেঞ্জার',

    // Quick Quote Form
    'form.title': 'ফ্রি কোটেশন গ্রহণ করুন',
    'form.subtitle': 'আপনার ট্যাংকের তথ্য দিয়ে দ্রুততম সময়ে সঠিক কোটেশন জানুন।',
    'form.name': 'আপনার নাম',
    'form.namePlaceholder': 'যেমন: তানভীর আহমেদ',
    'form.phone': 'মোবাইল নম্বর',
    'form.phonePlaceholder': '01XXXXXXXXX',
    'form.area': 'ঢাকার এলাকা',
    'form.areaPlaceholder': 'এলাকা লিখুন বা নির্বাচন করুন (যেমন: উত্তরা, গুলশান)',
    'form.tankType': 'ট্যাংকের ধরন',
    'form.tankCapacity': 'ধারণক্ষমতা (লিটার)',
    'form.numberOfTanks': 'ট্যাংকের সংখ্যা',
    'form.preferredDate': 'পছন্দের তারিখ',
    'form.submit': 'কোটেশন রিকোয়েস্ট পাঠান',
    'form.helperCapacity': 'ধারণক্ষমতা জানা না থাকলে চিন্তার কারণ নেই, আমাদের টিম পরিদর্শনে সহায়তা করবে।',
    'form.submitting': 'পাঠানো হচ্ছে...',

    // Success State
    'success.title': 'রিকোয়েস্ট সফল হয়েছে!',
    'success.msg': 'সানভিলোজ ক্লিন কেয়ারে যোগাযোগ করার জন্য ধন্যবাদ। আমাদের টিম দ্রুত আপনার তথ্যাদি পর্যালোচনা করে কোটেশন জানাবে।',
    'success.callUs': 'সরাসরি কল করুন',
    'success.whatsappUs': 'হোয়াটসঅ্যাপে জানান',
    'success.back': 'ওয়েবসাইটে ফিরে যান',

    // Problem Section
    'problem.tag': 'পরিচ্ছন্নতা ও স্বাস্থ্য সচেতনতা',
    'problem.h2': 'আপনার পানির ট্যাংক কি দীর্ঘদিন ধরে অপরিচ্ছন্ন?',
    'problem.sub': 'নিয়মিত পরিষ্কার না করলে ট্যাংকের তলদেশে জমে বিষাক্ত পলি, ব্যাকটেরিয়া ও শ্যাওলা যা পানিকে দূষিত করে।',
    'problem.cta': 'ক্লিনিংয়ের সম্ভাব্য খরচ দেখুন',

    // Solution Section
    'solution.tag': 'আমাদের বৈজ্ঞানিক পদ্ধতি',
    'solution.h2': 'ওয়াটার ট্যাংকের জন্য আধুনিক ও নিরাপদ ক্লিনিং প্রসেস',
    'solution.sub': 'আমরা ৯টি ধাপে মেকানাইজড যন্ত্রপাতি ও ফুড-গ্রেড স্যানিটাইজার ব্যবহার করে সম্পূর্ণ ব্যাকটেরিয়ামুক্ত করি।',

    // Services
    'services.tag': 'আমাদের সেবাসমূহ',
    'services.h2': 'পেশাদার ওয়াটার ট্যাংক ক্লিনিং সল্যুশন',
    'services.sub': 'আবাসিক বাড়ি, বহুতল ফ্ল্যাট ভবন এবং বাণিজ্যিক প্রতিষ্ঠানের জন্য সুনির্দিষ্ট পরিচ্ছন্নতা সেবা।',
    'services.learnMore': 'বিস্তারিত দেখুন',
    'services.getQuote': 'কোটেশন নিন',

    // Before After
    'beforeAfter.tag': 'বাস্তব প্রমাণ',
    'beforeAfter.h2': 'কাজের পূর্ব ও পরবর্তী পার্থক্য',
    'beforeAfter.sub': 'দেখুন কীভাবে আধুনিক হাই-প্রেসার ও সাকশন পাম্প বছরের পর বছর জমে থাকা ময়লা দূর করে।',
    'beforeAfter.before': 'ক্লিনিংয়ের পূর্বে',
    'beforeAfter.after': 'ক্লিনিংয়ের পরে',

    // Why Choose Us
    'why.tag': 'আমাদের বৈশিষ্ট্য',
    'why.h2': 'কেন সানভিলোজ ক্লিন কেয়ার বেছে নেবেন?',
    'why.sub': 'নির্ধারিত সময়ে পৌঁছানো, উন্নত যন্ত্রপাতি, স্বচ্ছ কোটেশন এবং বিশুদ্ধ পানির নিশ্চয়তা।',

    // Pricing
    'pricing.tag': 'স্বচ্ছ মূল্যমান',
    'pricing.h2': 'সাশ্রয়ী ও স্বচ্ছ কোটেশন',
    'pricing.sub': 'কোনো লুকানো বা অতিরিক্ত চার্জ নেই। প্রারম্ভিক মূল্য দেখুন বা কাস্টম কোটেশন রিকোয়েস্ট করুন।',
    'pricing.cta': 'সঠিক কোটেশন জানুন',

    // How It Works
    'how.tag': 'সহজ প্রক্রিয়া',
    'how.h2': 'সার্ভিস পাওয়ার সহজ ৩ ধাপ',
    'how.sub': 'ঝামেলাহীনভাবে আপনার পানির ট্যাংক পরিষ্কার করিয়ে নেওয়া এখন আরও সহজ।',
    'how.cta': 'ক্লিনিং শিডিউল করুন',

    // Service Area
    'area.tag': 'ঢাকা জুড়ে কভারেজ',
    'area.h2': 'ঢাকা শহরের সর্বত্র আমাদের সার্ভিস',
    'area.sub': 'ঢাকা, গাজীপুর, সাভার, নারায়ণগঞ্জসহ ঢাকার পার্শ্ববর্তী বিভিন্ন এলাকায় আপনার বাসা, ভবন ও প্রতিষ্ঠানের জন্য পেশাদার পানির ট্যাংক ও পাইপলাইন ক্লিনিং সার্ভিস নিয়ে আমরা আছি আপনার পাশে।',
    'area.checkTitle': 'আপনার এলাকায় সার্ভিস আছে কি না যাচাই করুন',
    'area.checkPlaceholder': 'আপনার এলাকা লিখুন (যেমন: বনানী, মিরপুর)...',
    'area.checkBtn': 'যাচাই করুন',

    // Reviews
    'reviews.tag': 'গ্রাহকদের আস্থা',
    'reviews.h2': 'সম্মানিত গ্রাহকদের মতামত',
    'reviews.sub': 'ঢাকা শহরের বাসিন্দা ও ভবন কমিটির কর্মকর্তাদের বাস্তব অভিজ্ঞতা।',

    // FAQ
    'faq.tag': 'সাধারণ প্রশ্নোত্তর',
    'faq.h2': 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী',
    'faq.sub': 'ওয়াটার ট্যাংক ক্লিনিং পদ্ধতি, খরচ ও সময়সূচি সংক্রান্ত প্রয়োজনীয় তথ্য।',

    // Final CTA
    'finalCta.h2': 'ট্যাংক পরিষ্কার করাতে চান?',
    'finalCta.sub': 'সানভিলোজ ক্লিন কেয়ার থেকে আজই কোটেশন ও সুবিধাজনক শিডিউল নিশ্চিত করুন।',
    'finalCta.quote': 'কোটেশন রিকোয়েস্ট করুন',
    'finalCta.call': 'কল করুন',
    'finalCta.whatsapp': 'WhatsApp',
    'finalCta.messenger': 'মেসেঞ্জার',

    // Mobile bar
    'mobile.call': 'কল করুন',
    'mobile.whatsapp': 'WhatsApp',
    'mobile.quote': 'কোটেশন',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('bn'); // Default to Bengali for Dhaka local user audience, switchable to English

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sunviloz_lang') as Language;
      if (saved === 'bn' || saved === 'en') {
        setLangState(saved);
      }
    } catch {
      // Ignore localStorage access errors
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('sunviloz_lang', newLang);
    } catch {
      // Ignore
    }
  };

  const t = (key: string): string => {
    return DICTIONARY[lang]?.[key] || DICTIONARY['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
