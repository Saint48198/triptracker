/**
 * Utility: Error Handler
 *
 * This utility function handles API errors by sending a standardized JSON response.
 * It takes an error object, a response object, a custom error message, and an optional status code.
 *
 * The function performs the following steps:
 * 1. Checks if the error is an instance of the Error class.
 * 2. If it is, it sends a response with the provided status code (default is 400), the custom error message, and the error details.
 * 3. If the error is not an instance of the Error class, it sends a response with the provided status code, the custom error message, and a generic 'Unknown error' message.
 *
 * This utility is used to handle errors in API routes consistently and provide meaningful error messages to the client.
 */

import { NextApiResponse } from 'next';

export function handleApiError(
  err: unknown,
  res: NextApiResponse,
  message: string,
  status = 400
) {
  if (err instanceof Error) {
    return res.status(status).json({ error: message, details: err.message });
  }
  return res.status(status).json({ error: message, details: 'Unknown error' });
}
