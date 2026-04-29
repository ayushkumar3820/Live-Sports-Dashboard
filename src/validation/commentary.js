import { z } from 'zod';

export const listCommentaryQuerySchema = z.object({
  limit: z.coerce.number().positive().max(100).optional(),
});

export const createCommentarySchema = z.object({
  minutes: z.number().nonnegative().int(),
  sequence: z.number().int(),
  period: z.string(),
  eventType: z.string(),
  actor: z.string(),
  team: z.string(),
  message: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
});

