'use client';

import DataPage from '@/components/AdminData/AdminDataPage';
import Button from '@/components/Button/Button';
import { ENTITY_TYPE_CITIES, ENTITY_TYPE_CITY } from '@/constants';
import styles from './CitiesPage.module.scss';

export default function CitiesPage() {
  return (
    <DataPage
      entity={ENTITY_TYPE_CITY}
      entities={ENTITY_TYPE_CITIES}
      title="Cities"
      fetchDataAction={async (query: string) => {
        const response = await fetch(`/api/${ENTITY_TYPE_CITIES}?${query}`);
        const data = await response.json();

        return { entries: data[ENTITY_TYPE_CITIES], total: data.total };
      }}
      fetchFiltersAction={async () => {
        const response = await fetch('/api/countries');
        return await response.json();
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
      action={(row: { id: string }, handleDelete, handleNavToDetail) => (
        <>
          <div className={styles.actionButtons}>
            <Button
              onClick={() => handleNavToDetail(row.id)}
              buttonType="button"
              styleType="text"
            >
              Edit
            </Button>
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
