import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ProjectVideoItem, ProjectVideoPayload } from '../types/projectVideo';
import {
  getCachedProjectVideos,
  fetchProjectVideosFromSupabase,
  addProjectVideo as serviceAddVideo,
  updateProjectVideo as serviceUpdateVideo,
  deleteProjectVideo as serviceDeleteVideo,
  PROJECT_VIDEOS_CHANGED_EVENT
} from '../services/projectVideosService';

interface ProjectVideosContextType {
  videos: ProjectVideoItem[];
  activeVideos: ProjectVideoItem[];
  loading: boolean;
  refreshVideos: () => Promise<void>;
  addVideo: (payload: ProjectVideoPayload) => Promise<{ success: boolean; video?: ProjectVideoItem; error?: string }>;
  updateVideo: (id: string, payload: Partial<ProjectVideoPayload>) => Promise<{ success: boolean; error?: string }>;
  deleteVideo: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const ProjectVideosContext = createContext<ProjectVideosContextType | undefined>(undefined);

export const ProjectVideosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [videos, setVideos] = useState<ProjectVideoItem[]>(() => getCachedProjectVideos());
  const [loading, setLoading] = useState(true);

  const refreshVideos = useCallback(async () => {
    try {
      const latest = await fetchProjectVideosFromSupabase();
      setVideos(latest);
    } catch (err) {
      console.warn('[ProjectVideosContext] Error refreshing videos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshVideos();

    const handleChanged = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setVideos(e.detail);
      } else {
        refreshVideos();
      }
    };

    window.addEventListener(PROJECT_VIDEOS_CHANGED_EVENT, handleChanged);
    return () => {
      window.removeEventListener(PROJECT_VIDEOS_CHANGED_EVENT, handleChanged);
    };
  }, [refreshVideos]);

  const addVideo = async (payload: ProjectVideoPayload) => {
    const res = await serviceAddVideo(payload);
    if (res.success) {
      await refreshVideos();
    }
    return res;
  };

  const updateVideo = async (id: string, payload: Partial<ProjectVideoPayload>) => {
    const res = await serviceUpdateVideo(id, payload);
    if (res.success) {
      await refreshVideos();
    }
    return res;
  };

  const deleteVideo = async (id: string) => {
    const res = await serviceDeleteVideo(id);
    if (res.success) {
      await refreshVideos();
    }
    return res;
  };

  const activeVideos = videos
    .filter(v => v.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <ProjectVideosContext.Provider
      value={{
        videos,
        activeVideos,
        loading,
        refreshVideos,
        addVideo,
        updateVideo,
        deleteVideo
      }}
    >
      {children}
    </ProjectVideosContext.Provider>
  );
};

export const useProjectVideos = (): ProjectVideosContextType => {
  const context = useContext(ProjectVideosContext);
  if (!context) {
    throw new Error('useProjectVideos must be used within a ProjectVideosProvider');
  }
  return context;
};
