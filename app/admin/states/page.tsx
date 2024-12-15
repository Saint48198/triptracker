'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { State, Country } from '@/components/types';

export default function StatesPage() {
  const router = useRouter();
  const [states, setStates] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await fetch('/api/states');
      const data = await response.json();
      console.log(data);
      setStates(data);
    } catch (error) {
      console.error('Failed to fetch states:', error);
    }
  };

  const handleDeleteState = async (id: number) => {
    try {
      const response = await fetch(`/api/states/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('State deleted successfully!');
        fetchStates();
      } else {
        setMessage('Failed to delete state.');
      }
    } catch (error) {
      console.error('Failed to delete state:', error);
      setMessage('An error occurred.');
    }
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">States</h1>
        {message && <p className="mb-4 text-green-500">{message}</p>}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => router.push('/admin/state')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add State
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto bg-white border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  State Name
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Abbreviation
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Country
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
              {states.map((state: State) => (
                <tr key={state.id} className="hover:bg-gray-100">
                  <td className="px-4 py-2 text-gray-800">{state.name}</td>
                  <td className="px-4 py-2 text-gray-800">
                    {state.abbr || '-'}
                  </td>
                  <td className="px-4 py-2 text-gray-800">
                    {state.country_name || '-'}
                  </td>
                  <td className="px-4 py-2">{state.last_visited || '-'}</td>
                  <td className="px-4 py-2 text-gray-800 space-x-2">
                    <button
                      onClick={() => router.push(`/admin/state?id=${state.id}`)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteState(state.id)}
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
