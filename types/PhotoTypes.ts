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
}

export interface AlbumViewerProps {
  fetchAlbumsEndpoint: string;
  fetchPhotosEndpoint: string;
}
