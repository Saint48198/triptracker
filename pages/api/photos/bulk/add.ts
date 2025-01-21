/**
 * API Route: /api/photos/bulk/add
 *
 * This API route handles the addition of photos to a specified entity (city or attraction).
 * It supports the POST method and requires authentication via JWT.
 *
 * The request body should include:
 * - entityType: The type of entity (e.g., ENTITY_TYPE_CITIES or ENTITY_TYPE_ATTRACTIONS)
 * - entityId: The ID of the entity to which the photos will be added
 * - photos: An array of photo objects, each containing a URL and an optional caption
 *
 * The route performs the following steps:
 * 1. Authenticates the request using the JWT token from cookies.
 * 2. Validates the request body to ensure all required fields are present.
 * 3. Inserts the provided photos into the database for the specified entity.
 * 4. Returns a success message upon successful insertion of photos.
 *
 * Error handling is performed using the handleApiError utility function.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/database/db';
import { ENTITY_TYPE_CITIES } from '@/constants';
import { authenticateRequest } from '@/utils/authUtil';
import { handleApiError } from '@/utils/errorHandler';
import { Photo } from '@/types/PhotoTypes';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return handleApiError(null, res, 'Method not allowed', 405);
  }

  const payload = await authenticateRequest(req, res);
  if (!payload) return;

  const { entityType, entityId, photos } = req.body;

  if (!entityType || !entityId || !photos) {
    return handleApiError(null, res, 'Missing required fields', 400);
  }

  try {
    const entityColumn =
      entityType === ENTITY_TYPE_CITIES ? 'city_id' : 'attraction_id';

    const insertPhotos = db.prepare(`
      INSERT INTO photos (photo_id, url, user_id, ${entityColumn}, caption)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((photos: Photo[]) => {
      photos.forEach((photo: Photo) => {
        insertPhotos.run(
          photo.photo_id,
          photo.url,
          payload.id,
          entityId,
          photo.caption || null
        );
      });
    });

    insertMany(photos);

    return res.status(201).json({ message: 'Photos added successfully' });
  } catch (error) {
    return handleApiError(error, res, 'Failed to add photos', 500);
  }
}
