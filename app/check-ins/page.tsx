'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Message from '@/components/Message/Message';
import DataTable from '@/components/DataTable/DataTable';
import Button from '@/components/Button/Button';
import { User } from '@/types/UserTypes';

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

  const columns = [
    {
      label: 'User ID',
      key: 'user_id',
    },
    {
      label: 'Latitude',
      key: 'latitude',
    },
    {
      label: 'Longitude',
      key: 'longitude',
    },
    {
      label: 'Created At',
      key: 'created_at',
    },
  ];

  useEffect(() => {
    fetchUser();
    fetchCheckIns();
  }, []);

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

  const fetchCheckIns = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/check-ins');
      setCheckIns(response.data.checkIns);
    } catch (error) {
      setMessage('Failed to fetch check-ins.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

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
            <DataTable
              columns={columns}
              data={checkIns}
              actions={(row: Record<string, any>) => (
                <Button
                  buttonType={'button'}
                  styleType={'danger'}
                  onClick={() => deleteCheckIn((row as CheckIn).id)}
                  isDisabled={
                    !user ||
                    !user?.roles.includes('admin') ||
                    deleting === (row as CheckIn).id
                  }
                >
                  {deleting === (row as CheckIn).id ? 'Deleting...' : 'Delete'}
                </Button>
              )}
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
