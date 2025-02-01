'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Pagination from '@/components/Pagination/Pagination';
import Message from '@/components/Message/Message';
import { Country, City } from '@/types/ContentTypes';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import styles from './CitiesPage.module.scss';
import DataTable from '@/components/DataTable/DataTable';
import Button from '@/components/Button/Button';
import FormSelect from '@/components/FormSelect/FormSelect';

export default function CitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [countryId, setCountryId] = useState(
    searchParams ? searchParams.get('country_id') || '' : ''
  );
  const [page, setPage] = useState(
    searchParams ? Number(searchParams.get('page')) || 1 : 1
  );
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState(
    searchParams ? searchParams.get('sortBy') : ''
  );
  const [sort, setSort] = useState(
    searchParams ? searchParams.get('sort') : ''
  );
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCountries = useCallback(async () => {
    const response = await fetch('/api/countries');
    const data = await response.json();
    setCountries(data);
  }, []);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    setMessage('');

    try {
      const query = new URLSearchParams({
        ...(countryId && { country_id: countryId }),
        ...(sortBy && { sortBy }),
        ...(sort && { sort }),
        page: page.toString(),
        limit: limit.toString(),
      }).toString();

      const response = await fetch(`/api/cities?${query}`);
      const data = await response.json();

      setCities(data.cities);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch cities:', error);
      setMessage('Failed to fetch cities.');
    } finally {
      setLoading(false);
    }
  }, [countryId, sortBy, sort, page, limit]);

  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (countryId) params.set('country_id', countryId);
    params.set('page', page.toString());
    if (sortBy) params.set('sortBy', sortBy);
    if (sort) params.set('sort', sort);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [countryId, page, sortBy, sort, router]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSort(sort === 'asc' ? 'desc' : 'asc'); // Toggle sorting direction
    } else {
      setSortBy(column);
      setSort('asc'); // Default to ascending when switching columns
    }
  };

  const handleCountryFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = e.target.value;
    setCountryId(selectedCountry); // Update country filter state
    setPage(1); // Reset page to 1 when the filter changes
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const totalPages = Math.ceil(total / limit);

  const handleDeleteCity = async (id: number) => {
    try {
      const response = await fetch(`/api/cities/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('City deleted successfully!');
        fetchCities();
      } else {
        setMessage('Failed to delete city.');
      }
    } catch (error) {
      console.error('Failed to delete city:', error);
      setMessage('An error occurred.');
    }
  };
  const columns = [
    { key: 'name', label: 'City Name' },
    { key: 'lat', label: 'Latitude' },
    { key: 'lng', label: 'Longitude' },
    { key: 'state_name', label: 'State' },
    { key: 'country_name', label: 'Country' },
    { key: 'last_visited', label: 'Last Visited' },
  ];

  useEffect(() => {
    const getData = async () => {
      await fetchCountries();
      await fetchCities();
      updateURL();
    };
    getData();
  }, [fetchCountries, fetchCities, updateURL, countryId, page, sortBy, sort]);

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <h1 className={styles.title}>Cities</h1>
        {message && <Message message={message} type="error"></Message>}
        <div className={styles.flexBetween}>
          <FormSelect
            label={'Filter by Country'}
            id={'countries'}
            options={countries.map((country: Country) => ({
              value: country.id.toString(),
              label: country.name,
            }))}
            value={countryId}
            onChange={handleCountryFilter}
            noValueOption={{ include: true, label: 'All Countries' }}
          ></FormSelect>
          <div className={styles.flexBetween}>
            <Button
              buttonType={'button'}
              styleType={'secondary'}
              onClick={() => router.push('/admin/city')}
            >
              Add City
            </Button>
          </div>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className={styles.overflowXAuto}>
            <DataTable
              columns={columns}
              data={cities}
              actions={(row) => (
                <>
                  <Button
                    onClick={() => router.push(`/admin/city?id=${row.id}`)}
                    buttonType={'button'}
                    styleType={'text'}
                    key={row.id + 'edit'}
                  >
                    Edit
                  </Button>
                  &nbsp;
                  <Button
                    onClick={() => handleDeleteCity(row.id)}
                    buttonType={'button'}
                    styleType={'danger'}
                    key={row.id + 'delete'}
                  >
                    Delete
                  </Button>
                </>
              )}
            ></DataTable>

            {/* Pagination Controls */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            ></Pagination>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
