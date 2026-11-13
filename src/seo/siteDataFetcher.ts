import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FullSiteConfig } from '../types/siteConfig';
import { ZoneAreaContent, ZoneAreaRecord, UrlRedirectRecord } from '../services/zoneContentService';
import { getProductionDomain } from '../config/siteDomain';

export interface LiveServiceSummary {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  shortDesc: string;
  shortDescBn: string;
  metaTitle?: string;
  metaDesc?: string;
  image?: string;
  updatedAt?: string;
  publishedAt?: string;
  processSteps?: string[];
}

export interface LiveZoneSummary {
  slug: string;
  nameEn: string;
  nameBn: string;
  placesText: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface LiveBlogArticleSummary {
  id: string;
  slug: string;
  title: string;
  titleBn?: string;
  excerpt: string;
  excerptBn?: string;
  publishedAt?: string;
  updatedAt?: string;
  imageUrl?: string;
  category?: string;
  readTime?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface FetchStatusFlags {
  configured: boolean;
  siteSettingsOk: boolean;
  zonesOk: boolean;
  areasOk: boolean;
  servicesOk: boolean;
  blogPostsOk: boolean;
  redirectsOk: boolean;
  homepageSectionsOk: boolean;
  imageRegistryOk: boolean;
  usedLastKnownGood?: boolean;
  staleSlices?: string[];
  errors: string[];
}

export interface LiveSeoDataset {
  siteConfig: Partial<FullSiteConfig> | null;
  siteConfigUpdatedAt?: string;
  zones: LiveZoneSummary[];
  areas: ZoneAreaRecord[];
  services: LiveServiceSummary[];
  blogPosts: LiveBlogArticleSummary[];
  redirects: UrlRedirectRecord[];
  homepageSections: any[];
  homepageRevision: any | null;
  imageRegistry: {
    version?: number;
    updatedAt?: string;
    serviceImages: Record<string, string>;
    siteImages: Record<string, string>;
    heroVideos: Record<string, string>;
  } | null;
  status: FetchStatusFlags;
}

export type SeoSliceName =
  | 'siteSettings'
  | 'zones'
  | 'areas'
  | 'services'
  | 'blogPosts'
  | 'redirects'
  | 'homepageSections'
  | 'imageRegistry';

export interface FetchLiveSeoOptions {
  useLastKnownGood?: boolean;
  cacheLastKnownGood?: boolean;
}

const DEFAULT_SUPABASE_URL = 'https://ldzhzeyeuthdkobzxzlm.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkemh6ZXlldXRoZGtvYnp4emxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NDI3NjAsImV4cCI6MjEwOTExODc2MH0.lwdie6wt0M8nxjgeo0Z_DfEiYz5iKc5pWa5St9qOazY';

const LKG_MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface LkgSliceStore {
  siteSettings?: { value: Partial<FullSiteConfig> | null; updatedAt?: string; savedAt: number };
  zones?: { value: LiveZoneSummary[]; savedAt: number };
  areas?: { value: ZoneAreaRecord[]; savedAt: number };
  services?: { value: LiveServiceSummary[]; savedAt: number };
  blogPosts?: { value: LiveBlogArticleSummary[]; savedAt: number };
  redirects?: { value: UrlRedirectRecord[]; savedAt: number };
  homepageSections?: { value: any[]; revision: any | null; savedAt: number };
  imageRegistry?: { value: LiveSeoDataset['imageRegistry']; savedAt: number };
}

const lastKnownGoodStore: LkgSliceStore = {};

export function clearLastKnownGoodCache(): void {
  delete lastKnownGoodStore.siteSettings;
  delete lastKnownGoodStore.zones;
  delete lastKnownGoodStore.areas;
  delete lastKnownGoodStore.services;
  delete lastKnownGoodStore.blogPosts;
  delete lastKnownGoodStore.redirects;
  delete lastKnownGoodStore.homepageSections;
  delete lastKnownGoodStore.imageRegistry;
}

function isFreshLkg(entry: { savedAt: number } | undefined, nowMs: number): boolean {
  return Boolean(entry && nowMs - entry.savedAt <= LKG_MAX_AGE_MS);
}

export function isSliceAvailable(status: FetchStatusFlags, slice: SeoSliceName): boolean {
  const okMap: Record<SeoSliceName, boolean> = {
    siteSettings: status.siteSettingsOk,
    zones: status.zonesOk,
    areas: status.areasOk,
    services: status.servicesOk,
    blogPosts: status.blogPostsOk,
    redirects: status.redirectsOk,
    homepageSections: status.homepageSectionsOk,
    imageRegistry: status.imageRegistryOk
  };
  if (okMap[slice]) return true;
  return Boolean(status.staleSlices?.includes(slice));
}

export function hasUnrecoveredCriticalFailure(
  status: FetchStatusFlags,
  requiredSlices: SeoSliceName[]
): boolean {
  if (!status.configured) return true;
  return requiredSlices.some(slice => !isSliceAvailable(status, slice));
}

async function safeQuery<T = any>(
  promiseLike: PromiseLike<{ data: T; error: { message?: string } | null }>
): Promise<{ data: T | null; error: { message: string } | null }> {
  try {
    const res = await promiseLike;
    if (res?.error) {
      return { data: null, error: { message: res.error.message || 'Database query error' } };
    }
    return { data: res?.data ?? null, error: null };
  } catch (err: any) {
    return {
      data: null,
      error: { message: err?.message || 'Database network/connection failure' }
    };
  }
}

export function createServerSupabaseClient(): { client: SupabaseClient; configured: boolean } {
  const url = String(
    (typeof process !== 'undefined' && process.env
      ? process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
      : '') || DEFAULT_SUPABASE_URL
  ).trim();

  // Prefer server service role key when running strictly on the server (API routes / build)
  const serverRoleKey =
    typeof process !== 'undefined' && process.env
      ? String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
      : '';

  const anonKey = String(
    (typeof process !== 'undefined' && process.env
      ? process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
      : '') || DEFAULT_SUPABASE_ANON_KEY
  ).trim();

  const key = serverRoleKey || anonKey;
  const configured = Boolean(url && key && !url.includes('your-project') && !url.includes('placeholder'));

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  return { client, configured };
}

function normalizeZoneAreaRow(row: any): ZoneAreaRecord {
  const pubData: ZoneAreaContent = {
    title: row.published_data?.title || `Water Tank Cleaning Service in ${row.area_name} | SUNVILOZ CLEAN CARE`,
    titleBn: row.published_data?.titleBn || `${row.area_name_bn} এলাকায় পানির ট্যাংক পরিষ্কার সার্ভিস`,
    metaDesc:
      row.published_data?.metaDesc ||
      `Water tank cleaning and pipeline cleaning service in ${row.area_name}.`,
    seoTitle: row.published_data?.seoTitle || row.published_data?.title,
    ogTitle: row.published_data?.ogTitle,
    ogDescription: row.published_data?.ogDescription,
    ogImage: row.published_data?.ogImage,
    ogImageAlt: row.published_data?.ogImageAlt,
    heroImage: row.published_data?.heroImage,
    heroImageAlt: row.published_data?.heroImageAlt,
    intro: row.published_data?.intro || '',
    introBn: row.published_data?.introBn || '',
    waterProblemsBn: row.published_data?.waterProblemsBn || '',
    waterProblemsEn: row.published_data?.waterProblemsEn || '',
    potentialCausesBn: row.published_data?.potentialCausesBn || '',
    potentialCausesEn: row.published_data?.potentialCausesEn || '',
    waterConditionNote: row.published_data?.waterConditionNote || '',
    waterConditionNoteBn: row.published_data?.waterConditionNoteBn || '',
    practicalAdviceBn: row.published_data?.practicalAdviceBn || '',
    practicalAdviceEn: row.published_data?.practicalAdviceEn || '',
    verifiedFindings: Array.isArray(row.published_data?.verifiedFindings) ? row.published_data.verifiedFindings : [],
    coverageDetails: Array.isArray(row.published_data?.coverageDetails) ? row.published_data.coverageDetails : [],
    pricingFactors: Array.isArray(row.published_data?.pricingFactors) ? row.published_data.pricingFactors : [],
    faqs: Array.isArray(row.published_data?.faqs) ? row.published_data.faqs : []
  };

  return {
    id: row.id,
    zoneId: row.zone_id || '',
    zoneSlug: row.zone_slug || '',
    slug: row.slug,
    areaName: row.area_name,
    areaNameBn: row.area_name_bn,
    isCoreCity: Boolean(row.is_core_city),
    isVisible: row.is_visible !== false,
    status: row.status === 'draft' ? 'draft' : 'published',
    sortOrder: Number(row.sort_order ?? 1),
    version: Number(row.version ?? 1),
    publishedAt: row.published_at || undefined,
    updatedAt: row.updated_at || undefined,
    draftData: pubData,
    publishedData: pubData
  };
}

/**
 * Fetches live authoritative public data from Supabase.
 * - Strictly separates query/network failures (`*Ok: false`) from legitimate empty results (`[]`).
 * - Never merges bundled demo articles or default areas onto successful DB responses.
 * - Supports per-slice last-known-good (LKG) fallback ONLY when a DB query fails, never when it succeeds with `[]`.
 * - Uses `published = true` for blog_posts and `is_active = true` for services.
 */
export async function fetchLiveSeoDataset(
  customClient?: SupabaseClient,
  options: FetchLiveSeoOptions = {}
): Promise<LiveSeoDataset> {
  const resolved = customClient ? { client: customClient, configured: true } : createServerSupabaseClient();
  const db = resolved.client;
  const useLastKnownGood = options.useLastKnownGood ?? !customClient;
  const cacheLastKnownGood = options.cacheLastKnownGood ?? !customClient;
  const nowMs = Date.now();

  const status: FetchStatusFlags = {
    configured: resolved.configured,
    siteSettingsOk: false,
    zonesOk: false,
    areasOk: false,
    servicesOk: false,
    blogPostsOk: false,
    redirectsOk: false,
    homepageSectionsOk: false,
    imageRegistryOk: false,
    usedLastKnownGood: false,
    staleSlices: [],
    errors: []
  };

  const dataset: LiveSeoDataset = {
    siteConfig: null,
    zones: [],
    areas: [],
    services: [],
    blogPosts: [],
    redirects: [],
    homepageSections: [],
    homepageRevision: null,
    imageRegistry: null,
    status
  };

  if (!resolved.configured) {
    status.errors.push('Supabase client is not configured');
    return dataset;
  }

  const [siteRes, zonesRes, areasRes, srvRes, blogRes, redirRes, homeRes, imgRegRes] = await Promise.all([
    safeQuery(db.from('site_settings').select('config, updated_at').eq('id', 'primary').maybeSingle()),
    safeQuery(
      db
        .from('service_zones')
        .select('slug, name_en, name_bn, places_text, published_data, updated_at, published_at, sort_order, is_visible, status')
        .eq('is_visible', true)
        .eq('status', 'published')
        .order('sort_order', { ascending: true })
    ),
    safeQuery(
      db
        .from('zone_areas')
        .select('*')
        .eq('is_visible', true)
        .eq('status', 'published')
        .order('sort_order', { ascending: true })
    ),
    safeQuery(
      db
        .from('services')
        .select('id, slug, title, title_bn, short_desc, short_desc_bn, seo_title, meta_title, meta_description, meta_desc, image, featured_image, is_active, display_order, process, process_bn, updated_at, published_at')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
    ),
    safeQuery(
      db
        .from('blog_posts')
        .select('id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, image_url, category, read_time, published_at, updated_at, published, seo')
        .eq('published', true)
        .order('published_at', { ascending: false })
    ),
    safeQuery(db.from('url_redirects').select('id, from_path, to_path, status_code, is_active').eq('is_active', true)),
    safeQuery(db.from('homepage_sections').select('*').eq('is_enabled', true).order('sort_order', { ascending: true })),
    safeQuery(db.from('image_registry').select('*').eq('id', 'primary').maybeSingle())
  ]);

  if (siteRes.error) {
    status.errors.push(`site_settings: ${siteRes.error.message}`);
    if (useLastKnownGood && isFreshLkg(lastKnownGoodStore.siteSettings, nowMs)) {
      dataset.siteConfig = lastKnownGoodStore.siteSettings!.value;
      dataset.siteConfigUpdatedAt = lastKnownGoodStore.siteSettings!.updatedAt;
      status.usedLastKnownGood = true;
      status.staleSlices!.push('siteSettings');
    }
  } else {
    status.siteSettingsOk = true;
    dataset.siteConfig = ((siteRes.data as any)?.config as Partial<FullSiteConfig>) || null;
    dataset.siteConfigUpdatedAt = (siteRes.data as any)?.updated_at || undefined;
    if (cacheLastKnownGood) {
      lastKnownGoodStore.siteSettings = {
        value: dataset.siteConfig,
        updatedAt: dataset.siteConfigUpdatedAt,
        savedAt: nowMs
      };
    }
  }

  if (zonesRes.error) {
    status.errors.push(`service_zones: ${zonesRes.error.message}`);
    if (useLastKnownGood && isFreshLkg(lastKnownGoodStore.zones, nowMs)) {
      dataset.zones = lastKnownGoodStore.zones!.value;
      status.usedLastKnownGood = true;
      status.staleSlices!.push('zones');
    }
  } else {
    status.zonesOk = true;
    dataset.zones = Array.isArray(zonesRes.data)
      ? zonesRes.data.map((z: any) => ({
          slug: z.slug,
          nameEn: z.name_en,
          nameBn: z.name_bn,
          placesText: z.published_data?.placesText || z.places_text || '',
          updatedAt: z.updated_at || undefined,
          publishedAt: z.published_at || undefined
        }))
      : [];
    if (cacheLastKnownGood) {
      lastKnownGoodStore.zones = { value: dataset.zones, savedAt: nowMs };
    }
  }

  if (areasRes.error) {
    status.errors.push(`zone_areas: ${areasRes.error.message}`);
    if (useLastKnownGood && isFreshLkg(lastKnownGoodStore.areas, nowMs)) {
      dataset.areas = lastKnownGoodStore.areas!.value;
      status.usedLastKnownGood = true;
      status.staleSlices!.push('areas');
    }
  } else {
    status.areasOk = true;
    dataset.areas = Array.isArray(areasRes.data) ? areasRes.data.map(normalizeZoneAreaRow) : [];
    if (cacheLastKnownGood) {
      lastKnownGoodStore.areas = { value: dataset.areas, savedAt: nowMs };
    }
  }

  if (srvRes.error) {
    status.errors.push(`services: ${srvRes.error.message}`);
    if (useLastKnownGood && isFreshLkg(lastKnownGoodStore.services, nowMs)) {
      dataset.services = lastKnownGoodStore.services!.value;
      status.usedLastKnownGood = true;
      status.staleSlices!.push('services');
    }
  } else {
    status.servicesOk = true;
    dataset.services = Array.isArray(srvRes.data)
      ? srvRes.data.map((s: any) => ({
          id: s.id,
          slug: s.slug,
          title: s.title,
          titleBn: s.title_bn || s.title,
          shortDesc: s.short_desc || '',
          shortDescBn: s.short_desc_bn || s.short_desc || '',
          metaTitle: s.seo_title || s.meta_title || undefined,
          metaDesc: s.meta_description || s.meta_desc || undefined,
          image: s.featured_image || s.image || undefined,
          updatedAt: s.updated_at || undefined,
          publishedAt: s.published_at || undefined,
          processSteps: Array.isArray(s.process) ? s.process : undefined
        }))
      : [];
    if (cacheLastKnownGood) {
      lastKnownGoodStore.services = { value: dataset.services, savedAt: nowMs };
    }
  }

  if (blogRes.error) {
    status.errors.push(`blog_posts: ${blogRes.error.message}`);
    if (useLastKnownGood && isFreshLkg(lastKnownGoodStore.blogPosts, nowMs)) {
      dataset.blogPosts = lastKnownGoodStore.blogPosts!.value;
      status.usedLastKnownGood = true;
      status.staleSlices!.push('blogPosts');
    }
  } else {
    status.blogPostsOk = true;
    dataset.blogPosts = Array.isArray(blogRes.data)
      ? blogRes.data.map((b: any) => ({
          id: b.id,
          slug: b.slug,
          title: b.title,
          titleBn: b.title_bn || b.title,
          excerpt: b.excerpt || '',
          excerptBn: b.excerpt_bn || b.excerpt || '',
          publishedAt: b.published_at || undefined,
          updatedAt: b.updated_at || undefined,
          imageUrl: b.image_url || undefined,
          category: b.category || undefined,
          readTime: b.read_time || undefined,
          content: b.content || undefined,
          metaTitle: b.seo?.metaTitle || undefined,
          metaDescription: b.seo?.metaDescription || undefined
        }))
      : [];
    if (cacheLastKnownGood) {
      lastKnownGoodStore.blogPosts = { value: dataset.blogPosts, savedAt: nowMs };
    }
  }

  if (redirRes.error) {
    status.errors.push(`url_redirects: ${redirRes.error.message}`);
    if (useLastKnownGood && isFreshLkg(lastKnownGoodStore.redirects, nowMs)) {
      dataset.redirects = lastKnownGoodStore.redirects!.value;
      status.usedLastKnownGood = true;
      status.staleSlices!.push('redirects');
    }
  } else {
    status.redirectsOk = true;
    dataset.redirects = Array.isArray(redirRes.data)
      ? redirRes.data.map((r: any) => ({
          id: r.id,
          fromPath: r.from_path,
          toPath: r.to_path,
          statusCode: r.status_code === 302 ? 302 : 301,
          isActive: r.is_active !== false
        }))
      : [];
    if (cacheLastKnownGood) {
      lastKnownGoodStore.redirects = { value: dataset.redirects, savedAt: nowMs };
    }
  }

  if (homeRes.error) {
    status.errors.push(`homepage_sections: ${homeRes.error.message}`);
    if (useLastKnownGood && isFreshLkg(lastKnownGoodStore.homepageSections, nowMs)) {
      dataset.homepageSections = lastKnownGoodStore.homepageSections!.value;
      dataset.homepageRevision = lastKnownGoodStore.homepageSections!.revision;
      status.usedLastKnownGood = true;
      status.staleSlices!.push('homepageSections');
    }
  } else {
    status.homepageSectionsOk = true;
    dataset.homepageSections = Array.isArray(homeRes.data) ? homeRes.data : [];
    const heroRow =
      dataset.homepageSections.find((r: any) => r.id === 'sec-hero' || r.section_key === 'hero') ||
      dataset.homepageSections[0];
    if (heroRow) {
      dataset.homepageRevision = heroRow.content?.revision || heroRow.settings?.revision || {
        revisionId: `rev_${new Date(heroRow.updated_at || 0).getTime() || 1}`,
        version: 12,
        publishedAt: heroRow.updated_at || undefined,
        publishedBy: 'supabase_database',
        source: 'database'
      };
    }
    if (cacheLastKnownGood) {
      lastKnownGoodStore.homepageSections = {
        value: dataset.homepageSections,
        revision: dataset.homepageRevision,
        savedAt: nowMs
      };
    }
  }

  if (imgRegRes.error) {
    status.errors.push(`image_registry: ${imgRegRes.error.message}`);
    if (useLastKnownGood && isFreshLkg(lastKnownGoodStore.imageRegistry, nowMs)) {
      dataset.imageRegistry = lastKnownGoodStore.imageRegistry!.value;
      status.usedLastKnownGood = true;
      status.staleSlices!.push('imageRegistry');
    }
  } else {
    status.imageRegistryOk = true;
    if (imgRegRes.data) {
      const regData: any = imgRegRes.data;
      dataset.imageRegistry = {
        version: regData.version,
        updatedAt: regData.updated_at,
        serviceImages: regData.service_images || {},
        siteImages: regData.site_images || {},
        heroVideos: regData.hero_videos || {}
      };
    }
    if (cacheLastKnownGood) {
      lastKnownGoodStore.imageRegistry = {
        value: dataset.imageRegistry,
        savedAt: nowMs
      };
    }
  }

  return dataset;
}

export function getCanonicalBaseUrl(): string {
  return getProductionDomain();
}
