import { z } from 'zod'

/**
 * Common parameters schema for recurring transaction queries.
 *
 * This schema defines the standard parameters used across all recurring transaction-related
 * query functions. It provides a consistent interface for filtering and paginating
 * recurring transaction data.
 *
 * Recurring transactions represent scheduled, repeating financial activities such as
 * subscriptions, regular bills, or recurring revenue streams. These parameters allow
 * for filtering based on various attributes of these transactions.
 *
 * @property userId - Required. The unique identifier of the user whose recurring transactions to query
 * @property teamId - Optional. The team identifier for team-based queries
 * @property bankAccountId - Optional. Array of bank account IDs to filter recurring transactions by
 * @property status - Optional. Array of statuses to filter by (e.g., 'active', 'pending', 'completed')
 * @property frequency - Optional. Array of frequency types to filter by (e.g., 'monthly', 'weekly', 'annual')
 * @property start - Unix timestamp in milliseconds for the start date of the query range (defaults to 0)
 * @property end - Unix timestamp in milliseconds for the end date of the query range (defaults to current time)
 * @property limit - Maximum number of records to return (defaults to 100)
 */
export const recurringParams = z.object({
  userId: z.string(),
  teamId: z.string().optional(),
  bankAccountId: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  frequency: z.array(z.string()).optional(),
  start: z.number().default(0),
  end: z.number().default(() => Date.now()),
  limit: z.number().optional().default(100),
})
