import React, { useState } from 'react';
import styles from './UploadFiles.module.scss';
import EXIF from 'exif-js';
import Image from 'next/image';
import { UploadedImage, UploadFilesProps } from '@/types/PhotoTypes'; // Import EXIF.js for metadata extraction

const UploadFiles: React.FC<UploadFilesProps> = ({ onUpload }) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (e) => {
        const img = new window.Image();
        img.src = e.target?.result as string;

        img.onload = () => {
          const metadata: Record<string, any> = {};

          // Read File as ArrayBuffer for EXIF processing
          const fileReader = new FileReader();
          fileReader.readAsArrayBuffer(file);
          fileReader.onload = function () {
            const arrayBuffer = fileReader.result as ArrayBuffer;

            const exifData = EXIF.readFromBinaryFile(arrayBuffer);
            Object.assign(metadata, exifData);

            const uploadedImage: UploadedImage = {
              id: crypto.randomUUID(),
              url: img.src,
              name: file.name,
              size: (file.size / 1024).toFixed(2) + ' KB',
              width: img.width,
              height: img.height,
              metadata,
            };

            newImages.push(uploadedImage);

            if (newImages.length === files.length) {
              setUploadedImages((prev) => [...prev, ...newImages]);
              onUpload([...uploadedImages, ...newImages]);
            }
          };
        };
      };
    });
  };

  return (
    <div className={styles.uploadContainer}>
      <label className={styles.uploadLabel}>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className={styles.hiddenInput}
        />
        📤 Upload Images
      </label>
      <div className={styles.previewGrid}>
        {uploadedImages.map((image) => (
          <div key={image.id} className={styles.imageCard}>
            <Image
              src={image.url}
              alt={image.name}
              className={styles.imagePreview}
            />

            <div className={styles.imageInfo}>
              <p>
                <strong>{image.name}</strong>
              </p>
              <p>Size: {image.size}</p>
              <p>
                Dimensions: {image.width} x {image.height}
              </p>
              {image.metadata && (
                <p>
                  📷 Camera: {image.metadata.Make || 'Unknown'}{' '}
                  {image.metadata.Model || ''}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadFiles;
