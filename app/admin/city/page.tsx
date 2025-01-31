'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

import { ENTITY_TYPE_CITIES } from '@/constants';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import AdminLocalNav from '@/components/AdminLocalNav/AdminLocalAdmin';
import Message from '@/components/Message/Message';
import Modal from '@/components/Modal/Modal';
import LatLngField from '@/components/LatLngField/LatLngField';
import { handleResponse } from '@/utils/handleResponse';
import { Country, State, WikiInfo } from '@/types/ContentTypes';
import { GeocodeResult } from '@/types/MapTypes';
import { Photo } from '@/types/PhotoTypes';
import PhotoManager from '@/components/PhotoManager/PhotoManager';
import PhotoSearch from '@/components/PhotoSearch/PhotoSearch';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import styles from './CityPage.module.scss';
import Button from '@/components/Button/Button';
import FormInput from '@/components/FormInput/FormInput';
import FormSelect from '@/components/FormSelect/FormSelect';
import FormTextarea from '@/components/FormTextarea/FormTextarea';

const MapComponent = dynamic(() => import('@/components/Map/Map'), {
  ssr: false,
});

export default function CityPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [filteredStates, setFilteredStates] = useState<State[]>([]);
  const [entityId, setEntityId] = useState('');
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [countryId, setCountryId] = useState('');
  const [stateId, setStateId] = useState('');
  const [lastVisited, setLastVisited] = useState('');
  const [wikiTerm, setWikiTerm] = useState('');
  const [wikiInfo, setWikiInfo] = useState<WikiInfo | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');
  const [working, setWorking] = useState(false); // Add working state for when the geocode API is called
  const id = searchParams ? searchParams.get('id') : null; // Get the city ID from the query parameter
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[] | null>(null);
  const [photoUpdates, setPhotoUpdates] = useState<Photo[] | null>(null);
  const [loading, setLoading] = useState(true);

  const isNorthAmericanCountry = (countryId: string): boolean => {
    const northAmericanCountryIds = ['1', '5'];
    return northAmericanCountryIds.includes(countryId);
  };

  const fetchCountries = useCallback(async () => {
    try {
      const response = await fetch('/api/countries');
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      setMessage('Failed to fetch countries.');
      setMessageType('error');
    }
  }, []);

  const fetchStates = useCallback(async () => {
    try {
      const response = await fetch('/api/states');
      const data = await response.json();
      setStates(data);
    } catch (error) {
      console.error('Failed to fetch states:', error);
      setMessage('Failed to fetch states.');
      setMessageType('error');
    }
  }, []);

  const fetchCity = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/cities/${id}`);
      const data = await response.json();
      if (response.ok) {
        setName(data.name);
        setLat(data.lat.toString());
        setLng(data.lng.toString());
        setCountryId(data.country_id.toString());
        setStateId(data.state_id?.toString() || '');
        setLastVisited(data.last_visited || '');
        setWikiTerm(data.wiki_term || ''); // Set wiki_term
      }
    } catch (error) {
      console.error('Failed to fetch city:', error);
      setMessage('Failed to fetch city.');
      setMessageType('error');
    }
  }, []);

  const fetchPhotos = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/photos/cities/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos);
      } else {
        console.error('Failed to fetch photos:', await response.text());
        setMessage('Failed to fetch photos.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      setMessage('An error occurred while fetching photos.');
      setMessageType('error');
    }
  }, []);

  const handleGeocode = async () => {
    if (!name || !countryId) {
      setMessage('City name and country are required for geocoding.');
      setMessageType('error');
      return;
    }

    const selectedCountry = countries.find(
      (country) => country.id.toString() === countryId
    )?.name;

    setWorking(true); // Set working to true before the API call

    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: name, country: selectedCountry }),
      });

      if (response.ok) {
        let data = await response.json();
        if (Array.isArray(data.results)) {
          data = data.results;
        } else {
          data = [data];
        }

        const results: GeocodeResult[] = data.map((result: GeocodeResult) => ({
          lat: result.lat,
          lng: result.lng,
          displayName: result.displayName || `${result.lat}, ${result.lng}`,
        }));

        if (results.length > 1) {
          setMessage('Multiple results found.');
        } else if (results.length === 1) {
          setLat(results[0].lat.toString());
          setLng(results[0].lng.toString());
          setMessage('Geocoding successful!');
          setMessageType('success');
        } else {
          setMessage('No results found for the given city and country.');
          setMessageType('error');
        }
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to fetch geocode data.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Failed to fetch geocode data:', error);
      setMessage('An error occurred.');
      setMessageType('error');
    } finally {
      setWorking(false); // Set working to false after the API call
    }
  };

  const handleWikiLookup = useCallback(async () => {
    try {
      const response = await fetch(`/api/info?query=${wikiTerm}`);
      if (response.ok) {
        const data: WikiInfo = await response.json();
        setWikiInfo(data);
      } else {
        console.error('Failed to fetch wiki info');
        setMessage('Failed to fetch wiki info.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error fetching wiki info:', error);
      setMessage('An error occurred.');
      setMessageType('error');
    }
  }, [wikiTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (isNorthAmericanCountry(countryId) && !stateId) {
      setMessage('State is required for cities in the US or Canada.');
      setMessageType('error');
      return;
    }

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/cities/${id}` : '/api/cities';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          lat,
          lng,
          state_id: stateId || null,
          country_id: countryId,
          last_visited: lastVisited || null,
          wiki_term: wikiTerm, // Include wiki_term in the request body
        }),
      });

      await handleResponse({
        response,
        entity: 'city',
        editingEntity: id,
        setMessage,
        setMessageType,
        router,
      });
    } catch (error) {
      console.error('Failed to save city:', error);
      setMessage('An error occurred.');
      setMessageType('error');
    }
  };

  const handleDisplayPhotos = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    console.log('Selected photos:', selectedPhotos);
    setPhotoUpdates(selectedPhotos);
  };

  const handleUpdatePhotos = (photos: Photo[]) => {
    console.log('Updating photos:', photos);
    setSelectedPhotos(photos);
  };

  const fetchData = useCallback(
    async (id: string) => {
      setLoading(true);

      try {
        await Promise.all([fetchCountries(), fetchStates()]);
        if (id) {
          setEntityId(id);
          await Promise.all([fetchCity(id), fetchPhotos(id)]);

          if (wikiTerm && wikiTerm.trim()) {
            await handleWikiLookup();
          }
        }
      } catch (err) {
        console.error('Loading Data: ', err);
      } finally {
        setLoading(false);
      }
    },
    [
      fetchCountries,
      fetchStates,
      fetchCity,
      fetchPhotos,
      handleWikiLookup,
      wikiTerm,
    ]
  );

  useEffect(() => {
    fetchData(id || '').finally(() => setLoading(false));
  }, [fetchData, id]);

  useEffect(() => {
    // Filter states when countryId changes
    if (isNorthAmericanCountry(countryId)) {
      setFilteredStates(
        states.filter((state) => {
          return state.country_id && state.country_id.toString() === countryId;
        })
      );
    } else {
      setFilteredStates([]);
    }
  }, [countryId, states]);

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <aside>
          <AdminLocalNav currentSection={'city'} />
        </aside>
        <div className={styles.pageContent}>
          <h1 className={styles.title}>{id ? 'Edit City' : 'Add City'}</h1>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {message && (
                <Message message={message} type={messageType}></Message>
              )}
              <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.detailsTitle}>Details</h2>
                <FormInput
                  label={'City Name'}
                  id={'name'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                {filteredStates.length > 0 && (
                  <FormSelect
                    label={'State'}
                    id={'stateId'}
                    options={filteredStates.map((state) => ({
                      value: state.id.toString(),
                      label: state.name,
                    }))}
                    noValueOption={{ include: true, label: 'Select a state' }}
                    value={stateId}
                    onChange={(e) => setStateId(e.target.value)}
                  />
                )}
                <FormSelect
                  label={'Country'}
                  id={'countryId'}
                  options={countries.map((country) => ({
                    value: country.id.toString(),
                    label: country.name,
                  }))}
                  noValueOption={{ include: true, label: 'Select a country' }}
                  value={countryId}
                  onChange={(e) => setCountryId(e.target.value)}
                  required
                />
                <FormInput
                  label={'Last Visited'}
                  id={'lastVisited'}
                  value={lastVisited}
                  onChange={(e) => setLastVisited(e.target.value)}
                />
                <h2 className={styles.detailsTitle}>Location</h2>
                <LatLngField
                  latLabel="Latitude"
                  lat={parseFloat(lat)}
                  lngLabel="Longitude"
                  lng={parseFloat(lng)}
                  isLoading={working}
                  onLatChange={(lat) => setLat(lat.toString())}
                  onLngChange={(lng) => setLng(lng.toString())}
                  onLookup={handleGeocode}
                />
                {lat && lng && (
                  <div>
                    <MapComponent
                      markers={[
                        {
                          lat: parseFloat(lat),
                          lng: parseFloat(lng),
                          popupText: `${name}${stateId ? ', ' + states.find((state) => state.id.toString() === stateId)?.abbr : ''}, ${countries.find((country) => country.id.toString() === countryId)?.name}`,
                        },
                      ]}
                      zoom={8}
                    />
                  </div>
                )}
                <h2 className={styles.detailsTitle}>Info</h2>
                <FormTextarea
                  label={'Wiki Term'}
                  id={'wikiTerm'}
                  value={wikiTerm}
                  onChange={(e) => setWikiTerm(e.target.value)}
                />
                <article className={styles.wikiInfo}>
                  {wikiInfo && (
                    <div>
                      <h3 className={styles.wikiTitle}>{wikiInfo.title}</h3>
                      <p>{wikiInfo.intro}</p>
                      <a
                        href={wikiInfo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.wikiLink}
                      >
                        Read more
                      </a>
                    </div>
                  )}
                </article>
                <hr />
                <h2 className={styles.detailsTitle}>Photos</h2>
                <div>
                  <Button
                    buttonType={'button'}
                    styleType={'secondary'}
                    onClick={handleDisplayPhotos}
                  >
                    Display All Photos
                  </Button>
                </div>
                <PhotoManager
                  entityType={ENTITY_TYPE_CITIES}
                  entityId={parseInt(entityId)}
                  initialPhotos={photos}
                  externalPhotos={photoUpdates}
                />
                <hr />
                <Button
                  styleType={'primary'}
                  buttonType={'submit'}
                  isDisabled={working}
                >
                  {id ? 'Update City' : 'Add City'}
                </Button>
                &nbsp;
                <Button
                  styleType={'neutral'}
                  buttonType={'button'}
                  onClick={() => router.push('/admin/cities')}
                >
                  Cancel
                </Button>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
      <Modal onClose={closeModal} isOpen={isModalOpen}>
        <PhotoSearch
          onPhotoSelect={handleUpdatePhotos}
          initialSelectedPhotos={photos}
        />
      </Modal>
    </>
  );
}
