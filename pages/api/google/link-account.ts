import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import db from '../../../database/db';

// Your Google OAuth credentials
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { userId, code } = req.body;

      if (!userId || !code) {
        return res
          .status(400)
          .json({ error: 'Missing userId or authorization code.' });
      }

      // Exchange the authorization code for an access token
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Get the authenticated user's info
      const oauth2 = google.oauth2('v2');
      const userInfo = await oauth2.userinfo.get({
        auth: oauth2Client,
      });

      if (!userInfo.data.email) {
        return res
          .status(400)
          .json({ error: 'Failed to retrieve Google account details.' });
      }

      // Link Google account to user in the database
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
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
        userInfo.data.email,
        userId
      );

      return res
        .status(200)
        .json({ message: 'Google account linked successfully.' });
    } catch (error: any) {
      console.error(error);
      return res
        .status(500)
        .json({ error: 'An error occurred while linking Google account.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
