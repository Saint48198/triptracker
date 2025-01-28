import React from 'react';
import styles from './ActionButton.module.scss';

interface ActionButtonProps {
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  type = 'button',
  className = '',
  disabled = false,
  onClick,
  children,
}) => {
  return (
    <button
      type={type}
      className={`${styles.actionButton} ${
        disabled ? styles.actionButtonDisabled : styles.actionButtonEnabled
      } ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default ActionButton;
