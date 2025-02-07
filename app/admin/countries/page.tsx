'use client';

import DataPage from '@/components/AdminData/AdminDataPage';
import Button from '@/components/Button/Button';
import { ENTITY_TYPE_COUNTRIES, ENTITY_TYPE_COUNTRY } from '@/constants';
import styles from './CountriesPage.module.scss';
import Link from 'next/link';

export default function CountriesPage() {
  return (
    <DataPage
      entity={ENTITY_TYPE_COUNTRY}
      entities={ENTITY_TYPE_COUNTRIES}
      title="Countries"
      fetchDataAction={async (query: string) => {
        const response = await fetch(`/api/${ENTITY_TYPE_COUNTRIES}?${query}`);
        const data = await response.json();
        return { entries: data[ENTITY_TYPE_COUNTRIES], total: data.total };
      }}
      columns={[
        { key: 'name', label: 'Country Name' },
        { key: 'abbreviation', label: 'Abbreviation' },
        { key: 'lat', label: 'Latitude' },
        { key: 'lng', label: 'Longitude' },
        { key: 'last_visited', label: 'Last Visited' },
      ]}
      action={(row: { id: string }, handleDelete) => (
        <>
          <div className={styles.actionButtons}>
            <Link href={`/admin/cities?id=${row.id}`}>Edit</Link>
            <Button
              onClick={() => handleDelete(row.id)}
              buttonType="button"
              styleType="danger"
            >
              Delete
            </Button>
          </div>
        </>
      )}
    />
  );
}
