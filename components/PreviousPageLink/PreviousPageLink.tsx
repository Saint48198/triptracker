'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './PreviousPageLink.module.scss';

interface PreviousPageLinkProps {
  defaultHref?: string;
  className?: string;
  variant?: 'button' | 'link';
}

const PreviousPageLink: React.FC<PreviousPageLinkProps> = ({
  defaultHref = '/',
  className,
  variant = 'button',
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hoverUrl, setHoverUrl] = useState<string>(defaultHref);

  useEffect(() => {
    // Only run on client
    let fallbackUrl = defaultHref;
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const params = searchParams ? searchParams.toString() : '';
      if (
        document.referrer &&
        new URL(document.referrer).origin === window.location.origin
      ) {
        fallbackUrl = document.referrer;
      } else if (params) {
        fallbackUrl = `${defaultHref}?${params}`;
      }
    }
    setHoverUrl(fallbackUrl);
  }, [searchParams, defaultHref]);

  const handleGoBack = () => {
    router.back();
  };

  const handleMouseEnter = () => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      setHoverUrl(document.referrer || hoverUrl);
    }
  };

  return (
    <button
      onClick={handleGoBack}
      className={
        className || (variant === 'link' ? styles.link : styles.button)
      }
      title={hoverUrl}
      aria-label={`Go back to ${hoverUrl}`}
      onMouseEnter={handleMouseEnter}
    >
      ← Previous Page
    </button>
  );
};

export default PreviousPageLink;
