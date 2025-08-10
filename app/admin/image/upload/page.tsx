'use client';

import React, { Suspense } from 'react';
import UploadForm from './UploadForm';
import Navbar from '@/components/Navbar/Navbar';
import styles from '@/app/admin/city/CityPage.module.scss';
import AdminLocalNav from '@/components/AdminLocalNav/AdminLocalNav';
import Footer from '@/components/Footer/Footer';

function UploadPageContent() {
  return (
    <>
      <Navbar />
      <main>
        <div className={styles.container}>
          <aside>
            <AdminLocalNav currentSection={'image'} />
          </aside>
          <div className={styles.pageContent}>
            <h1>Upload Images</h1>
            <UploadForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function UploadPage() {
  return (
    <Suspense>
      <UploadPageContent />
    </Suspense>
  );
}
