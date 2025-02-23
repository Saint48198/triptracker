import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/database/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getMessages(req, res);
  } else if (req.method === 'POST') {
    return addMessage(req, res);
  } else {
    return res
      .setHeader('Allow', ['GET', 'POST'])
      .status(405)
      .end(`Method ${req.method} Not Allowed`);
  }
}

// 🔹 Fetch Messages for a Check-In
async function getMessages(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Check-in ID is required.' });
  }

  try {
    const stmt = db.prepare(
      'SELECT * FROM check_in_messages WHERE check_in_id = ? ORDER BY created_at ASC'
    );
    const messages = stmt.all(id);

    return res.status(200).json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ error: 'Failed to fetch messages.' });
  }
}

// 🔹 Add a New Message to a Check-In
async function addMessage(req: NextApiRequest, res: NextApiResponse) {
  const { checkInId, userId, message } = req.body;

  if (!checkInId || !userId || !message) {
    return res
      .status(400)
      .json({ error: 'Check-in ID, user ID, and message are required.' });
  }

  try {
    console.log('Adding message:', { checkInId, userId, message });
    const stmt = db.prepare(`
        INSERT INTO user_locations_messages (check_in_id, user_id, message)
        VALUES (?, ?, ?)
    `);
    stmt.run(checkInId, userId, message);

    return res.status(201).json({ message: 'Message added successfully.' });
  } catch (error) {
    console.error('Error adding message:', error);
    return res.status(500).json({ error: 'Failed to add message.' });
  }
}
