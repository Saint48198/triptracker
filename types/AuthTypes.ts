import { NextApiRequest } from 'next';

export interface JWTPayload {
  id: number;
  username: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}

export interface CustomNextApiRequest extends NextApiRequest {
  user?: {
    id: number;
    username: string;
    email: string;
    roles: string[];
  };
}
