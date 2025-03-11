/**
 * @module queries
 *
 * This module exports all query functions for the ClickHouse financial data platform.
 *
 * The queries are organized into three main categories:
 *
 * 1. **Transaction Queries** - Functions for retrieving and analyzing individual financial transactions.
 *    These queries provide access to transaction data with filtering, aggregation, and analysis capabilities.
 *    Examples include retrieving transactions by date range, analyzing spending by category or merchant,
 *    and identifying recurring transaction patterns.
 *
 * 2. **Recurring Transaction Queries** - Functions for working with scheduled, repeating financial activities.
 *    These queries provide access to recurring transaction data including subscriptions, regular bills,
 *    and recurring revenue streams. They support forecasting, cash flow projection, and status tracking.
 *
 * 3. **Business Metrics Queries** - Functions for calculating and retrieving key business performance indicators.
 *    These queries analyze financial data to provide insights into business health, including metrics like
 *    cash runway, MRR (Monthly Recurring Revenue) tracking, customer lifetime value, and expense analysis.
 *
 * Each query function follows a consistent pattern:
 * - Takes a ClickHouse client instance as input
 * - Returns a function that accepts query parameters
 * - Uses Zod schemas for parameter validation
 * - Returns structured, typed results
 *
 * @example
 * ```typescript
 * import { createClient } from '@clickhouse/client'
 * import { getTransactions, getCashRunway } from '@solomon/clickhouse-financials/queries'
 *
 * // Create ClickHouse client
 * const client = createClient({
 *   host: 'https://your-clickhouse-host:8443',
 *   username: 'default',
 *   password: 'password'
 * })
 *
 * // Initialize query functions
 * const transactionsQuery = getTransactions(client)
 * const cashRunwayQuery = getCashRunway(client)
 *
 * // Use query functions
 * const transactions = await transactionsQuery({
 *   userId: 'user-123',
 *   start: 1609459200000,
 *   end: 1640995199000,
 *   limit: 100
 * })
 * ```
 */

// Transaction queries
export * from './transactions'

// Recurring transaction queries
export * from './recurringTransactions'

// Business metrics queries
export * from './businessMetrics'
