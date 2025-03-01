import React, { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import styles from './LatLngField.module.scss';
import Button from '@/components/Button/Button';
import FormInput from '@/components/FormInput/FormInput';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface LatLngFieldProps {
  latLabel: string;
  lat: number | undefined;
  lngLabel: string;
  lng: number | undefined;
  isLoading: boolean;
  onLatChange: (lat: number) => void;
  onLngChange: (lng: number) => void;
  city?: string;
  country?: string;
}

const LatLngField: React.FC<LatLngFieldProps> = ({
  latLabel,
  lat,
  lngLabel,
  lng,
  isLoading,
  onLatChange,
  onLngChange,
  city,
  country,
}) => {
  const [fetchingCoordinates, setFetchingCoordinates] = useState(false);

  const getCoordinates = async () => {
    if (!city || !country) {
      toast.error('City and Country are required to get coordinates.');
      return;
    }

    setFetchingCoordinates(true);
    try {
      const response = await axios.post('/api/geocode', {
        city,
        country,
      });

      if (response.data.lat && response.data.lng) {
        onLatChange(response.data.lat);
        onLngChange(response.data.lng);
        toast.success(
          `Coordinates: ${response.data.lat}, ${response.data.lng}`
        );
      } else {
        toast.error('No results found for the given location.');
      }
    } catch (error) {
      toast.error('Failed to fetch coordinates.');
    } finally {
      setFetchingCoordinates(false);
    }
  };

  return (
    <div className={styles.latLngField}>
      <div className={styles.fieldGroup}>
        <FormInput
          label={latLabel}
          id={'lat'}
          value={lat !== undefined ? lat.toString() : ''}
          onChange={(e) => onLatChange(Number(e.target.value))}
          readOnly={isLoading}
          type={'number'}
          inlineLabel={true}
          required
        />
        <FormInput
          label={lngLabel}
          id={'lng'}
          value={lng !== undefined ? lng.toString() : ''}
          onChange={(e) => onLngChange(Number(e.target.value))}
          readOnly={isLoading}
          type={'number'}
          inlineLabel={true}
          required
        />
        <Button
          ariaLabel="Look up Lat/Lng"
          onClick={getCoordinates}
          isDisabled={isLoading}
          styleType="primary"
          buttonType={'button'}
        >
          {isLoading || fetchingCoordinates ? (
            <FaSpinner className="animate-spin mr-2" />
          ) : null}
          {isLoading || fetchingCoordinates ? 'Loading...' : 'Get Lat/Lng'}
        </Button>
      </div>
    </div>
  );
};

export default LatLngField;
