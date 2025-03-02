/**
 * API handler for geocoding and reverse geocoding requests.
 *
 * This handler supports two main functionalities:
 *
 * 1. Reverse Geocoding: Converts latitude and longitude coordinates to a city, state, and country.
 *    - Request: POST with `latitude` and `longitude` in the body.
 *    - Response: JSON object with `city`, `state`, and `country`.
 *
 * 2. Forward Geocoding: Converts a city and country (or a place) to latitude and longitude coordinates.
 *    - Request: POST with `city` and `country`, or `place` in the body.
 *    - Response: JSON object with `lat` and `lng`.
 *
 * The handler uses the OpenCage Geocoding API to perform the geocoding operations.
 * Ensure that the OpenCage API key is set in the environment variables (`.env.local`).
 *
 * @param {NextApiRequest} req - The incoming request object.
 * @param {NextApiResponse} res - The outgoing response object.
 * @returns {Promise<void>} - The response with geocoding data or an error message.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { handleApiError } from '@/utils/errorHandler';

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

  const { city, country, place, state, latitude, longitude } = req.body;

  // 🔹 Case 1: Reverse Geocoding (Lat, Lng → City, State, Country)
  if (latitude && longitude) {
    try {
      const response = await axios.get(
        'https://api.opencagedata.com/geocode/v1/json',
        {
          params: {
            q: `${latitude},${longitude}`,
            key: process.env.OPENCAGE_API_KEY, // Ensure the key is in `.env.local`
          },
        }
      );

      const { results } = response.data;

      if (results.length > 0) {
        const location = results[0].components;
        const city =
          location.city || location.town || location.village || 'Unknown City';
        const state = location.state || 'Unknown State';
        const country = location.country || 'Unknown Country';

        return res.status(200).json({ city, state, country });
      } else {
        return res
          .status(404)
          .json({ error: 'No results found for the given coordinates.' });
      }
    } catch (error) {
      console.error('Error fetching reverse geocode data:', error);
      return res
        .status(500)
        .json({ error: 'Failed to fetch reverse geocode data.' });
    }
  }

  // 🔹 Case 2: Forward Geocoding (City, Country → Lat, Lng)
  if ((!city || !country) && !place) {
    return res
      .status(400)
      .json({ error: 'At least one of city, country, or place is required.' });
  }

  const query =
    place || `${city || ''}, ${state || ''}, ${country || ''}`.trim();

  try {
    const response = await axios.get(
      'https://api.opencagedata.com/geocode/v1/json',
      {
        params: {
          q: query,
          key: process.env.OPENCAGE_API_KEY,
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
    return handleApiError(error, res, 'Failed to fetch geocode data.', 500);
  }
}
