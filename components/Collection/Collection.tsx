import React, { useEffect, useState } from 'react';
import styles from './Collection.module.scss';
import ImageGrid from '../ImageGrid/ImageGrid';
import BulkActions from '../BulkActions/BulkActions';
import { CollectionProps, Photo } from '@/types/PhotoTypes';
import Button from '@/components/Button/Button';
import { FaSpinner } from 'react-icons/fa';
import Modal from '@/components/Modal/Modal';
import Link from 'next/link';
import { useModal } from '@/components/Modal/ModalContext';

const Collection: React.FC<CollectionProps> = ({
  images,
  onImageClick,
  onRemoveSelected,
  onClearSelection,
  onStartPhotoSearch,
  removingPhotos = false,
}) => {
  const [photos, setPhotos] = useState<Photo[]>(images);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const { closeModal } = useModal();

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
  };

  const confirmRemoveSelected = () => {
    onRemoveSelected(selectedPhotos);
  };

  const selectedCount = photos.filter((img: Photo) => img.added).length;

  return (
    <div className={styles.collectionContainer}>
      <div className={styles.collectionHeader}>
        <div className={styles.addPhotosButton}>
          <Button buttonType="button" onClick={onStartPhotoSearch}>
            ➕ Add Photos
          </Button>
        </div>

        {selectedCount > 0 && (
          <div className={styles.bulkActions}>
            <BulkActions
              selectedCount={selectedCount}
              onRemoveSelected={handleRemoveSelected}
              onClearSelection={onClearSelection}
              removingPhotos={removingPhotos}
            />
          </div>
        )}

        <div className={styles.uploadLink}>
          <Link href={'/admin/image/upload'}>Upload new image</Link>
        </div>
      </div>

      {images.length > 0 ? (
        <ImageGrid images={photos} onImageClick={handleImageClick} />
      ) : (
        <p className={styles.emptyMessage}>
          Your collection is empty. Start adding images!
        </p>
      )}

      <Modal title={'Confirm Removal'} id={'confirm-remove'}>
        <p>Are you sure you want to remove the selected photos?</p>
        <div className={styles.modalActions}>
          <Button
            styleType={'secondary'}
            buttonType="button"
            onClick={() => closeModal('confirm-remove')}
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
    </div>
  );
};

export default Collection;
