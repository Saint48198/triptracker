import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { albumId } = req.query;
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

    if (!albumId) {
      return res.status(400).json({ error: 'Album ID is required.' });
    }

    const response = await fetch(
      `https://photoslibrary.googleapis.com/v1/mediaItems:search`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ albumId }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch photos: ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
}
