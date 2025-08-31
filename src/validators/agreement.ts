import { z } from 'zod';

export const createAgreementSchema = z.object({
  vacancyId: z.string().min(10),
  jobseekerId: z.string().min(10),
  date: z.coerce.date(),
  commissionPct: z.coerce.number().min(0).max(100).optional(),
  amount: z.coerce.number().nonnegative().optional(),
});

export const updateAgreementSchema = createAgreementSchema.partial();

export const listAgreementQuery = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  vacancyId: z.string().optional(),
  jobseekerId: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});
