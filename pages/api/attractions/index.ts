/**
 * API Route: /api/attractions
 *
 * This API route handles CRUD operations for attractions.
 *
 * Methods:
 * - GET: Fetch a list of attractions with optional filtering, sorting, and pagination.
 * - POST: Add a new attraction to the database.
 *
 * Query Parameters for GET:
 * - `country_id`: Filter attractions by country ID.
 * - `page`: The page number for pagination (default: 1).
 * - `limit`: The number of items per page (default: 25).
 * - `sortBy`: The column to sort by (default: 'name').
 * - `sortOrder`: The order of sorting, either 'asc' or 'desc' (default: 'asc').
 *
 * Request Body for POST:
 * - `name`: The name of the attraction (required).
 * - `country_id`: The country ID of the attraction (required).
 * - `is_unesco`: Whether the attraction is a UNESCO site.
 * - `is_national_park`: Whether the attraction is a national park.
 * - `lat`: The latitude of the attraction (required).
 * - `lng`: The longitude of the attraction (required).
 * - `last_visited`: The last visited date for the attraction.
 * - `wiki_term`: The Wikipedia term for the attraction.
 *
 * Database:
 * - Uses SQLite database to store attraction information.
 * - Joins with countries table to fetch related data.
 *
 * Responses:
 * - 200: Successful GET request with the list of attractions.
 * - 201: Successful POST request with a confirmation message.
 * - 400: Bad request due to invalid parameters or missing required fields.
 * - 405: Method not allowed for unsupported HTTP methods.
 * - 500: Internal server error for any other failures.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';
import { handleApiError } from '@/utils/errorHandler';

const validColumns = ['name', 'lat', 'lng', 'wiki_term', 'country_name'];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const {
      country_id,
      page = 1,
      limit = 25,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const sortByStr = Array.isArray(sortBy) ? sortBy[0] : sortBy;
    const sortOrderStr = Array.isArray(sortOrder) ? sortOrder[0] : sortOrder;

    if (!validColumns.includes(sortByStr)) {
      return handleApiError(null, res, 'Invalid sort column.', 400);
    }

    if (!['asc', 'desc'].includes(sortOrderStr)) {
      return handleApiError(null, res, 'Invalid sort order.', 400);
    }

    // Fetch all attractions
    try {
      let query = `
          SELECT attractions.id, attractions.name, attractions.lat, attractions.lng, attractions.wiki_term, countries.name AS country_name
          FROM attractions
                   JOIN countries ON attractions.country_id = countries.id
      `;

      const params: (string | number)[] = [];

      if (country_id) {
        query += ` WHERE attractions.country_id = ?`;
        params.push(Number(country_id));
      }

      query += ` ORDER BY ${sortByStr} ${sortOrderStr.toUpperCase()} LIMIT ? OFFSET ?`;
      params.push(Number(limit), offset);

      const attractions = db.prepare(query).all(...params);

      let countQuery = `SELECT COUNT(*) as total FROM attractions`;
      if (country_id) {
        countQuery += ` WHERE country_id = ?`;
      }

      const totalCount = db
        .prepare(countQuery)
        .get(...(country_id ? [Number(country_id)] : []));

      res.status(200).json({
        attractions,
        total: totalCount.total,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error: unknown) {
      return handleApiError(error, res, 'Failed to fetch attractions.', 500);
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
      wiki_term,
    } = req.body;

    if (!name || !country_id || !lat || !lng) {
      return handleApiError(
        null,
        res,
        'Name, country_id, latitude, and longitude are required.',
        400
      );
    }

    try {
      const stmt = db.prepare(
        `INSERT INTO attractions (name, country_id, is_unesco, is_national_park, lat, lng, last_visited, wiki_term)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      );

      // Ensure correct data types
      stmt.run(
        name,
        Number(country_id),
        is_unesco ? 1 : 0, // Convert boolean to integer
        is_national_park ? 1 : 0, // Convert boolean to integer
        parseFloat(lat), // Convert latitude to a float
        parseFloat(lng), // Convert longitude to a float
        last_visited || null, // Convert empty or undefined values to null
        wiki_term
      );

      res.status(201).json({ message: 'Attraction added successfully.' });
    } catch (error) {
      return handleApiError(error, res, 'Failed to add attraction.', 500);
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
