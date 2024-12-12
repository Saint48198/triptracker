'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { Country } from '@/components/types';

export default function CountryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [name, setName] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [message, setMessage] = useState('');

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
      }
    } catch (error) {
      console.error('Failed to fetch country:', error);
    }
  };

  const handleAddOrUpdateCountry = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = editingCountry ? 'PUT' : 'POST';
    const url = editingCountry
      ? `/api/countries/${editingCountry.id}`
      : '/api/countries';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, abbreviation, lat, lng }),
      });

      if (response.ok) {
        setMessage(
          editingCountry
            ? 'Country updated successfully!'
            : 'Country added successfully!'
        );
        setName('');
        setAbbreviation('');
        setLat('');
        setLng('');
        setEditingCountry(null);
        router.push('/admin/countries'); // Navigate to the list of countries
      } else {
        setMessage('Failed to save country.');
      }
    } catch (error) {
      console.error('Failed to save country:', error);
      setMessage('An error occurred.');
    }
  };

  return (
    <>
      <Navbar></Navbar>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold my-4">
          {editingCountry ? 'Edit Country' : 'Add Country'}
        </h1>
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
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {editingCountry ? 'Update Country' : 'Add Country'}
          </button>
        </form>
        {message && <p className="mt-4">{message}</p>}
        <div className="mt-4">
          <button
            onClick={() => router.push('/admin/countries')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            View All Countries
          </button>
        </div>
      </div>
      <Footer></Footer>
    </>
  );
}
