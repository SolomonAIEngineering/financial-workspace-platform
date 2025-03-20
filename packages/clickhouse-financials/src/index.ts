import {
  getActiveKeysPerDay,
  getActiveKeysPerHour,
  getActiveKeysPerMonth,
} from './active_keys'
import { getBillableRatelimits, getBillableVerifications } from './billing'
import { Client, type Inserter, Noop, type Querier } from './client'
import { getLatestVerifications } from './latest_verifications'
import {
  getDailyLogsTimeseries,
  getHourlyLogsTimeseries,
  getLogs,
  getMinutelyLogsTimeseries,
} from './logs'
import {
  getRatelimitLastUsed,
  getRatelimitLogs,
  getRatelimitsPerDay,
  getRatelimitsPerHour,
  getRatelimitsPerMinute,
  getRatelimitsPerMonth,
  insertRatelimit,
} from './ratelimits'
import { insertApiRequest } from './requests'
import { getActiveWorkspacesPerMonth } from './success'
import { insertSDKTelemetry } from './telemetry'
import {
  getVerificationsPerDay,
  getVerificationsPerHour,
  getVerificationsPerMonth,
  insertVerification,
} from './verifications'

// Import financial queries
import * as financialQueries from './queries'

// Import financial mutations for re-export
import * as financialMutations from './mutations'

// Import specific mutation functions
import {
  batchInsertTransactions,
  insertTransaction,
  insertTransactions,
  updateTransaction,
} from './mutations/transactions'

import {
  batchInsertRecurringTransactions,
  insertRecurringTransaction,
  insertRecurringTransactions,
} from './mutations/recurringTransactions'

import {
  insertBusinessMetric,
  insertBusinessMetrics,
  insertMonthlyMRRMetric,
} from './mutations/businessMetrics'

// Import types for mutations
import { MutationClient, MutationNoop } from './client/mutationClient'
import { Inserter as MutationInserter } from './mutations/types'

/**
 * Configuration options for the ClickHouse client
 *
 * @property url - Single URL for both queries and mutations
 * @property queryUrl - URL for query operations when using separate endpoints
 * @property insertUrl - URL for insert operations when using separate endpoints
 */
export type ClickHouseConfig =
  | {
      url?: string
      insertUrl?: never
      queryUrl?: never
    }
  | {
      url?: never
      insertUrl: string
      queryUrl: string
    }

/**
 * Main ClickHouse client class that provides access to all financial data operations
 *
 * This class serves as the entry point for all interactions with the ClickHouse database.
 * It provides access to both query and mutation operations through a set of getters
 * that expose domain-specific APIs.
 *
 * The client supports both unified and split configurations:
 * - Unified: A single URL for both queries and mutations
 * - Split: Separate URLs for queries and mutations
 *
 * @example
 * ```typescript
 * // Create a client with a unified URL
 * const clickhouse = new ClickHouse({ url: 'https://clickhouse-server:8443' });
 *
 * // Or with separate URLs for queries and mutations
 * const clickhouse = new ClickHouse({
 *   queryUrl: 'https://clickhouse-read:8443',
 *   insertUrl: 'https://clickhouse-write:8443'
 * });
 *
 * // Use the client to query transactions
 * const transactions = await clickhouse.financials.transactions.get({
 *   userId: 'user-123',
 *   start: 1609459200000,
 *   end: 1640995199000,
 *   limit: 100
 * });
 * ```
 */
export class ClickHouse {
  /**
   * Client for executing queries against ClickHouse
   */
  public readonly querier: Querier

  /**
   * Client for executing inserts against ClickHouse
   */
  public readonly inserter: Inserter

  /**
   * Client for executing mutations against ClickHouse
   */
  public readonly mutationsInserter: MutationInserter

  /**
   * Creates a new ClickHouse client instance
   *
   * @param config - Configuration options for the client
   */
  constructor(config: ClickHouseConfig) {
    if (config.url) {
      const client = new Client({ url: config.url })
      this.querier = client
      this.inserter = client
      this.mutationsInserter = new MutationClient({ url: config.url })
    } else if (config.queryUrl && config.insertUrl) {
      this.querier = new Client({ url: config.queryUrl })
      const insertClient = new Client({ url: config.insertUrl })
      this.inserter = insertClient
      this.mutationsInserter = new MutationClient({ url: config.insertUrl })
    } else {
      this.querier = new Noop()
      this.inserter = new Noop()
      this.mutationsInserter = new MutationNoop()
    }
  }

  /**
   * Creates a ClickHouse client using environment variables
   *
   * @returns A new ClickHouse client instance
   */
  static fromEnv(): ClickHouse {
    return new ClickHouse({ url: process.env.CLICKHOUSE_URL })
  }

  public get verifications() {
    return {
      insert: insertVerification(this.inserter),
      logs: getLatestVerifications(this.querier),
      perHour: getVerificationsPerHour(this.querier),
      perDay: getVerificationsPerDay(this.querier),
      perMonth: getVerificationsPerMonth(this.querier),
      latest: getLatestVerifications(this.querier),
    }
  }
  public get activeKeys() {
    return {
      perHour: getActiveKeysPerHour(this.querier),
      perDay: getActiveKeysPerDay(this.querier),
      perMonth: getActiveKeysPerMonth(this.querier),
    }
  }
  public get ratelimits() {
    return {
      insert: insertRatelimit(this.inserter),
      logs: getRatelimitLogs(this.querier),
      latest: getRatelimitLastUsed(this.querier),
      perMinute: getRatelimitsPerMinute(this.querier),
      perHour: getRatelimitsPerHour(this.querier),
      perDay: getRatelimitsPerDay(this.querier),
      perMonth: getRatelimitsPerMonth(this.querier),
    }
  }
  public get billing() {
    return {
      billableVerifications: getBillableVerifications(this.querier),
      billableRatelimits: getBillableRatelimits(this.querier),
    }
  }
  public get api() {
    return {
      insert: insertApiRequest(this.inserter),
      logs: getLogs(this.querier),
      timeseries: {
        perMinute: getMinutelyLogsTimeseries(this.querier),
        perHour: getHourlyLogsTimeseries(this.querier),
        perDay: getDailyLogsTimeseries(this.querier),
      },
    }
  }
  public get business() {
    return {
      activeWorkspaces: getActiveWorkspacesPerMonth(this.querier),
    }
  }
  public get telemetry() {
    return {
      insert: insertSDKTelemetry(this.inserter),
    }
  }

  /**
   * Access to financial data queries and mutations
   *
   * This getter provides a comprehensive API for working with financial data,
   * organized by domain (transactions, recurring transactions, and business metrics).
   * Each domain exposes both query and mutation operations.
   *
   * The API is designed to be intuitive and easy to use, with methods named
   * according to their purpose and grouped logically.
   *
   * @example
   * ```typescript
   * // Query transactions
   * const transactions = await clickhouse.financials.transactions.get({
   *   userId: 'user-123',
   *   start: 1609459200000,
   *   end: 1640995199000,
   *   limit: 100
   * });
   *
   * // Insert a transaction
   * const result = await clickhouse.financials.transactions.insert(transaction);
   *
   * // Get cash runway metrics
   * const runway = await clickhouse.financials.metrics.getCashRunway({
   *   teamId: 'team-456',
   *   currentCash: 500000
   * });
   * ```
   */
  public get financials() {
    return {
      /**
       * Transaction queries and mutations
       *
       * Provides methods for retrieving, analyzing, and managing individual financial transactions.
       */
      transactions: {
        // Queries
        get: financialQueries.getTransactions(this.querier),
        getByDay: financialQueries.getTransactionsByDay(this.querier),
        getByMonth: financialQueries.getTransactionsByMonth(this.querier),
        getCategorySpending: financialQueries.getCategorySpending(this.querier),
        getMerchantSpending: financialQueries.getMerchantSpending(this.querier),
        getRecurringPatterns: financialQueries.getRecurringPatterns(
          this.querier,
        ),

        // Mutations
        insert: insertTransaction(this.mutationsInserter),
        insertBatch: insertTransactions(this.mutationsInserter),
        batchInsert: batchInsertTransactions(this.mutationsInserter),
        update: updateTransaction(this.mutationsInserter),
      },

      /**
       * Recurring transaction queries and mutations
       *
       * Provides methods for retrieving, analyzing, and managing scheduled, repeating financial activities
       * such as subscriptions, regular bills, or recurring revenue streams.
       */
      recurringTransactions: {
        // Queries
        get: financialQueries.getRecurringTransactions(this.querier),
        getByStatus: financialQueries.getRecurringTransactionsByStatus(
          this.querier,
        ),
        getUpcoming: financialQueries.getUpcomingRecurringTransactions(
          this.querier,
        ),
        getImportant: financialQueries.getImportantRecurringTransactions(
          this.querier,
        ),
        getCashFlowProjection: financialQueries.getCashFlowProjection(
          this.querier,
        ),
        getMonthlyCashFlowForecast: financialQueries.getMonthlyCashFlowForecast(
          this.querier,
        ),

        // Mutations
        insert: insertRecurringTransaction(this.mutationsInserter),
        insertBatch: insertRecurringTransactions(this.mutationsInserter),
        batchInsert: batchInsertRecurringTransactions(this.mutationsInserter),
      },

      /**
       * Business metrics queries and mutations
       *
       * Provides methods for retrieving and analyzing key business performance indicators
       * such as cash runway, MRR tracking, customer lifetime value, and expense analysis.
       */
      metrics: {
        // Queries
        getCashRunway: financialQueries.getCashRunway(this.querier),
        getMrrTracking: financialQueries.getMrrTracking(this.querier),
        getMrrMovement: financialQueries.getMrrMovement(this.querier),
        getCustomerLifetimeValue: financialQueries.getCustomerLifetimeValue(
          this.querier,
        ),
        getExpensesByCostType: financialQueries.getExpensesByCostType(
          this.querier,
        ),
        getMonthlyFinancialSummary: financialQueries.getMonthlyFinancialSummary(
          this.querier,
        ),
        getRevenueByCategory: financialQueries.getRevenueByCategory(
          this.querier,
        ),

        // Mutations - using the inserter for business metrics
        insertMetrics: insertBusinessMetrics(this.inserter),
        insertMetric: insertBusinessMetric(this.inserter),
        insertMonthlyMRR: insertMonthlyMRRMetric(this.inserter),
      },
    }
  }
}

// Re-export query and mutation modules for direct access
export { financialMutations as mutations, financialQueries as queries }
