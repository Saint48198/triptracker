/**
 * API Route: /api/cities/[id]
 *
 * This API route handles CRUD operations for a single city identified by its ID.
 *
 * Methods:
 * - GET: Fetch details of a city by its ID.
 * - PUT: Update details of a city by its ID.
 * - DELETE: Delete a city by its ID.
 *
 * Database:
 * - Uses SQLite database to store city information.
 * - Joins with countries and states tables to fetch related data.
 *
 * Error Handling:
 * - Returns appropriate HTTP status codes and error messages for different failure scenarios.
 *
 */

import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/database/db';
import { handleApiError } from '@/utils/errorHandler';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // Fetch a single city by id
    try {
      const city = db
        .prepare(
          `SELECT cities.id, cities.name, cities.lat, cities.lng, cities.last_visited,
                  cities.country_id AS country_id,
                  countries.name AS country_name,
                  cities.state_id AS state_id,
                  states.name AS state_name,
                  cities.wiki_term
           FROM cities
                    LEFT JOIN countries ON cities.country_id = countries.id
                    LEFT JOIN states ON cities.state_id = states.id
           WHERE cities.id = ?`
        )
        .get(id);

      if (!city) {
        return res.status(404).json({ error: 'City not found.' });
      }

      res.status(200).json(city);
    } catch (error: unknown) {
      return handleApiError(error, res, 'Failed to fetch city', 500);
    }
  } else if (req.method === 'PUT') {
    // Update a city by id
    const { name, lat, lng, state_id, country_id, last_visited, wiki_term } =
      req.body;

    if (!name || !lat || !lng || !country_id) {
      return handleApiError(
        null,
        res,
        'City name, latitude, longitude, and country are required.',
        400
      );
    }

    try {
      const stmt = db.prepare(
        'UPDATE cities SET name = ?, lat = ?, lng = ?, state_id = ?, country_id = ?, last_visited = ?, wiki_term = ? WHERE id = ?'
      );
      const result = stmt.run(
        name,
        lat,
        lng,
        state_id || null,
        country_id,
        last_visited,
        wiki_term,
        id
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: 'City not found.' });
      }

      res.status(200).json({ message: 'City updated successfully.' });
    } catch (error: unknown) {
      return handleApiError(error, res, 'Failed to update city', 500);
    }
  } else if (req.method === 'DELETE') {
    // Delete a city by id
    try {
      const stmt = db.prepare('DELETE FROM cities WHERE id = ?');
      const result = stmt.run(id);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'City not found.' });
      }

      res.status(200).json({ message: 'City deleted successfully.' });
    } catch (error: unknown) {
      return handleApiError(error, res, 'Failed to delete city', 500);
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
