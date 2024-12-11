import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const countries = db.prepare('SELECT * FROM countries').all();
    return res.status(200).json(countries);
  }

  if (req.method === 'POST') {
    const { name, abbreviation, lat, lng, slug } = req.body;
    const result = db
      .prepare(
        'INSERT INTO countries (name, abbreviation, lat, lng, slug) VALUES (?, ?, ?, ?, ?)'
      )
      .run(name, abbreviation, lat, lng, slug);
    return res.status(201).json({ id: result.lastInsertRowid });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
