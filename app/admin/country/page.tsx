'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { Country } from '@/components/types';
import AdminLocalNav from '@/components/AdminLocalNav/AdminLocalAdmin';
import Message from '@/components/Message/Message';
import { handleResponse } from '@/utils/handleResponse';

export default function CountryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [name, setName] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [lastVisited, setLastVisited] = useState(''); // State for last_visited
  const [geoMapId, setGeoMapId] = useState(''); // State for geo_map_id
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');

  const id = searchParams ? searchParams.get('id') : null; // Get `id` from query parameters

  useEffect(() => {
    if (id) {
      fetchCountry(id);
    }
  }, [id]);

  const fetchCountry = async (id: string) => {
    try {
      const response = await fetch(`/api/countries/${id}`);
      const data = await response.json();
      if (response.ok) {
        setEditingCountry(data);
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
  };

  const handleAddOrUpdateCountry = async (e: React.FormEvent) => {
    e.preventDefault();

    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const method = editingCountry ? 'PUT' : 'POST';
    const url = editingCountry
      ? `/api/countries/${editingCountry.id}`
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

  return (
    <>
      <Navbar></Navbar>
      <main className="container mx-auto px-4">
        <aside>
          <AdminLocalNav currentSection={'country'}></AdminLocalNav>
        </aside>
        <div className={'pageContent'}>
          <h1 className="text-2xl font-bold my-4">
            {editingCountry ? 'Edit Country' : 'Add Country'}
          </h1>
          {message && <Message message={message} type={messageType}></Message>}
          <form onSubmit={handleAddOrUpdateCountry} className="space-y-4">
            <div>
              <label htmlFor="name" className="block font-medium">
                Country Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="abbreviation" className="block font-medium">
                Abbreviation
              </label>
              <input
                type="text"
                id="abbreviation"
                value={abbreviation}
                onChange={(e) => setAbbreviation(e.target.value)}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="lat" className="block font-medium">
                Latitude
              </label>
              <input
                type="number"
                id="lat"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="lng" className="block font-medium">
                Longitude
              </label>
              <input
                type="number"
                id="lng"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="geoMapId" className="block font-medium">
                GEO Map ID
              </label>
              <input
                type="text"
                id="geoMapId"
                value={geoMapId}
                onChange={(e) => setGeoMapId(e.target.value)}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="lastVisited" className="block font-medium">
                Last Visited
              </label>
              <input
                type="text"
                id="lastVisited"
                value={lastVisited}
                readOnly
                className="w-full border px-4 py-2 rounded bg-gray-100"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {editingCountry ? 'Update Country' : 'Add Country'}
            </button>
            &nbsp;
            <button
              onClick={() => router.push('/admin/countries')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </form>
        </div>
      </main>
      <Footer></Footer>
    </>
  );
}
