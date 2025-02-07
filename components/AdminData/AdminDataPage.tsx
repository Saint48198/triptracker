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
import { useModal } from '@/components/Modal/ModalContext'; // Use the modal context

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

  const [data, setData] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterOption[]>([]);
  const [filterValue, setFilterValue] = useState(
    searchParams?.get(filterKey) || ''
  );
  const [page, setPage] = useState(Number(searchParams?.get('page')) || 1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState(searchParams?.get('sortBy') || '');
  const [sort, setSort] = useState(searchParams?.get('sort') || '');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');
  const [loading, setLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFiltersData = useCallback(async () => {
    const data = await fetchFiltersAction();
    setFilters(data);
  }, [fetchFiltersAction]);

  const fetchDataEntries = useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const query = new URLSearchParams({
        ...(filterValue && { [filterKey]: filterValue }),
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
  }, [filterValue, filterKey, sortBy, sort, page, limit, fetchDataAction]);

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
      closeModal(); // ✅ Close modal after action
      setSelectedItemId(null);
    }
  };

  const handleNavToDetail = (id: string) => {
    router.push(`/admin/${entity}?id=${id}`);
  };

  const confirmDelete = async (id: string) => {
    setSelectedItemId(id);
    openModal();
  };

  const fetchData = useCallback(async () => {
    await fetchFiltersData();
    await fetchDataEntries();
  }, [fetchFiltersData, fetchDataEntries]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <h1 className={styles.title}>{title}</h1>
        {message && <Message message={message} type={messageType} />}
        <div className={styles.flexBetween}>
          <FormSelect
            label={filterLabel}
            id={filterKey}
            options={filters.map((filter: FilterOption) => ({
              value: filter.id.toString(),
              label: filter.name,
            }))}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            noValueOption={{ include: true, label: 'All' }}
            hideLabel={true}
          />
          <Button
            buttonType="button"
            styleType="secondary"
            onClick={() => router.push(`/admin/${entity}`)}
          >
            Add Item
          </Button>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className={styles.overflowXAuto}>
            <DataTable
              columns={columns}
              data={data || []}
              actions={(row) => action(row, confirmDelete, handleNavToDetail)}
            />
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(total / limit)}
              onPageChange={setPage}
            />
          </div>
        )}
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
