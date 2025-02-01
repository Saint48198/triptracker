import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import styles from './LatLngField.module.scss';
import Button from '@/components/Button/Button';
import FormInput from '@/components/FormInput/FormInput';

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
        <div className="flex items-center space-x-2">
          <FormInput
            label={latLabel}
            id={'lat'}
            value={lat}
            onChange={(e) => onLatChange(Number(e.target.value))}
            readOnly={isLoading}
            type={'number'}
            required
          />
          <FormInput
            label={lngLabel}
            id={'lng'}
            value={lng}
            onChange={(e) => onLngChange(Number(e.target.value))}
            readOnly={isLoading}
            type={'number'}
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
