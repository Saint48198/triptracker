import { google } from 'googleapis';
import { NextApiResponse } from 'next';
import { CustomNextApiRequest } from '@/types/AuthTypes';

export default async function getPhotos(
  req: CustomNextApiRequest,
  res: NextApiResponse
) {
  const userId = req.user?.id;
  const googleAccount = db
    .prepare(
      'SELECT google_account_id FROM user_google_accounts WHERE user_id = ?'
    )
    .get(userId);

  if (!googleAccount) {
    return res.status(400).json({ error: 'Google account not linked' });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: googleAccount.google_account_id,
  });

  const photos = google.photoslibrary_v1.Photoslibrary({
    version: 'v1',
    auth: oauth2Client,
  });

  const response = await photos.mediaItems.list({ pageSize: 20 });
  return res.status(200).json(response.data);
}
