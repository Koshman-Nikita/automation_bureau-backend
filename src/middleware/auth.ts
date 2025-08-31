// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from '../types/roles';

const ACCESS_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export interface JwtPayload {
  sub: string;     // user id
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: { id: string; role: Role; email?: string };
}

// Перевіряє токен та кладе user в req.user
export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : '';

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as JwtPayload;
    req.user = { id: decoded.sub, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Дозволяє лише вказані ролі
export function hasRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const r = req.user?.role;
    if (!r || !roles.includes(r)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
