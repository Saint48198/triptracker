'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import DataTable from '@/components/DataTable/DataTable';
import Pagination from '@/components/Pagination/Pagination';
import Message from '@/components/Message/Message';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import FilterBy from '@/components/FilterBy/FilterBy';
import { FilterOption } from '@/components/FilterBy/FilterBy.types';
import { Country, State } from '@/types/ContentTypes';
import {
  ENTITY_TYPE_ATTRACTIONS,
  ENTITY_TYPE_CITIES,
  ENTITY_TYPE_COUNTRIES,
  ENTITY_TYPE_STATES,
} from '@/constants';
import styles from './HomePage.module.scss';

const MapComponent = dynamic(() => import('@/components/Map/Map'), {
  ssr: false,
});

const HomePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(
    searchParams ? Number(searchParams.get('page')) || 1 : 1
  );
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [markers, setMarkers] = useState([]);
  const [hasPageProperty, setHasPageProperty] = useState(false);
  const [zoom, setZoom] = useState(3);
  const [center, setCenter] = useState<[number, number]>([20, 0]);
  const [mapKey, setMapKey] = useState(0);

  const [mapType, setMapType] = useState(() => {
    const urlOption = searchParams ? searchParams.get('view') : null;
    return urlOption || 'cities';
  });

  const [data, setData] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
    setMapKey((prevKey) => prevKey + 1);
    if (mapType === ENTITY_TYPE_COUNTRIES || mapType === ENTITY_TYPE_STATES) {
      setMarkers([]);
    } else {
      setGeoJsonData(null);
    }

    if (mapType === ENTITY_TYPE_STATES) {
      setZoom(4);
      setCenter([37.09024, -95.712891]);
    } else {
      setZoom(3);
      setCenter([20, 0]);
    }
  }, [mapType]);

  const fetchData = useCallback(
    async (view: string, page: number, country?: string) => {
      setLoading(true);

      try {
        let url = page ? `/api/${view}?page=${page}` : `/api/${view}`;
        if (country) {
          url += `&country_id=${country}`;
        }

        const response = await fetch(url);
        const result = await response.json();

        setHasPageProperty(!!(result && result.page));
        setData(result[view] || result);
        setTotal(result.total || result.length);

        if (view === ENTITY_TYPE_COUNTRIES) {
          setCountries(countries);
        }

        if (view === ENTITY_TYPE_CITIES || view === ENTITY_TYPE_ATTRACTIONS) {
          const extractedMarkers = result[view].map((item: any) => ({
            lat: item.lat,
            lng: item.lng,
            popupText: item.name,
          }));
          setMarkers(extractedMarkers);
        } else {
          setMarkers([]);
        }
        setLoading(false);
      } catch (error) {
        console.error(`Failed to fetch ${view}:`, error);
        setMessage(`Failed to fetch ${view}.`);
        setLoading(false);
      }
    },
    [countries]
  );

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries?all=true');
      const result = await response.json();
      setCountries(result.countries);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      setMessage('Failed to fetch countries.');
    }
  };

  const fetchFilteredGeoJsonData = async (type: string) => {
    try {
      const response = await fetch(`/api/${type}?all=true`);
      const placesData = await response.json();
      const places = placesData[type];

      const geoJsonResponse = await fetch(
        type === 'countries'
          ? '/data/countries.json'
          : '/data/us_canada_states.geojson'
      );
      const geoJson = await geoJsonResponse.json();

      const filteredGeoJson = {
        ...geoJson,
        features: geoJson.features.filter((feature: any) =>
          type === 'countries'
            ? places.some(
                (country: Country) => feature.id === country.geo_map_id
              )
            : places.some(
                (state: State) => feature.properties.name === state.name
              )
        ),
      };
      setGeoJsonData(filteredGeoJson);
    } catch (error) {
      console.error('Failed to fetch filtered GeoJSON data:', error);
      setMessage('Failed to fetch filtered GeoJSON data.');
    }
  };

  const updateURL = useCallback(() => {
    const params = new URLSearchParams(
      searchParams ? searchParams.toString() : ''
    );
    params.set('view', mapType);
    params.set('page', page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }, [mapType, page, router, searchParams]);

  const columns = useMemo(() => {
    return mapType === ENTITY_TYPE_CITIES
      ? [
          { key: 'name', label: 'City Name', sortable: true },
          { key: 'state_name', label: 'State', sortable: true },
          { key: 'country_name', label: 'Country', sortable: true },
        ]
      : mapType === ENTITY_TYPE_STATES
        ? [
            { key: 'abbr', label: 'Abbr', sortable: false },
            { key: 'name', label: 'State Name', sortable: true },
            { key: 'country_name', label: 'Country', sortable: true },
          ]
        : mapType === ENTITY_TYPE_COUNTRIES
          ? [{ key: 'name', label: 'Country Name', sortable: true }]
          : [
              { key: 'name', label: 'Site Name', sortable: true },
              { key: 'country_name', label: 'Country', sortable: true },
            ];
  }, [mapType]);

  const handlePageChange = (page: number) => {
    setPage(page);
    fetchData(mapType, page);
  };

  const handleFilterChange = (selectedFilters: string[]) => {
    const newSelectedCountry = selectedFilters[0];
    setSelectedCountry(newSelectedCountry);
    setPage(1);

    if (newSelectedCountry) {
      // Find the selected country's details from the list of countries
      const selectedCountryData = countries.find(
        (country) => country.id.toString() === newSelectedCountry
      );

      if (
        selectedCountryData &&
        selectedCountryData.lat &&
        selectedCountryData.lng
      ) {
        // Update the map center
        setCenter([selectedCountryData.lat, selectedCountryData.lng]);
        setZoom(5); // Adjust the zoom level as needed
      }
    } else {
      // Reset to the default map view
      setCenter([20, 0]);
      setZoom(3);
    }

    fetchData(mapType, 1, newSelectedCountry);
  };
  const handleMapTypeChange = (type: string) => {
    setMapType(type);
    setSelectedCountry('');
    setPage(1);
  };

  const handleRowClick = (row: any) => {
    if (mapType === ENTITY_TYPE_CITIES) {
      router.push(`/cities/${row.id}`);
    } else if (mapType === ENTITY_TYPE_ATTRACTIONS) {
      router.push(`/attractions/${row.id}`);
    }
  };

  const filterOptions: FilterOption[] = countries.map((country: Country) => ({
    id: country.id.toString(),
    label: country.name,
    value: country.name,
  }));

  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    if (
      (mapType === ENTITY_TYPE_CITIES || mapType === ENTITY_TYPE_ATTRACTIONS) &&
      countries.length === 0
    ) {
      fetchCountries();
    }

    fetchData(mapType, page);
    updateURL();
    if (mapType === ENTITY_TYPE_COUNTRIES || mapType === ENTITY_TYPE_STATES) {
      fetchFilteredGeoJsonData(mapType);
    }
  }, [countries.length, fetchData, mapType, page, updateURL]);

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {message && <Message message={message} type="error"></Message>}
        <div className={styles['button-group']}>
          {[
            { value: 'cities', label: 'Cities' },
            { value: 'states', label: 'States' },
            { value: 'countries', label: 'Countries' },
            { value: 'attractions', label: 'Sites' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleMapTypeChange(option.value)}
              className={`${styles.button} ${
                mapType === option.value ? styles.active : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {(mapType === 'countries' || mapType === 'states') && geoJsonData ? (
          <MapComponent
            geoJSON={geoJsonData}
            zoom={zoom}
            centerLocation={center}
            key={mapKey}
          />
        ) : (
          <MapComponent
            markers={markers}
            centerLocation={center}
            zoom={zoom}
            key={mapKey}
          />
        )}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className={styles.content}>
            <h2 className={styles.title}>
              {mapType.charAt(0).toUpperCase() + mapType.slice(1)}
            </h2>
            {(mapType === 'cities' || mapType === 'attractions') &&
              countries &&
              countries.length > 0 && (
                <FilterBy
                  options={filterOptions}
                  selectedFilters={selectedCountry ? [selectedCountry] : []}
                  onFilterChange={handleFilterChange}
                  includeSelectAll={true}
                  selectAllLabel={'Select Country'}
                  multiple={false}
                />
              )}
            <DataTable
              columns={columns}
              data={data}
              onSort={(sortBy, sortOrder) => {
                console.log(
                  `Sorting ${mapType} by ${sortBy} in ${sortOrder} order`
                );
              }}
              onRowClick={
                mapType === ENTITY_TYPE_CITIES ||
                mapType === ENTITY_TYPE_ATTRACTIONS
                  ? (row) => handleRowClick(row)
                  : undefined
              }
            />
            {hasPageProperty && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
