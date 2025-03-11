import { z } from 'zod'

// Common parameters for recurring transaction queries
export const recurringParams = z.object({
  userId: z.string(),
  teamId: z.string().optional(),
  bankAccountId: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  frequency: z.array(z.string()).optional(),
  start: z.number().default(0),
  end: z.number().default(() => Date.now()),
  limit: z.number().optional().default(100),
})
