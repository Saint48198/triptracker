'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './UserMenu.module.scss';
import { User } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@headlessui/react';
import LocationButton from '@/components/LocationButton/LocationButton';
import Modal from '@/components/Modal/Modal';
import { useModal } from '@/components/Modal/ModalContext';
import MessageForm from '@/components/MessageForm/MessageForm';

interface UserMenuProps {
  user: User | null;
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const { openModal, closeModal, isOpen } = useModal();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Control dropdown visibility
  const menuRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [checkInId, setCheckInId] = useState<number | null>(null);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/?view=cities&page=1');
      } else {
        console.error('Failed to logout');
      }
    } catch (error) {
      console.error('An error occurred during logout', error);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      modalRef.current &&
      !modalRef.current.contains(event.target as Node)
    ) {
      setIsMenuOpen(false);
      closeModal('checkInModal');
    }
  };

  const handleLocationClick = (checkInId: number) => {
    console.log(checkInId);
    setCheckInId(checkInId);
    openModal('checkInModal');
  };

  const handleSubmitMessage = async (message: string) => {
    if (!message.trim()) return;
    console.log(checkInId);
    try {
      await fetch('/api/check-ins/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id, message: message, checkInId }),
      });
      closeModal('checkInModal');
    } catch (error) {
      console.error('Failed to submit message');
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className={styles.menu} ref={menuRef}>
        {/* Toggle dropdown manually */}
        <button
          className={styles.menuButton}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Image
            src="/img/icon-plane.webp"
            alt={user?.name || 'User'}
            className={styles.avatar}
            width={18}
            height={18}
          />
        </button>

        {/* Dropdown opens based on state */}
        {isMenuOpen && (
          <div className={styles.menuDropdown}>
            <Link className={styles.menuItem} href={'/about'}>
              About
            </Link>
            <Link className={styles.menuItem} href={'/check-ins?id=2'}>
              Current Locations
            </Link>
            {user ? (
              <>
                <Link className={styles.menuItem} href={'/admin'}>
                  Admin
                </Link>
                <LocationButton
                  userId={Number(user.id)}
                  className={styles.menuItem}
                  onClick={handleLocationClick}
                />
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
      </div>
      {isOpen('checkInModal') && (
        <Modal id="checkInModal" title="Message for Your Check-In">
          <div ref={modalRef}>
            <MessageForm onSubmit={handleSubmitMessage} />
          </div>
        </Modal>
      )}
    </>
  );
}
