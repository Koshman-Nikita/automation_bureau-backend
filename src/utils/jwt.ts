// src/utils/jwt.ts
import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';

// Тип payload-а
export type JwtPayload = {
  sub: string;   // user id
  role: string;  // user role
  iat?: number;
  exp?: number;
};

// Секрети з .env
const ACCESS_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'dev_refresh_secret_change_me';

// Тривалість (через ms-парсер)
const ACCESS_EXPIRES:  SignOptions['expiresIn'] =
  (process.env.JWT_EXPIRES  as StringValue | undefined) ?? ('15m' as StringValue);
const REFRESH_EXPIRES: SignOptions['expiresIn'] =
  (process.env.REFRESH_EXPIRES as StringValue | undefined) ?? ('7d'  as StringValue);
/**
 * Підписати access-токен
 */
export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

/**
 * Підписати refresh-токен
 */
export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

/**
 * Верифікація access-токена
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

/**
 * Верифікація refresh-токена
 */
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}
