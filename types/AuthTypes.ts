export interface JWTPayload {
  id: number;
  username: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}
