import 'dotenv/config';
import { createServer } from 'http';
import { createApp } from './app';
import { connectDB }  from './config/db';

const { PORT = 4000, MONGODB_URI } = process.env;

async function start() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }

  // 1) DB
  await connectDB(MONGODB_URI);

  // 2) App
  const app = createApp();

  // 3) Server
  const server = createServer(app);
  server.listen(PORT, () => {
    console.log(`✅ API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('❌ Failed to start server', err);
  process.exit(1);
});

export {};
