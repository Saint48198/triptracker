import { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosResponse } from 'axios';
import db from '@/database/db';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME as string;
const API_KEY = process.env.CLOUDINARY_API_KEY as string;
const API_SECRET = process.env.CLOUDINARY_API_SECRET as string;

// Initialize SQLite DB
db.exec(`CREATE TABLE IF NOT EXISTS tags (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             name TEXT UNIQUE
         )`);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let nextCursor: string | null = null;
    const allTags = new Set<string>();

    do {
      // Construct API URL
      const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`;
      const response: AxiosResponse = await axios.post(
        url,
        {
          expression: 'resource_type:image',
          with_field: 'tags',
          max_results: 500,
          next_cursor: nextCursor,
        },
        {
          auth: { username: API_KEY, password: API_SECRET },
        }
      );

      // Extract tags from response
      response.data.resources.forEach((asset: { tags?: string[] }) => {
        (asset.tags || []).forEach((tag: string) => allTags.add(tag));
      });

      nextCursor = response.data.next_cursor || null;
    } while (nextCursor);

    // Save unique tags to SQLite
    const insertStmt = db.prepare(
      'INSERT OR IGNORE INTO tags (name) VALUES (?)'
    );
    db.transaction(() => {
      allTags.forEach((tag: string) => insertStmt.run(tag));
    })();

    return res
      .status(200)
      .json({ message: 'Tags synced successfully', count: allTags.size });
  } catch (error: unknown) {
    return res.status(500).json({
      error: 'Failed to fetch and store tags',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
