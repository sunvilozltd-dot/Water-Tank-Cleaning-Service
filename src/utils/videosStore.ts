import { useState, useEffect } from 'react';
import { WorkVideoItem } from '../types';
import { safeGetItem, safeSetItem } from './safeLocalStorage';

const STORAGE_KEY = 'sunviloz_work_videos_v2';
const EVENT_NAME = 'sunviloz_work_videos_changed';

export const INITIAL_VIDEOS: WorkVideoItem[] = [
  {
    id: 'vid-1',
    title: 'Rooftop PVC Overhead Tank High-Pressure Jet Cleaning',
    titleBn: 'ছাদের পিভিসি ট্যাংকের হাই-প্রেসার রোটারি জেট দিয়ে শ্যাওলা পরিষ্কার',
    description: '150-bar rotary water jet removing algae, biofilms, and deep dirt without damaging PVC walls.',
    descriptionBn: 'ট্যাংকের প্লাস্টিক ক্ষতি না করে ভেতরের কঠিন শ্যাওলা ও ব্যাকটেরিয়া লেয়ার পরিষ্কার করার দৃশ্য।',
    youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    youtubeId: 'ScMzIvxBSi4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=75',
    relatedServiceSlug: 'water-overhead-tank-cleaning',
    featured: true,
    createdAt: '2026-08-10'
  },
  {
    id: 'vid-2',
    title: 'Underground Reserve Tank Heavy Sludge & WASA Mud Pumping',
    titleBn: 'মাটির নিচের রিজার্ভার থেকে ওয়াসা কাদা ও স্লাজ উত্তোলন পদ্ধতি',
    description: 'Industrial submersible slurry pumps extracting thick municipal sediment and deep wall power washing.',
    descriptionBn: 'সাবমারসিবল পাম্প ও সাকশন ভ্যাকুয়ামের সাহায্যে নিচ থেকে ভারী কাদা অপসারণের সরাসরি দৃশ্য।',
    youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    youtubeId: 'ScMzIvxBSi4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=75',
    relatedServiceSlug: 'underground-water-tank-cleaning',
    featured: true,
    createdAt: '2026-08-22'
  },
  {
    id: 'vid-3',
    title: 'Residential Water Supply Pipeline Flushing & Iron Scale Removal',
    titleBn: 'ঘরের ভেতরের পানির পাইপলাইন ফ্লাশিং ও জমে থাকা আয়রন পরিষ্কার',
    description: 'Pressurized hydrodynamic pulsing cleaning pipes, eliminating rust, and restoring faucet pressure.',
    descriptionBn: 'দেয়াল না ভেঙে হাইড্রো-পালস মেশিনে পাইপের ভেতরের মরিচা ও লালচে আয়রন ধুয়ে বের করা।',
    youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    youtubeId: 'kJQP7kiw5Fk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=75',
    relatedServiceSlug: 'water-pipeline-cleaning',
    featured: true,
    createdAt: '2026-09-05'
  }
];

export const getStoredVideos = (): WorkVideoItem[] => {
  if (typeof window === 'undefined') return INITIAL_VIDEOS;
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) {
      safeSetItem(STORAGE_KEY, JSON.stringify(INITIAL_VIDEOS));
      return INITIAL_VIDEOS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_VIDEOS;
  } catch (err) {
    console.error('Failed to parse work videos:', err);
    return INITIAL_VIDEOS;
  }
};

export const saveAllVideos = (videos: WorkVideoItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    safeSetItem(STORAGE_KEY, JSON.stringify(videos));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: videos }));
  } catch (err) {
    console.error('Failed to save work videos:', err);
  }
};

export const extractYouTubeId = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : '';
};

export const addVideo = (videoData: Omit<WorkVideoItem, 'id'>): WorkVideoItem => {
  const current = getStoredVideos();
  const id = `vid-${Date.now().toString(36)}`;
  const youtubeId = videoData.youtubeId || (videoData.youtubeUrl ? extractYouTubeId(videoData.youtubeUrl) : '');
  const newVid: WorkVideoItem = {
    ...videoData,
    id,
    youtubeId,
    createdAt: videoData.createdAt || new Date().toISOString().slice(0, 10)
  };
  saveAllVideos([newVid, ...current]);
  return newVid;
};

export const updateVideo = (id: string, updates: Partial<WorkVideoItem>): boolean => {
  const current = getStoredVideos();
  const index = current.findIndex(v => v.id === id);
  if (index === -1) return false;
  if (updates.youtubeUrl && !updates.youtubeId) {
    updates.youtubeId = extractYouTubeId(updates.youtubeUrl);
  }
  current[index] = { ...current[index], ...updates };
  saveAllVideos([...current]);
  return true;
};

export const deleteVideo = (id: string): boolean => {
  const current = getStoredVideos();
  const filtered = current.filter(v => v.id !== id);
  if (filtered.length === current.length) return false;
  saveAllVideos(filtered);
  return true;
};

export const useWorkVideos = (serviceSlug?: string) => {
  const [videos, setVideos] = useState<WorkVideoItem[]>(() => getStoredVideos());

  useEffect(() => {
    const handleUpdate = (e: any) => {
      setVideos(e.detail || getStoredVideos());
    };
    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(EVENT_NAME, handleUpdate);
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

export const saveVideo = (video: any): boolean => {
  const all = getStoredVideos();
  const index = all.findIndex(v => v.id === video.id);
  const formatted = {
    ...video,
    videoUrl: video.url || video.videoUrl,
    youtubeVideoId: video.youtubeId || video.youtubeVideoId
  };
  if (index >= 0) {
    return updateVideo(video.id, formatted);
  } else {
    addVideo(formatted);
    return true;
  }
};
