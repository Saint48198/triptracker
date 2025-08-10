/**
 * API Route: /api/photos/add/[entityType]/[entityId]
 *
 * This service handles adding photos for a specific entity (either a city or an attraction).
 *
 * - Validates the `entityType` and `entityId` query parameters.
 * - Adds a new photo associated with the specified entity to the database.
 * - Returns a success message and the ID of the newly added photo.
 *
 * Query Parameters:
 * - `entityType`: The type of entity (either 'cities' or 'attractions').
 * - `entityId`: The ID of the entity.
 *
 * Request Body:
 * - `url`: The URL of the photo (required).
 * - `userId`: The ID of the user adding the photo (required).
 * - `caption`: An optional caption for the photo.
 *
 * Response:
 * - 201: Success, returns a message and the ID of the newly added photo.
 * - 400: Bad Request, invalid entity type, ID, or missing required fields.
 * - 405: Method Not Allowed, invalid HTTP method.
 * - 500: Internal Server Error, error adding the photo.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/database/db';
import { handleApiError } from '@/utils/errorHandler';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { entityType, entityId } = req.query;

  if (
    !entityType ||
    !entityId ||
    typeof entityType !== 'string' ||
    isNaN(Number(entityId))
  ) {
    return res.status(400).json({ error: 'Invalid entityType or entityId' });
  }

  if (!['cities', 'attractions'].includes(entityType)) {
    return res.status(400).json({
      error: 'Invalid entityType. Must be "cities" or "attractions".',
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const column = entityType === 'cities' ? 'city_id' : 'attraction_id';

  try {
    const { url, userId, caption } = req.body;

    if (!url || !userId) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: url or userId.' });
    }

    const insert = db
      .prepare(
        `
        INSERT INTO photos (url, user_id, ${column}, caption)
        VALUES (?, ?, ?, ?)
      `
      )
      .run(url, userId, Number(entityId), caption || null);

    return res.status(201).json({
      message: 'Photo added successfully.',
      id: insert.lastInsertRowid,
    });
  } catch (error) {
    return handleApiError(error, res, 'Failed to add photo');
  }
}
