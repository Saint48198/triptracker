import { NextApiRequest, NextApiResponse } from 'next';
import { isSessionValid } from '@/services/sessionService';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  const result = isSessionValid(token);

  if (!result.valid) {
    return res
      .status(401)
      .json({ error: 'Invalid session', details: result.error });
  }

  res.status(200).json({ message: 'Session is valid', user: result.decoded });
}
