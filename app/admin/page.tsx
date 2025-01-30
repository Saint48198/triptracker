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
      <main className={styles.container}>
        <h1 className={styles.title}>Admin Section</h1>
        <div className="space-y-4">
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
        </div>
      </main>
      <Footer />
    </>
  );
}
