import React from 'react';
import styles from './Message.module.scss';

interface MessageProps {
  message: string;
  type: 'success' | 'error' | '';
}

const Message: React.FC<MessageProps> = ({ message, type }) => {
  if (!message) return null;

  const messageClass =
    type === 'success'
      ? styles.messageSuccess
      : type === 'error'
        ? styles.messageError
        : '';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`${styles.message} ${messageClass}`}
    >
      {message}
    </div>
  );
};

export default Message;
