// src/config/logger.ts
import pino from 'pino';
import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
    : undefined,
});

export const httpLogger = pinoHttp({
  logger,
  genReqId(req) {
    // пріоритезуємо кореляційний заголовок, інакше генеруємо новий
    return (req.headers['x-request-id'] as string) || randomUUID();
  },
  customLogLevel(res, err) {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    // лаконічні логи
    req(req) { return { method: req.method, url: req.url }; },
    res(res) { return { statusCode: res.statusCode }; },
  },
});
