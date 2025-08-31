import { z } from 'zod';

export const createActivityTypeSchema = z.object({
  name: z.string().min(2).max(100),
  isActive: z.boolean().optional().default(true),
});

export const updateActivityTypeSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  isActive: z.boolean().optional(),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  q: z.string().trim().optional(),
  isActive: z.coerce.boolean().optional(),
});
