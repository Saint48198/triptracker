'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar/Navbar';
import { Country } from '@/components/types';

interface MapComponentProps {
  countries?: Country[];
}

const MapComponent = dynamic(() => import('@/components/Map/Map'), {
  ssr: false,
});

const countries: Country[] = [
  {
    id: 1,
    name: 'France',
    abbreviation: 'FR',
    lat: 46.603354,
    lng: 1.888334,
    slug: 'france',
  },
  {
    id: 2,
    name: 'Japan',
    abbreviation: 'JP',
    lat: 36.204824,
    lng: 138.252924,
    slug: 'japan',
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <MapComponent />
    </>
  );
}
