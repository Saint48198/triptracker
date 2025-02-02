import React from 'react';
import styles from './ImageGrid.module.scss';
import { Photo, ImageGridProps } from '@/types/PhotoTypes';
import ImageCard from '@/components/ImageCard/ImageCard';

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  onImageClick,
}: ImageGridProps) => {
  return (
    <div className={styles.masonry}>
      {images.map((image: Photo, index: number) => (
        <div key={index} className={styles.masonryItem}>
          <ImageCard
            photoId={image.id}
            imageUrl={image.url}
            caption={image.caption || ''}
            isSelected={image.added || false}
            onClick={() => onImageClick(image.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
