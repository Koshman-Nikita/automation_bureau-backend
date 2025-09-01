import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { setupSwagger } from './config/swagger';

import authRouter from './routes/auth';
import activityTypesRouter from './routes/activityTypes';
import employersRouter from './routes/employers';
import jobseekersRouter from './routes/jobseekers';
import vacanciesRouter from './routes/vacancies';
import agreementsRouter from './routes/agreements';
import matchRouter from './routes/match';

export function createApp() {
  const app = express();

  // ---- Base & security middleware
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS з ENV (FRONTEND_URLS="http://localhost:4200,https://yourapp.com")
  const allowed = (process.env.FRONTEND_URLS || 'http://localhost:4200')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  app.use(cors({ origin: allowed, credentials: true }));

  // Rate limit (ENV: RATE_LIMIT_WINDOW_MIN, RATE_LIMIT_MAX)
  const windowMin = Number(process.env.RATE_LIMIT_WINDOW_MIN || 15);
  const maxReq = Number(process.env.RATE_LIMIT_MAX || 100);
  app.use(rateLimit({
    windowMs: windowMin * 60_000,
    max: maxReq,
    standardHeaders: true,
    legacyHeaders: false,
  }));

  // ---- Swagger 
  setupSwagger(app);

  // ---- Health
  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  // ---- API routes
  app.use('/api/auth', authRouter);         // ← ВАЖЛИВО: /api/auth
  app.use('/api/activity-types', activityTypesRouter);
  app.use('/api/employers', employersRouter);
  app.use('/api/jobseekers', jobseekersRouter);
  app.use('/api/vacancies', vacanciesRouter);
  app.use('/api/agreements', agreementsRouter);
  app.use('/api/match', matchRouter);

  // ---- 404
  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

  // ---- Global error handler 
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err?.status ?? 500;
    const message = status === 500 ? 'Internal Server Error' : (err?.message ?? 'Error');
    res.status(status).json({ error: message });
  });

  return app;
}
