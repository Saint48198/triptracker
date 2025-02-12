'use client';

import DataPage from '@/components/AdminData/AdminDataPage';
import Button from '@/components/Button/Button';
import { ENTITY_TYPE_STATES, ENTITY_TYPE_STATE } from '@/constants';
import styles from './StatesPage.module.scss';
import Link from 'next/link';
import ActionButtons from '@/components/AdminData/ActionButtons';

export default function CountriesPage() {
  return (
    <DataPage
      entity={ENTITY_TYPE_STATE}
      entities={ENTITY_TYPE_STATES}
      title="States"
      fetchDataAction={async (query: string) => {
        const response = await fetch(`/api/${ENTITY_TYPE_STATES}?${query}`);
        const data = await response.json();
        return { entries: data[ENTITY_TYPE_STATES], total: data.total };
      }}
      columns={[
        { key: 'name', label: 'State Name' },
        { key: 'abbr', label: 'Abbreviation' },
        { key: 'country_name', label: 'Country' },
        { key: 'last_visited', label: 'Last Visited' },
      ]}
      action={(row: { id: string }, handleDelete) => (
        <ActionButtons
          row={row}
          handleDelete={handleDelete}
          entity={ENTITY_TYPE_STATE}
        />
      )}
    />
  );
}
