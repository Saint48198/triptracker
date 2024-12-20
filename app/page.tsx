'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

const MapComponent = dynamic(() => import('@/components/Map/Map'), {
  ssr: false,
});

const markers = [{ lat: 39.8283, lng: -98.5795 }];

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <MapComponent markers={markers} />
      </main>
      <Footer />
    </>
  );
}
