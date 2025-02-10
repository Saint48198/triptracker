'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import styles from './AdminLandingPage.module.scss';

export default function AdminLandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className={styles.container}>
          <h1 className={styles.title}>Site Administration</h1>
          <div className={styles.adminContentContainer}>
            <Link href="/admin/countries" className={styles.link}>
              Manage Countries
            </Link>
            <Link
              href="/admin/states"
              className={`${styles.link} ${styles.linkGreen}`}
            >
              Manage States/Provinces
            </Link>
            <Link
              href="/admin/cities"
              className={`${styles.link} ${styles.linkGreen}`}
            >
              Manage Cities
            </Link>
            <Link
              href="/admin/attractions"
              className={`${styles.link} ${styles.linkPurple}`}
            >
              Manage Attractions
            </Link>
            <Link
              href="/admin/users"
              className={`${styles.link} ${styles.linkYellow}`}
            >
              Manage Users
            </Link>
            <Link
              href={'/admin/image/upload'}
              className={`${styles.link} ${styles.linkPurple}`}
            >
              Upload Images
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
