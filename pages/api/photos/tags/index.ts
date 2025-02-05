import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/database/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { query } = req.query;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid query parameter' });
    }

    // Convert query to regex for wildcard matching
    const regexPattern = query
      .replace(/\*/g, '.*') // Convert * to regex wildcard
      .replace(/\?/g, '.'); // Convert ? to match single character
    const regex = new RegExp(`^${regexPattern}$`, 'i');

    // Fetch tags from SQLite and filter with regex
    const rows = db.prepare('SELECT name FROM tags').all();
    const allTags = rows.map((row: { name: string }) => row.name);
    const filteredTags = allTags.filter((tag: string) => regex.test(tag));

    return res.status(200).json({ tags: filteredTags });
  } catch (error: unknown) {
    return res.status(500).json({
      error: 'Failed to fetch tags',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
