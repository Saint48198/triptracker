import React from 'react';

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
      className={`${
        disabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-600'
      } text-white px-4 py-2 rounded ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default ActionButton;
