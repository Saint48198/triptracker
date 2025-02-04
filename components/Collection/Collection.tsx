import React, { useEffect, useState } from 'react';
import styles from './Collection.module.scss';
import ImageGrid from '../ImageGrid/ImageGrid';
import BulkActions from '../BulkActions/BulkActions';
import { CollectionProps, Photo } from '@/types/PhotoTypes';
import Button from '@/components/Button/Button';
import { FaSpinner } from 'react-icons/fa';
import Modal from '@/components/Modal/Modal';

const Collection: React.FC<CollectionProps> = ({
  images,
  onImageClick,
  onRemoveSelected,
  onClearSelection,
  onStartPhotoSearch,
  removingPhotos = false,
}) => {
  const [photos, setPhotos] = useState<Photo[]>(images);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);

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

  const handleRemoveSelected = () => {
    const selected = photos.filter((img: Photo) => img.added);
    setSelectedPhotos(selected);
    setIsModalOpen(true);
  };

  const confirmRemoveSelected = () => {
    onRemoveSelected(selectedPhotos);
    setIsModalOpen(false);
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
          onRemoveSelected={handleRemoveSelected}
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

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <h2>Confirm Removal</h2>
          <p>Are you sure you want to remove the selected photos?</p>
          <div className={styles.modalActions}>
            <Button
              styleType={'secondary'}
              buttonType="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              buttonType="button"
              onClick={confirmRemoveSelected}
              isDisabled={removingPhotos}
            >
              {removingPhotos ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                'Remove'
              )}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Collection;
