'use client';

import React from 'react';
import styles from './Button.module.scss';

// Define the prop types for the Button component
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  buttonType?: 'button' | 'submit' | 'reset';
  isDisabled?: boolean;
  styleType?: 'primary' | 'secondary' | 'neutral' | 'danger' | 'text';
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
