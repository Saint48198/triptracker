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

      const baseKeywords = [
        'Africa',
        'Europe',
        'Asia',
        'North America',
        'South America',
        'Central America',
        'Antarctica',
        'Middle East',
        'Southeast Asia',
        'Oceania',
      ];

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

  const uploadImages = async () => {
    if (!files || files.length === 0) {
      setMessage('No files selected');
      setMessageType('error');
      return;
    }

    setUploading(true);
    setMessage('');
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
    setUploading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        />

        {/* Display Image Previews */}
        <div className={styles.previewContainer}>
          {previewUrls.map((url, index) => (
            <img key={index} src={url} alt={`Preview ${index}`} width={200} />
          ))}
        </div>

        <FormInput
          label={'title'}
          id={'title'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          hideLabel={false}
        />
        <FormTextarea
          label={'description'}
          id={'description'}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Render checkboxes for each tag */}
        <div>
          <h2>Tags</h2>
          <div>
            <FormInput
              label={'Add Tag'}
              id={'manualTag'}
              value={manualTag}
              onChange={(e) => setManualTag(e.target.value)}
            />
            <Button
              buttonType="button"
              styleType="secondary"
              onClick={handleAddManualTag}
            >
              Add Tag
            </Button>
          </div>
          {availableTags.map((tag, index) => (
            <FormCheckbox
              label={tag}
              id={tag}
              value={tag}
              key={index}
              checked={selectedTags.includes(tag)}
              onChange={() => handleTagChange(tag)}
            />
          ))}
        </div>

        <FormSelect
          label={'visibility'}
          id={'visibility'}
          options={[
            { value: 'private', label: 'Private' },
            { value: 'public', label: 'Public' },
          ]}
          onChange={(e) =>
            setVisibility(e.target.value as 'public' | 'private')
          }
        />
        <div>
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
