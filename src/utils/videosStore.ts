import { useState, useEffect } from 'react';
import { WorkVideoItem } from '../types';
import { safeGetItem, safeSetItem } from './safeLocalStorage';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'sunviloz_work_videos_v2';
const EVENT_NAME = 'sunviloz_work_videos_changed';

export const INITIAL_VIDEOS: WorkVideoItem[] = [];

export const extractYouTubeId = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : '';
};

function mapRowToVideo(d: any): WorkVideoItem {
  return {
    id: d.id,
    title: d.title,
    titleBn: d.title_bn || d.title,
    description: d.description || '',
    descriptionBn: d.description_bn || d.description || '',
    youtubeUrl: d.youtube_url || '',
    youtubeId: d.youtube_id || extractYouTubeId(d.youtube_url || ''),
    thumbnailUrl: d.thumbnail_url || (d.youtube_id ? `https://img.youtube.com/vi/${d.youtube_id}/mqdefault.jpg` : ''),
    relatedServiceSlug: d.related_service_slug || '',
    featured: d.featured !== false,
    createdAt: d.created_at || new Date().toISOString().slice(0, 10)
  };
}

function mapVideoToRow(v: WorkVideoItem, index: number): any {
  return {
    id: v.id,
    title: v.title,
    title_bn: v.titleBn || v.title,
    description: v.description || '',
    description_bn: v.descriptionBn || v.description || '',
    youtube_url: v.youtubeUrl || '',
    youtube_id: v.youtubeId || extractYouTubeId(v.youtubeUrl || ''),
    thumbnail_url: v.thumbnailUrl || null,
    related_service_slug: v.relatedServiceSlug || null,
    featured: v.featured !== false,
    sort_order: index + 1,
    updated_at: new Date().toISOString()
  };
}

export const getStoredVideos = (): WorkVideoItem[] => {
  if (typeof window === 'undefined') return INITIAL_VIDEOS;
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) {
      safeSetItem(STORAGE_KEY, JSON.stringify(INITIAL_VIDEOS));
      return INITIAL_VIDEOS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_VIDEOS;
  } catch (err) {
    console.error('Failed to parse work videos:', err);
    return INITIAL_VIDEOS;
  }
};

/**
 * Authoritative fetch from Supabase.
 */
export const fetchVideosFromSupabase = async (): Promise<WorkVideoItem[]> => {
  let list = getStoredVideos();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('work_videos')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        list = data.map(mapRowToVideo);
        if (typeof window !== 'undefined') {
          safeSetItem(STORAGE_KEY, JSON.stringify(list));
          window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: list }));
        }
      } else if (!error && Array.isArray(data) && data.length === 0) {
        list = [];
      }
    } catch (err) {
      console.warn('Could not query work_videos from Supabase, using local store:', err);
    }
  }

  return list;
};

export const saveAllVideos = async (videos: WorkVideoItem[]): Promise<boolean> => {
  if (typeof window !== 'undefined') {
    safeSetItem(STORAGE_KEY, JSON.stringify(videos));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: videos }));
  }

  if (isSupabaseConfigured()) {
    try {
      const rows = videos.map((v, i) => mapVideoToRow(v, i));
      const { error } = await supabase.from('work_videos').upsert(rows, { onConflict: 'id' });
      if (error) {
        console.error('Supabase work_videos sync error:', error.message);
        return false;
      }
    } catch (err) {
      console.error('Failed to sync work_videos to Supabase:', err);
      return false;
    }
  }

  return true;
};

export const addVideo = async (videoData: Omit<WorkVideoItem, 'id'>): Promise<WorkVideoItem> => {
  const current = getStoredVideos();
  const id = `vid-${Date.now().toString(36)}`;
  const youtubeId = videoData.youtubeId || (videoData.youtubeUrl ? extractYouTubeId(videoData.youtubeUrl) : '');
  const newVid: WorkVideoItem = {
    ...videoData,
    id,
    youtubeId,
    createdAt: videoData.createdAt || new Date().toISOString().slice(0, 10)
  };
  const updated = [newVid, ...current];
  await saveAllVideos(updated);
  return newVid;
};

export const updateVideo = async (id: string, updates: Partial<WorkVideoItem>): Promise<boolean> => {
  const current = getStoredVideos();
  const index = current.findIndex(v => v.id === id);
  if (index === -1) return false;
  if (updates.youtubeUrl && !updates.youtubeId) {
    updates.youtubeId = extractYouTubeId(updates.youtubeUrl);
  }
  current[index] = { ...current[index], ...updates };
  return await saveAllVideos([...current]);
};

export const deleteVideo = async (id: string): Promise<boolean> => {
  const current = getStoredVideos();
  const filtered = current.filter(v => v.id !== id);
  if (filtered.length === current.length) return false;
  await saveAllVideos(filtered);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('work_videos').delete().eq('id', id);
    } catch (err) {
      console.warn('Failed to delete video from Supabase:', err);
    }
  }
  return true;
};

export const useWorkVideos = (serviceSlug?: string) => {
  const [videos, setVideos] = useState<WorkVideoItem[]>(() => getStoredVideos());

  useEffect(() => {
    fetchVideosFromSupabase().then(latest => {
      if (latest && latest.length > 0) {
        setVideos(latest);
      }
    });

    const handleUpdate = (e: any) => {
      setVideos(e.detail || getStoredVideos());
    };
    window.addEventListener(EVENT_NAME, handleUpdate);

    let channel: any = null;
    const realtimeTimer = setTimeout(() => {
      if (isSupabaseConfigured() && typeof window !== 'undefined') {
        try {
          channel = supabase
            .channel('realtime:work_videos')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'work_videos' },
              () => {
                fetchVideosFromSupabase();
              }
            )
            .subscribe();
        } catch (err) {
          console.warn('Realtime work_videos notice:', err);
        }
      }
    }, 2500);

    return () => {
      clearTimeout(realtimeTimer);
      window.removeEventListener(EVENT_NAME, handleUpdate);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const serviceVideos = serviceSlug 
    ? videos.filter(v => v.relatedServiceSlug === serviceSlug)
    : videos;

  return {
    videos,
    featuredVideos: videos.filter(v => v.featured),
    serviceVideos,
    addVideo,
    updateVideo,
    deleteVideo
  };
};

export const getVideos = (): any[] => {
  return getStoredVideos().map(v => ({
    ...v,
    url: (v as any).url || (v as any).videoUrl || v.youtubeUrl || '',
    youtubeId: v.youtubeId || (v as any).youtubeVideoId || ''
  }));
};

export const saveVideo = async (video: any): Promise<boolean> => {
  const all = getStoredVideos();
  const index = all.findIndex(v => v.id === video.id);
  const formatted = {
    ...video,
    videoUrl: video.url || video.videoUrl,
    youtubeVideoId: video.youtubeId || video.youtubeVideoId
  };
  if (index >= 0) {
    return await updateVideo(video.id, formatted);
  } else {
    await addVideo(formatted);
    return true;
  }
};
