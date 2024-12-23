'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import DataTable from '@/components/DataTable/DataTable';
import Pagination from '@/components/Pagination/Pagination';
import { Country } from '@/components/types';

const MapComponent = dynamic(() => import('@/components/Map/Map'), {
  ssr: false,
});

const markers = [{ lat: 39.8283, lng: -98.5795 }];

const HomePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(
    searchParams ? Number(searchParams.get('page')) || 1 : 1
  );
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [hasPageProperty, setHasPageProperty] = useState(false);

  const [selectedOption, setSelectedOption] = useState(() => {
    const urlOption = searchParams ? searchParams.get('view') : null;
    return urlOption || 'cities'; // Default to 'cities'
  });

  const [data, setData] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  // Fetch data based on selected option
  useEffect(() => {
    fetchData(selectedOption);
    updateURL();
    if (selectedOption === 'countries') {
      fetchFilteredGeoJsonData();
    }
  }, [selectedOption, page]);

  const fetchData = async (view: string) => {
    try {
      const response = await fetch(`/api/${view}`);
      const result = await response.json();
      setHasPageProperty(!!(result && result.page));
      setData(result[view] || result);
      setTotal(result.total || result.length);
      //hasPageProperty = result.page ? true : false;
    } catch (error) {
      console.error(`Failed to fetch ${view}:`, error);
    }
  };

  const fetchFilteredGeoJsonData = async () => {
    try {
      // Fetch countries from API
      const response = await fetch('/api/countries');
      const countries = await response.json();

      // Fetch GeoJSON data
      const geoJsonResponse = await fetch('/data/countries.json');
      const geoJson = await geoJsonResponse.json();

      // Filter GeoJSON features to include only matching countries
      const filteredGeoJson = {
        ...geoJson,
        features: geoJson.features.filter((feature: any) =>
          countries.some(
            (country: Country) => feature.id === country.geo_map_id
          )
        ),
      };
      setGeoJsonData(filteredGeoJson);
    } catch (error) {
      console.error('Failed to fetch filtered GeoJSON data:', error);
    }
  };

  const updateURL = () => {
    const params = new URLSearchParams(
      searchParams ? searchParams.toString() : ''
    );
    params.set('view', selectedOption);
    params.set('page', page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Define columns dynamically based on selected option
  const columns =
    selectedOption === 'cities'
      ? [
          { key: 'name', label: 'City Name', sortable: true },
          { key: 'state_name', label: 'State', sortable: true },
          { key: 'country_name', label: 'Country', sortable: true },
        ]
      : selectedOption === 'states'
        ? [
            { key: 'abbr', label: 'Abbr', sortable: false },
            { key: 'name', label: 'State Name', sortable: true },
            { key: 'country_name', label: 'Country', sortable: true },
          ]
        : selectedOption === 'countries'
          ? [{ key: 'name', label: 'Country Name', sortable: true }]
          : [
              { key: 'name', label: 'Site Name', sortable: true },
              { key: 'country_name', label: 'Country', sortable: true },
            ];

  const handlePageChange = (page: number) => {
    setPage(page);
    console.log(`Changed to page: ${page}`);
    // Add your logic to fetch new data based on the page
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Navbar />
      <main>
        {/* Toggle Switch */}
        <div className="flex space-x-4 mb-6">
          {['cities', 'states', 'countries', 'attractions'].map((option) => (
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
        {selectedOption === 'countries' && geoJsonData ? (
          <MapComponent geoJSON={geoJsonData} zoom={3} />
        ) : (
          <MapComponent markers={markers} />
        )}
        {/* Data Table */}
        <div className="bg-white shadow-md p-4 rounded">
          <h2 className="text-xl font-bold mb-4">
            {selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)}{' '}
            Data
          </h2>
          <DataTable
            columns={columns}
            data={data}
            onSort={(sortBy, sortOrder) => {
              console.log(
                `Sorting ${selectedOption} by ${sortBy} in ${sortOrder} order`
              );
              // Add sorting logic if needed
            }}
          />
          {hasPageProperty && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
