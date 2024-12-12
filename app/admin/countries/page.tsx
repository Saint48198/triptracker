'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

interface Country {
  id: number;
  name: string;
  abbreviation: string;
  lat: number;
  lng: number;
}

export default function CountriesPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries');
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    }
  };

  const handleDeleteCountry = async (id: number) => {
    try {
      const response = await fetch(`/api/countries/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Country deleted successfully!');
        fetchCountries();
      } else {
        setMessage('Failed to delete country.');
      }
    } catch (error) {
      console.error('Failed to delete country:', error);
      setMessage('An error occurred.');
    }
  };

  const handleEditCountry = (id: number) => {
    router.push(`/admin/country?id=${id}`);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold my-4">Countries</h1>
        {message && <p className="mt-4">{message}</p>}
        <ul className="space-y-2">
          {countries.map((country) => (
            <li
              key={country.id}
              className="flex justify-between items-center border-b pb-2"
            >
              <span>
                {country.name} ({country.abbreviation}) - [{country.lat},{' '}
                {country.lng}]
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => handleEditCountry(country.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCountry(country.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </>
  );
}
