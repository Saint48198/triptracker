import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // Fetch a single state by id
    try {
      const state = db
        .prepare(
          `SELECT states.id, states.name, states.abbr, countries.name as country_name 
          FROM states 
          JOIN countries ON states.country_id = countries.id
          WHERE states.id = ?`
        )
        .get(id);

      if (!state) {
        return res.status(404).json({ error: 'State not found.' });
      }

      res.status(200).json(state);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch state.' });
    }
  } else if (req.method === 'PUT') {
    // Update a state by id
    const { name, abbr, country_id } = req.body;

    if (!name || !country_id) {
      return res
        .status(400)
        .json({ error: 'Name and country_id are required.' });
    }

    try {
      const stmt = db.prepare(
        'UPDATE states SET name = ?, abbr = ?, country_id = ? WHERE id = ?'
      );
      const result = stmt.run(name, abbr || null, country_id, id);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'State not found.' });
      }

      res.status(200).json({ message: 'State updated successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update state.' });
    }
  } else if (req.method === 'DELETE') {
    // Delete a state by id
    try {
      const stmt = db.prepare('DELETE FROM states WHERE id = ?');
      const result = stmt.run(id);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'State not found.' });
      }

      res.status(200).json({ message: 'State deleted successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete state.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
