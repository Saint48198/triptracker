'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Pagination from '@/components/Pagination/Pagination';
import Message from '@/components/Message/Message';
import { Country, City } from '@/types/ContentTypes';

export default function CitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [countryId, setCountryId] = useState(
    searchParams ? searchParams.get('country_id') || '' : ''
  );
  const [page, setPage] = useState(
    searchParams ? Number(searchParams.get('page')) || 1 : 1
  );
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState(
    searchParams ? searchParams.get('sortBy') : ''
  );
  const [sort, setSort] = useState(
    searchParams ? searchParams.get('sort') : ''
  ); // Sorting state
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    fetchCities();
    updateURL();
  }, [countryId, page, sortBy, sort]);

  const fetchCountries = async () => {
    const response = await fetch('/api/countries');
    const data = await response.json();
    setCountries(data);
  };

  const fetchCities = async () => {
    try {
      const query = new URLSearchParams({
        ...(countryId && { country_id: countryId }),
        ...(sortBy && { sortBy }),
        ...(sort && { sort }),
        page: page.toString(),
        limit: limit.toString(),
      }).toString();

      const response = await fetch(`/api/cities?${query}`);
      const data = await response.json();

      setCities(data.cities);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch cities:', error);
      setMessage('Failed to fetch cities.');
    }
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (countryId) params.set('country_id', countryId);
    params.set('page', page.toString());
    if (sortBy) params.set('sortBy', sortBy);
    if (sort) params.set('sort', sort);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSort(sort === 'asc' ? 'desc' : 'asc'); // Toggle sorting direction
    } else {
      setSortBy(column);
      setSort('asc'); // Default to ascending when switching columns
    }
  };

  const handleCountryFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = e.target.value;
    setCountryId(selectedCountry); // Update country filter state
    setPage(1); // Reset page to 1 when the filter changes
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const totalPages = Math.ceil(total / limit);

  const handleDeleteCity = async (id: number) => {
    try {
      const response = await fetch(`/api/cities/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('City deleted successfully!');
        fetchCities();
      } else {
        setMessage('Failed to delete city.');
      }
    } catch (error) {
      console.error('Failed to delete city:', error);
      setMessage('An error occurred.');
    }
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Cities</h1>
        {message && <Message message={message} type="error"></Message>}
        <div className="flex justify-between mb-4">
          <div>
            <label className="block mb-2 font-medium">Filter by Country</label>
            <select
              value={countryId}
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
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => router.push('/admin/city')}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add City
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto bg-white border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  City Name
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Latitude
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Longitude
                </th>
                <th
                  className="px-4 py-2 text-left cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort('country')}
                >
                  Country{' '}
                  {sortBy === 'country' && (sort === 'asc' ? '⬆️' : '⬇️')}
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  State
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
              {cities.map((city: City) => (
                <tr key={city.id} className="hover:bg-gray-100">
                  <td className="px-4 py-2">{city.name}</td>
                  <td className="px-4 py-2">{city.lat}</td>
                  <td className="px-4 py-2">{city.lng}</td>
                  <td className="px-4 py-2">{city.country_name}</td>
                  <td className="px-4 py-2">{city.state_name || '-'}</td>
                  <td className="px-4 py-2">{city.last_visited || '-'}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => router.push(`/admin/city?id=${city.id}`)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCity(city.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {cities.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    No cities found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          ></Pagination>
        </div>
      </main>
      <Footer />
    </>
  );
}
