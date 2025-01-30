'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Message from '@/components/Message/Message';
import Button from '@/components/Button/Button';
import DataTable from '@/components/DataTable/DataTable';
import styles from './StatesPage.module.scss';

export default function StatesPage() {
  const router = useRouter();
  const [states, setStates] = useState([]);
  const [message, setMessage] = useState('');

  const fetchStates = useCallback(async () => {
    try {
      const response = await fetch('/api/states');
      const data = await response.json();

      setStates(data);
    } catch (error) {
      console.error('Failed to fetch states:', error);
      setMessage('Failed to fetch states.');
    }
  }, []);

  const handleDeleteState = async (id: number) => {
    try {
      const response = await fetch(`/api/states/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('State deleted successfully!');
        await fetchStates();
      } else {
        setMessage('Failed to delete state.');
      }
    } catch (error) {
      console.error('Failed to delete state:', error);
      setMessage('An error occurred.');
    }
  };

  const columns = [
    { key: 'name', label: 'State Name' },
    { key: 'abbr', label: 'Abbreviation' },
    { key: 'country_name', label: 'Country' },
    { key: 'last_visited', label: 'Last Visited' },
  ];

  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <h1 className={styles.title}>States</h1>
        {message && <Message message={message} type="error"></Message>}
        <div className={styles.flexEnd}>
          <Button
            styleType={'secondary'}
            buttonType={'button'}
            onClick={() => router.push('/admin/state')}
          >
            Add State
          </Button>
        </div>
        <div className={styles.overflowXAuto}>
          <DataTable
            columns={columns}
            data={states}
            actions={(row) => (
              <>
                <Button
                  styleType={'text'}
                  buttonType={'button'}
                  onClick={() => router.push(`/admin/state?id=${row.id}`)}
                >
                  Edit
                </Button>
                <Button
                  styleType={'danger'}
                  buttonType={'button'}
                  onClick={() => handleDeleteState(row.id)}
                >
                  Delete
                </Button>
              </>
            )}
          ></DataTable>
        </div>
      </main>
      <Footer />
    </>
  );
}
