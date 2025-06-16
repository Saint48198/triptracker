import React from 'react';
import styles from './ProgressBar.module.scss';

export const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <div className={styles.progressBar}>
      <div className={styles.progress} style={{ width: `${progress}%` }}></div>
    </div>
  );
};
