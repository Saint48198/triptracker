'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

export default function AdminLandingPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4">
        <h1 className="text-2xl font-bold my-4">Admin Section</h1>
        <div className="space-y-4">
          <Link
            href="/admin/country"
            className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Manage Visited Countries
          </Link>
          <Link
            href="/admin/state"
            className="block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Manage Visited States/Provinces
          </Link>
          <Link
            href="/admin/trip"
            className="block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Manage Past Trips
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
