/**
 * This module provides API endpoints for managing messages related to user check-ins.
 * It supports fetching messages for a specific check-in and adding new messages to a check-in.
 *
 * The following endpoints are available:
 * - GET /api/check-ins/messages: Fetches messages for a specific check-in.
 * - POST /api/check-ins/messages: Adds a new message to a specific check-in.
 *
 * The module uses parameterized queries to prevent SQL injection attacks and validates input data.
 *
 * Dependencies:
 * - next: For handling API requests and responses.
 * - better-sqlite3: For interacting with the SQLite database.
 * - validator: For validating UUIDs.
 * - errorHandler: For handling API errors.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/database/db';
import { isUUID } from 'validator';
import { handleApiError } from '@/utils/errorHandler';

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

/**
 * Fetches messages for a specific check-in.
 *
 * @param {NextApiRequest} req - The API request object.
 * @param {NextApiResponse} res - The API response object.
 * @returns {Promise<void>} - A promise that resolves when the messages are fetched.
 */
async function getMessages(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || !isUUID(id as string)) {
    return res.status(400).json({ error: 'Check-in ID is required.' });
  }

  try {
    const stmt = db.prepare(
      'SELECT * FROM check_in_messages WHERE check_in_id = ? ORDER BY created_at ASC'
    );
    const messages = stmt.all(id);

    return res.status(200).json({ messages });
  } catch (error: unknown) {
    return handleApiError(error, res, 'Failed to fetch messages.', 500);
  }
}

/**
 * Adds a new message to a specific check-in.
 *
 * @param {NextApiRequest} req - The API request object.
 * @param {NextApiResponse} res - The API response object.
 * @returns {Promise<void>} - A promise that resolves when the message is added.
 */
async function addMessage(req: NextApiRequest, res: NextApiResponse) {
  const { checkInId, userId, message } = req.body;

  if (!checkInId || !userId || !message) {
    return res
      .status(400)
      .json({ error: 'Check-in ID, user ID, and message are required.' });
  }

  try {
    const checkInExists = db
      .prepare('SELECT id FROM user_locations WHERE id = ?')
      .get(checkInId);
    if (!checkInExists) {
      return res
        .status(404)
        .json({ error: 'Check-in not found in user_locations.' });
    }

    const stmt = db.prepare(`
        INSERT INTO user_locations_messages (check_in_id, user_id, message)
        VALUES (?, ?, ?)
    `);
    stmt.run(checkInId, userId, message);

    return res.status(201).json({ message: 'Message added successfully.' });
  } catch (error: unknown) {
    return handleApiError(error, res, 'Failed to add message.', 500);
  }
}
