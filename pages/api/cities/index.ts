/**
 * API Route: /api/cities
 *
 * This API route handles CRUD operations for cities.
 *
 * Methods:
 * - GET: Fetch a list of cities with optional filtering, sorting, and pagination.
 * - POST: Add a new city to the database.
 *
 * Query Parameters for GET:
 * - `country_id`: Filter cities by country ID.
 * - `page`: The page number for pagination (default: 1).
 * - `limit`: The number of items per page (default: 25).
 * - `sortBy`: The column to sort by (default: 'name').
 * - `sort`: The order of sorting, either 'asc' or 'desc' (default: 'asc').
 *
 * Request Body for POST:
 * - `name`: The name of the city (required).
 * - `lat`: The latitude of the city (required).
 * - `lng`: The longitude of the city (required).
 * - `state_id`: The state ID of the city.
 * - `country_id`: The country ID of the city (required).
 * - `last_visited`: The last visited date for the city.
 * - `wiki_term`: The Wikipedia term for the city.
 *
 * Database:
 * - Uses SQLite database to store city information.
 * - Joins with countries and states tables to fetch related data.
 *
 * Responses:
 * - 200: Successful GET request with the list of cities.
 * - 201: Successful POST request with a confirmation message.
 * - 400: Bad request due to invalid parameters or missing required fields.
 * - 405: Method not allowed for unsupported HTTP methods.
 * - 500: Internal server error for any other failures.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/database/db';
import { handleApiError } from '@/utils/errorHandler';

const validColumns = [
  'cities.name',
  'lat',
  'lng',
  'country_name',
  'state_name',
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const {
      country_id,
      page = 1,
      limit = 25,
      sortBy = 'cities.name',
      sort = 'asc',
    } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let sortByStr = Array.isArray(sortBy) ? sortBy[0] : sortBy || 'cities.name';
    const sortOrderStr = Array.isArray(sort) ? sort[0] : sort || 'asc';

    if (sortByStr === 'name') {
      sortByStr = 'cities.name';
    }

    if (sortByStr && !validColumns.includes(sortByStr)) {
      return handleApiError(null, res, 'Invalid sort column.', 400);
    }

    if (sortOrderStr && !['asc', 'desc'].includes(sortOrderStr as string)) {
      return handleApiError(null, res, 'Invalid sort order.', 400);
    }

    // Fetch all cities with their associated country and state
    try {
      // Base query
      let query = `
          SELECT cities.id, cities.name, cities.lat, cities.lng, cities.last_visited, countries.name AS country_name, states.name AS state_name
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
      query += ` ORDER BY ${sortByStr} ${sortOrderStr.toUpperCase()}`;

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
      stmt.run(
        name,
        lat,
        lng,
        state_id || null,
        country_id,
        last_visited,
        wiki_term
      );
      res.status(201).json({ message: 'City added successfully.' });
    } catch (error: unknown) {
      return handleApiError(error, res, 'Failed to add city', 500);
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
