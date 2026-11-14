import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FullSiteConfig } from '../types/siteConfig';
import { ZoneAreaContent, ZoneAreaRecord, UrlRedirectRecord } from '../services/zoneContentService';
import { ServiceFaqItem } from '../utils/servicesFaqStore';
import { getProductionDomain } from '../config/siteDomain';

export interface LiveServiceSummary {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  shortDesc: string;
  shortDescBn: string;
  fullDesc?: string;
  fullDescBn?: string;
  metaTitle?: string;
  metaDesc?: string;
  image?: string;
  updatedAt?: string;
  publishedAt?: string;
  processSteps?: string[];
  faqs?: { question: string; questionBn?: string; answer: string; answerBn?: string }[];
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

export type SliceErrorKind =
  | 'missing_table'
  | 'permission_denied'
  | 'timeout'
  | 'network'
  | 'unconfigured'
  | 'query_error';

export interface SliceDiagnostics {
  ok: boolean;
  count?: number;
  errorKind?: SliceErrorKind;
  errorMessage?: string;
  usedLkg?: boolean;
}

export type SeoSliceName =
  | 'siteSettings'
  | 'zones'
  | 'areas'
  | 'services'
  | 'blogPosts'
  | 'redirects'
  | 'homepageSections'
  | 'imageRegistry'
  | 'servicesFaqs';

export const CRITICAL_PRERENDER_SLICES: SeoSliceName[] = [
  'siteSettings',
  'zones',
  'areas',
  'services',
  'blogPosts',
  'redirects',
  'servicesFaqs'
];

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
  servicesFaqsOk: boolean;
  usedLastKnownGood?: boolean;
  staleSlices?: string[];
  sliceDetails?: Record<SeoSliceName, SliceDiagnostics>;
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
  servicesFaqs: ServiceFaqItem[];
  imageRegistry: {
    version?: number;
    updatedAt?: string;
    serviceImages: Record<string, string>;
    siteImages: Record<string, string>;
    heroVideos: Record<string, string>;
  } | null;
  status: FetchStatusFlags;
}

export interface FetchLiveSeoOptions {
  useLastKnownGood?: boolean;
  cacheLastKnownGood?: boolean;
  queryTimeoutMs?: number;
}

const DEFAULT_QUERY_TIMEOUT_MS = 6000;
const LKG_MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface LkgSliceStore {
  siteSettings?: { value: Partial<FullSiteConfig> | null; updatedAt?: string; savedAt: number };
  zones?: { value: LiveZoneSummary[]; savedAt: number };
  areas?: { value: ZoneAreaRecord[]; savedAt: number };
  services?: { value: LiveServiceSummary[]; savedAt: number };
  blogPosts?: { value: LiveBlogArticleSummary[]; savedAt: number };
  redirects?: { value: UrlRedirectRecord[]; savedAt: number };
  homepageSections?: { value: any[]; revision: any | null; savedAt: number };
  servicesFaqs?: { value: ServiceFaqItem[]; savedAt: number };
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
  delete lastKnownGoodStore.servicesFaqs;
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
    imageRegistry: status.imageRegistryOk,
    servicesFaqs: status.servicesFaqsOk
  };
  if (okMap[slice]) return true;
  return Boolean(status.staleSlices?.includes(slice));
}

export function hasUnrecoveredCriticalFailure(
  status: FetchStatusFlags,
  requiredSlices: SeoSliceName[] = CRITICAL_PRERENDER_SLICES
): boolean {
  if (!status.configured) return true;
  return requiredSlices.some(slice => !isSliceAvailable(status, slice));
}

export function classifyDbError(err: any): { kind: SliceErrorKind; message: string } {
  const code = String(err?.code || '').trim().toUpperCase();
  const status = Number(err?.status || err?.statusCode || 0);
  const message = String(err?.message || err?.error_description || 'Database query error').trim();
  const lower = message.toLowerCase();

  if (
    code === 'PGRST205' ||
    code === '42P01' ||
    lower.includes('could not find the table') ||
    lower.includes('in the schema cache') ||
    (lower.includes('relation') && lower.includes('does not exist')) ||
    status === 404
  ) {
    return { kind: 'missing_table', message };
  }

  if (
    code === '42501' ||
    status === 401 ||
    status === 403 ||
    lower.includes('permission denied') ||
    lower.includes('row-level security') ||
    lower.includes('jwt expired') ||
    lower.includes('invalid api key')
  ) {
    return { kind: 'permission_denied', message };
  }

  if (
    err?.name === 'AbortError' ||
    code === 'ETIMEDOUT' ||
    lower.includes('timeout') ||
    lower.includes('timed out')
  ) {
    return { kind: 'timeout', message };
  }

  if (
    lower.includes('fetch failed') ||
    lower.includes('econnrefused') ||
    lower.includes('enotfound') ||
    lower.includes('network') ||
    lower.includes('socket')
  ) {
    return { kind: 'network', message };
  }

  return { kind: 'query_error', message };
}

async function safeQuery<T = any>(
  promiseLike: PromiseLike<{ data: T; error: { message?: string; code?: string; status?: number } | null }>,
  timeoutMs: number
): Promise<{ data: T | null; error: { kind: SliceErrorKind; message: string } | null }> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject({ name: 'AbortError', code: 'ETIMEDOUT', message: `Query timed out after ${timeoutMs}ms` });
    }, timeoutMs);
  });

  try {
    const res = await Promise.race([Promise.resolve(promiseLike), timeoutPromise]);
    if (res?.error) {
      return { data: null, error: classifyDbError(res.error) };
    }
    return { data: res?.data ?? null, error: null };
  } catch (err: any) {
    return {
      data: null,
      error: classifyDbError(err)
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function createServerSupabaseClient(): { client: SupabaseClient | null; configured: boolean } {
  const url = String(
    typeof process !== 'undefined' && process.env
      ? process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
      : ''
  ).trim();

  // Prefer server service role key when running strictly on the server (API routes / build)
  const serverRoleKey =
    typeof process !== 'undefined' && process.env
      ? String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
      : '';

  const anonKey = String(
    typeof process !== 'undefined' && process.env
      ? process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
      : ''
  ).trim();

  const key = serverRoleKey || anonKey;
  const lowerUrl = url.toLowerCase();
  const configured = Boolean(
    url &&
      key &&
      url.startsWith('https://') &&
      !lowerUrl.includes('your-project') &&
      !lowerUrl.includes('placeholder') &&
      !lowerUrl.includes('unconfigured.invalid')
  );

  if (!configured) {
    return { client: null, configured: false };
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  return { client, configured: true };
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

function mapServiceFaqRow(d: any): ServiceFaqItem {
  return {
    id: String(d.id),
    category: d.category === 'pipeline-cleaning' ? 'pipeline-cleaning' : 'water-tank-cleaning',
    categoryTitleBn: d.category_title_bn || (d.category === 'pipeline-cleaning' ? 'পাইপলাইন পরিষ্কার' : 'পানির ট্যাংক পরিষ্কার'),
    categoryTitleEn: d.category_title_en || (d.category === 'pipeline-cleaning' ? 'Pipeline Cleaning' : 'Water Tank Cleaning'),
    questionBn: d.question_bn || '',
    questionEn: d.question_en || d.question_bn || '',
    answerBn: d.answer_bn || '',
    answerEn: d.answer_en || d.answer_bn || '',
    order: Number(d.sort_order ?? 1),
    isActive: d.is_active !== false
  };
}

/**
 * Fetches live authoritative public data from Supabase.
 * - Strictly separates query/network failures (`*Ok: false`) from legitimate empty results (`[]`).
 * - Classifies errors (`missing_table`, `permission_denied`, `timeout`, `network`, `unconfigured`, `query_error`).
 * - Never merges bundled demo articles, FAQs, or default areas onto successful DB responses.
 * - Supports per-slice last-known-good (LKG) fallback ONLY when a DB query fails, never when it succeeds with `[]`.
 */
export async function fetchLiveSeoDataset(
  customClient?: SupabaseClient,
  options: FetchLiveSeoOptions = {}
): Promise<LiveSeoDataset> {
  const resolved = customClient ? { client: customClient, configured: true } : createServerSupabaseClient();
  const db = resolved.client;
  const useLastKnownGood = options.useLastKnownGood ?? !customClient;
  const cacheLastKnownGood = options.cacheLastKnownGood ?? !customClient;
  const envTimeout =
    typeof process !== 'undefined' && process.env
      ? Number(process.env.SUPABASE_QUERY_TIMEOUT_MS || 0)
      : 0;
  const queryTimeoutMs =
    options.queryTimeoutMs || (envTimeout > 0 ? envTimeout : DEFAULT_QUERY_TIMEOUT_MS);
  const nowMs = Date.now();

  const sliceDetails: Record<SeoSliceName, SliceDiagnostics> = {
    siteSettings: { ok: false },
    zones: { ok: false },
    areas: { ok: false },
    services: { ok: false },
    blogPosts: { ok: false },
    redirects: { ok: false },
    homepageSections: { ok: false },
    imageRegistry: { ok: false },
    servicesFaqs: { ok: false }
  };

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
    servicesFaqsOk: false,
    usedLastKnownGood: false,
    staleSlices: [],
    sliceDetails,
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
    servicesFaqs: [],
    imageRegistry: null,
    status
  };

  if (!resolved.configured || !db) {
    const unconfiguredMsg = 'Supabase environment variables (SUPABASE_URL/VITE_SUPABASE_URL and key) are not configured';
    status.errors.push(unconfiguredMsg);
    for (const key of Object.keys(sliceDetails) as SeoSliceName[]) {
      sliceDetails[key] = { ok: false, errorKind: 'unconfigured', errorMessage: unconfiguredMsg };
    }
    return dataset;
  }

  const [siteRes, zonesRes, areasRes, srvRes, blogRes, redirRes, homeRes, imgRegRes, faqRes] = await Promise.all([
    safeQuery(db.from('site_settings').select('config, updated_at').eq('id', 'primary').maybeSingle(), queryTimeoutMs),
    safeQuery(
      db
        .from('service_zones')
        .select('slug, name_en, name_bn, places_text, published_data, updated_at, published_at, sort_order, is_visible, status')
        .eq('is_visible', true)
        .eq('status', 'published')
        .order('sort_order', { ascending: true }),
      queryTimeoutMs
    ),
    safeQuery(
      db
        .from('zone_areas')
        .select('*')
        .eq('is_visible', true)
        .eq('status', 'published')
        .order('sort_order', { ascending: true }),
      queryTimeoutMs
    ),
    safeQuery(
      db
        .from('services')
        .select('id, slug, title, title_bn, short_desc, short_desc_bn, full_desc, full_desc_bn, seo_title, meta_title, meta_description, meta_desc, image, featured_image, is_active, display_order, process, process_bn, faqs, benefits, updated_at, published_at')
        .eq('is_active', true)
        .order('display_order', { ascending: true }),
      queryTimeoutMs
    ),
    safeQuery(
      db
        .from('blog_posts')
        .select('id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, image_url, category, read_time, published_at, updated_at, published, seo')
        .eq('published', true)
        .order('published_at', { ascending: false }),
      queryTimeoutMs
    ),
    safeQuery(
      db.from('url_redirects').select('id, from_path, to_path, status_code, is_active').eq('is_active', true),
      queryTimeoutMs
    ),
    safeQuery(
      db.from('homepage_sections').select('*').eq('is_enabled', true).order('sort_order', { ascending: true }),
      queryTimeoutMs
    ),
    safeQuery(db.from('image_registry').select('*').eq('id', 'primary').maybeSingle(), queryTimeoutMs),
    safeQuery(
      db.from('services_faqs').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      queryTimeoutMs
    )
  ]);

  if (siteRes.error) {
    status.errors.push(`site_settings [${siteRes.error.kind}]: ${siteRes.error.message}`);
    const usedLkg = Boolean(useLastKnownGood && isFreshLkg(lastKnownGoodStore.siteSettings, nowMs));
    sliceDetails.siteSettings = {
      ok: false,
      errorKind: siteRes.error.kind,
      errorMessage: siteRes.error.message,
      usedLkg
    };
    if (usedLkg) {
      dataset.siteConfig = lastKnownGoodStore.siteSettings!.value;
      dataset.siteConfigUpdatedAt = lastKnownGoodStore.siteSettings!.updatedAt;
      status.usedLastKnownGood = true;
      status.staleSlices!.push('siteSettings');
    }
  } else {
    status.siteSettingsOk = true;
    dataset.siteConfig = ((siteRes.data as any)?.config as Partial<FullSiteConfig>) || null;
    dataset.siteConfigUpdatedAt = (siteRes.data as any)?.updated_at || undefined;
    sliceDetails.siteSettings = { ok: true, count: dataset.siteConfig ? 1 : 0 };
    if (cacheLastKnownGood) {
      lastKnownGoodStore.siteSettings = {
        value: dataset.siteConfig,
        updatedAt: dataset.siteConfigUpdatedAt,
        savedAt: nowMs
      };
    }
  }

  if (zonesRes.error) {
    status.errors.push(`service_zones [${zonesRes.error.kind}]: ${zonesRes.error.message}`);
    const usedLkg = Boolean(useLastKnownGood && isFreshLkg(lastKnownGoodStore.zones, nowMs));
    sliceDetails.zones = {
      ok: false,
      errorKind: zonesRes.error.kind,
      errorMessage: zonesRes.error.message,
      usedLkg
    };
    if (usedLkg) {
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
    sliceDetails.zones = { ok: true, count: dataset.zones.length };
    if (cacheLastKnownGood) {
      lastKnownGoodStore.zones = { value: dataset.zones, savedAt: nowMs };
    }
  }

  if (areasRes.error) {
    status.errors.push(`zone_areas [${areasRes.error.kind}]: ${areasRes.error.message}`);
    const usedLkg = Boolean(useLastKnownGood && isFreshLkg(lastKnownGoodStore.areas, nowMs));
    sliceDetails.areas = {
      ok: false,
      errorKind: areasRes.error.kind,
      errorMessage: areasRes.error.message,
      usedLkg
    };
    if (usedLkg) {
      dataset.areas = lastKnownGoodStore.areas!.value;
      status.usedLastKnownGood = true;
      status.staleSlices!.push('areas');
    }
  } else {
    status.areasOk = true;
    dataset.areas = Array.isArray(areasRes.data) ? areasRes.data.map(normalizeZoneAreaRow) : [];
    sliceDetails.areas = { ok: true, count: dataset.areas.length };
    if (cacheLastKnownGood) {
      lastKnownGoodStore.areas = { value: dataset.areas, savedAt: nowMs };
    }
  }

  if (srvRes.error) {
    status.errors.push(`services [${srvRes.error.kind}]: ${srvRes.error.message}`);
    const usedLkg = Boolean(useLastKnownGood && isFreshLkg(lastKnownGoodStore.services, nowMs));
    sliceDetails.services = {
      ok: false,
      errorKind: srvRes.error.kind,
      errorMessage: srvRes.error.message,
      usedLkg
    };
    if (usedLkg) {
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
          fullDesc: s.full_desc || undefined,
          fullDescBn: s.full_desc_bn || undefined,
          metaTitle: s.seo_title || s.meta_title || undefined,
          metaDesc: s.meta_description || s.meta_desc || undefined,
          image: s.featured_image || s.image || undefined,
          updatedAt: s.updated_at || undefined,
          publishedAt: s.published_at || undefined,
          processSteps: Array.isArray(s.process) ? s.process : undefined,
          faqs: Array.isArray(s.faqs) ? s.faqs : undefined
        }))
      : [];
    sliceDetails.services = { ok: true, count: dataset.services.length };
    if (cacheLastKnownGood) {
      lastKnownGoodStore.services = { value: dataset.services, savedAt: nowMs };
    }
  }

  if (blogRes.error) {
    status.errors.push(`blog_posts [${blogRes.error.kind}]: ${blogRes.error.message}`);
    const usedLkg = Boolean(useLastKnownGood && isFreshLkg(lastKnownGoodStore.blogPosts, nowMs));
    sliceDetails.blogPosts = {
      ok: false,
      errorKind: blogRes.error.kind,
      errorMessage: blogRes.error.message,
      usedLkg
    };
    if (usedLkg) {
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
    sliceDetails.blogPosts = { ok: true, count: dataset.blogPosts.length };
    if (cacheLastKnownGood) {
      lastKnownGoodStore.blogPosts = { value: dataset.blogPosts, savedAt: nowMs };
    }
  }

  if (redirRes.error) {
    status.errors.push(`url_redirects [${redirRes.error.kind}]: ${redirRes.error.message}`);
    const usedLkg = Boolean(useLastKnownGood && isFreshLkg(lastKnownGoodStore.redirects, nowMs));
    sliceDetails.redirects = {
      ok: false,
      errorKind: redirRes.error.kind,
      errorMessage: redirRes.error.message,
      usedLkg
    };
    if (usedLkg) {
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
    sliceDetails.redirects = { ok: true, count: dataset.redirects.length };
    if (cacheLastKnownGood) {
      lastKnownGoodStore.redirects = { value: dataset.redirects, savedAt: nowMs };
    }
  }

  if (homeRes.error) {
    status.errors.push(`homepage_sections [${homeRes.error.kind}]: ${homeRes.error.message}`);
    const usedLkg = Boolean(useLastKnownGood && isFreshLkg(lastKnownGoodStore.homepageSections, nowMs));
    sliceDetails.homepageSections = {
      ok: false,
      errorKind: homeRes.error.kind,
      errorMessage: homeRes.error.message,
      usedLkg
    };
    if (usedLkg) {
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
    sliceDetails.homepageSections = { ok: true, count: dataset.homepageSections.length };
    if (cacheLastKnownGood) {
      lastKnownGoodStore.homepageSections = {
        value: dataset.homepageSections,
        revision: dataset.homepageRevision,
        savedAt: nowMs
      };
    }
  }

  if (faqRes.error) {
    status.errors.push(`services_faqs [${faqRes.error.kind}]: ${faqRes.error.message}`);
    const usedLkg = Boolean(useLastKnownGood && isFreshLkg(lastKnownGoodStore.servicesFaqs, nowMs));
    sliceDetails.servicesFaqs = {
      ok: false,
      errorKind: faqRes.error.kind,
      errorMessage: faqRes.error.message,
      usedLkg
    };
    if (usedLkg) {
      dataset.servicesFaqs = lastKnownGoodStore.servicesFaqs!.value;
      status.usedLastKnownGood = true;
      status.staleSlices!.push('servicesFaqs');
    }
  } else {
    status.servicesFaqsOk = true;
    dataset.servicesFaqs = Array.isArray(faqRes.data)
      ? faqRes.data.map(mapServiceFaqRow).sort((a, b) => a.order - b.order)
      : [];
    sliceDetails.servicesFaqs = { ok: true, count: dataset.servicesFaqs.length };
    if (cacheLastKnownGood) {
      lastKnownGoodStore.servicesFaqs = { value: dataset.servicesFaqs, savedAt: nowMs };
    }
  }

  if (imgRegRes.error) {
    status.errors.push(`image_registry [${imgRegRes.error.kind}]: ${imgRegRes.error.message}`);
    const usedLkg = Boolean(useLastKnownGood && isFreshLkg(lastKnownGoodStore.imageRegistry, nowMs));
    sliceDetails.imageRegistry = {
      ok: false,
      errorKind: imgRegRes.error.kind,
      errorMessage: imgRegRes.error.message,
      usedLkg
    };
    if (usedLkg) {
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
    sliceDetails.imageRegistry = { ok: true, count: dataset.imageRegistry ? 1 : 0 };
    if (cacheLastKnownGood) {
      lastKnownGoodStore.imageRegistry = {
        value: dataset.imageRegistry,
        savedAt: nowMs
      };
    }
  }

  // Graceful imageRegistry fallback from homepage_sections sec-hero when table row is absent
  if (!dataset.imageRegistry && dataset.homepageSections.length > 0) {
    const heroRow = dataset.homepageSections.find((r: any) => r.id === 'sec-hero' || r.section_key === 'hero');
    const secSiteImages = heroRow?.settings?.siteImages || heroRow?.content?.siteImages || {};
    const secServiceImages = heroRow?.settings?.serviceImages || heroRow?.content?.serviceImages || {};
    const secHeroVideos = heroRow?.settings?.heroVideos || heroRow?.content?.heroVideos || {};
    if (
      Object.keys(secSiteImages).length > 0 ||
      Object.keys(secServiceImages).length > 0 ||
      Object.keys(secHeroVideos).length > 0
    ) {
      dataset.imageRegistry = {
        version: Number(heroRow?.settings?.version || heroRow?.content?.version || 1),
        updatedAt: heroRow?.updated_at || undefined,
        serviceImages: secServiceImages,
        siteImages: secSiteImages,
        heroVideos: secHeroVideos
      };
    }
  }

  return dataset;
}

export function getCanonicalBaseUrl(): string {
  return getProductionDomain();
}
