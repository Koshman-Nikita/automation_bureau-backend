// src/index.ts
import 'dotenv/config';
import { createApp } from './app';
import { connectDB } from './config/db';

const { PORT = 4000, MONGODB_URI } = process.env;

async function start() {
  // передаємо URI з .env
  await connectDB(MONGODB_URI!);

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`API running on :${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});