import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FullSiteConfig } from '../types/siteConfig';
import {
  ZoneAreaContent,
  ZoneAreaRecord,
  ServiceZoneRecord,
  ServiceZoneContent,
  UrlRedirectRecord
} from '../services/zoneContentService';
import { ServiceFaqItem } from '../utils/servicesFaqStore';
import { ArticleImage } from '../types/blog';
import { getProductionDomain } from '../config/siteDomain';

export interface LiveServiceSummary {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  name?: string;
  shortDesc: string;
  shortDescBn: string;
  short_description?: string;
  fullDesc?: string;
  fullDescBn?: string;
  full_description?: string;
  metaTitle?: string;
  seo_title?: string;
  metaDesc?: string;
  meta_description?: string;
  image?: string;
  featured_image?: string;
  category?: string;
  iconName?: string;
  icon?: string;
  is_active?: boolean;
  display_order?: number;
  show_on_homepage?: boolean;
  show_in_navigation?: boolean;
  show_in_quote_form?: boolean;
  startingPrice?: number;
  startingPriceBn?: string;
  verifiedPriceNote?: string;
  verifiedPriceNoteBn?: string;
  popular?: boolean;
  isCustomAdded?: boolean;
  benefits?: string[];
  benefitsBn?: string[];
  process?: string[];
  processBn?: string[];
  processSteps?: string[];
  processStepsBn?: string[];
  idealFor?: string[];
  idealForBn?: string[];
  includedItems?: string[];
  includedItemsBn?: string[];
  excludedItems?: string[];
  excludedItemsBn?: string[];
  customerPrep?: string[];
  customerPrepBn?: string[];
  durationFactors?: string[];
  durationFactorsBn?: string[];
  pricingFactors?: string[];
  pricingFactorsBn?: string[];
  formConfig?: Record<string, any>;
  extendedContent?: Record<string, any>;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  publishedAt?: string;
  faqs?: { question: string; questionBn?: string; answer: string; answerBn?: string }[];
}

export interface LiveZoneSummary extends Omit<ServiceZoneRecord, 'publishedAt' | 'updatedAt'> {
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
  content?: string;
  contentBn?: string;
  publishedAt?: string;
  updatedAt?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  images?: ArticleImage[];
  author?: string;
  category?: string;
  categoryBn?: string;
  readTime?: string;
  readTimeBn?: string;
  featured?: boolean;
  published?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    imageAlt?: string;
    imageCaption?: string;
    images?: ArticleImage[];
  };
}

export interface LiveCaseStudySummary {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  category: string;
  area: string;
  areaSlug?: string;
  locationBn?: string;
  tankType: string;
  capacity?: string;
  duration?: string;
  serviceDate: string;
  beforeImage: string;
  afterImage: string;
  beforeCaption?: string;
  beforeCaptionBn?: string;
  afterCaption?: string;
  afterCaptionBn?: string;
  summary: string;
  summaryBn: string;
  customerProblem?: string;
  customerProblemBn?: string;
  workDone?: string;
  workDoneBn?: string;
  actualResult?: string;
  actualResultBn?: string;
  relatedServiceSlug?: string;
  featured?: boolean;
  status: 'draft' | 'published';
  customerConsentGranted: boolean;
  metaTitle?: string;
  metaDescription?: string;
  updatedAt?: string;
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
  | 'caseStudies'
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
  caseStudiesOk: boolean;
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
  caseStudies: LiveCaseStudySummary[];
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
  bypassRemoteLkg?: boolean;
}

const DEFAULT_QUERY_TIMEOUT_MS = 6000;
export const LKG_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const REMOTE_LKG_WRITE_COOLDOWN_MS = 5 * 60 * 1000;
const REMOTE_LKG_WRITE_TIMEOUT_MS = 3000;
const REMOTE_REVISION_READ_TIMEOUT_MS = 1500;
const LKG_DISK_PATH = '/tmp/sunviloz-seo-lkg-v1.json';
const LKG_STORAGE_BUCKET = 'site-media';
const LKG_STORAGE_PATH = 'config/seo_lkg_snapshot.json';
const LKG_REVISION_STORAGE_PATH = 'config/seo_cache_version.json';

interface LkgCacheVersion {
  revision: string;
  invalidatedAt: string;
}

interface LkgSliceStore {
  revision?: string;
  siteSettings?: { value: Partial<FullSiteConfig> | null; updatedAt?: string; savedAt: number };
  zones?: { value: LiveZoneSummary[]; savedAt: number };
  areas?: { value: ZoneAreaRecord[]; savedAt: number };
  services?: { value: LiveServiceSummary[]; savedAt: number };
  blogPosts?: { value: LiveBlogArticleSummary[]; savedAt: number };
  caseStudies?: { value: LiveCaseStudySummary[]; savedAt: number };
  redirects?: { value: UrlRedirectRecord[]; savedAt: number };
  homepageSections?: { value: any[]; revision: any | null; savedAt: number };
  servicesFaqs?: { value: ServiceFaqItem[]; savedAt: number };
  imageRegistry?: { value: LiveSeoDataset['imageRegistry']; savedAt: number };
}

const lastKnownGoodStore: LkgSliceStore = {};
let diskHydratedOnce = false;
let lastRemoteLkgWriteAt = 0;
let lastRemoteLkgHash = '';

export function resetRemoteLkgWriteThrottleForTest(): void {
  lastRemoteLkgWriteAt = 0;
  lastRemoteLkgHash = '';
}

export function getRemoteLkgWriteTelemetry(): { lastWriteAt: number; lastHash: string; revision?: string } {
  return {
    lastWriteAt: lastRemoteLkgWriteAt,
    lastHash: lastRemoteLkgHash,
    revision: lastKnownGoodStore.revision
  };
}

export function stripSecretsFromSiteConfig(
  siteConfig: Partial<FullSiteConfig> | null | undefined
): Partial<FullSiteConfig> | null {
  if (!siteConfig || typeof siteConfig !== 'object') return null;
  return {
    ...siteConfig,
    seo: siteConfig.seo ? { ...siteConfig.seo, indexNowKey: '' } : undefined
  };
}

function readLkgFromDisk(): LkgSliceStore | null {
  if (typeof window !== 'undefined') return null;
  try {
    if (!fs.existsSync(LKG_DISK_PATH)) return null;
    const raw = fs.readFileSync(LKG_DISK_PATH, 'utf-8');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as LkgSliceStore) : null;
  } catch {
    return null;
  }
}

function hydrateMemoryLkgFromDisk(): void {
  if (diskHydratedOnce) return;
  diskHydratedOnce = true;
  const disk = readLkgFromDisk();
  if (!disk) return;
  for (const key of Object.keys(disk) as (keyof LkgSliceStore)[]) {
    if (!lastKnownGoodStore[key] && disk[key]) {
      (lastKnownGoodStore as any)[key] = disk[key];
    }
  }
}

function sanitizeLkgForPersistence(store: LkgSliceStore): LkgSliceStore {
  return {
    ...(store.revision ? { revision: store.revision } : {}),
    ...(store.siteSettings
      ? {
          siteSettings: {
            value: stripSecretsFromSiteConfig(store.siteSettings.value),
            updatedAt: store.siteSettings.updatedAt,
            savedAt: store.siteSettings.savedAt
          }
        }
      : {}),
    ...(store.zones ? { zones: store.zones } : {}),
    ...(store.areas ? { areas: store.areas } : {}),
    ...(store.services ? { services: store.services } : {}),
    ...(store.blogPosts ? { blogPosts: store.blogPosts } : {}),
    ...(store.caseStudies ? { caseStudies: store.caseStudies } : {}),
    ...(store.redirects ? { redirects: store.redirects } : {}),
    ...(store.homepageSections ? { homepageSections: store.homepageSections } : {}),
    ...(store.servicesFaqs ? { servicesFaqs: store.servicesFaqs } : {}),
    ...(store.imageRegistry ? { imageRegistry: store.imageRegistry } : {})
  };
}

function writeLkgToDisk(store: LkgSliceStore): void {
  if (typeof window !== 'undefined') return;
  try {
    const clean = sanitizeLkgForPersistence(store);
    fs.writeFileSync(LKG_DISK_PATH, JSON.stringify(clean), 'utf-8');
  } catch {
    // Non-fatal in read-only runtimes
  }
}

function mergeRemoteLkgIntoMemory(remoteStore: LkgSliceStore | null, expectedRevision?: string | null): void {
  if (!remoteStore || typeof remoteStore !== 'object') return;
  if (expectedRevision && remoteStore.revision !== expectedRevision) {
    return;
  }
  if (remoteStore.revision) {
    lastKnownGoodStore.revision = remoteStore.revision;
  }
  for (const key of Object.keys(remoteStore) as (keyof LkgSliceStore)[]) {
    if (key === 'revision') continue;
    const incoming = remoteStore[key] as { savedAt?: number } | undefined;
    if (!incoming || typeof incoming.savedAt !== 'number') continue;
    const current = lastKnownGoodStore[key] as { savedAt?: number } | undefined;
    if (!current || (typeof current.savedAt === 'number' && incoming.savedAt > current.savedAt)) {
      (lastKnownGoodStore as any)[key] = incoming;
    }
  }
}

async function loadRemoteCacheVersion(db: SupabaseClient): Promise<LkgCacheVersion | null> {
  try {
    if (!db?.storage || typeof db.storage.from !== 'function') return null;
    const bucket = db.storage.from(LKG_STORAGE_BUCKET);
    if (!bucket || typeof bucket.download !== 'function') return null;

    const timerPromise = new Promise<null>(resolve =>
      setTimeout(() => resolve(null), REMOTE_REVISION_READ_TIMEOUT_MS)
    );
    const downloadPromise = bucket
      .download(LKG_REVISION_STORAGE_PATH)
      .then(async ({ data, error }) => {
        if (error || !data) return null;
        const text = await data.text();
        if (!text) return null;
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed.revision === 'string' && parsed.revision.trim()) {
          return parsed as LkgCacheVersion;
        }
        return null;
      })
      .catch(() => null);

    return await Promise.race([downloadPromise, timerPromise]);
  } catch {
    return null;
  }
}

async function loadRemoteLkgSnapshot(db: SupabaseClient, timeoutMs: number): Promise<LkgSliceStore | null> {
  try {
    if (!db?.storage || typeof db.storage.from !== 'function') return null;
    const bucket = db.storage.from(LKG_STORAGE_BUCKET);
    if (!bucket || typeof bucket.download !== 'function') return null;

    const timerPromise = new Promise<null>(resolve => setTimeout(() => resolve(null), Math.min(timeoutMs, 2500)));
    const downloadPromise = bucket
      .download(LKG_STORAGE_PATH)
      .then(async ({ data, error }) => {
        if (error || !data) return null;
        const text = await data.text();
        if (!text) return null;
        const parsed = JSON.parse(text);
        return parsed && typeof parsed === 'object' ? (parsed as LkgSliceStore) : null;
      })
      .catch(() => null);

    return await Promise.race([downloadPromise, timerPromise]);
  } catch {
    return null;
  }
}

export async function persistLkgSnapshotToStorage(
  db: SupabaseClient,
  store: LkgSliceStore,
  options: { force?: boolean; nowMs?: number } = {}
): Promise<boolean> {
  const hasServiceRole = Boolean(
    typeof process !== 'undefined' && process.env && String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  );
  if (!hasServiceRole) return false;
  if (!db?.storage || typeof db.storage.from !== 'function') return false;

  const nowMs = options.nowMs ?? Date.now();
  if (!options.force && lastRemoteLkgWriteAt > 0 && nowMs - lastRemoteLkgWriteAt < REMOTE_LKG_WRITE_COOLDOWN_MS) {
    return false;
  }

  try {
    const clean = sanitizeLkgForPersistence(store);
    // Hash only content slices (excluding savedAt timestamps) so unchanged datasets never re-upload
    const contentForHash = {
      revision: clean.revision || '',
      siteSettings: clean.siteSettings?.value ?? null,
      zones: clean.zones?.value ?? null,
      areas: clean.areas?.value ?? null,
      services: clean.services?.value ?? null,
      blogPosts: clean.blogPosts?.value ?? null,
      caseStudies: clean.caseStudies?.value ?? null,
      redirects: clean.redirects?.value ?? null,
      homepageSections: clean.homepageSections?.value ?? null,
      servicesFaqs: clean.servicesFaqs?.value ?? null,
      imageRegistry: clean.imageRegistry?.value ?? null
    };
    const payloadHash = createHash('sha256').update(JSON.stringify(contentForHash)).digest('hex');

    if (!options.force && payloadHash === lastRemoteLkgHash) {
      return false;
    }

    const body = Buffer.from(JSON.stringify(clean), 'utf-8');
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<{ error: Error }>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Storage LKG upload timed out after 3000ms')), REMOTE_LKG_WRITE_TIMEOUT_MS);
    });

    try {
      const uploadPromise = db.storage.from(LKG_STORAGE_BUCKET).upload(LKG_STORAGE_PATH, body, {
        contentType: 'application/json',
        upsert: true,
        cacheControl: '0'
      });
      const result: any = await Promise.race([uploadPromise, timeoutPromise]);
      if (result?.error) return false;
      lastRemoteLkgWriteAt = nowMs;
      lastRemoteLkgHash = payloadHash;
      return true;
    } finally {
      if (timer) clearTimeout(timer);
    }
  } catch {
    return false;
  }
}

export function clearLastKnownGoodCache(nextRevision?: string): void {
  delete lastKnownGoodStore.siteSettings;
  delete lastKnownGoodStore.zones;
  delete lastKnownGoodStore.areas;
  delete lastKnownGoodStore.services;
  delete lastKnownGoodStore.blogPosts;
  delete lastKnownGoodStore.caseStudies;
  delete lastKnownGoodStore.redirects;
  delete lastKnownGoodStore.homepageSections;
  delete lastKnownGoodStore.servicesFaqs;
  delete lastKnownGoodStore.imageRegistry;
  if (nextRevision !== undefined) {
    lastKnownGoodStore.revision = nextRevision;
  } else {
    delete lastKnownGoodStore.revision;
  }
  diskHydratedOnce = false;
  if (typeof window === 'undefined') {
    try {
      if (fs.existsSync(LKG_DISK_PATH)) {
        fs.unlinkSync(LKG_DISK_PATH);
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}

export async function invalidateSeoCache(customClient?: SupabaseClient): Promise<{
  clearedMemory: boolean;
  clearedDisk: boolean;
  clearedRemoteSnapshot: boolean;
  updatedRevision?: string;
}> {
  const newRevision = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  clearLastKnownGoodCache(newRevision);
  lastRemoteLkgWriteAt = 0;
  lastRemoteLkgHash = '';
  let clearedRemoteSnapshot = false;

  const hasServiceRole = Boolean(
    typeof process !== 'undefined' && process.env && String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  );
  const client = customClient || (hasServiceRole ? createServerSupabaseClient().client : null);
  if (client && client.storage && typeof client.storage.from === 'function') {
    try {
      const bucket = client.storage.from(LKG_STORAGE_BUCKET);
      const versionPayload: LkgCacheVersion = {
        revision: newRevision,
        invalidatedAt: new Date().toISOString()
      };
      const versionUploadPromise = bucket.upload(
        LKG_REVISION_STORAGE_PATH,
        Buffer.from(JSON.stringify(versionPayload), 'utf-8'),
        { contentType: 'application/json', upsert: true, cacheControl: '0' }
      );
      const snapshotRemovePromise = bucket.remove([LKG_STORAGE_PATH]);
      const [verRes, rmRes] = await Promise.allSettled([versionUploadPromise, snapshotRemovePromise]);
      const verOk = verRes.status === 'fulfilled' && !(verRes.value as any)?.error;
      const rmOk = rmRes.status === 'fulfilled' && !(rmRes.value as any)?.error;
      clearedRemoteSnapshot = verOk || rmOk;
    } catch {
      clearedRemoteSnapshot = false;
    }
  }

  return {
    clearedMemory: true,
    clearedDisk: true,
    clearedRemoteSnapshot,
    updatedRevision: newRevision
  };
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
    caseStudies: status.caseStudiesOk,
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

function normalizeCoreServiceSlug(rawSlug: string): string {
  const clean = String(rawSlug || '').trim();
  if (clean === 'overhead-water-tank-cleaning') return 'overhead-tank-cleaning';
  if (clean === 'water-pipeline-cleaning') return 'pipeline-cleaning';
  return clean;
}

function normalizeZoneRow(row: any): LiveZoneSummary {
  const pubData: ServiceZoneContent = {
    summaryEn: row.published_data?.summaryEn ?? row.summary_en ?? '',
    summaryBn: row.published_data?.summaryBn ?? row.summary_bn ?? '',
    placesText: row.published_data?.placesText ?? row.places_text ?? '',
    featuredSlug: row.published_data?.featuredSlug ?? row.featured_slug ?? '',
    highlightsBn: Array.isArray(row.published_data?.highlightsBn) ? row.published_data.highlightsBn : [],
    highlightsEn: Array.isArray(row.published_data?.highlightsEn) ? row.published_data.highlightsEn : [],
    seoTitle: row.published_data?.seoTitle || '',
    metaDesc: row.published_data?.metaDesc || ''
  };

  return {
    id: String(row.id || `zone-${row.slug}`),
    slug: String(row.slug || ''),
    nameEn: String(row.name_en || ''),
    nameBn: String(row.name_bn || row.name_en || ''),
    summaryEn: pubData.summaryEn,
    summaryBn: pubData.summaryBn,
    featuredSlug: pubData.featuredSlug,
    placesText: pubData.placesText,
    sortOrder: Number(row.sort_order ?? 1),
    isVisible: row.is_visible !== false,
    status: row.status === 'draft' ? 'draft' : 'published',
    version: Number(row.version ?? 1),
    publishedAt: row.published_at || undefined,
    updatedAt: row.updated_at || undefined,
    draftData: pubData,
    publishedData: pubData
  };
}

function normalizeZoneAreaRow(row: any, zones: LiveZoneSummary[] = []): ZoneAreaRecord {
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
    dispatchConditionsBn: row.published_data?.dispatchConditionsBn || '',
    dispatchConditionsEn: row.published_data?.dispatchConditionsEn || '',
    verifiedFindings: Array.isArray(row.published_data?.verifiedFindings) ? row.published_data.verifiedFindings : [],
    coverageDetails: Array.isArray(row.published_data?.coverageDetails) ? row.published_data.coverageDetails : [],
    pricingFactors: Array.isArray(row.published_data?.pricingFactors) ? row.published_data.pricingFactors : [],
    faqs: Array.isArray(row.published_data?.faqs) ? row.published_data.faqs : []
  };

  const matchedZone = zones.find(z => z.id === row.zone_id || z.slug === row.zone_slug);

  return {
    id: row.id,
    zoneId: row.zone_id || matchedZone?.id || '',
    zoneSlug: row.zone_slug || matchedZone?.slug || '',
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

function normalizeServiceRow(s: any): LiveServiceSummary {
  const normalizedSlug = normalizeCoreServiceSlug(s.slug);
  const ext = (s.extended_content && typeof s.extended_content === 'object' ? s.extended_content : {}) as Record<string, any>;
  const formCfg = (s.form_config && typeof s.form_config === 'object' ? s.form_config : {}) as Record<string, any>;
  const detailsFallback = (formCfg._serviceDetails && typeof formCfg._serviceDetails === 'object' ? formCfg._serviceDetails : {}) as Record<string, any>;
  const extra = { ...detailsFallback, ...ext };

  const processEn = Array.isArray(s.process) ? s.process : undefined;
  const processBn = Array.isArray(s.process_bn) ? s.process_bn : processEn;
  const benefitsEn = Array.isArray(s.benefits) ? s.benefits : undefined;
  const benefitsBn = Array.isArray(s.benefits_bn) ? s.benefits_bn : benefitsEn;
  const idealForEn = Array.isArray(s.ideal_for) ? s.ideal_for : undefined;
  const idealForBn = Array.isArray(s.ideal_for_bn) ? s.ideal_for_bn : idealForEn;
  const numericPrice =
    s.starting_price !== null && s.starting_price !== undefined && Number(s.starting_price) > 0
      ? Number(s.starting_price)
      : undefined;

  return {
    id: s.id,
    slug: normalizedSlug,
    title: s.title,
    titleBn: s.title_bn || s.title,
    name: s.name || s.title,
    shortDesc: s.short_desc || '',
    shortDescBn: s.short_desc_bn || s.short_desc || '',
    short_description: s.short_desc || '',
    fullDesc: s.full_desc || undefined,
    fullDescBn: s.full_desc_bn || s.full_desc || undefined,
    full_description: s.full_desc || undefined,
    category: s.category || 'General Water Hygiene',
    iconName: s.icon_name || s.icon || 'Droplets',
    icon: s.icon || s.icon_name || 'Droplets',
    metaTitle: s.meta_title || s.seo_title || undefined,
    seo_title: s.seo_title || s.meta_title || undefined,
    metaDesc: s.meta_desc || s.meta_description || undefined,
    meta_description: s.meta_description || s.meta_desc || undefined,
    image: s.featured_image || s.image || undefined,
    featured_image: s.featured_image || s.image || undefined,
    is_active: s.is_active !== false,
    display_order: Number(s.display_order ?? 1),
    show_on_homepage: s.show_on_homepage !== false,
    show_in_navigation: s.show_in_navigation !== false,
    show_in_quote_form: s.show_in_quote_form !== false,
    startingPrice: Number.isFinite(numericPrice) ? numericPrice : undefined,
    startingPriceBn: s.starting_price_bn || undefined,
    verifiedPriceNote: extra.verifiedPriceNote || undefined,
    verifiedPriceNoteBn: extra.verifiedPriceNoteBn || undefined,
    popular: Boolean(s.popular),
    isCustomAdded: Boolean(s.is_custom_added),
    benefits: benefitsEn,
    benefitsBn,
    process: processEn,
    processBn,
    processSteps: processEn,
    processStepsBn: processBn,
    idealFor: idealForEn,
    idealForBn,
    includedItems: Array.isArray(extra.includedItems) ? extra.includedItems : undefined,
    includedItemsBn: Array.isArray(extra.includedItemsBn) ? extra.includedItemsBn : undefined,
    excludedItems: Array.isArray(extra.excludedItems) ? extra.excludedItems : undefined,
    excludedItemsBn: Array.isArray(extra.excludedItemsBn) ? extra.excludedItemsBn : undefined,
    customerPrep: Array.isArray(extra.customerPrep) ? extra.customerPrep : undefined,
    customerPrepBn: Array.isArray(extra.customerPrepBn) ? extra.customerPrepBn : undefined,
    durationFactors: Array.isArray(extra.durationFactors) ? extra.durationFactors : undefined,
    durationFactorsBn: Array.isArray(extra.durationFactorsBn) ? extra.durationFactorsBn : undefined,
    pricingFactors: Array.isArray(extra.pricingFactors) ? extra.pricingFactors : undefined,
    pricingFactorsBn: Array.isArray(extra.pricingFactorsBn) ? extra.pricingFactorsBn : undefined,
    formConfig: s.form_config || undefined,
    extendedContent: ext,
    faqs: Array.isArray(s.faqs) ? s.faqs : undefined,
    created_at: s.created_at || undefined,
    updatedAt: s.updated_at || undefined,
    updated_at: s.updated_at || undefined,
    publishedAt: s.published_at || undefined
  };
}

function normalizeCaseStudyRow(row: any): LiveCaseStudySummary {
  const details = row.details && typeof row.details === 'object' ? row.details : {};
  const rawSlug = String(row.slug || details.slug || '').trim();
  const fallbackSlug = String(row.title || row.id || 'case-study')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || String(row.id);

  const rawStatus = row.status || details.status || 'published';
  const status: 'draft' | 'published' = rawStatus === 'draft' ? 'draft' : 'published';

  return {
    id: String(row.id),
    slug: rawSlug || fallbackSlug,
    title: String(row.title || ''),
    titleBn: String(row.title_bn || row.title || ''),
    category: String(row.category || 'Water Tank Cleaning'),
    area: String(row.area || row.location || 'Dhaka'),
    areaSlug: row.area_slug || details.areaSlug || undefined,
    locationBn: row.location_bn || details.locationBn || undefined,
    tankType: String(row.tank_type || 'Overhead Tank'),
    capacity: row.capacity || details.capacity || undefined,
    duration: row.duration || details.duration || undefined,
    serviceDate: String(row.service_date || row.completed_date || ''),
    beforeImage: String(row.before_img || row.before_image || ''),
    afterImage: String(row.after_img || row.after_image || ''),
    beforeCaption: row.before_caption || details.beforeCaption || undefined,
    beforeCaptionBn: row.before_caption_bn || details.beforeCaptionBn || undefined,
    afterCaption: row.after_caption || details.afterCaption || undefined,
    afterCaptionBn: row.after_caption_bn || details.afterCaptionBn || undefined,
    summary: String(row.summary || row.description || ''),
    summaryBn: String(row.summary_bn || row.description_bn || row.summary || ''),
    customerProblem: row.customer_problem || details.customerProblem || undefined,
    customerProblemBn: row.customer_problem_bn || details.customerProblemBn || undefined,
    workDone: row.work_done || details.workDone || undefined,
    workDoneBn: row.work_done_bn || details.workDoneBn || undefined,
    actualResult: row.actual_result || details.actualResult || undefined,
    actualResultBn: row.actual_result_bn || details.actualResultBn || undefined,
    relatedServiceSlug: normalizeCoreServiceSlug(row.related_service_slug || details.relatedServiceSlug || ''),
    featured: Boolean(row.featured),
    status,
    customerConsentGranted: row.customer_consent_granted === true,
    metaTitle: row.meta_title || details.metaTitle || undefined,
    metaDescription: row.meta_description || details.metaDescription || undefined,
    updatedAt: row.updated_at || undefined
  };
}

function normalizeBlogRow(b: any): LiveBlogArticleSummary {
  const seo = b.seo || {};
  const images = Array.isArray(b.images) ? b.images : Array.isArray(seo.images) ? seo.images : [];
  const imageAlt = b.image_alt || seo.imageAlt || '';
  const imageCaption = b.image_caption || seo.imageCaption || '';

  return {
    id: b.id,
    slug: b.slug,
    title: b.title,
    titleBn: b.title_bn || b.title,
    excerpt: b.excerpt || '',
    excerptBn: b.excerpt_bn || b.excerpt || '',
    content: b.content || '',
    contentBn: b.content_bn || b.content || '',
    publishedAt: b.published_at || undefined,
    updatedAt: b.updated_at || undefined,
    imageUrl: b.image_url || undefined,
    imageAlt,
    imageCaption,
    images,
    author: b.author || 'সানভিলোজ হাইজিন টিম',
    category: b.category || 'Water Tank Cleaning',
    categoryBn: b.category_bn || b.category || 'পানির ট্যাংক পরিষ্কার',
    readTime: b.read_time || '5 min read',
    readTimeBn: b.read_time_bn || b.read_time || '৫ মিনিট পাঠ',
    featured: Boolean(b.featured),
    published: b.published !== false,
    metaTitle: seo.metaTitle || undefined,
    metaDescription: seo.metaDescription || undefined,
    seo: {
      metaTitle: seo.metaTitle || '',
      metaDescription: seo.metaDescription || '',
      keywords: Array.isArray(seo.keywords) ? seo.keywords : [],
      canonicalUrl: seo.canonicalUrl || undefined,
      imageAlt,
      imageCaption,
      images
    }
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
 * - Verifies shared cross-instance cache revision (`config/seo_cache_version.json`) before serving LKG fallback
 *   so stale serverless instances cannot resurrect updated, unpublished, or deleted content.
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

  if (useLastKnownGood) {
    hydrateMemoryLkgFromDisk();
  }

  const sliceDetails: Record<SeoSliceName, SliceDiagnostics> = {
    siteSettings: { ok: false },
    zones: { ok: false },
    areas: { ok: false },
    services: { ok: false },
    blogPosts: { ok: false },
    caseStudies: { ok: false },
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
    caseStudiesOk: false,
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
    caseStudies: [],
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

  const [siteRes, zonesRes, areasRes, srvRes, blogRes, caseRes, redirRes, homeRes, imgRegRes, faqRes] = await Promise.all([
    safeQuery(db.from('site_settings').select('config, updated_at').eq('id', 'primary').maybeSingle(), queryTimeoutMs),
    safeQuery(
      db
        .from('service_zones')
        .select('id, slug, name_en, name_bn, summary_en, summary_bn, featured_slug, places_text, published_data, updated_at, published_at, sort_order, is_visible, status, version')
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
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true }),
      queryTimeoutMs
    ),
    safeQuery(
      db
        .from('blog_posts')
        .select('id, slug, title, title_bn, excerpt, excerpt_bn, content, content_bn, image_url, author, category, category_bn, read_time, read_time_bn, featured, published_at, updated_at, published, seo')
        .eq('published', true)
        .order('published_at', { ascending: false }),
      queryTimeoutMs
    ),
    safeQuery(
      db
        .from('portfolio_projects')
        .select('*')
        .eq('customer_consent_granted', true)
        .order('service_date', { ascending: false }),
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

  const anyFailed = Boolean(
    siteRes.error ||
      zonesRes.error ||
      areasRes.error ||
      srvRes.error ||
      blogRes.error ||
      caseRes.error ||
      redirRes.error ||
      homeRes.error ||
      imgRegRes.error ||
      faqRes.error
  );

  // Verify shared cross-instance cache revision before falling back to local or remote LKG
  if (useLastKnownGood && !options.bypassRemoteLkg && anyFailed) {
    const remoteVersion = await loadRemoteCacheVersion(db);
    if (remoteVersion?.revision && lastKnownGoodStore.revision !== remoteVersion.revision) {
      clearLastKnownGoodCache(remoteVersion.revision);
    }

    const missingFromLocal = Boolean(
      (siteRes.error && !isFreshLkg(lastKnownGoodStore.siteSettings, nowMs)) ||
        (zonesRes.error && !isFreshLkg(lastKnownGoodStore.zones, nowMs)) ||
        (areasRes.error && !isFreshLkg(lastKnownGoodStore.areas, nowMs)) ||
        (srvRes.error && !isFreshLkg(lastKnownGoodStore.services, nowMs)) ||
        (blogRes.error && !isFreshLkg(lastKnownGoodStore.blogPosts, nowMs)) ||
        (caseRes.error && !isFreshLkg(lastKnownGoodStore.caseStudies, nowMs)) ||
        (redirRes.error && !isFreshLkg(lastKnownGoodStore.redirects, nowMs)) ||
        (faqRes.error && !isFreshLkg(lastKnownGoodStore.servicesFaqs, nowMs))
    );
    if (missingFromLocal) {
      const remoteLkg = await loadRemoteLkgSnapshot(db, queryTimeoutMs);
      mergeRemoteLkgIntoMemory(remoteLkg, remoteVersion?.revision || null);
    }
  }

  let anyFreshSuccess = false;

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
      dataset.siteConfig = stripSecretsFromSiteConfig(lastKnownGoodStore.siteSettings!.value);
      dataset.siteConfigUpdatedAt = lastKnownGoodStore.siteSettings!.updatedAt;
      status.usedLastKnownGood = true;
      status.staleSlices!.push('siteSettings');
    }
  } else {
    status.siteSettingsOk = true;
    anyFreshSuccess = true;
    dataset.siteConfig = stripSecretsFromSiteConfig(((siteRes.data as any)?.config as Partial<FullSiteConfig>) || null);
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
    anyFreshSuccess = true;
    dataset.zones = Array.isArray(zonesRes.data) ? zonesRes.data.map(normalizeZoneRow) : [];
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
    anyFreshSuccess = true;
    dataset.areas = Array.isArray(areasRes.data)
      ? areasRes.data.map((r: any) => normalizeZoneAreaRow(r, dataset.zones))
      : [];
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
    anyFreshSuccess = true;
    dataset.services = Array.isArray(srvRes.data) ? srvRes.data.map(normalizeServiceRow) : [];
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
    anyFreshSuccess = true;
    dataset.blogPosts = Array.isArray(blogRes.data) ? blogRes.data.map(normalizeBlogRow) : [];
    sliceDetails.blogPosts = { ok: true, count: dataset.blogPosts.length };
    if (cacheLastKnownGood) {
      lastKnownGoodStore.blogPosts = { value: dataset.blogPosts, savedAt: nowMs };
    }
  }

  if (caseRes.error) {
    status.errors.push(`portfolio_projects [${caseRes.error.kind}]: ${caseRes.error.message}`);
    const usedLkg = Boolean(useLastKnownGood && isFreshLkg(lastKnownGoodStore.caseStudies, nowMs));
    sliceDetails.caseStudies = {
      ok: false,
      errorKind: caseRes.error.kind,
      errorMessage: caseRes.error.message,
      usedLkg
    };
    if (usedLkg) {
      dataset.caseStudies = lastKnownGoodStore.caseStudies!.value.filter(
        c => c.status === 'published' && c.customerConsentGranted === true
      );
      status.usedLastKnownGood = true;
      status.staleSlices!.push('caseStudies');
    }
  } else {
    status.caseStudiesOk = true;
    anyFreshSuccess = true;
    dataset.caseStudies = Array.isArray(caseRes.data)
      ? caseRes.data
          .map(normalizeCaseStudyRow)
          .filter(c => c.status === 'published' && c.customerConsentGranted === true)
      : [];
    sliceDetails.caseStudies = { ok: true, count: dataset.caseStudies.length };
    if (cacheLastKnownGood) {
      lastKnownGoodStore.caseStudies = { value: dataset.caseStudies, savedAt: nowMs };
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
    anyFreshSuccess = true;
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
    anyFreshSuccess = true;
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
    anyFreshSuccess = true;
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
    anyFreshSuccess = true;
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

  // Apply authoritative image registry overrides onto services cleanly (never overwrite empty intentional strings if absent)
  if (dataset.imageRegistry?.serviceImages && dataset.services.length > 0) {
    const srvImgs = dataset.imageRegistry.serviceImages;
    dataset.services = dataset.services.map(srv => {
      const legacyKey =
        srv.slug === 'overhead-tank-cleaning'
          ? 'overhead-water-tank-cleaning'
          : srv.slug === 'pipeline-cleaning'
          ? 'water-pipeline-cleaning'
          : undefined;
      const imgOverride = srvImgs[srv.id] || srvImgs[srv.slug] || (legacyKey ? srvImgs[legacyKey] : undefined);
      if (imgOverride && typeof imgOverride === 'string' && imgOverride.trim()) {
        return { ...srv, image: imgOverride.trim(), featured_image: imgOverride.trim() };
      }
      return srv;
    });
  }

  // Persist freshly succeeded snapshot slices cleanly to disk (/tmp) + throttled durable Storage
  if (cacheLastKnownGood && anyFreshSuccess) {
    if (!lastKnownGoodStore.revision && !anyFailed && !options.bypassRemoteLkg) {
      const remoteVersion = await loadRemoteCacheVersion(db);
      lastKnownGoodStore.revision = remoteVersion?.revision || `rev-init-${nowMs}`;
    }
    writeLkgToDisk(lastKnownGoodStore);
    if (!anyFailed && !options.bypassRemoteLkg) {
      await persistLkgSnapshotToStorage(db, lastKnownGoodStore, { nowMs });
    }
  }

  return dataset;
}

export function getCanonicalBaseUrl(): string {
  return getProductionDomain();
}
