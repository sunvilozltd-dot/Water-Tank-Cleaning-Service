export type MediaType = 'image' | 'video' | 'youtube';

export type MediaSourceType = 'upload' | 'external_url' | 'youtube';

export interface MediaItem {
  id: string;
  fileName: string;
  fileType: MediaType;
  mimeType?: string;
  storagePath?: string;
  publicUrl: string;
  thumbnailUrl?: string;
  sourceType: MediaSourceType;
  altText?: string;
  title?: string;
  caption?: string;
  fileSize?: number; // in bytes
  width?: number;
  height?: number;
  duration?: number; // in seconds
  youtubeVideoId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaUploadOptions {
  altText?: string;
  title?: string;
  caption?: string;
}

export interface YouTubeMetadata {
  videoId: string;
  title?: string;
  thumbnailUrl: string;
  embedUrl: string;
  isValid: boolean;
}
