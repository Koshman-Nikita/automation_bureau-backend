import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Некоректний ObjectId');

export const createVacancySchema = z.object({
  employerId: objectId,
  title: z.string().trim().min(2, 'Мінімум 2 символи'),
  position: z.string().trim().min(1).optional(), 
  activityType: z.string().trim().min(1).nullable().optional(),
  skills: z.array(z.string().trim().min(1)).default([]),
  salary: z.number().nonnegative().nullable().optional(),
  status: z.enum(['open', 'closed']).default('open'),
});

export const updateVacancySchema = z.object({
  employerId: objectId.optional(),
  title: z.string().trim().min(2).optional(),
  position: z.string().trim().min(1).optional(),
  activityType: z.string().trim().min(1).nullable().optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
  salary: z.number().nonnegative().nullable().optional(),
  status: z.enum(['open', 'closed']).optional(),
});

export const listVacancyQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().trim().optional(),
  employer: objectId.optional(), 
  status: z.enum(['open', 'closed']).optional(),
  activityType: z.string().trim().min(1).optional(),
});
