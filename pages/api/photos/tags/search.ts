/**
 * API Route: /api/photos/tags/search
 *
 * This service handles fetching tags from Cloudinary.
 *
 * - Validates the HTTP method to ensure it is a GET request.
 * - Constructs the API URL for Cloudinary.
 * - Sets up the authentication using Cloudinary API credentials.
 * - Makes a request to Cloudinary to fetch image tags.
 * - Returns the tags in the response.
 *
 * Response:
 * - 200: Success, returns the tags fetched from Cloudinary.
 * - 405: Method Not Allowed, invalid HTTP method.
 * - 500: Internal Server Error, error fetching tags from Cloudinary.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { handleApiError } from '@/utils/errorHandler';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return handleApiError(null, res, 'Method not allowed', 405);
  }

  try {
    // Construct the API URL
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/tags/image`;

    // Set up the authentication
    const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

    // Make the request to Cloudinary
    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    // Return the tags
    res.status(200).json({ tags: response.data.tags });
  } catch (error: unknown) {
    return handleApiError(error, res, 'Failed to fetch Cloudinary tags', 500);
  }
}
