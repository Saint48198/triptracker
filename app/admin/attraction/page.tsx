'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ENTITY_TYPE_ATTRACTION, ENTITY_TYPE_ATTRACTIONS } from '@/constants';

const AdminDetailPage = dynamic(
  () => import('@/components/AdminDetail/AdminDetailPage'),
  { ssr: false }
);

function AttractionPageContent() {
  return (
    <AdminDetailPage
      entity={ENTITY_TYPE_ATTRACTION}
      entities={ENTITY_TYPE_ATTRACTIONS}
    />
  );
}

export default function AttractionPage() {
  return (
    <Suspense>
      <AttractionPageContent />
    </Suspense>
  );
}
