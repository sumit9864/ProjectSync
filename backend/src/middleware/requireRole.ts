import { Request, Response, NextFunction } from 'express';
import type { AuthPayload } from './auth';

type Role = AuthPayload['role'];

/**
 * requireRole(...roles)
 * Returns a middleware that allows access only if req.user.role is in the
 * provided list. Must be used AFTER requireAuth.
 *
 * Usage:
 *   router.get('/admin/groups', requireAuth, requireRole('admin'), handler)
 *   router.get('/mentor/groups', requireAuth, requireRole('mentor', 'admin'), handler)
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required role: ${roles.join(' or ')}.`,
        },
      });
      return;
    }
    next();
  };
}
