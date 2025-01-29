import { useState } from 'react';
import { validatePassword } from '@/utils/validatePassword';
import styles from './PasswordChangeDialog.module.scss';
import Message from '@/components/Message/Message';
import Button from '@/components/Button/Button';

const PasswordChangeDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const validationError = validatePassword(password, confirmPassword);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await onSubmit(password);
      setIsLoading(false);
      onClose();
    } catch (error) {
      setError('Failed to change password');
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`${styles.passwordChangeDialog} ${
        isOpen ? '' : styles.hidden
      }`}
    >
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2 className={styles.title}>Change Password</h2>
        </div>
        <div className={styles.body}>
          {error && <Message message={error} type={'error'}></Message>}
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              New Password
            </label>
            <input
              type="password"
              id="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className={styles.footer}>
          <Button
            ariaLabel={'Cancel'}
            onClick={onClose}
            buttonType={'button'}
            isDisabled={isLoading}
            styleType={'secondary'}
          >
            Cancel
          </Button>
          <Button
            ariaLabel={'Change Password'}
            onClick={handleSubmit}
            buttonType={'button'}
            isDisabled={isLoading}
            styleType={'primary'}
          >
            {isLoading ? 'Processing...' : 'Change Password'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeDialog;
