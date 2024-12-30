import React from 'react';

interface MessageProps {
  message: string;
  type: 'success' | 'error' | '';
}

const Message: React.FC<MessageProps> = ({ message, type }) => {
  if (!message) return null;

  const messageClass =
    type === 'success'
      ? 'text-green-700 bg-green-100 border-green-400'
      : 'text-red-700 bg-red-100 border-red-400';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`mb-4 p-4 border rounded ${messageClass}`}
    >
      {message}
    </div>
  );
};

export default Message;
