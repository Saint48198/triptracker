/**
 * API Route: /api/info
 *
 * This API route fetches summary information from Wikipedia based on a query parameter.
 *
 * Methods:
 * - GET: Fetch summary information for a given query term from Wikipedia.
 *
 * Query Parameters:
 * - query: The term to search for on Wikipedia (required).
 *
 * Error Handling:
 * - Returns 400 if the query parameter is missing or invalid.
 * - Returns 404 if no results are found or the page is missing.
 * - Returns 500 if an error occurs while fetching data from Wikipedia.
 *
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { handleApiError } from '@/utils/errorHandler';

const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    return handleApiError(
      null,
      res,
      'Query parameter is required and must be a string.',
      400
    );
  }

  try {
    // Fetch data from Wikipedia API
    const response = await fetch(
      `${WIKIPEDIA_API_URL}?action=query&format=json&prop=extracts|info&exintro&explaintext&titles=${encodeURIComponent(
        query
      )}&inprop=url`
    );

    const data = await response.json();

    // Extract data from the API response
    const pages = data.query?.pages;
    if (!pages) {
      return handleApiError(null, res, 'No results found.', 404);
    }

    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    if (!page || page.missing) {
      return handleApiError(null, res, 'Page not found.', 404);
    }

    const result = {
      title: page.title,
      intro: page.extract,
      url: page.fullurl,
    };

    res.status(200).json(result);
  } catch (error: unknown) {
    return handleApiError(
      error,
      res,
      'Failed to fetch data from Wikipedia.',
      500
    );
  }
}
