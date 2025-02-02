import React, { useEffect } from 'react';
import { ModalProps } from '@/types/AppTypes';
import styles from './Modal.module.scss';
import Button from '@/components/Button/Button';

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
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <Button
          ariaLabel={'Close'}
          buttonType={'button'}
          onClick={onClose}
          styleType={'text'}
          className={styles.closeButton}
        >
          &times;
        </Button>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}
