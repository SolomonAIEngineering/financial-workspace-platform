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
import { expiringNotificationsJob } from './tasks/bank/notifications/expiring';
import { expiringSchedulerJob } from './tasks/bank/scheduler/expiring-scheduler';
import { initialSetupJob } from './tasks/bank/setup/initial';
import { monitorBankConnectionsJob } from './tasks/bank/scheduler/monitor-connections';
import { refreshConnectionJob } from './tasks/bank/connections/refresh-connection-job';
import { sendReconnectAlertsJob } from './tasks/reconnect/send-reconnect-alerts';
import { syncAccountJob } from './tasks/bank/sync/account';
import { syncConnectionJob } from './tasks/bank/sync/connection';
import { transactionNotificationsJob } from './tasks/bank/notifications/transactions';
import { updateBalancesJob } from './tasks/bank/scheduler/update-balances';
import { upsertTransactionsJob } from './tasks/bank/transactions/upsert';

// Define all jobs
const jobs = [
  // Core transaction jobs
  syncAllTransactionsJob,
  syncUserTransactionsJob,

  // Bank connection management
  monitorBankConnectionsJob,
  updateBalancesJob,

  // Alert/notification jobs
  sendReconnectAlertsJob,

  // Transaction jobs
  upsertTransactionsJob,
  syncAccountJob,
  syncConnectionJob,
  initialSetupJob,
  expiringSchedulerJob,
  transactionNotificationsJob,
  expiringNotificationsJob,

  // Connection management jobs
  refreshConnectionJob,
  connectionRecoveryJob,
  connectionExpirationJob,
];

// Export all jobs individually
export {
  syncAllTransactionsJob,
  syncUserTransactionsJob,
  monitorBankConnectionsJob,
  updateBalancesJob,
  sendReconnectAlertsJob,
  upsertTransactionsJob,
  syncAccountJob,
  syncConnectionJob,
  initialSetupJob,
  expiringSchedulerJob,
  transactionNotificationsJob,
  expiringNotificationsJob,
  refreshConnectionJob,
  connectionRecoveryJob,
  connectionExpirationJob,
};

// Default export for all jobs (required by Trigger.dev v3)
export default jobs;
