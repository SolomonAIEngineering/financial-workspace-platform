import { z } from 'zod';

// Define an enum for connection status values
export enum SyncStatus {
  FAILED = 'FAILED',
  SYNCING = 'SYNCING',
  COMPLETED = 'COMPLETED',
}

export enum ExportStatus {
  FAILED = 'FAILED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

// Currency schema for a single currency
export const currencySchema = z.object({
  code: z.string().min(3).max(3), // Currency codes are 3 characters (ISO 4217)
  name: z.string().min(1),
  symbol: z.string().min(1),
});

// Schema for the array of currencies
export const currenciesSchema = z.array(currencySchema);

// Type definitions derived from the schema
export type Currency = z.infer<typeof currencySchema>;
export type Currencies = z.infer<typeof currenciesSchema>;

// The currencies data, validated against the schema
export const currencies = currenciesSchema.parse([
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
]);
