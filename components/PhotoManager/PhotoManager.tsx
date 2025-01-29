import React, { useState, useEffect, useCallback } from 'react';
import {
  bulkAddPhotos,
  bulkRemovePhotos,
  PhotoPayload,
} from '@/services/photosService';
import { Photo, PhotoManagerProps } from '@/types/PhotoTypes';
import ImageButton from '@/components/ImageButton/ImageButton';
import { getTransformedImageUrl } from '@/utils/imageUtils';
import styles from './PhotoManager.module.scss';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import Button from '@/components/Button/Button';

const PhotoManager: React.FC<PhotoManagerProps> = ({
  entityType,
  entityId,
  initialPhotos,
  externalPhotos,
}) => {
  const [photos, setPhotos] = useState(initialPhotos);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddRemovePhotos = useCallback(
    async (newPhotos: Photo[]) => {
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
                !removePhotos.some(
                  (removePhoto) => removePhoto.url === photo.url
                )
            )
          );
        } catch (error) {
          console.error('Failed to remove photos:', error);
        }
      }

      setLoading(false);
    },
    [entityId, entityType, photos]
  );

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

  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  useEffect(() => {
    if (Array.isArray(externalPhotos)) handleAddRemovePhotos(externalPhotos);
  }, [externalPhotos, handleAddRemovePhotos]);

  return (
    <div>
      {photos.length > 0 ? (
        <div>
          <div>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className={styles.grid}>
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
          <Button
            ariaLabel={'Add/Remove Selected Photos'}
            buttonType={'button'}
            onClick={() => handleAddRemovePhotos(selectedPhotos)}
          >
            Add/Remove Selected
          </Button>
        </div>
      ) : (
        <p className={styles.noPhotos}>No photos attached to this city.</p>
      )}
    </div>
  );
};

export default PhotoManager;
