'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Country, GeocodeResult, State } from '@/components/types';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { FaSpinner } from 'react-icons/fa';
import AdminLocalNav from '@/components/AdminLocalNav/AdminLocalAdmin';
import dynamic from 'next/dynamic';
import Message from '@/components/Message/Message';
import { handleResponse } from '@/utils/handleResponse';
import LatLngField from '@/components/LatLngField/LatLngField';

const MapComponent = dynamic(() => import('@/components/Map/Map'), {
  ssr: false,
});

export default function CityPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [filteredStates, setFilteredStates] = useState<State[]>([]);
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [countryId, setCountryId] = useState('');
  const [stateId, setStateId] = useState('');
  const [lastVisited, setLastVisited] = useState('');
  const [wikiTerm, setWikiTerm] = useState(''); // Add state for wiki_term
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');
  const [geocodeResults, setGeocodeResults] = useState<GeocodeResult[]>([]); // Store geocode results
  const [loading, setLoading] = useState(false); // Add loading state
  const id = searchParams ? searchParams.get('id') : null; // Get the city ID from the query parameter

  useEffect(() => {
    fetchCountries();
    fetchStates();

    if (id) {
      fetchCity(id);
    }
  }, [id]);

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

  const isNorthAmericanCountry = (countryId: string): boolean => {
    const northAmericanCountryIds = ['1', '5'];
    return northAmericanCountryIds.includes(countryId);
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries');
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      setMessage('Failed to fetch countries.');
      setMessageType('error');
    }
  };

  const fetchStates = async () => {
    try {
      const response = await fetch('/api/states');
      const data = await response.json();
      setStates(data);
    } catch (error) {
      console.error('Failed to fetch states:', error);
      setMessage('Failed to fetch states.');
      setMessageType('error');
    }
  };

  const fetchCity = async (id: string) => {
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
  };

  const handleGeocode = async () => {
    if (!name || !countryId) {
      setMessage('City name and country are required for geocoding.');
      setMessageType('error');
      return;
    }

    const selectedCountry = countries.find(
      (country) => country.id.toString() === countryId
    )?.name;

    setLoading(true); // Set loading to true before the API call

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

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <aside>
          <AdminLocalNav currentSection={'city'} />
        </aside>
        <div className={'PageContent'}>
          <h1 className="text-2xl font-bold mb-6">
            {id ? 'Edit City' : 'Add City'}
          </h1>
          {message && <Message message={message} type={messageType}></Message>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold underline">Details</h2>
            <div>
              <label htmlFor="name" className="block font-medium">
                City Name
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
            {filteredStates.length > 0 && (
              <div>
                <label htmlFor="stateId" className="block font-medium">
                  State
                </label>
                <select
                  id="stateId"
                  value={stateId}
                  onChange={(e) => setStateId(e.target.value)}
                  className="w-full border px-4 py-2 rounded"
                >
                  <option value="">Select a state</option>
                  {filteredStates.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
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
            <h2 className="text-lg font-semibold underline">Location</h2>
            <LatLngField
              latLabel="Latitude"
              lat={parseFloat(lat)}
              lngLabel="Longitude"
              lng={parseFloat(lng)}
              isLoading={loading}
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
            <h2 className="text-lg font-semibold underline">Info</h2>
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <input
                type="text"
                id="wikiTerm"
                value={wikiTerm}
                onChange={(e) => setWikiTerm(e.target.value)}
                className="flex-grow px-4 py-2 text-gray-700 focus:outline-none"
                aria-label={'Wiki Term'}
              />
              <button
                type="button"
                className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none"
              >
                Get Wiki Info
              </button>
            </div>
            <hr />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {id ? 'Update City' : 'Add City'}
            </button>
            &nbsp;
            <button
              onClick={() => router.push('/admin/cities')}
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
