// Export the trigger.dev client
export { client } from './client';

// Export all jobs
export * from './tasks/bank/scheduler/monitor-connections';
export * from './tasks/bank/scheduler/update-balances';
export * from './tasks/reconnect/send-reconnect-alerts';
export * from './tasks/bank/transactions/upsert';
export * from './tasks/bank/sync/account';
export * from './tasks/bank/sync/connection';
export * from './tasks/bank/setup/initial';
export * from './tasks/bank/scheduler/disconnected-scheduler';
export * from './tasks/bank/scheduler/expiring-scheduler';
export * from './tasks/bank/connections/refresh-connection-job';
export * from './tasks/bank/connections/connection-expiration-job';
export * from './tasks/team/delete';
export * from './tasks/transactions/export';
export * from './tasks/inbox';

import {
  syncAllTransactionsJob,
  syncUserTransactionsJob,
} from './tasks/transactions/sync-transactions';

import { connectionExpirationJob } from './tasks/bank/connections/connection-expiration-job';
import { connectionRecoveryJob } from './tasks/bank/connections/connection-recovery-job';
import { deleteTeam } from './tasks/team/delete';
import { expiringSchedulerJob } from './tasks/bank/scheduler/expiring-scheduler';
import { inboxUpload } from './tasks/inbox';
import { initialSetupJob } from './tasks/bank/setup/initial';
import { monitorBankConnectionsJob } from './tasks/bank/scheduler/monitor-connections';
import { processExport } from './tasks/transactions/export';
import { refreshConnectionJob } from './tasks/bank/connections/refresh-connection-job';
import { sendReconnectAlertsJob } from './tasks/reconnect/send-reconnect-alerts';
import { syncAccount } from './tasks/bank/sync/account';
import { syncConnectionJob } from './tasks/bank/sync/connection';
import { updateBalancesJob } from './tasks/bank/scheduler/update-balances';
import { upsertRecurringTransactionsJob } from './tasks/bank/transactions/upsertRecurring';
import { upsertTransactionsJob } from './tasks/bank/transactions/upsert';

// Define the jobs to be registered
const jobs = [
  // Core transaction jobs
  syncAllTransactionsJob,
  syncUserTransactionsJob,
  processExport,

  // Bank connection management
  monitorBankConnectionsJob,
  updateBalancesJob,

  // Alert/notification jobs
  sendReconnectAlertsJob,

  // New jobs
  upsertTransactionsJob,
  upsertRecurringTransactionsJob,
  syncConnectionJob,
  initialSetupJob,
  expiringSchedulerJob,

  // Connection management jobs
  refreshConnectionJob,
  connectionRecoveryJob,
  connectionExpirationJob,

  // Team management jobs
  deleteTeam,

  // Bank account sync jobs
  syncAccount,

  // Inbox management jobs
  inboxUpload,
];

// This is required for Trigger.dev v3
export default jobs;

/** Register all jobs with trigger.dev */
export function registerJobs() {
  // Instead of just returning jobs, we need to expose them for the trigger.dev client
  return { jobs };
}

// Export all jobs as named exports to make them accessible to trigger.dev
export {
  syncAllTransactionsJob,
  syncUserTransactionsJob,
  monitorBankConnectionsJob,
  updateBalancesJob,
  sendReconnectAlertsJob,
  upsertTransactionsJob,
  upsertRecurringTransactionsJob,
  syncConnectionJob,
  initialSetupJob,
  expiringSchedulerJob,
  refreshConnectionJob,
  connectionRecoveryJob,
  connectionExpirationJob,
  deleteTeam,
  syncAccount,
  processExport,
  inboxUpload,
};
