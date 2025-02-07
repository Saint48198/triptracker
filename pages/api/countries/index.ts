import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    try {
      const total = db
        .prepare('SELECT COUNT(*) AS count FROM countries')
        .get().count;
      const countries = db
        .prepare('SELECT * FROM countries ORDER BY name ASC LIMIT ? OFFSET ?')
        .all(Number(limit), offset);
      res.status(200).json({ total, countries });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch countries.' });
    }
  } else if (req.method === 'POST') {
    const { name, abbreviation, lat, lng, slug, last_visited, geo_map_id } =
      req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    try {
      const result = db
        .prepare(
          'INSERT INTO countries (name, abbreviation, lat, lng, slug, last_visited, geo_map_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )
        .run(name, abbreviation, lat, lng, slug, last_visited, geo_map_id);
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create country.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
