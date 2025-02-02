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
      onClick={onClick}
      type={'button'}
    >
      <Image
        src={getTransformedImageUrl(imageUrl, 200)}
        alt={alt ?? 'Photo'}
        className={styles.image}
        width={300}
        height={200}
        loading="lazy"
        layout={'responsive'}
      />

      {isSelected && (
        <div className={styles.selectedOverlay}>
          <span className={styles.checkmark}>✓</span>
        </div>
      )}
    </button>
  );
};

export default ImageCard;
