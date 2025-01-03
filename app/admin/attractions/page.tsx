'use client';

import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    fetchAttractions();
    updateURL();
  }, [countryId, page, sortBy, sortOrder]);

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries');
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      setMessage('Failed to fetch countries.');
      console.error('Failed to fetch countries:', error);
    }
  };

  const fetchAttractions = async () => {
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
  };

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

  const updateURL = () => {
    const params = new URLSearchParams();
    if (countryId) params.set('country_id', countryId);
    params.set('page', page.toString());
    if (sortBy && sortOrder) {
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

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

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Attractions</h1>
        {message && <Message message={message} type="error"></Message>}
        {/* Filter */}
        <div className="flex justify-between mb-4">
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
        <div>Total: {total}</div>
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => router.push('/admin/attraction')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Attraction
          </button>
        </div>
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={attractions}
            onSort={handleSort}
            actions={(row) => (
              <>
                <button
                  onClick={() => router.push(`/admin/attraction?id=${row.id}`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAttraction(row.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
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
