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
      className={`relative border rounded-lg overflow-hidden cursor-pointer w-full ${
        isSelected ? 'border-blue-500' : 'border-gray-300'
      }`}
      onClick={onClick}
    >
      <img
        src={imageUrl}
        loading="lazy"
        alt={alt ?? 'Photo'}
        className="w-full h-auto"
      />
      {isSelected && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-50 flex items-center justify-center">
          <span className="text-white font-bold text-lg">✓</span>
        </div>
      )}
    </button>
  );
};

export default ImageButton;
