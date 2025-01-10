import React from 'react';

const LinkGoogleAccountButton: React.FC = () => {
  const handleGoogleLinking = () => {
    window.location.href = '/api/google/auth'; // Step 2 starts here
  };

  return (
    <button
      onClick={handleGoogleLinking}
      type={'button'}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Link Google Account
    </button>
  );
};

export default LinkGoogleAccountButton;
