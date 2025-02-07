import './globals.scss';
import { ReactNode } from 'react';
import { ModalProvider } from '@/components/Modal/ModalContext';

export const metadata = {
  title: 'Trip Tracker',
  description: 'Track your trips efficiently!',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ModalProvider>{children}</ModalProvider>
      </body>
    </html>
  );
}
