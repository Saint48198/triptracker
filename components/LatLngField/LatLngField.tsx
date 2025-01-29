import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import styles from './LatLngField.module.scss';
import Button from '@/components/Button/Button';

interface LatLngFieldProps {
  latLabel: string;
  lat: number | undefined;
  lngLabel: string;
  lng: number | undefined;
  isLoading: boolean;
  onLatChange: (lat: number) => void;
  onLngChange: (lng: number) => void;
  onLookup: () => void;
}

const LatLngField: React.FC<LatLngFieldProps> = ({
  latLabel,
  lat,
  lngLabel,
  lng,
  isLoading,
  onLatChange,
  onLngChange,
  onLookup,
}) => {
  return (
    <div className={styles.latLngField}>
      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label htmlFor="lat" className={styles.label}>
            {latLabel}:
          </label>
          <input
            type="number"
            id="lat"
            value={lat || ''}
            onChange={(e) => onLatChange(Number(e.target.value))}
            className={styles.input}
            readOnly={isLoading}
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="lng" className={styles.label}>
            {lngLabel}:
          </label>
          <input
            type="number"
            id="lng"
            value={lng || ''}
            onChange={(e) => onLngChange(Number(e.target.value))}
            className={styles.input}
            readOnly={isLoading}
            required
          />
        </div>
        <Button
          ariaLabel="Look up Lat/Lng"
          onClick={onLookup}
          isDisabled={isLoading}
          styleType="primary"
          buttonType={'button'}
        >
          {isLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
          {isLoading ? 'Loading...' : 'Look up Lat/Lng'}
        </Button>
      </div>
    </div>
  );
};

export default LatLngField;
