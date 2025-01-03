import { NextApiRequest, NextApiResponse } from 'next';

import db from '../../../database/db';
import { handleApiError } from '@/utils/errorHandler';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;

  switch (method) {
    case 'GET': {
      try {
        const { role } = req.query;

        let users;
        if (role) {
          // Query to fetch users with a specific role
          users = db
            .prepare(
              `
            SELECT 
              u.id,
              u.username,
              u.email,
              GROUP_CONCAT(r.name) as roles
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE r.name = ?
            GROUP BY u.id, u.username, u.email
          `
            )
            .all(role as string);
        } else {
          // Query to fetch all users
          users = db
            .prepare(
              `
            SELECT 
              u.id,
              u.username,
              u.email,
              GROUP_CONCAT(r.name) as roles
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            GROUP BY u.id, u.username, u.email
          `
            )
            .all();
        }

        return res.status(200).json(users);
      } catch (err: unknown) {
        return handleApiError(err, res, 'Failed to retrieve users');
      }
    }

    case 'POST': {
      const { username, email, passwordHash, roles } = req.body;

      if (!username || !email || !passwordHash) {
        return res.status(400).json({
          error: 'Missing required fields: username, email, passwordHash',
        });
      }

      try {
        // Insert new user
        const insertUser = db.prepare(`
            INSERT INTO users (username, email, password_hash)
            VALUES (?, ?, ?)
        `);
        const result = insertUser.run(username, email, passwordHash);

        const userId = result.lastInsertRowid;

        // Assign roles to the user
        if (roles && roles.length > 0) {
          const assignRoles = db.prepare(`
            INSERT INTO user_roles (user_id, role_id) 
            VALUES (?, ?)
          `);
          for (const roleId of roles) {
            assignRoles.run(userId, roleId);
          }
        }

        return res
          .status(201)
          .json({ message: 'User created successfully', userId });
      } catch (err: unknown) {
        return handleApiError(err, res, 'Failed to create user');
      }
    }

    default:
      return res
        .setHeader('Allow', ['GET', 'POST'])
        .status(405)
        .end(`Method ${method} Not Allowed`);
  }
}
