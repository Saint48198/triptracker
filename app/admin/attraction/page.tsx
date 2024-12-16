'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { Attraction, Country } from '@/components/types';

export default function AttractionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const attractionId = searchParams ? searchParams.get('id') : null;
  const [countries, setCountries] = useState([]);
  const [name, setName] = useState('');
  const [countryId, setCountryId] = useState('');
  const [isUnesco, setIsUnesco] = useState(false);
  const [isNationalPark, setIsNationalPark] = useState(false);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [lastVisited, setLastVisited] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCountries();
    if (attractionId) fetchAttraction(attractionId);
  }, [attractionId]);

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries');
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    }
  };

  const fetchAttraction = async (id: string) => {
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
      }
    } catch (error) {
      console.error('Failed to fetch attraction:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        }),
      });

      if (response.ok) {
        setMessage(
          attractionId
            ? 'Attraction updated successfully!'
            : 'Attraction added successfully!'
        );
        if (!attractionId) router.push('/admin/attractions');
      } else {
        setMessage('Failed to save attraction.');
      }
    } catch (error) {
      console.error('Failed to save attraction:', error);
      setMessage('An error occurred.');
    }
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {attractionId ? 'Edit Attraction' : 'Add Attraction'}
        </h1>
        {message && <p className="mb-4 text-red-500">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block font-medium">
              Attraction Name
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
            <label htmlFor="countryId" className="block font-medium">
              Country
            </label>
            <select
              id="countryId"
              value={countryId}
              onChange={(e) => setCountryId(e.target.value)}
              className="w-full border px-4 py-2 rounded"
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
            <label htmlFor="isUnesco" className="block font-medium">
              UNESCO Site
            </label>
            <input
              type="checkbox"
              id="isUnesco"
              checked={isUnesco}
              onChange={(e) => setIsUnesco(e.target.checked)}
            />
          </div>
          <div>
            <label htmlFor="isNationalPark" className="block font-medium">
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
            <label htmlFor="lastVisited" className="block font-medium">
              Last Visited
            </label>
            <input
              type="date"
              id="lastVisited"
              value={lastVisited}
              onChange={(e) => setLastVisited(e.target.value)}
              className="w-full border px-4 py-2 rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {attractionId ? 'Update Attraction' : 'Add Attraction'}
          </button>
          &nbsp;
          <button
            onClick={() => router.push('/admin/attractions')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
