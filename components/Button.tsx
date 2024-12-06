'use client';

import React from 'react';

// Define the prop types for the Button component
interface ButtonProps {
  children: React.ReactNode; // Any valid React node (string, JSX, etc.)
  onClick?: () => void; // Optional click handler
}

const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      {children}
    </button>
  );
};

export default Button;
