import db from '../../database/db';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const countries = db.prepare('SELECT * FROM countries').all();
    return res.status(200).json(countries);
  }

  if (req.method === 'POST') {
    const { name, abbreviation } = req.body;
    const stmt = db.prepare(
      'INSERT INTO users (name, abbreviation) VALUES (?, ?)'
    );
    const result = stmt.run(name, abbreviation);
    return res.status(201).json({ id: result.lastInsertRowid });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
