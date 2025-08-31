import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

const ACCESS_SECRET: Secret = (process.env.JWT_SECRET ?? 'dev_secret_change_me') as Secret;
const REFRESH_SECRET: Secret = (process.env.REFRESH_SECRET ?? 'dev_refresh_secret_change_me') as Secret;

// expiresIn: number | ms.StringValue | undefined
type Expires = NonNullable<SignOptions['expiresIn']>;

const ACCESS_EXPIRES: Expires = (process.env.JWT_EXPIRES || '15m') as Expires;
const REFRESH_EXPIRES: Expires = (process.env.REFRESH_EXPIRES || '7d') as Expires;

export interface JwtPayload {
  sub: string;
  role: string;
}

const accessOpts: SignOptions = { expiresIn: ACCESS_EXPIRES };
const refreshOpts: SignOptions = { expiresIn: REFRESH_EXPIRES };

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, accessOpts);
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, refreshOpts);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}
