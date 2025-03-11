import { z } from 'zod';

// Common parameters for transaction queries
export const transactionParams = z.object({
    userId: z.string(),
    teamId: z.string().optional(),
    bankAccountId: z.array(z.string()).optional(),
    category: z.array(z.string()).optional(),
    merchantName: z.array(z.string()).optional(),
    start: z.number().default(0),
    end: z.number().default(() => Date.now()),
    limit: z.number().optional().default(100),
}); 