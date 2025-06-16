'use client';
import React, { useState } from 'react';
import FormInput from '@/components/FormInput/FormInput';
import FormTextarea from '@/components/FormTextarea/FormTextarea';
import FormSelect from '@/components/FormSelect/FormSelect';
import Button from '@/components/Button/Button';
import { FaSpinner } from 'react-icons/fa';
import Message from '@/components/Message/Message';
import styles from './UploadForm.module.scss';
import FormCheckbox from '@/components/FormCheckbox/FormCheckbox';
import ExifReader from 'exifreader';
import { ProgressBar } from '@/components/ProgressBar/ProgressBar';

type FileMetadata = {
  file: File;
  previewUrl: string;
  title: string;
  description: string;
  tags: string[];
  availableTags: string[];
};

export default function UploadForm() {
  const [fileData, setFileData] = useState<FileMetadata[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFileData = await Promise.all(
      Array.from(selectedFiles).map(async (file) => {
        const previewUrl = URL.createObjectURL(file);
        const metadata = await extractMetadata(file);
        return {
          file,
          previewUrl,
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags || [],
          availableTags: metadata.allKeywords || [],
        };
      })
    );

    setFileData(newFileData);
    setUploadProgress(Array(newFileData.length).fill(0));
  };

  const updateFileData = (index: number, changes: Partial<FileMetadata>) => {
    setFileData((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...changes };
      return copy;
    });
  };

  const toggleTag = (index: number, tag: string) => {
    setFileData((prev) => {
      const copy = [...prev];
      const tags = copy[index].tags.includes(tag)
        ? copy[index].tags.filter((t) => t !== tag)
        : [...copy[index].tags, tag];
      copy[index].tags = tags;
      return copy;
    });
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await response.json();
      return {
        city:
          data.address.city || data.address.town || data.address.village || '',
        state: data.address.state || '',
        country: data.address.country || '',
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return { city: '', state: '', country: '' };
    }
  };

  const extractMetadata = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const tags = ExifReader.load(arrayBuffer);

      const title =
        tags['Title']?.description ||
        tags['XPTitle']?.description ||
        'Untitled';
      const description =
        tags['Description']?.description ||
        tags['ImageDescription']?.description ||
        tags['subject']?.description ||
        'No description available';

      const keywordsArray =
        tags['Keywords'] && Array.isArray(tags['Keywords'])
          ? tags['Keywords'].map((k: { description: string }) =>
              k.description.trim()
            )
          : [];

      const locationTags: string[] = [];

      // Try extracting direct location tags first
      const city = tags['City']?.description?.trim();
      const state = tags['Province/State']?.description?.trim();
      const country = tags['Country']?.description?.trim();

      if (city) locationTags.push(city);
      if (state) locationTags.push(state);
      if (country) locationTags.push(country);

      // If any are missing, try reverse geocoding
      if (!city || !state || !country) {
        const gpsLat = tags['GPSLatitude']?.description;
        const gpsLon = tags['GPSLongitude']?.description;

        if (gpsLat && gpsLon) {
          const lat = parseFloat(gpsLat);
          const lon = parseFloat(gpsLon);

          if (!isNaN(lat) && !isNaN(lon)) {
            const geo = await reverseGeocode(lat, lon);
            if (geo.city && !locationTags.includes(geo.city))
              locationTags.push(geo.city);
            if (geo.state && !locationTags.includes(geo.state))
              locationTags.push(geo.state);
            if (geo.country && !locationTags.includes(geo.country))
              locationTags.push(geo.country);
          }
        }
      }

      const allKeywords = [
        ...new Set([...keywordsArray, ...locationTags]),
      ].sort();

      return {
        title: title.trim(),
        description: description.trim(),
        tags: [...allKeywords],
        allKeywords,
      };
    } catch (error) {
      console.error('Metadata extraction error:', error);
      return {
        title: 'Untitled',
        description: 'No description available',
        tags: [],
        allKeywords: [],
      };
    }
  };

  const addTagsToDB = async (tags: string[]) => {
    const response = await fetch('/api/photos/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags }),
    });

    if (!response.ok) {
      throw new Error('Failed to add tags');
    }
  };

  const uploadImages = async () => {
    if (fileData.length === 0) return;

    setUploading(true);
    setMessage('');

    try {
      const newProgress = [...uploadProgress];

      for (let i = 0; i < fileData.length; i++) {
        const image = fileData[i];
        await addTagsToDB(image.tags);

        const formData = new FormData();
        formData.append('files', image.file);
        formData.append('visibility', visibility);
        formData.append('title', image.title);
        formData.append('description', image.description);
        formData.append('tags', image.tags.join(','));

        console.log('Uploading:', image.title, image.file.name);
        console.log('FormData entries:', [...formData.entries()]);

        const response = await fetch('/api/photos/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        newProgress[i] = 100;
        setUploadProgress([...newProgress]);
      }

      setMessageType('success');
      setMessage('All uploads successful');
    } catch (err) {
      setMessageType('error');
      setMessage((err as Error).message || 'Unknown error');
    } finally {
      setUploading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div>
      {message && <Message message={message} type={messageType} />}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          uploadImages();
        }}
      >
        <FormInput
          label="Upload Images"
          id="files"
          type="file"
          onChange={handleFileChange}
          value={''}
          multiple
          disabled={uploading}
          hideLabel
        />

        {fileData.map((data, index) => (
          <div className={styles.imageBlock} key={index}>
            <img src={data.previewUrl} alt={`Preview ${index}`} />

            <ProgressBar progress={uploadProgress[index] || 0} />

            <FormInput
              label="Title"
              id={`title-${index}`}
              value={data.title}
              onChange={(e) => updateFileData(index, { title: e.target.value })}
              disabled={uploading}
            />

            <FormTextarea
              label="Description"
              id={`description-${index}`}
              value={data.description}
              onChange={(e) =>
                updateFileData(index, { description: e.target.value })
              }
              disabled={uploading}
            />

            <div className={styles.tagsContainer}>
              {data.availableTags.map((tag) => (
                <FormCheckbox
                  key={tag}
                  label={tag}
                  id={`${tag}-${index}`}
                  value={tag}
                  checked={data.tags.includes(tag)}
                  onChange={() => toggleTag(index, tag)}
                  disabled={uploading}
                />
              ))}
            </div>
          </div>
        ))}

        <FormSelect
          label="Visibility"
          id="visibility"
          options={[
            { value: 'private', label: 'Private' },
            { value: 'public', label: 'Public' },
          ]}
          onChange={(e) =>
            setVisibility(e.target.value as 'public' | 'private')
          }
        />

        <div className={styles.uploadImageActions}>
          <Button
            buttonType="submit"
            styleType="primary"
            isDisabled={uploading}
          >
            {uploading ? <FaSpinner className="animate-spin mr-2" /> : 'Upload'}
          </Button>
        </div>
      </form>
    </div>
  );
}
