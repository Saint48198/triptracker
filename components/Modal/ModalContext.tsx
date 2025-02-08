'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextProps {
  isOpen: (id: string) => boolean;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [openModals, setOpenModals] = useState<{ [key: string]: boolean }>({});

  const openModal = (id: string) => {
    // Close all other modals
    setOpenModals({ [id]: true });
  };
  const closeModal = (id: string) =>
    setOpenModals((prev) => ({ ...prev, [id]: false }));
  const isOpen = (id: string) => !!openModals[id];

  return (
    <ModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
