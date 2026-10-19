import { useState, useEffect } from 'react';
import { BlogPost } from '../types/blog';
import { safeGetItem, safeSetItem } from './safeLocalStorage';

const BLOG_STORAGE_KEY = 'sunviloz_blog_posts_v1';
const BLOG_CHANGED_EVENT = 'sunviloz_blog_changed';

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'bed-bugs-bedroom-silent-enemy-signs-home-remedies',
    category: 'Cleaning Tips',
    categoryBn: 'ক্লিনিং টিপস',
    title: "Bed Bugs - Your Bedroom's Silent Enemy: Spot the Signs & Beat Them with Easy Home Remedies",
    titleBn: 'ছাড়পোকা—বেডরুমের নীরব শত্রু: প্রাথমিক লক্ষণ ও কার্যকর ঘরোয়া সমাধান',
    excerpt: "No matter how clean you keep your home, a single lapse is all it takes for bed bugs to move in. Discover proven preventive measures and eradication tactics.",
    excerptBn: 'ঘর যত পরিষ্কারই থাকুক, একটু অসাবধানতায় বিছানায় বিস্তার করতে পারে ছাড়পোকা। জেনে নিন এর লক্ষণ ও প্রতিরোধের আধুনিক উপায়।',
    content: `## Bed Bugs – Your Bedroom's Silent Enemy

Bed bugs are notorious hitchhikers. Whether brought in on luggage after a trip, through public transport, or from pre-owned furniture, these tiny nocturnal pests can rapidly infest mattresses, bed frames, and sofa crevices.

### 1. Recognizing the Early Warning Signs
* **Unexplained Itchy Bites:** Clusters or lines of small, red itchy welts on exposed skin after waking up.
* **Rust-Colored Spots:** Tiny blood specks or dark fecal stains on your bed sheets and mattress piping.
* **Musty Odor:** A distinct, sweet yet pungent odor produced by large bed bug colonies.

### 2. Immediate Home Remedies You Can Try
1. **High-Heat Steam Cleaning:** Bed bugs and their eggs die when exposed to temperatures exceeding 60°C (140°F). Use a high-temperature steam cleaner on mattress seams and furniture joints.
2. **Hot Water Washing:** Launder all bedding, pillowcases, and curtains in hot water and dry on maximum heat for at least 30 minutes.
3. **Mattress Encasements:** Seal your mattress and box spring in zippered, bed bug-proof protective covers to trap existing bugs and prevent new infestations.

### 3. When to Seek Professional Deep Cleaning
Home remedies help control mild surface presence, but eggs hidden deep inside wooden slats or sofa cushions require professional deep extraction, industrial vacuuming, and targeted sanitization treatments.`,
    contentBn: `## ছাড়পোকা – বেডরুমের নীরব শত্রু

ছাড়পোকা একবার ঘরে প্রবেশ করলে তা ম্যাট্রেস, খাটের কোণা ও সোফায় দ্রুত ডিম পেড়ে বংশবিস্তার করে।

### প্রাথমিক লক্ষণসমূহ
* ঘুম থেকে ওঠার পর শরীরের চামড়ায় লালচে চুলকানির ফোস্কা
* বেডশিট বা বালিশের কভারে ছোট ছোট রক্তের ছোপ
* বেডরুমের কোণায় ভ্যাপসা মিষ্টি ধরনের আঁশটে গন্ধ

### ঘরোয়া কার্যকর টিপস
1. **উচ্চ তাপমাত্রার বাষ্প:** গরম স্টিম ক্লিনার দিয়ে তোশক ও খাটের জোড়াগুলো ভালোমতো বাষ্পায়িত করুন।
2. **গরম পানিতে ধোয়া:** বিছানার চাদর ও বালিশের কভার নিয়মিত গরম পানিতে ধুয়ে রোদে শুকান।
3. **প্রফেশনাল ডিপ ক্লিনিং:** সমস্যা বেশি হলে বিশেষায়িত সাকশন ও কীট-রোধী নিরাপদ স্যানিটাইজেশন প্রয়োজন।`,
    imageUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=800&q=75',
    author: 'Sunviloz Hygiene Experts',
    publishedAt: '2026-03-24',
    readTime: '4 min read',
    readTimeBn: '৪ মিনিট পাঠ',
    featured: true,
    published: true,
    seo: {
      metaTitle: "Bed Bugs Symptoms & Remedies | Home Cleaning Guide Dhaka",
      metaDescription: "Learn how to spot early signs of bed bugs and practical home remedies to protect your bedroom and furniture.",
      keywords: ['bed bugs dhaka', 'cleaning tips', 'sofa cleaning dhaka', 'home disinfection']
    }
  },
  {
    id: 'post-2',
    slug: 'dont-destroy-your-assets-to-save-money-cheap-cleaning-risks',
    category: 'Cleaning Tips',
    categoryBn: 'ক্লিনিং টিপস',
    title: "Don't Destroy Your Assets to Save Money – Risks of Untrained Tank Cleaners in Dhaka",
    titleBn: 'সামান্য টাকা বাঁচাতে নিজের বাড়ি বা সম্পদ নষ্ট করবেন না – অদক্ষ ট্যাংক পরিষ্কারের ঝুঁকি',
    excerpt: "Thousands of Dhaka households make the same expensive mistake every year by choosing untrained cleaners who use harsh acids that permanently damage tank waterproofing.",
    excerptBn: 'সুলভ মূল্যে অদক্ষ লোক দিয়ে ট্যাংক পরিষ্কার করাতে গিয়ে তীব্র অ্যাসিডে ট্যাংক ও প্লাম্বিং নষ্ট করার ভুল থেকে সতর্ক থাকুন।',
    content: `## Don't Destroy Your Assets to Save Money

When managing property in Dhaka, it is tempting to hire day-laborers offering dirt-cheap rates for water tank cleaning. However, an untrained crew lacking proper machinery often inflicts irreversible damage.

### 1. Acid Corrosion on Tank Waterproofing & Concrete
Untrained sweepers frequently use raw industrial hydrochloric acid inside water tanks to scrub stains rapidly. 
* **The Damage:** Acid strips the protective cement slurry coat, degrades the concrete matrix, creates micro-cracks, and causes chronic water seepage into the building structure.
* **The Safe Method:** Sunviloz Clean Care utilizes rotary high-pressure water jets and food-grade safe biological descaling agents that preserve tank walls.

### 2. High-Pressure Lance Misuse on PVC Tanks
Overhead plastic and PVC tanks have precise wall thickness. Improper lance tips or abrasive metal wire brushes puncture or weaken the polymer layer, inviting rapid algae penetration and micro-plastic leaching into your drinking water.

### 3. Cross-Contamination from Dirty Equipment
Budget cleaners often reuse the same dirty buckets and contaminated hoses across multiple buildings. Instead of cleaning your water supply, they introduce WASA sludge residues and coliform bacteria.`,
    contentBn: `## অল্প টাকা বাঁচাতে কোটি টাকার সম্পত্তি নষ্ট করবেন না

প্রতি বছর ঢাকা শহরের অনেক বাড়ির মালিক সস্তা ভাড়ায় অদক্ষ কাজের লোক দিয়ে ট্যাংক পরিষ্কার করিয়ে বড় ধরনের ক্ষতির সম্মুখীন হন।

### ১. কাঁচা অ্যাসিড দিয়ে ওয়াটারপ্রুফিং ধ্বংস
অদক্ষ লোকেরা দ্রুত দাগ তোলার জন্য তীব্র অ্যাসিড ব্যবহার করে। এর ফলে আরসিসি ট্যাংকের সিমেন্টের সিল নষ্ট হয়ে দেয়ালে ফাটল ধরে এবং ঘরের দেয়ালে সিপেজ (Seepage) শুরু হয়।

### ২. তারের ব্রাশে প্লাস্টিক নষ্ট
তারের ধারালো ব্রাশ দিয়ে ঘষলে পিভিসি ট্যাংকের ভেতরের কোটিং উঠে যায়, ফলে পরবর্তীতে আরও দ্রুত শ্যাওলা জন্মায়।

### ৩. সঠিক সমাধান
সানভিলোজ ক্লিন কেয়ার কোনো ক্ষতিকর অ্যাসিড ব্যবহার করে না। আমরা ১৫০ বার রোটারি পানির প্রেসারে ট্যাংকের দেয়াল নিরাপদ রেখে ফুড-গ্রেড জীবাণুনাশক দিয়ে পরিষ্কার করি।`,
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=75',
    author: 'Engr. Rafiqul Islam, Technical Lead',
    publishedAt: '2026-03-20',
    readTime: '5 min read',
    readTimeBn: '৫ মিনিট পাঠ',
    featured: true,
    published: true,
    seo: {
      metaTitle: "Risks of Cheap Water Tank Cleaning in Dhaka | Dhaka Cleaners",
      metaDescription: "Understand the hidden costs of cheap cleaning services: acid damage, structural seepage, and bacteria recurrence.",
      keywords: ['cheap tank cleaning risks', 'safe water tank cleaning', 'dhaka tank maintenance']
    }
  }
];

export const getStoredBlogPosts = (): BlogPost[] => {
  if (typeof window === 'undefined') return INITIAL_BLOG_POSTS;
  try {
    const raw = safeGetItem(BLOG_STORAGE_KEY);
    if (!raw) {
      safeSetItem(BLOG_STORAGE_KEY, JSON.stringify(INITIAL_BLOG_POSTS));
      return INITIAL_BLOG_POSTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_BLOG_POSTS;
  } catch (err) {
    console.error('Failed to parse stored blog posts:', err);
    return INITIAL_BLOG_POSTS;
  }
};

export const saveAllBlogPosts = (posts: BlogPost[]) => {
  if (typeof window === 'undefined') return;
  try {
    safeSetItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
    window.dispatchEvent(new CustomEvent(BLOG_CHANGED_EVENT, { detail: posts }));
  } catch (err) {
    console.error('Failed to save blog posts:', err);
  }
};

export const addBlogPost = (postData: Omit<BlogPost, 'id' | 'publishedAt'>): BlogPost => {
  const current = getStoredBlogPosts();
  const id = `post-${Date.now()}`;
  const newPost: BlogPost = {
    ...postData,
    id,
    publishedAt: new Date().toISOString().split('T')[0],
    published: postData.published ?? true
  };
  const updated = [newPost, ...current];
  saveAllBlogPosts(updated);
  return newPost;
};

export const updateBlogPost = (id: string, updates: Partial<BlogPost>): BlogPost | null => {
  const current = getStoredBlogPosts();
  const index = current.findIndex(p => p.id === id);
  if (index === -1) return null;
  const updatedPost: BlogPost = {
    ...current[index],
    ...updates
  };
  current[index] = updatedPost;
  saveAllBlogPosts([...current]);
  return updatedPost;
};

export const deleteBlogPost = (id: string): boolean => {
  const current = getStoredBlogPosts();
  const filtered = current.filter(p => p.id !== id);
  if (filtered.length === current.length) return false;
  saveAllBlogPosts(filtered);
  return true;
};

export const useBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>(() => getStoredBlogPosts());

  useEffect(() => {
    const handleUpdate = () => {
      setPosts(getStoredBlogPosts());
    };
    window.addEventListener(BLOG_CHANGED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(BLOG_CHANGED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    posts,
    publishedPosts: posts.filter(p => p.published),
    addPost: addBlogPost,
    updatePost: updateBlogPost,
    deletePost: deleteBlogPost,
    refreshPosts: () => setPosts(getStoredBlogPosts())
  };
};

export const getBlogPosts = getStoredBlogPosts;

export const saveBlogPost = (post: BlogPost): boolean => {
  const all = getStoredBlogPosts();
  const index = all.findIndex(p => p.id === post.id);
  if (index >= 0) {
    updateBlogPost(post.id, post);
    return true;
  } else {
    addBlogPost(post);
    return true;
  }
};
