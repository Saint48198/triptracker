import React, { useState, useEffect } from 'react';
import { Album, Photo, AlbumViewerProps } from '@/types/PhotoTypes';
import Message from '@/components/Message/Message';

const AlbumViewer: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Google Photos Albums</h1>
      {message && <Message message={message} type="error"></Message>}

      {selectedAlbumId ? (
        <div>
          <button
            onClick={() => setSelectedAlbumId(null)}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Back to Albums
          </button>

          <div className="overflow-auto h-screen">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading && <p>Loading photos...</p>}
              {!loading && photos.length === 0 && (
                <p>No photos in this album.</p>
              )}
              {photos.map((photo) => (
                <img
                  key={photo.id}
                  src={`${photo.baseUrl}=w200-h200`}
                  alt={photo.filename}
                  className="rounded shadow"
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-auto h-screen">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {albums.map((album) => (
              <div
                key={album.id}
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumViewer;
