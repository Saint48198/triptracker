'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import AdminLocalNav from '@/components/AdminLocalNav/AdminLocalNav';
import Message from '@/components/Message/Message';
import { handleResponse } from '@/utils/handleResponse';
import Button from '@/components/Button/Button';
import styles from './CountryPage.module.scss';
import FormInput from '@/components/FormInput/FormInput';

export default function CountryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [editingCountry, setEditingCountry] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [lastVisited, setLastVisited] = useState(''); // State for last_visited
  const [geoMapId, setGeoMapId] = useState(''); // State for geo_map_id
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');

  const id = searchParams ? searchParams.get('id') : null; // Get `id` from query parameters

  const fetchCountry = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/countries/${id}`);
      const data = await response.json();
      if (response.ok) {
        setEditingCountry(data.id.toString());
        setName(data.name);
        setAbbreviation(data.abbreviation);
        setLat(data.lat.toString());
        setLng(data.lng.toString());
        setLastVisited(data.last_visited ? data.last_visited : '');
        setGeoMapId(data.geo_map_id ? data.geo_map_id.toString() : '');
      }
    } catch (error) {
      console.error('Failed to fetch country:', error);
      setMessage('Failed to fetch country.');
      setMessageType('error');
    }
  }, []);

  const handleAddOrUpdateCountry = async (e: React.FormEvent) => {
    e.preventDefault();

    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const method = editingCountry ? 'PUT' : 'POST';
    const url = editingCountry
      ? `/api/countries/${editingCountry}`
      : '/api/countries';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          abbreviation,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          slug: geoMapId ?? name.toLowerCase().replace(/ /g, '-'),
          geo_map_id: geoMapId ? geoMapId : null,
        }),
      });

      await handleResponse({
        response,
        entity: 'country',
        editingEntity: editingCountry,
        setMessage,
        setMessageType,
        router,
      });
    } catch (error) {
      console.error('Failed to save country:', error);
      setMessage('An error occurred.');
      setMessageType('error');
    }
  };

  useEffect(() => {
    if (id) {
      fetchCountry(id);
    }
  }, [fetchCountry, id]);

  return (
    <>
      <Navbar></Navbar>
      <main className={styles.container}>
        <aside>
          <AdminLocalNav currentSection={'country'}></AdminLocalNav>
        </aside>
        <div className={styles.pageContent}>
          <h1 className={styles.title}>
            {editingCountry ? 'Edit Country' : 'Add Country'}
          </h1>
          {message && <Message message={message} type={messageType}></Message>}
          <form onSubmit={handleAddOrUpdateCountry} className={styles.form}>
            <FormInput
              label={'Country Name'}
              id={'name'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <FormInput
              label={'Abbreviation'}
              id={'abbreviation'}
              value={abbreviation}
              onChange={(e) => setAbbreviation(e.target.value)}
              required
            />
            <FormInput
              label={'Latitude'}
              id={'lat'}
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
            />
            <FormInput
              label={'Longitude'}
              id={'lng'}
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              required
            />
            <FormInput
              label={'GEO Map ID'}
              id={'geoMapId'}
              value={geoMapId}
              onChange={(e) => setGeoMapId(e.target.value)}
              required
            />
            <FormInput
              label={'Last Visited'}
              id={'lastVisited'}
              value={lastVisited}
              onChange={(e) => setLastVisited(e.target.value)}
              readOnly
            />
            <Button buttonType={'submit'} styleType={'primary'}>
              {editingCountry ? 'Update Country' : 'Add Country'}
            </Button>
            &nbsp;
            <Button
              buttonType={'button'}
              styleType={'neutral'}
              onClick={() => router.push('/admin/countries')}
            >
              Cancel
            </Button>
          </form>
        </div>
      </main>
      <Footer></Footer>
    </>
  );
}
