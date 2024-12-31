import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';

const getAttractionById = (id: string) => {
  return db
    .prepare(
      `SELECT attractions.id, attractions.name, attractions.is_unesco, attractions.is_national_park,
              attractions.lat, attractions.lng, attractions.last_visited, attractions.wiki_term, countries.id as country_id
       FROM attractions
                JOIN countries ON attractions.country_id = countries.id
       WHERE attractions.id = ?`
    )
    .get(id);
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID format.' });
  }

  if (req.method === 'GET') {
    // Fetch a single attraction by ID
    try {
      const attraction = getAttractionById(id);

      if (!attraction) {
        return res.status(404).json({ error: 'Attraction not found.' });
      }

      res.status(200).json(attraction);
    } catch (error) {
      console.error('Failed to fetch attraction:', error);
      res.status(500).json({ error: 'Failed to fetch attraction.' });
    }
  } else if (req.method === 'PUT') {
    // Update an attraction by ID
    const {
      name,
      country_id,
      is_unesco,
      is_national_park,
      lat,
      lng,
      last_visited,
      wiki_term,
    } = req.body;

    if (!name || !country_id || !lat || !lng) {
      return res.status(400).json({
        error: 'Name, country_id, latitude, and longitude are required.',
      });
    }

    try {
      const stmt = db.prepare(
        `UPDATE attractions
         SET name = ?, country_id = ?, is_unesco = ?, is_national_park = ?, lat = ?, lng = ?, last_visited = ?, wiki_term = ?
         WHERE id = ?`
      );

      const result = stmt.run(
        name,
        Number(country_id),
        is_unesco ? 1 : 0, // Convert boolean to integer
        is_national_park ? 1 : 0, // Convert boolean to integer
        parseFloat(lat), // Convert latitude to a float
        parseFloat(lng), // Convert longitude to a float
        last_visited || null, // Convert empty or undefined values to null
        wiki_term,
        id
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Attraction not found.' });
      }

      res.status(200).json({ message: 'Attraction updated successfully.' });
    } catch (error) {
      console.error('Failed to update attraction:', error);
      res.status(500).json({ error: 'Failed to update attraction.' });
    }
  } else if (req.method === 'DELETE') {
    // Delete an attraction by ID
    try {
      const stmt = db.prepare(`DELETE FROM attractions WHERE id = ?`);
      const result = stmt.run(id);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Attraction not found.' });
      }

      res.status(200).json({ message: 'Attraction deleted successfully.' });
    } catch (error) {
      console.error('Failed to delete attraction:', error);
      res.status(500).json({ error: 'Failed to delete attraction.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
