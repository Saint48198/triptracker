import React, { useCallback, useEffect, useState } from 'react';
import FormInput from '@/components/FormInput/FormInput';
import Button from '@/components/Button/Button';
import Message from '@/components/Message/Message';
import styles from './WikiLookup.module.scss';
import { WikiInfo } from '@/types/ContentTypes';
import { FaSpinner } from 'react-icons/fa';

interface WikiLookupProps {
  wikiTerm: string;
  setWikiTerm: (value: string) => void;
}

export default function WikiLookup({ wikiTerm, setWikiTerm }: WikiLookupProps) {
  const [wikiInfo, setWikiInfo] = useState<WikiInfo | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');
  const [loading, setLoading] = useState(false);

  const fetchWikiArticle = useCallback(async () => {
    if (!wikiTerm) {
      setWikiInfo(null);
      setMessage('');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/info?query=${wikiTerm}`);
      if (response.ok) {
        const data: WikiInfo = await response.json();
        setWikiInfo(data);
        setMessage('');
      } else {
        setWikiInfo(null);
        setMessage('Failed to fetch Wikipedia info.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error fetching Wikipedia article:', error);
      setMessage('An error occurred while fetching Wikipedia info.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }, [wikiTerm]);

  useEffect(() => {
    fetchWikiArticle();
  }, [fetchWikiArticle]);

  return (
    <div className={styles.wikiLookup}>
      <h2>Wikipedia Info</h2>
      <FormInput
        label="Wikipedia Title"
        id="wikiTerm"
        value={wikiTerm}
        onChange={(e) => setWikiTerm(e.target.value)}
      />

      {message && <Message message={message} type={messageType} />}

      {loading ? (
        <div className={styles.loadingContainer}>
          <FaSpinner className="animate-spin mr-2" />
          Loading...
        </div>
      ) : (
        wikiInfo && (
          <div className={styles.wikiPreview}>
            <h3>{wikiInfo.title}</h3>
            <p>{wikiInfo.intro}</p>
            <a href={wikiInfo.url} target="_blank" rel="noopener noreferrer">
              Read more on Wikipedia
            </a>
          </div>
        )
      )}
    </div>
  );
}
