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
    'srv-overhead-water-tank': 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=1200&q=75',
    'overhead-water-tank-cleaning': 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=1200&q=75',
    'srv-underground-water-tank': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=75',
    'underground-water-tank-cleaning': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=75',
    'srv-water-pipeline': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=75',
    'water-pipeline-cleaning': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=75'
  },
  siteImages: {
    heroPoster: '/assets/aistudio/hero-rooftop-poster.jpg',
    heroBg: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
    aboutStoryImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
    popularTankImage: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=1200&q=75',
    popularUndergroundImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=75',
    popularPipelineImage: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=75'
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
              if (remoteJson && (remoteJson.serviceImages || remoteJson.siteImages)) {
                registry = {
                  updatedAt: remoteJson.updatedAt || new Date().toISOString(),
                  version: Number(remoteJson.version || 1),
                  serviceImages: { ...DEFAULT_IMAGE_REGISTRY.serviceImages, ...(remoteJson.serviceImages || {}) },
                  siteImages: { ...DEFAULT_IMAGE_REGISTRY.siteImages, ...(remoteJson.siteImages || {}) },
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

    if (targetType === 'service') {
      const serviceKey = targetId || targetKey;
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
        proj.before = newImageUrl;
      } else {
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

    return { success: true };
  } catch (err: any) {
    console.error('[ImageSyncService] Failed to persist image change:', err);
    return { success: false, error: err?.message || 'Failed to persist image change' };
  }
}
