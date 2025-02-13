import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Get token from request headers or cookies
  const token =
    req.headers.authorization?.split(' ')[1] || req.cookies.auth_token;

  if (!token) {
    return res.status(400).json({ error: 'Token missing' });
  }

  // Delete the token from the database
  const result = db
    .prepare(`DELETE FROM user_tokens WHERE token = ?`)
    .run(token);

  if (result.changes === 0) {
    return res.status(400).json({ error: 'Invalid or already logged out' });
  }

  // Clear auth cookie
  res.setHeader('Set-Cookie', `auth_token=; HttpOnly; Path=/; Max-Age=0`);

  res.status(200).json({ message: 'Logout successful' });
}
