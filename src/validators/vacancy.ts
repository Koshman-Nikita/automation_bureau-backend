import { z } from 'zod';

export const createVacancySchema = z.object({
  title: z.string().min(2).max(200),
  employerId: z.string().min(10), 
  salaryMin: z.coerce.number().nonnegative().optional(),
  salaryMax: z.coerce.number().nonnegative().optional(),
  status: z.enum(['open', 'closed']).optional().default('open'),
}).refine(d => !d.salaryMax || !d.salaryMin || d.salaryMax >= d.salaryMin, {
  message: 'salaryMax must be >= salaryMin',
  path: ['salaryMax'],
});

export const updateVacancySchema = createVacancySchema.partial();

export const listVacancyQuery = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  q: z.string().trim().optional(),
  status: z.enum(['open', 'closed']).optional(),
  employerId: z.string().optional(),
});
