import React, { useState, useEffect } from 'react';
import {
  bulkAddPhotos,
  bulkRemovePhotos,
  PhotoPayload,
} from '@/services/photosService';
import { Photo, PhotoManagerProps } from '@/types/PhotoTypes';
import ImageButton from '@/components/ImageButton/ImageButton';
import { getTransformedImageUrl } from '@/utils/imageUtils';

const PhotoManager: React.FC<PhotoManagerProps> = ({
  entityType,
  entityId,
  initialPhotos,
  externalPhotos,
}) => {
  const [photos, setPhotos] = useState(initialPhotos);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  useEffect(() => {
    if (Array.isArray(externalPhotos)) handleAddRemovePhotos(externalPhotos);
  }, [externalPhotos]);

  const handleAddRemovePhotos = async (newPhotos: Photo[]) => {
    setLoading(true);

    const addPhotos = newPhotos.filter(
      (newPhoto: Photo) =>
        !photos.some((photo) => photo.photo_id === newPhoto.photo_id)
    );
    const removePhotos = photos.filter(
      (photo: Photo) =>
        !newPhotos.some((newPhoto) => newPhoto.photo_id === photo.photo_id)
    );

    if (addPhotos.length > 0) {
      const addPayload: PhotoPayload = {
        entityType,
        entityId,
        photos: addPhotos,
      };

      try {
        await bulkAddPhotos(addPayload);
        setPhotos([...photos, ...addPhotos]);
      } catch (error) {
        console.error('Failed to add photos:', error);
      }
    }

    if (removePhotos.length > 0) {
      const removePayload: PhotoPayload = {
        entityType,
        entityId,
        photos: removePhotos,
      };

      try {
        await bulkRemovePhotos(removePayload);
        setPhotos(
          photos.filter(
            (photo) =>
              !removePhotos.some((removePhoto) => removePhoto.url === photo.url)
          )
        );
      } catch (error) {
        console.error('Failed to remove photos:', error);
      }
    }

    setLoading(false);
  };

  const togglePhotoSelection = (photo: Photo) => {
    if (loading) return;
    if (selectedPhotos.some((selected) => selected.url === photo.url)) {
      setSelectedPhotos(
        selectedPhotos.filter((selected) => selected.url !== photo.url)
      );
    } else {
      setSelectedPhotos([...selectedPhotos, photo]);
    }
  };

  return (
    <div>
      {photos.length > 0 ? (
        <div>
          <div>
            {loading ? (
              <div className="loading-icon">Processing...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                {photos.map((photo: Photo, index) => (
                  <div key={index}>
                    <ImageButton
                      photoId={photo.id}
                      imageUrl={getTransformedImageUrl(photo.url, 200)}
                      isSelected={selectedPhotos.some(
                        (selected) => selected.url === photo.url
                      )}
                      onClick={() => togglePhotoSelection(photo)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            type={'button'}
            onClick={() => handleAddRemovePhotos(selectedPhotos)}
          >
            Add/Remove Selected Photos
          </button>
        </div>
      ) : (
        <p className="mt-6 text-gray-500">No photos attached to this city.</p>
      )}
    </div>
  );
};

export default PhotoManager;
