// src/config/logger.ts
import pino from 'pino';
import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
      : undefined,
});

export const httpLogger = pinoHttp({
  logger,

  // кореляційний id
  genReqId(req: IncomingMessage, _res: ServerResponse) {
    return (req.headers['x-request-id'] as string) || randomUUID();
  },

  // рівень логу залежно від статусу
  customLogLevel(_req: IncomingMessage, res: ServerResponse, err?: Error) {
    const code = res.statusCode; // number
    if (err || code >= 500) return 'error';
    if (code >= 400) return 'warn';
    return 'info';
  },

  // лаконічні серіалізатори
  serializers: {
    req(req: IncomingMessage) {
      return { method: req.method, url: req.url };
    },
    res(res: ServerResponse) {
      return { statusCode: res.statusCode };
    },
  },
});
