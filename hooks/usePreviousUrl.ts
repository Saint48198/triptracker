import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const usePreviousUrl = () => {
  const router = useRouter();
  const [previousUrl, setPreviousUrl] = useState<string | null>(null);

  // Store the current URL before navigating
  const saveCurrentUrl = () => {
    localStorage.setItem(
      'previousAdminUrl',
      window.location.pathname + window.location.search
    );
  };

  // Retrieve the stored URL on component mount
  useEffect(() => {
    const storedUrl = localStorage.getItem('previousAdminUrl');
    if (storedUrl) {
      setPreviousUrl(storedUrl);
    }
  }, []);

  // Function to handle going back to the previous URL
  const goBack = () => {
    if (previousUrl) {
      router.push(previousUrl);
    } else {
      router.back();
    }
  };

  return { saveCurrentUrl, goBack };
};

export default usePreviousUrl;
