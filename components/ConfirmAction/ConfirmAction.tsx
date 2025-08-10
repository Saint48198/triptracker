import { useState } from 'react';
import Modal from '@/components/Modal/Modal'; // Import the generic modal
import Message from '@/components/Message/Message';
import Button from '@/components/Button/Button';
import styles from './ConfirmAction.module.scss';
import { useModal } from '@/components/Modal/ModalContext';

interface ConfirmActionProps {
  isOpen: boolean;
  onClose?: () => void;
  onConfirm: () => Promise<void>;
  message: string;
  isLoading: boolean;
}

const ConfirmAction: React.FC<ConfirmActionProps> = ({
  onConfirm,
  message,
  isLoading = false,
}) => {
  const [error, setError] = useState('');
  const { closeModal } = useModal();

  const handleConfirm = async () => {
    setError('');
    try {
      await onConfirm();
      closeModal('confirm-action');
    } catch (error) {
      setError('Failed to perform action');
    }
  };

  return (
    <Modal title={'Confirm Action'} id={'confirm-action'}>
      <div className={styles.confirmActionContainer}>
        {error && <Message type="error" message={error} />}

        <p>{message}</p>

        <div className={styles.confirmActionFooter}>
          <Button
            ariaLabel={isLoading ? 'Processing...' : 'Confirm'}
            buttonType="button"
            isDisabled={isLoading}
            styleType="primary"
            onClick={handleConfirm}
          >
            {isLoading ? 'Processing...' : 'Confirm'}
          </Button>

          <Button
            onClick={() => closeModal('confirm-action')}
            buttonType="button"
            isDisabled={isLoading}
            styleType="secondary"
            ariaLabel="Cancel"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmAction;
