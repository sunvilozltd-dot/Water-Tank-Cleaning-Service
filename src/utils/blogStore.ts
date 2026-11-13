import { useState, useEffect } from 'react';
import { BlogPost } from '../types/blog';
import { safeGetItem, safeSetItem } from './safeLocalStorage';
import { WATER_TANK_ARTICLES } from '../data/waterTankArticles';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { enqueueIndexNowUrls } from '../services/indexnowService';

const BLOG_STORAGE_KEY = 'sunviloz_water_tank_articles_v2';
const BLOG_CHANGED_EVENT = 'sunviloz_blog_changed';

export const INITIAL_BLOG_POSTS: BlogPost[] = WATER_TANK_ARTICLES;

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
    images: Array.isArray(d.images) ? d.images : Array.isArray(seo.images) ? seo.images : [],
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
      images: Array.isArray(d.images) ? d.images : Array.isArray(seo.images) ? seo.images : []
    }
  };
}

function mapBlogPostToRow(p: BlogPost): any {
  const images = Array.isArray(p.images) ? p.images : Array.isArray(p.seo?.images) ? p.seo.images : [];
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
  if (typeof window === 'undefined') {
    return isSupabaseConfigured() ? [] : INITIAL_BLOG_POSTS;
  }
  try {
    const raw = safeGetItem(BLOG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse stored blog posts:', err);
  }
  return isSupabaseConfigured() ? [] : INITIAL_BLOG_POSTS;
};

export interface BlogFetchResult {
  posts: BlogPost[];
  fromDatabase: boolean;
  error?: string;
}

/**
 * Fetches blog posts from Supabase `blog_posts`.
 * - Separates DB/network failures (`fromDatabase: false, error`) from legitimate empty results (`posts: [], fromDatabase: true`).
 * - Never auto-reseeds or merges bundled articles on read.
 */
export const fetchBlogPostsWithStatus = async (
  options: { includeUnpublished?: boolean } = {}
): Promise<BlogFetchResult> => {
  const { includeUnpublished = false } = options;

  if (!isSupabaseConfigured()) {
    return {
      posts: INITIAL_BLOG_POSTS.filter(p => includeUnpublished || p.published),
      fromDatabase: false
    };
  }

  try {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false });

    if (!includeUnpublished) {
      query = query.eq('published', true);
    }

    const { data, error } = await query;

    if (error) {
      return {
        posts: getStoredBlogPosts(),
        fromDatabase: false,
        error: error.message
      };
    }

    const list = Array.isArray(data) ? data.map(mapRowToBlogPost) : [];

    if (typeof window !== 'undefined' && !includeUnpublished) {
      safeSetItem(BLOG_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent(BLOG_CHANGED_EVENT, { detail: list }));
    }

    return { posts: list, fromDatabase: true };
  } catch (err: any) {
    return {
      posts: getStoredBlogPosts(),
      fromDatabase: false,
      error: err?.message || 'Database connection error'
    };
  }
};

export const fetchBlogPostsFromSupabase = async (
  options: { includeUnpublished?: boolean } = {}
): Promise<BlogPost[]> => {
  const res = await fetchBlogPostsWithStatus(options);
  return res.posts;
};

export const saveAllBlogPosts = async (posts: BlogPost[]): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    if (typeof window !== 'undefined') {
      safeSetItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
      window.dispatchEvent(new CustomEvent(BLOG_CHANGED_EVENT, { detail: posts }));
    }
    return true;
  }

  if (posts.length === 0) {
    if (typeof window !== 'undefined') {
      safeSetItem(BLOG_STORAGE_KEY, JSON.stringify([]));
      window.dispatchEvent(new CustomEvent(BLOG_CHANGED_EVENT, { detail: [] }));
    }
    return true;
  }

  try {
    const rows = posts.map(mapBlogPostToRow);
    const { error } = await supabase.from('blog_posts').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.error('Failed to save blog posts to Supabase:', error.message);
      return false;
    }

    const publicPosts = posts.filter(p => p.published);
    if (typeof window !== 'undefined') {
      safeSetItem(BLOG_STORAGE_KEY, JSON.stringify(publicPosts));
      window.dispatchEvent(new CustomEvent(BLOG_CHANGED_EVENT, { detail: publicPosts }));
    }
    return true;
  } catch (err) {
    console.error('Failed to save blog posts:', err);
    return false;
  }
};

export const addBlogPost = async (postData: Omit<BlogPost, 'id' | 'publishedAt'>): Promise<BlogPost | null> => {
  const id = `post-${Date.now()}`;
  const newPost: BlogPost = {
    ...postData,
    id,
    publishedAt: new Date().toISOString().split('T')[0],
    published: postData.published ?? true
  };

  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('blog_posts').upsert([mapBlogPostToRow(newPost)], { onConflict: 'id' });
    if (error) {
      console.error('Failed to insert blog post:', error.message);
      return null;
    }
    await fetchBlogPostsWithStatus({ includeUnpublished: false });
  } else {
    const current = getStoredBlogPosts();
    const updated = [newPost, ...current];
    if (typeof window !== 'undefined') {
      safeSetItem(BLOG_STORAGE_KEY, JSON.stringify(updated.filter(p => p.published)));
      window.dispatchEvent(new CustomEvent(BLOG_CHANGED_EVENT, { detail: updated.filter(p => p.published) }));
    }
  }

  if (newPost.published && newPost.slug) {
    enqueueIndexNowUrls([`/blog/${newPost.slug}`, '/blog'], {
      action: 'publish_blog_post',
      entityType: 'blog_post',
      entitySlug: newPost.slug,
      verifyPublic: true
    }).catch(() => {});
  }

  return newPost;
};

export const updateBlogPost = async (id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> => {
  const existingRes = await fetchBlogPostsWithStatus({ includeUnpublished: true });
  const current = existingRes.posts;
  const index = current.findIndex(p => p.id === id);
  if (index === -1) return null;

  const updatedPost: BlogPost = {
    ...current[index],
    ...updates
  };

  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('blog_posts').upsert([mapBlogPostToRow(updatedPost)], { onConflict: 'id' });
    if (error) {
      console.error('Failed to update blog post:', error.message);
      return null;
    }
    await fetchBlogPostsWithStatus({ includeUnpublished: false });
  } else {
    current[index] = updatedPost;
    const publicList = current.filter(p => p.published);
    if (typeof window !== 'undefined') {
      safeSetItem(BLOG_STORAGE_KEY, JSON.stringify(publicList));
      window.dispatchEvent(new CustomEvent(BLOG_CHANGED_EVENT, { detail: publicList }));
    }
  }

  if (updatedPost.slug) {
    enqueueIndexNowUrls([`/blog/${updatedPost.slug}`, '/blog'], {
      action: updatedPost.published ? 'publish_blog_post' : 'unpublish_blog_post',
      entityType: 'blog_post',
      entitySlug: updatedPost.slug,
      verifyPublic: Boolean(updatedPost.published)
    }).catch(() => {});
  }

  return updatedPost;
};

export const deleteBlogPost = async (id: string, slugHint?: string): Promise<boolean> => {
  let targetSlug = slugHint || '';

  if (isSupabaseConfigured()) {
    const { data: existingRow } = await supabase.from('blog_posts').select('slug').eq('id', id).maybeSingle();
    if (existingRow?.slug) targetSlug = existingRow.slug;

    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete blog post from Supabase:', error.message);
      return false;
    }
    await fetchBlogPostsWithStatus({ includeUnpublished: false });
  } else {
    const current = getStoredBlogPosts();
    const matched = current.find(p => p.id === id);
    if (matched?.slug) targetSlug = matched.slug;
    const filtered = current.filter(p => p.id !== id);
    if (typeof window !== 'undefined') {
      safeSetItem(BLOG_STORAGE_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent(BLOG_CHANGED_EVENT, { detail: filtered }));
    }
  }

  enqueueIndexNowUrls(['/blog', ...(targetSlug ? [`/blog/${targetSlug}`] : [])], {
    action: 'delete_blog_post',
    entityType: 'blog_post',
    entitySlug: targetSlug || id,
    verifyPublic: false
  }).catch(() => {});

  return true;
};

/**
 * Explicit admin-triggered seed utility (insert-only, ignores existing slugs/IDs).
 */
export const seedDefaultBlogPosts = async (): Promise<{ success: boolean; count: number; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, count: 0, error: 'Supabase সংযুক্ত নয়।' };
  }
  const rows = INITIAL_BLOG_POSTS.map(mapBlogPostToRow);
  const { error } = await supabase.from('blog_posts').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
  if (error) return { success: false, count: 0, error: error.message };
  await fetchBlogPostsWithStatus({ includeUnpublished: false });
  return { success: true, count: rows.length };
};

export const useBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>(() => getStoredBlogPosts());
  const [loading, setLoading] = useState<boolean>(() => isSupabaseConfigured());
  const [fromDatabase, setFromDatabase] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadLatest = async () => {
    const res = await fetchBlogPostsWithStatus({ includeUnpublished: false });
    setPosts(res.posts);
    setFromDatabase(res.fromDatabase);
    setError(res.error || null);
    setLoading(false);
  };

  useEffect(() => {
    loadLatest();

    const handleUpdate = (e: any) => {
      if (Array.isArray(e?.detail)) {
        setPosts(e.detail);
      } else {
        setPosts(getStoredBlogPosts());
      }
    };
    window.addEventListener(BLOG_CHANGED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    let channel: any = null;
    const realtimeTimer = setTimeout(() => {
      if (isSupabaseConfigured() && typeof window !== 'undefined') {
        try {
          channel = supabase
            .channel('realtime:blog_posts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_posts' }, () => {
              loadLatest();
            })
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
    loading,
    fromDatabase,
    error,
    addPost: addBlogPost,
    updatePost: updateBlogPost,
    deletePost: deleteBlogPost,
    refreshPosts: loadLatest
  };
};

export const getBlogPosts = getStoredBlogPosts;

export const saveBlogPost = async (post: BlogPost): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    const { data: existing } = await supabase.from('blog_posts').select('id').eq('id', post.id).maybeSingle();
    if (existing) {
      const updated = await updateBlogPost(post.id, post);
      return Boolean(updated);
    }
    const row = mapBlogPostToRow(post);
    const { error } = await supabase.from('blog_posts').upsert([row], { onConflict: 'id' });
    if (error) {
      console.error('Failed to save blog post:', error.message);
      return false;
    }
    await fetchBlogPostsWithStatus({ includeUnpublished: false });
    if (post.published && post.slug) {
      enqueueIndexNowUrls([`/blog/${post.slug}`, '/blog'], {
        action: 'publish_blog_post',
        entityType: 'blog_post',
        entitySlug: post.slug,
        verifyPublic: true
      }).catch(() => {});
    }
    return true;
  }

  const all = getStoredBlogPosts();
  const index = all.findIndex(p => p.id === post.id);
  if (index >= 0) {
    return Boolean(await updateBlogPost(post.id, post));
  }
  return Boolean(await addBlogPost(post));
};
