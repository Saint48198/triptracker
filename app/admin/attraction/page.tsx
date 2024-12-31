'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { Attraction, Country, GeocodeResult } from '@/components/types';
import { FaSpinner } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import AdminLocalNav from '@/components/AdminLocalNav/AdminLocalAdmin';
import Message from '@/components/Message/Message';
import { handleResponse } from '@/utils/handleResponse';

const MapComponent = dynamic(() => import('@/components/Map/Map'), {
  ssr: false,
});

export default function AttractionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const attractionId = searchParams ? searchParams.get('id') : null;
  const [countries, setCountries] = useState<Country[]>([]);
  const [name, setName] = useState('');
  const [countryId, setCountryId] = useState('');
  const [isUnesco, setIsUnesco] = useState(false);
  const [isNationalPark, setIsNationalPark] = useState(false);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [lastVisited, setLastVisited] = useState('');
  const [wikiTerm, setWikiTerm] = useState(''); // Add state for wiki_text
  const [geocodeResults, setGeocodeResults] = useState<GeocodeResult[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    fetchCountries();
    if (attractionId) fetchAttraction(attractionId);
  }, [attractionId]);

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries');
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      setMessage('Failed to fetch countries.');
    }
  };

  const fetchAttraction = async (id: string) => {
    try {
      const response = await fetch(`/api/attractions/${id}`);
      const data: Attraction = await response.json();
      if (response.ok) {
        setName(data.name);
        setCountryId(data.country_id.toString());
        setIsUnesco(data.is_unesco);
        setIsNationalPark(data.is_national_park);
        setLat(data.lat.toString());
        setLng(data.lng.toString());
        setLastVisited(data.last_visited || '');
        setWikiTerm(data.wiki_term || '');
      }
    } catch (error) {
      setMessageType('error');
      setMessage('Failed to fetch attraction.');
      console.error('Failed to fetch attraction:', error);
    }
  };

  const handleGeocode = async () => {
    if (!name) {
      setMessage('Place name is required for geocoding.');
      setMessageType('error');
      return;
    }

    setLoading(true); // Set loading to true before the API call

    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ place: name }),
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
          setGeocodeResults(results);
          setMessage(
            'Multiple results found. Please select the correct location.'
          );
        } else if (results.length === 1) {
          setLat(results[0].lat.toString());
          setLng(results[0].lng.toString());
          setGeocodeResults([]);
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
      setLoading(false); // Set loading to false after the API call
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const method = attractionId ? 'PUT' : 'POST';
    const url = attractionId
      ? `/api/attractions/${attractionId}`
      : '/api/attractions';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          country_id: countryId,
          is_unesco: isUnesco,
          is_national_park: isNationalPark,
          lat,
          lng,
          last_visited: lastVisited || null,
          wiki_term: wikiTerm, // Include wiki_term in the request body
        }),
      });

      await handleResponse({
        response,
        entity: 'attraction',
        editingEntity: attractionId,
        setMessage,
        setMessageType,
        router,
      });
    } catch (error) {
      console.error('Failed to save attraction:', error);
      setMessage('An error occurred.');
      setMessageType('error');
    }
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <aside>
          <AdminLocalNav currentSection={'attraction'} />
        </aside>
        <div className={'pageContent'}>
          <h1 className="text-2xl font-bold mb-6">
            {attractionId ? 'Edit Site' : 'Add Site'}
          </h1>
          {message && <Message message={message} type={messageType}></Message>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block font-medium">
                Site Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>
            <hr />
            <div>
              <label htmlFor="countryId" className="block font-medium">
                Country
              </label>
              <select
                id="countryId"
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className="w-full border px-4 py-2 rounded"
                required
              >
                <option value="">Select a country</option>
                {countries.map((country: Country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="isUnesco" className="block font-medium">
                UNESCO Site
              </label>
              <input
                type="checkbox"
                id="isUnesco"
                checked={isUnesco}
                onChange={(e) => setIsUnesco(e.target.checked)}
              />
            </div>
            <div>
              <label htmlFor="isNationalPark" className="block font-medium">
                National Park
              </label>
              <input
                type="checkbox"
                id="isNationalPark"
                checked={isNationalPark}
                onChange={(e) => setIsNationalPark(e.target.checked)}
              />
            </div>
            <hr />
            {lat && lng && (
              <div>
                <MapComponent
                  markers={[
                    {
                      lat: parseFloat(lat),
                      lng: parseFloat(lng),
                      popupText: name,
                    },
                  ]}
                  zoom={8}
                />
              </div>
            )}
            <button
              type="button"
              onClick={handleGeocode}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center"
              disabled={loading} // Disable button while loading
            >
              {loading ? (
                <FaSpinner className="animate-spin mr-2" /> // Show spinner icon while loading
              ) : (
                'Look Up Lat/Lng'
              )}
            </button>
            <div>
              <label htmlFor="lat" className="block font-medium">
                Latitude
              </label>
              <input
                type="number"
                id="lat"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="lng" className="block font-medium">
                Longitude
              </label>
              <input
                type="number"
                id="lng"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>
            <hr />
            <div>
              <label htmlFor="lastVisited" className="block font-medium">
                Last Visited
              </label>
              <input
                type="month"
                id="lastVisited"
                value={lastVisited}
                onChange={(e) => setLastVisited(e.target.value)}
                className="w-full border px-4 py-2 rounded"
              />
            </div>
            <div>
              <label htmlFor="wikiTerm" className="block font-medium">
                Wiki Text
              </label>
              <textarea
                id="wikiTerm"
                value={wikiTerm}
                onChange={(e) => setWikiTerm(e.target.value)}
                className="w-full border px-4 py-2 rounded"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {attractionId ? 'Update Attraction' : 'Add Attraction'}
            </button>
            &nbsp;
            <button
              onClick={() => router.push('/admin/attractions')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
