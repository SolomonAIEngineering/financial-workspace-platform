import { z } from 'zod';

export const manualSyncBankAccountSchema = z.object({
  connectionId: z.string(),
});

export const bankConnectionSchema = z.object({
  accessToken: z.string(),
  institutionId: z.string(),
  itemId: z.string(),
  publicToken: z.string(),
  userId: z.string(),
});
