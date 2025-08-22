import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

//перевірка API
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

//404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

//Централізований обробник помилок
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[UnhandledError]', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

//Start server
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`API running on :${PORT}`);
});

export default app;
