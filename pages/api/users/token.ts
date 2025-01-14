import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/utils/jwt';
import db from '@/database/db';
import { JWTPayload } from '@/types/AuthTypes';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const { auth_token } = req.cookies;
    if (!auth_token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload: JWTPayload = await verifyToken(auth_token);

    if (!payload) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch the user's access token from the database
    const query = `SELECT google_access_token FROM users WHERE id = ?`;
    const token = db.prepare(query).get(payload.id)?.google_access_token;

    if (!token) {
      return res.status(404).json({ error: 'Google access token not found' });
    }

    return res.status(200).json({ accessToken: token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
