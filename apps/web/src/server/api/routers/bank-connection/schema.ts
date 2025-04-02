import { BankConnectionProvider } from '@solomonai/prisma';
import { z } from 'zod';

const AccountSchema = z.object({
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
});

export const CreateBankConnectionSchema = z.object({
  institutionId: z.string(),
  accessToken: z.string(),
  itemId: z.string(),
  userId: z.string(),
  teamId: z.string(),
  provider: z.nativeEnum(BankConnectionProvider),
  accounts: z.array(AccountSchema),
});
