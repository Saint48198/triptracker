'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { Country } from '@/types/ContentTypes';
import Message from '@/components/Message/Message';
import Button from '@/components/Button/Button';
import DataTable from '@/components/DataTable/DataTable';
import styles from './CountriesPage.module.scss';

type SortKey = 'name' | 'abbreviation';
type SortOrder = 'asc' | 'desc';

export default function CountriesPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [message, setMessage] = useState('');

  const columns = [
    { key: 'name', label: 'Country Name' },
    { key: 'abbreviation', label: 'Abbreviation' },
    { key: 'lat', label: 'Latitude' },
    { key: 'lng', label: 'Longitude' },
    { key: 'last_visited', label: 'Last Visited' },
  ];

  const fetchCountries = useCallback(async () => {
    try {
      const response = await fetch('/api/countries');
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      setMessage('Failed to fetch countries.');
    }
  }, []);

  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setSortKey(sortBy as SortKey);
    setSortOrder(sortOrder);
  };

  const handleDeleteCountry = async (id: number) => {
    try {
      const response = await fetch(`/api/countries/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Country deleted successfully!');
        fetchCountries();
      } else {
        setMessage('Failed to delete country.');
      }
    } catch (error) {
      console.error('Failed to delete country:', error);
      setMessage('An error occurred.');
    }
  };

  const handleEditCountry = (id: number) => {
    router.push(`/admin/country?id=${id}`);
  };

  const handleAddCountry = () => {
    router.push(`/admin/country`);
  };

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <h1 className={styles.title}>Countries</h1>
        {message && <Message message={message} type="error"></Message>}
        <div className={styles.flexEnd}>
          <Button
            buttonType={'button'}
            styleType={'secondary'}
            onClick={handleAddCountry}
          >
            Add Country
          </Button>
        </div>
        <div className={styles.overflowXAuto}>
          <DataTable
            columns={columns}
            data={countries}
            onSort={(sortBy, sortOrder) => handleSort(sortBy, sortOrder)}
            actions={(row) => (
              <>
                <Button
                  styleType={'text'}
                  buttonType={'button'}
                  onClick={() => handleEditCountry(row.id)}
                >
                  Edit
                </Button>
                <Button
                  buttonType={'button'}
                  styleType={'danger'}
                  onClick={() => handleDeleteCountry(row.id)}
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
