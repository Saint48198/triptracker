import React, { useEffect, useState } from 'react';
import styles from './Collection.module.scss';
import ImageGrid from '../ImageGrid/ImageGrid';
import BulkActions from '../BulkActions/BulkActions';
import { CollectionProps, Photo } from '@/types/PhotoTypes';
import Button from '@/components/Button/Button';

const Collection: React.FC<CollectionProps> = ({
  images,
  onImageClick,
  onRemoveSelected,
  onClearSelection,
  onStartPhotoSearch,
  removingPhotos = false,
}) => {
  const [photos, setPhotos] = useState<Photo[]>(images);

  useEffect(() => {
    setPhotos(images);
  }, [images]);

  const handleImageClick = (photoId: string) => {
    setPhotos((prevPhotos) =>
      prevPhotos.map((photo) =>
        photo.photo_id === photoId ? { ...photo, added: !photo.added } : photo
      )
    );
  };

  const selectedCount = photos.filter((img: Photo) => img.added).length;

  return (
    <div className={styles.collectionContainer}>
      <Button buttonType="button" onClick={onStartPhotoSearch}>
        ➕ Add Photos
      </Button>

      {selectedCount > 0 && (
        <BulkActions
          selectedCount={selectedCount}
          onRemoveSelected={() =>
            onRemoveSelected(photos.filter((img: Photo) => img.added))
          }
          onClearSelection={onClearSelection}
          removingPhotos={removingPhotos}
        />
      )}
      {images.length > 0 ? (
        <ImageGrid images={photos} onImageClick={handleImageClick} />
      ) : (
        <p className={styles.emptyMessage}>
          Your collection is empty. Start adding images!
        </p>
      )}
    </div>
  );
};

export default Collection;
