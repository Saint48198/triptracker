'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { Attraction, Country } from '@/components/types';

export default function AttractionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [attractions, setAttractions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [countryId, setCountryId] = useState(
    searchParams ? searchParams.get('country_id') : ''
  );
  const [page, setPage] = useState(
    searchParams && searchParams.get('page')
      ? Number(searchParams.get('page'))
      : 1
  );
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState(
    searchParams && searchParams.get('sortBy')
      ? searchParams.get('sortBy')
      : 'name'
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams && searchParams.get('sortOrder')
      ? searchParams.get('sortOrder')
      : 'asc'
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    fetchAttractions();
    updateURL();
  }, [countryId, page, sortBy, sortOrder]);

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries');
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      setMessage('Failed to fetch countries.');
      console.error('Failed to fetch countries:', error);
    }
  };

  const fetchAttractions = async () => {
    try {
      const query = new URLSearchParams({
        ...(countryId && { country_id: countryId }),
        page: page.toString(),
        limit: limit.toString(),
        sortBy: sortBy ?? '',
        sortOrder: sortOrder ?? '',
      }).toString();

      const response = await fetch(`/api/attractions?${query}`);
      const data = await response.json();

      setAttractions(data.attractions);
      setTotal(data.total);

      // Ensure page starts from 1 if total items are less than limit and not empty
      if (data.total > 0 && data.total <= limit && page !== 1) {
        setPage(1);
      }
    } catch (error) {
      console.error('Failed to fetch attractions:', error);
    }
  };

  const handleDeleteAttraction = async (id: number) => {
    try {
      const response = await fetch(`/api/attractions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Attraction deleted successfully!');
        fetchAttractions();
      } else {
        setMessage('Failed to delete attraction.');
      }
    } catch (error) {
      console.error('Failed to delete attraction:', error);
      setMessage('An error occurred.');
    }
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (countryId) params.set('country_id', countryId);
    params.set('page', page.toString());
    if (sortBy && sortOrder) {
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCountryFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountryId(e.target.value);
    setPage(1); // Reset to the first page when filter changes
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Attractions</h1>
        {message && <p className="mb-4 text-green-500">{message}</p>}
        {/* Filter */}
        <div className="flex justify-between mb-4">
          <div>
            <label className="block mb-2 font-medium">Filter by Country</label>
            <select
              value={countryId ?? ''}
              onChange={handleCountryFilter}
              className="border px-4 py-2 rounded"
            >
              <option value="">All Countries</option>
              {countries.map((country: Country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>Total: {total}</div>
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => router.push('/admin/attraction')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Attraction
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto bg-white border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="px-4 py-2 text-left cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort('name')}
                >
                  Name{' '}
                  {sortBy === 'name' && (sortOrder === 'asc' ? '⬆️' : '⬇️')}
                </th>
                <th
                  className="px-4 py-2 text-left cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort('country')}
                >
                  Country{' '}
                  {sortBy === 'country' && (sortOrder === 'asc' ? '⬆️' : '⬇️')}
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
              {attractions.map((attraction: Attraction) => (
                <tr key={attraction.id} className="hover:bg-gray-100">
                  <td className="px-4 py-2">{attraction.name}</td>
                  <td className="px-4 py-2">{attraction.country_name}</td>
                  <td className="px-4 py-2">{attraction.lat}</td>
                  <td className="px-4 py-2">{attraction.lng}</td>
                  <td className="px-4 py-2">
                    {attraction.last_visited || 'Never Visited'}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() =>
                        router.push(`/admin/attraction?id=${attraction.id}`)
                      }
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAttraction(attraction.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {attractions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No attractions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          {total > 0 && (
            <span>
              Page {page} of {totalPages}
            </span>
          )}
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page >= totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
