import jwt from 'jsonwebtoken';
import type { AuthPayload } from '../middleware/auth';

const SECRET = process.env.JWT_SECRET ?? 'dev-secret';

/** Signs a JWT and returns the token string. Expires in 24 hours. */
export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '24h' });
}

/** Verifies a JWT and returns the decoded payload, or null if invalid. */
export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, SECRET) as AuthPayload;
  } catch {
    return null;
  }
}
