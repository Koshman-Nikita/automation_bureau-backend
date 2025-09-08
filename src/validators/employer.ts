import { z } from 'zod';

export const createEmployerSchema = z.object({
  name: z.string().trim().min(2, 'Мінімум 2 символи'),
  phone: z.string().trim().min(5).optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),    
  activityType: z.string().trim().optional(),
});

export const updateEmployerSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().trim().min(5).optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  activityType: z.string().trim().optional(),
});

export const listEmployerQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().trim().optional(),
});
