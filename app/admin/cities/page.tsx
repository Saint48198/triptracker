'use client';

import DataPage from '@/components/AdminData/AdminDataPage';
import Button from '@/components/Button/Button';
import {
  ENTITY_TYPE_CITIES,
  ENTITY_TYPE_CITY,
  ENTITY_TYPE_COUNTRIES,
} from '@/constants';
import styles from './CitiesPage.module.scss';
import Link from 'next/link';

export default function CitiesPage() {
  return (
    <DataPage
      entity={ENTITY_TYPE_CITY}
      entities={ENTITY_TYPE_CITIES}
      title="Cities"
      fetchDataAction={async (query: string) => {
        const response = await fetch(`/api/${ENTITY_TYPE_CITIES}?${query}`);
        const data = await response.json();
        console.log(data);

        return { entries: data[ENTITY_TYPE_CITIES], total: data.total };
      }}
      fetchFiltersAction={async () => {
        const response = await fetch(`/api/countries?all=true`);
        const data = await response.json();
        console.log(data);
        return data[ENTITY_TYPE_COUNTRIES];
      }}
      columns={[
        { key: 'name', label: 'City Name' },
        { key: 'lat', label: 'Latitude' },
        { key: 'lng', label: 'Longitude' },
        { key: 'state_name', label: 'State' },
        { key: 'country_name', label: 'Country' },
        { key: 'last_visited', label: 'Last Visited' },
      ]}
      filterLabel="Filter by Country"
      filterKey="country_id"
      action={(row: { id: string }, handleDelete) => (
        <>
          <div className={styles.actionButtons}>
            <Link href={`/admin/city?id=${row.id}`}>Edit</Link>
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
