import { useState } from 'react';
import styles from './ConfirmAction.module.scss';
import Message from '@/components/Message/Message';
import Button from '@/components/Button/Button';

const ConfirmAction: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  message: string;
  isLoading: boolean;
}> = ({ isOpen, onClose, onConfirm, message, isLoading }) => {
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      setError('Failed to perform action');
    }
  };

  return (
    <div
      className={`${styles.confirmActionOverlay} ${
        isOpen ? styles.visible : styles.hidden
      }`}
    >
      <div className={styles.confirmActionContainer}>
        <div className={styles.confirmActionHeader}>
          <h2>Confirm Action</h2>
        </div>
        <div className="px-6 py-4">
          {error && <Message message={error} type={'error'}></Message>}
          <p>{message}</p>
        </div>
        <div className={styles.confirmActionFooter}>
          <Button
            ariaLabel={isLoading ? 'Processing...' : 'Confirm'}
            buttonType={'button'}
            isDisabled={isLoading}
            styleType={'primary'}
            onClick={handleConfirm}
          >
            {isLoading ? 'Processing...' : 'Confirm'}
          </Button>

          <Button
            onClick={onClose}
            buttonType={'button'}
            isDisabled={isLoading}
            styleType={'secondary'}
            ariaLabel={'Cancel'}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAction;
