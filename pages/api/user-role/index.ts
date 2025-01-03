import { NextApiRequest, NextApiResponse } from 'next';

import db from '../../../database/db';
import { handleApiError } from '@/utils/errorHandler';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'POST': {
      const { userId, roleId } = req.body;

      if (!userId || !roleId) {
        return res.status(400).json({ error: 'Missing userId or roleId' });
      }

      try {
        const assignRole = db.prepare(`
          INSERT INTO user_roles (user_id, role_id)
          VALUES (?, ?)
        `);
        assignRole.run(userId, roleId);
        return res.status(201).json({ message: 'Role assigned to user' });
      } catch (err: unknown) {
        return handleApiError(err, res, 'Role assignment failed');
      }
    }

    case 'DELETE': {
      const { userId, roleId } = req.query;

      if (!userId || !roleId) {
        return res.status(400).json({ error: 'Missing userId or roleId' });
      }

      try {
        const removeRole = db.prepare(`
          DELETE FROM user_roles
          WHERE user_id = ? AND role_id = ?
        `);
        removeRole.run(userId, roleId);
        return res.status(204).end();
      } catch (err: unknown) {
        return handleApiError(err, res, 'Role removal failed');
      }
    }

    default:
      return res
        .setHeader('Allow', ['POST', 'DELETE'])
        .status(405)
        .end(`Method ${method} Not Allowed`);
  }
}
