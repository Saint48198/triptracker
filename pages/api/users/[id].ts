import { NextApiRequest, NextApiResponse } from 'next';

import db from '../../../database/db';
import { handleApiError } from '@/utils/errorHandler';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const method = req.method;

  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  switch (method) {
    case 'GET': {
      try {
        const user = db
          .prepare(
            `
          SELECT u.id, u.username, u.email, u.google_access_token, u.google_refresh_token, u.google_token_expiry, GROUP_CONCAT(r.name) as roles
          FROM users u
          LEFT JOIN user_roles ur ON u.id = ur.user_id
          LEFT JOIN roles r ON ur.role_id = r.id
          WHERE u.id = ?
        `
          )
          .get(id);

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json(user);
      } catch (err: unknown) {
        return handleApiError(err, res, 'Failed to retrieve user');
      }
    }

    case 'PUT': {
      const { username, email, passwordHash } = req.body;

      try {
        const updateUser = db.prepare(`
          UPDATE users
          SET 
            username = COALESCE(?, username),
            email = COALESCE(?, email),
            password_hash = COALESCE(?, password_hash)
          WHERE id = ?
        `);
        const result = updateUser.run(username, email, passwordHash, id);

        if (result.changes === 0) {
          return res
            .status(404)
            .json({ error: 'User not found or no changes made' });
        }

        return res.status(200).json({ message: 'User updated successfully' });
      } catch (err: unknown) {
        return handleApiError(err, res, 'Failed to update user');
      }
    }

    case 'DELETE': {
      try {
        const deleteUser = db.prepare(`DELETE FROM users WHERE id = ?`);
        const result = deleteUser.run(id);

        if (result.changes === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        return res.status(204).end();
      } catch (err: unknown) {
        return handleApiError(err, res, 'Failed to delete user');
      }
    }

    default:
      return res
        .setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        .status(405)
        .end(`Method ${method} Not Allowed`);
  }
}
