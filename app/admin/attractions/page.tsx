'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { Attraction } from '@/components/types';

export default function AttractionsPage() {
  const router = useRouter();
  const [attractions, setAttractions] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      const response = await fetch('/api/attractions');
      const data = await response.json();
      setAttractions(data);
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

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Attractions</h1>
        {message && <p className="mb-4 text-green-500">{message}</p>}
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
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Name
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Country
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
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  );
}
