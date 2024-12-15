'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { Country } from '@/components/types';

type SortKey = 'name' | 'abbreviation';
type SortOrder = 'asc' | 'desc';

export default function CountriesPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
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

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedCountries = [...countries].sort((a, b) => {
    const keyA = a[sortKey];
    const keyB = b[sortKey];

    if (keyA < keyB) return sortOrder === 'asc' ? -1 : 1;
    if (keyA > keyB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

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

  const handleAddCountry = () => {
    router.push(`/admin/country`);
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4">
        <h1 className="text-2xl font-bold my-4">Countries</h1>
        {message && <p className="mt-4">{message}</p>}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleAddCountry}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Country
          </button>
        </div>
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full table-auto bg-white border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="px-4 py-2 text-left font-medium text-gray-600 cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Country Name{' '}
                  {sortKey === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-4 py-2 text-left font-medium text-gray-600 cursor-pointer"
                  onClick={() => handleSort('abbreviation')}
                >
                  Abbreviation{' '}
                  {sortKey === 'abbreviation' &&
                    (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Latitude
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Longitude
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Last Visited
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCountries.map((country, index) => (
                <tr
                  key={country.id}
                  className={`${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-gray-100`}
                >
                  <td className="px-4 py-2 text-gray-800">{country.name}</td>
                  <td className="px-4 py-2 text-gray-800">
                    {country.abbreviation}
                  </td>
                  <td className="px-4 py-2 text-gray-800">{country.lat}</td>
                  <td className="px-4 py-2 text-gray-800">{country.lng}</td>
                  <td className="px-4 py-2">{country.last_visited || '-'}</td>
                  <td className="px-4 py-2 text-gray-800 space-x-2">
                    <button
                      onClick={() =>
                        (window.location.href = `/admin/country?id=${country.id}`)
                      }
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCountry(country.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  );
}
