/**
 * API Route: /api/photos/search
 *
 * This API route searches for both public and private photo resources from Cloudinary based on specified criteria.
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
    return handleApiError(null, res, 'Method not allowed', 405);
  }

  try {
    const { folder, tag, max_results = 10, next_cursor } = req.query;
    const expression = ['resource_type:image'];
    if (folder) expression.push(`folder=${folder}`);
    if (tag) expression.push(`tags=${tag}`);

    const searchExpression = expression.join(' AND ');

    console.log('Search Expression:', searchExpression);

    const searchQuery = cloudinary.search
      .expression(searchExpression)
      .with_field('context')
      .with_field('tags')
      .max_results(Number(max_results));

    // Pass next_cursor only if it exists
    if (next_cursor) {
      searchQuery.next_cursor(String(next_cursor));
    }

    const result = await searchQuery.execute();

    console.log('Cloudinary API response:', JSON.stringify(result, null, 2));

    const photos: Photo[] = result.resources.map((photo: CloudinaryPhoto) => {
      if (photo.access_mode === 'authenticated' || photo.type === 'private') {
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = cloudinary.utils.api_sign_request(
          { public_id: photo.public_id, timestamp },
          process.env.CLOUDINARY_API_SECRET as string
        );

        return {
          photo_id: photo.public_id,
          title: photo.context?.custom?.caption || 'Untitled',
          caption: photo.context?.custom?.alt || '',
          created_at: photo.created_at,
          format: photo.format,
          url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/authenticated/${photo.public_id}?api_key=${process.env.CLOUDINARY_API_KEY}&timestamp=${timestamp}&signature=${signature}`,
        };
      } else {
        return {
          url: photo.secure_url,
          title: photo.context?.custom?.caption || 'Untitled',
          caption: photo.context?.custom?.alt || '',
          created_at: photo.created_at,
          format: photo.format,
          photo_id: photo.public_id,
        };
      }
    });

    return res
      .status(200)
      .json({ photos, next_cursor: result.next_cursor || null });
  } catch (error: unknown) {
    console.error('Cloudinary API error:', error);
    return handleApiError(error, res, 'Failed to fetch photos', 500);
  }
}
