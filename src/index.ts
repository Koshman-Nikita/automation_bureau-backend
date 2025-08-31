// src/index.ts
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { buildCorsOptions } from './config/cors';
import { httpLogger, logger } from './config/logger';
import authRouter from './routes/auth';
// Swagger + роути
import { setupSwagger } from './config/swagger';
import activityTypesRouter from './routes/activityTypes';
import employersRouter from './routes/employers';
import jobseekersRouter from './routes/jobseekers';
import vacanciesRouter from './routes/vacancies';
import agreementsRouter from './routes/agreements';
import dbHealthRouter from './routes/dbHealth';
import matchRouter from './routes/match';


// Mongo
import { connectDB, disconnectDB } from './config/db';


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

// Swagger
setupSwagger(app);

// Health
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

// DB health
app.use('/api/db-health', dbHealthRouter);

app.use('/api/auth', authRouter);
// API стуби
app.use('/api/activity-types', activityTypesRouter);
app.use('/api/employers', employersRouter);
app.use('/api/jobseekers', jobseekersRouter);
app.use('/api/vacancies', vacanciesRouter);
app.use('/api/agreements', agreementsRouter);
app.use('/api/match', matchRouter);
// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, '[UnhandledError]');
  const status = err?.status || 500;
  const message = status === 500 ? 'Internal Server Error' : err?.message || 'Error';
  res.status(status).json({ error: message });
});

const PORT = Number(process.env.PORT) || 4000;
let server: import('http').Server;

async function start() {
  try {
    await connectDB(process.env.MONGODB_URI || '');
    server = app.listen(PORT, () => logger.info(`API running on :${PORT}`));
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

async function shutdown() {
  logger.warn('Shutting down...');
  try {
    await disconnectDB();
  } catch {}
  server?.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();

export default app;
