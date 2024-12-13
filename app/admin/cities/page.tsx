'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { City } from '@/components/types';

export default function CitiesPage() {
  const router = useRouter();
  const [cities, setCities] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/cities');
      const data = await response.json();
      setCities(data);
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    }
  };

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
        {message && <p className="mb-4 text-green-500">{message}</p>}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => router.push('/admin/city')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add City
          </button>
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
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Country
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  State
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
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  );
}
