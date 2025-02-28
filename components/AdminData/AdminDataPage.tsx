'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Pagination from '@/components/Pagination/Pagination';
import Message from '@/components/Message/Message';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import DataTable from '@/components/DataTable/DataTable';
import Button from '@/components/Button/Button';
import FormSelect from '@/components/FormSelect/FormSelect';
import styles from './AdminDataPage.module.scss';
import { FilterOption } from '@/components/FilterBy/FilterBy.types';
import { DataPageProps } from '@/types/AdminTypes';
import ConfirmAction from '@/components/ConfirmAction/ConfirmAction';
import { useModal } from '@/components/Modal/ModalContext';
import Link from 'next/link'; // Use the modal context

export default function DataPage({
  entity,
  entities,
  title,
  fetchDataAction,
  fetchFiltersAction,
  columns,
  filterLabel,
  filterKey,
  action,
}: DataPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openModal, closeModal } = useModal();

  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterOption[]>([]);
  const [filterValue, setFilterValue] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('');
  const [sort, setSort] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');
  const [loading, setLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFiltersData = useCallback(async () => {
    if (!fetchFiltersAction || !hydrated) return;
    const data = await fetchFiltersAction();
    setFilters(data);
  }, [fetchFiltersAction, hydrated]);

  const fetchDataEntries = useCallback(async () => {
    if (!hydrated) return;
    setLoading(true);
    setMessage('');

    try {
      const query = new URLSearchParams({
        ...(filterValue && filterKey && { [filterKey]: filterValue }),
        ...(sortBy && { sortBy }),
        ...(sort && { sort }),
        page: page.toString(),
        limit: limit.toString(),
      }).toString();

      const { entries, total } = await fetchDataAction(query);
      setData(entries);
      setTotal(total);
    } catch (error) {
      setMessage('Failed to fetch data.');
      setMessageType('error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [
    hydrated,
    filterValue,
    filterKey,
    sortBy,
    sort,
    page,
    limit,
    fetchDataAction,
  ]);

  const handleDelete = async () => {
    if (!selectedItemId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/${entities}/${selectedItemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Item deleted successfully!');
        setMessageType('success');
        await fetchDataEntries();
      } else {
        setMessage('Failed to delete item.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred while deleting.');
      setMessageType('error');
      console.error(error);
    } finally {
      setIsDeleting(false);
      closeModal('confirm-action'); //  Close modal after action
      setSelectedItemId(null);
    }
  };

  const confirmDelete = async (id: string) => {
    setSelectedItemId(id);
    openModal('confirm-action');
  };

  const updatePageInUrl = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      const currentPage = Number(params.get('page')) || 1;

      if (currentPage !== newPage) {
        params.set('page', newPage.toString());
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    },
    [searchParams, router]
  );

  useEffect(() => {
    if (hydrated) {
      fetchFiltersData();
      fetchDataEntries();
    }
  }, [hydrated, fetchFiltersData, fetchDataEntries]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    setPage(Number(params.get('page')) || 1);
    setFilterValue(filterKey ? params.get(filterKey) || '' : '');
    setSortBy(params.get('sortBy') || '');
    setSort(params.get('sort') || '');
    setHydrated(true);
  }, [searchParams, filterKey]);

  if (!hydrated) {
    return (
      <>
        <Navbar />
        <main>
          <div className={styles.container}>
            <LoadingSpinner />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <div className={styles.container}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <Link href={'/admin'} className={styles.backLink}>
                Back to Admin
              </Link>
              <h1 className={styles.title}>{title}</h1>
              {message && (
                <div className={styles.messageContainer}>
                  <Message message={message} type={messageType} />
                </div>
              )}
              <div className={styles.filters}>
                {filters.length > 0 && filterLabel && filterKey && (
                  <FormSelect
                    label={filterLabel}
                    id={filterKey}
                    options={filters.map((filter: FilterOption) => ({
                      value: filter.id.toString(),
                      label: filter.label,
                    }))}
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    noValueOption={{ include: true, label: 'All' }}
                    hideLabel={true}
                  />
                )}
                <Button
                  buttonType="button"
                  styleType="secondary"
                  onClick={() => router.push(`/admin/${entity}`)}
                >
                  Add Item
                </Button>
              </div>
              <DataTable
                columns={columns}
                data={data}
                actions={(row) => action(row, confirmDelete)}
              />
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(total / limit)}
                onPageChange={updatePageInUrl}
              />
            </>
          )}
        </div>
      </main>
      <Footer />
      <ConfirmAction
        isOpen // Modal context manages visibility
        onConfirm={handleDelete}
        message="Are you sure you want to delete this item?"
        isLoading={isDeleting}
      />
    </>
  );
}
