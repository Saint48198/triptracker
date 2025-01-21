/**
 * API Route: /api/photos/search
 *
 * This API route searches for photo resources from Cloudinary based on specified criteria.
 *
 * Methods:
 * - GET: Search for photo resources using folder and tag filters.
 *
 * Query Parameters:
 * - folder: The folder to search within on Cloudinary (optional).
 * - tag: The tag to filter photos by (optional).
 * - max_results: The maximum number of results to return (optional, default is 10).
 * - next_cursor: The cursor for pagination to fetch the next set of results (optional).
 *
 * Error Handling:
 * - Returns 405 if the request method is not GET.
 * - Returns 500 if an error occurs while searching for photos.
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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { folder, tag, max_results, next_cursor } = req.query;

  try {
    const query: { expression: string[] } = {
      expression: [],
    };

    // Add folder condition
    if (typeof folder === 'string') {
      query.expression.push(`folder:${folder}`);
    }

    // Add tag condition
    if (typeof tag === 'string') {
      query.expression.push(`tags=${tag}`);
    }

    const searchQuery = query.expression.join(' AND ');

    // Fetch resources using the search API
    const results = await cloudinary.search
      .expression(searchQuery)
      .max_results(Number(max_results) || 10)
      .next_cursor(typeof next_cursor === 'string' ? next_cursor : undefined)
      .execute();

    const photos: Photo[] = results.resources.map(
      (resource: CloudinaryPhoto) => ({
        url: resource.secure_url,
        created_at: resource.created_at,
        format: resource.format,
        photo_id: resource.asset_id,
      })
    );

    res.status(200).json({ photos, next_cursor: results.next_cursor });
  } catch (error: unknown) {
    return handleApiError(error, res, 'Failed to fetch photos', 500);
  }
}
