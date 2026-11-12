import { useState, useEffect } from 'react';
import { BlogPost } from '../types/blog';
import { safeGetItem, safeSetItem } from './safeLocalStorage';
import { WATER_TANK_ARTICLES } from '../data/waterTankArticles';

const BLOG_STORAGE_KEY = 'sunviloz_water_tank_articles_v2';
const BLOG_CHANGED_EVENT = 'sunviloz_blog_changed';

export const INITIAL_BLOG_POSTS: BlogPost[] = WATER_TANK_ARTICLES;

import { supabase, isSupabaseConfigured } from './supabaseClient';

function mapRowToBlogPost(d: any): BlogPost {
  const seo = d.seo || {};
  return {
    id: d.id,
    slug: d.slug,
    category: d.category || 'Water Tank Cleaning',
    categoryBn: d.category_bn || d.category || 'পানির ট্যাংক পরিষ্কার',
    title: d.title,
    titleBn: d.title_bn || d.title,
    excerpt: d.excerpt || '',
    excerptBn: d.excerpt_bn || d.excerpt || '',
    content: d.content || '',
    contentBn: d.content_bn || d.content || '',
    imageUrl: d.image_url || '',
    imageAlt: d.image_alt || seo.imageAlt || '',
    imageCaption: d.image_caption || seo.imageCaption || '',
    images: Array.isArray(d.images) ? d.images : (Array.isArray(seo.images) ? seo.images : []),
    author: d.author || 'সানভিলোজ হাইজিন টিম',
    publishedAt: d.published_at || new Date().toISOString().slice(0, 10),
    readTime: d.read_time || '5 min read',
    readTimeBn: d.read_time_bn || '৫ মিনিট পাঠ',
    featured: Boolean(d.featured),
    published: d.published !== false,
    seo: {
      metaTitle: seo.metaTitle || '',
      metaDescription: seo.metaDescription || '',
      keywords: Array.isArray(seo.keywords) ? seo.keywords : [],
      canonicalUrl: seo.canonicalUrl || `https://sunvilozcleancare.com/blog/${d.slug}`,
      imageAlt: d.image_alt || seo.imageAlt || '',
      imageCaption: d.image_caption || seo.imageCaption || '',
      images: Array.isArray(d.images) ? d.images : (Array.isArray(seo.images) ? seo.images : [])
    }
  };
}

function mapBlogPostToRow(p: BlogPost): any {
  const images = Array.isArray(p.images) ? p.images : (Array.isArray(p.seo?.images) ? p.seo.images : []);
  const imageAlt = p.imageAlt || p.seo?.imageAlt || '';
  const imageCaption = p.imageCaption || p.seo?.imageCaption || '';

  return {
    id: p.id,
    slug: p.slug,
    category: p.category,
    category_bn: p.categoryBn,
    title: p.title,
    title_bn: p.titleBn,
    excerpt: p.excerpt,
    excerpt_bn: p.excerptBn,
    content: p.content,
    content_bn: p.contentBn,
    image_url: p.imageUrl,
    author: p.author,
    published_at: p.publishedAt,
    read_time: p.readTime,
    read_time_bn: p.readTimeBn,
    featured: p.featured,
    published: p.published,
    seo: {
      ...(p.seo || {}),
      imageAlt,
      imageCaption,
      images
    },
    updated_at: new Date().toISOString()
  };
}

export const getStoredBlogPosts = (): BlogPost[] => {
  if (typeof window === 'undefined') return INITIAL_BLOG_POSTS;
  try {
    const raw = safeGetItem(BLOG_STORAGE_KEY);
    if (!raw) {
      safeSetItem(BLOG_STORAGE_KEY, JSON.stringify(INITIAL_BLOG_POSTS));
      return INITIAL_BLOG_POSTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_BLOG_POSTS;
  } catch (err) {
    console.error('Failed to parse stored blog posts:', err);
    return INITIAL_BLOG_POSTS;
  }
};

const BLOG_BUCKET = 'site-media';
const BLOG_CONFIG_PATH = 'config/blog_posts.json';

export const fetchBlogPostsFromSupabase = async (): Promise<BlogPost[]> => {
  let list = getStoredBlogPosts();

  if (isSupabaseConfigured()) {
    let loadedFromDb = false;

    // 1. Try querying Postgres blog_posts table if present
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        list = data.map(mapRowToBlogPost);
        loadedFromDb = true;
        if (typeof window !== 'undefined') {
          safeSetItem(BLOG_STORAGE_KEY, JSON.stringify(list));
          window.dispatchEvent(new CustomEvent(BLOG_CHANGED_EVENT, { detail: list }));
        }
      }
    } catch {
      // Postgres table optional fallback
    }

    // 2. Authoritative Supabase Storage fallback (without public seeding)
    if (!loadedFromDb) {
      try {
        const { data, error } = await supabase.storage
          .from(BLOG_BUCKET)
          .download(BLOG_CONFIG_PATH);

        if (!error && data) {
          const text = await data.text();
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed;
            if (typeof window !== 'undefined') {
              safeSetItem(BLOG_STORAGE_KEY, JSON.stringify(list));
              window.dispatchEvent(new CustomEvent(BLOG_CHANGED_EVENT, { detail: list }));
            }
          }
        }
      } catch (storageErr) {
        console.warn('Storage blog_posts read notice:', storageErr);
      }
    }
  }

  return list;
};

export const saveAllBlogPosts = async (posts: BlogPost[]): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    // Local-only environment
    if (typeof window !== 'undefined') {
      safeSetItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
      window.dispatchEvent(new CustomEvent(BLOG_CHANGED_EVENT, { detail: posts }));
    }
    return true;
  }

  let cloudSaveSuccess = false;

  // 1. Save to Supabase Storage config file (primary authoritative cloud file)
  try {
    const jsonStr = JSON.stringify(posts, null, 2);
    const { error: storageError } = await supabase.storage
      .from(BLOG_BUCKET)
      .upload(BLOG_CONFIG_PATH, jsonStr, {
        upsert: true,
        contentType: 'application/json'
      });

    if (!storageError) {
      cloudSaveSuccess = true;
    } else {
      console.warn('Supabase storage blog upload notice:', storageError.message);
    }
  } catch (err) {
    console.warn('Supabase storage blog upload error:', err);
  }

  // 2. Also try upserting to Postgres table if table exists
  try {
    const rows = posts.map(mapBlogPostToRow);
    const { error: dbError } = await supabase.from('blog_posts').upsert(rows, { onConflict: 'id' });
    if (!dbError) {
      cloudSaveSuccess = true;
    }
  } catch {
    // Postgres table may not exist
  }

  // 3. Only update local cache and report success if at least one cloud write succeeded
  if (cloudSaveSuccess) {
    if (typeof window !== 'undefined') {
      safeSetItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
      window.dispatchEvent(new CustomEvent(BLOG_CHANGED_EVENT, { detail: posts }));
    }
    return true;
  } else {
    console.error('Failed to save blog posts: Cloud write failed on both Storage and Database.');
    return false;
  }
};

export const addBlogPost = async (postData: Omit<BlogPost, 'id' | 'publishedAt'>): Promise<BlogPost> => {
  const current = getStoredBlogPosts();
  const id = `post-${Date.now()}`;
  const newPost: BlogPost = {
    ...postData,
    id,
    publishedAt: new Date().toISOString().split('T')[0],
    published: postData.published ?? true
  };
  const updated = [newPost, ...current];
  await saveAllBlogPosts(updated);
  return newPost;
};

export const updateBlogPost = async (id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> => {
  const current = getStoredBlogPosts();
  const index = current.findIndex(p => p.id === id);
  if (index === -1) return null;
  const updatedPost: BlogPost = {
    ...current[index],
    ...updates
  };
  current[index] = updatedPost;
  await saveAllBlogPosts([...current]);
  return updatedPost;
};

export const deleteBlogPost = async (id: string): Promise<boolean> => {
  const current = getStoredBlogPosts();
  const filtered = current.filter(p => p.id !== id);
  if (filtered.length === current.length) return false;
  await saveAllBlogPosts(filtered);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('blog_posts').delete().eq('id', id);
    } catch (err) {
      console.warn('Failed to delete blog post from Supabase:', err);
    }
  }
  return true;
};

export const useBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>(() => getStoredBlogPosts());

  useEffect(() => {
    fetchBlogPostsFromSupabase().then(latest => {
      if (latest && latest.length > 0) {
        setPosts(latest);
      }
    });

    const handleUpdate = () => {
      setPosts(getStoredBlogPosts());
    };
    window.addEventListener(BLOG_CHANGED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    let channel: any = null;
    const realtimeTimer = setTimeout(() => {
      if (isSupabaseConfigured() && typeof window !== 'undefined') {
        try {
          channel = supabase
            .channel('realtime:blog_posts')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'blog_posts' },
              () => {
                fetchBlogPostsFromSupabase();
              }
            )
            .subscribe();
        } catch (err) {
          console.warn('Realtime blog_posts notice:', err);
        }
      }
    }, 2500);

    return () => {
      clearTimeout(realtimeTimer);
      window.removeEventListener(BLOG_CHANGED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      if (channel) {
        supabase.removeChannel(channel);
      }
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

export const saveBlogPost = async (post: BlogPost): Promise<boolean> => {
  const all = getStoredBlogPosts();
  const index = all.findIndex(p => p.id === post.id);
  if (index >= 0) {
    await updateBlogPost(post.id, post);
    return true;
  } else {
    await addBlogPost(post);
    return true;
  }
};
