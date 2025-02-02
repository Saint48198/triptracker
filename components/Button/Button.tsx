'use client';

import React from 'react';
import styles from './Button.module.scss';

// Define the prop types for the Button component
interface ButtonProps {
  children: React.ReactNode; // Any valid React node (string, JSX, etc.)
  onClick?: () => void; // Optional click handler
  buttonType?: 'button' | 'submit' | 'reset'; // Optional button type
  isDisabled?: boolean; // Optional disabled state
  styleType?: 'primary' | 'secondary' | 'neutral' | 'danger' | 'text'; // Optional style type
  ariaLabel?: string;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  buttonType = 'submit',
  isDisabled = false,
  styleType = 'primary',
  ariaLabel,
  className = '',
}) => {
  return (
    <button
      type={buttonType}
      onClick={onClick}
      className={`${styles.button} ${styles[styleType]} $${className}`}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-disabled={isDisabled}
      role="button"
    >
      {children}
    </button>
  );
};

export default Button;
