import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Fetch all cities with their associated country and state
    try {
      const cities = db
        .prepare(
          `SELECT cities.id, cities.name, cities.lat, cities.lng, 
                  countries.name AS country_name, 
                  states.name AS state_name
           FROM cities
           LEFT JOIN countries ON cities.country_id = countries.id
           LEFT JOIN states ON cities.state_id = states.id`
        )
        .all();

      res.status(200).json(cities);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch cities.' });
    }
  } else if (req.method === 'POST') {
    // Add a new city
    const { name, lat, lng, state_id, country_id, last_visited } = req.body;

    if (!name || !lat || !lng || !country_id) {
      return res.status(400).json({
        error: 'City name, latitude, longitude, and country are required.',
      });
    }

    try {
      const stmt = db.prepare(
        'INSERT INTO cities (name, lat, lng, state_id, country_id, last_visited) VALUES (?, ?, ?, ?, ?, ?)'
      );
      stmt.run(name, lat, lng, state_id || null, country_id, last_visited);
      res.status(201).json({ message: 'City added successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add city.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
