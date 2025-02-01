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
import styles from './PhotoSearch.module.scss';
import ImageButton from '@/components/ImageButton/ImageButton';
import { getTransformedImageUrl } from '@/utils/imageUtils';
import Button from '@/components/Button/Button';
import FormInput from '@/components/FormInput/FormInput';

const PhotoSearch: React.FC<PhotoSearchProps> = ({
  onPhotoSelect,
  initialSelectedPhotos,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(
    new Set(
      initialSelectedPhotos
        .map((photo: Photo) => photo.photo_id)
        .filter((id): id is string => id !== undefined)
    )
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
          console.error('Failed to fetch tags:', err);
        },
      });

    return () => subscription.unsubscribe();
  }, [searchSubject, initialSelectedPhotos]);

  useEffect(() => {
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
              photo.photo_id &&
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
      if (photo.photo_id && newSelectedPhotoIds.has(photo.photo_id)) {
        newSelectedPhotoIds.delete(photo.photo_id);
      } else if (photo.photo_id) {
        newSelectedPhotoIds.add(photo.photo_id);
      }
      return newSelectedPhotoIds;
    });
  }, []);

  const selectedPhotos = useMemo(
    () =>
      photos.filter((photo: Photo) =>
        selectedPhotoIds.has(photo.photo_id ?? '')
      ),
    [photos, selectedPhotoIds]
  );

  useEffect(() => {
    onPhotoSelect(selectedPhotos);
  }, [selectedPhotos, onPhotoSelect]);

  const handleSuggestionClick = (tag: string) => {
    shouldTriggerSearch.current = false; // Prevent search trigger
    setSearchTerm(tag);
    setSuggestions(null); // Clear suggestions to close the menu
    setFocusedIndex(-1); // Reset focus index
  };

  return (
    <div className={styles.photoSearch}>
      <h1 className={styles.title}>Photos</h1>
      {message && <Message message={message} type="error"></Message>}
      <form onSubmit={handleSearch} className={styles.form}>
        <div className={styles.inputContainer}>
          <FormInput
            label={'Search for images'}
            id={'search'}
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
            placeholder="Search by folder or tag"
            hideLabel={true}
          />
          {searchTerm && suggestions && suggestions.length > 0 ? (
            <ul
              className={styles.suggestionsList}
              id="suggestions-list"
              role="listbox"
              ref={suggestionListRef}
            >
              {suggestions.map((tag, index) => (
                <li
                  key={index}
                  className={`${styles.suggestionItem} ${
                    focusedIndex === index ? styles.focused : ''
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
        <Button buttonType={'submit'} styleType={'primary'}>
          Search
        </Button>
      </form>

      {loading && <p className={styles.loading}>Loading photos...</p>}

      <div className={styles.photoGrid}>
        <div className={styles.columns}>
          {photos.map((photo) => (
            <ImageButton
              photoId={photo.photo_id ?? ''}
              key={photo.photo_id}
              imageUrl={getTransformedImageUrl(photo.url, 200)}
              isSelected={selectedPhotoIds.has(photo.photo_id ?? '')}
              onClick={() => handleSelectPhoto(photo)}
            />
          ))}
        </div>
      </div>

      {nextCursor && (
        <div className={styles.loadMore}>
          <Button
            buttonType={'button'}
            styleType={'secondary'}
            onClick={() => fetchPhotos(nextCursor)}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default PhotoSearch;
