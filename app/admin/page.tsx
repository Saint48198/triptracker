'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import styles from './AdminLandingPage.module.scss';
import { Building, Earth, ImageUp, Landmark, Map, User } from 'lucide-react';

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
              <Earth className={styles.iconBackground} />
            </Link>
            <Link
              href="/admin/states"
              className={`${styles.link} ${styles.linkGreen}`}
            >
              Manage States/Provinces
              <Map className={styles.iconBackground} />
            </Link>
            <Link
              href="/admin/cities"
              className={`${styles.link} ${styles.linkYellow}`}
            >
              Manage Cities
              <Building className={styles.iconBackground} />
            </Link>
            <Link
              href="/admin/attractions"
              className={`${styles.link} ${styles.linkOrange}`}
            >
              Manage Attractions
              <Landmark className={styles.iconBackground} />
            </Link>
            <Link
              href="/admin/users"
              className={`${styles.link} ${styles.linkPurple}`}
            >
              Manage Users
              <User className={styles.iconBackground} />
            </Link>
            <Link
              href={'/admin/image/upload'}
              className={`${styles.link} ${styles.linkGray}`}
            >
              Upload Images
              <ImageUp className={styles.iconBackground} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
