/**
 * API Route: /api/photos/remove/[entityType]/[entityId]
 *
 * This service handles removing photos for a specific entity (either a city or an attraction).
 *
 * - Validates the `entityType` and `entityId` query parameters.
 * - Deletes the specified photo associated with the specified entity from the database.
 * - Returns a success message if the photo is removed, or an error message if the photo is not found.
 *
 * Query Parameters:
 * - `entityType`: The type of entity (either 'cities' or 'attractions').
 * - `entityId`: The ID of the entity.
 *
 * Request Body:
 * - `photoId`: The ID of the photo to be removed (required).
 *
 * Response:
 * - 200: Success, returns a message indicating the photo was removed.
 * - 400: Bad Request, invalid entity type, ID, or missing required fields.
 * - 404: Not Found, photo not found or does not belong to the specified entity.
 * - 405: Method Not Allowed, invalid HTTP method.
 * - 500: Internal Server Error, error removing the photo.
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
    return res
      .status(400)
      .json({
        error: 'Invalid entityType. Must be "cities" or "attractions".',
      });
  }

  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const column = entityType === 'cities' ? 'city_id' : 'attraction_id';

  try {
    const { photoId } = req.body;

    if (!photoId) {
      return res
        .status(400)
        .json({ error: 'Missing required field: photoId.' });
    }

    const result = db
      .prepare(
        `
        DELETE FROM photos
        WHERE id = ? AND ${column} = ?
      `
      )
      .run(photoId, Number(entityId));

    if (result.changes === 0) {
      return res
        .status(404)
        .json({ error: 'Photo not found or does not belong to this entity.' });
    }

    return res.status(200).json({ message: 'Photo removed successfully.' });
  } catch (error) {
    return handleApiError(error, res, 'Failed to remove photo');
  }
}
