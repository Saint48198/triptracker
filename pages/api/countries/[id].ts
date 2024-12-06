import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const country = db.prepare('SELECT * FROM countries WHERE id = ?').get(id);
    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }
    return res.status(200).json(country);
  }

  if (req.method === 'PUT') {
    const { name, abbreviation } = req.body;
    const result = db
      .prepare('UPDATE countries SET name = ?, abbreviation = ? WHERE id = ?')
      .run(name, abbreviation, id);
    return res.status(200).json({ changes: result.changes });
  }

  if (req.method === 'DELETE') {
    const result = db.prepare('DELETE FROM countries WHERE id = ?').run(id);
    return res.status(200).json({ changes: result.changes });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
