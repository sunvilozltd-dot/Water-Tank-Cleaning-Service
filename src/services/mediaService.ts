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
    id: 'med-logo-official',
    fileName: 'sunviloz-logo-official.png',
    fileType: 'image',
    mimeType: 'image/png',
    publicUrl: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/branding/sunviloz-logo-official.png',
    thumbnailUrl: 'https://ldzhzeyeuthdkobzxzlm.supabase.co/storage/v1/object/public/site-media/branding/sunviloz-logo-official.png',
    sourceType: 'upload',
    altText: 'Sunviloz Clean Care Official Logo',
    title: 'Sunviloz Clean Care Official Logo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'med-overhead-tank',
    fileName: 'overhead-water-tank-cleaning.jpg',
    fileType: 'image',
    mimeType: 'image/jpeg',
    publicUrl: 'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg',
    thumbnailUrl: 'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/services/overhead-water-tank-cleaning_1794133666768.jpg',
    sourceType: 'upload',
    altText: 'Overhead rooftop water tank cleaning in Dhaka',
    title: 'Overhead Rooftop Water Tank Cleaning',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'med-underground-tank',
    fileName: 'underground-water-tank-cleaning.png',
    fileType: 'image',
    mimeType: 'image/png',
    publicUrl: 'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/services/underground-water-tank-cleaning_1794133736994.png',
    thumbnailUrl: 'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/services/underground-water-tank-cleaning_1794133736994.png',
    sourceType: 'upload',
    altText: 'Underground reserve tank cleaning and desiltation',
    title: 'Underground Reserve Water Tank Cleaning',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'med-water-pipeline',
    fileName: 'water-pipeline-cleaning.jpg',
    fileType: 'image',
    mimeType: 'image/jpeg',
    publicUrl: 'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/services/water-pipeline-cleaning_1794133710278.jpg',
    thumbnailUrl: 'https://mznffcqjlnfgmcyhkmwv.supabase.co/storage/v1/object/public/site-media/services/water-pipeline-cleaning_1794133710278.jpg',
    sourceType: 'upload',
    altText: 'Water supply pipeline hydro pulse cleaning',
    title: 'Water Pipeline Cleaning & Descaling',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'med-video-cleaning-desktop',
    fileName: 'tank-cleaning-desktop.mp4',
    fileType: 'video',
    mimeType: 'video/mp4',
    publicUrl: '/videos/tank-cleaning-desktop.mp4',
    thumbnailUrl: '/assets/aistudio/hero-rooftop-poster.jpg',
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
    thumbnailUrl: '/assets/aistudio/hero-underground-poster.jpg',
    sourceType: 'external_url',
    altText: 'High pressure water tank cleaning service video for mobile',
    title: 'Professional Cleaning Service Video - Mobile',
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
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID (&feature=..., &t=...)
 * - https://youtu.be/VIDEO_ID (?si=...)
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://youtube.com/live/VIDEO_ID
 * - https://www.youtube-nocookie.com/embed/VIDEO_ID
 * - Raw 11-char ID
 */
export function extractYouTubeId(urlOrId: string | null | undefined): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  if (!trimmed) return null;

  // 1. If it's already an 11-char ID (alphanumeric, -, _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. Parse via URL constructor for robust parameter & path extraction
  try {
    const urlStr = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : trimmed.startsWith('//')
        ? `https:${trimmed}`
        : `https://${trimmed}`;

    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');

    if (
      hostname === 'youtube.com' || 
      hostname === 'm.youtube.com' || 
      hostname === 'youtube-nocookie.com'
    ) {
      // /watch?v=ID
      const v = parsed.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return v;
      }
      // /embed/ID, /shorts/ID, /live/ID, /v/ID, /e/ID
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2 && ['embed', 'shorts', 'live', 'v', 'e'].includes(pathParts[0].toLowerCase())) {
        const candidate = pathParts[1];
        if (/^[a-zA-Z0-9_-]{11}$/.test(candidate)) {
          return candidate;
        }
      }
    } else if (hostname === 'youtu.be') {
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 1) {
        const candidate = pathParts[0];
        if (/^[a-zA-Z0-9_-]{11}$/.test(candidate)) {
          return candidate;
        }
      }
    }
  } catch {
    // Fallback to regex if URL parsing encounters atypical syntax
  }

  // 3. Robust regex fallback covering all standard patterns
  const regExp = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|shorts\/|live\/|v\/|e\/|watch\?v=|.*[?&]v=))([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Validates a video input URL (YouTube, MP4/WebM, or local relative path)
 * and returns Bengali feedback message if invalid.
 */
export function validateVideoUrl(input: string | null | undefined): { 
  isValid: boolean; 
  isYouTube: boolean; 
  ytId: string | null; 
  errorBn?: string 
} {
  if (!input || !input.trim()) {
    return { 
      isValid: false, 
      isYouTube: false, 
      ytId: null, 
      errorBn: 'অনুগ্রহ করে ভিডিও লিঙ্ক বা পাথ প্রদান করুন।' 
    };
  }

  const trimmed = input.trim();
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return { isValid: true, isYouTube: true, ytId };
  }

  // Check if input looks like a YouTube link that has an invalid or missing video ID
  if (trimmed.toLowerCase().includes('youtube.com') || trimmed.toLowerCase().includes('youtu.be')) {
    return {
      isValid: false,
      isYouTube: false,
      ytId: null,
      errorBn: 'ইউটিউব লিঙ্কটি সঠিক নয়। অনুগ্রহ করে সঠিক ইউটিউব লিঙ্ক দিন (যেমন: https://www.youtube.com/watch?v=... বা https://youtu.be/...)'
    };
  }

  // Check for local relative file paths
  if (trimmed.startsWith('/') && (trimmed.endsWith('.mp4') || trimmed.endsWith('.webm') || trimmed.endsWith('.ogg') || trimmed.includes('/videos/'))) {
    return { isValid: true, isYouTube: false, ytId: null };
  }

  // Direct MP4/WebM/Media URLs (must start with http:// or https://)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      const pathname = url.pathname.toLowerCase();
      if (
        pathname.endsWith('.mp4') || 
        pathname.endsWith('.webm') || 
        pathname.endsWith('.ogg') || 
        pathname.endsWith('.mov') ||
        trimmed.includes('storage') || 
        trimmed.includes('media')
      ) {
        return { isValid: true, isYouTube: false, ytId: null };
      }
      return { isValid: true, isYouTube: false, ytId: null };
    } catch {
      // Invalid URL
    }
  }

  return {
    isValid: false,
    isYouTube: false,
    ytId: null,
    errorBn: 'সঠিক ভিডিও URL বা ইউটিউব লিঙ্ক প্রদান করুন (যেমন: https://www.youtube.com/watch?v=... বা https://youtu.be/...)'
  };
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
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
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
