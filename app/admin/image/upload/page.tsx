import React from 'react';
import UploadForm from './UploadForm';
import Navbar from '@/components/Navbar/Navbar';
import styles from '@/app/admin/city/CityPage.module.scss';
import AdminLocalNav from '@/components/AdminLocalNav/AdminLocalNav';
import Footer from '@/components/Footer/Footer';

const UploadPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <aside>
          <AdminLocalNav currentSection={'image'} />
        </aside>
        <div className={styles.pageContent}>
          <h1>Upload Images</h1>
          <UploadForm />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default UploadPage;
