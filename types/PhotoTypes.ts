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
  caption: string | null;
  created_at: string;
}

export interface GooglePhoto {
  id: string;
  baseUrl: string;
  filename: string;
}

export interface AlbumViewerProps {
  attachedPhotos?: Photo[];
  entityId: string;
  entityType: 'city' | 'attraction';
}
