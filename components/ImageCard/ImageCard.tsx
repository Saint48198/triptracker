import React from 'react';
import styles from './ImageCard.module.scss';
import { ImageCardProps } from '@/types/PhotoTypes';
import Image from 'next/image';
import { getTransformedImageUrl } from '@/utils/imageUtils';

const ImageCard: React.FC<ImageCardProps> = ({
  photoId,
  imageUrl,
  caption,
  alt,
  isSelected,
  onClick,
}) => {
  return (
    <button
      key={photoId}
      className={`${styles.imageButton} ${isSelected ? styles.imageButtonSelected : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(photoId);
      }}
      type={'button'}
    >
      <div className={styles.imageContainer}>
        <Image
          src={getTransformedImageUrl(imageUrl, 200)}
          alt={alt ?? 'Photo'}
          className={styles.image}
          height={200}
          width={300}
          loading="lazy"
        />
      </div>
      {isSelected && (
        <div className={styles.selectedOverlay}>
          <span className={styles.checkmark}>✓</span>
        </div>
      )}
    </button>
  );
};

export default ImageCard;
