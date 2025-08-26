import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/database/db';
import { handleApiError } from '@/utils/errorHandler';

db.exec(`CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE
)`);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Invalid query parameter' });
      }

      // Convert query to regex for wildcard matching (case insensitive)
      const regexPattern = query
        .replace(/\*/g, '.*') // Convert * to regex wildcard
        .replace(/\?/g, '.'); // Convert ? to match single character
      const regex = new RegExp(regexPattern, 'i');

      // Fetch tags from SQLite and filter with regex (case insensitive)
      const rows = db.prepare('SELECT name FROM tags').all();
      const allTags = rows.map((row: { name: string }) => row.name);
      const filteredTags = allTags.filter((tag: string) => regex.test(tag));

      return res.status(200).json({ tags: filteredTags });
    } catch (error: unknown) {
      return handleApiError(error, res, 'Failed to fetch tags', 500);
    }
  }

  if (req.method === 'POST') {
    try {
      const { tags } = req.body;
      if (!Array.isArray(tags) || tags.length === 0) {
        return res.status(400).json({ error: 'Invalid tags data' });
      }

      const insertStmt = db.prepare(
        'INSERT OR IGNORE INTO tags (name) VALUES (?)'
      );
      const insertTransaction = db.transaction(() => {
        tags.forEach((tag: string) => insertStmt.run(tag));
      });
      insertTransaction();

      return res.status(200).json({ message: 'Tags added successfully' });
    } catch (error: unknown) {
      return handleApiError(error, res, 'Failed to add tags', 500);
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
