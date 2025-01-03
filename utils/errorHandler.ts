// utils/errorHandler.ts
import { NextApiResponse } from 'next';

export function handleApiError(
  err: unknown,
  res: NextApiResponse,
  message: string
) {
  if (err instanceof Error) {
    return res.status(400).json({ error: message, details: err.message });
  }
  return res.status(400).json({ error: message, details: 'Unknown error' });
}
