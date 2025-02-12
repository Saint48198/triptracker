'use client';

import DataPage from '@/components/AdminData/AdminDataPage';
import Button from '@/components/Button/Button';
import { ENTITY_TYPE_COUNTRIES, ENTITY_TYPE_COUNTRY } from '@/constants';
import styles from './CountriesPage.module.scss';
import Link from 'next/link';
import ActionButtons from '@/components/AdminData/ActionButtons';

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
        <ActionButtons
          row={row}
          handleDelete={handleDelete}
          entity={ENTITY_TYPE_COUNTRY}
        />
      )}
    />
  );
}
