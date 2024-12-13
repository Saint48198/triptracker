'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Country } from '@/components/types';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

export default function StatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [name, setName] = useState('');
  const [abbr, setAbbr] = useState('');
  const [countryId, setCountryId] = useState('');
  const [message, setMessage] = useState('');
  const [countries, setCountries] = useState([]);
  const id = searchParams ? searchParams.get('id') : null; // Get the ID from the query string

  useEffect(() => {
    fetchCountries();

    if (id) {
      fetchState(id);
    }
  }, [id]);

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries');
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    }
  };

  const fetchState = async (id: string) => {
    try {
      const response = await fetch(`/api/states/${id}`);
      const data = await response.json();
      if (response.ok) {
        setName(data.name);
        setAbbr(data.abbr || '');
        setCountryId(data.country_id.toString());
      }
    } catch (error) {
      console.error('Failed to fetch state:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/states/${id}` : '/api/states';

    try {
      console.log({ name, abbr, countryId });
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, abbr, country_id: countryId }),
      });

      if (response.ok) {
        setMessage(
          id ? 'State updated successfully!' : 'State added successfully!'
        );
        setName('');
        setAbbr('');
        setCountryId('');
        if (!id) router.push('/admin/states'); // Redirect after adding a new state
      } else {
        setMessage('Failed to save state.');
      }
    } catch (error) {
      console.error('Failed to save state:', error);
      setMessage('An error occurred.');
    }
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {id ? 'Edit State' : 'Add State'}
        </h1>
        {message && <p className="mb-4 text-green-500">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block font-medium">
              State Name
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
            <label htmlFor="abbr" className="block font-medium">
              Abbreviation
            </label>
            <input
              type="text"
              id="abbr"
              value={abbr}
              onChange={(e) => setAbbr(e.target.value)}
              className="w-full border px-4 py-2 rounded"
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
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {id ? 'Update State' : 'Add State'}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
