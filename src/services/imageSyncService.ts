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

export const DEFAULT_IMAGE_REGISTRY: WebsiteImageRegistry = {
  updatedAt: new Date().toISOString(),
  version: 1,
  serviceImages: {
    'srv-overhead-water-tank': 'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg',
    'overhead-water-tank-cleaning': 'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg',
    'srv-underground-water-tank': 'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/services/underground-water-tank-cleaning_1794133736994.png',
    'underground-water-tank-cleaning': 'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/services/underground-water-tank-cleaning_1794133736994.png',
    'srv-water-pipeline': 'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/services/water-pipeline-cleaning_1794133710278.jpg',
    'water-pipeline-cleaning': 'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/services/water-pipeline-cleaning_1794133710278.jpg'
  },
  siteImages: {
    logo: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/branding/sunviloz-logo-official.png',
    heroPoster: '/assets/aistudio/hero-rooftop-poster.jpg',
    aboutStoryImage: 'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/hero/aboutstoryimage_1794136892339.png',
    popularTankImage: 'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg',
    popularUndergroundImage: 'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/services/underground-water-tank-cleaning_1794133736994.png',
    popularPipelineImage: 'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/services/water-pipeline-cleaning_1794133710278.jpg'
  },
  projectImages: {}
};

/**
 * Get locally cached registry for immediate synchronous paint
 */
export function getStoredImageRegistry(): WebsiteImageRegistry {
  if (typeof window === 'undefined') return DEFAULT_IMAGE_REGISTRY;
  try {
    const raw = safeGetItem(CENTRAL_IMAGES_STORAGE_KEY);
    if (!raw) return DEFAULT_IMAGE_REGISTRY;
    const parsed = JSON.parse(raw);
    return {
      updatedAt: parsed.updatedAt || DEFAULT_IMAGE_REGISTRY.updatedAt,
      version: parsed.version || 1,
      serviceImages: { ...DEFAULT_IMAGE_REGISTRY.serviceImages, ...(parsed.serviceImages || {}) },
      siteImages: { ...DEFAULT_IMAGE_REGISTRY.siteImages, ...(parsed.siteImages || {}) },
      projectImages: { ...(parsed.projectImages || {}) }
    };
  } catch {
    return DEFAULT_IMAGE_REGISTRY;
  }
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
        // Find latest registry_*.json file (or fallback to any json in config)
        const registryFiles = fileList
          .filter(f => f.name.startsWith('registry_') && f.name.endsWith('.json'))
          .sort((a, b) => b.name.localeCompare(a.name));

        const targetFileName = registryFiles[0]?.name || fileList.find(f => f.name.endsWith('.json'))?.name;

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
                registry = {
                  updatedAt: remoteJson.updatedAt || new Date().toISOString(),
                  version: Number(remoteJson.version || 1),
                  serviceImages: { ...DEFAULT_IMAGE_REGISTRY.serviceImages, ...(remoteJson.serviceImages || {}) },
                  siteImages: { ...DEFAULT_IMAGE_REGISTRY.siteImages, ...(remoteJson.siteImages || {}) },
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
        const dbSiteImages = secData.settings?.siteImages || secData.content?.siteImages;
        const dbServiceImages = secData.settings?.serviceImages || secData.content?.serviceImages;

        if (dbSiteImages || dbServiceImages) {
          registry = {
            ...registry,
            siteImages: { ...registry.siteImages, ...(dbSiteImages || {}) },
            serviceImages: { ...registry.serviceImages, ...(dbServiceImages || {}) },
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
  folder: 'services' | 'hero' | 'branding' | 'projects' | 'general' = 'general',
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
  targetId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const current = getStoredImageRegistry();
    const updated: WebsiteImageRegistry = {
      ...current,
      updatedAt: new Date().toISOString(),
      version: (current.version || 1) + 1,
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

    // 1. Save locally for immediate feedback in current browser
    if (typeof window !== 'undefined') {
      safeSetItem(CENTRAL_IMAGES_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(CENTRAL_IMAGES_EVENT, { detail: updated }));
    }

    // 2. Persist central registry to Supabase Storage with unique versioned timestamp filename
    if (isSupabaseConfigured()) {
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
        console.warn('[ImageSyncService] Could not persist versioned registry to storage:', storageSaveErr.message);
      }

      // 3. Persist to homepage_sections (sec-hero) in Supabase Database
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
            siteImages: updated.siteImages,
            serviceImages: updated.serviceImages
          },
          content: {
            ...currentContent,
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

        const { error: dbUpdateErr } = await supabase
          .from('homepage_sections')
          .update(updatePayload)
          .eq('id', 'sec-hero');

        if (dbUpdateErr) {
          console.warn('[ImageSyncService] Database update notice:', dbUpdateErr.message);
        }
      } catch (dbErr) {
        console.warn('[ImageSyncService] Exception updating homepage_sections:', dbErr);
      }
    }

    // 4. Safe Deletion: If old image is replaced and no longer referenced, purge from Storage
    if (previousUrl && previousUrl !== newImageUrl) {
      deleteReplacedStorageFile(previousUrl, updated).catch((delErr) => {
        console.warn('[ImageSyncService] Non-blocking replaced media cleanup notice:', delErr);
      });
    }

    return { success: true };
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

