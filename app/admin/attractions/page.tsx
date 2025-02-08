'use client';

import DataPage from '@/components/AdminData/AdminDataPage';
import Button from '@/components/Button/Button';
import {
  ENTITY_TYPE_ATTRACTIONS,
  ENTITY_TYPE_ATTRACTION,
  ENTITY_TYPE_COUNTRIES,
} from '@/constants';
import styles from './AttractionsPage.module.scss';
import Link from 'next/link';

export default function AttractionsPage() {
  return (
    <DataPage
      entity={ENTITY_TYPE_ATTRACTION}
      entities={ENTITY_TYPE_ATTRACTIONS}
      title="Attractions"
      fetchDataAction={async (query: string) => {
        const response = await fetch(
          `/api/${ENTITY_TYPE_ATTRACTIONS}?${query}`
        );
        const data = await response.json();

        return { entries: data[ENTITY_TYPE_ATTRACTIONS], total: data.total };
      }}
      fetchFiltersAction={async () => {
        const response = await fetch('/api/countries?all=true');
        const data = await response.json();
        return data[ENTITY_TYPE_COUNTRIES];
      }}
      columns={[
        { key: 'name', label: 'City Name' },
        { key: 'lat', label: 'Latitude' },
        { key: 'lng', label: 'Longitude' },
        { key: 'country_name', label: 'Country' },
        { key: 'last_visited', label: 'Last Visited' },
      ]}
      filterLabel="Filter by Country"
      filterKey="country_id"
      action={(row: { id: string }, handleDelete) => (
        <>
          <div className={styles.actionButtons}>
            <Link href={`/admin/attraction?id=${row.id}`}>Edit</Link>
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
