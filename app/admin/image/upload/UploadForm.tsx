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

type GPSData = {
  GPSLatitude: {
    description: string;
    value: [number[], number[], number[]];
  };
  GPSLatitudeRef: {
    description: string;
    value: ['N'] | ['S'];
  };
  GPSLongitude: {
    description: string;
    value: [number[], number[], number[]];
  };
  GPSLongitudeRef: {
    description: string;
    value: ['E'] | ['W'];
  };
};

export default function UploadForm() {
  const [files, setFiles] = useState<File[] | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [manualTag, setManualTag] = useState(''); // Manually entered tag
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const fileArray = Array.from(selectedFiles);
      setFiles(fileArray);

      // Generate preview URLs for selected files
      const urls = fileArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);

      // Extract tags from the first selected file's metadata
      const file = selectedFiles[0];
      const metadata = (await extractMetadata(file)) as {
        title: string;
        description: string;
        tags: string[];
        allKeywords: string[];
      };

      setTitle(metadata.title);
      setDescription(metadata.description);
      setAvailableTags(metadata.allKeywords || []);
      setSelectedTags(metadata.tags || []);
    }
  };

  const handleTagChange = (tag: string) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const handleAddManualTag = () => {
    if (manualTag && !availableTags.includes(manualTag)) {
      setAvailableTags((prevTags) => [...prevTags, manualTag]);
      setManualTag('');
    }
  };

  function getContinentFromCoords(
    lat: number | undefined,
    lon: number | undefined
  ): string | string[] {
    const regions = [
      {
        name: 'Africa',
        latMin: -34.83333,
        latMax: 37.33,
        lonMin: -17.66,
        lonMax: 51.66,
      },
      {
        name: 'Europe',
        latMin: 35.0,
        latMax: 71.0,
        lonMin: -25.0,
        lonMax: 45.0,
      },
      {
        name: 'Asia',
        latMin: -10.0,
        latMax: 81.0,
        lonMin: 25.0,
        lonMax: 180.0,
      },
      {
        name: 'North America',
        latMin: 7.0,
        latMax: 83.0,
        lonMin: -170.0,
        lonMax: -52.0,
      },
      {
        name: 'South America',
        latMin: -56.0,
        latMax: 13.0,
        lonMin: -81.0,
        lonMax: -34.0,
      },
      {
        name: 'Central America',
        latMin: 5.0,
        latMax: 25.0,
        lonMin: -95.0,
        lonMax: -60.0,
      },
      {
        name: 'Antarctica',
        latMin: -90.0,
        latMax: -60.0,
        lonMin: -180.0,
        lonMax: 180.0,
      },
      {
        name: 'Middle East',
        latMin: 12.0,
        latMax: 42.0,
        lonMin: 32.0,
        lonMax: 65.0,
      },
      {
        name: 'Southeast Asia',
        latMin: -11.0,
        latMax: 23.0,
        lonMin: 90.0,
        lonMax: 145.0,
      },
      {
        name: 'Oceania',
        latMin: -50.0,
        latMax: 0.0,
        lonMin: 110.0,
        lonMax: 180.0,
      },
    ];
    if (typeof lat !== 'undefined' && typeof lon !== 'undefined') {
      for (const region of regions) {
        if (
          lat >= region.latMin &&
          lat <= region.latMax &&
          lon >= region.lonMin &&
          lon <= region.lonMax
        ) {
          return region.name;
        }
      }
    }

    return regions.map((region) => region.name);
  }

  function parseGPS(data: GPSData): { lat: number; lon: number } {
    // Extract degrees, minutes, seconds from fractional representation
    const degLat = data.GPSLatitude.value[0][0] / data.GPSLatitude.value[0][1];
    const minLat = data.GPSLatitude.value[1][0] / data.GPSLatitude.value[1][1];
    const secLat = data.GPSLatitude.value[2][0] / data.GPSLatitude.value[2][1];

    const degLon =
      data.GPSLongitude.value[0][0] / data.GPSLongitude.value[0][1];
    const minLon =
      data.GPSLongitude.value[1][0] / data.GPSLongitude.value[1][1];
    const secLon =
      data.GPSLongitude.value[2][0] / data.GPSLongitude.value[2][1];

    // Convert to decimal degrees
    let lat = degLat + minLat / 60 + secLat / 3600;
    let lon = degLon + minLon / 60 + secLon / 3600;

    // Adjust hemisphere (N/S and E/W)
    if (data.GPSLatitudeRef.value[0] === 'S') lat *= -1;
    if (data.GPSLongitudeRef.value[0] === 'W') lon *= -1;

    return { lat, lon };
  }

  const extractMetadata = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const tags = ExifReader.load(arrayBuffer);

      console.log('Metadata:', tags);

      // Extract metadata fields
      const title =
        tags['Title']?.description || tags['XPTitle']?.description || '';
      const description =
        tags['Description']?.description ||
        tags['ImageDescription']?.description ||
        tags['subject']?.description ||
        '';

      const keywordsArray =
        tags['Keywords'] && Array.isArray(tags['Keywords'])
          ? tags['Keywords'].map((keyword: { description: string }) =>
              keyword.description.trim()
            )
          : [];

      const baseKeywords: string[] = [];
      const gpsLatitude = tags['GPSLatitude']
        ? parseFloat(tags['GPSLatitude'].description)
        : '';
      const gpsLongitude = tags['GPSLongitude']
        ? parseFloat(tags['GPSLongitude'].description)
        : '';

      if (gpsLatitude && gpsLongitude) {
        const { lat, lon } = parseGPS({
          GPSLatitude: (tags['GPSLatitude'] as unknown as {
            description: string;
            value: [number[], number[], number[]];
          }) ?? {
            description: '',
            value: [0, 0, 0],
          },
          GPSLatitudeRef: (tags['GPSLatitudeRef'] as unknown as {
            description: string;
            value: ['N'] | ['S'];
          }) ?? {
            description: '',
            value: ['N'],
          },
          GPSLongitude: (tags['GPSLongitude'] as unknown as {
            description: string;
            value: [number[], number[], number[]];
          }) ?? {
            description: '',
            value: [0, 0, 0],
          },
          GPSLongitudeRef: (tags['GPSLongitudeRef'] as unknown as {
            description: string;
            value: ['E'] | ['W'];
          }) ?? {
            description: '',
            value: ['E'],
          },
        });
        const region = getContinentFromCoords(lat, lon);
        baseKeywords.push(...(Array.isArray(region) ? region : [region]));

        if (!Array.isArray(region)) {
          keywordsArray.push(region);
        }
      } else {
        const regions = getContinentFromCoords(
          undefined,
          undefined
        ) as string[];
        baseKeywords.push(...regions);
      }

      if (tags['Country'] && tags['Country'].description) {
        keywordsArray.push(tags['Country'].description);
      }

      if (tags['City'] && tags['City'].description) {
        keywordsArray.push(tags['City'].description);
      }

      if (tags['Province/State'] && tags['Province/State'].description) {
        keywordsArray.push(tags['Province/State'].description);
      }

      const mergedKeywords = Array.from(
        new Set([...baseKeywords, ...keywordsArray])
      ).sort();

      return {
        title: title.trim() || 'Untitled',
        description: description.trim() || 'No description available',
        tags: keywordsArray,
        allKeywords: mergedKeywords,
      };
    } catch (error) {
      console.error('Error extracting metadata:', error);
      return {
        title: 'Untitled',
        description: 'No description available',
        tags: [],
      };
    }
  };

  const addTagsToDB = async (tags: string[]) => {
    const response = await fetch('/api/photos/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags }),
    });

    if (!response.ok) {
      throw new Error('Failed to add tags to the database');
    }
  };

  const uploadImages = async () => {
    if (!files || files.length === 0) {
      setMessage('No files selected');
      setMessageType('error');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      // Add tags to the database
      await addTagsToDB(selectedTags);

      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      formData.append('visibility', visibility);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('tags', selectedTags.join(',')); // Comma-separated list

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const urls = data.images.map((img: any) => img.secure_url).join('\n');
        setMessage(`Upload successful.\n${urls}`);
        setMessageType('success');
      } else {
        setMessage('Upload failed');
        setMessageType('error');
      }
    } catch (error: unknown) {
      const message = (error as Error).message || 'An unknown error occurred';
      setMessage(message);
      setMessageType('error');
    } finally {
      setUploading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div>
      {message && <Message message={message} type={messageType}></Message>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          uploadImages();
        }}
      >
        <FormInput
          label={'Upload Image'}
          id={'files'}
          type={'file'}
          onChange={handleFileChange}
          hideLabel={true}
          value={''}
          multiple
          disabled={uploading}
        />

        {/* Display Image Previews */}
        <div className={styles.previewContainer}>
          {previewUrls.map((url, index) => (
            <div className={styles.mediaItem} key={index}>
              <img src={url} alt={`Preview ${index}`} />
            </div>
          ))}
        </div>

        <FormInput
          label={'Title'}
          id={'title'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          hideLabel={false}
          disabled={uploading}
        />
        <FormTextarea
          label={'Description'}
          id={'description'}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={uploading}
        />

        {/* Render checkboxes for each tag */}
        <div>
          <h2>Tags</h2>
          <div className={styles.addTagContainer}>
            <FormInput
              label={'Add Tag'}
              id={'manualTag'}
              value={manualTag}
              onChange={(e) => setManualTag(e.target.value)}
              hideLabel={true}
              disabled={uploading}
            />
            <Button
              buttonType="button"
              styleType="secondary"
              onClick={handleAddManualTag}
              isDisabled={uploading}
            >
              Add Tag
            </Button>
          </div>
          <div className={styles.tagsContainer}>
            {availableTags.map((tag, index) => (
              <FormCheckbox
                label={tag}
                id={tag}
                value={tag}
                key={index}
                checked={selectedTags.includes(tag)}
                onChange={() => handleTagChange(tag)}
                disabled={uploading}
              />
            ))}
          </div>
        </div>

        <FormSelect
          label={'Visibility'}
          id={'visibility'}
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
