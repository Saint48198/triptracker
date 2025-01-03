import { NextApiRequest, NextApiResponse } from 'next';

import db from '../../../database/db';
import { handleApiError } from '@/utils/errorHandler';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET': {
      const roles = db.prepare(`SELECT * FROM roles`).all();
      return res.status(200).json(roles);
    }

    case 'POST': {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Role name is required' });
      }

      try {
        const insertRole = db.prepare(`INSERT INTO roles (name) VALUES (?)`);
        const result = insertRole.run(name);
        return res.status(201).json({ id: result.lastInsertRowid });
      } catch (err: unknown) {
        return handleApiError(err, res, 'Role creation failed');
      }
    }

    default:
      return res
        .setHeader('Allow', ['GET', 'POST'])
        .status(405)
        .end(`Method ${method} Not Allowed`);
  }
}
