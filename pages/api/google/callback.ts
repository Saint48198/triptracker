import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { verify } from 'jsonwebtoken';

import db from '../../../database/db';
import { redirectWithMessage } from '@/utils/redirectWithMessage';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI =
  process.env.NEXT_PUBLIC_HOST + process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!;
const JWT_SECRET = process.env.JWT_SECRET!;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
const userPageUri = '/admin/users';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const code = req.query.code as string;
  const authToken = req.cookies.auth_token;

  if (!authToken) {
    return redirectWithMessage(
      res,
      userPageUri,
      'Unauthorized: No auth token provided',
      'error'
    );
  }

  if (!code) {
    return redirectWithMessage(
      res,
      userPageUri,
      'Authorization code missing',
      'error'
    );
  }

  try {
    const decoded = verify(authToken, JWT_SECRET) as { id: number };
    const userId = decoded.id;

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Use tokens to fetch user info
    const oauth2 = google.oauth2('v2');
    const { data: userInfo } = await oauth2.userinfo.get({
      auth: oauth2Client,
    });

    if (!userId || !userInfo.email) {
      return redirectWithMessage(
        res,
        userPageUri,
        'Failed to retrieve Google account details',
        'error'
      );
    }

    // Link Google account to user in the database
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    if (!user) {
      return redirectWithMessage(res, userPageUri, 'User not found', 'error');
    }

    // Update the user with Google account details
    db.prepare(
      `
        UPDATE users
        SET google_access_token = ?, google_refresh_token = ?, google_token_expiry = ?, email = ?
        WHERE id = ?
      `
    ).run(
      tokens.access_token,
      tokens.refresh_token,
      tokens.expiry_date,
      userInfo.email,
      userId
    );

    redirectWithMessage(
      res,
      userPageUri,
      'Google account linked successfully',
      'success',
      userId
    );
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    redirectWithMessage(
      res,
      userPageUri,
      'Failed to link Google account',
      'error'
    );
  }
}
