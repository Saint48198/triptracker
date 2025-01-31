'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import Message from '@/components/Message/Message';
import styles from './AttractionPage.module.scss';

const AttractionPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const [attraction, setAttraction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      fetchAttractionDetails(id as string);
    }
  }, [id]);

  const fetchAttractionDetails = async (attractionId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/attractions/${attractionId}`);
      const result = await response.json();
      setAttraction(result);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch attraction details:', error);
      setMessage('Failed to fetch attraction details.');
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
      <main className={styles.attractionPage}>
        {attraction ? (
          <div>
            <h1 className={styles.container}>{attraction.name}</h1>
            <p>
              <strong>Country:</strong> {attraction.country_name}
            </p>
          </div>
        ) : (
          <p>Attraction not found.</p>
        )}
      </main>
      <Footer />
    </>
  );
};

export default AttractionPage;
