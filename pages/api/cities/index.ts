/**
 * API Route: /api/cities
 *
 * This API route handles CRUD operations for cities.
 *
 * Methods:
 * - GET: Fetch a list of cities with optional filtering, sorting, and pagination.
 * - POST: Add a new city to the database.
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
  if (req.method === 'GET') {
    const { country_id, page = 1, limit = 25, sortBy, sort } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const order = sort === 'desc' ? 'DESC' : 'ASC';

    // Fetch all cities with their associated country and state
    try {
      // Base query
      let query = `
          SELECT cities.id, cities.name, cities.lat, cities.lng, countries.name AS country_name, states.name AS state_name
          FROM cities
          JOIN countries ON cities.country_id = countries.id
          LEFT JOIN states ON cities.state_id = states.id
      `;

      const params = [];

      // Filtering by country
      if (country_id) {
        query += ` WHERE cities.country_id = ?`;
        params.push(Number(country_id));
      }

      // Optional Sorting
      if (sortBy && sort) {
        query += ` ORDER BY ${sortBy === 'country' ? 'countries.name' : 'cities.name'} ${order}`;
      }

      // Add LIMIT and OFFSET for pagination
      query += ` LIMIT ? OFFSET ?`;
      params.push(Number(limit), offset);

      // Execute query
      const cities = db.prepare(query).all(...params);

      // Get total count for pagination
      let countQuery = `SELECT COUNT(*) as total FROM cities`;
      if (country_id) {
        countQuery += ` WHERE country_id = ?`;
      }

      const totalCount = db
        .prepare(countQuery)
        .get(...(country_id ? [Number(country_id)] : []));

      res.status(200).json({
        cities,
        total: totalCount.total,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error: unknown) {
      return handleApiError(error, res, 'Failed to fetch cities', 500);
    }
  } else if (req.method === 'POST') {
    // Add a new city
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
        'INSERT INTO cities (name, lat, lng, state_id, country_id, last_visited, wiki_term) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      stmt.run(name, lat, lng, state_id || null, country_id, last_visited);
      res.status(201).json({ message: 'City added successfully.' });
    } catch (error: unknown) {
      return handleApiError(error, res, 'Failed to add city', 500);
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
