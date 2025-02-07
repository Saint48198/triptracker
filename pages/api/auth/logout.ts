import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Clear the auth_token cookie
  res.setHeader('Set-Cookie', 'auth_token=; HttpOnly; Path=/; Max-Age=0');

  res.status(200).json({ message: 'Logout successful' });
}
