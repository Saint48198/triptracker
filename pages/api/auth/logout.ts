/**
 * This file contains the API route handler for user logout.
 *
 * The handler performs the following tasks:
 * 1. Verifies the HTTP method is POST.
 * 2. Extracts the token from the request headers or cookies.
 * 3. Deletes the token from the database to invalidate the session.
 * 4. Clears the auth token from the HTTP-only cookie.
 * 5. Returns a success response if the logout is successful.
 * 6. Returns appropriate error responses for invalid methods, missing tokens, or already logged out sessions.
 *
 * The token is used to identify the user's session and is stored in an HTTP-only cookie for security.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Get token from request headers or cookies
  const token =
    req.headers.authorization?.split(' ')[1] || req.cookies.auth_token;

  if (!token) {
    return res.status(400).json({ error: 'Token missing' });
  }

  // Delete the token from the database
  const result = db
    .prepare(`DELETE FROM user_tokens WHERE token = ?`)
    .run(token);

  if (result.changes === 0) {
    return res.status(400).json({ error: 'Invalid or already logged out' });
  }

  // Clear auth cookie
  res.setHeader('Set-Cookie', `auth_token=; HttpOnly; Path=/; Max-Age=0`);

  res.status(200).json({ message: 'Logout successful' });
}
