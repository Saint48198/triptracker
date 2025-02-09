'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import AdminLocalNav from '@/components/AdminLocalNav/AdminLocalNav';
import Message from '@/components/Message/Message';
import { handleResponse } from '@/utils/handleResponse';
import AdminForm from '@/components/AdminDetail/AdminDetailForm';
import Button from '@/components/Button/Button';
import PhotoManager from '@/components/AdminDetail/PhotoManager';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import {
  ENTITY_TYPE_ATTRACTION,
  ENTITY_TYPE_ATTRACTIONS,
  ENTITY_TYPE_CITIES,
  ENTITY_TYPE_CITY,
} from '@/constants';
import styles from './AdminDetailPage.module.scss';

export default function AdminDetailPage({
  entity,
  entities,
}: {
  entity: typeof ENTITY_TYPE_CITY | typeof ENTITY_TYPE_ATTRACTION;
  entities: typeof ENTITY_TYPE_CITIES | typeof ENTITY_TYPE_ATTRACTIONS;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const entityId = searchParams ? searchParams.get('id') : null;

  const [name, setName] = useState('');
  const [stateId, setStateId] = useState('');
  const [states, setStates] = useState([]);
  const [countryId, setCountryId] = useState('');
  const [countryName, setCountryName] = useState('');
  const [countries, setCountries] = useState([]);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [lastVisited, setLastVisited] = useState('');
  const [wikiTerm, setWikiTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');

  const fetchStates = useCallback(async () => {
    try {
      const response = await fetch('/api/states?all=true');
      const data = await response.json();
      setStates(data.states);
    } catch (error) {
      console.error('Failed to fetch states:', error);
      setMessage('Failed to fetch states.');
      setMessageType('error');
    }
  }, []);

  const fetchCountries = useCallback(async () => {
    try {
      const response = await fetch('/api/countries?all=true');
      const data = await response.json();
      setCountries(data.countries);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      setMessage('Failed to fetch countries.');
    }
  }, []);

  const fetchEntity = useCallback(async () => {
    if (!entityId) return;
    try {
      const response = await fetch(`/api/${entities}/${entityId}`);
      const data = await response.json();
      if (response.ok) {
        console.log(data);
        setName(data.name);
        setLat(data.lat?.toString() || '');
        setLng(data.lng?.toString() || '');
        setCountryName(data.country_name || '');
        setCountryId(data.country_id.toString());
        setStateId(data.state_id?.toString() || '');
        setLastVisited(data.last_visited || '');
        setWikiTerm(data.wiki_term || '');
      }
    } catch (error) {
      setMessage(`Failed to fetch ${entity}.`);
    }
  }, [entity, entityId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await fetchCountries();
    await fetchEntity();

    // load states if country is US or Canada
    if ((countryId === '1' || countryId === '2') && entity === ENTITY_TYPE_CITY)
      await fetchStates();
    setLoading(false);
  }, [fetchCountries, fetchEntity, countryId, entity, fetchStates]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = entityId ? 'PUT' : 'POST';
    const url = entityId ? `/api/${entities}/${entityId}` : `/api/${entity}s`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          country_id: countryId,
          state_id: stateId,
          lat,
          lng,
          last_visited: lastVisited,
          wiki_term: wikiTerm,
        }),
      });

      await handleResponse({
        response,
        entity,
        editingEntity: entityId,
        setMessage,
        setMessageType,
        router,
      });
    } catch (error) {
      setMessage('An error occurred.');
      setMessageType('error');
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <aside>
          <AdminLocalNav currentSection={entity} />
        </aside>
        <div>
          <h1 className={styles.pageTitle}>
            {entityId ? `Edit ${entity}` : `Add ${entity}`}
          </h1>
          {message && <Message message={message} type={messageType} />}
          <>
            {loading ? (
              <LoadingSpinner displayText={false} />
            ) : (
              <form onSubmit={handleSubmit}>
                <AdminForm
                  entity={entity}
                  entities={entities}
                  name={name}
                  setName={setName}
                  stateId={stateId}
                  setStateId={setStateId}
                  states={states}
                  countryId={countryId || ''}
                  setCountryId={setCountryId}
                  countries={countries}
                  lat={lat}
                  setLat={setLat}
                  lng={lng}
                  setLng={setLng}
                  lastVisited={lastVisited}
                  setLastVisited={setLastVisited}
                  wikiTerm={wikiTerm}
                  setWikiTerm={setWikiTerm}
                  handleGeocode={() => {}}
                  loading={loading}
                />

                {/* Photo Manager is only included if entityId exists */}
                {entityId && (
                  <PhotoManager entityId={entityId} entityType={entities} />
                )}
                <div className={styles.formActions}>
                  <Button buttonType="submit" isDisabled={loading}>
                    {entityId ? 'Update' : 'Add'} {entity}
                  </Button>
                </div>
              </form>
            )}
          </>
        </div>
      </main>
      <Footer />
    </>
  );
}
