import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Photo, PhotoSearchProps } from '@/types/PhotoTypes';
import Message from '@/components/Message/Message';

const PhotoSearch: React.FC<PhotoSearchProps> = ({
  onPhotoSelect,
  initialSelectedPhotos,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(
    new Set(initialSelectedPhotos.map((photo: Photo) => photo.photo_id))
  );
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState('');
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchSubject = useMemo(() => new Subject<string>(), []);

  useEffect(() => {
    const subscription = searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) =>
          fetch(`/api/photos/tags/search?query=${term}`).then((res) =>
            res.json()
          )
        )
      )
      .subscribe({
        next: (data) => {
          setSuggestions(data.tags || []);
        },
        error: (err: unknown) => {
          console.error('Error fetching tags:', err);
          setMessage('Failed to fetch tags');
        },
      });

    return () => subscription.unsubscribe();
  }, [searchSubject]);

  useEffect(() => {
    if (searchTerm) {
      searchSubject.next(searchTerm);
    } else {
      searchSubject.next('');
      setSuggestions([]);
    }
  }, [searchTerm]);

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

        setPhotos((prev: Photo[]) => {
          const newPhotos = [...prev, ...data.photos];
          const newSelectedPhotoIds = new Set(selectedPhotoIds);
          data.photos.forEach((photo: Photo) => {
            if (
              initialSelectedPhotos.some(
                (initialPhoto) => initialPhoto.photo_id === photo.photo_id
              )
            ) {
              newSelectedPhotoIds.add(photo.photo_id);
            }
          });
          setSelectedPhotoIds(newSelectedPhotoIds);
          return newPhotos;
        });
        setNextCursor(data.next_cursor || '');
      } catch (err: any) {
        setMessage(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
    [searchTerm]
  );

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.trim(); // Trim unnecessary spaces
    setSearchTerm(term);

    if (term === '') {
      searchSubject.next(''); // Clear the searchSubject
      setSuggestions([]); // Clear suggestions
    } else {
      searchSubject.next(term); // Trigger the search
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPhotos([]);
    fetchPhotos();
  };

  const handleSelectPhoto = useCallback((photo: Photo) => {
    setSelectedPhotoIds((prevSelectedPhotoIds) => {
      const newSelectedPhotoIds = new Set(prevSelectedPhotoIds);
      if (newSelectedPhotoIds.has(photo.photo_id)) {
        newSelectedPhotoIds.delete(photo.photo_id);
      } else {
        newSelectedPhotoIds.add(photo.photo_id);
      }
      return newSelectedPhotoIds;
    });
  }, []);

  const selectedPhotos = useMemo(
    () => photos.filter((photo: Photo) => selectedPhotoIds.has(photo.photo_id)),
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
        <div className="flex-grow relative">
          <input
            type="text"
            placeholder="Search by folder or tag"
            value={searchTerm}
            onChange={handleSearchInput}
            className="border p-2 w-full rounded-md"
          />
          {searchTerm && suggestions.length > 0 ? (
            <ul
              className="absolute bg-white border rounded-md shadow-md max-h-40 overflow-auto z-10 w-full list-none"
              role="menu"
            >
              {suggestions.map((tag, index) => (
                <li
                  key={index}
                  className="p-2 m-0 hover:bg-gray-100 cursor-pointer w-full"
                  onClick={() => setSearchTerm(tag)}
                  role="menuitem"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSearchTerm(tag);
                    }
                  }}
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : searchTerm && suggestions.length === 0 ? (
            <p className="p-2 text-gray-500">No results</p>
          ) : null}
        </div>
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
              key={photo.photo_id}
              className={`relative border rounded-lg overflow-hidden cursor-pointer ${
                selectedPhotoIds.has(photo.photo_id)
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
              {selectedPhotoIds.has(photo.photo_id) && (
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
