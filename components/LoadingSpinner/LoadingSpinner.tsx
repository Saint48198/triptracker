// components/LoadingSpinner/LoadingSpinner.tsx
import React from 'react';
import styles from './LoadingSpinner.module.scss';

const LoadingSpinner: React.FC = () => {
  return (
    <div role={'status'} aria-live={'polite'} className={styles.loadingSpinner}>
      <svg
        className={styles.spinnerIcon}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className={styles.spinnerCircle}
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className={styles.spinnerPath}
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
