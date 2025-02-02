import React from 'react';
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
}) => {
  const selectedCount = images.filter((img: Photo) => img.added).length;

  return (
    <div className={styles.collectionContainer}>
      <Button buttonType="button" onClick={onStartPhotoSearch}>
        ➕ Add Photos
      </Button>

      {selectedCount > 0 && (
        <BulkActions
          selectedCount={selectedCount}
          onRemoveSelected={onRemoveSelected}
          onClearSelection={onClearSelection}
        />
      )}
      {images.length > 0 ? (
        <ImageGrid images={images} onImageClick={onImageClick} />
      ) : (
        <p className={styles.emptyMessage}>
          Your collection is empty. Start adding images!
        </p>
      )}
    </div>
  );
};

export default Collection;
