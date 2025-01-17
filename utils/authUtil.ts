/**
 * Utility: Authentication
 *
 * This utility function handles the authentication of API requests using JWT tokens.
 * It verifies the JWT token from the cookies and returns the payload if the token is valid.
 *
 * The function performs the following steps:
 * 1. Retrieves the `auth_token` from the request cookies.
 * 2. Returns a 401 Unauthorized response if the token is not present.
 * 3. Verifies the token using the `verifyToken` function.
 * 4. Returns the payload if the token is valid.
 * 5. Returns a 401 Unauthorized response if the token is invalid.
 *
 * This utility is used to protect API routes by ensuring that only authenticated users can access them.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { JWTPayload } from '@/types/AuthTypes';
import { verifyToken } from '@/utils/jwt';

export async function authenticateRequest(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<JWTPayload | null> {
  const { auth_token } = req.cookies;
  if (!auth_token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  try {
    const payload: JWTPayload = await verifyToken(auth_token);
    return payload;
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
}
