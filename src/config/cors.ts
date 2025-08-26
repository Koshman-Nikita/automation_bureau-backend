// src/config/cors.ts
import type { CorsOptions } from 'cors';

export function buildCorsOptions(): CorsOptions {
  const list = (process.env.FRONTEND_URLS || 'http://localhost:4200')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return {
    origin(origin, cb) {
      if (!origin || list.includes(origin)) return cb(null, true);
      cb(new Error('CORS: Origin not allowed'));
    },
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600, 
  };
}
