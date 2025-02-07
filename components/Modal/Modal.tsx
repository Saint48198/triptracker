import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ModalProps } from '@/types/AppTypes';
import styles from './Modal.module.scss';
import Button from '@/components/Button/Button';
import { useModal } from '@/components/Modal/ModalContext';

export default function Modal({ children, title }: ModalProps) {
  const { isOpen, closeModal } = useModal();
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className={styles.modalOverlay} onClose={closeModal}>
        <div className={styles.modalWrapper}>
          <div
            className={`${styles.modalContent} transition-transform duration-300 ease-out scale-95 opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100`}
          >
            {title && <h2 className={styles.modalTitle}>{title}</h2>}
            <Button
              ariaLabel="Close"
              buttonType="button"
              onClick={closeModal}
              styleType="text"
              className={styles.closeButton}
            >
              &times;
            </Button>
            <div className={styles.modalBody}>{children}</div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
