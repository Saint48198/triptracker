import './globals.scss';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Trip Tracker',
  description: 'Track your trips efficiently!',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
