import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Некоректний ObjectId');

export const createAgreementSchema = z.object({
  employerId: objectId,
  jobseekerId: objectId,
  vacancyId: objectId.nullable().optional(),
  position: z.string().trim().min(2, 'Мінімум 2 символи'),
  commission: z.number().nonnegative().nullable().optional(),
});

export const updateAgreementSchema = z.object({
  employerId: objectId.optional(),
  jobseekerId: objectId.optional(),
  vacancyId: objectId.nullable().optional(),
  position: z.string().trim().min(2).optional(),
  commission: z.number().nonnegative().nullable().optional(),
});

export const listAgreementQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  vacancyId: objectId.optional(),
  jobseekerId: objectId.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});
