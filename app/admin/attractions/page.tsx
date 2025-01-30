'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import DataTable from '@/components/DataTable/DataTable';
import { Column } from '@/components/DataTable/DataTable.types';
import Pagination from '@/components/Pagination/Pagination';
import FilterBy from '@/components/FilterBy/FilterBy';
import { FilterOption } from '@/components/FilterBy/FilterBy.types';
import Message from '@/components/Message/Message';
import { Country } from '@/types/ContentTypes';
import styles from './AttractionsPage.module.scss';
import Button from '@/components/Button/Button';

export default function AttractionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [attractions, setAttractions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [countryId, setCountryId] = useState(
    searchParams ? searchParams.get('country_id') : ''
  );
  const [page, setPage] = useState(
    searchParams && searchParams.get('page')
      ? Number(searchParams.get('page'))
      : 1
  );
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState(
    searchParams && searchParams.get('sortBy')
      ? searchParams.get('sortBy')
      : 'name'
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams && searchParams.get('sortOrder')
      ? searchParams.get('sortOrder')
      : 'asc'
  );
  const [message, setMessage] = useState('');

  const columns: Column[] = [
    { key: 'name', label: 'Name' },
    { key: 'country_name', label: 'Country' },
  ];

  const fetchCountries = useCallback(async () => {
    try {
      const response = await fetch('/api/countries');
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      setMessage('Failed to fetch countries.');
      console.error('Failed to fetch countries:', error);
    }
  }, []);

  const fetchAttractions = useCallback(async () => {
    try {
      const query = new URLSearchParams({
        ...(countryId && { country_id: countryId }),
        page: page.toString(),
        limit: limit.toString(),
        sortBy: sortBy ?? '',
        sortOrder: sortOrder ?? '',
      }).toString();

      const response = await fetch(`/api/attractions?${query}`);
      const data = await response.json();

      setAttractions(data.attractions);
      setTotal(data.total);

      // Ensure page starts from 1 if total items are less than limit and not empty
      if (data.total > 0 && data.total <= limit && page !== 1) {
        setPage(1);
      }
    } catch (error) {
      setMessage('Failed to fetch attractions.');
      console.error('Failed to fetch attractions:', error);
    }
  }, [countryId, page, limit, sortBy, sortOrder]);

  const handleDeleteAttraction = async (id: number) => {
    try {
      const response = await fetch(`/api/attractions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Attraction deleted successfully!');
        fetchAttractions();
      } else {
        setMessage('Failed to delete attraction.');
      }
    } catch (error) {
      console.error('Failed to delete attraction:', error);
      setMessage('An error occurred.');
    }
  };

  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (countryId) params.set('country_id', countryId);
    params.set('page', page.toString());
    if (sortBy && sortOrder) {
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }, [countryId, page, sortBy, sortOrder, router]);

  const handleCountryFilter = (selected: string[]) => {
    setCountryId(selected[0]);
    setPage(1); // Reset to the first page when filter changes
  };

  const handleSort = (column: string, sortOrder: 'asc' | 'desc') => {
    if (sortBy === column) {
      setSortOrder(sortOrder);
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    const getData = async () => {
      await fetchCountries();
      await fetchAttractions();
      updateURL();
    };
    getData();
  }, [
    fetchCountries,
    fetchAttractions,
    updateURL,
    countryId,
    page,
    sortBy,
    sortOrder,
  ]);

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <h1 className={styles.title}>Attractions</h1>
        {message && <Message message={message} type="error"></Message>}
        {/* Filter */}
        <div className={styles.filter}>
          <FilterBy
            options={
              countries.map((country: Country) => ({
                id: country.id.toString(),
                value: country.id.toString(),
                label: country.name,
              })) as FilterOption[]
            }
            selectedFilters={countryId ? [countryId] : []}
            onFilterChange={handleCountryFilter}
            multiple={false} // Single selection mode
            includeSelectAll={true}
            selectAllLabel="Select Country"
          />
        </div>
        <div className={styles.total}>Total: {total}</div>
        <div className={styles.actions}>
          <Button
            ariaLabel={'Add Attraction'}
            styleType={'primary'}
            onClick={() => router.push('/admin/attraction')}
            buttonType={'button'}
          >
            Add Attraction
          </Button>
        </div>
        <div className={styles.tableContainer}>
          <DataTable
            columns={columns}
            data={attractions}
            onSort={handleSort}
            actions={(row) => (
              <>
                <Button
                  ariaLabel={'Edit'}
                  styleType={'primary'}
                  onClick={() => router.push(`/admin/attraction?id=${row.id}`)}
                  buttonType={'button'}
                >
                  Edit
                </Button>
                <Button
                  ariaLabel={'Delete'}
                  styleType={'danger'}
                  onClick={() => handleDeleteAttraction(row.id)}
                  buttonType={'button'}
                >
                  Delete
                </Button>
              </>
            )}
          />
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </main>
      <Footer />
    </>
  );
}
