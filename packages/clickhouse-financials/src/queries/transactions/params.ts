import { z } from 'zod'

/**
 * Common parameters schema for transaction queries.
 *
 * This schema defines the standard parameters used across all transaction-related
 * query functions. It provides a consistent interface for filtering and paginating
 * transaction data.
 *
 * @property userId - Required. The unique identifier of the user whose transactions to query
 * @property teamId - Optional. The team identifier for team-based queries
 * @property bankAccountId - Optional. Array of bank account IDs to filter transactions by
 * @property category - Optional. Array of transaction categories to filter by
 * @property merchantName - Optional. Array of merchant names to filter transactions by
 * @property start - Unix timestamp in milliseconds for the start date of the query range (defaults to 0)
 * @property end - Unix timestamp in milliseconds for the end date of the query range (defaults to current time)
 * @property limit - Maximum number of records to return (defaults to 100)
 */
export const transactionParams = z.object({
  userId: z.string(),
  teamId: z.string().optional(),
  bankAccountId: z.array(z.string()).optional(),
  category: z.array(z.string()).optional(),
  merchantName: z.array(z.string()).optional(),
  start: z.number().default(0),
  end: z.number().default(() => Date.now()),
  limit: z.number().optional().default(100),
})
