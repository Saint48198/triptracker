import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';

export default async function unlinkGoogleAccount(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId in request body' });
  }

  try {
    // Update the user to clear Google tokens and credentials
    const stmt = db.prepare(`
      UPDATE users
      SET google_access_token = NULL,
          google_refresh_token = NULL,
          google_token_expiry = NULL
      WHERE id = ?
    `);

    const result = stmt.run(userId);

    if (result.changes === 0) {
      return res
        .status(404)
        .json({ error: 'User not found or already unlinked' });
    }

    return res
      .status(200)
      .json({ message: 'Google account unlinked successfully' });
  } catch (error) {
    console.error('Error unlinking Google account:', error);
    return res.status(500).json({ error: 'Failed to unlink Google account' });
  }
}
