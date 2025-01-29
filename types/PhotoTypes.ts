import { ENTITY_TYPE_CITIES, ENTITY_TYPE_ATTRACTIONS } from '@/constants';

export interface Album {
  id: string;
  title: string;
  coverPhotoBaseUrl: string;
  mediaItemsCount: string;
}

export interface Photo {
  id: string;
  url: string;
  title?: string;
  caption?: string | null;
  created_at: string;
  format?: string;
  photo_id?: string;
}

export interface GooglePhoto {
  id: string;
  baseUrl: string;
  filename: string;
  description?: string;
}

export interface CloudinaryPhoto {
  asset_id: string;
  secure_url: string;
  created_at: string;
  format: string;
  public_id: string;
  version: number;
  access_mode: string;
  access_control: { access_type: string }[];
}

export interface AlbumViewerProps {
  attachedPhotos?: Photo[];
  entityId: string;
  entityType: typeof ENTITY_TYPE_CITIES | typeof ENTITY_TYPE_ATTRACTIONS;
  onUpdatePhotos: (photos: Photo[]) => void;
}

export interface PhotoManagerProps {
  entityType: typeof ENTITY_TYPE_CITIES | typeof ENTITY_TYPE_ATTRACTIONS;
  entityId: number;
  initialPhotos: Photo[];
  externalPhotos: Photo[] | null;
}

export interface PhotoSearchProps {
  onPhotoSelect: (selectedPhotos: Photo[]) => void;
  initialSelectedPhotos: Photo[];
}
