import { NextApiRequest, NextApiResponse } from 'next';

const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    return res
      .status(400)
      .json({ error: 'Query parameter is required and must be a string.' });
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
      return res.status(404).json({ error: 'No results found.' });
    }

    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    if (!page || page.missing) {
      return res.status(404).json({ error: 'Page not found.' });
    }

    const result = {
      title: page.title,
      intro: page.extract,
      url: page.fullurl,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching data from Wikipedia:', error);
    res.status(500).json({ error: 'An error occurred while fetching data.' });
  }
}
