import React from 'react';

export interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  isOpen?: boolean; // Optional prop to control opening
}
