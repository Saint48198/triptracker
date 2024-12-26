import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './AdminLocalNav.module.scss';

interface LocalNavProps {
  currentSection: 'attraction' | 'city' | 'state' | 'country';
}

const AdminLocalNav: React.FC<LocalNavProps> = ({ currentSection }) => {
  const router = useRouter();

  return (
    <nav className={styles.localNav}>
      <button onClick={() => router.back()} className={styles.backButton}>
        Back
      </button>
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
      </ul>
    </nav>
  );
};

export default AdminLocalNav;
