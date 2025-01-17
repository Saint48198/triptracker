import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import Message from '@/components/Message/Message';

const AttractionPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
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
      <main className="container mx-auto p-4">
        {attraction ? (
          <div>
            <h1 className="text-2xl font-bold mb-4">{attraction.name}</h1>
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
