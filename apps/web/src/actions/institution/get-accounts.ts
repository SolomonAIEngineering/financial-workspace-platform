'use server';

import { authActionClient } from '../safe-action';
import { engine } from '@/lib/engine';
import { getAccountsSchema } from './schema';

/**
 * Fetches accounts from various financial data providers
 *
 * This server action retrieves accounts from different financial data providers
 * like GoCardLess, Teller, or Plaid. It supports filtering by account ID,
 * provider-specific tokens, and institution ID.
 *
 * @param {GetAccountParams} params - Parameters for fetching accounts
 * @param {string} [params.id] - Optional account ID to filter by
 * @param {string} [params.accessToken] - Optional provider access token
 * @param {string} [params.institutionId] - Optional institution ID (required
 *   for Plaid)
 * @param {string} params.provider - The financial data provider ("gocardless",
 *   "teller", or "plaid")
 * @returns {Promise<{ data: any[] }>} A promise that resolves to an object
 *   containing the sorted account data (sorted by balance amount descending)
 * @throws {Error} If the API request fails
 */
export const getAccountsAction = authActionClient
  .schema(getAccountsSchema)
  .action(
    async ({ parsedInput: { id, provider, accessToken, institutionId } }) => {
      try {
        const { data } = await engine.apiFinancialAccounts.list({
          id,
          provider,
          accessToken,
          institutionId,
        });

        return {
          data: data.sort((a, b) => b.balance.amount - a.balance.amount),
        };
      } catch (error) {
        console.error('Failed to get accounts:', error);
        throw new Error('Failed to get accounts');
      }
    }
  );
