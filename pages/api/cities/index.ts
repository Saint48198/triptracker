import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { country_id, page = 1, limit = 25 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Fetch all cities with their associated country and state
    try {
      // Base query
      let query = `
        SELECT cities.id, cities.name, cities.lat, cities.lng, countries.name AS country_name
        FROM cities
        JOIN countries ON cities.country_id = countries.id
      `;

      const params = [];

      // Filtering by country
      if (country_id) {
        query += ` WHERE cities.country_id = ?`;
        params.push(Number(country_id));
      }

      // Add LIMIT and OFFSET for pagination
      query += ` LIMIT ? OFFSET ?`;
      params.push(Number(limit), offset);

      // Execute query
      const cities = db.prepare(query).all(...params);

      // Get total count for pagination
      let countQuery = `SELECT COUNT(*) as total FROM cities`;
      if (country_id) {
        countQuery += ` WHERE country_id = ?`;
      }

      const totalCount = db
        .prepare(countQuery)
        .get(...(country_id ? [Number(country_id)] : []));

      res.status(200).json({
        cities,
        total: totalCount.total,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch cities.' });
    }
  } else if (req.method === 'POST') {
    // Add a new city
    const { name, lat, lng, state_id, country_id, last_visited } = req.body;

    if (!name || !lat || !lng || !country_id) {
      return res.status(400).json({
        error: 'City name, latitude, longitude, and country are required.',
      });
    }

    try {
      const stmt = db.prepare(
        'INSERT INTO cities (name, lat, lng, state_id, country_id, last_visited) VALUES (?, ?, ?, ?, ?, ?)'
      );
      stmt.run(name, lat, lng, state_id || null, country_id, last_visited);
      res.status(201).json({ message: 'City added successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add city.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
