/**
 * API handler for managing countries' data.
 *
 * This handler supports the following operations:
 * - GET: Fetch a list of countries with optional sorting and pagination.
 * - POST: Create a new country entry.
 *
 * Query Parameters for GET:
 * - `page`: The page number for pagination (default: 1).
 * - `limit`: The number of items per page (default: 10).
 * - `all`: If set to 'true', fetches all countries without pagination.
 * - `sortBy`: The column to sort by (default: 'name').
 * - `sortOrder`: The order of sorting, either 'asc' or 'desc' (default: 'asc').
 *
 * Request Body for POST:
 * - `name`: The name of the country (required).
 * - `abbreviation`: The abbreviation of the country.
 * - `lat`: The latitude of the country.
 * - `lng`: The longitude of the country.
 * - `slug`: The slug for the country.
 * - `last_visited`: The last visited date for the country.
 * - `geo_map_id`: The geo map ID for the country.
 *
 * Responses:
 * - 200: Successful GET request with the list of countries.
 * - 201: Successful POST request with the ID of the created country.
 * - 400: Bad request due to invalid parameters or missing required fields.
 * - 405: Method not allowed for unsupported HTTP methods.
 * - 500: Internal server error for any other failures.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';
import { handleApiError } from '@/utils/errorHandler';

const validColumns = [
  'name',
  'abbreviation',
  'lat',
  'lng',
  'slug',
  'last_visited',
  'geo_map_id',
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const {
      page = 1,
      limit = 10,
      all,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const sortByStr = Array.isArray(sortBy) ? sortBy[0] : sortBy || 'name';
    const sortOrderStr = Array.isArray(sortOrder)
      ? sortOrder[0]
      : sortOrder || 'asc';

    if (sortBy && !validColumns.includes(sortBy as string)) {
      return handleApiError(null, res, 'Invalid sort column.', 400);
    }

    if (sortOrder && !['asc', 'desc'].includes(sortOrder as string)) {
      return handleApiError(null, res, 'Invalid sort order.', 400);
    }

    try {
      if (all === 'true') {
        const countries = db
          .prepare(
            `SELECT * FROM countries ORDER BY ${sortByStr} ${sortOrderStr.toUpperCase()}`
          )
          .all();
        res.status(200).json({ total: countries.length, countries });
      } else {
        const offset = (Number(page) - 1) * Number(limit);
        const total = db
          .prepare('SELECT COUNT(*) AS count FROM countries')
          .get().count;
        const countries = db
          .prepare(
            `SELECT * FROM countries ORDER BY ${sortByStr} ${sortOrderStr.toUpperCase()} LIMIT ? OFFSET ?`
          )
          .all(Number(limit), offset);
        res.status(200).json({ total, countries, page, limit });
      }
    } catch (error: unknown) {
      return handleApiError(error, res, 'Failed to fetch countries.');
    }
  } else if (req.method === 'POST') {
    const { name, abbreviation, lat, lng, slug, last_visited, geo_map_id } =
      req.body;

    if (!name) {
      return handleApiError(null, res, 'Name is required.', 400);
    }

    try {
      const result = db
        .prepare(
          'INSERT INTO countries (name, abbreviation, lat, lng, slug, last_visited, geo_map_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )
        .run(name, abbreviation, lat, lng, slug, last_visited, geo_map_id);
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error: unknown) {
      return handleApiError(error, res, 'Failed to create country.');
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
