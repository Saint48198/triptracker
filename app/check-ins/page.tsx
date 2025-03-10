'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Message from '@/components/Message/Message';
import DataTable from '@/components/DataTable/DataTable';
import Button from '@/components/Button/Button';
import { User } from '@/types/UserTypes';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/Map/Map'), {
  ssr: false,
});

interface CheckIn {
  id: number;
  user_id: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export default function CheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');
  const [user, setUser] = useState<User | null>(null);
  const searchParams = useSearchParams();
  const checkInId = searchParams ? searchParams.get('id') : null;
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);

  const columns = [
    ...(checkInId ? [] : [{ label: 'User ID', key: 'user_id' }]),
    {
      label: 'Location',
      key: 'location',
      format: (value: { latitude: number; longitude: number }) =>
        `${value.latitude}, ${value.longitude}`,
    },
    {
      label: 'Time',
      key: 'created_at',
      format: (value: string) =>
        format(new Date(value), 'MMM d, yyyy hh:mm:ss a'),
    },
  ];

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/validate-session', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      setMessage('Failed to fetch user.');
      setMessageType('error');
      console.error('Failed to fetch user');
    }
  };

  const fetchCheckIns = useCallback(async () => {
    setLoading(true);
    try {
      const url = checkInId
        ? `/api/check-ins?userId=${checkInId}`
        : '/api/check-ins';
      const response = await axios.get(url);
      setCheckIns(response.data.checkIns);
      setSelectedCheckIn(checkIns[0]);
    } catch (error) {
      setMessage('Failed to fetch check-ins.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }, [checkInId]);

  const deleteCheckIn = async (id: number) => {
    if (!user?.roles.includes('admin')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/check-ins?id=${id}`);
      setMessage('Check-in deleted successfully.');
      setMessageType('success');
      setCheckIns((prev) => prev.filter((checkIn) => checkIn.id !== id));
    } catch (error) {
      setMessage('Failed to delete check-in.');
      setMessageType('error');
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchUser().then(() => fetchCheckIns());
  }, [fetchCheckIns]);

  return (
    <>
      <Navbar />
      <main>
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Check-Ins</h1>
          {message && <Message message={message} type={messageType} />}
          {loading ? (
            <p>Loading check-ins...</p>
          ) : checkIns.length === 0 ? (
            <p>No check-ins found.</p>
          ) : (
            <>
              {selectedCheckIn && (
                <MapComponent
                  markers={[
                    {
                      lat: selectedCheckIn.latitude,
                      lng: selectedCheckIn.longitude,
                      popupText: `last check-in`,
                    },
                  ]}
                  zoom={8}
                />
              )}
              <DataTable
                columns={columns}
                data={checkIns.map((checkIn) => ({
                  ...checkIn,
                  location: {
                    latitude: checkIn.latitude,
                    longitude: checkIn.longitude,
                  },
                }))}
                actions={
                  user && user.roles.includes('admin')
                    ? (row: Record<string, any>) => (
                        <Button
                          buttonType={'button'}
                          styleType={'danger'}
                          onClick={() => deleteCheckIn((row as CheckIn).id)}
                          isDisabled={deleting === (row as CheckIn).id}
                        >
                          {deleting === (row as CheckIn).id
                            ? 'Deleting...'
                            : 'Delete'}
                        </Button>
                      )
                    : undefined
                }
              />
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
