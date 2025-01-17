import React, { useState, useEffect, useMemo } from 'react';
import {
  Album,
  GooglePhoto,
  AlbumViewerProps,
  Photo,
} from '@/types/PhotoTypes';
import Message from '@/components/Message/Message';

const AlbumViewer: React.FC<AlbumViewerProps> = ({
  entityType,
  entityId,
  attachedPhotos = [],
  onUpdatePhotos,
}) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<GooglePhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [attachedPhotosState, setAttachedPhotos] =
    useState<Photo[]>(attachedPhotos);

  const fetchAlbumsEndpoint = '/api/google/photos/albums';
  const fetchPhotosEndpoint = '/api/google/photos/album/photos';

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch(fetchAlbumsEndpoint);
        const data = await response.json();
        setAlbums(data.albums || []);
      } catch (error) {
        console.error('Error fetching albums:', error);
        setMessage('Failed to fetch albums.');
      }
    };

    fetchAlbums();
  }, [fetchAlbumsEndpoint]);

  const togglePhoto = async (photo: GooglePhoto) => {
    if (isPhotoAttached(photo.id)) {
      // Remove the photo from attachedPhotos
      setAttachedPhotos((prev) =>
        prev.filter((attachedPhoto) => attachedPhoto.id !== photo.id)
      );
    } else {
      // Add the photo to attachedPhotos
      const newPhoto: Photo = {
        id: photo.id,
        url: `${photo.baseUrl}`,
        title: photo.filename,
        caption: photo.description || photo.filename,
        created_at: new Date().toISOString(),
      };
      setAttachedPhotos((prev) => [...prev, newPhoto]);
    }
  };

  const fetchPhotos = async (albumId: string) => {
    setLoading(true);
    setMessage('');
    setSelectedAlbumId(albumId);
    try {
      const response = await fetch(`${fetchPhotosEndpoint}?albumId=${albumId}`);
      const data = await response.json();
      setPhotos(data.mediaItems || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setMessage('Failed to fetch photos.');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = useMemo(() => {
    if (attachedPhotos.length !== attachedPhotosState.length) return true;
    const attachedPhotoIds = attachedPhotos.map((photo) => photo.id).sort();
    const attachedPhotosStateIds = attachedPhotosState
      .map((photo) => photo.id)
      .sort();
    return !attachedPhotoIds.every(
      (id, index) => id === attachedPhotosStateIds[index]
    );
  }, [attachedPhotos, attachedPhotosState]);

  const isPhotoAttached = (photoId: string): boolean => {
    return attachedPhotosState
      ? attachedPhotosState.some((photo) => photo.id === photoId)
      : false;
  };

  const handleUpdatePhotos = () => {
    console.log('Updating photos:', attachedPhotosState);
    onUpdatePhotos(attachedPhotosState);
    setIsDialogOpen(false);
  };

  if (!isDialogOpen) return null;

  return (
    <div className="p-6 flex flex-col h-[80vh]">
      <h1 className="text-2xl font-bold mb-4">Google Photos Albums</h1>
      {message && <Message message={message} type="error"></Message>}

      {selectedAlbumId ? (
        <>
          <button
            onClick={() => setSelectedAlbumId(null)}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Back to Albums
          </button>

          <div className="flex-grow overflow-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading && <p>Loading photos...</p>}
              {!loading && photos.length === 0 && (
                <p>No photos in this album.</p>
              )}
              {photos.map((photo: GooglePhoto) => (
                <button
                  type={'button'}
                  key={photo.id}
                  onClick={() => togglePhoto(photo)}
                >
                  <img
                    src={`${photo.baseUrl}=w200-h200`}
                    alt={photo.filename}
                    className={`rounded shadow ${
                      isPhotoAttached(photo.id)
                        ? 'border-4 border-blue-500'
                        : ''
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-grow overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {albums.map((album: Album) => (
              <button
                key={album.id}
                type={'button'}
                onClick={() => fetchPhotos(album.id)}
                className="cursor-pointer p-4 border rounded hover:bg-gray-100"
              >
                <img
                  src={`${album.coverPhotoBaseUrl}=w200-h200`}
                  alt={album.title}
                  className="rounded shadow mb-2"
                />
                <h2 className="text-lg font-medium">{album.title}</h2>
                <p>{album.mediaItemsCount} photos</p>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mt-4 flex justify-center pb-4">
        <button
          onClick={handleUpdatePhotos}
          type={'button'}
          className="px-4 py-2 bg-green-500 text-white rounded"
          disabled={!hasChanges}
        >
          Update Photos
        </button>
      </div>
    </div>
  );
};

export default AlbumViewer;
