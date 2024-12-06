'use client';

import Button from '@/components/Button';

export default function ClientButtonWrapper() {
  return <Button onClick={() => alert('Button clicked!')}>Get Started</Button>;
}
