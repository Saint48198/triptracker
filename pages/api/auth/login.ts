import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { verifyUser } from '@/utils/verifyUser';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username, password } = req.body;
  const { user, error, details } = await verifyUser(username, password);

  if (error) {
    return res
      .status(error === 'Internal Server Error' ? 500 : 400)
      .json({ error, details });
  }

  if (user) {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.setHeader('Set-Cookie', [
      serialize('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      }),
    ]);

    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
}
