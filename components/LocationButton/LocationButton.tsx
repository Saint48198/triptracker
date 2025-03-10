'use client';

import { useState } from 'react';
import axios from 'axios';
import { Button } from '@headlessui/react';
import { toast } from 'react-hot-toast';

interface LocationButtonProps {
  userId: number;
  className?: string;
  onClick?: (checkInId: number) => void;
}

const CustomSuccessToast = ({ message }: { message: string }) => (
  <div dangerouslySetInnerHTML={{ __html: message }} />
);

export default function LocationButton({
  userId,
  className,
  onClick,
}: LocationButtonProps) {
  const [loading, setLoading] = useState(false);

  const logLocation = async (latitude: number, longitude: number) => {
    try {
      userId = Math.floor(userId); // required because service requires an int and user id was stored as a float

      await axios.post('/api/users/log-location', {
        userId,
        latitude,
        longitude,
      });

      const locationData = await axios.post('/api/geocode', {
        latitude,
        longitude,
      });

      const location = locationData.data;

      await axios.post('/api/location/update', {
        city: location.city,
        country: location.country,
        state: location.state,
      });

      const successMessage =
        location.country === 'United States' || location.country === 'Canada'
          ? `Location logged successfully!<br>${location.city}, ${location.state} ${location.country}`
          : `Location logged successfully!<br>${location.city}, ${location.country}`;

      const response = await axios.get('/api/check-ins?id=' + userId);
      const data = await response.data?.checkIns;

      if (response.status === 200 && data.length > 0) {
        const checkInId = data[0].id;
        if (onClick) {
          toast.success(<CustomSuccessToast message={successMessage} />, {
            duration: 5000,
            style: { whiteSpace: 'pre-line' },
          });

          onClick(checkInId);
        }
      } else {
        console.error('Failed to create check-in');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to log location.';
      toast.error(`Error: ${message}`);
    }
  };

  const handleLocationError = (err: unknown) => {
    const message =
      err instanceof Error ? err.message : 'Failed to get location';
    toast.error(message);
    setLoading(false);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      await logLocation(latitude, longitude);
      setLoading(false);
    }, handleLocationError);
  };

  return (
    <Button onClick={getLocation} disabled={loading} className={className}>
      {loading ? 'Getting Location...' : 'Log Location'}
    </Button>
  );
}
