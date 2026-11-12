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

import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'sunviloz_services_faqs_v1';
const EVENT_NAME = 'sunviloz_services_faq_changed';

function mapRowToFaq(d: any): ServiceFaqItem {
  return {
    id: d.id,
    category: d.category,
    categoryTitleBn: d.category_title_bn,
    categoryTitleEn: d.category_title_en,
    questionBn: d.question_bn,
    questionEn: d.question_en,
    answerBn: d.answer_bn,
    answerEn: d.answer_en,
    order: Number(d.sort_order ?? 1),
    isActive: d.is_active !== false
  };
}

function mapFaqToRow(f: ServiceFaqItem): any {
  return {
    id: f.id,
    category: f.category,
    category_title_bn: f.categoryTitleBn,
    category_title_en: f.categoryTitleEn,
    question_bn: f.questionBn,
    question_en: f.questionEn,
    answer_bn: f.answerBn,
    answer_en: f.answerEn,
    sort_order: f.order,
    is_active: f.isActive,
    updated_at: new Date().toISOString()
  };
}

export const getStoredServicesFaqs = (): ServiceFaqItem[] => {
  if (typeof window === 'undefined') return INITIAL_SERVICES_FAQS;
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) {
      safeSetItem(STORAGE_KEY, JSON.stringify(INITIAL_SERVICES_FAQS));
      return INITIAL_SERVICES_FAQS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SERVICES_FAQS;
  } catch (err) {
    console.error('Failed to parse services FAQs:', err);
    return INITIAL_SERVICES_FAQS;
  }
};

export const fetchServicesFaqsFromSupabase = async (): Promise<ServiceFaqItem[]> => {
  let list = getStoredServicesFaqs();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('services_faqs')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        list = data.map(mapRowToFaq);
        if (typeof window !== 'undefined') {
          safeSetItem(STORAGE_KEY, JSON.stringify(list));
          window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: list }));
        }
      } else if (!error && Array.isArray(data) && data.length === 0) {
        const rows = INITIAL_SERVICES_FAQS.map(mapFaqToRow);
        await supabase.from('services_faqs').upsert(rows, { onConflict: 'id' });
      }
    } catch (err) {
      console.warn('Could not query services_faqs from Supabase:', err);
    }
  }

  return list;
};

export const saveAllServicesFaqs = async (faqs: ServiceFaqItem[]): Promise<boolean> => {
  if (typeof window !== 'undefined') {
    safeSetItem(STORAGE_KEY, JSON.stringify(faqs));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: faqs }));
  }

  if (isSupabaseConfigured()) {
    try {
      const rows = faqs.map(mapFaqToRow);
      const { error } = await supabase.from('services_faqs').upsert(rows, { onConflict: 'id' });
      if (error) {
        console.error('Supabase services_faqs save error:', error.message);
        return false;
      }
    } catch (err) {
      console.error('Failed to save services FAQs to Supabase:', err);
      return false;
    }
  }

  return true;
};

export const addServiceFaq = async (faqData: Omit<ServiceFaqItem, 'id'>): Promise<ServiceFaqItem> => {
  const current = getStoredServicesFaqs();
  const id = `faq-${faqData.category === 'pipeline-cleaning' ? 'pipe' : 'tank'}-${Date.now()}`;
  const newItem: ServiceFaqItem = {
    ...faqData,
    id,
    order: faqData.order ?? (current.length + 1),
    isActive: faqData.isActive !== undefined ? faqData.isActive : true
  };
  const updated = [...current, newItem];
  await saveAllServicesFaqs(updated);
  return newItem;
};

export const updateServiceFaq = async (id: string, updates: Partial<ServiceFaqItem>): Promise<boolean> => {
  const current = getStoredServicesFaqs();
  const idx = current.findIndex(f => f.id === id);
  if (idx === -1) return false;
  current[idx] = {
    ...current[idx],
    ...updates
  };
  return await saveAllServicesFaqs(current);
};

export const deleteServiceFaq = async (id: string): Promise<boolean> => {
  const current = getStoredServicesFaqs();
  const filtered = current.filter(f => f.id !== id);
  if (filtered.length === current.length) return false;
  await saveAllServicesFaqs(filtered);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('services_faqs').delete().eq('id', id);
    } catch (err) {
      console.warn('Failed to delete service FAQ from Supabase:', err);
    }
  }
  return true;
};

export const resetServicesFaqsToDefault = async (): Promise<ServiceFaqItem[]> => {
  await saveAllServicesFaqs(INITIAL_SERVICES_FAQS);
  return INITIAL_SERVICES_FAQS;
};

export const useServicesFaqs = () => {
  const [faqs, setFaqs] = useState<ServiceFaqItem[]>(() => getStoredServicesFaqs());

  useEffect(() => {
    fetchServicesFaqsFromSupabase().then(latest => {
      if (latest && latest.length > 0) {
        setFaqs(latest);
      }
    });

    const handleUpdate = (e: any) => {
      setFaqs(e.detail || getStoredServicesFaqs());
    };
    window.addEventListener(EVENT_NAME, handleUpdate);

    let channel: any = null;
    const realtimeTimer = setTimeout(() => {
      if (isSupabaseConfigured() && typeof window !== 'undefined') {
        try {
          channel = supabase
            .channel('realtime:services_faqs')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'services_faqs' },
              () => {
                fetchServicesFaqsFromSupabase();
              }
            )
            .subscribe();
        } catch (err) {
          console.warn('Realtime services_faqs notice:', err);
        }
      }
    }, 2500);

    return () => {
      clearTimeout(realtimeTimer);
      window.removeEventListener(EVENT_NAME, handleUpdate);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
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
