'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar/Navbar';
import { Country } from '@/components/types';
import Footer from '@/components/Footer/Footer';

const MapComponent = dynamic(() => import('@/components/Map/Map'), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <MapComponent lat={39.8283} lng={-98.5795} />
      </main>
      <Footer />
    </>
  );
}
