import { NextApiRequest, NextApiResponse } from 'next';

import db from '../../../database/db';
import { handleApiError } from '@/utils/errorHandler';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const method = req.method;

  if (!id) {
    return res.status(400).json({ error: 'Role ID is required' });
  }

  switch (method) {
    case 'GET': {
      try {
        const role = db.prepare(`SELECT * FROM roles WHERE id = ?`).get(id);

        if (!role) {
          return res.status(404).json({ error: 'Role not found' });
        }

        return res.status(200).json(role);
      } catch (err: unknown) {
        return handleApiError(err, res, 'Failed to retrieve role');
      }
    }

    case 'PUT': {
      const { name } = req.body;

      try {
        const updateRole = db.prepare(`
          UPDATE roles
          SET name = ?
          WHERE id = ?
        `);
        const result = updateRole.run(name, id);

        if (result.changes === 0) {
          return res
            .status(404)
            .json({ error: 'Role not found or no changes made' });
        }

        return res.status(200).json({ message: 'Role updated successfully' });
      } catch (err: unknown) {
        return handleApiError(err, res, 'Failed to update role');
      }
    }

    case 'DELETE': {
      try {
        const deleteRole = db.prepare(`DELETE FROM roles WHERE id = ?`);
        const result = deleteRole.run(id);

        if (result.changes === 0) {
          return res.status(404).json({ error: 'Role not found' });
        }

        return res.status(204).end();
      } catch (err: unknown) {
        return handleApiError(err, res, 'Failed to delete role');
      }
    }

    default:
      return res
        .setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        .status(405)
        .end(`Method ${method} Not Allowed`);
  }
}
