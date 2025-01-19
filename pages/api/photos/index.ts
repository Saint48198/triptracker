/**
 * API Route: /api/photos
 *
 * This API route fetches photo resources from Cloudinary.
 *
 * Methods:
 * - GET: Fetch photo resources from a specified Cloudinary folder.
 *
 * Headers:
 * - Authorization: Bearer token for secure access (required).
 *
 * Error Handling:
 * - Returns 403 if the authorization token is missing or invalid.
 * - Returns 405 if the request method is not GET.
 * - Returns 500 if an error occurs while fetching data from Cloudinary.
 *
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryPhoto, Photo } from '@/types/PhotoTypes';
import { handleApiError } from '@/utils/errorHandler';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return handleApiError(null, res, 'Method not allowed', 405);
  }

  const token = req.headers.authorization?.split('Bearer ')[1];

  // Validate token (Replace this with your actual validation logic)
  if (!token || token !== 'your-secure-token') {
    return handleApiError(null, res, 'Unauthorized access', 403);
  }

  try {
    // Fetch resources from Cloudinary
    const folder = process.env.CLOUDINARY_FOLDER || '';
    const resources = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder, // Fetch images from a specific folder
      max_results: 50,
    });

    // Transform data into a more readable format
    const photos: Photo[] = resources.resources.map(
      (resource: CloudinaryPhoto) => ({
        id: resource.asset_id,
        url: resource.secure_url,
        created_at: resource.created_at,
        format: resource.format,
      })
    );

    res.status(200).json({ photos });
  } catch (error: unknown) {
    return handleApiError(error, res, 'Failed to fetch photos', 500);
  }
}
