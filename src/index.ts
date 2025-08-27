// src/index.ts
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { buildCorsOptions } from './config/cors';
import { httpLogger, logger } from './config/logger';

// +++ Swagger + роути
import { setupSwagger } from './config/swagger';
import activityTypesRouter from './routes/activityTypes';
import employersRouter from './routes/employers';
import jobseekersRouter from './routes/jobseekers';
import vacanciesRouter from './routes/vacancies';
import agreementsRouter from './routes/agreements';

const app = express();

app.set('trust proxy', 1);
app.use(httpLogger);

app.use(
  helmet({
    contentSecurityPolicy: false,
    referrerPolicy: { policy: 'no-referrer' },
  })
);

app.use(compression());
app.use(cors(buildCorsOptions()));
app.use(express.json({ limit: '1mb' }));

const windowMin = Number(process.env.RATE_LIMIT_WINDOW_MIN || 15);
const maxReq = Number(process.env.RATE_LIMIT_MAX || 100);
app.use(
  rateLimit({
    windowMs: windowMin * 60 * 1000,
    max: maxReq,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ===== Swagger UI
setupSwagger(app);

// ===== Health
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

// ===== Роути-стаби (перед 404)
app.use('/api/activity-types', activityTypesRouter);
app.use('/api/employers', employersRouter);
app.use('/api/jobseekers', jobseekersRouter);
app.use('/api/vacancies', vacanciesRouter);
app.use('/api/agreements', agreementsRouter);

// ===== 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// ===== Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, '[UnhandledError]');
  const status = err?.status || 500;
  const message = status === 500 ? 'Internal Server Error' : err?.message || 'Error';
  res.status(status).json({ error: message });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  logger.info(`API running on :${PORT}`);
});

export default app;
