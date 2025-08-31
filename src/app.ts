// src/app.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { setupSwagger } from './config/swagger';
import activityTypesRouter from './routes/activityTypes';
import employersRouter from './routes/employers';
import jobseekersRouter from './routes/jobseekers';
import vacanciesRouter from './routes/vacancies';
import agreementsRouter from './routes/agreements';
import matchRouter from './routes/match';

export function createApp() {
  const app = express();

  // базові middleware
  app.use(express.json());
  app.use(helmet());
  app.use(compression());
  app.use(cors({ origin: (process.env.FRONTEND_URLS || '').split(',').map(s => s.trim()).filter(Boolean) || '*' }));

  // rate-limit (просте)
  const windowMin = Number(process.env.RATE_LIMIT_WINDOW_MIN || 15);
  const maxReq = Number(process.env.RATE_LIMIT_MAX || 100);
  app.use(rateLimit({ windowMs: windowMin * 60_000, max: maxReq, standardHeaders: true, legacyHeaders: false }));

  // swagger
  setupSwagger(app);

  // health
  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  // api
  app.use('/api/activity-types', activityTypesRouter);
  app.use('/api/employers', employersRouter);
  app.use('/api/jobseekers', jobseekersRouter);
  app.use('/api/vacancies', vacanciesRouter);
  app.use('/api/agreements', agreementsRouter);
  app.use('/api/match', matchRouter);

  // 404
  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

  return app;
}
