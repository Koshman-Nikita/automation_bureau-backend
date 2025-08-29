// src/routes/dbHealth.ts
import { Router } from 'express';
import mongoose from 'mongoose';
const r = Router();

const stateName = (s: number) =>
  ({ 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' } as Record<number, string>)[s] ?? String(s);

r.get('/', async (_req, res) => {
  const state = stateName(mongoose.connection.readyState);
  let ok = false;
  let ping: unknown = null;
  let error: string | null = null;

  try {
    // admin().command доступний тільки після з’єднання
    ping = await mongoose.connection.db?.admin().command({ ping: 1 });
    ok = true;
  } catch (e: any) {
    error = e?.message || String(e);
  }

  res.json({ ok, state, ping, host: mongoose.connection.host, name: mongoose.connection.name });
});

export default r;
