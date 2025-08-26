// src/index.ts
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { buildCorsOptions } from './config/cors';
import { httpLogger, logger } from './config/logger';

const app = express();

/** Довіряти проксі (якщо буде reverse-proxy) — коректні IP у rate-limit */
app.set('trust proxy', 1);

/** Логування HTTP */
app.use(httpLogger);

/** Безпечні заголовки */
app.use(helmet({
  // приклад дозволу вбудованих ресурсів тільки з self (за потреби розширите)
  contentSecurityPolicy: false, // вмикайте CSP, коли знатимете усі джерела
  referrerPolicy: { policy: 'no-referrer' },
}));

/** Стиснення відповідей */
app.use(compression());

/** CORS (тільки дозволені origin-и) */
app.use(cors(buildCorsOptions()));

/** Парсер JSON */
app.use(express.json({ limit: '1mb' }));

/** Rate limit (за замовчуванням 100 запитів / 15 хв з одного IP) */
const windowMin = Number(process.env.RATE_LIMIT_WINDOW_MIN || 15);
const maxReq = Number(process.env.RATE_LIMIT_MAX || 100);
app.use(rateLimit({
  windowMs: windowMin * 60 * 1000,
  max: maxReq,
  standardHeaders: true,
  legacyHeaders: false,
}));

/** Health-check */
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

/** 404 для всіх інших маршрутів */
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

/** Централізований обробник помилок */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // лог у pino
  logger.error({ err }, '[UnhandledError]');
  const status = err?.status || 500;
  const message = status === 500 ? 'Internal Server Error' : (err?.message || 'Error');
  res.status(status).json({ error: message });
});

/** Запуск сервера */
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  logger.info(`API running on :${PORT}`);
});

export default app;
