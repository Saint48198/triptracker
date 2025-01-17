'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import Message from '@/components/Message/Message';

const CityPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const [city, setCity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      fetchCityDetails(id as string);
    }
  }, [id]);

  const fetchCityDetails = async (cityId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cities/${cityId}`);
      const result = await response.json();
      setCity(result);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch city details:', error);
      setMessage('Failed to fetch city details.');
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (message) {
    return <Message message={message} type="error" />;
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto p-4">
        {city ? (
          <div>
            <h1 className="text-2xl font-bold mb-4">{city.name}</h1>
            <p>
              <strong>State:</strong> {city.state_name}
            </p>
            <p>
              <strong>Country:</strong> {city.country_name}
            </p>
          </div>
        ) : (
          <p>City not found.</p>
        )}
      </main>
      <Footer />
    </>
  );
};

export default CityPage;
