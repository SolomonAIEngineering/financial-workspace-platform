import { z } from 'zod';

export const manualSyncBankAccountSchema = z.object({
  connectionId: z.string(),
});

export const reconnectConnectionSchema = z.object({
  connectionId: z.string(),
  provider: z.enum(['plaid', 'teller', 'stripe', 'gocardless']),
});

export const bankConnectionSchema = z.object({
  accessToken: z.string(),
  institutionId: z.string(),
  itemId: z.string(),
  userId: z.string(),
  teamId: z.string(),
  provider: z.enum(['plaid', 'teller', 'stripe', 'gocardless']),
  accounts: z.array(
    z.object({
      account_id: z.string(),
      bank_name: z.string(),
      balance: z.number().optional(),
      currency: z.string(),
      name: z.string(),
      institution_id: z.string(),
      enabled: z.boolean(),
      logo_url: z.string().nullable().optional(),
      expires_at: z.string().nullable().optional(), // EnableBanking & GoCardLess
      type: z.enum([
        'credit',
        'depository',
        'other_asset',
        'loan',
        'other_liability',
      ]),
    })
  ),
});
