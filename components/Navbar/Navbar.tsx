'use client';

import { Fragment, useEffect, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import styles from './Navbar.module.scss';
import Link from 'next/link';
import { User } from '@/types/UserTypes';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

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
            {isLoggedIn ? (
              <div>
                <span>{user?.username}</span>
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <Menu.Button className={styles.menuButton}>
                      Menu
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items as="button" className={styles.menuItems}>
                      <div className="py-1">
                        <Menu.Item as="button">
                          {({ active }) => (
                            <Link
                              href={'/admin'}
                              className={classNames(
                                active
                                  ? styles.menuItem + ' ' + styles.active
                                  : styles.menuItem + ' ' + styles.inactive
                              )}
                            >
                              Admin
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item as="button">
                          {({ active }) => (
                            <Link
                              href={'/trips'}
                              className={classNames(
                                active
                                  ? styles.menuItem + ' ' + styles.active
                                  : styles.menuItem + ' ' + styles.inactive
                              )}
                            >
                              Trips
                            </Link>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            ) : (
              <Link
                href={'/login'}
                className="inline-block px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-md hover:bg-blue-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
