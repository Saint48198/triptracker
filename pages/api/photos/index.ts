import { NextApiResponse } from 'next';
import db from '../../../database/db';
import { CustomNextApiRequest } from '@/types/AuthTypes';

export default async function attachPhoto(
  req: CustomNextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { photoUrl, cityId, attractionId, caption } = req.body;
  const userId = req.user?.id;

  if (!photoUrl || (!cityId && !attractionId)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  db.prepare(
    `
    INSERT INTO photos (url, user_id, city_id, attraction_id, caption)
    VALUES (?, ?, ?, ?, ?)
  `
  ).run(photoUrl, userId, cityId, attractionId, caption);

  return res.status(200).json({ message: 'Photo attached successfully' });
}
