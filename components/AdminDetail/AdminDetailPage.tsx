'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import AdminLocalNav from '@/components/AdminLocalNav/AdminLocalNav';
import Message from '@/components/Message/Message';
import { handleResponse } from '@/utils/handleResponse';
import AdminForm from '@/components/AdminDetail/AdminDetailForm';
import Button from '@/components/Button/Button';
import PhotoManager from '@/components/AdminDetail/PhotoManager';

export default function AdminPage({
  entity,
}: {
  entity: 'city' | 'attraction';
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const entityId = searchParams ? searchParams.get('id') : null;

  const [name, setName] = useState('');
  const [countryId, setCountryId] = useState('');
  const [countries, setCountries] = useState([]);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [lastVisited, setLastVisited] = useState('');
  const [wikiTerm, setWikiTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');

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

  const fetchEntity = useCallback(async () => {
    if (!entityId) return;
    try {
      const response = await fetch(`/api/${entity}s/${entityId}`);
      const data = await response.json();
      if (response.ok) {
        console.log(data);
        setName(data.name);
        setLat(data.lat?.toString() || '');
        setLng(data.lng?.toString() || '');
        setCountryId(data.country_id.toString());
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
    setLoading(false);
  }, [fetchCountries, fetchEntity]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = entityId ? 'PUT' : 'POST';
    const url = entityId ? `/api/${entity}s/${entityId}` : `/api/${entity}s`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          country_id: countryId,
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
          <h1>{entityId ? `Edit ${entity}` : `Add ${entity}`}</h1>
          {message && <Message message={message} type={messageType} />}
          <form onSubmit={handleSubmit}>
            <AdminForm
              name={name}
              setName={setName}
              countryId={countryId}
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
            {!loading && entityId && (
              <PhotoManager entityId={entityId} entityType={entity} />
            )}
            <div>
              <Button buttonType="submit" isDisabled={loading}>
                {entityId ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
