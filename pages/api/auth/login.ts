/**
 * This file contains the API route handler for user login.
 *
 * The handler performs the following tasks:
 * 1. Verifies the HTTP method is POST.
 * 2. Extracts the username and password from the request body.
 * 3. Verifies the user credentials using the `verifyUser` utility function.
 * 4. Fetches the roles associated with the user from the database.
 * 5. Creates a JWT payload with the user's information and roles.
 * 6. Generates a JWT token and stores it in the database.
 * 7. Sets the JWT token in an HTTP-only cookie.
 * 8. Returns a success response with the token if the login is successful.
 * 9. Returns appropriate error responses for invalid credentials or server errors.
 *
 * The JWT token is used for authenticating subsequent requests.
 * The token is stored in an HTTP-only cookie to enhance security.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { verifyUser } from '@/utils/verifyUser';
import db from '../../../database/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username, password } = req.body;
  const { user, error, details } = await verifyUser(username, password);

  if (error) {
    return res
      .status(error === 'Internal Server Error' ? 500 : 400)
      .json({ error, details });
  }

  if (user) {
    // Fetch roles for the user
    const roles = db
      .prepare(
        `SELECT roles.name 
         FROM roles 
         INNER JOIN user_roles ON roles.id = user_roles.role_id 
         WHERE user_roles.user_id = ?`
      )
      .all(user.id)
      .map((role: { name: string }) => role.name);

    // Create JWT payload
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles,
    };

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Generate JWT (no expiration)
    const token = jwt.sign(payload, process.env.JWT_SECRET as string);

    // Store token in database
    db.prepare(`INSERT INTO user_tokens (user_id, token) VALUES (?, ?)`).run(
      user.id,
      token
    );

    // Set token in HTTP-only cookie
    res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Path=/;`);

    res.status(200).json({ message: 'Login successful', token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
}
