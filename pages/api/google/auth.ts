import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI =
  process.env.NEXT_PUBLIC_HOST + process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/photoslibrary.readonly',
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Ensures refresh tokens are received
    scope: scopes,
  });

  res.redirect(authUrl); // Redirects user to Google for OAuth login
}
