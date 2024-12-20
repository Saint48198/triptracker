'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

const MapComponent = dynamic(() => import('@/components/Map/Map'), {
  ssr: false,
});

const markers = [{ lat: 39.8283, lng: -98.5795 }];

const HomePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedOption, setSelectedOption] = useState(() => {
    const urlOption = searchParams ? searchParams.get('view') : null;
    return urlOption || 'cities'; // Default to 'cities'
  });

  const [data, setData] = useState([]);

  // Fetch data based on selected option
  useEffect(() => {
    fetchData(selectedOption);
    updateURL(selectedOption);
  }, [selectedOption]);

  const fetchData = async (view: string) => {
    try {
      const response = await fetch(`/api/${view}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(`Failed to fetch ${view}:`, error);
    }
  };

  const updateURL = (view: string) => {
    const params = new URLSearchParams(
      searchParams ? searchParams.toString() : ''
    );
    params.set('view', view);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <Navbar />
      <main>
        {/* Toggle Switch */}
        <div className="flex space-x-4 mb-6">
          {['cities', 'states', 'countries'].map((option) => (
            <button
              key={option}
              onClick={() => setSelectedOption(option)}
              className={`px-4 py-2 rounded ${
                selectedOption === option
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
        <MapComponent markers={markers} />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
