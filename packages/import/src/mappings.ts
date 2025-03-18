/**
 * @file Transaction mapping utilities for importing transaction data
 * @module import/mappings
 */

import type { Transaction } from "./types";

/**
 * Maps raw imported data to transaction objects using a mapping configuration
 * 
 * This function transforms an array of raw data records into transaction objects
 * by applying field mappings and adding additional required properties.
 * 
 * @param data - Raw data array from import source, where each record is a key-value object
 * @param mappings - Object defining how source fields map to transaction properties
 *                   (e.g., { "amount": "Transaction Amount", "date": "Transaction Date" })
 * @param currency - The currency code to apply to all transactions (e.g., "USD")
 * @param teamId - The team ID to associate with all transactions
 * @param bankAccountId - The bank account ID to associate with all transactions
 * 
 * @returns An array of Transaction objects with mapped fields and additional properties
 * 
 * @example
 * ```typescript
 * const rawData = [
 *   { "Transaction Date": "2023-01-01", "Transaction Amount": "100", "Description": "Payment" },
 *   { "Transaction Date": "2023-01-02", "Transaction Amount": "-50", "Description": "Withdrawal" }
 * ];
 * 
 * const fieldMappings = {
 *   "date": "Transaction Date",
 *   "amount": "Transaction Amount",
 *   "name": "Description"
 * };
 * 
 * const transactions = mapTransactions(
 *   rawData,
 *   fieldMappings,
 *   "USD",
 *   "team-123",
 *   "account-456"
 * );
 * ```
 */
export const mapTransactions = (
  data: Record<string, string>[],
  mappings: Record<string, string>,
  currency: string,
  teamId: string,
  bankAccountId: string,
): Transaction[] => {
  return data.map((row) => ({
    ...(Object.fromEntries(
      Object.entries(mappings)
        .filter(([_, value]) => value !== "")
        .map(([key, value]) => [key, row[value]]),
    ) as Transaction),
    currency,
    teamId,
    bankAccountId,
  }));
};
