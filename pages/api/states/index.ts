/**
 * API Route: /api/states
 *
 * This API route handles CRUD operations for states.
 *
 * Methods:
 * - GET: Fetch a list of states with optional filtering, sorting, and pagination.
 * - POST: Add a new state to the database.
 *
 * Query Parameters for GET:
 * - `page`: The page number for pagination (default: 1).
 * - `limit`: The number of items per page (default: 10).
 * - `all`: Fetch all states without pagination if set to 'true'.
 * - `sortBy`: The column to sort by (default: 'name').
 * - `sortOrder`: The order of sorting, either 'asc' or 'desc' (default: 'asc').
 *
 * Request Body for POST:
 * - `name`: The name of the state (required).
 * - `abbr`: The abbreviation of the state.
 * - `country_id`: The country ID of the state (required).
 * - `last_visited`: The last visited date for the state.
 *
 * Database:
 * - Uses SQLite database to store state information.
 * - Joins with countries table to fetch related data.
 *
 * Responses:
 * - 200: Successful GET request with the list of states.
 * - 201: Successful POST request with a confirmation message.
 * - 400: Bad request due to invalid parameters or missing required fields.
 * - 405: Method not allowed for unsupported HTTP methods.
 * - 500: Internal server error for any other failures.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';
import { handleApiError } from '@/utils/errorHandler';

const validColumns = [
  'states.name',
  'abbr',
  'country_id',
  'last_visited',
  'country_name',
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

    let sortByStr = Array.isArray(sortBy) ? sortBy[0] : sortBy || 'states.name';
    const sortOrderStr = Array.isArray(sortOrder)
      ? sortOrder[0]
      : sortOrder || 'asc';

    if (sortByStr === 'name') {
      sortByStr = 'states.name';
    }

    if (sortByStr && !validColumns.includes(sortByStr)) {
      return handleApiError(null, res, 'Invalid sort column.', 400);
    }

    if (sortOrderStr && !['asc', 'desc'].includes(sortOrderStr)) {
      return handleApiError(null, res, 'Invalid sort order.', 400);
    }

    try {
      if (all === 'true') {
        const states = db
          .prepare(
            `SELECT states.id, states.name, states.abbr, states.country_id, states.last_visited,
                  countries.name as country_name
           FROM states
           JOIN countries ON states.country_id = countries.id
             ORDER BY ${sortByStr} ${sortOrderStr.toUpperCase()}`
          )
          .all();
        res.status(200).json({ total: states.length, states });
      } else {
        const offset = (Number(page) - 1) * Number(limit);
        const total = db
          .prepare('SELECT COUNT(*) AS count FROM states')
          .get().count;
        const states = db
          .prepare(
            `SELECT states.id, states.name, states.abbr, states.country_id, states.last_visited,
                    countries.name as country_name
             FROM states
             JOIN countries ON states.country_id = countries.id
             ORDER BY ${sortByStr} ${sortOrderStr.toUpperCase()}
             LIMIT ? OFFSET ?`
          )
          .all(Number(limit), offset);
        res.status(200).json({ total, states, page, limit });
      }
    } catch (error: unknown) {
      return handleApiError(error, res, 'Failed to fetch states.', 500);
    }
  } else if (req.method === 'POST') {
    const { name, abbr, country_id, last_visited } = req.body;

    if (!name || !country_id) {
      return handleApiError(
        null,
        res,
        'Name and country_id are required.',
        400
      );
    }

    try {
      const stmt = db.prepare(
        'INSERT INTO states (name, abbr, country_id, last_visited) VALUES (?, ?, ?, ?)'
      );
      const result = stmt.run(name, abbr || null, country_id, last_visited);
      res.status(201).json({
        message: 'State created successfully.',
        id: result.lastInsertRowid,
      });
    } catch (error: unknown) {
      return handleApiError(error, res, 'Failed to create state.', 500);
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
