import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const {
      country_id,
      page = 1,
      limit = 25,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const orderBy =
      sortBy === 'country' ? 'countries.name' : 'attractions.name';
    const orderDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';

    // Fetch all attractions
    try {
      let query = `
          SELECT attractions.id, attractions.name, attractions.lat, attractions.lng, attractions.wiki_term, countries.name AS country_name
          FROM attractions
                   JOIN countries ON attractions.country_id = countries.id
      `;

      const params: (string | number)[] = [];

      if (country_id) {
        query += ` WHERE attractions.country_id = ?`;
        params.push(Number(country_id));
      }

      query += ` ORDER BY ${orderBy} ${orderDirection}, attractions.name ASC LIMIT ? OFFSET ?`;
      params.push(Number(limit), offset);

      const attractions = db.prepare(query).all(...params);

      let countQuery = `SELECT COUNT(*) as total FROM attractions`;
      if (country_id) {
        countQuery += ` WHERE country_id = ?`;
      }

      const totalCount = db
        .prepare(countQuery)
        .get(...(country_id ? [Number(country_id)] : []));

      res.status(200).json({
        attractions,
        total: totalCount.total,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error) {
      console.error('Failed to fetch attractions:', error);
      res.status(500).json({ error: 'Failed to fetch attractions.' });
    }
  } else if (req.method === 'POST') {
    // Add a new attraction
    const {
      name,
      country_id,
      is_unesco,
      is_national_park,
      lat,
      lng,
      last_visited,
      wiki_term,
    } = req.body;

    if (!name || !country_id || !lat || !lng) {
      return res.status(400).json({
        error: 'Name, country_id, latitude, and longitude are required.',
      });
    }

    try {
      const stmt = db.prepare(
        `INSERT INTO attractions (name, country_id, is_unesco, is_national_park, lat, lng, last_visited, wiki_term)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      );

      // Ensure correct data types
      stmt.run(
        name,
        Number(country_id),
        is_unesco ? 1 : 0, // Convert boolean to integer
        is_national_park ? 1 : 0, // Convert boolean to integer
        parseFloat(lat), // Convert latitude to a float
        parseFloat(lng), // Convert longitude to a float
        last_visited || null, // Convert empty or undefined values to null
        wiki_term
      );

      res.status(201).json({ message: 'Attraction added successfully.' });
    } catch (error) {
      console.error('Failed to add attraction:', error);
      res.status(500).json({ error: 'Failed to add attraction.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
