import { MediaItem, MediaType, MediaSourceType, YouTubeMetadata } from '../types/media';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { safeSetItem, safeGetItem } from '../utils/safeLocalStorage';
import { compressImageFile } from '../utils/imageCompressor';
import { idbSetBlob, idbGetBlob } from '../utils/indexedDbStorage';

const MEDIA_CACHE_KEY = 'sunviloz_media_library_cache_v2';
export const MEDIA_CHANGE_EVENT = 'sunviloz_media_library_changed';

// Initial curated preset media library items
export const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'med-hero-default',
    fileName: 'dhaka-tank-cleaning-hero.webp',
    fileType: 'image',
    mimeType: 'image/webp',
    publicUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&q=75',
    sourceType: 'external_url',
    altText: 'Professional water tank cleaning service Dhaka',
    title: 'Homepage Hero Tank Cleaning Specialist',
    caption: 'Trained technicians performing high-pressure tank disinfection',
    fileSize: 145000,
    width: 1200,
    height: 800,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'med-pvc-tank',
    fileName: 'pvc-rooftop-clean.webp',
    fileType: 'image',
    mimeType: 'image/webp',
    publicUrl: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=75',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=300&q=75',
    sourceType: 'external_url',
    altText: 'Overhead rooftop PVC water tank in Dhaka',
    title: 'Rooftop PVC Overhead Tank',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'med-concrete-reservoir',
    fileName: 'underground-concrete-reservoir.webp',
    fileType: 'image',
    mimeType: 'image/webp',
    publicUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=75',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=75',
    sourceType: 'external_url',
    altText: 'Underground concrete water reservoir desiltation',
    title: 'Underground Reserve Tank Cleaning',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'med-clean-interior',
    fileName: 'sparkling-clean-tank-interior.webp',
    fileType: 'image',
    mimeType: 'image/webp',
    publicUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=75',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=75',
    sourceType: 'external_url',
    altText: 'Clean and sanitized water tank interior surface',
    title: 'Sanitized Clean Interior Surface',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'med-video-cleaning-desktop',
    fileName: 'tank-cleaning-desktop.mp4',
    fileType: 'video',
    mimeType: 'video/mp4',
    publicUrl: '/videos/tank-cleaning-desktop.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=75',
    sourceType: 'external_url',
    altText: 'High pressure water tank cleaning service video',
    title: 'Professional Cleaning Service Video - Desktop',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'med-video-cleaning-mobile',
    fileName: 'tank-cleaning-mobile.mp4',
    fileType: 'video',
    mimeType: 'video/mp4',
    publicUrl: '/videos/tank-cleaning-mobile.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=75',
    sourceType: 'external_url',
    altText: 'High pressure water tank cleaning service video for mobile',
    title: 'Professional Cleaning Service Video - Mobile',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'med-youtube-demo',
    fileName: 'sunviloz-water-tank-cleaning-process-video',
    fileType: 'youtube',
    publicUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    thumbnailUrl: 'https://img.youtube.com/vi/ScMzIvxBSi4/hqdefault.jpg',
    sourceType: 'youtube',
    youtubeVideoId: 'ScMzIvxBSi4',
    altText: 'Sunviloz Clean Care Cleaning Process Video Demonstration',
    title: 'Professional 6-Stage Water Tank Cleaning Process in Dhaka',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function notifyMediaChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(MEDIA_CHANGE_EVENT));
  }
}

/**
 * Extracts YouTube video ID from various standard YouTube URL formats or raw ID.
 */
export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  // If already an 11-char ID without URL slashes
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  // Matches youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : null;
}

/**
 * Generates verified YouTube metadata
 */
export function getYouTubeMetadata(urlOrId: string): YouTubeMetadata {
  const videoId = extractYouTubeId(urlOrId);
  if (!videoId) {
    return {
      videoId: '',
      thumbnailUrl: '',
      embedUrl: '',
      isValid: false
    };
  }
  return {
    videoId,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0`,
    isValid: true
  };
}

/**
 * Fetch all media items from Supabase with fallback to cached presets
 */
export async function fetchMediaLibrary(searchQuery = '', filterType = 'all'): Promise<MediaItem[]> {
  let items: MediaItem[] = INITIAL_MEDIA_ITEMS;

  if (typeof window !== 'undefined') {
    try {
      const raw = safeGetItem(MEDIA_CACHE_KEY);
      if (raw) {
        items = JSON.parse(raw);
      }
    } catch {
      // Ignore
    }
  }

  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterType !== 'all') {
        query = query.eq('file_type', filterType);
      }
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,file_name.ilike.%${searchQuery}%,alt_text.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        items = data.map((d: any) => ({
          id: d.id,
          fileName: d.file_name,
          fileType: d.file_type as MediaType,
          mimeType: d.mime_type,
          storagePath: d.storage_path,
          publicUrl: d.public_url,
          thumbnailUrl: d.thumbnail_url,
          sourceType: d.source_type as MediaSourceType,
          altText: d.alt_text,
          title: d.title,
          caption: d.caption,
          fileSize: d.file_size,
          width: d.width,
          height: d.height,
          duration: d.duration,
          youtubeVideoId: d.youtube_video_id,
          createdBy: d.created_by,
          createdAt: d.created_at,
          updatedAt: d.updated_at
        }));

        if (typeof window !== 'undefined') {
          safeSetItem(MEDIA_CACHE_KEY, JSON.stringify(items));
        }
        return items;
      }
    } catch (err) {
      console.warn('Could not query media_library from Supabase:', err);
    }
  }

  // Filter local items if needed
  return items.filter(item => {
    const matchesFilter = filterType === 'all' || item.fileType === filterType;
    const matchesSearch = !searchQuery.trim() || 
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.fileName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.altText || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
}

/**
 * Upload direct file (image or video) to Supabase Storage and register in media_library
 */
export async function uploadMediaFile(
  file: File, 
  metadata: { altText?: string; title?: string; caption?: string } = {}
): Promise<{ item: MediaItem | null; error: string | null }> {
  if (!file) return { item: null, error: 'No file selected' };

  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');

  if (!isImage && !isVideo) {
    return { item: null, error: 'Unsupported file type. Please upload a valid image (PNG, JPG, WebP, SVG) or video (MP4, WebM).' };
  }

  // Size limit: images max 50MB, videos max 1GB (1024MB)
  const maxBytes = isVideo ? 1024 * 1024 * 1024 : 50 * 1024 * 1024;
  if (file.size > maxBytes) {
    return { item: null, error: `File size exceeds maximum allowed (${isVideo ? '1GB for videos' : '50MB for images'}).` };
  }

  // Helper to persist item locally
  const saveLocalMediaItem = async (): Promise<{ item: MediaItem | null; error: string | null }> => {
    try {
      const now = new Date().toISOString();
      const mediaId = 'med_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      let url: string;

      if (isImage) {
        url = await compressImageFile(file, {
          maxWidth: 1000,
          maxHeight: 750,
          quality: 0.75
        });
      } else {
        url = URL.createObjectURL(file);
        try {
          await idbSetBlob('sunviloz_video_blob_' + mediaId, file);
        } catch {
          // Fallback gracefully
        }
      }

      const newItem: MediaItem = {
        id: mediaId,
        fileName: file.name,
        fileType: isVideo ? 'video' : 'image',
        mimeType: file.type,
        publicUrl: url,
        storagePath: url,
        thumbnailUrl: isVideo ? undefined : url,
        sourceType: 'upload',
        altText: metadata.altText || file.name.replace(/\.[^/.]+$/, ''),
        title: metadata.title || file.name,
        caption: metadata.caption || '',
        fileSize: file.size,
        createdAt: now,
        updatedAt: now
      };

      const current = await fetchMediaLibrary();
      const updated = [newItem, ...current];
      if (typeof window !== 'undefined') {
        safeSetItem(MEDIA_CACHE_KEY, JSON.stringify(updated));
      }
      notifyMediaChange();
      return { item: newItem, error: null };
    } catch (err: any) {
      return { item: null, error: err?.message || 'Could not process and save uploaded media locally' };
    }
  };

  if (!isSupabaseConfigured()) {
    return await saveLocalMediaItem();
  }

  try {
    const bucket = isVideo ? 'site-videos' : 'site-media';
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `uploads/${Date.now()}_${safeName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (uploadError) {
      if (isVideo && uploadError.message?.includes('not found')) {
        const { error: fallbackError } = await supabase.storage
          .from('site-media')
          .upload(storagePath, file, { cacheControl: '3600', upsert: true, contentType: file.type });
        if (fallbackError) {
          console.warn('[MediaService] Supabase upload failed, falling back to local storage:', fallbackError.message);
          return await saveLocalMediaItem();
        }
      } else {
        console.warn('[MediaService] Supabase upload failed, falling back to local storage:', uploadError.message);
        return await saveLocalMediaItem();
      }
    }

    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    const publicUrl = publicData.publicUrl;
    const now = new Date().toISOString();
    const mediaId = 'med_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const newItem: MediaItem = {
      id: mediaId,
      fileName: file.name,
      fileType: isVideo ? 'video' : 'image',
      mimeType: file.type,
      storagePath,
      publicUrl,
      thumbnailUrl: isVideo ? undefined : publicUrl,
      sourceType: 'upload',
      altText: metadata.altText || file.name.replace(/\.[^/.]+$/, ''),
      title: metadata.title || file.name,
      caption: metadata.caption || '',
      fileSize: file.size,
      createdAt: now,
      updatedAt: now
    };

    await supabase
      .from('media_library')
      .insert({
        id: newItem.id,
        file_name: newItem.fileName,
        file_type: newItem.fileType,
        mime_type: newItem.mimeType,
        storage_path: newItem.storagePath,
        public_url: newItem.publicUrl,
        thumbnail_url: newItem.thumbnailUrl,
        source_type: newItem.sourceType,
        alt_text: newItem.altText,
        title: newItem.title,
        caption: newItem.caption,
        file_size: newItem.fileSize,
        created_at: newItem.createdAt,
        updated_at: newItem.updatedAt
      });

    const current = await fetchMediaLibrary();
    const updated = [newItem, ...current];
    if (typeof window !== 'undefined') {
      safeSetItem(MEDIA_CACHE_KEY, JSON.stringify(updated));
    }
    notifyMediaChange();
    return { item: newItem, error: null };
  } catch (err: any) {
    console.warn('[MediaService] Exception in Supabase upload, saving locally:', err?.message);
    return await saveLocalMediaItem();
  }
}

/**
 * Register an external URL or YouTube video in Media Library
 */
export async function registerExternalMedia(
  url: string,
  type: MediaType,
  metadata: { altText?: string; title?: string; caption?: string } = {}
): Promise<{ item: MediaItem | null; error: string | null }> {
  if (!url || !url.trim()) {
    return { item: null, error: 'Please enter a valid URL' };
  }

  const trimmedUrl = url.trim();
  let ytId: string | null = null;
  let thumbUrl = trimmedUrl;

  if (type === 'youtube' || trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be')) {
    ytId = extractYouTubeId(trimmedUrl);
    if (!ytId) {
      return { item: null, error: 'Invalid YouTube URL or Video ID. Expected format: https://www.youtube.com/watch?v=... or https://youtu.be/...' };
    }
    thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }

  const now = new Date().toISOString();
  const id = 'med_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

  const item: MediaItem = {
    id,
    fileName: metadata.title || (ytId ? `youtube-${ytId}` : trimmedUrl.split('/').pop() || 'external-media'),
    fileType: ytId ? 'youtube' : type,
    publicUrl: trimmedUrl,
    thumbnailUrl: thumbUrl,
    sourceType: ytId ? 'youtube' : 'external_url',
    youtubeVideoId: ytId || undefined,
    altText: metadata.altText || metadata.title || '',
    title: metadata.title || (ytId ? `YouTube Video: ${ytId}` : 'External Media'),
    caption: metadata.caption || '',
    createdAt: now,
    updatedAt: now
  };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('media_library').insert({
        id: item.id,
        file_name: item.fileName,
        file_type: item.fileType,
        public_url: item.publicUrl,
        thumbnail_url: item.thumbnailUrl,
        source_type: item.sourceType,
        youtube_video_id: item.youtubeVideoId,
        alt_text: item.altText,
        title: item.title,
        caption: item.caption,
        created_at: item.createdAt,
        updated_at: item.updatedAt
      });
    } catch {
      // Ignore
    }
  }

  const current = await fetchMediaLibrary();
  const updated = [item, ...current];
  if (typeof window !== 'undefined') {
    safeSetItem(MEDIA_CACHE_KEY, JSON.stringify(updated));
  }
  notifyMediaChange();
  return { item, error: null };
}

/**
 * Delete a media item (checks if currently in use)
 */
export async function deleteMediaItem(id: string): Promise<{ success: boolean; inUseLocations?: string[]; error?: string }> {
  // Check usage across cache
  const inUse: string[] = [];
  try {
    const rawSections = safeGetItem('sunviloz_homepage_sections_v2');
    if (rawSections && rawSections.includes(id)) {
      inUse.push('Homepage Section');
    }
    const rawHeader = safeGetItem('sunviloz_header_config_cache_v2');
    if (rawHeader && rawHeader.includes(id)) {
      inUse.push('Header Logo');
    }
  } catch {
    // Ignore
  }

  if (inUse.length > 0) {
    return {
      success: false,
      inUseLocations: inUse,
      error: `This media item is currently in use in: ${inUse.join(', ')}. Please replace or remove it before deleting.`
    };
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('media_library').delete().eq('id', id);
    } catch {
      // Ignore
    }
  }

  const current = await fetchMediaLibrary();
  const filtered = current.filter(i => i.id !== id);
  if (typeof window !== 'undefined') {
    safeSetItem(MEDIA_CACHE_KEY, JSON.stringify(filtered));
  }
  notifyMediaChange();
  return { success: true };
}

export const getMediaItems = fetchMediaLibrary;

export async function uploadMediaItem(file: File, type?: MediaType): Promise<MediaItem> {
  const result = await uploadMediaFile(file);
  if (result.error || !result.item) {
    throw new Error(result.error || 'Failed to upload media item');
  }
  return result.item;
}
