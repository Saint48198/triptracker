/**
 * API Route: /api/photos/bulk/remove
 *
 * This API route handles the removal of photos from a specified entity (city or attraction).
 * It supports the DELETE method and requires authentication via JWT.
 *
 * The request body should include:
 * - entityType: The type of entity (e.g., ENTITY_TYPE_CITIES or ENTITY_TYPE_ATTRACTIONS)
 * - entityId: The ID of the entity from which the photos will be removed
 * - photos: An array of photo objects, each containing a URL
 *
 * The route performs the following steps:
 * 1. Authenticates the request using the JWT token from cookies.
 * 2. Validates the request body to ensure all required fields are present.
 * 3. Deletes the specified photos from the database for the specified entity.
 * 4. Returns a success message upon successful deletion of photos.
 *
 * Error handling is performed using the handleApiError utility function.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/database/db';
import { ENTITY_TYPE_CITIES } from '@/constants';
import { authenticateRequest } from '@/utils/authUtil';
import { handleApiError } from '@/utils/errorHandler';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = await authenticateRequest(req, res);
  if (!payload) return;

  const { entityType, entityId, photos } = req.body;

  if (!entityType || !entityId || !photos) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const entityColumn =
      entityType === ENTITY_TYPE_CITIES ? 'city_id' : 'attraction_id';

    const deletePhotos = db.prepare(`
      DELETE FROM photos
      WHERE url = ? AND user_id = ? AND ${entityColumn} = ?
    `);

    const deleteMany = db.transaction((photos: { url: string }[]) => {
      photos.forEach((photo) => {
        deletePhotos.run(photo.url, payload.id, entityId);
      });
    });

    deleteMany(photos);

    return res.status(200).json({ message: 'Photos removed successfully' });
  } catch (error) {
    return handleApiError(error, res, 'Failed to remove photos', 500);
  }
}
