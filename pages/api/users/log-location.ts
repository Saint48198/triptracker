import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/database/db'; // Make sure this is your database connection

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId, latitude, longitude } = req.body;

  if (!userId || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO user_locations (user_id, latitude, longitude, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `);
    stmt.run(userId, latitude, longitude);

    res.status(200).json({ message: 'Location logged successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
