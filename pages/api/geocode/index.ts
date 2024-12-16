import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res
      .setHeader('Allow', ['POST'])
      .status(405)
      .end(`Method ${req.method} Not Allowed`);
  }

  const { city, country } = req.body;

  if (!city || !country) {
    return res.status(400).json({ error: 'City and country are required.' });
  }

  try {
    const response = await axios.get(
      'https://api.opencagedata.com/geocode/v1/json',
      {
        params: {
          q: `${city}, ${country}`,
          key: process.env.OPENCAGE_API_KEY, // Ensure the key is in `.env.local`
        },
      }
    );

    const { results } = response.data;

    if (results.length > 0) {
      const { lat, lng } = results[0].geometry;
      return res.status(200).json({ lat, lng });
    } else {
      return res
        .status(404)
        .json({ error: 'No results found for the given city and country.' });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching geocode data:', error.message);
      return res.status(500).json({ error: 'Failed to fetch geocode data.' });
    } else {
      console.error('Unexpected error:', error);
      return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  }
}
