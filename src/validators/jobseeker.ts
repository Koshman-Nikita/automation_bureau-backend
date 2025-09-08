// validators/jobseeker.ts
import { z } from 'zod';

const zStr = z.string().trim();

export const listJobseekerQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: zStr.optional(),
  status: z.enum(['searching', 'employed']).optional(),
  city: zStr.optional(),
  activityType: zStr.optional(),  
  qualification: zStr.optional(), 
});

export const createJobseekerSchema = z.object({
  fullName: zStr.min(2, 'Мінімум 2 символи'),
  qualifications: z.array(zStr.min(1)).default([]),
  activityType: z.preprocess(
    (v) => (v === null || v === undefined ? null : String(v).trim()),
    z.string().min(1).nullable()
  ).optional(),
  city: zStr.optional(),
  salaryDesired: z.coerce.number().nonnegative().nullable().optional(),

  status: z.enum(['searching', 'employed']).default('searching'),
}).strict();

export const updateJobseekerSchema = createJobseekerSchema.partial().strict();
