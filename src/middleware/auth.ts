import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export type Role = 'admin' | 'manager' | 'employer' | 'jobseeker';

export interface AuthedUser {
  sub: string;   // user id
  role: Role;
}

export interface AuthedRequest extends Request {
  user?: AuthedUser;
}

/** Обов'язкова аутентифікація (Bearer) */
export function auth(req: AuthedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload = verifyAccessToken(token);
    req.user = { sub: payload.sub, role: payload.role as Role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/** Пропускає тільки користувачів із будь-якою з перелічених ролей */
export function hasRole(...roles: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

/** Дозволити власнику ресурсу АБО ролям */
export function isSelfOrRole(getOwnerId: (req: AuthedRequest) => string | null, ...roles: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const ownerId = getOwnerId(req);
    const isOwner = ownerId && ownerId === req.user.sub;
    const inRole = roles.includes(req.user.role);

    if (isOwner || inRole) return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
}
