'use client';

import React, { Suspense } from 'react';
import HomePageContent from './HomePageContent';

export default function Page() {
  return (
    <Suspense>
      <HomePageContent />
    </Suspense>
  );
}
