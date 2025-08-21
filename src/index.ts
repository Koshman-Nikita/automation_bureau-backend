// src/index.ts
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app = express();

// ---- Global middleware
app.use(cors());
app.use(express.json());

// ---- Health check (швидка перевірка, що API живе)
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

// ---- 404 для невідомих маршрутів
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// ---- Централізований обробник помилок (щоб не падати з 500 без відповіді)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // у проді логування краще віддати логеру
  console.error('[UnhandledError]', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ---- Start server
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`API running on :${PORT}`);
});

export default app; // стане у пригоді для тестів у майбутньому
