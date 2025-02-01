'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Message from '@/components/Message/Message';
import styles from './LoginForm.module.scss';
import Button from '@/components/Button/Button';
import FormInput from '@/components/FormInput/FormInput';

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
      <FormInput
        label={'Username'}
        id={'username'}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <FormInput
        label={'Password'}
        id={'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type={'password'}
        required
      />
      <Button buttonType={'submit'} styleType={'primary'}>
        Login
      </Button>
    </form>
  );
};

export default LoginForm;
