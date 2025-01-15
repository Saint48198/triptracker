/**
 * API Route: /api/photos/[entityType]/[entityId]
 *
 * This service handles fetching photos for a specific entity (either a city or an attraction).
 *
 * - Validates the `entityType` and `entityId` query parameters.
 * - Retrieves the photos associated with the specified entity from the database.
 * - Returns the photos in the response.
 *
 * Query Parameters:
 * - `entityType`: The type of entity (either 'cities' or 'attractions').
 * - `entityId`: The ID of the entity.
 *
 * Response:
 * - 200: Success, returns the photos associated with the entity.
 * - 400: Bad Request, invalid entity type or ID.
 * - 405: Method Not Allowed, invalid HTTP method.
 * - 500: Internal Server Error, error fetching photos.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/database/db'; // SQLite database connection
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

  const column = entityType === 'cities' ? 'city_id' : 'attraction_id';

  try {
    if (req.method === 'GET') {
      // Fetch photos
      const photos = db
        .prepare(
          `
          SELECT id, url, user_id, ${column} AS entity_id, caption, created_at
          FROM photos
          WHERE ${column} = ?
        `
        )
        .all(Number(entityId));
      return res.status(200).json({ photos });
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    return handleApiError(error, res, 'Failed to fetch photos');
  }
}
