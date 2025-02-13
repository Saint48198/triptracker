import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import db from '../../../database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is missing' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      username: string;
      email: string;
      roles: string[];
    };

    // Check if the token exists in the database
    const tokenExists = db
      .prepare(`SELECT COUNT(*) AS count FROM user_tokens WHERE token = ?`)
      .get(token);

    if (!tokenExists || tokenExists.count === 0) {
      return res.status(401).json({ error: 'Invalid or revoked token' });
    }

    return res.status(200).json({ valid: true, user: decoded });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
