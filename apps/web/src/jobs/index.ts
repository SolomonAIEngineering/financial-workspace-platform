// Export the trigger.dev client
export { client } from './client';

// Export all jobs
export * from './tasks/sync-transactions';
export * from './tasks/categorize-transactions';
export * from './tasks/bank/monitor-connections';
export * from './tasks/bank/update-balances';
export * from './tasks/transactions/analyze-spending';
export * from './tasks/reconnect/send-reconnect-alerts';
export * from './tasks/bank/transactions/upsert';
export * from './tasks/bank/sync/account';
export * from './tasks/bank/sync/connection';
export * from './tasks/bank/setup/initial';
export * from './tasks/bank/scheduler/disconnected-scheduler';
export * from './tasks/bank/scheduler/expiring-scheduler';
export * from './tasks/bank/notifications/transactions';
export * from './tasks/bank/notifications/expiring';
export * from './tasks/bank/connections/refresh-connection-job';
export * from './tasks/bank/connections/create-link-token-job';
export * from './tasks/bank/connections/connection-recovery-job';
export * from './tasks/bank/connections/connection-expiration-job';

// Import all job functions
import {
  syncAllTransactionsJob,
  syncUserTransactionsJob,
} from './tasks/sync-transactions';

import { analyzeSpendingJob } from './tasks/transactions/analyze-spending';
import { categorizationJob } from './tasks/categorize-transactions';
// Import the client
import { client } from './client';
import { connectionExpirationJob } from './tasks/bank/connections/connection-expiration-job';
import { connectionRecoveryJob } from './tasks/bank/connections/connection-recovery-job';
import { createLinkTokenJob } from './tasks/bank/connections/create-link-token-job';
import { disconnectedSchedulerJob } from './tasks/bank/scheduler/disconnected-scheduler';
import { expiringNotificationsJob } from './tasks/bank/notifications/expiring';
import { expiringSchedulerJob } from './tasks/bank/scheduler/expiring-scheduler';
import { initialSetupJob } from './tasks/bank/setup/initial';
import { monitorBankConnectionsJob } from './tasks/bank/monitor-connections';
import { refreshConnectionJob } from './tasks/bank/connections/refresh-connection-job';
import { sendReconnectAlertsJob } from './tasks/reconnect/send-reconnect-alerts';
import { syncAccountJob } from './tasks/bank/sync/account';
import { syncConnectionJob } from './tasks/bank/sync/connection';
import { transactionNotificationsJob } from './tasks/bank/notifications/transactions';
import { updateBalancesJob } from './tasks/bank/update-balances';
import { upsertTransactionsJob } from './tasks/bank/transactions/upsert';

// Define the jobs to be registered
const jobs = [
  // Core transaction jobs
  syncAllTransactionsJob,
  syncUserTransactionsJob,
  categorizationJob,

  // Bank connection management
  monitorBankConnectionsJob,
  updateBalancesJob,

  // Analysis jobs
  analyzeSpendingJob,

  // Alert/notification jobs
  sendReconnectAlertsJob,

  // New jobs
  upsertTransactionsJob,
  syncAccountJob,
  syncConnectionJob,
  initialSetupJob,
  disconnectedSchedulerJob,
  expiringSchedulerJob,
  transactionNotificationsJob,
  expiringNotificationsJob,

  // Connection management jobs
  refreshConnectionJob,
  createLinkTokenJob,
  connectionRecoveryJob,
  connectionExpirationJob,
];

/** Register all jobs with trigger.dev */
export function registerJobs() {
  return jobs;
}
