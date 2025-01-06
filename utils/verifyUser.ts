import db from '@/database/db';
import bcrypt from 'bcrypt';

/**
 * Verifies a user's credentials against the database.
 * @param username - The username of the user attempting to log in.
 * @param password - The plaintext password to validate.
 * @returns The user object if credentials are valid, null otherwise.
 */
export async function verifyUser(username: string, password: string) {
  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  try {
    // Fetch user by username
    const query = 'SELECT * FROM users WHERE username = ? LIMIT 1';
    const user = db.prepare(query).get(username);

    if (!user) {
      return { error: 'Invalid username or password' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return { error: 'Invalid username or password' };
    }

    return { user };
  } catch (error: any) {
    return { error: 'Internal Server Error', details: error.message };
  }
}
