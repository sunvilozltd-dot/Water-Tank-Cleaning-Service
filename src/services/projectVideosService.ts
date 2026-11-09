import { ProjectVideoItem, ProjectVideoPayload } from '../types/projectVideo';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { safeGetItem, safeSetItem } from '../utils/safeLocalStorage';

export const PROJECT_VIDEOS_STORAGE_KEY = 'sunviloz_project_videos_cache_v1';
export const PROJECT_VIDEOS_CHANGED_EVENT = 'sunviloz_project_videos_changed';

const BUCKET_NAME = 'site-media';
const CONFIG_FILE_PATH = 'config/project_videos.json';

/**
 * Strict Empty State: ZERO hardcoded, demo, or sample videos.
 */
export const DEFAULT_PROJECT_VIDEOS: ProjectVideoItem[] = [];

/**
 * Comprehensive YouTube URL & Video ID extractor
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/live/VIDEO_ID
 * - 11-char direct ID
 */
export function extractYouTubeId(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // If already an 11-char YouTube ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex pattern matching all common YouTube URL formats
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/
  );
  if (match && match[1]) {
    return match[1];
  }

  // Safe URL parser fallback
  try {
    const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (urlObj.searchParams.has('v')) {
      const v = urlObj.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
    }
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && /^[a-zA-Z0-9_-]{11}$/.test(lastPart)) {
      return lastPart;
    }
  } catch {
    // Invalid URL format
  }

  return '';
}

/**
 * Validate a YouTube URL or Video ID
 */
export function validateYouTubeUrl(url: string): { isValid: boolean; videoId: string; error?: string } {
  if (!url || !url.trim()) {
    return {
      isValid: false,
      videoId: '',
      error: 'অনুগ্রহ করে একটি YouTube ভিডিও লিঙ্ক প্রদান করুন।'
    };
  }

  const videoId = extractYouTubeId(url);
  if (!videoId) {
    return {
      isValid: false,
      videoId: '',
      error: 'সঠিক YouTube URL নয়। অনুগ্রহ করে watch, youtu.be, shorts বা embed লিঙ্ক ব্যবহার করুন।'
    };
  }

  return { isValid: true, videoId };
}

/**
 * Retrieve cached project videos synchronously for fast paint
 */
export function getCachedProjectVideos(): ProjectVideoItem[] {
  if (typeof window === 'undefined') return DEFAULT_PROJECT_VIDEOS;
  try {
    const raw = safeGetItem(PROJECT_VIDEOS_STORAGE_KEY);
    if (!raw) return DEFAULT_PROJECT_VIDEOS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.warn('[ProjectVideos] Failed to parse cached videos:', err);
  }
  return DEFAULT_PROJECT_VIDEOS;
}

/**
 * Authoritative fetch from Supabase
 * Tries:
 * 1. Supabase Storage: site-media/config/project_videos.json
 * 2. Supabase Table: homepage_sections (settings.projectVideos)
 */
export async function fetchProjectVideosFromSupabase(): Promise<ProjectVideoItem[]> {
  let videos: ProjectVideoItem[] = getCachedProjectVideos();

  if (!isSupabaseConfigured()) {
    return videos;
  }

  try {
    // 1. Check for versioned files in site-media/config
    const { data: fileList } = await supabase.storage
      .from(BUCKET_NAME)
      .list('config', {
        sortBy: { column: 'name', order: 'desc' }
      });

    if (fileList && fileList.length > 0) {
      const versionedFiles = fileList
        .filter(f => f.name.startsWith('project_videos_') && f.name.endsWith('.json'))
        .sort((a, b) => b.name.localeCompare(a.name));

      const targetFile = versionedFiles[0]?.name || (fileList.some(f => f.name === 'project_videos.json') ? 'project_videos.json' : null);

      if (targetFile) {
        const { data: fileData, error: fileErr } = await supabase.storage
          .from(BUCKET_NAME)
          .download(`config/${targetFile}`);

        if (!fileErr && fileData) {
          const text = await fileData.text();
          const parsed = JSON.parse(text);
          if (parsed && Array.isArray(parsed.videos)) {
            videos = parsed.videos;
            if (typeof window !== 'undefined') {
              safeSetItem(PROJECT_VIDEOS_STORAGE_KEY, JSON.stringify(videos));
              window.dispatchEvent(new CustomEvent(PROJECT_VIDEOS_CHANGED_EVENT, { detail: videos }));
            }
            return videos;
          }
        }
      }
    }

    // 2. Fallback to homepage_sections settings
    const { data: sectionData, error: sectionErr } = await supabase
      .from('homepage_sections')
      .select('settings')
      .eq('id', 'sec-hero')
      .single();

    if (!sectionErr && sectionData?.settings?.projectVideos && Array.isArray(sectionData.settings.projectVideos)) {
      videos = sectionData.settings.projectVideos;
      if (typeof window !== 'undefined') {
        safeSetItem(PROJECT_VIDEOS_STORAGE_KEY, JSON.stringify(videos));
        window.dispatchEvent(new CustomEvent(PROJECT_VIDEOS_CHANGED_EVENT, { detail: videos }));
      }
      return videos;
    }
  } catch (err) {
    console.warn('[ProjectVideos] Could not fetch from Supabase, using cache:', err);
  }

  return videos;
}

/**
 * Persist project videos authoritatively to Supabase
 */
export async function saveProjectVideosToSupabase(videos: ProjectVideoItem[]): Promise<boolean> {
  // Sort by displayOrder ascending
  const sorted = [...videos].sort((a, b) => a.displayOrder - b.displayOrder);

  // 1. Local storage & window event for snappy optimistic UI
  if (typeof window !== 'undefined') {
    safeSetItem(PROJECT_VIDEOS_STORAGE_KEY, JSON.stringify(sorted));
    window.dispatchEvent(new CustomEvent(PROJECT_VIDEOS_CHANGED_EVENT, { detail: sorted }));
  }

  if (!isSupabaseConfigured()) {
    return true;
  }

  try {
    const timestamp = Date.now();
    const payload = {
      updatedAt: new Date().toISOString(),
      version: timestamp,
      videos: sorted
    };

    // 2. Versioned upload to Supabase Storage bucket 'site-media' (guaranteed fresh insertion)
    const versionedFileName = `config/project_videos_${timestamp}.json`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(versionedFileName, JSON.stringify(payload, null, 2), {
        contentType: 'application/json',
        cacheControl: 'max-age=0'
      });

    if (uploadError) {
      console.error('[ProjectVideos] Storage upload error:', uploadError.message);
      // Try fallback to standard filename
      await supabase.storage
        .from(BUCKET_NAME)
        .upload(CONFIG_FILE_PATH, JSON.stringify(payload, null, 2), {
          contentType: 'application/json',
          cacheControl: 'max-age=0',
          upsert: true
        });
    }

    // 3. Dual-persist to homepage_sections (settings.projectVideos) for maximum redundancy
    try {
      const { data: currentSec } = await supabase
        .from('homepage_sections')
        .select('settings')
        .eq('id', 'sec-hero')
        .single();

      if (currentSec?.settings) {
        const nextSettings = {
          ...currentSec.settings,
          projectVideos: sorted
        };
        await supabase
          .from('homepage_sections')
          .update({ settings: nextSettings, updated_at: new Date().toISOString() })
          .eq('id', 'sec-hero');
      }
    } catch (secErr) {
      console.warn('[ProjectVideos] Dual-persist to homepage_sections notice:', secErr);
    }

    return true;
  } catch (err) {
    console.error('[ProjectVideos] Failed to save project videos:', err);
    return false;
  }
}

/**
 * Add a new Project Video
 */
export async function addProjectVideo(payload: ProjectVideoPayload): Promise<{ success: boolean; video?: ProjectVideoItem; error?: string }> {
  const validation = validateYouTubeUrl(payload.youtubeUrl);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  const currentVideos = await fetchProjectVideosFromSupabase();
  const nextOrder = payload.displayOrder !== undefined 
    ? payload.displayOrder 
    : (currentVideos.length > 0 ? Math.max(...currentVideos.map(v => v.displayOrder || 0)) + 1 : 1);

  const newVideo: ProjectVideoItem = {
    id: `pvid-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    youtubeUrl: payload.youtubeUrl.trim(),
    youtubeId: validation.videoId,
    title: payload.title?.trim() || '',
    displayOrder: nextOrder,
    isActive: payload.isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updatedVideos = [...currentVideos, newVideo];
  const saved = await saveProjectVideosToSupabase(updatedVideos);

  if (!saved) {
    return { success: false, error: 'ডাটাবেজে ভিডিও সংরক্ষণ করতে সমস্যা হয়েছে।' };
  }

  return { success: true, video: newVideo };
}

/**
 * Update an existing Project Video
 */
export async function updateProjectVideo(
  id: string, 
  updates: Partial<ProjectVideoPayload>
): Promise<{ success: boolean; error?: string }> {
  const currentVideos = await fetchProjectVideosFromSupabase();
  const index = currentVideos.findIndex(v => v.id === id);
  if (index === -1) {
    return { success: false, error: 'ভিডিওটি পাওয়া যায়নি।' };
  }

  let youtubeId = currentVideos[index].youtubeId;
  let youtubeUrl = currentVideos[index].youtubeUrl;

  if (updates.youtubeUrl !== undefined) {
    const validation = validateYouTubeUrl(updates.youtubeUrl);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }
    youtubeId = validation.videoId;
    youtubeUrl = updates.youtubeUrl.trim();
  }

  const updatedItem: ProjectVideoItem = {
    ...currentVideos[index],
    youtubeUrl,
    youtubeId,
    title: updates.title !== undefined ? updates.title.trim() : currentVideos[index].title,
    displayOrder: updates.displayOrder !== undefined ? updates.displayOrder : currentVideos[index].displayOrder,
    isActive: updates.isActive !== undefined ? updates.isActive : currentVideos[index].isActive,
    updatedAt: new Date().toISOString()
  };

  const nextVideos = [...currentVideos];
  nextVideos[index] = updatedItem;

  const saved = await saveProjectVideosToSupabase(nextVideos);
  if (!saved) {
    return { success: false, error: 'ডাটাবেজে আপডেট সংরক্ষণ করতে সমস্যা হয়েছে।' };
  }

  return { success: true };
}

/**
 * Delete a Project Video
 */
export async function deleteProjectVideo(id: string): Promise<{ success: boolean; error?: string }> {
  const currentVideos = await fetchProjectVideosFromSupabase();
  const nextVideos = currentVideos.filter(v => v.id !== id);

  if (nextVideos.length === currentVideos.length) {
    return { success: false, error: 'ভিডিওটি পাওয়া যায়নি।' };
  }

  const saved = await saveProjectVideosToSupabase(nextVideos);
  if (!saved) {
    return { success: false, error: 'ভিডিও মুছে ফেলতে সমস্যা হয়েছে।' };
  }

  return { success: true };
}
