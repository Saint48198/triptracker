/**
 * This file contains the API route handler for verifying JWT tokens.
 *
 * The handler performs the following tasks:
 * 1. Verifies the HTTP method is POST.
 * 2. Extracts the token from the request body.
 * 3. Verifies the JWT token using the secret key.
 * 4. Checks if the token exists in the database to ensure it is valid and not revoked.
 * 5. Returns a success response with the decoded user information if the token is valid.
 * 6. Returns appropriate error responses for invalid methods, missing tokens, invalid tokens, or server configuration errors.
 *
 * The token is used to authenticate the user's session and is stored in an HTTP-only cookie for security.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import db from '../../../database/db';
import { handleApiError } from '@/utils/errorHandler';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return handleApiError(null, res, 'Method Not Allowed', 405);
  }

  const { token } = req.body;

  if (!token) {
    return handleApiError(null, res, 'Token is missing', 400);
  }

  try {
    if (!process.env.JWT_SECRET) {
      return handleApiError(null, res, 'Server configuration error', 500);
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      username: string;
      email: string;
      roles: string[];
    };

    // Check if the token exists in the database
    const tokenExists = db
      .prepare(`SELECT COUNT(*) AS count FROM user_tokens WHERE token = ?`)
      .get(token);

    if (!tokenExists || tokenExists.count === 0) {
      return handleApiError(null, res, 'Invalid or revoked token', 401);
    }

    return res.status(200).json({ valid: true, user: decoded });
  } catch (error) {
    return handleApiError(error, res, 'Invalid token', 401);
  }
}
