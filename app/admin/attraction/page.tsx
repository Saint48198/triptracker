'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import dynamic from 'next/dynamic';
import AdminLocalNav from '@/components/AdminLocalNav/AdminLocalAdmin';
import Message from '@/components/Message/Message';
import { handleResponse } from '@/utils/handleResponse';
import LatLngField from '@/components/LatLngField/LatLngField';
import { Country, Attraction } from '@/types/ContentTypes';
import { GeocodeResult } from '@/types/MapTypes';
import styles from './AttractionPage.module.scss';
import Button from '@/components/Button/Button';

const MapComponent = dynamic(() => import('@/components/Map/Map'), {
  ssr: false,
});

export default function AttractionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const attractionId = searchParams ? searchParams.get('id') : null;
  const [countries, setCountries] = useState<Country[]>([]);
  const [name, setName] = useState('');
  const [countryId, setCountryId] = useState('');
  const [isUnesco, setIsUnesco] = useState(false);
  const [isNationalPark, setIsNationalPark] = useState(false);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [lastVisited, setLastVisited] = useState('');
  const [wikiTerm, setWikiTerm] = useState(''); // Add state for wiki_text
  const [geocodeResults, setGeocodeResults] = useState<GeocodeResult[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');
  const [loading, setLoading] = useState(false); // Add loading state

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

  const fetchAttraction = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/attractions/${id}`);
      const data: Attraction = await response.json();
      if (response.ok) {
        setName(data.name);
        setCountryId(data.country_id.toString());
        setIsUnesco(data.is_unesco);
        setIsNationalPark(data.is_national_park);
        setLat(data.lat.toString());
        setLng(data.lng.toString());
        setLastVisited(data.last_visited || '');
        setWikiTerm(data.wiki_term || '');
      }
    } catch (error) {
      setMessageType('error');
      setMessage('Failed to fetch attraction.');
      console.error('Failed to fetch attraction:', error);
    }
  }, []);

  const handleGeocode = async () => {
    if (!name) {
      setMessage('Place name is required for geocoding.');
      setMessageType('error');
      return;
    }

    setLoading(true); // Set loading to true before the API call

    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ place: name }),
      });

      if (response.ok) {
        let data = await response.json();
        if (Array.isArray(data.results)) {
          data = data.results;
        } else {
          data = [data];
        }

        const results: GeocodeResult[] = data.map((result: GeocodeResult) => ({
          lat: result.lat,
          lng: result.lng,
          displayName: result.displayName || `${result.lat}, ${result.lng}`,
        }));

        if (results.length > 1) {
          setGeocodeResults(results);
          setMessage(
            'Multiple results found. Please select the correct location.'
          );
        } else if (results.length === 1) {
          setLat(results[0].lat.toString());
          setLng(results[0].lng.toString());
          setGeocodeResults([]);
          setMessage('Geocoding successful!');
          setMessageType('success');
        } else {
          setMessage('No results found for the given city and country.');
          setMessageType('error');
        }
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to fetch geocode data.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Failed to fetch geocode data:', error);
      setMessage('An error occurred.');
      setMessageType('error');
    } finally {
      setLoading(false); // Set loading to false after the API call
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const method = attractionId ? 'PUT' : 'POST';
    const url = attractionId
      ? `/api/attractions/${attractionId}`
      : '/api/attractions';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          country_id: countryId,
          is_unesco: isUnesco,
          is_national_park: isNationalPark,
          lat,
          lng,
          last_visited: lastVisited || null,
          wiki_term: wikiTerm, // Include wiki_term in the request body
        }),
      });

      await handleResponse({
        response,
        entity: 'attraction',
        editingEntity: attractionId,
        setMessage,
        setMessageType,
        router,
      });
    } catch (error) {
      console.error('Failed to save attraction:', error);
      setMessage('An error occurred.');
      setMessageType('error');
    }
  };

  useEffect(() => {
    const getData = async () => {
      await fetchCountries();
      if (attractionId) await fetchAttraction(attractionId);
    };
    getData();
  }, [fetchCountries, fetchAttraction, attractionId]);

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <aside>
          <AdminLocalNav currentSection={'attraction'} />
        </aside>
        <div className={'pageContent'}>
          <h1 className={styles.title}>
            {attractionId ? 'Edit Site' : 'Add Site'}
          </h1>
          {message && <Message message={message} type={messageType}></Message>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className={styles.subtitle}>Details</h2>
            <div>
              <label htmlFor="name" className={styles.label}>
                Site Name
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
            <h2 className={styles.subtitle}>Details</h2>
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
            <div className={styles.checkbox}>
              <label htmlFor="isUnesco" className={styles.label}>
                UNESCO Site
              </label>
              <input
                type="checkbox"
                id="isUnesco"
                checked={isUnesco}
                onChange={(e) => setIsUnesco(e.target.checked)}
              />
            </div>
            <div className={styles.checkbox}>
              <label htmlFor="isNationalPark" className={styles.label}>
                National Park
              </label>
              <input
                type="checkbox"
                id="isNationalPark"
                checked={isNationalPark}
                onChange={(e) => setIsNationalPark(e.target.checked)}
              />
            </div>
            <div>
              <label htmlFor="lastVisited" className={styles.label}>
                Last Visited
              </label>
              <input
                type="month"
                id="lastVisited"
                value={lastVisited}
                onChange={(e) => setLastVisited(e.target.value)}
                className={styles.input}
              />
            </div>
            <h2 className={styles.subtitle}>Location</h2>
            <LatLngField
              latLabel="Latitude"
              lat={parseFloat(lat)}
              lngLabel="Longitude"
              lng={parseFloat(lng)}
              isLoading={loading}
              onLatChange={(lat) => setLat(lat.toString())}
              onLngChange={(lng) => setLng(lng.toString())}
              onLookup={handleGeocode}
            />
            {lat && lng && (
              <div>
                <MapComponent
                  markers={[
                    {
                      lat: parseFloat(lat),
                      lng: parseFloat(lng),
                      popupText: name,
                    },
                  ]}
                  zoom={8}
                />
              </div>
            )}
            <h2 className={styles.subtitle}>Info</h2>
            <div>
              <label htmlFor="wikiTerm" className={styles.label}>
                Wiki Text
              </label>
              <textarea
                id="wikiTerm"
                value={wikiTerm}
                onChange={(e) => setWikiTerm(e.target.value)}
                className={styles.textarea}
              />
            </div>
            <Button buttonType={'submit'} isDisabled={loading}>
              {attractionId ? 'Update Site' : 'Add Site'}
            </Button>
            &nbsp;
            <Button
              buttonType={'button'}
              onClick={() => router.push('/admin/attractions')}
              styleType={'neutral'}
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
