import { z } from 'zod';

export const matchQuery = z.object({
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  minScore: z.coerce.number().min(0).default(1).optional(),
});
