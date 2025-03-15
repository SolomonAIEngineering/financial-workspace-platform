import { APITransactionListResponse } from '@solomon-ai/workspace-financial-backend-sdk/resources/api-transactions.js';
import { AccountType } from '@/server/types/index';

/**
 * Interface representing the data required to transform a transaction from the
 * API format to the internal application format.
 *
 * @property {APITransactionListResponse.Data} transaction - The transaction
 *   data from the API
 * @property {string} teamId - The ID of the team associated with the
 *   transaction
 * @property {string} bankAccountId - The ID of the bank account associated with
 *   the transaction
 * @property {boolean} [notified] - Optional flag indicating if a notification
 *   has been sent for this transaction
 * @interface TransformTransactionData
 */
type TransformTransactionData = {
  transaction: APITransactionListResponse.Data;
  teamId: string;
  bankAccountId: string;
  notified?: boolean;
};

/**
 * Interface representing the internal transaction model used within the
 * application. This is the transformed version of the API transaction data.
 *
 * @property {string} name - The name or title of the transaction
 * @property {string} internal_id - A unique identifier for the transaction
 *   within the system
 * @property {string | null} category_slug - The category of the transaction, if
 *   available
 * @property {string} bank_account_id - The ID of the bank account associated
 *   with the transaction
 * @property {string | null} description - A detailed description of the
 *   transaction, if available
 * @property {number | null} balance - The account balance after this
 *   transaction, if available
 * @property {string} currency - The currency code for the transaction amount
 * @property {string | null} method - The payment method used for the
 *   transaction, if available
 * @property {number} amount - The transaction amount
 * @property {string} team_id - The ID of the team associated with the
 *   transaction
 * @property {string} date - The date when the transaction occurred
 * @property {'posted' | 'pending'} status - The current status of the
 *   transaction
 * @property {boolean} [notified] - Optional flag indicating if a notification
 *   has been sent for this transaction
 * @interface Transaction
 */
type Transaction = {
  name: string;
  internal_id: string;
  category_slug: string | null;
  bank_account_id: string;
  description: string | null;
  balance: number | null;
  currency: string;
  method: string | null;
  amount: number;
  team_id: string;
  date: string;
  status: 'posted' | 'pending';
  notified?: boolean;
};

/**
 * Transforms a transaction from the API format to the internal application
 * format.
 *
 * This function takes transaction data from the API and converts it to the
 * standardized internal format used throughout the application. It creates a
 * unique internal ID by combining the team ID and transaction ID, and handles
 * optional notification status.
 *
 * @param {TransformTransactionData} params - The transaction data to transform
 * @param {APITransactionListResponse.Data} params.transaction - The transaction
 *   data from the API
 * @param {string} params.teamId - The ID of the team associated with the
 *   transaction
 * @param {string} params.bankAccountId - The ID of the bank account associated
 *   with the transaction
 * @param {boolean} [params.notified] - Optional flag indicating if a
 *   notification has been sent
 * @returns {Transaction} The transformed transaction in the internal format
 */
export function transformTransaction({
  transaction,
  teamId,
  bankAccountId,
  notified,
}: TransformTransactionData): Transaction {
  return {
    name: transaction.name,
    description: transaction.description,
    date: transaction.date,
    amount: transaction.amount,
    currency: transaction.currency,
    method: transaction.method,
    internal_id: `${teamId}_${transaction.id}`,
    category_slug: transaction.category,
    bank_account_id: bankAccountId,
    balance: transaction.balance,
    team_id: teamId,
    status: transaction.status,
    // If the transactions are being synced manually, we don't want to notify
    // And using upsert, we don't want to override the notified value
    ...(notified ? { notified } : {}),
  };
}

/**
 * Gets the classification string for a given account type.
 *
 * This function maps the internal AccountType enum to standardized
 * classification strings that can be used for categorization, filtering, or
 * display purposes. If an unknown account type is provided, it defaults to
 * "depository".
 *
 * @param {AccountType} type - The account type enum value to classify
 * @returns {string} The classification string for the account type: "credit",
 *   "depository", "loan", or "investment"
 */
export function getClassification(type: AccountType) {
  switch (type) {
    case AccountType.CREDIT:
      return 'credit';
    case AccountType.DEPOSITORY:
      return 'depository';
    case AccountType.LOAN:
      return 'loan';
    case AccountType.INVESTMENT:
      return 'investment';
    default:
      return 'depository';
  }
}
