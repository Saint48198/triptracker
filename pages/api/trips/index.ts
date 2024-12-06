import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const trips = db
      .prepare(
        'SELECT trips.*, countries.name as country FROM trips JOIN countries ON trips.countryId = countries.id'
      )
      .all();
    return res.status(200).json(trips);
  }

  if (req.method === 'POST') {
    const { destination, startDate, endDate, notes, countryId } = req.body;
    const result = db
      .prepare(
        'INSERT INTO trips (destination, startDate, endDate, notes, countryId) VALUES (?, ?, ?, ?, ?)'
      )
      .run(destination, startDate, endDate, notes, countryId);
    return res.status(201).json({ id: result.lastInsertRowid });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
