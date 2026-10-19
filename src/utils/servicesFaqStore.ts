import { useState, useEffect } from 'react';
import { safeGetItem, safeSetItem } from './safeLocalStorage';

export interface ServiceFaqItem {
  id: string;
  category: 'water-tank-cleaning' | 'pipeline-cleaning';
  categoryTitleBn: string;
  categoryTitleEn: string;
  questionBn: string;
  questionEn: string;
  answerBn: string;
  answerEn: string;
  order: number;
  isActive: boolean;
}

export const INITIAL_SERVICES_FAQS: ServiceFaqItem[] = [
  // 1. Water Tank Cleaning (পানির ট্যাংক পরিষ্কার)
  {
    id: 'faq-tank-1',
    category: 'water-tank-cleaning',
    categoryTitleBn: 'পানির ট্যাংক পরিষ্কার',
    categoryTitleEn: 'Water Tank Cleaning',
    questionBn: 'পানির ট্যাংক কত দিন পরপর পরিষ্কার করা উচিত?',
    questionEn: 'How frequently should a water tank be cleaned?',
    answerBn: 'স্বাস্থ্যসম্মত ও নিরাপদ ব্যবহারের জন্য বছরে অন্তত ২ বার (প্রতি ৬ মাস অন্তর) ছাদ ও ভূগর্ভস্থ রিজার্ভার ডিপ ক্লিন ও জীবাণুমুক্ত করা বিশ্ব স্বাস্থ্য মানদণ্ড অনুযায়ী সুপারিশকৃত।',
    answerEn: 'Water tanks should ideally be thoroughly cleaned and sanitized at least twice a year (every 6 months) to avoid sludge sediment, slime and bacterial contamination.',
    order: 1,
    isActive: true
  },
  {
    id: 'faq-tank-2',
    category: 'water-tank-cleaning',
    categoryTitleBn: 'পানির ট্যাংক পরিষ্কার',
    categoryTitleEn: 'Water Tank Cleaning',
    questionBn: 'পানির ট্যাংক পরিষ্কার করতে কত সময় লাগে?',
    questionEn: 'How long does water tank cleaning take?',
    answerBn: 'ট্যাংকের ধারণক্ষমতা এবং ময়লার পরিমাণের ওপর ভিত্তি করে ১,০০০–৩,০০০ লিটার ওভারহেড ট্যাংকে সাধারণতঃ ২ থেকে ৩ ঘণ্টা এবং বড় ভূগর্ভস্থ রিজার্ভারে ৪ থেকে ৬ ঘণ্টা সময় লাগতে পারে।',
    answerEn: 'Standard 1,000–3,000 liter overhead tanks typically take 2–3 hours. Large underground commercial reservoirs may take 4–6 hours depending on sludge volume.',
    order: 2,
    isActive: true
  },
  {
    id: 'faq-tank-3',
    category: 'water-tank-cleaning',
    categoryTitleBn: 'পানির ট্যাংক পরিষ্কার',
    categoryTitleEn: 'Water Tank Cleaning',
    questionBn: 'পানির ট্যাংক পরিষ্কারের খরচ কীভাবে নির্ধারণ করা হয়?',
    questionEn: 'How is the water tank cleaning cost determined?',
    answerBn: 'ট্যাংকের ধরন (ওভারহেড পিভিসি/আরসিসি নাকি আন্ডারগ্রাউন্ড), ধারণক্ষমতা (লিটার বা গ্যালন), প্রবেশগম্যতা এবং ময়লার স্তরের ওপর ভিত্তি করে সাশ্রয়ী ও সঠিক কোটেশন দেওয়া হয়।',
    answerEn: 'Quotation depends on tank capacity, type (underground vs. overhead), construction material (RCC/PVC), accessibility, and silt thickness.',
    order: 3,
    isActive: true
  },
  {
    id: 'faq-tank-4',
    category: 'water-tank-cleaning',
    categoryTitleBn: 'পানির ট্যাংক পরিষ্কার',
    categoryTitleEn: 'Water Tank Cleaning',
    questionBn: 'আপনারা কী ধরনের ক্লিনিং প্রযুক্তি ও জীবাণুনাশক ব্যবহার করেন?',
    questionEn: 'What cleaning technology and disinfectants do you use?',
    answerBn: 'আমরা আধুনিক হাই-প্রেসার জেট ওয়াশার, স্বয়ংক্রিয় স্লাজ পাম্পিং, মেকানিক্যাল রোটো-স্ক্রাবিং এবং খাদ্য-নিরাপদ অনুমোদিত ইউভি ও জীবাণুনাশক ট্রিটমেন্ট ব্যবহার করি।',
    answerEn: 'We employ high-pressure jet washers, industrial sludge de-watering pumps, mechanical rotary scrubbers, and certified eco-safe food-grade disinfectants.',
    order: 4,
    isActive: true
  },
  {
    id: 'faq-tank-5',
    category: 'water-tank-cleaning',
    categoryTitleBn: 'পানির ট্যাংক পরিষ্কার',
    categoryTitleEn: 'Water Tank Cleaning',
    questionBn: 'ক্লিনিংয়ের পর কি ট্যাংকের পানি তাৎক্ষণিকভাবে ব্যবহার করা যায়?',
    questionEn: 'Can the tank water be used immediately after cleaning?',
    answerBn: 'হ্যাঁ। ওয়াশ ও জীবাণুমুক্তকরণের পর ট্যাংক পুরোপুরি পরিষ্কার বিশুদ্ধ পানি দিয়ে ধুয়ে শুকানো হয়। নতুন পানি ভরার পর তা সরাসরি রান্না ও গৃহস্থালি কাজে ব্যবহারের উপযোগী থাকে।',
    answerEn: 'Yes. After deep scrubbing and chemical-free rinsing, the tank is completely flushed with pure water. Freshly filled water is immediately ready for safe household use.',
    order: 5,
    isActive: true
  },

  // 2. Pipeline Cleaning (পাইপলাইন পরিষ্কার)
  {
    id: 'faq-pipe-1',
    category: 'pipeline-cleaning',
    categoryTitleBn: 'পাইপলাইন পরিষ্কার',
    categoryTitleEn: 'Pipeline Cleaning',
    questionBn: 'পানির পাইপলাইন ফ্লাশিংয়ে কি দেয়াল বা টাইলস ভাঙতে হয়?',
    questionEn: 'Do walls or tiles need to be broken for pipeline cleaning?',
    answerBn: 'না, কোনো ভাঙচুর প্রয়োজন নেই। আমাদের আধুনিক হাইড্রো-পালস ও এয়ার-প্রেসারাইজড প্রযুক্তিতে দেয়াল বা টাইলস অক্ষত রেখে বিদ্যমান ট্যাপ ও ভালভের মাধ্যমেই পাইপের ভেতর পরিষ্কার করা হয়।',
    answerEn: 'No walls or tiles need to be broken. Our hydro-pulse pressurized flushing system works entirely through existing taps and valve connections without structural damage.',
    order: 6,
    isActive: true
  },
  {
    id: 'faq-pipe-2',
    category: 'pipeline-cleaning',
    categoryTitleBn: 'পাইপলাইন পরিষ্কার',
    categoryTitleEn: 'Pipeline Cleaning',
    questionBn: 'পাইপে জমে থাকা আয়রন, শ্যাওলা ও লালচে ঘোলা পানি কি পরিষ্কার হবে?',
    questionEn: 'Will iron rust scaling, bio-slime, and brownish muddy water be eliminated?',
    answerBn: 'হ্যাঁ। ওয়াটার পাইপলাইনের অভ্যন্তরীণ দেয়াল থেকে শক্ত আয়রন স্কেল, মরিচা, শ্যাওলা ও ব্যাকটেরিয়াল স্লাইম স্তর পুরোপুরি ধুয়ে বের হয়ে আসে এবং পানির স্বাভাবিক স্বচ্ছতা ও গতি ফিরে আসে।',
    answerEn: 'Yes. Internal iron oxidation, rust scaling, heavy sediment, and bio-slime are thoroughly dislodged and flushed out, restoring sparkling clear water and optimal water pressure.',
    order: 7,
    isActive: true
  },
  {
    id: 'faq-pipe-3',
    category: 'pipeline-cleaning',
    categoryTitleBn: 'পাইপলাইন পরিষ্কার',
    categoryTitleEn: 'Pipeline Cleaning',
    questionBn: 'পাইপলাইন ক্লিনিং করাতে কত সময় লাগে?',
    questionEn: 'How long does water pipeline cleaning take?',
    answerBn: 'সাধারণ একটি স্ট্যান্ডার্ড ফ্ল্যাট বা বাসার জন্য ২ থেকে ৩ ঘণ্টা এবং পুরো বহুতল ভবনের সেন্ট্রাল ওয়াটার লাইনের ক্ষেত্রে ৪ থেকে ৬ ঘণ্টা সময় প্রয়োজন হয়।',
    answerEn: 'A standard residential apartment usually takes 2–3 hours. Multi-story commercial or central building risers typically take 4–6 hours.',
    order: 8,
    isActive: true
  },
  {
    id: 'faq-pipe-4',
    category: 'pipeline-cleaning',
    categoryTitleBn: 'পাইপলাইন পরিষ্কার',
    categoryTitleEn: 'Pipeline Cleaning',
    questionBn: 'পুরোনো বা ভঙ্গুর পাইপে কি কোনো লিকেজ হওয়ার আশঙ্কা থাকে?',
    questionEn: 'Is there any risk of pipe bursting or leakage in older plumbing?',
    answerBn: 'আমরা পরিষ্কার শুরুর আগে সম্পূর্ণ পাইপিং নেটওয়ার্কের প্রাথমিক প্রেসার টেস্ট ও নিরাপত্তা নিরীক্ষা করি। পাইপের সহনশীলতা মেপে নিয়ন্ত্রিত পালস রেঞ্জে কাজ করা হয়, যাতে কোনো ঝুঁকি না থাকে।',
    answerEn: 'Before flushing, our certified technicians conduct safety checks and calibrate the pulse pressure to your pipe material and age to ensure zero damage.',
    order: 9,
    isActive: true
  },
  {
    id: 'faq-pipe-5',
    category: 'pipeline-cleaning',
    categoryTitleBn: 'পাইপলাইন পরিষ্কার',
    categoryTitleEn: 'Pipeline Cleaning',
    questionBn: 'পানির পাইপলাইন কত দিন পর পর পরিষ্কার করা উচিত?',
    questionEn: 'How frequently should water supply pipelines be flushed?',
    answerBn: 'যেসব এলাকায় সরবরাহকৃত পানিতে মাত্রাতিরিক্ত আয়রন, লবণ বা পলি রয়েছে, সেখানে প্রতি ১ থেকে ২ বছর পর পর একবার পাইপলাইন ফ্লাশিং করা সবচেয়ে কার্যকর।',
    answerEn: 'In areas with high iron, heavy calcium hardness, or sediment, flushing pipelines every 1 to 2 years is highly recommended to prevent complete blockages.',
    order: 10,
    isActive: true
  }
];

const STORAGE_KEY = 'sunviloz_services_faqs_v1';
const EVENT_NAME = 'sunviloz_services_faq_changed';

export const getStoredServicesFaqs = (): ServiceFaqItem[] => {
  if (typeof window === 'undefined') return INITIAL_SERVICES_FAQS;
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) {
      safeSetItem(STORAGE_KEY, JSON.stringify(INITIAL_SERVICES_FAQS));
      return INITIAL_SERVICES_FAQS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_SERVICES_FAQS;
  } catch (err) {
    console.error('Failed to parse services FAQs:', err);
    return INITIAL_SERVICES_FAQS;
  }
};

export const saveAllServicesFaqs = (faqs: ServiceFaqItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    safeSetItem(STORAGE_KEY, JSON.stringify(faqs));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: faqs }));
  } catch (err) {
    console.error('Failed to save services FAQs:', err);
  }
};

export const addServiceFaq = (faqData: Omit<ServiceFaqItem, 'id'>): ServiceFaqItem => {
  const current = getStoredServicesFaqs();
  const id = `faq-${faqData.category === 'pipeline-cleaning' ? 'pipe' : 'tank'}-${Date.now()}`;
  const newItem: ServiceFaqItem = {
    ...faqData,
    id,
    order: faqData.order ?? (current.length + 1),
    isActive: faqData.isActive !== undefined ? faqData.isActive : true
  };
  const updated = [...current, newItem];
  saveAllServicesFaqs(updated);
  return newItem;
};

export const updateServiceFaq = (id: string, updates: Partial<ServiceFaqItem>): boolean => {
  const current = getStoredServicesFaqs();
  const idx = current.findIndex(f => f.id === id);
  if (idx === -1) return false;
  current[idx] = {
    ...current[idx],
    ...updates
  };
  saveAllServicesFaqs(current);
  return true;
};

export const deleteServiceFaq = (id: string): boolean => {
  const current = getStoredServicesFaqs();
  const filtered = current.filter(f => f.id !== id);
  if (filtered.length === current.length) return false;
  saveAllServicesFaqs(filtered);
  return true;
};

export const resetServicesFaqsToDefault = (): ServiceFaqItem[] => {
  saveAllServicesFaqs(INITIAL_SERVICES_FAQS);
  return INITIAL_SERVICES_FAQS;
};

export const useServicesFaqs = () => {
  const [faqs, setFaqs] = useState<ServiceFaqItem[]>(() => getStoredServicesFaqs());

  useEffect(() => {
    const handleUpdate = (e: any) => {
      setFaqs(e.detail || getStoredServicesFaqs());
    };
    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(EVENT_NAME, handleUpdate);
  }, []);

  return {
    faqs,
    tankFaqs: faqs.filter(f => f.category === 'water-tank-cleaning' && f.isActive !== false),
    pipelineFaqs: faqs.filter(f => f.category === 'pipeline-cleaning' && f.isActive !== false),
    addServiceFaq,
    updateServiceFaq,
    deleteServiceFaq,
    resetServicesFaqsToDefault
  };
};
