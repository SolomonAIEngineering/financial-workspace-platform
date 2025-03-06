/**
 * Represents a financial transaction with its essential properties.
 *
 * @interface Transaction
 *
 * @property {string} date - The date of the transaction in any common format (e.g., 'YYYY-MM-DD', 'DD/MM/YYYY')
 * @property {string} description - A text description of the transaction
 * @property {string} amount - The transaction amount as a string, supporting various number formats
 * @property {string} teamId - The unique identifier for the team associated with the transaction
 * @property {string} bankAccountId - The unique identifier for the bank account
 * @property {string} currency - The currency code for the transaction (e.g., 'USD', 'EUR')
 *
 * @example
 * ```typescript
 * const transaction: Transaction = {
 *   date: '2024-03-15',
 *   description: 'Monthly Subscription',
 *   amount: '1234.56',
 *   teamId: 'team_123',
 *   bankAccountId: 'account_456',
 *   currency: 'USD'
 * };
 * ```
 */
export type Transaction = {
  date: string
  description: string
  amount: string
  teamId: string
  bankAccountId: string
  currency: string
}
