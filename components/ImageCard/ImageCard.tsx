import React from 'react';
import styles from './ImageButton.module.scss';

interface ImageButtonProps {
  photoId: string;
  imageUrl: string;
  caption?: string;
  alt?: string;
  isSelected: boolean;
  onClick: () => void;
}

const ImageButton: React.FC<ImageButtonProps> = ({
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
      <img
        src={imageUrl}
        loading="lazy"
        alt={alt ?? 'Photo'}
        className={styles.image}
      />
      {isSelected && (
        <div className={styles.selectedOverlay}>
          <span className={styles.checkmark}>✓</span>
        </div>
      )}
    </button>
  );
};

export default ImageButton;
