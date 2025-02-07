'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './UserMenu.module.scss';
import { User } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@headlessui/react';

interface UserMenuProps {
  user: User | null;
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); // ✅ Control dropdown visibility

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Logout successful');
        router.push('/login');
      } else {
        console.error('Failed to logout');
      }
    } catch (error) {
      console.error('An error occurred during logout', error);
    }
  };

  return (
    <div className={styles.menu}>
      {user ? (
        <>
          {/* ✅ Toggle dropdown manually */}
          <button
            className={styles.menuButton}
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          >
            <Image
              src="/img/icon-mountain.webp"
              alt={user.name || 'User'}
              className={styles.avatar}
              width={18}
              height={18}
            />
          </button>

          {/* ✅ Dropdown opens based on state */}
          {isOpen && (
            <div className={styles.menuDropdown}>
              <Link className={styles.menuItem} href={'/admin'}>
                Admin
              </Link>
              <Button className={styles.menuItem} onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </>
      ) : (
        <Button
          className={styles.menuButton}
          onClick={() => router.push('/login')}
        >
          Login
        </Button>
      )}
    </div>
  );
}
