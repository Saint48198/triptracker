'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Country, State } from '@/components/types';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

export default function CityPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [filteredStates, setFilteredStates] = useState<State[]>([]);
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [countryId, setCountryId] = useState('');
  const [stateId, setStateId] = useState('');
  const [message, setMessage] = useState('');
  const id = searchParams ? searchParams.get('id') : null; // Get the city ID from the query parameter

  useEffect(() => {
    fetchCountries();
    fetchStates();

    if (id) {
      fetchCity(id);
    }
  }, [id]);

  useEffect(() => {
    // Filter states when countryId changes
    if (isNorthAmericanCountry(countryId)) {
      setFilteredStates(
        states.filter((state) => {
          console.log(state, countryId);
          return state.country_id && state.country_id.toString() === countryId;
        })
      );
    } else {
      setFilteredStates([]);
    }
  }, [countryId, states]);

  const isNorthAmericanCountry = (countryId: string): boolean => {
    const northAmericanCountryIds = ['1', '5'];
    return northAmericanCountryIds.includes(countryId);
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries');
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await fetch('/api/states');
      const data = await response.json();
      setStates(data);
    } catch (error) {
      console.error('Failed to fetch states:', error);
    }
  };

  const fetchCity = async (id: string) => {
    try {
      const response = await fetch(`/api/cities/${id}`);
      const data = await response.json();
      if (response.ok) {
        setName(data.name);
        setLat(data.lat.toString());
        setLng(data.lng.toString());
        setCountryId(data.country_id.toString());
        setStateId(data.state_id?.toString() || '');
      }
    } catch (error) {
      console.error('Failed to fetch city:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isNorthAmericanCountry(countryId) && !stateId) {
      setMessage('State is required for cities in the US or Canada.');
      return;
    }

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/cities/${id}` : '/api/cities';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          lat,
          lng,
          state_id: stateId || null,
          country_id: countryId,
        }),
      });

      if (response.ok) {
        setMessage(
          id ? 'City updated successfully!' : 'City added successfully!'
        );
        if (!id) router.push('/admin/cities');
      } else {
        setMessage('Failed to save city.');
      }
    } catch (error) {
      console.error('Failed to save city:', error);
      setMessage('An error occurred.');
    }
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {id ? 'Edit City' : 'Add City'}
        </h1>
        {message && <p className="mb-4 text-red-500">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block font-medium">
              City Name
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
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          {filteredStates.length > 0 && (
            <div>
              <label htmlFor="stateId" className="block font-medium">
                State
              </label>
              <select
                id="stateId"
                value={stateId}
                onChange={(e) => setStateId(e.target.value)}
                className="w-full border px-4 py-2 rounded"
              >
                <option value="">Select a state</option>
                {filteredStates.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {id ? 'Update City' : 'Add City'}
          </button>
          &nbsp;
          <button
            onClick={() => router.push('/admin/cities')}
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
