import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database/db';
import { Trip } from '../../components/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const trips: Trip[] = db.prepare('SELECT * FROM trips').all();
    return res.status(200).json(trips);
  }

  if (req.method === 'POST') {
    const { destination, startDate, endDate, notes } = req.body;
    const result = db
      .prepare(
        'INSERT INTO trips (destination, startDate, endDate, notes) VALUES (?, ?, ?, ?)'
      )
      .run(destination, startDate, endDate, notes);

    return res.status(201).json({ id: result.lastInsertRowid });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
