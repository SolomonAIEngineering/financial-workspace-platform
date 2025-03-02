/**
 * Plaid service for connecting to bank accounts
 *
 * This service provides functions for interacting with the Plaid API. In a real
 * implementation, you would need to:
 *
 * 1. Install the plaid package: pnpm add plaid
 * 2. Add Plaid API keys to your environment variables
 */

import type { BankAccount, BankConnection } from '@prisma/client';

import {
  type CountryCode,
  type LinkTokenCreateRequest,
  type Products,
  Configuration,
  PlaidApi,
  PlaidEnvironments,
} from 'plaid';

// Initialize the Plaid client with environment variables
// Note: These environment variables need to be added to your env.mjs file
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID || '';
const PLAID_SECRET = process.env.PLAID_SECRET || '';
const PLAID_ENV = (process.env.PLAID_ENV ||
  'sandbox') as keyof typeof PlaidEnvironments;
const PLAID_WEBHOOK_URL = process.env.PLAID_WEBHOOK_URL;

if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
  console.warn(
    'Missing Plaid credentials. Set PLAID_CLIENT_ID and PLAID_SECRET environment variables.'
  );
}

// Initialize the Plaid client
const configuration = new Configuration({
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
  basePath: PlaidEnvironments[PLAID_ENV],
});

const plaidClient = new PlaidApi(configuration);

/**
 * Creates a link token for the Plaid Link flow
 *
 * @param userId The ID of the user
 * @param redirectUri Optional redirect URI for OAuth flow
 * @returns The link token
 */
export const createLinkToken = async (
  userId: string,
  redirectUri?: string
): Promise<string> => {
  try {
    const request: LinkTokenCreateRequest = {
      client_name: 'Simfiny', // Your app name
      country_codes: ['US'] as CountryCode[],
      language: 'en',
      products: ['auth', 'transactions'] as Products[],
      user: { client_user_id: userId },
    };

    // If webhook URL is provided in env vars, add it to the request
    if (PLAID_WEBHOOK_URL) {
      request.webhook = PLAID_WEBHOOK_URL;
    }
    // If redirectUri is provided, add it to the request for OAuth flow
    if (redirectUri) {
      request.redirect_uri = redirectUri;
    }

    const response = await plaidClient.linkTokenCreate(request);

    return response.data.link_token;
  } catch (error) {
    console.error('Error creating link token:', error);

    throw new Error(
      `Failed to create link token: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Exchanges a public token for an access token
 *
 * @param publicToken The public token from Plaid Link
 * @returns The access token and item ID
 */
export const exchangePublicToken = async (publicToken: string) => {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    return {
      accessToken: response.data.access_token,
      itemId: response.data.item_id,
    };
  } catch (error) {
    console.error('Error exchanging public token:', error);

    throw new Error(
      `Failed to exchange public token: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Gets the institution by ID
 *
 * @param institutionId The ID of the institution
 * @returns The institution details
 */
export const getInstitutionById = async (institutionId: string) => {
  try {
    const response = await plaidClient.institutionsGetById({
      country_codes: ['US'] as CountryCode[],
      institution_id: institutionId,
    });

    const institution = response.data.institution;

    return {
      id: institution.institution_id,
      logo: institution.logo,
      name: institution.name,
      oauthSupported: institution.oauth,
      primaryColor: institution.primary_color,
      url: institution.url,
    };
  } catch (error) {
    console.error('Error getting institution:', error);

    throw new Error(
      `Failed to get institution: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Gets the accounts for a given access token
 *
 * @param accessToken The access token from Plaid
 * @returns Array of accounts
 */
export const getAccounts = async (accessToken: string) => {
  try {
    const response = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    return response.data.accounts.map((account) => ({
      availableBalance: account.balances.available,
      balanceLastUpdated: new Date(),
      currentBalance: account.balances.current,
      isoCurrencyCode: account.balances.iso_currency_code,
      limit: account.balances.limit,
      mask: account.mask,
      name: account.name,
      officialName: account.official_name,
      plaidAccountId: account.account_id,
      subtype: mapAccountSubtype(account.subtype),
      type: mapAccountType(account.type),
    }));
  } catch (error) {
    console.error('Error getting accounts:', error);

    throw new Error(
      `Failed to get accounts: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Gets the transactions for a given access token
 *
 * @param accessToken The access token from Plaid
 * @param startDate The start date for transactions
 * @param endDate The end date for transactions
 * @returns Array of transactions
 */
export const getTransactions = async (
  accessToken: string,
  bankConnection: BankConnection,
  bankAccounts: BankAccount[],
  startDate: string,
  endDate: string
) => {
  try {
    // Create a map of plaidAccountId to bankAccount id for easy lookup
    const accountMap = new Map(
      bankAccounts.map((account) => [account.plaidAccountId, account.id])
    );

    let hasMore = true;
    let cursor: string | undefined;
    let allTransactions: any[] = [];

    // Paginate through all transactions
    while (hasMore) {
      const request: any = {
        access_token: accessToken,
        end_date: endDate,
        start_date: startDate,
      };

      if (cursor) {
        request.cursor = cursor;
      }

      const response = await plaidClient.transactionsSync(request);
      const data = response.data;

      // Map the transactions to our schema
      const mappedTransactions = data.added
        .map((transaction) => {
          const bankAccountId = accountMap.get(transaction.account_id);

          if (!bankAccountId) {
            console.warn(
              `No matching bank account found for transaction ${transaction.transaction_id}`
            );

            return null;
          }

          return {
            amount: transaction.amount,
            bankAccountId,
            bankConnectionId: bankConnection.id,
            category: mapTransactionCategory(transaction.category),
            date: new Date(transaction.date),
            description: transaction.original_description,
            isoCurrencyCode: transaction.iso_currency_code,
            location: transaction.location
              ? JSON.stringify(transaction.location)
              : null,
            merchantName: transaction.merchant_name,
            name: transaction.name,
            originalCategory: transaction.category?.join(', '),
            originalDescription: transaction.original_description,
            originalMerchantName: transaction.merchant_name,
            paymentChannel: transaction.payment_channel,
            pending: transaction.pending,
            plaidTransactionId: transaction.transaction_id,
            subCategory:
              transaction.category && transaction.category.length > 1
                ? transaction.category[1]
                : null,
            userId: bankConnection.userId,
          };
        })
        .filter(Boolean);

      allTransactions = [...allTransactions, ...mappedTransactions];

      hasMore = data.has_more;
      cursor = data.next_cursor;
    }

    return allTransactions;
  } catch (error) {
    console.error('Error syncing transactions:', error);

    throw new Error(
      `Failed to sync transactions: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Gets the item details for a given access token
 *
 * @param accessToken The access token from Plaid
 * @returns Item details
 */
export const getItemDetails = async (accessToken: string) => {
  try {
    const response = await plaidClient.itemGet({
      access_token: accessToken,
    });

    return {
      institutionId: response.data.item.institution_id,
      itemId: response.data.item.item_id,
      // Handle the case where status might not exist on the item type
      status: (response.data.item as any).status || {
        transactions: { last_successful_update: null },
      },
    };
  } catch (error) {
    console.error('Error getting item details:', error);

    throw new Error(
      `Failed to get item details: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Update banking item webhook
 *
 * @param accessToken The access token from Plaid
 * @param webhookUrl The new webhook URL
 */
export const updateItemWebhook = async (
  accessToken: string,
  webhookUrl: string
) => {
  try {
    const response = await plaidClient.itemWebhookUpdate({
      access_token: accessToken,
      webhook: webhookUrl,
    });

    return response.data;
  } catch (error) {
    console.error('Error updating item webhook:', error);

    throw new Error(
      `Failed to update item webhook: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Remove an item (disconnect a bank account)
 *
 * @param accessToken - The access token for the item
 * @returns Whether the item was successfully removed
 */
export const removeItem = async (accessToken: string): Promise<boolean> => {
  try {
    await plaidClient.itemRemove({
      access_token: accessToken,
    });

    // The response doesn't have a 'removed' property, but if we get here without an error, the item was removed
    return true;
  } catch (error) {
    console.error('Error removing item:', error);

    throw new Error(
      `Failed to remove item: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

// Helper function to map Plaid account types to our enum values
function mapAccountType(plaidType: string): any {
  const typeMap: Record<string, string> = {
    brokerage: 'BROKERAGE',
    credit: 'CREDIT',
    depository: 'DEPOSITORY',
    investment: 'INVESTMENT',
    loan: 'LOAN',
    other: 'OTHER',
  };

  return typeMap[plaidType.toLowerCase()] || 'OTHER';
}

// Helper function to map Plaid account subtypes to our enum values
function mapAccountSubtype(plaidSubtype: string | null): any {
  if (!plaidSubtype) return null;

  const subtypeMap: Record<string, string> = {
    'auto loan': 'AUTO_LOAN',
    'cash management': 'CASH_MANAGEMENT',
    cd: 'CD',
    checking: 'CHECKING',
    'credit card': 'CREDIT_CARD',
    etf: 'ETF',
    'health savings': 'HEALTH_SAVINGS',
    'money market': 'MONEY_MARKET',
    mortgage: 'MORTGAGE',
    'mutual fund': 'MUTUAL_FUND',
    paypal: 'PAYPAL',
    prepaid: 'PREPAID',
    retirement: 'RETIREMENT',
    savings: 'SAVINGS',
    stock: 'STOCK',
    'student loan': 'STUDENT_LOAN',
  };

  return subtypeMap[plaidSubtype.toLowerCase()] || 'OTHER';
}

// Helper function to map Plaid categories to our enum values
function mapTransactionCategory(plaidCategories: string[] | null): any {
  if (!plaidCategories || plaidCategories.length === 0) return null;

  const primaryCategory = plaidCategories[0]?.toLowerCase();

  const categoryMap: Record<string, string> = {
    'bank fees': 'BANK_FEES',
    entertainment: 'ENTERTAINMENT',
    'food and drink': 'FOOD_AND_DRINK',
    'general merchandise': 'GENERAL_MERCHANDISE',
    'general services': 'GENERAL_SERVICES',
    'government and non-profit': 'GOVERNMENT_AND_NON_PROFIT',
    'home improvement': 'HOME_IMPROVEMENT',
    income: 'INCOME',
    'loan payments': 'LOAN_PAYMENTS',
    medical: 'MEDICAL',
    'personal care': 'PERSONAL_CARE',
    transfer: 'TRANSFER',
    transportation: 'TRANSPORTATION',
    travel: 'TRAVEL',
    utilities: 'UTILITIES',
  };

  return categoryMap[primaryCategory] || 'OTHER';
}
