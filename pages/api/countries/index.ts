import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const countries = db.prepare('SELECT * FROM countries').all();
      res.status(200).json(countries);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch countries.' });
    }
  } else if (req.method === 'POST') {
    const { name, abbreviation, lat, lng, slug, last_visited } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    try {
      const result = db
        .prepare(
          'INSERT INTO countries (name, abbreviation, lat, lng, slug, last_visited) VALUES (?, ?, ?, ?, ?, ?)'
        )
        .run(name, abbreviation, lat, lng, slug, last_visited);
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create country.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
