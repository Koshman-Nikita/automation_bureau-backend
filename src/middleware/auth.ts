// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';

export function auth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  const token = h.slice(7).trim();
  try {
    const payload: JwtPayload = verifyAccessToken(token);
    (req as any).user = payload; 
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export function hasRole(...allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as JwtPayload | undefined;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (!allowed.length || allowed.includes(user.role)) return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
}
