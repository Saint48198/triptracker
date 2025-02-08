'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [isOpen, setIsOpen] = useState(false); // Control dropdown visibility
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.menu} ref={menuRef}>
      <>
        {/* Toggle dropdown manually */}
        <button
          className={styles.menuButton}
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Image
            src="/img/icon-mountain.webp"
            alt={user?.name || 'User'}
            className={styles.avatar}
            width={18}
            height={18}
          />
        </button>

        {/* Dropdown opens based on state */}
        {isOpen && (
          <div className={styles.menuDropdown}>
            <Link className={styles.menuItem} href={'/about'}>
              About
            </Link>
            {user ? (
              <>
                <Link className={styles.menuItem} href={'/admin'}>
                  Admin
                </Link>
                <Button className={styles.menuItem} onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button
                className={styles.menuItem}
                onClick={() => router.push('/login')}
              >
                Login
              </Button>
            )}
          </div>
        )}
      </>
    </div>
  );
}
