import { z } from 'zod';

export const createActivityTypeSchema = z.object({
  name: z.string().trim().min(2, 'Мінімум 2 символи'),
});

export const updateActivityTypeSchema = z.object({
  name: z.string().trim().min(2).optional(),
});

export const listActivityTypeQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().trim().optional(),
});
