import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Collection from '@/components/Collection/Collection';
import SearchBar from '@/components/SearchBar/SearchBar';
import ImageGrid from '@/components/ImageGrid/ImageGrid';
import Modal from '@/components/Modal/Modal';
import Button from '@/components/Button/Button';
import { FaSpinner } from 'react-icons/fa';
import { Photo } from '@/types/PhotoTypes';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import styles from './PhotoManager.module.scss';
import { ENTITY_TYPE_ATTRACTIONS, ENTITY_TYPE_CITIES } from '@/constants';
import { useModal } from '@/components/Modal/ModalContext';

interface PhotoManagerProps {
  entityId: string;
  entityType: typeof ENTITY_TYPE_CITIES | typeof ENTITY_TYPE_ATTRACTIONS;
}

export default function PhotoManager({
  entityId,
  entityType,
}: PhotoManagerProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [searchResults, setSearchResults] = useState<Photo[]>([]);
  const [selectedSearchPhotos, setSelectedSearchPhotos] = useState<string[]>(
    []
  );
  const [addingPhotos, setAddingPhotos] = useState(false);
  const [removingPhotos, setRemovingPhotos] = useState(false);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const searchSubject = useMemo(() => new Subject<string>(), []);
  const [nextCursor, setNextCursor] = useState(null);
  const [query, setQuery] = useState('');
  const { isOpen, openModal, closeModal } = useModal();

  // Ensure API calls happen only when user is actively typing
  useEffect(() => {
    const subscription = searchSubject
      .pipe(
        debounceTime(300), // 300ms debounce
        distinctUntilChanged(), // Ignore unchanged input
        switchMap(async (query) => {
          if (!query.trim()) {
            setSuggestions([]); // Clear suggestions when input is empty
            return [];
          }
          try {
            const response = await fetch(`/api/photos/tags?query=${query}`);
            if (response.ok) {
              const data = await response.json();
              setSuggestions(data.tags || []);
              return data.tags || [];
            }
          } catch (error) {
            console.error('Error fetching photo tags:', error);
          }
          return [];
        })
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [searchSubject]);

  // Fetch existing photos for the entity
  const fetchPhotos = useCallback(async () => {
    try {
      const response = await fetch(`/api/photos/${entityType}/${entityId}`);
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos || []);
      } else {
        console.error('Failed to fetch photos:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    if (entityId) fetchPhotos();
  }, [fetchPhotos, entityId]);

  // Handle photo selection from search results
  const handleSelectPhoto = (photoId: string) => {
    setSelectedSearchPhotos((prevSelected) =>
      prevSelected.includes(photoId)
        ? prevSelected.filter((id) => id !== photoId)
        : [...prevSelected, photoId]
    );
  };

  // Handle photo search
  const handleSearchPhotos = async (
    query: string,
    cursor: string | null = null
  ) => {
    if (!cursor) {
      setSearchResults([]); // Clear old search results
    }

    if (!query.trim()) {
      return;
    }

    setQuery(query);

    try {
      const url = cursor
        ? `/api/photos/search?tag=${query}&next_cursor=${cursor}`
        : `/api/photos/search?tag=${query}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setNextCursor(data.next_cursor);

        setSearchResults((prevResults) => {
          const newResults = (data.photos || []).map((photo: Photo) => {
            const existingPhoto = prevResults.find(
              (p) => p.photo_id === photo.photo_id
            );
            return {
              ...photo,
              added: existingPhoto
                ? existingPhoto.added
                : photos.some((p: Photo) => p.photo_id === photo.photo_id),
            };
          });

          return nextCursor
            ? [
                ...prevResults,
                ...newResults.filter(
                  (p: Photo) =>
                    !prevResults.some((prev) => prev.photo_id === p.photo_id)
                ),
              ]
            : newResults;
        });
      }
    } catch (error) {
      console.error('Error searching for photos:', error);
    }
  };

  // Handle search input changes
  const fetchSuggestions = (query: string): Promise<string[]> => {
    if (!query.trim()) {
      setSuggestions([]); // Clear suggestions when empty
      return Promise.resolve([]);
    }

    searchSubject.next(query); // Trigger search only on valid input
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(suggestions || []);
      }, 350); // Delay resolving so state updates before returning
    });
  };

  // Add selected photos
  const handleAddPhotos = async () => {
    setAddingPhotos(true);
    const newPhotos = searchResults.filter((photo) =>
      selectedSearchPhotos.includes(photo.photo_id || '')
    );

    try {
      const response = await fetch(`/api/photos/bulk/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          photos: newPhotos.map(({ photo_id, url, caption }) => ({
            photo_id,
            url,
            caption,
          })),
        }),
      });

      if (response.ok) {
        setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
        setSearchResults([]);
        setSelectedSearchPhotos([]);
      } else {
        console.error('Failed to add photos:', await response.text());
      }
    } catch (error) {
      console.error('Error adding photos:', error);
    } finally {
      setAddingPhotos(false);
    }
  };

  // Remove selected photos
  const handleRemoveSelected = async (selectedPhotos: Photo[]) => {
    if (selectedPhotos.length === 0) return;

    setRemovingPhotos(true);

    try {
      const response = await fetch(`/api/photos/bulk/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          photos: selectedPhotos.map(({ photo_id }) => ({ photo_id })),
        }),
      });

      if (response.ok) {
        setPhotos((prevPhotos) =>
          prevPhotos.filter(
            (photo) =>
              !selectedPhotos.some(
                (selected) => selected.photo_id === photo.photo_id
              )
          )
        );
      } else {
        console.error('Failed to remove photos:', await response.text());
      }
    } catch (error) {
      console.error('Error removing photos:', error);
    } finally {
      setRemovingPhotos(false);
    }
  };

  const handleClearSelection = () => {
    setPhotos((prevPhotos) =>
      prevPhotos.map((photo) => ({ ...photo, added: false }))
    );
  };

  return (
    <div>
      <h2>Photos</h2>
      <Collection
        images={photos}
        onImageClick={(photoId) => handleSelectPhoto(photoId)}
        onRemoveSelected={handleRemoveSelected}
        removingPhotos={removingPhotos}
        onStartPhotoSearch={() => {
          openModal('photo-search-modal');
          setSearchResults([]);
        }}
        onClearSelection={handleClearSelection}
      />

      {/* Modal for searching & adding photos */}
      <Modal title={'Search & Add Photos'} id={'photo-search-modal'}>
        <div className={styles.modalContent}>
          <div className={styles.modelHeader}>
            <SearchBar
              onSearch={handleSearchPhotos}
              fetchSuggestions={fetchSuggestions}
            />
          </div>
          <div className={styles.photoSearchResultsModal}>
            <ImageGrid
              images={searchResults}
              onImageClick={handleSelectPhoto}
            />
          </div>
          {searchResults.length > 0 && (
            <div className={styles.modalActions}>
              {nextCursor && searchResults.length > 0 && (
                <button
                  type={'button'}
                  onClick={() => handleSearchPhotos(query, nextCursor)}
                >
                  Load More
                </button>
              )}
              <Button
                buttonType="button"
                onClick={() => closeModal('photo-search-modal')}
                styleType={'secondary'}
              >
                Cancel
              </Button>
              <Button
                buttonType="button"
                onClick={handleAddPhotos}
                isDisabled={selectedSearchPhotos.length === 0 || addingPhotos}
              >
                {addingPhotos ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  `Add ${selectedSearchPhotos.length} Photos`
                )}
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
