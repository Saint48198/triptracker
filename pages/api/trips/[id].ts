import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const trip = db
      .prepare(
        'SELECT trips.*, countries.name as country FROM trips JOIN countries ON trips.countryId = countries.id WHERE trips.id = ?'
      )
      .get(id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    return res.status(200).json(trip);
  }

  if (req.method === 'PUT') {
    const { destination, startDate, endDate, notes, countryId } = req.body;
    const result = db
      .prepare(
        'UPDATE trips SET destination = ?, startDate = ?, endDate = ?, notes = ?, countryId = ? WHERE id = ?'
      )
      .run(destination, startDate, endDate, notes, countryId, id);
    return res.status(200).json({ changes: result.changes });
  }

  if (req.method === 'DELETE') {
    const result = db.prepare('DELETE FROM trips WHERE id = ?').run(id);
    return res.status(200).json({ changes: result.changes });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
