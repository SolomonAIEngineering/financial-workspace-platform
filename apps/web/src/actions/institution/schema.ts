import { z } from 'zod';

export const createPlaidLinkTokenSchema = z.object({
  accessToken: z.string().optional().nullable(),
});

export const reconnectGoCardLessLinkSchema = z.object({
  id: z.string(),
  institutionId: z.string(),
  availableHistory: z.number(),
  isDesktop: z.boolean(),
  redirectTo: z.string(),
});

export const getInstitutionsSchema = z.object({
  countryCode: z.string(),
  query: z.string().optional(),
});

export const getAccountsSchema = z.object({
  id: z.string().optional(),
  accessToken: z.string().optional(),
  institutionId: z.string().optional(),
  provider: z.enum(['gocardless', 'teller', 'plaid']),
});

/** Schema for validating the public token to be exchanged */
export const exchangePublicTokenSchema = z.object({
  publicToken: z.string(),
});
