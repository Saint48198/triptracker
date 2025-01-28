'use client';

import React from 'react';
import styles from './Button.module.scss';

// Define the prop types for the Button component
interface ButtonProps {
  children: React.ReactNode; // Any valid React node (string, JSX, etc.)
  onClick?: () => void; // Optional click handler
}

const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button onClick={onClick} className={styles.button}>
      {children}
    </button>
  );
};

export default Button;
