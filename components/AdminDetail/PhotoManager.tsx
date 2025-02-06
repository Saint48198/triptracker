import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Collection from '@/components/Collection/Collection';
import SearchBar from '@/components/SearchBar/SearchBar';
import ImageGrid from '@/components/ImageGrid/ImageGrid';
import Modal from '@/components/Modal/Modal';
import Button from '@/components/Button/Button';
import { FaSpinner } from 'react-icons/fa';
import { Photo } from '@/types/PhotoTypes';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

interface PhotoManagerProps {
  entityId: string;
  entityType: 'city' | 'attraction';
}

export default function PhotoManager({
  entityId,
  entityType,
}: PhotoManagerProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Photo[]>([]);
  const [selectedSearchPhotos, setSelectedSearchPhotos] = useState<string[]>(
    []
  );
  const [addingPhotos, setAddingPhotos] = useState(false);
  const [removingPhotos, setRemovingPhotos] = useState(false);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const searchSubject = useMemo(() => new Subject<string>(), []);

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
    setPhotos([]);
    try {
      const response = await fetch(`/api/photos/${entityType}s/${entityId}`);
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
  const handleSearchPhotos = async (query: string) => {
    console.log('Searching for:', query);
    if (!query.trim()) {
      setSearchResults([]); // Don't fetch if input is empty
      return;
    }

    try {
      const response = await fetch(`/api/photos/search?tag=${query}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(
          (data.photos || []).map((photo: Photo) => ({
            ...photo,
            added: photos.some((p) => p.photo_id === photo.photo_id),
          }))
        );
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
        setIsModalOpen(false);
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
    setSelectedSearchPhotos([]);
  };

  return (
    <div>
      <h2>Photos</h2>
      <Collection
        images={photos}
        onImageClick={(photoId) => handleSelectPhoto(photoId)}
        onRemoveSelected={handleRemoveSelected}
        removingPhotos={removingPhotos}
        onStartPhotoSearch={() => setIsModalOpen(true)}
        onClearSelection={handleClearSelection}
      />

      {/* Modal for searching & adding photos */}
      {isModalOpen && (
        <Modal
          onClose={() => {
            setIsModalOpen(false);
            setSearchResults([]);
            setSelectedSearchPhotos([]);
          }}
        >
          <h2>Search & Add Photos</h2>
          <SearchBar
            onSearch={handleSearchPhotos}
            fetchSuggestions={fetchSuggestions}
          />
          <div>
            <ImageGrid
              images={searchResults}
              onImageClick={handleSelectPhoto}
            />
          </div>
          <div>
            <Button buttonType="button" onClick={() => setIsModalOpen(false)}>
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
        </Modal>
      )}
    </div>
  );
}
