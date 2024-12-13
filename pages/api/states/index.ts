import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Fetch all states with their country name
    try {
      const states = db
        .prepare(
          `SELECT states.id, states.name, states.abbr, states.country_id, countries.name as country_name 
          FROM states 
          JOIN countries ON states.country_id = countries.id
          ORDER BY states.name ASC`
        )
        .all();
      res.status(200).json(states);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch states.' });
    }
  } else if (req.method === 'POST') {
    // Create a new state
    const { name, abbr, country_id } = req.body;

    if (!name || !country_id) {
      return res
        .status(400)
        .json({ error: 'Name and country_id are required.' });
    }

    try {
      const stmt = db.prepare(
        'INSERT INTO states (name, abbr, country_id) VALUES (?, ?, ?)'
      );
      stmt.run(name, abbr || null, country_id);
      res.status(201).json({ message: 'State created successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create state.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
