'use client';

import React from 'react';
import Link from 'next/link';
import styles from './AdminLocalNav.module.scss';
import {
  ENTITY_TYPE_ATTRACTION,
  ENTITY_TYPE_CITY,
  ENTITY_TYPE_COUNTRY,
  ENTITY_TYPE_STATE,
} from '@/constants';
import usePreviousUrl from '@/hooks/usePreviousUrl';

interface LocalNavProps {
  currentSection:
    | typeof ENTITY_TYPE_ATTRACTION
    | typeof ENTITY_TYPE_CITY
    | typeof ENTITY_TYPE_STATE
    | typeof ENTITY_TYPE_COUNTRY
    | 'image';
}

const AdminLocalNav: React.FC<LocalNavProps> = ({ currentSection }) => {
  const { goBack } = usePreviousUrl();

  return (
    <nav className={styles.localNav}>
      <Link
        href="#"
        onClick={(e) => {
          e.preventDefault();
          goBack();
        }}
        className={styles.backButton}
      >
        Back
      </Link>
      <ul className={styles.navList}>
        <li className={currentSection === 'attraction' ? styles.active : ''}>
          <Link href="/admin/attractions">Attractions</Link>
        </li>
        <li>
          <Link href={`/admin/attraction`}>Add Attraction</Link>
        </li>
        <li className={currentSection === 'city' ? styles.active : ''}>
          <Link href="/admin/cities">Cities</Link>
        </li>
        <li>
          <Link href={`/admin/city`}>Add City</Link>
        </li>
        <li className={currentSection === 'state' ? styles.active : ''}>
          <Link href="/admin/states">States</Link>
        </li>
        <li>
          <Link href={`/admin/state`}>Add State</Link>
        </li>
        <li className={currentSection === 'country' ? styles.active : ''}>
          <Link href="/admin/countries">Countries</Link>
        </li>
        <li>
          <Link href={`/admin/country`}>Add Country</Link>
        </li>
        <li>
          <Link href={`/admin/image/upload`}>Upload Images</Link>
        </li>
      </ul>
    </nav>
  );
};

export default AdminLocalNav;
