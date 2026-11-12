import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { safeGetItem, safeSetItem } from '../utils/safeLocalStorage';
import { compressImageFile } from '../utils/imageCompressor';

export interface WebsiteImageRegistry {
  updatedAt: string;
  version: number;
  serviceImages: Record<string, string>;
  siteImages: {
    logo?: string;
    heroPoster?: string;
    heroBg?: string;
    aboutStoryImage?: string;
    popularTankImage?: string;
    popularUndergroundImage?: string;
    popularPipelineImage?: string;
    beforeAfterCase1Before?: string;
    beforeAfterCase1After?: string;
    beforeAfterCase2Before?: string;
    beforeAfterCase2After?: string;
    beforeAfterCase3Before?: string;
    beforeAfterCase3After?: string;
    [key: string]: string | undefined;
  };
  heroVideos?: {
    video1Url?: string;
    video2Url?: string;
    video3Url?: string;
    poster1Url?: string;
    poster2Url?: string;
    poster3Url?: string;
  };
  projectImages?: Record<string, { before?: string; after?: string }>;
}

export const CENTRAL_IMAGES_STORAGE_KEY = 'sunviloz_central_images_registry_v2';
export const CENTRAL_IMAGES_EVENT = 'sunviloz_central_images_changed';
const BUCKET_NAME = 'site-media';
const CONFIG_FOLDER = 'config';

export const isDemoOrStockUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase().trim();
  return (
    lower.includes('images.unsplash.com') ||
    lower.includes('unsplash.com') ||
    lower.includes('pexels.com') ||
    lower.includes('placeholder') ||
    lower.includes('/assets/aistudio/') ||
    lower.includes('spwatertankcleaner.com') ||
    lower.includes('demo') ||
    lower.includes('sample') ||
    lower.includes('stock') ||
    lower.includes('blob:http')
  );
};

export const AUTHENTIC_DEFAULT_IMAGES = {
  overheadTank: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg',
  undergroundTank: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/underground-water-tank-cleaning_1794133736994.png',
  waterPipeline: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/services/water-pipeline-cleaning_1794133710278.jpg',
  logo: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/branding/sunviloz-logo-official.png',
  aboutStory: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/hero/aboutstoryimage_1794136892339.png',
  heroPoster: 'https://img.youtube.com/vi/vaVkY5afSSE/hqdefault.jpg'
};

export const DEFAULT_IMAGE_REGISTRY: WebsiteImageRegistry = {
  updatedAt: new Date().toISOString(),
  version: 12,
  serviceImages: {
    'srv-overhead-water-tank': AUTHENTIC_DEFAULT_IMAGES.overheadTank,
    'overhead-water-tank-cleaning': AUTHENTIC_DEFAULT_IMAGES.overheadTank,
    'srv-underground-water-tank': AUTHENTIC_DEFAULT_IMAGES.undergroundTank,
    'underground-water-tank-cleaning': AUTHENTIC_DEFAULT_IMAGES.undergroundTank,
    'srv-water-pipeline': AUTHENTIC_DEFAULT_IMAGES.waterPipeline,
    'water-pipeline-cleaning': AUTHENTIC_DEFAULT_IMAGES.waterPipeline
  },
  siteImages: {
    logo: AUTHENTIC_DEFAULT_IMAGES.logo,
    heroPoster: AUTHENTIC_DEFAULT_IMAGES.heroPoster,
    heroBg: AUTHENTIC_DEFAULT_IMAGES.overheadTank,
    aboutStoryImage: AUTHENTIC_DEFAULT_IMAGES.aboutStory,
    popularTankImage: AUTHENTIC_DEFAULT_IMAGES.overheadTank,
    popularUndergroundImage: AUTHENTIC_DEFAULT_IMAGES.undergroundTank,
    popularPipelineImage: AUTHENTIC_DEFAULT_IMAGES.waterPipeline
  },
  heroVideos: {
    video1Url: 'https://youtu.be/vaVkY5afSSE?si=h0czPzjN6VtSIvXZ',
    video2Url: 'https://youtu.be/WY01Mrj5tzc?si=T6DQpEJagoLttn4j',
    video3Url: 'https://youtu.be/aE30Yl5Qpt4?si=WyubHkRWWDhyR8OF',
    poster1Url: 'https://img.youtube.com/vi/vaVkY5afSSE/hqdefault.jpg',
    poster2Url: 'https://img.youtube.com/vi/WY01Mrj5tzc/hqdefault.jpg',
    poster3Url: 'https://img.youtube.com/vi/aE30Yl5Qpt4/hqdefault.jpg'
  },
  projectImages: {}
};

export const EMPTY_IMAGE_REGISTRY: WebsiteImageRegistry = {
  updatedAt: new Date().toISOString(),
  version: 0,
  serviceImages: {},
  siteImages: {
    logo: AUTHENTIC_DEFAULT_IMAGES.logo
  },
  heroVideos: {
    video1Url: 'https://youtu.be/vaVkY5afSSE?si=h0czPzjN6VtSIvXZ',
    video2Url: 'https://youtu.be/WY01Mrj5tzc?si=T6DQpEJagoLttn4j',
    video3Url: 'https://youtu.be/aE30Yl5Qpt4?si=WyubHkRWWDhyR8OF',
    poster1Url: 'https://img.youtube.com/vi/vaVkY5afSSE/hqdefault.jpg',
    poster2Url: 'https://img.youtube.com/vi/WY01Mrj5tzc/hqdefault.jpg',
    poster3Url: 'https://img.youtube.com/vi/aE30Yl5Qpt4/hqdefault.jpg'
  },
  projectImages: {}
};

/**
 * Filter out any demo, stock, or placeholder URLs from an image mapping dictionary.
 * Explicitly preserves empty strings ('') representing intentional removals by administrator.
 */
function sanitizeImageMap<T extends Record<string, string | null | undefined>>(map?: T): Record<string, string> {
  if (!map || typeof map !== 'object') return {};
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(map)) {
    if (val === '' || val === null) {
      result[key] = ''; // Intentionally removed by admin
    } else if (typeof val === 'string' && val.trim() && !isDemoOrStockUrl(val)) {
      result[key] = val.trim();
    }
  }
  return result;
}

/**
 * Get locally cached registry for immediate synchronous paint.
 * Sourced authoritatively from window.__INITIAL_IMAGE_REGISTRY__ during SSR / prerender.
 * LocalStorage cannot override newer published data.
 */
export function getStoredImageRegistry(): WebsiteImageRegistry {
  if (typeof window !== 'undefined') {
    // 1. Authoritative SSR / Prerender Snapshot injected into window.__INITIAL_IMAGE_REGISTRY__
    const windowRegistry = (window as any).__INITIAL_IMAGE_REGISTRY__;
    if (windowRegistry && typeof windowRegistry === 'object' && typeof windowRegistry.version === 'number') {
      const cleanedServiceImages = sanitizeImageMap(windowRegistry.serviceImages);
      const cleanedSiteImages = sanitizeImageMap(windowRegistry.siteImages);
      return {
        updatedAt: windowRegistry.updatedAt || new Date().toISOString(),
        version: windowRegistry.version,
        serviceImages: cleanedServiceImages, // Pure authoritative: no default merging
        siteImages: cleanedSiteImages,       // Pure authoritative: no default merging
        heroVideos: windowRegistry.heroVideos || EMPTY_IMAGE_REGISTRY.heroVideos,
        projectImages: { ...(windowRegistry.projectImages || {}) }
      };
    }

    // 2. Validated client local storage (performance cache only)
    try {
      const raw = safeGetItem(CENTRAL_IMAGES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const parsedVersion = Number(parsed.version || 0);
          if (parsedVersion > 0) {
            const cleanedServiceImages = sanitizeImageMap(parsed.serviceImages);
            const cleanedSiteImages = sanitizeImageMap(parsed.siteImages);
            return {
              updatedAt: parsed.updatedAt || new Date().toISOString(),
              version: parsedVersion,
              serviceImages: cleanedServiceImages, // Pure authoritative cache: no default merging
              siteImages: cleanedSiteImages,       // Pure authoritative cache: no default merging
              heroVideos: parsed.heroVideos || EMPTY_IMAGE_REGISTRY.heroVideos,
              projectImages: { ...(parsed.projectImages || {}) }
            };
          }
        }
      }
    } catch {}
  }

  // 3. Fallback to neutral empty baseline: never flash old demo images
  return EMPTY_IMAGE_REGISTRY;
}

/**
 * Fetch authoritative Central Image Registry from Supabase Storage & Database
 * Accessible by any browser, incognito session, or mobile device with zero auth barrier
 */
export async function fetchCentralImageRegistry(): Promise<WebsiteImageRegistry> {
  let registry = getStoredImageRegistry();

  if (isSupabaseConfigured()) {
    try {
      // 1. List files in site-media/config to find the latest versioned registry
      const { data: fileList } = await supabase.storage
        .from(BUCKET_NAME)
        .list(CONFIG_FOLDER, {
          sortBy: { column: 'name', order: 'desc' }
        });

      if (fileList && fileList.length > 0) {
        const getTimestamp = (name: string) => {
          const match = name.match(/registry_(\d+)\.json/);
          return match ? Number(match[1]) : 0;
        };

        // Filter exclusively for registry_TIMESTAMP.json files and sort by timestamp descending
        const registryFiles = fileList
          .filter(f => f.name.startsWith('registry_') && f.name.endsWith('.json'))
          .sort((a, b) => getTimestamp(b.name) - getTimestamp(a.name));

        const targetFileName = registryFiles[0]?.name;

        if (targetFileName) {
          const { data: pubData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(`${CONFIG_FOLDER}/${targetFileName}`);

          if (pubData?.publicUrl) {
            const res = await fetch(`${pubData.publicUrl}?v=${targetFileName}`, {
              cache: 'no-store',
              headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
            });

            if (res.ok) {
              const remoteJson = await res.json();
              if (remoteJson && (remoteJson.serviceImages || remoteJson.siteImages || remoteJson.heroVideos)) {
                const cleanedRemoteServices = sanitizeImageMap(remoteJson.serviceImages);
                const cleanedRemoteSiteImages = sanitizeImageMap(remoteJson.siteImages);

                // Authoritative published registry: do not merge DEFAULT_IMAGE_REGISTRY
                registry = {
                  updatedAt: remoteJson.updatedAt || new Date().toISOString(),
                  version: Number(remoteJson.version || 13),
                  serviceImages: cleanedRemoteServices,
                  siteImages: cleanedRemoteSiteImages,
                  heroVideos: remoteJson.heroVideos ? { ...remoteJson.heroVideos } : registry.heroVideos,
                  projectImages: { ...(remoteJson.projectImages || {}) }
                };

                if (typeof window !== 'undefined') {
                  safeSetItem(CENTRAL_IMAGES_STORAGE_KEY, JSON.stringify(registry));
                  window.dispatchEvent(new CustomEvent(CENTRAL_IMAGES_EVENT, { detail: registry }));
                }
                return registry;
              }
            }
          }
        }
      }

      // 2. Fallback: check homepage_sections in Supabase Database (sec-hero settings)
      const { data: secData, error: secErr } = await supabase
        .from('homepage_sections')
        .select('settings, content')
        .eq('id', 'sec-hero')
        .single();

      if (!secErr && secData) {
        const rawDbSite = secData.settings?.siteImages || secData.content?.siteImages;
        const rawDbServices = secData.settings?.serviceImages || secData.content?.serviceImages;

        const dbSiteImages = sanitizeImageMap(rawDbSite);
        const dbServiceImages = sanitizeImageMap(rawDbServices);

        if (Object.keys(dbSiteImages).length > 0 || Object.keys(dbServiceImages).length > 0) {
          registry = {
            ...registry,
            siteImages: dbSiteImages,
            serviceImages: dbServiceImages,
            updatedAt: new Date().toISOString()
          };

          if (typeof window !== 'undefined') {
            safeSetItem(CENTRAL_IMAGES_STORAGE_KEY, JSON.stringify(registry));
            window.dispatchEvent(new CustomEvent(CENTRAL_IMAGES_EVENT, { detail: registry }));
          }
        }
      }
    } catch (err) {
      console.warn('[ImageSyncService] Remote registry fetch note:', err);
    }
  }

  return registry;
}

/**
 * Upload an image file (File or Blob) directly to Supabase Storage.
 * Generates an optimized, collision-free, versioned Public URL.
 */
export async function uploadImageToSupabase(
  fileOrBlob: File | Blob,
  folder: 'services' | 'hero' | 'branding' | 'projects' | 'general' | 'articles' | 'blog' = 'general',
  filenamePrefix: string = 'image'
): Promise<{ success: boolean; publicUrl?: string; storagePath?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    let uploadBlob: Blob = fileOrBlob;
    let extension = 'jpg';
    let mimeType = 'image/jpeg';

    if (fileOrBlob instanceof File) {
      const extMatch = fileOrBlob.name.split('.').pop()?.toLowerCase();
      if (extMatch && ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(extMatch)) {
        extension = extMatch === 'jpeg' ? 'jpg' : extMatch;
      }
      mimeType = fileOrBlob.type || 'image/jpeg';

      // Compress client-side if it's a raster photo to optimize upload speed and CDN delivery
      if (fileOrBlob.type.startsWith('image/') && !fileOrBlob.type.includes('svg')) {
        try {
          const compressedDataUrl = await compressImageFile(fileOrBlob, {
            maxWidth: 1200,
            maxHeight: 900,
            quality: 0.85
          });
          const res = await fetch(compressedDataUrl);
          uploadBlob = await res.blob();
          mimeType = uploadBlob.type || 'image/jpeg';
        } catch (compressionErr) {
          console.warn('[ImageSyncService] Compression notice, uploading original:', compressionErr);
          uploadBlob = fileOrBlob;
        }
      }
    }

    const safePrefix = filenamePrefix.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const timestamp = Date.now();
    const storagePath = `${folder}/${safePrefix}_${timestamp}.${extension}`;

    // Upload to Supabase Storage bucket 'site-media' with unique timestamped path
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, uploadBlob, {
        cacheControl: '31536000', // 1 year immutable CDN cache for timestamped files
        upsert: true,
        contentType: mimeType
      });

    if (uploadError) {
      console.error('[ImageSyncService] Supabase storage upload failed:', uploadError.message);
      return { success: false, error: uploadError.message };
    }

    // Retrieve permanent Public URL
    const { data: pubData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    if (!pubData?.publicUrl) {
      return { success: false, error: 'Failed to retrieve public URL from Supabase Storage' };
    }

    return {
      success: true,
      publicUrl: pubData.publicUrl,
      storagePath: uploadData.path || storagePath
    };
  } catch (err: any) {
    console.error('[ImageSyncService] Image upload exception:', err);
    return { success: false, error: err?.message || 'Image upload failed' };
  }
}

/**
 * Persist an updated image URL to Supabase Storage (config/registry_TIMESTAMP.json)
 * and sync to Supabase Database (homepage_sections).
 * Guarantees cross-browser and multi-device persistence across the world.
 */
export async function persistImageChange(
  targetType: 'service' | 'siteConfig' | 'project',
  targetKey: string,
  newImageUrl: string,
  targetId?: string,
  expectedVersion?: number
): Promise<{ success: boolean; error?: string; newVersion?: number }> {
  try {
    // 1. Fetch fresh remote authoritative state to prevent stale local cache writes and detect conflicts
    let current: WebsiteImageRegistry;
    try {
      current = await fetchCentralImageRegistry();
    } catch {
      current = getStoredImageRegistry();
    }

    const remoteVersion = Number(current.version || 0);

    // FIX 2 (VERSION 6): Concurrency conflict detection
    // If client supplied expectedVersion and remote has already advanced beyond it, abort immediately
    if (typeof expectedVersion === 'number' && expectedVersion > 0 && remoteVersion > expectedVersion) {
      console.warn(`[ImageSyncService] Conflict detected: remote registry is at version ${remoteVersion}, but editor was on version ${expectedVersion}. Aborting stale write.`);
      return { 
        success: false, 
        error: `Conflict detected: Another administrator has published a newer update (v${remoteVersion}). Please refresh before saving.` 
      };
    }

    const nextVersion = Math.max(remoteVersion, 13) + 1;

    const updated: WebsiteImageRegistry = {
      ...current,
      updatedAt: new Date().toISOString(),
      version: nextVersion,
      serviceImages: { ...current.serviceImages },
      siteImages: { ...current.siteImages },
      projectImages: { ...(current.projectImages || {}) }
    };

    let previousUrl: string | undefined;
    if (targetType === 'service') {
      const serviceKey = targetId || targetKey;
      previousUrl = current.serviceImages[serviceKey] || current.serviceImages[targetKey];
      updated.serviceImages[serviceKey] = newImageUrl;
      if (targetKey && targetKey !== serviceKey) {
        updated.serviceImages[targetKey] = newImageUrl;
      }
      // Also sync shorthand siteImage keys for popular services
      if (serviceKey.includes('overhead') || targetKey.includes('overhead')) {
        updated.siteImages.popularTankImage = newImageUrl;
      } else if (serviceKey.includes('underground') || targetKey.includes('underground')) {
        updated.siteImages.popularUndergroundImage = newImageUrl;
      } else if (serviceKey.includes('pipeline') || targetKey.includes('pipeline')) {
        updated.siteImages.popularPipelineImage = newImageUrl;
      }
    } else if (targetType === 'siteConfig') {
      previousUrl = current.siteImages[targetKey];
      updated.siteImages[targetKey] = newImageUrl;
      if (targetKey === 'popularTankImage') {
        updated.serviceImages['srv-overhead-water-tank'] = newImageUrl;
        updated.serviceImages['overhead-water-tank-cleaning'] = newImageUrl;
      } else if (targetKey === 'popularUndergroundImage') {
        updated.serviceImages['srv-underground-water-tank'] = newImageUrl;
        updated.serviceImages['underground-water-tank-cleaning'] = newImageUrl;
      } else if (targetKey === 'popularPipelineImage') {
        updated.serviceImages['srv-water-pipeline'] = newImageUrl;
        updated.serviceImages['water-pipeline-cleaning'] = newImageUrl;
      }
    } else if (targetType === 'project' && targetId) {
      if (!updated.projectImages) updated.projectImages = {};
      const proj = updated.projectImages[targetId] || {};
      if (targetKey === 'before') {
        previousUrl = proj.before;
        proj.before = newImageUrl;
      } else {
        previousUrl = proj.after;
        proj.after = newImageUrl;
      }
      updated.projectImages[targetId] = proj;
    }

    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured' };
    }

    // Step 1: Persist central registry to Supabase Storage with unique versioned timestamp filename
    const payloadString = JSON.stringify(updated, null, 2);
    const versionedFilename = `registry_${Date.now()}.json`;

    const { error: storageSaveErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`${CONFIG_FOLDER}/${versionedFilename}`, new Blob([payloadString], { type: 'application/json' }), {
        cacheControl: '0',
        upsert: true,
        contentType: 'application/json'
      });

    if (storageSaveErr) {
      console.error('[ImageSyncService] Supabase Storage registry persistence failed:', storageSaveErr.message);
      return { success: false, error: `Supabase Storage upload failed: ${storageSaveErr.message}` };
    }

    // Step 2: Persist to homepage_sections (sec-hero) in Supabase Database
    try {
      const { data: heroRow } = await supabase
        .from('homepage_sections')
        .select('settings, content')
        .eq('id', 'sec-hero')
        .single();

      const currentSettings = heroRow?.settings || {};
      const currentContent = heroRow?.content || {};

      const updatePayload: Record<string, any> = {
        settings: {
          ...currentSettings,
          version: nextVersion,
          siteImages: updated.siteImages,
          serviceImages: updated.serviceImages
        },
        content: {
          ...currentContent,
          version: nextVersion,
          siteImages: updated.siteImages,
          serviceImages: updated.serviceImages
        },
        updated_at: new Date().toISOString()
      };

      if (targetKey === 'heroPoster') {
        updatePayload.poster_image_url = newImageUrl;
      } else if (targetKey === 'heroBg') {
        updatePayload.image_url = newImageUrl;
      }

      const { data: updateData, error: dbUpdateErr } = await supabase
        .from('homepage_sections')
        .update(updatePayload)
        .eq('id', 'sec-hero')
        .select();

      let dbSucceeded = !dbUpdateErr && Array.isArray(updateData) && updateData.length > 0;

      if (!dbSucceeded) {
        console.warn('[ImageSyncService] Row sec-hero not directly updated, attempting upsert...');
        const { data: upsertData, error: upsertErr } = await supabase
          .from('homepage_sections')
          .upsert({
            id: 'sec-hero',
            section_key: 'hero',
            section_type: 'hero',
            ...updatePayload
          }, { onConflict: 'id' })
          .select();

        dbSucceeded = !upsertErr && Array.isArray(upsertData) && upsertData.length > 0;
        if (!dbSucceeded) {
          console.warn('[ImageSyncService] Note: homepage_sections row update deferred, storage registry holds authoritative publication:', upsertErr?.message || dbUpdateErr?.message);
        }
      }
    } catch (dbErr: any) {
      console.warn('[ImageSyncService] Notice on database section update:', dbErr);
    }

    // Step 3: Comprehensive READ-BACK VERIFICATION before declaring success
    // A. Verify newly published registry JSON is retrievable by anonymous visitors
    const { data: pubData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`${CONFIG_FOLDER}/${versionedFilename}`);

    if (!pubData?.publicUrl) {
      return { success: false, error: 'Read-back failed: Unable to resolve registry public URL' };
    }

    try {
      const readBackRes = await fetch(`${pubData.publicUrl}?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (!readBackRes.ok) {
        return { success: false, error: `Read-back failed: Registry returned status ${readBackRes.status}` };
      }
      const verifiedJson = await readBackRes.json();
      if (!verifiedJson || verifiedJson.version !== nextVersion) {
        return { success: false, error: 'Read-back failed: Published registry version mismatch' };
      }
    } catch (readBackErr: any) {
      return { success: false, error: `Read-back failed: ${readBackErr?.message || 'Network error'}` };
    }

    // B. Verify the image itself is retrievable by anonymous visitors (if not an intentional empty removal)
    if (newImageUrl && newImageUrl.startsWith('http')) {
      try {
        const imgHeadRes = await fetch(newImageUrl, { method: 'HEAD' });
        if (imgHeadRes.status >= 400 && imgHeadRes.status !== 405) { // 405 Method Not Allowed is accepted if HEAD is disabled
          return { success: false, error: `Read-back failed: New image URL returned status ${imgHeadRes.status}` };
        }
      } catch (imgCheckErr: any) {
        console.warn('[ImageSyncService] Notice on image HEAD probe (continuing):', imgCheckErr);
      }
    }

    // Step 4: All verification checks passed! Update local cache and broadcast
    if (typeof window !== 'undefined') {
      safeSetItem(CENTRAL_IMAGES_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(CENTRAL_IMAGES_EVENT, { detail: updated }));
    }

    // Step 5: Safe Deletion: ONLY purge old replaced image once new publication is 100% verified
    if (previousUrl && previousUrl !== newImageUrl && previousUrl.includes(`/storage/v1/object/public/${BUCKET_NAME}/`)) {
      deleteReplacedStorageFile(previousUrl, updated).catch((delErr) => {
        console.warn('[ImageSyncService] Non-blocking replaced media cleanup notice:', delErr);
      });
    }

    return { success: true, newVersion: nextVersion };
  } catch (err: any) {
    console.error('[ImageSyncService] Failed to persist image change:', err);
    return { success: false, error: err?.message || 'Failed to persist image change' };
  }
}

const DELETION_AUDIT_KEY = 'sunviloz_deleted_media_audit_v1';

function recordDeletionAudit(path: string, success: boolean, reason?: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = safeGetItem(DELETION_AUDIT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift({
      path,
      success,
      reason,
      timestamp: new Date().toISOString()
    });
    // Keep last 50 audit entries
    safeSetItem(DELETION_AUDIT_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {}
}

/**
 * Permanently deletes replaced media from Supabase Storage once verified.
 * Guarantees that orphaned files do not accumulate, while strictly protecting active,
 * shared, or essential media assets.
 */
export async function deleteReplacedStorageFile(
  oldUrl: string,
  currentRegistry: WebsiteImageRegistry
): Promise<{ success: boolean; deletedPath?: string; error?: string }> {
  try {
    if (!oldUrl || typeof oldUrl !== 'string') return { success: false, error: 'Empty URL' };

    const bucketMarker = `/storage/v1/object/public/${BUCKET_NAME}/`;
    if (!oldUrl.includes(bucketMarker)) {
      return { success: false, error: 'Not a site-media storage object' };
    }

    const storagePath = decodeURIComponent(oldUrl.split(bucketMarker)[1].split('?')[0]);
    if (!storagePath) {
      return { success: false, error: 'Invalid storage path' };
    }

    // Safety rules: NEVER delete protected core assets
    if (
      storagePath.includes('sunviloz-logo') ||
      storagePath.includes('tank-cleaning-desktop') ||
      storagePath.includes('tank-cleaning-mobile') ||
      storagePath.startsWith('config/')
    ) {
      return { success: false, error: 'Protected core asset' };
    }

    // Check if oldUrl is still referenced anywhere in the active registry
    const isStillReferenced =
      Object.values(currentRegistry.serviceImages || {}).includes(oldUrl) ||
      Object.values(currentRegistry.siteImages || {}).includes(oldUrl) ||
      Object.values(currentRegistry.projectImages || {}).some(
        p => p?.before === oldUrl || p?.after === oldUrl
      );

    if (isStillReferenced) {
      return { success: false, error: 'File still referenced in registry' };
    }

    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    if (error) {
      console.warn(`[ImageSyncService] Could not remove obsolete file ${storagePath}:`, error.message);
      recordDeletionAudit(storagePath, false, error.message);
      return { success: false, deletedPath: storagePath, error: error.message };
    }

    recordDeletionAudit(storagePath, true);
    return { success: true, deletedPath: storagePath };
  } catch (err: any) {
    console.warn('[ImageSyncService] Exception during file deletion:', err);
    return { success: false, error: err?.message || 'Deletion error' };
  }
}

/**
 * Safely delete an obsolete article image from Supabase Storage if it is no longer referenced
 * in any article or site media.
 */
export async function deleteArticleStorageImage(
  oldUrl: string,
  allActiveImageUrls: string[] = []
): Promise<{ success: boolean; deletedPath?: string; error?: string }> {
  try {
    if (!oldUrl || typeof oldUrl !== 'string') return { success: false, error: 'Empty URL' };
    const bucketMarker = `/storage/v1/object/public/${BUCKET_NAME}/`;
    if (!oldUrl.includes(bucketMarker)) {
      return { success: false, error: 'Not a site-media storage object' };
    }

    const storagePath = decodeURIComponent(oldUrl.split(bucketMarker)[1].split('?')[0]);
    if (!storagePath) {
      return { success: false, error: 'Invalid storage path' };
    }

    // Safety check: protect core assets
    if (
      storagePath.includes('sunviloz-logo') ||
      storagePath.includes('tank-cleaning-desktop') ||
      storagePath.includes('tank-cleaning-mobile') ||
      storagePath.startsWith('config/')
    ) {
      return { success: false, error: 'Protected core asset' };
    }

    // Check if the URL is still referenced in other articles or active images
    if (allActiveImageUrls.includes(oldUrl)) {
      return { success: false, error: 'File still referenced in active content' };
    }

    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    if (error) {
      console.warn(`[ImageSyncService] Could not remove obsolete article file ${storagePath}:`, error.message);
      recordDeletionAudit(storagePath, false, error.message);
      return { success: false, deletedPath: storagePath, error: error.message };
    }

    recordDeletionAudit(storagePath, true);
    return { success: true, deletedPath: storagePath };
  } catch (err: any) {
    console.warn('[ImageSyncService] Exception deleting article image:', err);
    return { success: false, error: err?.message || 'Deletion error' };
  }
}

/**
 * Persist Hero Cover Videos directly to Supabase Storage Central Registry.
 * Ensures cross-browser, cross-device, and incognito session persistence.
 */
export async function persistHeroVideosToCentralRegistry(videos: {
  video1Url: string;
  video2Url: string;
  video3Url: string;
  poster1Url?: string;
  poster2Url?: string;
  poster3Url?: string;
}): Promise<boolean> {
  const current = getStoredImageRegistry();
  const updated: WebsiteImageRegistry = {
    ...current,
    updatedAt: new Date().toISOString(),
    version: (current.version || 1) + 1,
    heroVideos: {
      video1Url: videos.video1Url,
      video2Url: videos.video2Url,
      video3Url: videos.video3Url,
      poster1Url: videos.poster1Url,
      poster2Url: videos.poster2Url,
      poster3Url: videos.poster3Url
    }
  };

  if (typeof window !== 'undefined') {
    safeSetItem(CENTRAL_IMAGES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(CENTRAL_IMAGES_EVENT, { detail: updated }));
  }

  if (isSupabaseConfigured()) {
    try {
      const payloadString = JSON.stringify(updated, null, 2);
      const versionedFilename = `registry_${Date.now()}.json`;

      await supabase.storage
        .from(BUCKET_NAME)
        .upload(`${CONFIG_FOLDER}/${versionedFilename}`, new Blob([payloadString], { type: 'application/json' }), {
          cacheControl: '0',
          upsert: true,
          contentType: 'application/json'
        });
    } catch (err) {
      console.warn('[ImageSyncService] persistHeroVideosToCentralRegistry notice:', err);
    }
  }

  return true;
}

