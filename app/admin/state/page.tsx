'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Country } from '@/types/ContentTypes';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import AdminLocalNav from '@/components/AdminLocalNav/AdminLocalAdmin';
import { handleResponse } from '@/utils/handleResponse';
import Message from '@/components/Message/Message';
import Button from '@/components/Button/Button';
import styles from './StatePage.module.scss';

export default function StatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [name, setName] = useState('');
  const [abbr, setAbbr] = useState('');
  const [countryId, setCountryId] = useState('');
  const [lastVisited, setLastVisited] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');
  const [countries, setCountries] = useState([]);
  const id = searchParams ? searchParams.get('id') : null; // Get the ID from the query string

  const fetchCountries = useCallback(async () => {
    try {
      const response = await fetch('/api/countries');
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      setMessage('Failed to fetch countries.');
      setMessageType('error');
    }
  }, []);

  const fetchState = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/states/${id}`);
      const data = await response.json();
      if (response.ok) {
        setName(data.name);
        setAbbr(data.abbr || '');
        setCountryId(data.country_id.toString());
      } else {
        console.error('Failed to delete state:', response.statusText);
        setMessage('Failed to fetch state.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Failed to fetch state:', error);
      setMessage('Failed to fetch state.');
      setMessageType('error');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/states/${id}` : '/api/states';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, abbr, country_id: Number(countryId) }),
      });

      await handleResponse({
        response,
        entity: 'state',
        editingEntity: id,
        setMessage,
        setMessageType,
        router,
      });
    } catch (error) {
      console.error('Failed to save state:', error);
      setMessage('An error occurred.');
      setMessageType('error');
    }
  };

  useEffect(() => {
    const getData = async () => {
      await fetchCountries();

      if (id) {
        await fetchState(id);
      }
    };

    getData();
  }, [fetchCountries, fetchState, id]);

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <aside>
          <AdminLocalNav currentSection={'state'} />
        </aside>
        <div className={styles.pageContent}>
          <h1 className={styles.title}>{id ? 'Edit State' : 'Add State'}</h1>
          {message && <Message message={message} type={messageType}></Message>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div>
              <label htmlFor="name" className={styles.label}>
                State Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                required
              />
            </div>
            <div>
              <label htmlFor="abbr" className={styles.label}>
                Abbreviation
              </label>
              <input
                type="text"
                id="abbr"
                value={abbr}
                onChange={(e) => setAbbr(e.target.value)}
                className={styles.input}
              />
            </div>
            <div>
              <label htmlFor="countryId" className={styles.label}>
                Country
              </label>
              <select
                id="countryId"
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className={styles.select}
                required
              >
                <option value="">Select a country</option>
                {countries.map((country: Country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lastVisited" className={styles.label}>
                Last Visited
              </label>
              <input
                type="text"
                id="lastVisited"
                value={lastVisited}
                readOnly
                className={`${styles.input} ${styles.inputReadOnly}`}
              />
            </div>
            <Button buttonType={'submit'} styleType={'primary'}>
              {id ? 'Update State' : 'Add State'}
            </Button>
            &nbsp;
            <Button
              buttonType={'button'}
              styleType={'neutral'}
              onClick={() => router.push('/admin/states')}
            >
              Cancel
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
