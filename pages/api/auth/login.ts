import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { generateToken } from '@/utils/jwt';
import db from '../../../database/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: 'Username and password are required' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [
      username,
    ]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = generateToken({ id: user.id, roles: user.roles });

    res.setHeader(
      'Set-Cookie',
      `token=${token}; HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Strict`
    );

    res.status(200).json({
      user: { id: user.id, username: user.username, roles: user.roles },
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: 'Internal Server Error', details: error.message });
  }
}
