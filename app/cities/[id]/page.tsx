'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import Message from '@/components/Message/Message';
import dynamic from 'next/dynamic';
import { WikiInfo } from '@/types/ContentTypes';
import { Photo } from '@/types/PhotoTypes';
import styles from './CityPage.module.scss';

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
  const [photos, setPhotos] = useState<Photo[]>([]);

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
        await fetchWikiData(result.wiki_term);
      }

      await fetchPhotos(cityId);
    } catch (error: unknown) {
      console.error('Failed to fetch city details:', error);
      setMessage('Failed to fetch city details.');
    } finally {
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
    } catch (error: unknown) {
      console.error('Error fetching wiki info:', error);
      setMessage('An error occurred.');
    }
  };

  const fetchPhotos = async (id: string) => {
    try {
      const response = await fetch(`/api/photos/cities/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos);
      } else {
        console.error('Failed to fetch photos:', await response.text());
        setMessage('Failed to fetch photos.');
      }
    } catch (error: unknown) {
      console.error('Error fetching photos:', error);
      setMessage('An error occurred while fetching photos.');
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
      <main className={styles.cityPage}>
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
            <div className={styles.container}>
              <div>
                <h1 className={styles.title}>
                  {city.name}
                  {city.state_name && <span>city.state_name</span>}
                  <span>{city.country_name}</span>
                </h1>

                {wikiInfo && (
                  <div>
                    <h2 className={styles.wikiInfo}>Wikipedia Info</h2>
                    <p>{wikiInfo.intro}</p>
                    <a
                      href={wikiInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.wikiLink}
                    >
                      Read more on Wikipedia
                    </a>
                  </div>
                )}

                {photos.length > 0 && (
                  <div>
                    <h2 className={styles.photos}>Photos</h2>
                    <div className={styles.grid}>
                      {photos.map((photo: Photo) => (
                        <img
                          key={photo.id}
                          src={photo.url}
                          alt={photo.title}
                          className={styles.photo}
                        />
                      ))}
                    </div>
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
