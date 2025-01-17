import React, { useState, useEffect } from 'react';
import {
  bulkAddPhotos,
  bulkRemovePhotos,
  PhotoPayload,
} from '@/services/photosService';
import { Photo, PhotoManagerProps } from '@/types/PhotoTypes';

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
    console.log('externalPhotos:', externalPhotos);
    if (Array.isArray(externalPhotos)) handleAddRemovePhotos(externalPhotos);
  }, [externalPhotos]);

  const handleAddRemovePhotos = async (newPhotos: Photo[]) => {
    setLoading(true);

    const addPhotos = newPhotos.filter(
      (newPhoto) => !photos.some((photo) => photo.url === newPhoto.url)
    );
    const removePhotos = photos.filter(
      (photo) => !newPhotos.some((newPhoto) => newPhoto.url === photo.url)
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
              photos.map((photo: Photo, index) => (
                <img
                  key={index}
                  src={photo.url}
                  alt={photo.caption || 'Photo'}
                  onClick={() => togglePhotoSelection(photo)}
                  style={{
                    border: selectedPhotos.some(
                      (selected) => selected.url === photo.url
                    )
                      ? '2px solid blue'
                      : 'none',
                  }}
                />
              ))
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
