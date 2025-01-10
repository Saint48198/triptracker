import React, { useState, useEffect } from 'react';

interface LinkGoogleAccountButtonProps {
  userId: number;
  googleAccessToken: string | null;
  googleTokenExpiry: number | null;
}

const LinkGoogleAccountButton: React.FC<LinkGoogleAccountButtonProps> = ({
  userId,
  googleAccessToken,
  googleTokenExpiry,
}) => {
  const [isLinked, setIsLinked] = useState<boolean>(false);

  useEffect(() => {
    const isTokenValid =
      (googleAccessToken && new Date(googleTokenExpiry!) > new Date()) || false;
    setIsLinked(isTokenValid);
  }, [googleAccessToken, googleTokenExpiry]);

  const handleGoogleLinking = () => {
    window.location.href = '/api/google/auth'; // Step 2 starts here
  };

  const handleGoogleUnlinking = async () => {
    try {
      await fetch('/api/google/unlink-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      setIsLinked(false);
    } catch (error) {
      console.error('Error unlinking Google account:', error);
    }
  };

  return (
    <button
      onClick={isLinked ? handleGoogleUnlinking : handleGoogleLinking}
      type={'button'}
      className={`px-4 py-2 text-white rounded ${isLinked ? 'bg-red-500' : 'bg-blue-500'}`}
    >
      {isLinked ? 'Unlink Google Account' : 'Link Google Account'}
    </button>
  );
};

export default LinkGoogleAccountButton;
