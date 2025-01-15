export interface Album {
  id: string;
  title: string;
  coverPhotoBaseUrl: string;
  mediaItemsCount: string;
}

export interface Photo {
  id: string;
  baseUrl: string;
  filename: string;
  title?: string;
}

export interface AlbumViewerProps {
  photos: Photo[];
  entityId: number; // ID of the city or attraction
  entityType: 'city' | 'attraction'; // Type of the entity
  onPhotoSelect?: (photo: {
    id: string;
    baseUrl: string;
    filename: string;
  }) => void;
  attachPhotoService: (
    entityId: number,
    entityType: string,
    url: string
  ) => Promise<void>;
}
