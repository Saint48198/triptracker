'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Country, GeocodeResult, State } from '@/components/types';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { FaSpinner } from 'react-icons/fa';

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
          console.log(state, countryId);
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
    }
  };

  const fetchStates = async () => {
    try {
      const response = await fetch('/api/states');
      const data = await response.json();
      setStates(data);
    } catch (error) {
      console.error('Failed to fetch states:', error);
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
      }
    } catch (error) {
      console.error('Failed to fetch city:', error);
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

  const handleSelectResult = (lat: number, lng: number) => {
    setLat(lat.toString());
    setLng(lng.toString());
    setGeocodeResults([]);
    setMessage(''); // Clear the message
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        }),
      });

      if (response.ok) {
        setMessage(
          id ? 'City updated successfully!' : 'City added successfully!'
        );
        setMessageType('success');
        if (!id) router.push('/admin/cities');
      } else {
        setMessage('Failed to save city.');
        setMessageType('error');
      }
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
        <h1 className="text-2xl font-bold mb-6">
          {id ? 'Edit City' : 'Add City'}
        </h1>
        {message && (
          <div
            role="alert"
            aria-live="assertive"
            className={`mb-4 p-4 border rounded ${
              messageType === 'error'
                ? 'text-red-700 bg-red-100 border-red-400'
                : 'text-green-700 bg-green-100 border-green-400'
            }`}
          >
            <div>{message}</div>
            {geocodeResults.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4">
                  Select a Location
                </h2>
                <ul className="space-y-2">
                  {geocodeResults.map((result: GeocodeResult, index) => (
                    <li key={index}>
                      <button
                        onClick={() =>
                          handleSelectResult(result.lat, result.lng)
                        }
                        className="text-blue-500 underline hover:text-blue-700"
                      >
                        {result.lat}, {result.lng}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <hr />
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
          <div>
            <label htmlFor="lastVisited" className="block font-medium">
              Last Visited
            </label>
            <input
              type="datetime-local"
              id="lastVisited"
              value={lastVisited}
              onChange={(e) => setLastVisited(e.target.value)}
              className="w-full border px-4 py-2 rounded"
            />
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
      </main>
      <Footer />
    </>
  );
}
