/**
 * This file contains constants for all job IDs used throughout the application.
 * Using these constants instead of string literals helps prevent typos and
 * makes refactoring easier.
 *
 * @file Job ID Constants
 */

/** Bank-related job IDs */
export const BANK_JOBS = {
  /** Job to monitor bank connections for issues and update their status */
  MONITOR_CONNECTIONS: 'monitor-bank-connections-job',
  /** Job to update bank account balances on a frequent basis */
  UPDATE_BALANCES: 'update-bank-balances-job',
  /** Job to check for expiring connections and send notifications */
  CONNECTION_EXPIRATION: 'connection-expiration-job',
  /** Job to recover failed connections */
  CONNECTION_RECOVERY: 'connection-recovery-job',
  /** Job to refresh bank connection tokens */
  REFRESH_CONNECTION: 'refresh-connection-job',
  /** Job to send notifications for expiring connections */
  EXPIRING_NOTIFICATIONS: 'expiring-notifications-job',
  /** Job to send transaction notifications */
  TRANSACTION_NOTIFICATIONS: 'transaction-notifications-job',
  /** Job to send disconnected connection notifications */
  DISCONNECTED_NOTIFICATIONS: 'disconnected-notifications-job',
  /** Job to schedule expiring connections */
  EXPIRING_SCHEDULER: 'expiring-scheduler-job',
  /** Initial setup job for new bank connections */
  INITIAL_SETUP: 'initial-setup-job',
  /** Job to sync a bank account */
  SYNC_ACCOUNT: 'sync-account-job',
  /** Job to sync a bank connection */
  SYNC_CONNECTION: 'sync-connection-job',
  /** Job to upsert transactions */
  UPSERT_TRANSACTIONS: 'upsert-transactions-job',
  /** Job to identify recurring transactions */
  RECURRING_TRANSACTIONS: 'recurring-transactions-job',
  /** Job to upsert recurring transactions */
  UPSERT_RECURRING_TRANSACTIONS: 'upsert-recurring-transactions-job',
  /** Job to delete a team and all its connections */
  DELETE_TEAM: 'delete-team',
} as const;

/** Transaction-related job IDs */
export const TRANSACTION_JOBS = {
  /** Job to sync all transactions for all users */
  SYNC_ALL_TRANSACTIONS: 'sync-all-transactions-job',
  /** Job to categorize transactions */
  CATEGORIZE_TRANSACTIONS: 'categorize-transactions-job',
  /** Job to analyze spending patterns */
  ANALYZE_SPENDING: 'analyze-spending-patterns-job',
  /** Job to sync bank transactions */
  SYNC_BANK_TRANSACTIONS: 'sync-bank-transactions-job',
  /** Job to process transaction data export */
  PROCESS_EXPORT: 'process-export',
} as const;

/** Financial-related job IDs */
export const FINANCIAL_JOBS = {
  /** Job to sync all transactions for all users */
  SYNC_ALL_TRANSACTIONS: 'sync-all-transactions-job',
} as const;

/** Type containing all job IDs for type safety when referencing job IDs */
export type JobId =
  | (typeof BANK_JOBS)[keyof typeof BANK_JOBS]
  | (typeof TRANSACTION_JOBS)[keyof typeof TRANSACTION_JOBS];
