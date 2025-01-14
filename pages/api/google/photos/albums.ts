// /pages/api/google/photos/albums.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const tokenResponse = await fetch(
      process.env.NEXT_PUBLIC_HOST + '/api/users/token',
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          Cookie: req.headers.cookie || '',
        },
      }
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to fetch Google access token');
    }
    const tokenData = await tokenResponse.json();
    if (!tokenData.accessToken) {
      return res
        .status(401)
        .json({ error: 'Unauthorized. No access token provided.' });
    }

    // Use the access token to call the Google Photos REST API
    const response = await fetch(
      'https://photoslibrary.googleapis.com/v1/albums',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokenData.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch albums: ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ error: 'Failed to fetch albums.' });
  }
}
