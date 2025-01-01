import React from 'react';
import { FaSpinner } from 'react-icons/fa';

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
    <div className="mx-auto">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label
            htmlFor="lat"
            className="text-gray-700 font-medium whitespace-nowrap"
          >
            {latLabel}:
          </label>
          <input
            type="number"
            id="lat"
            value={lat || ''}
            onChange={(e) => onLatChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            readOnly={isLoading}
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <label
            htmlFor="lng"
            className="text-gray-700 font-medium whitespace-nowrap"
          >
            {lngLabel}:
          </label>
          <input
            type="number"
            id="lng"
            value={lng || ''}
            onChange={(e) => onLngChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            readOnly={isLoading}
            required
          />
        </div>

        <button
          type="button"
          onClick={onLookup}
          className={`${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500'
          } text-white px-4 py-2 rounded flex items-center`}
          disabled={isLoading}
        >
          {isLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
          {isLoading ? 'Loading...' : 'Look up Lat/Lng'}
        </button>
      </div>
    </div>
  );
};

export default LatLngField;
