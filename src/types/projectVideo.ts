export interface ProjectVideoItem {
  id: string;
  youtubeUrl: string;
  youtubeId: string;
  title?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectVideoPayload {
  youtubeUrl: string;
  title?: string;
  displayOrder?: number;
  isActive?: boolean;
}
