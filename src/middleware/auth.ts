// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';

// Ролі, які підтримує застосунок
export type Role = 'admin' | 'manager' | 'employer' | 'jobseeker';

// Додаємо user до Express.Request (щоб не кастити до any)
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Перевіряє Bearer-токен в Authorization.
 * Якщо валідний — кладе payload у req.user.
 */
export function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = header.slice(7).trim();
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload: JwtPayload = verifyAccessToken(token);
    req.user = payload; // { sub, role, iat, exp }
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

/**
 * Guard за ролями. Використання: hasRole('admin','manager')
 */
export function hasRole(...allowed: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role as Role | undefined;
    if (!role) return res.status(401).json({ error: 'Unauthorized' });
    if (!allowed.includes(role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
