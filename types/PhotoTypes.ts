import { ENTITY_TYPE_CITIES, ENTITY_TYPE_ATTRACTIONS } from '@/constants';

export interface Photo {
  id: string;
  url: string;
  title?: string;
  caption?: string | null;
  created_at: string;
  format?: string;
  photo_id?: string;
  added?: boolean;
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

export interface ImageCardProps {
  photoId: string;
  imageUrl: string;
  caption?: string;
  alt?: string;
  isSelected: boolean;
  onClick: (id: string) => void;
}

export interface ImageGridProps {
  images: Photo[];
  onImageClick: (id: string) => void;
}

export interface UploadedImage {
  id: string;
  url: string;
  name: string;
  size: string;
  width?: number;
  height?: number;
  metadata?: Record<string, any>;
}

export interface UploadFilesProps {
  onUpload: (images: UploadedImage[]) => void;
}

export interface CollectionProps {
  images: Photo[];
  onImageClick: (photoId: string) => void;
  onRemoveSelected: () => void;
  onClearSelection: () => void;
  onStartPhotoSearch: () => void;
}
