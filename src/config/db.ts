// src/config/db.ts
import mongoose from 'mongoose';
import { logger } from './logger';

export async function connectDB(uri: string) {
  if (!uri) throw new Error('MONGODB_URI is not set');
  const dbName = process.env.DB_NAME || 'automation_bureau';

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, { dbName });
  logger.info({ dbName }, 'MongoDB connected');

  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('error', (err) => logger.error({ err }, 'MongoDB error'));
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
