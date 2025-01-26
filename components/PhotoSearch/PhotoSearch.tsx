import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
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
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const searchSubject = useMemo(() => new Subject<string>(), []);
  const [focusedIndex, setFocusedIndex] = useState(-1); // Tracks which suggestion is focused
  const suggestionListRef = useRef<HTMLUListElement | null>(null);
  const shouldTriggerSearch = useRef(true);

  useEffect(() => {
    console.log('searchSubject:', searchSubject);
    const subscription = searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(async (term) => {
          if (!term) return Promise.resolve({ tags: [] }); // Avoid fetch for empty terms
          const res = await fetch(`/api/photos/tags/search?query=${term}`);
          return await res.json();
        })
      )
      .subscribe({
        next: (data) => {
          setSuggestions(data.tags || []);
        },
        error: (err: unknown) => {
          setMessage('Failed to fetch tags');
        },
      });

    return () => subscription.unsubscribe();
  }, [searchSubject, initialSelectedPhotos]);

  useEffect(() => {
    console.log('searchTerm:', searchTerm, shouldTriggerSearch.current);
    if (!shouldTriggerSearch.current) {
      shouldTriggerSearch.current = true; // Reset the ref
      return;
    }

    if (searchTerm.trim() === '') {
      setSuggestions(null); // Clear suggestions if input is empty
      searchSubject.next(''); // Avoid triggering suggestions fetch
    } else if (searchTerm && !loading) {
      searchSubject.next(searchTerm); // Fetch suggestions only if typing
    }

    setFocusedIndex(-1); // Reset focus index
  }, [searchTerm, loading, searchSubject]);

  useEffect(() => {}, [suggestions]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && focusedIndex >= 0 && suggestions) {
      setSearchTerm(suggestions[focusedIndex]);
      shouldTriggerSearch.current = false; // Prevent search trigger
      setSuggestions(null); // Clear suggestions
      setFocusedIndex(-1); // Reset focus index
    } else if (e.key === 'Escape') {
      setSuggestions(null); // Close suggestions on Escape
    } else if (e.key === 'ArrowDown' && suggestions) {
      setFocusedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp' && suggestions) {
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const fetchPhotos = useCallback(
    async (cursor?: string) => {
      setLoading(true);
      setMessage('');
      setSuggestions(null);
      shouldTriggerSearch.current = false; // Prevent search trigger

      try {
        const response = await fetch(
          `/api/photos/search?tag=${searchTerm}&max_results=16${cursor ? `&next_cursor=${cursor}` : ''}`
        );

        if (!response.ok) {
          setMessage('Failed to fetch photos');
          console.error('Failed to fetch photos:', response.statusText);
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
        setSuggestions(null);
        shouldTriggerSearch.current = false; // Reset the ref
        setLoading(false);
      }
    },
    [searchTerm, selectedPhotoIds, initialSelectedPhotos]
  );

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.trim(); // Trim unnecessary spaces
    setSearchTerm(term);
    if (term === '') {
      setSuggestions(null); // Clear suggestions
      shouldTriggerSearch.current = false; // Prevent search trigger
    } else if (shouldTriggerSearch) {
      searchSubject.next(term); // Trigger the search
    }

    setFocusedIndex(-1); // Reset focus index
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    shouldTriggerSearch.current = false; // Prevent search trigger
    setPhotos([]);
    setSuggestions(null);
    setFocusedIndex(-1);
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

  const handleSuggestionClick = (tag: string) => {
    shouldTriggerSearch.current = false; // Prevent search trigger
    setSearchTerm(tag);
    setSuggestions(null); // Clear suggestions to close the menu
    setFocusedIndex(-1); // Reset focus index
  };

  return (
    <div className="p-6 flex flex-col h-[80vh] w-[80vw]">
      <h1 className="text-2xl font-bold mb-4">Photos</h1>
      {message && <Message message={message} type="error"></Message>}
      <form onSubmit={handleSearch} className="mb-4 flex items-center gap-2">
        <div className="flex-grow relative">
          <input
            type="text"
            id="search"
            placeholder="Search by folder or tag"
            value={searchTerm}
            onChange={handleSearchInput}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            aria-controls="suggestions-list"
            aria-expanded={
              suggestions && suggestions.length > 0 ? 'true' : 'false'
            }
            aria-activedescendant={
              focusedIndex >= 0 ? `suggestion-${focusedIndex}` : undefined
            }
            className="border p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {searchTerm && suggestions && suggestions.length > 0 ? (
            <ul
              className="absolute bg-white border rounded-md shadow-md max-h-40 overflow-auto z-10 w-full list-none"
              id="suggestions-list"
              role="listbox"
              ref={suggestionListRef}
            >
              {suggestions.map((tag, index) => (
                <li
                  key={index}
                  className={`px-4 py-2 cursor-pointer border-0 m-0 w-full max-w-full ${
                    focusedIndex === index
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={focusedIndex === index}
                  onClick={() => handleSuggestionClick(tag)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSuggestionClick(tag);
                    }
                  }}
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : searchTerm && suggestions && suggestions.length === 0 ? (
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
