import React, { useEffect } from 'react';
import { ModalProps } from '@/types/AppTypes';

let isModalOpen = false; // Global flag to track modal state

export default function Modal({
  onClose,
  children,
  isOpen = true,
}: ModalProps) {
  useEffect(() => {
    if (isModalOpen || !isOpen) {
      onClose();
      return;
    }
    isModalOpen = true;

    return () => {
      isModalOpen = false; // Reset modal state on unmount
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-1000">
      <div className="bg-white rounded-lg shadow-lg p-6 relative max-h-[80vh]">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
        >
          &times;
        </button>
        <div className="max-h-dvh">{children}</div>
      </div>
    </div>
  );
}
