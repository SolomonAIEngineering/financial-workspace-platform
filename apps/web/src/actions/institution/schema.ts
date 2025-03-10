import { z } from 'zod';

export const createPlaidLinkTokenSchema = z.object({
  accessToken: z.string().optional().nullable(),
});
