import { NextApiResponse } from 'next';

type MessageType = 'error' | 'success' | '';

export function redirectWithMessage(
  res: NextApiResponse,
  uri: string,
  message: string,
  messageType: MessageType,
  userId?: number
) {
  const encodedMessage = encodeURIComponent(message);
  let redirectUrl = `${uri}?message=${encodedMessage}&type=${messageType}`;

  if (userId) {
    redirectUrl += `&uid=${userId}`;
  }

  res.redirect(redirectUrl);
}
