/**
 * This file serves as a central export point for all Trigger.dev tasks It
 * exports all jobs as a default export, which is required by Trigger.dev v3
 */

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
import { syncConnectionJob } from './tasks/bank/sync/connection';
import { updateBalancesJob } from './tasks/bank/scheduler/update-balances';
import { upsertRecurringTransactionsJob } from './tasks/bank/transactions/upsertRecurring';
import { upsertTransactionsJob } from './tasks/bank/transactions/upsert';

// Define all jobs
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

  // Transaction jobs
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

  // Inbox management jobs
  inboxUpload,
];

// Export all jobs individually
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
  processExport,
  inboxUpload,
};

// Default export for all jobs (required by Trigger.dev v3)
export default jobs;
