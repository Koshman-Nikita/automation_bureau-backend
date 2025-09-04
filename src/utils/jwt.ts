// src/utils/jwt.ts
import jwt, { type Secret, type SignOptions, type JwtPayload as JwtStdPayload } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET ?? 'changeme';
const REFRESH_SECRET: Secret = process.env.REFRESH_SECRET ?? 'changeme';

const ACCESS_EXPIRES: SignOptions['expiresIn'] =
  (process.env.JWT_EXPIRES ?? '15m') as SignOptions['expiresIn'];
const REFRESH_EXPIRES: SignOptions['expiresIn'] =
  (process.env.REFRESH_EXPIRES ?? '7d') as SignOptions['expiresIn'];

export type JwtPayload = { sub: string; role: string; iat?: number; exp?: number };

export function signAccessToken(sub: string, role: string) {
  return jwt.sign({ sub, role }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export function signRefreshToken(sub: string, role: string) {
  return jwt.sign({ sub, role }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtStdPayload | string;
  if (typeof decoded === 'string') throw new Error('Invalid token payload');
  const { sub, role, iat, exp } = decoded as any;
  return { sub: String(sub), role: String(role), iat, exp };
}

export function verifyRefreshToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, REFRESH_SECRET) as JwtStdPayload | string;
  if (typeof decoded === 'string') throw new Error('Invalid token payload');
  const { sub, role, iat, exp } = decoded as any;
  return { sub: String(sub), role: String(role), iat, exp };
}
