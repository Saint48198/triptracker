import React, { useEffect, useState } from 'react';
import styles from './ImageGrid.module.scss';
import { Photo, ImageGridProps } from '@/types/PhotoTypes';
import ImageCard from '@/components/ImageCard/ImageCard';

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  onImageClick,
}: ImageGridProps) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleImageClick = (photoId: string) => {
    setSelectedImages(
      (prevSelected) =>
        prevSelected.includes(photoId)
          ? prevSelected.filter((id) => id !== photoId) // Remove if already selected
          : [...prevSelected, photoId] // Add if not selected
    );
    onImageClick(photoId);
  };

  useEffect(() => {
    const selected = images
      .filter((image) => image.added)
      .map((img) => img.photo_id || '');
    setSelectedImages(selected);
  }, [images]);

  return (
    <div className={styles.masonry}>
      {images.map((image: Photo, index: number) => (
        <div key={index} className={styles.masonryItem}>
          <ImageCard
            photoId={image.id}
            imageUrl={image.url}
            caption={image.caption || ''}
            isSelected={selectedImages.includes(image.photo_id || '')}
            onClick={() => handleImageClick(image.photo_id || '')}
          />
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
