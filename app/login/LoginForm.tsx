'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Message from '@/components/Message/Message';
import styles from './LoginForm.module.scss';
import Button from '@/components/Button/Button';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      });

      if (response.status === 200) {
        router.push('/'); // Redirect to the homepage or dashboard
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to login. Please try again.'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Message message={error} type={'error'}></Message>}
      <div className={styles.formGroup}>
        <label htmlFor="username" className={styles.label}>
          Username
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.input}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />
      </div>
      <Button ariaLabel={'Login'} buttonType={'submit'} styleType={'primary'}>
        Login
      </Button>
    </form>
  );
};

export default LoginForm;
