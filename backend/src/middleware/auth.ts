import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  userId: string;
  email:  string;
  name:   string;
  role:   'student' | 'mentor' | 'admin';
}

// Extend Express Request to carry the decoded JWT payload
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * requireAuth
 * Reads the `ps_token` httpOnly cookie, verifies the JWT, and attaches
 * the decoded payload to `req.user`. Returns 401 if missing or invalid.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.ps_token as string | undefined;

  if (!token) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No session token found.' } });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET ?? 'dev-secret';
    const payload = jwt.verify(token, secret) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session token.' } });
  }
}
