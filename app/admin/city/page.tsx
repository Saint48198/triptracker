'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ENTITY_TYPE_CITY, ENTITY_TYPE_CITIES } from '@/constants';

const AdminDetailPage = dynamic(
  () => import('@/components/AdminDetail/AdminDetailPage'),
  {
    ssr: false,
  }
);

function CityPageContent() {
  return (
    <AdminDetailPage entity={ENTITY_TYPE_CITY} entities={ENTITY_TYPE_CITIES} />
  );
}

export default function CityPage() {
  return (
    <Suspense>
      <CityPageContent />
    </Suspense>
  );
}
