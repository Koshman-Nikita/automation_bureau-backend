import { z } from 'zod';

export const createJobseekerSchema = z.object({
  fullName: z.string().min(2).max(200),
  skills: z.array(z.string().min(1)).default([]).optional(),
  city: z.string().max(120).optional(),
  salaryDesired: z.coerce.number().positive().optional(),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

export const updateJobseekerSchema = createJobseekerSchema.partial();

export const listJobseekerQuery = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  q: z.string().trim().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});
