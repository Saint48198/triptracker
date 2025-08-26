'use client';
import React, { useRef, useState } from 'react';
import FormInput from '@/components/FormInput/FormInput';
import FormTextarea from '@/components/FormTextarea/FormTextarea';
import FormSelect from '@/components/FormSelect/FormSelect';
import Button from '@/components/Button/Button';
import { FaSpinner } from 'react-icons/fa';
import Message from '@/components/Message/Message';
import styles from './UploadForm.module.scss';
import ExifReader from 'exifreader';
import { ProgressBar } from '@/components/ProgressBar/ProgressBar';
import { fetchJSONWithErrors } from '@/utils/fetchJSONWithErrors';
import { fileToCompressedBase64 } from '@/utils/fileToCompressedBase64';
import { normTag } from '@/utils/normTag';
import TagChip from '@/components/TagChip/TagChip';

type FileMetadata = {
  file: File;
  previewUrl: string;
  title: string;
  description: string;
  tags: string[];
  availableTags: string[];
  aiSuggestions?: string[];
  aiLoading?: boolean;
  aiError?: string;
  aiTagSuggestions?: string[];
  aiTagsLoading?: boolean;
  aiTagsError?: string;
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

        const availableRaw = metadata.allKeywords || [];
        const initialSelected = availableRaw.map(normTag);

        return {
          file,
          previewUrl,
          title: metadata.title,
          description: metadata.description,
          tags: initialSelected || [],
          availableTags: metadata.allKeywords || [],
        };
      })
    );

    setFileData(
      newFileData.map((item) => ({
        ...item,
        tags:
          item.tags && item.tags.length > 0
            ? item.tags.map(normTag)
            : (item.availableTags || []).map(normTag), // select all available tags by default
      }))
    );

    setUploadProgress(Array(newFileData.length).fill(0));
  };

  const updateFileData = (index: number, changes: Partial<FileMetadata>) => {
    setFileData((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...changes };
      return copy;
    });
  };

  const toggleTag = (index: number, tagLike: string) => {
    const t = normTag(tagLike);

    setFileData((prev) => {
      // clone outer array
      const next = [...prev];
      console.log(prev);
      console.log('Toggling tag:', t, 'for item index:', index);

      // clone the specific item
      const item = { ...next[index] };

      // clone tags into a Set to toggle
      const set = new Set(item.tags);
      if (set.has(t)) {
        set.delete(t);
      } else {
        set.add(t);
      }

      // write back a NEW array for tags
      item.tags = Array.from(set);

      // write back the NEW item
      next[index] = item;

      return next;
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setFileData([]);
    setUploadProgress([]);
    setMessage('');
    setMessageType('');
    setVisibility('private');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const suggestTitles = async (index: number) => {
    const item = fileData[index];
    if (!item?.file) return;

    // clear previous error & start loading
    updateFileData(index, { aiLoading: true, aiError: undefined });

    try {
      // use your (compressed) base64 function here
      const { base64, mimeType } = await fileToCompressedBase64(item.file, {
        maxSide: 1024,
        quality: 0.85,
        forceMime: 'image/jpeg',
      });

      const data = await fetchJSONWithErrors('/api/photos/suggest-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          hints: { tags: item.tags },
        }),
      });

      updateFileData(index, { aiSuggestions: data.suggestions ?? [] });
    } catch (e: any) {
      const msg =
        e?.message?.toString().slice(0, 300) ||
        'Unable to get title suggestions right now.';
      // show inline per-image error
      updateFileData(index, { aiError: msg });
      // optional: also surface a global banner
      setMessageType('error');
      setMessage(msg);
    } finally {
      updateFileData(index, { aiLoading: false });
    }
  };

  const suggestTags = async (index: number) => {
    const item = fileData[index];
    if (!item?.file) return;

    updateFileData(index, { aiTagsLoading: true, aiTagsError: undefined });

    try {
      const { base64, mimeType } = await fileToCompressedBase64(item.file, {
        maxSide: 1024,
        quality: 0.85,
        forceMime: 'image/jpeg',
      });

      const data = await fetchJSONWithErrors('/api/photos/tags/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      // Keep suggestions separate (below your existing list); don’t overwrite availableTags
      const incoming = (data.tags as string[] | undefined)?.map(normTag) ?? [];
      // de-dupe within suggestions
      const unique = Array.from(new Set(incoming));

      updateFileData(index, { aiTagSuggestions: unique });
    } catch (e: any) {
      const msg =
        e?.message?.toString().slice(0, 300) ||
        'Unable to get tag suggestions right now.';
      updateFileData(index, { aiTagsError: msg });
      setMessageType('error');
      setMessage(msg);
    } finally {
      updateFileData(index, { aiTagsLoading: false });
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
          ref={fileInputRef}
          label="Upload Images"
          id="files"
          type="file"
          onChange={handleFileChange}
          value={''}
          multiple
          disabled={uploading}
          hideLabel
        />

        {fileData.map((data, index) => {
          const pairs = data.availableTags.map((raw) => ({
            raw,
            norm: normTag(raw),
          }));
          const availableNorm = new Set(pairs.map((p) => p.norm));
          const isSelected = (v: string) => data.tags.includes(v);

          return (
            <div className={styles.imageBlock} key={index}>
              <img src={data.previewUrl} alt={`Preview ${index}`} />
              <ProgressBar progress={uploadProgress[index] || 0} />

              <div className={styles.titleRow}>
                <FormInput
                  label="Title"
                  id={`title-${index}`}
                  value={data.title}
                  onChange={(e) =>
                    updateFileData(index, { title: e.target.value })
                  }
                  disabled={uploading}
                />
                <Button
                  styleType="secondary"
                  buttonType="button"
                  onClick={() => suggestTitles(index)}
                  isDisabled={uploading || data.aiLoading}
                >
                  {data.aiLoading ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    'Suggest Title'
                  )}
                </Button>
              </div>

              {Array.isArray(data.aiSuggestions) &&
                data.aiSuggestions.length > 0 && (
                  <div className={styles.suggestionChips}>
                    {data.aiSuggestions.slice(0, 8).map((s) => (
                      <button
                        type="button"
                        key={`title-sug-${s}`}
                        className={styles.suggestionChip}
                        onClick={() => updateFileData(index, { title: s })}
                        disabled={uploading}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

              <FormTextarea
                label="Description"
                id={`description-${index}`}
                value={data.description}
                onChange={(e) =>
                  updateFileData(index, { description: e.target.value })
                }
                disabled={uploading}
              />

              {/* Existing tags as toggle chips (raw label shown, normalized stored) */}
              <div className={styles.tagsChipsContainer}>
                {pairs.map(({ raw, norm }) => (
                  <TagChip
                    key={`${norm}-${index}`}
                    label={raw}
                    value={raw} // pass raw; toggle will normalize
                    selected={isSelected(norm)}
                    disabled={uploading}
                    onToggle={(val) => toggleTag(index, val)}
                  />
                ))}
              </div>

              <div className={styles.suggestTagsRow}>
                <Button
                  styleType="secondary"
                  buttonType="button"
                  onClick={() => suggestTags(index)}
                  isDisabled={uploading || data.aiTagsLoading}
                >
                  {data.aiTagsLoading ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    'Suggest Tags'
                  )}
                </Button>
                {data.aiTagsError && (
                  <span className={styles.inlineError}>
                    Error: {data.aiTagsError}
                  </span>
                )}
              </div>

              {Array.isArray(data.aiTagSuggestions) &&
                data.aiTagSuggestions.length > 0 && (
                  <div className={styles.suggestionChips}>
                    {/* Suggestions not already in availableTags */}
                    {data.aiTagSuggestions
                      .filter((t) => !availableNorm.has(t))
                      .map((t) => (
                        <TagChip
                          key={`sug-unique-${t}`}
                          label={t} // suggestions are normalized; using as label is fine
                          value={t}
                          selected={isSelected(t)}
                          disabled={uploading}
                          onToggle={(val) => toggleTag(index, val)}
                        />
                      ))}

                    {/* Suggestions that overlap with existing availableTags (dashed style) */}
                    {data.aiTagSuggestions
                      .filter((t) => availableNorm.has(t))
                      .map((t) => (
                        <TagChip
                          key={`sug-existing-${t}`}
                          label={t}
                          value={t}
                          selected={isSelected(t)}
                          disabled={uploading}
                          variant="dashed"
                          onToggle={(val) => toggleTag(index, val)}
                        />
                      ))}
                  </div>
                )}
            </div>
          );
        })}

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
          <div className={styles.resetActions}>
            <Button
              styleType="secondary"
              buttonType={'button'}
              onClick={handleReset}
              isDisabled={uploading}
            >
              Cancel
            </Button>
          </div>
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
