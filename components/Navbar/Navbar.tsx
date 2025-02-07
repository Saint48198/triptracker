'use client';

import { useEffect, useState } from 'react';
import styles from './Navbar.module.scss';
import Link from 'next/link';
import { User } from '@/types/UserTypes';
import UserMenu from '@/components/UserMenu/UserMenu';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchAuthStatus() {
      const response = await fetch('/api/auth/validate-session', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(!!data.user);
        setUser(data.user);
      } else {
        setIsLoggedIn(false);
      }
    }
    fetchAuthStatus();
  }, []);

  return (
    <header className={styles.containerNavbar}>
      <div className={styles.navbarWrapper}>
        <div className={styles.navbarContent}>
          <div className={styles.navbarTitle}>
            <h1>
              <Link href={'/'}>TravelTracker</Link>
            </h1>
          </div>
          <div className="hidden md:block">
            <UserMenu user={user} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
