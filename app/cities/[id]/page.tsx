'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import Message from '@/components/Message/Message';
import dynamic from 'next/dynamic';
import { WikiInfo } from '@/types/ContentTypes';

const MapComponent = dynamic(() => import('@/components/Map/Map'), {
  ssr: false,
});

const CityPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const [city, setCity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [wikiInfo, setWikiInfo] = useState<WikiInfo | null>(null);

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
      if (result.wiki_term) {
        fetchWikiData(result.wiki_term);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch city details:', error);
      setMessage('Failed to fetch city details.');
      setLoading(false);
    }
  };

  const fetchWikiData = async (wikiTerm: string) => {
    try {
      const response = await fetch(`/api/info?query=${wikiTerm}`);
      if (response.ok) {
        const data: WikiInfo = await response.json();
        setWikiInfo(data);
      } else {
        console.error('Failed to fetch wiki info');
        setMessage('Failed to fetch wiki info.');
      }
    } catch (error) {
      console.error('Error fetching wiki info:', error);
      setMessage('An error occurred.');
    } finally {
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
      <main>
        {city ? (
          <>
            {city.lat && city.lng && (
              <div>
                <MapComponent
                  markers={[
                    {
                      lat: parseFloat(city.lat),
                      lng: parseFloat(city.lng),
                      popupText: `${city.name}`,
                    },
                  ]}
                  zoom={8}
                />
              </div>
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div>
                <h1 className="text-2xl font-bold mb-4">
                  {city.name}
                  {city.state_name && <span>city.state_name</span>}
                  <span>{city.country_name}</span>
                </h1>

                {wikiInfo && (
                  <div>
                    <h2 className="text-xl font-bold mt-4">Wikipedia Info</h2>
                    <p>{wikiInfo.intro}</p>
                    <a
                      href={wikiInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Read more on Wikipedia
                    </a>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex space-x-4 mb-6">
            <p>City not found.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default CityPage;
