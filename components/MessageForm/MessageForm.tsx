import { useState } from 'react';
import { Button } from '@headlessui/react';
import styles from './MessageForm.module.scss';

interface MessageFormProps {
  onSubmit: (message: string) => void;
}

const MessageForm: React.FC<MessageFormProps> = ({ onSubmit }) => {
  const [messageInput, setMessageInput] = useState('');

  const handleSubmit = () => {
    if (!messageInput.trim()) return;
    onSubmit(messageInput);
    setMessageInput('');
  };

  return (
    <div className={styles.formContainer}>
      <textarea
        className={styles.textarea}
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        placeholder="Enter your message here..."
      />
      <Button
        onClick={handleSubmit}
        className={styles.submitButton}
        type="button"
      >
        Submit
      </Button>
    </div>
  );
};

export default MessageForm;
