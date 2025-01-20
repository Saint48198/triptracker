import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Photo, PhotoSearchProps } from '@/types/PhotoTypes';
import Message from '@/components/Message/Message';

const PhotoSearch: React.FC<PhotoSearchProps> = ({ onPhotoSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState('');
  const [message, setMessage] = useState('');

  const fetchPhotos = useCallback(
    async (cursor?: string) => {
      setLoading(true);
      setMessage('');

      try {
        const response = await fetch(
          `/api/photos/search?tag=${searchTerm}&max_results=16${cursor ? `&next_cursor=${cursor}` : ''}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch photos');
        }

        const data = await response.json();
        setPhotos((prev) => [...prev, ...data.photos]);
        setNextCursor(data.next_cursor || '');
      } catch (err: any) {
        setMessage(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
    [searchTerm]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPhotos([]);
    fetchPhotos();
  };

  const handleSelectPhoto = useCallback((photo: Photo) => {
    setSelectedPhotoIds((prevSelectedPhotoIds) => {
      const newSelectedPhotoIds = new Set(prevSelectedPhotoIds);
      if (newSelectedPhotoIds.has(photo.id)) {
        newSelectedPhotoIds.delete(photo.id);
      } else {
        newSelectedPhotoIds.add(photo.id);
      }
      return newSelectedPhotoIds;
    });
  }, []);

  const selectedPhotos = useMemo(
    () => photos.filter((photo) => selectedPhotoIds.has(photo.id)),
    [photos, selectedPhotoIds]
  );

  useEffect(() => {
    onPhotoSelect(selectedPhotos);
  }, [selectedPhotos, onPhotoSelect]);

  const getTransformedImageUrl = (url: string, height: number) => {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex !== -1) {
      parts.splice(uploadIndex + 1, 0, `h_${height},c_fill,q_auto`);
      return parts.join('/');
    }
    return url;
  };

  return (
    <div className="p-6 flex flex-col h-[80vh] w-[80vw]">
      <h1 className="text-2xl font-bold mb-4">Photos</h1>
      {message && <Message message={message} type="error"></Message>}
      <form onSubmit={handleSearch} className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search by folder or tag"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 flex-grow rounded-md"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Search
        </button>
      </form>

      {loading && <p>Loading photos...</p>}

      <div className="flex-grow overflow-auto gap-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <button
              key={photo.id}
              className={`relative border rounded-lg overflow-hidden cursor-pointer ${
                selectedPhotoIds.has(photo.id)
                  ? 'border-blue-500'
                  : 'border-gray-300'
              }`}
              onClick={() => handleSelectPhoto(photo)}
            >
              <img
                src={getTransformedImageUrl(photo.url, 200)}
                loading="lazy"
                alt="Cloudinary photo"
                className="w-full h-32 object-center object-cover"
              />
              {selectedPhotoIds.has(photo.id) && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {nextCursor && (
        <div className="pb-3">
          <button
            onClick={() => fetchPhotos(nextCursor)}
            className="mt-4 bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-md block mx-auto"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoSearch;
