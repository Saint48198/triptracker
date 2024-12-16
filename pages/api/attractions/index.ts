import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Fetch all attractions
    try {
      const attractions = db
        .prepare(
          `SELECT attractions.id, attractions.name, attractions.is_unesco, attractions.is_national_park,
                  attractions.lat, attractions.lng, attractions.last_visited, countries.name as country_name
           FROM attractions
           JOIN countries ON attractions.country_id = countries.id`
        )
        .all();

      res.status(200).json(attractions);
    } catch (error) {
      console.error('Failed to fetch attractions:', error);
      res.status(500).json({ error: 'Failed to fetch attractions.' });
    }
  } else if (req.method === 'POST') {
    // Add a new attraction
    const {
      name,
      country_id,
      is_unesco,
      is_national_park,
      lat,
      lng,
      last_visited,
    } = req.body;

    if (!name || !country_id || !lat || !lng) {
      return res.status(400).json({
        error: 'Name, country_id, latitude, and longitude are required.',
      });
    }

    try {
      const stmt = db.prepare(
        `INSERT INTO attractions (name, country_id, is_unesco, is_national_park, lat, lng, last_visited)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );

      // Ensure correct data types
      stmt.run(
        name,
        Number(country_id),
        is_unesco ? 1 : 0, // Convert boolean to integer
        is_national_park ? 1 : 0, // Convert boolean to integer
        parseFloat(lat), // Convert latitude to a float
        parseFloat(lng), // Convert longitude to a float
        last_visited || null // Convert empty or undefined values to null
      );

      res.status(201).json({ message: 'Attraction added successfully.' });
    } catch (error) {
      console.error('Failed to add attraction:', error);
      res.status(500).json({ error: 'Failed to add attraction.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
