import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import axios from 'axios';

import db from '../../../../database/db';
import { handleApiError } from '@/utils/errorHandler';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { entityType, entityId } = req.query;

  // Validate entityType and entityId
  if (
    !entityType ||
    !entityId ||
    !['city', 'attraction'].includes(entityType as string)
  ) {
    return res.status(400).json({ error: 'Invalid entity type or ID' });
  }

  try {
    // Fetch entity information
    const entity = db
      .prepare(
        `SELECT * FROM ${entityType === 'city' ? 'cities' : 'attractions'} WHERE id = ?`
      )
      .get(entityId);

    if (!entity) {
      return res.status(404).json({ error: `${entityType} not found` });
    }

    // Fetch stored photos from the database
    const photos = db
      .prepare(`SELECT * FROM photos WHERE entity_id = ? AND entity_type = ?`)
      .all(entityId, entityType);

    if (photos.length > 0) {
      return res.status(200).json({ entity, photos });
    }

    // If no photos are found in the database, fetch from Google Photos API
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_BASE_URL + '/api/google/callback'
    );

    // Fetch user's Google Photos tokens
    const tokens = db
      .prepare(
        `SELECT google_access_token, google_refresh_token FROM users LIMIT 1`
      )
      .get();

    if (!tokens || !tokens.google_access_token) {
      return res
        .status(401)
        .json({ error: 'Google Photos access not configured' });
    }

    oauth2Client.setCredentials({
      access_token: tokens.google_access_token,
      refresh_token: tokens.google_refresh_token,
    });

    const googlePhotosResponse = await axios.get(
      'https://photoslibrary.googleapis.com/v1/mediaItems',
      {
        headers: {
          Authorization: `Bearer ${oauth2Client.credentials.access_token}`,
        },
        params: {
          pageSize: 50,
        },
      }
    );

    const googlePhotos = googlePhotosResponse.data.mediaItems || [];

    // Save photos to database
    const insertStmt = db.prepare(
      `INSERT INTO photos (entity_id, entity_type, photo_url) VALUES (?, ?, ?)`
    );

    googlePhotos.forEach((photo: { baseUrl: string }) => {
      insertStmt.run(entityId, entityType, photo.baseUrl);
    });

    return res.status(200).json({ entity, photos: googlePhotos });
  } catch (error: unknown) {
    return handleApiError(error, res, 'Error fetching photos');
  }
}
