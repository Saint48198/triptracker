import './globals.scss';
import { ReactNode } from 'react';
import { ModalProvider } from '@/components/Modal/ModalContext';
import styles from './layout.module.scss';

export const metadata = {
  title: 'Trip Tracker',
  description: 'Track your trips efficiently!',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ModalProvider>
          <div className={styles.wrapper}>{children}</div>
        </ModalProvider>
      </body>
    </html>
  );
}
