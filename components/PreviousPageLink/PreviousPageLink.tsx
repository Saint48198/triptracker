'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './PreviousPageLink.module.scss';

interface PreviousPageLinkProps {
  defaultHref?: string;
  className?: string;
  variant?: 'button' | 'link'; // Added option for button or link style
}

const PreviousPageLink: React.FC<PreviousPageLinkProps> = ({
  defaultHref = '/',
  className,
  variant = 'button',
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hoverUrl, setHoverUrl] = useState<string>('');

  useEffect(() => {
    const params = searchParams ? searchParams.toString() : '';
    let fallbackUrl = defaultHref;

    if (
      document.referrer &&
      new URL(document.referrer).origin === window.location.origin
    ) {
      fallbackUrl = document.referrer;
    } else if (params) {
      fallbackUrl = `${defaultHref}?${params}`;
    }

    setHoverUrl(document.referrer ? document.referrer : fallbackUrl);
  }, [searchParams, defaultHref]);

  const handleGoBack = () => {
    router.back();
  };

  return (
    <button
      onClick={handleGoBack}
      className={
        className || (variant === 'link' ? styles.link : styles.button)
      }
      title={hoverUrl} // Tooltip on hover for accessibility
      aria-label={`Go back to ${hoverUrl}`}
      onMouseEnter={() =>
        setHoverUrl(document.referrer ? document.referrer : hoverUrl)
      }
    >
      ← Previous Page
    </button>
  );
};

export default PreviousPageLink;
