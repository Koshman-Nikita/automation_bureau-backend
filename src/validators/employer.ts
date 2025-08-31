import { z } from 'zod';

export const createEmployerSchema = z.object({
  name: z.string().min(2).max(200),
  city: z.string().max(120).optional(),
  contacts: z.string().max(500).optional(),
});

export const updateEmployerSchema = createEmployerSchema.partial();

export const listEmployerQuery = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  q: z.string().trim().optional(),
});
