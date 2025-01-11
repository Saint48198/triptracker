// utils/validatePassword.ts
export const validatePassword = (
  password: string,
  confirmPassword: string
): string | null => {
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  if (password.length < 12) {
    return 'Password must be at least 12 characters long.';
  }
  if (!/[a-zA-Z0-9]/.test(password)) {
    return 'Password must include at least one alphanumeric character.';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must include at least one special character.';
  }
  return null;
};
