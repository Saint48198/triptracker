import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getCheckIns(req, res);
  } else if (req.method === 'DELETE') {
    return deleteCheckIn(req, res);
  } else {
    return res
      .setHeader('Allow', ['GET', 'DELETE'])
      .status(405)
      .end(`Method ${req.method} Not Allowed`);
  }
}

// 🔹 Fetch All Check-Ins (Optional: Filter by userId)
async function getCheckIns(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query; // Can be undefined

  try {
    let query = 'SELECT * FROM user_locations ORDER BY created_at DESC';
    let params: any[] = [];

    if (userId) {
      query =
        'SELECT * FROM user_locations WHERE user_id = ? ORDER BY created_at DESC';
      params = [userId];
    }

    const stmt = db.prepare(query);
    const checkIns = stmt.all(...params);

    return res.status(200).json({ checkIns });
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return res.status(500).json({ error: 'Failed to fetch check-in logs.' });
  }
}

// 🔹 Delete a Check-In by ID
async function deleteCheckIn(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Check-in ID is required.' });
  }

  try {
    const stmt = db.prepare('DELETE FROM check_ins WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Check-in log not found.' });
    }

    return res
      .status(200)
      .json({ message: 'Check-in log deleted successfully.' });
  } catch (error) {
    console.error('Error deleting check-in:', error);
    return res.status(500).json({ error: 'Failed to delete check-in log.' });
  }
}
