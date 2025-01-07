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
    <header className={(styles.containerNavbar, 'bg-white-800')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1
              className={classNames(
                'text-4xl',
                'font-bold',
                'font-sans',
                'text-gray-800',
                styles.textBorder
              )}
            >
              <Link href={'/'}>TravelTracker</Link>
            </h1>
          </div>
          <div className="hidden md:block">
            {isLoggedIn ? (
              <div>
                <span>{user?.username}</span>
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
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
                    <Menu.Items
                      as="button"
                      className="origin-top-right absolute z-1000 right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <div className="py-1">
                        <Menu.Item as="button">
                          {({ active }) => (
                            <Link
                              href={'/admin'}
                              className={classNames(
                                active
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'text-gray-700',
                                'block px-4 py-2 text-sm'
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
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'text-gray-700',
                                'block px-4 py-2 text-sm'
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
