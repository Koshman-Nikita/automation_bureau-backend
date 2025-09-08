import { z } from 'zod';

export const matchQuery = z.object({
  minScore: z.coerce.number().nonnegative().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
