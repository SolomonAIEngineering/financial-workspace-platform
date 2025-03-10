# Bank and Transaction Syncing Implementation Guide

This guide provides a detailed explanation of how bank and transaction syncing is implemented in the Solomon AI platform. It covers the background job architecture, syncing workflows, and includes code examples for implementing each component of the system.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Bank Sync Jobs](#bank-sync-jobs)
4. [Transaction Processing](#transaction-processing)
5. [Notification System](#notification-system)
6. [Scheduler](#scheduler)
7. [Error Handling](#error-handling)
8. [Implementation Examples](#implementation-examples)
9. [Performance Considerations](#performance-considerations)
10. [Security and Compliance](#security-and-compliance)
11. [Troubleshooting](#troubleshooting)

## Overview

The bank and transaction syncing system is responsible for:

1. Connecting to banking providers (Plaid, Teller, GoCardless)
2. Fetching account information and transaction data
3. Processing and categorizing transactions
4. Updating account balances
5. Notifying users of important events
6. Handling errors and retries
7. Managing refresh token workflows for each provider
8. Enforcing rate limits and handling provider-specific throttling

The system is built on a background job architecture that processes tasks asynchronously to ensure the UI remains responsive. This architecture handles millions of transactions across thousands of user accounts while maintaining strict performance, security, and reliability standards.

### Key Features

- **Multi-provider support**: Seamless integration with multiple banking data providers
- **Intelligent sync scheduling**: Adaptive schedules based on user activity and provider characteristics
- **Advanced transaction categorization**: ML-powered categorization with confidence scores
- **Real-time balance updates**: Separate workflows for frequent balance updates
- **Comprehensive error handling**: Sophisticated retry mechanisms with exponential backoff
- **User notification system**: Contextual notifications for important sync events
- **Monitoring and observability**: Detailed metrics and logging for operational visibility

### Provider-Specific Considerations

Each banking provider has unique characteristics that affect our sync implementation:

| Provider   | Refresh Token Strategy | Rate Limits | Transaction History | Balance Updates   |
| ---------- | ---------------------- | ----------- | ------------------- | ----------------- |
| Plaid      | 30-day refresh         | 200 req/min | 24 months           | Real-time capable |
| Teller     | 90-day refresh         | 100 req/min | 12 months           | Day-delayed       |
| GoCardless | OAuth refresh flow     | 50 req/min  | 18 months           | Near real-time    |

## Architecture

The bank syncing system is organized into a modular architecture within the Solomon AI application. The core components are located in the following directory structure:

```
apps/dashboard/jobs/
├── utils/              # Job utilities and shared functions
│   ├── job-creator.ts  # Factory for creating typed job definitions
│   ├── queue.ts        # Queue management utilities
│   ├── scheduler.ts    # Job scheduling utilities
│   └── error-handling.ts # Common error handling patterns
└── tasks/              # Task definitions organized by domain
    ├── bank/           # Banking-related jobs
    │   ├── connections/ # Connection management jobs
    │   ├── accounts/    # Account-related jobs
    │   ├── transactions/ # Transaction processing jobs
    │   └── notifications/ # Banking notification jobs
    ├── user/           # User-related jobs
    └── system/         # System maintenance jobs
```

The banking providers are integrated through a provider-agnostic adapter system:

```
lib/banking/
├── providers/          # Provider-specific adapters
│   ├── plaid/          # Plaid integration
│   ├── teller/         # Teller integration
│   └── gocardless/     # GoCardless integration
├── connection.ts       # Connection management utilities
├── accounts.ts         # Account data handling
├── transactions.ts     # Transaction processing utilities
└── categorization/     # Transaction categorization system
    ├── engine.ts       # Categorization engine
    ├── models/         # ML models for categorization
    └── training/       # Model training utilities
```

### Component Interactions

The components interact through a well-defined workflow:

1. **Job Scheduler** determines when sync jobs should run based on provider requirements, user activity, and system load
2. **Sync Jobs** communicate with banking providers through provider-specific adapters in the `lib/banking/providers` directory
3. **Transaction Processors** normalize and enrich the raw transaction data
4. **Categorization Engine** applies ML models to categorize transactions
5. **Notification System** generates user-facing notifications based on sync events
6. **Monitoring System** tracks performance metrics and error rates

### Job Flow

The typical flow for syncing bank data follows these steps:

1. **Setup**: When a user connects a bank, setup jobs initialize the connection and discover accounts

   - `connection-setup-job`: Validates and stores connection credentials
   - `account-discovery-job`: Discovers and registers all available accounts
   - `initial-sync-job`: Performs the first comprehensive data sync

2. **Scheduling**: Scheduler jobs set up recurring syncs based on provider requirements and user activity patterns

   - `sync-schedule-optimizer`: Analyzes usage patterns to optimize sync frequency
   - `schedule-factory`: Creates appropriate schedule configurations
   - `dynamic-schedule-adjuster`: Adjusts schedules based on observed data changes

3. **Syncing**: Sync jobs fetch new data from banking providers

   - `account-sync-job`: Updates account details and metadata
   - `balance-sync-job`: Updates account balances
   - `transaction-sync-job`: Fetches new transactions
   - `connection-health-job`: Monitors connection status

4. **Processing**: Transaction jobs process and categorize the fetched data

   - `transaction-normalizer`: Standardizes transaction formats across providers
   - `transaction-enricher`: Adds metadata and merchant information
   - `transaction-categorizer`: Applies ML categorization
   - `duplicate-detector`: Identifies and manages duplicate transactions

5. **Notification**: Notification jobs alert users about important events
   - `balance-alert-job`: Notifies users about significant balance changes
   - `large-transaction-alert`: Alerts users to unusually large transactions
   - `connection-status-notifier`: Informs users about connection issues
   - `sync-completion-notifier`: Confirms successful data synchronization

### Technology Stack

The bank syncing system is built on the following technologies:

- **Job Queue**: Bull/Redis for reliable job queuing and processing
- **Database**: PostgreSQL for transaction and account data storage
- **Caching**: Redis for caching frequently accessed data
- **Machine Learning**: TensorFlow.js for transaction categorization
- **Monitoring**: Prometheus and Grafana for operational metrics
- **Logging**: Winston/Pino with structured logging
- **Rate Limiting**: Token bucket algorithm implementation
- **Error Tracking**: Sentry for error monitoring and alerting

### Data Flow Diagram

The system uses a multi-stage data flow to process banking information:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Banking    │    │  Provider   │    │ Transaction │    │   Database  │
│  Provider   │───▶│  Adapter    │───▶│ Processor   │───▶│   Storage   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                          │                  │                  │
                          ▼                  ▼                  ▼
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │  Rate Limit │    │ Categorizer │    │   Indexing  │
                   │  Manager    │    │   Engine    │    │   Service   │
                   └─────────────┘    └─────────────┘    └─────────────┘
                                             │
                                             ▼
                                     ┌─────────────┐
                                     │ Notification│
                                     │   System    │
                                     └─────────────┘
```

### State Management

The sync system maintains several key states for each connection:

1. **Connection State**: `connected`, `disconnected`, `error`, `pending_refresh`
2. **Sync State**: `idle`, `in_progress`, `completed`, `failed`
3. **Account States**: `active`, `inactive`, `closed`, `pending_verification`
4. **Transaction States**: `pending`, `posted`, `processed`, `categorized`

These states are tracked in the database and used to coordinate the various jobs and provide accurate user feedback.

## Bank Sync Jobs

Bank sync jobs are responsible for fetching data from banking providers and updating the local database. These jobs handle the core functionality of maintaining up-to-date financial data for users.

### Job Framework

All bank sync jobs are built on a common job framework defined in `apps/dashboard/jobs/utils/job-creator.ts`:

```typescript
// apps/dashboard/jobs/utils/job-creator.ts
import { Job, JobOptions, Queue } from 'bull';
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';

interface JobDefinition<TData, TResult> {
  name: string;
  handler: (data: TData) => Promise<TResult>;
  options?: JobOptions;
}

interface JobResponse<TResult> {
  jobId: string;
  publicAccessToken: string;
  result?: TResult;
}

export function createJob<TData, TResult>({
  name,
  handler,
  options = {},
}: JobDefinition<TData, TResult>) {
  const processJob = async (job: Job<TData>): Promise<TResult> => {
    try {
      logger.info(`Starting job: ${name}`, {
        jobId: job.id,
        attempt: job.attemptsMade,
      });

      const result = await handler(job.data);

      logger.info(`Completed job: ${name}`, {
        jobId: job.id,
        attempt: job.attemptsMade,
        duration: Date.now() - job.timestamp,
      });

      return result;
    } catch (error) {
      logger.error(`Failed job: ${name}`, {
        jobId: job.id,
        attempt: job.attemptsMade,
        error: error.message,
        stack: error.stack,
      });

      throw error;
    }
  };

  return {
    name,
    options: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: {
        age: 7 * 24 * 60 * 60, // 7 days
        count: 1000,
      },
      ...options,
    },
    handler,
    processor: processJob,
    enqueue: async (
      queue: Queue,
      data: TData
    ): Promise<JobResponse<TResult>> => {
      const publicAccessToken = uuidv4();

      const job = await queue.add(name, data, {
        ...options,
        jobId: uuidv4(),
        // Store the public access token in job opts for status API access
        opts: { publicAccessToken },
      });

      return {
        jobId: job.id as string,
        publicAccessToken,
      };
    },
  };
}
```

### Core Sync Job

The core sync job (`sync-bank-job.ts`) handles fetching the latest data from a banking provider and updating the connection status:

````typescript
// apps/dashboard/jobs/tasks/bank/connections/sync-bank-job.ts
import { createJob } from '@/jobs/utils/job-creator';
import { getBankingProvider } from '@/lib/banking/providers';
import { updateBankConnection } from '@/lib/banking/connection';
import { updateAccountBalance } from '@/lib/banking/accounts';
import { queueJob } from '@/jobs/utils/queue';
import { logger } from '@/lib/logger';
import { rateLimiter } from '@/lib/rate-limiting';
import { metrics } from '@/lib/monitoring';

interface SyncBankJobData {
  connectionId: string;
  accessToken: string;
  provider: 'plaid' | 'teller' | 'gocardless';
  userId: string;
  forceRefresh?: boolean;
}

interface SyncBankJobResult {
  success: boolean;
  accountCount?: number;
  error?: string;
  requiresReauth?: boolean;
  lastSyncTime?: string;
}

export const syncBankJob = createJob<SyncBankJobData, SyncBankJobResult>({
  name: 'sync-bank',
  options: {
    priority: 10, // Higher priority
    timeout: 60000, // 1 minute timeout
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 10000
    }
  },
  handler: async ({ connectionId, accessToken, provider, userId, forceRefresh = false }) => {
    const startTime = Date.now();
    const traceId = `sync-bank-${connectionId}-${Date.now()}`;

    logger.info('Starting bank sync job', {
      traceId,
      connectionId,
      provider,
      userId,
      forceRefresh
    });

    try {
      // Increment sync attempt counter
      metrics.increment('bank_sync.attempts', { provider });

      // Get the appropriate provider client
      const bankingProvider = getBankingProvider(provider);

      // Apply rate limiting based on provider
      await rateLimiter.acquire(`provider:${provider}`, 1);

      // Get connection details before sync
      const connection = await getBankConnection(connectionId);
      if (!connection) {
        throw new Error('Connection not found');
      }

      if (connection.status === 'revoked') {
        logger.warn('Skipping sync for revoked connection', { traceId, connectionId });
        return {
          success: false,
          error: 'Connection revoked by user'
        };
      }

      // Start sync transaction for atomicity
      await beginSyncTransaction(connectionId);

      // Update connection status to syncing
      await updateBankConnection(connectionId, {
        status: 'syncing',
        last_sync_attempt: new Date().toISOString(),
      });

      // Use different refresh strategies based on provider and force flag
      const syncOptions = getSyncOptions(provider, forceRefresh);

      // Fetch the latest account data
      logger.debug('Fetching accounts from provider', { traceId, provider });
      const { accounts, balances } = await bankingProvider.getAccounts(
        accessToken,
        syncOptions
      );

      logger.info('Fetched accounts from provider', {
        traceId,
        accountCount: accounts.length
      });

      // Process accounts and balances
      await processAccountsAndBalances(connectionId, accounts, balances);

      // Update the connection status and last accessed time
      await updateBankConnection(connectionId, {
        status: 'connected',
        last_sync_success: new Date().toISOString(),
        error: null,
        error_count: 0,
      });

      // Queue transaction sync job
      await queueTransactionSyncJob(connectionId, accessToken, provider);

      // Commit sync transaction
      await commitSyncTransaction(connectionId);

      // Record successful sync metric
      metrics.timing('bank_sync.duration', Date.now() - startTime, {
        provider,
        status: 'success'
      });

      return {
        success: true,
        accountCount: accounts.length,
        lastSyncTime: new Date().toISOString()
      };
    } catch (error) {
      // Rollback sync transaction
      await rollbackSyncTransaction(connectionId);

      // Record failed sync metric
      metrics.timing('bank_sync.duration', Date.now() - startTime, {
        provider,
        status: 'error'
      });

      // Handle provider-specific errors
      const errorResponse = handleProviderError(error, connectionId, provider);

      logger.error('Bank sync job failed', {
        traceId,
        connectionId,
        provider,
        error: error.message,
        errorCode: error.code,
        errorType: error.type,
      });

      return errorResponse;
    }
  },
});

// Helper function to get sync options based on provider and force flag
function getSyncOptions(provider: string, forceRefresh: boolean) {
  switch (provider) {
    case 'plaid':
      return {
        force_refresh: forceRefresh,
        options: {
          account_ids: null, // fetch all accounts
          with_holdings: true,
          with_liabilities: true
        }
      };
    case 'teller':
      return {
        refresh: forceRefresh,
        include_balances: true
      };
    case 'gocardless':
      return {
        refresh_user_data: forceRefresh,
        include_details: true
      };
    default:
      return { force_refresh: forceRefresh };
  }
}

// Helper function to process accounts and balances
async function processAccountsAndBalances(connectionId: string, accounts: any[], balances: any[]) {
  // Process each account
  for (const account of accounts) {
    // Check if account already exists
    const existingAccount = await getAccountByProviderId(account.id, connectionId);

    if (existingAccount) {
      // Update existing account
      await updateAccount(existingAccount.id, {
        name: account.name,
        official_name: account.official_name,
        type: account.type,
        subtype: account.subtype,
        status: account.status || 'active',
        last_updated: new Date().toISOString()
      });
    } else {
      // Create new account
      await createAccount({
        connection_id: connectionId,
        provider_account_id: account.id,
        name: account.name,
        official_name: account.official_name,
        type: account.type,
        subtype: account.subtype,
        status: account.status || 'active',
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      });
    }

    // Update account balance
    const balance = balances.find(b => b.account_id === account.id);
    if (balance) {
      await updateAccountBalance(account.id, {
        current: balance.current,
        available: balance.available,
        limit: balance.limit,
        last_updated: new Date().toISOString()
      });
    }
  }
}

// Helper function to handle provider-specific errors
function handleProviderError(error: any, connectionId: string, provider: string): SyncBankJobResult {
  let requiresReauth = false;
  let status = 'error';
  let errorMessage = error.message || 'Unknown error';

  // Update error count
  incrementConnectionErrorCount(connectionId);

  // Handle provider-specific error codes
  if (provider === 'plaid') {
    if (error.code === 'ITEM_LOGIN_REQUIRED') {
      requiresReauth = true;
      status = 'requires_reauth';
      errorMessage = 'Bank login required';
    } else if (error.code === 'INVALID_ACCESS_TOKEN') {
      status = 'invalid_token';
      errorMessage = 'Invalid access token';
    } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
      status = 'rate_limited';
      errorMessage = 'Rate limit exceeded';
    }
  } else if (provider === 'teller') {
    if (error.code === 'token-invalid') {
      status = 'invalid_token';
      errorMessage = 'Invalid access token';
    } else if (error.code === 'credentials-invalid') {
      requiresReauth = true;
      status = 'requires_reauth';
      errorMessage = 'Invalid credentials';
    }
  } else if (provider === 'gocardless') {
    if (error.code === 'authentication_failed') {
      requiresReauth = true;
      status = 'requires_reauth';
      errorMessage = 'Authentication failed';
    } else if (error.code === 'access_denied') {
      status = 'access_denied';
      errorMessage = 'Access denied';
    }
  }

  // Update connection status based on error
  updateBankConnection(connectionId, {
    status,
    error: errorMessage,
    last_sync_attempt: new Date().toISOString(),
  });

  return {
    success: false,
    error: errorMessage,
    requiresReauth
  };
}

// Helper function to queue transaction sync job
async function queueTransactionSyncJob(connectionId: string, accessToken: string, provider: string) {
  // Get appropriate date range based on last successful sync
  const dateRange = await getTransactionSyncDateRange(connectionId);

  await queueJob('sync-transactions', {
    connectionId,
    accessToken,
    provider,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });
}

### Balance Update Job

A specialized job for updating account balances more frequently than full syncs:

```typescript
// apps/dashboard/jobs/tasks/bank/accounts/update-balances-job.ts
import { createJob } from '@/jobs/utils/job-creator';
import { getBankingProvider } from '@/lib/banking/providers';
import { updateAccountBalance } from '@/lib/banking/accounts';
import { rateLimiter } from '@/lib/rate-limiting';
import { logger } from '@/lib/logger';
import { metrics } from '@/lib/monitoring';

interface UpdateBalancesJobData {
  connectionId: string;
  accessToken: string;
  provider: 'plaid' | 'teller' | 'gocardless';
  accountIds?: string[];
}

interface UpdateBalancesJobResult {
  success: boolean;
  balanceCount?: number;
  error?: string;
}

export const updateBalancesJob = createJob<UpdateBalancesJobData, UpdateBalancesJobResult>({
  name: 'update-balances',
  options: {
    priority: 5,
    timeout: 30000, // 30 second timeout
    attempts: 3,
  },
  handler: async ({ connectionId, accessToken, provider, accountIds }) => {
    const startTime = Date.now();
    const traceId = `update-balances-${connectionId}-${Date.now()}`;

    logger.info('Starting balance update job', {
      traceId,
      connectionId,
      provider,
      accountCount: accountIds?.length
    });

    try {
      // Increment balance update attempt counter
      metrics.increment('balance_update.attempts', { provider });

      // Get the appropriate provider client
      const bankingProvider = getBankingProvider(provider);

      // Apply rate limiting for balance updates (lighter than full sync)
      await rateLimiter.acquire(`provider:${provider}:balance`, 0.5);

      // Prepare options for balance fetch
      const options = {
        account_ids: accountIds || undefined
      };

      // Fetch only balance information
      const { balances } = await bankingProvider.getBalances(accessToken, options);

      logger.debug('Fetched balances from provider', {
        traceId,
        balanceCount: balances.length
      });

      // Update balances in database with a single batch operation if possible
      if (balances.length > 10) {
        await batchUpdateAccountBalances(balances);
      } else {
        // Update balances individually for smaller batches
        for (const balance of balances) {
          await updateAccountBalance(balance.account_id, {
            current: balance.current,
            available: balance.available,
            limit: balance.limit,
            last_updated: new Date().toISOString()
          });
        }
      }

      // Check for significant balance changes and queue notifications if needed
      await checkForSignificantBalanceChanges(connectionId, balances);

      // Record successful balance update metric
      metrics.timing('balance_update.duration', Date.now() - startTime, {
        provider,
        status: 'success'
      });

      return {
        success: true,
        balanceCount: balances.length
      };
    } catch (error) {
      // Record failed balance update metric
      metrics.timing('balance_update.duration', Date.now() - startTime, {
        provider,
        status: 'error'
      });

      logger.error('Balance update job failed', {
        traceId,
        connectionId,
        provider,
        error: error.message,
        errorCode: error.code
      });

      // Don't update connection status for balance update failures
      // They are less critical than full sync failures

      return {
        success: false,
        error: error.message
      };
    }
  },
});

// Efficient batch update for multiple account balances
async function batchUpdateAccountBalances(balances) {
  const batchUpdates = balances.map(balance => ({
    account_id: balance.account_id,
    current: balance.current,
    available: balance.available,
    limit: balance.limit,
    last_updated: new Date().toISOString()
  }));

  await performBatchBalanceUpdate(batchUpdates);
}

// Check for significant balance changes that might require user notification
async function checkForSignificantBalanceChanges(connectionId, currentBalances) {
  // Get previous balance records
  const previousBalances = await getPreviousBalances(connectionId);

  // Check each balance for significant changes
  for (const current of currentBalances) {
    const previous = previousBalances.find(p => p.account_id === current.account_id);

    if (!previous) continue;

    // Calculate change amount and percentage
    const changeAmount = current.current - previous.current;
    const changePercentage = (changeAmount / previous.current) * 100;

    // Get account details for context
    const account = await getAccountByProviderId(current.account_id, connectionId);

    // Check if change meets notification threshold
    const isSignificant =
      (Math.abs(changePercentage) > 15 && Math.abs(changeAmount) > 100) || // 15% change and >$100
      Math.abs(changeAmount) > 1000; // Any change >$1000

    if (isSignificant) {
      // Queue balance change notification
      await queueJob('notify-balance-change', {
        userId: account.user_id,
        accountId: account.id,
        accountName: account.name,
        previousBalance: previous.current,
        currentBalance: current.current,
        changeAmount,
        changePercentage
      });
    }
  }
}
````

### Account Creation and Update Job

A job for handling the creation and updating of accounts:

```typescript
// apps/dashboard/jobs/tasks/bank/accounts/account-management-job.ts
import { createJob } from '@/jobs/utils/job-creator';
import { logger } from '@/lib/logger';
import { metrics } from '@/lib/monitoring';
import { sendNotification } from '@/lib/notifications';

interface AccountManagementJobData {
  connectionId: string;
  accounts: any[];
  userId: string;
  operation: 'create' | 'update' | 'refresh';
}

interface AccountManagementJobResult {
  success: boolean;
  accountsCreated?: number;
  accountsUpdated?: number;
  error?: string;
}

export const accountManagementJob = createJob<
  AccountManagementJobData,
  AccountManagementJobResult
>({
  name: 'account-management',
  handler: async ({ connectionId, accounts, userId, operation }) => {
    const startTime = Date.now();
    const traceId = `account-management-${connectionId}-${Date.now()}`;

    logger.info('Starting account management job', {
      traceId,
      connectionId,
      accountCount: accounts.length,
      operation,
    });

    try {
      let accountsCreated = 0;
      let accountsUpdated = 0;

      // Get existing accounts for this connection
      const existingAccounts = await getAccountsByConnectionId(connectionId);

      const existingAccountMap = existingAccounts.reduce((acc, account) => {
        acc[account.provider_account_id] = account;
        return acc;
      }, {});

      // Process each account
      for (const account of accounts) {
        const existingAccount = existingAccountMap[account.id];

        if (existingAccount) {
          // Check if account needs updating
          if (hasAccountChanged(existingAccount, account)) {
            await updateAccount(existingAccount.id, {
              name: account.name,
              official_name: account.official_name,
              type: account.type,
              subtype: account.subtype,
              status: account.status || 'active',
              last_updated: new Date().toISOString(),
            });
            accountsUpdated++;
          }
        } else {
          // Create new account
          await createAccount({
            connection_id: connectionId,
            provider_account_id: account.id,
            user_id: userId,
            name: account.name,
            official_name: account.official_name,
            type: account.type,
            subtype: account.subtype,
            status: account.status || 'active',
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString(),
          });
          accountsCreated++;
        }
      }

      // Notify user about new accounts if any were created
      if (accountsCreated > 0) {
        await sendNotification({
          userId,
          type: 'accounts_added',
          title: 'New Accounts Found',
          message: `We found ${accountsCreated} new account(s) in your bank connection.`,
          data: {
            connectionId,
            accountsCreated,
          },
        });
      }

      // Record metrics
      metrics.increment('accounts.created', accountsCreated);
      metrics.increment('accounts.updated', accountsUpdated);
      metrics.timing('account_management.duration', Date.now() - startTime);

      return {
        success: true,
        accountsCreated,
        accountsUpdated,
      };
    } catch (error) {
      logger.error('Account management job failed', {
        traceId,
        connectionId,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  },
});

// Helper to determine if account data has changed significantly
function hasAccountChanged(existingAccount, newAccountData) {
  return (
    existingAccount.name !== newAccountData.name ||
    existingAccount.official_name !== newAccountData.official_name ||
    existingAccount.type !== newAccountData.type ||
    existingAccount.subtype !== newAccountData.subtype ||
    existingAccount.status !== (newAccountData.status || 'active')
  );
}
```

### Connection Refresh Job

A job for managing token refresh processes for various providers:

```typescript
// apps/dashboard/jobs/tasks/bank/connections/refresh-connection-job.ts
import { createJob } from '@/jobs/utils/job-creator';
import { getBankingProvider } from '@/lib/banking/providers';
import { updateBankConnection } from '@/lib/banking/connection';
import { logger } from '@/lib/logger';
import { sendNotification } from '@/lib/notifications';

interface RefreshConnectionJobData {
  connectionId: string;
  accessToken: string;
  refreshToken: string;
  provider: 'plaid' | 'teller' | 'gocardless';
  userId: string;
}

interface RefreshConnectionJobResult {
  success: boolean;
  newAccessToken?: string;
  newRefreshToken?: string;
  expiresAt?: string;
  error?: string;
}

export const refreshConnectionJob = createJob<
  RefreshConnectionJobData,
  RefreshConnectionJobResult
>({
  name: 'refresh-connection',
  options: {
    priority: 15, // Higher priority than regular syncs
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 30000, // 30 seconds initial delay
    },
  },
  handler: async ({
    connectionId,
    accessToken,
    refreshToken,
    provider,
    userId,
  }) => {
    const traceId = `refresh-connection-${connectionId}-${Date.now()}`;

    logger.info('Starting connection refresh job', {
      traceId,
      connectionId,
      provider,
    });

    try {
      // Get the appropriate provider client
      const bankingProvider = getBankingProvider(provider);

      // Update connection status to refreshing
      await updateBankConnection(connectionId, {
        status: 'refreshing',
        last_refresh_attempt: new Date().toISOString(),
      });

      // Perform provider-specific token refresh
      const refreshResult = await bankingProvider.refreshTokens({
        accessToken,
        refreshToken,
      });

      // Extract new tokens from result
      const newAccessToken = refreshResult.access_token;
      const newRefreshToken = refreshResult.refresh_token;
      const expiresAt = refreshResult.expires_at;

      logger.info('Successfully refreshed connection tokens', {
        traceId,
        connectionId,
        expiresAt,
      });

      // Update connection with new tokens
      await updateBankConnection(connectionId, {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_at: expiresAt,
        status: 'connected',
        last_refresh_success: new Date().toISOString(),
        error: null,
      });

      // Queue a sync job with the new access token to verify it works
      await queueJob('sync-bank', {
        connectionId,
        accessToken: newAccessToken,
        provider,
        userId,
      });

      return {
        success: true,
        newAccessToken,
        newRefreshToken,
        expiresAt,
      };
    } catch (error) {
      logger.error('Connection refresh job failed', {
        traceId,
        connectionId,
        provider,
        error: error.message,
        errorCode: error.code,
      });

      // Update connection status based on error
      let status = 'refresh_failed';
      let errorMessage = error.message;

      // Provider-specific error handling
      if (provider === 'plaid' && error.code === 'INVALID_REFRESH_TOKEN') {
        status = 'invalid_refresh_token';
        errorMessage = 'Invalid refresh token';
      } else if (
        provider === 'gocardless' &&
        error.code === 'refresh_token_expired'
      ) {
        status = 'refresh_token_expired';
        errorMessage = 'Refresh token expired';
      }

      await updateBankConnection(connectionId, {
        status,
        error: errorMessage,
        last_refresh_attempt: new Date().toISOString(),
      });

      // Notify user if refresh failed and needs attention
      if (
        status === 'invalid_refresh_token' ||
        status === 'refresh_token_expired'
      ) {
        await sendNotification({
          userId,
          type: 'connection_refresh_failed',
          title: 'Bank Connection Needs Attention',
          message: 'Your bank connection needs to be reconnected.',
          data: {
            connectionId,
            provider,
            error: errorMessage,
          },
        });
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});
```

### Link-Token Creation Job

A job for creating link tokens for reconnection flows:

```typescript
// apps/dashboard/jobs/tasks/bank/connections/create-link-token-job.ts
import { createJob } from '@/jobs/utils/job-creator';
import { getBankingProvider } from '@/lib/banking/providers';
import { logger } from '@/lib/logger';

interface CreateLinkTokenJobData {
  userId: string;
  connectionId?: string; // Optional for reconnection flows
  provider: 'plaid' | 'teller' | 'gocardless';
  clientUserId: string;
  redirectUri?: string;
  androidPackageName?: string;
  iosBundleId?: string;
}

interface CreateLinkTokenJobResult {
  success: boolean;
  linkToken?: string;
  expiresAt?: string;
  error?: string;
}

export const createLinkTokenJob = createJob<
  CreateLinkTokenJobData,
  CreateLinkTokenJobResult
>({
  name: 'create-link-token',
  handler: async ({
    userId,
    connectionId,
    provider,
    clientUserId,
    redirectUri,
    androidPackageName,
    iosBundleId,
  }) => {
    const traceId = `create-link-token-${userId}-${Date.now()}`;

    logger.info('Starting link token creation job', {
      traceId,
      userId,
      provider,
      connectionId: connectionId || 'new-connection',
    });

    try {
      // Get the appropriate provider client
      const bankingProvider = getBankingProvider(provider);

      // Get user information for the request
      const user = await getUserById(userId);

      // Prepare options based on provider
      const options = {
        client_user_id: clientUserId,
        user: {
          name: user.name || user.email,
          email: user.email,
          phone: user.phone,
        },
        client_name: 'Solomon AI Finance',
        products: ['auth', 'transactions', 'investments', 'liabilities'],
        country_codes: ['US'],
        language: 'en',
        webhook: process.env.BANKING_WEBHOOK_URL,
        redirect_uri: redirectUri,
        android_package_name: androidPackageName,
        ios_bundle_id: iosBundleId,
      };

      // Add connection_id for update mode if provided
      if (connectionId) {
        const connection = await getBankConnection(connectionId);

        if (!connection) {
          throw new Error('Connection not found');
        }

        // Add provider-specific update configuration
        if (provider === 'plaid') {
          options.access_token = connection.access_token;
          options.update = {
            account_selection_enabled: false,
          };
        } else if (provider === 'teller') {
          options.enrollment_id = connection.provider_item_id;
          options.mode = 'reconnect';
        } else if (provider === 'gocardless') {
          options.requisition_id = connection.provider_item_id;
          options.mode = 'update';
        }
      }

      // Create link token with the provider
      const linkTokenResponse = await bankingProvider.createLinkToken(options);

      logger.info('Successfully created link token', {
        traceId,
        expiresAt: linkTokenResponse.expiration,
      });

      return {
        success: true,
        linkToken: linkTokenResponse.link_token,
        expiresAt: linkTokenResponse.expiration,
      };
    } catch (error) {
      logger.error('Link token creation job failed', {
        traceId,
        userId,
        provider,
        error: error.message,
        errorCode: error.code,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  },
});
```

## Transaction Processing

Transaction processing involves fetching, normalizing, categorizing, and storing transaction data.

### Transaction Sync Job

The transaction sync job fetches new transactions from the banking provider:

```typescript
// jobs/tasks/bank/transactions/sync-transactions-job.ts
import { createJob } from '@/jobs/utils/job-creator';
import { getBankingProvider } from '@/lib/banking/providers';
import { processTransactions } from '@/lib/banking/transactions';
import { queueJob } from '@/jobs/utils/queue';

export const syncTransactionsJob = createJob({
  name: 'sync-transactions',
  handler: async ({
    connectionId,
    accessToken,
    provider,
    startDate,
    endDate,
  }) => {
    try {
      const bankingProvider = getBankingProvider(provider);

      // Fetch transactions for the specified date range
      const transactions = await bankingProvider.getTransactions(
        accessToken,
        startDate,
        endDate
      );

      // Process and store transactions
      const processedCount = await processTransactions(
        connectionId,
        transactions
      );

      // Queue categorization job
      await queueJob('categorize-transactions', {
        connectionId,
        transactionIds: transactions.map((t) => t.id),
      });

      return {
        success: true,
        transactionCount: transactions.length,
        processedCount,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});
```

### Transaction Categorization Job

A job that categorizes transactions using machine learning:

```typescript
// jobs/tasks/bank/transactions/categorize-transactions-job.ts
import { createJob } from '@/jobs/utils/job-creator';
import { getTransactionCategorizer } from '@/lib/categorization';
import { updateTransactionCategory } from '@/lib/banking/transactions';

export const categorizeTransactionsJob = createJob({
  name: 'categorize-transactions',
  handler: async ({ connectionId, transactionIds }) => {
    try {
      // Get transactions from database
      const transactions = await getTransactionsByIds(transactionIds);

      // Get categorizer instance
      const categorizer = getTransactionCategorizer();

      // Process transactions in batches to avoid memory issues
      const batchSize = 100;
      let categorizedCount = 0;

      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);

        // Categorize batch
        const categorizedTransactions = await categorizer.categorize(batch);

        // Update categories in database
        for (const transaction of categorizedTransactions) {
          await updateTransactionCategory(
            transaction.id,
            transaction.category,
            transaction.confidence
          );
          categorizedCount++;
        }
      }

      return {
        success: true,
        categorizedCount,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});
```

## Notification System

The notification system alerts users about important events related to their bank connections.

### Connection Expiration Notification

A job that checks for expiring connections and notifies users:

```typescript
// jobs/tasks/bank/notifications/connection-expiration-job.ts
import { createJob } from '@/jobs/utils/job-creator';
import { differenceInDays } from 'date-fns';
import { sendNotification } from '@/lib/notifications';

// Constants for expiration thresholds
const WARNING_DAYS = 14;
const CRITICAL_DAYS = 3;

export const connectionExpirationJob = createJob({
  name: 'check-connection-expiration',
  handler: async () => {
    try {
      // Get all active connections
      const connections = await getActiveConnections();

      let warningCount = 0;
      let criticalCount = 0;

      for (const connection of connections) {
        if (!connection.expires_at) continue;

        const daysUntilExpiration = differenceInDays(
          new Date(connection.expires_at),
          new Date()
        );

        // Handle critical expiration (3 days or less)
        if (daysUntilExpiration <= CRITICAL_DAYS && daysUntilExpiration > 0) {
          await sendNotification({
            userId: connection.user_id,
            type: 'connection_critical',
            title: 'Bank Connection Expiring Soon',
            message: `Your connection to ${connection.name} will expire in ${daysUntilExpiration} days. Please reconnect to avoid interruption.`,
            data: {
              connectionId: connection.id,
              bankName: connection.name,
              daysRemaining: daysUntilExpiration,
            },
          });
          criticalCount++;
        }
        // Handle warning expiration (14 days or less)
        else if (
          daysUntilExpiration <= WARNING_DAYS &&
          daysUntilExpiration > CRITICAL_DAYS
        ) {
          await sendNotification({
            userId: connection.user_id,
            type: 'connection_warning',
            title: 'Bank Connection Update Needed',
            message: `Your connection to ${connection.name} will expire in ${daysUntilExpiration} days.`,
            data: {
              connectionId: connection.id,
              bankName: connection.name,
              daysRemaining: daysUntilExpiration,
            },
          });
          warningCount++;
        }
      }

      return {
        success: true,
        warningCount,
        criticalCount,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});
```

## Scheduler

The scheduler is responsible for setting up recurring jobs based on provider requirements and user preferences.

### Sync Schedule Setup

A job that sets up the appropriate sync schedule for a connection:

```typescript
// jobs/tasks/bank/scheduler/setup-sync-schedule-job.ts
import { createJob } from '@/jobs/utils/job-creator';
import { scheduleRecurringJob } from '@/jobs/utils/scheduler';

export const setupSyncScheduleJob = createJob({
  name: 'setup-sync-schedule',
  handler: async ({ connectionId, provider, accessToken }) => {
    try {
      // Different providers have different optimal sync frequencies
      const scheduleConfig = getProviderScheduleConfig(provider);

      // Schedule transaction sync job
      await scheduleRecurringJob({
        jobName: 'sync-transactions',
        schedule: scheduleConfig.transactionSchedule, // e.g., '0 */6 * * *' for every 6 hours
        data: {
          connectionId,
          provider,
          accessToken,
          // Dynamic date range based on last sync
          startDate: 'dynamic:last-sync',
          endDate: 'dynamic:now',
        },
      });

      // Schedule balance update job (more frequent than transactions)
      await scheduleRecurringJob({
        jobName: 'update-balances',
        schedule: scheduleConfig.balanceSchedule, // e.g., '0 */2 * * *' for every 2 hours
        data: {
          connectionId,
          provider,
          accessToken,
        },
      });

      return {
        success: true,
        schedules: {
          transactions: scheduleConfig.transactionSchedule,
          balances: scheduleConfig.balanceSchedule,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

// Helper function to get provider-specific schedule configuration
function getProviderScheduleConfig(provider) {
  switch (provider) {
    case 'plaid':
      return {
        transactionSchedule: '0 */6 * * *', // Every 6 hours
        balanceSchedule: '0 */2 * * *', // Every 2 hours
      };
    case 'teller':
      return {
        transactionSchedule: '0 */8 * * *', // Every 8 hours
        balanceSchedule: '0 */3 * * *', // Every 3 hours
      };
    case 'gocardless':
      return {
        transactionSchedule: '0 */12 * * *', // Every 12 hours
        balanceSchedule: '0 */4 * * *', // Every 4 hours
      };
    default:
      return {
        transactionSchedule: '0 */12 * * *', // Every 12 hours
        balanceSchedule: '0 */6 * * *', // Every 6 hours
      };
  }
}
```

## Error Handling

The error handling system manages failures in the syncing process and implements retry strategies.

### Connection Recovery Job

A job that attempts to recover failed connections:

```typescript
// jobs/tasks/bank/sync/connection-recovery-job.ts
import { createJob } from '@/jobs/utils/job-creator';
import { getBankingProvider } from '@/lib/banking/providers';
import { updateBankConnection } from '@/lib/banking/connection';

export const connectionRecoveryJob = createJob({
  name: 'connection-recovery',
  handler: async ({ connectionId, provider, accessToken, retryCount = 0 }) => {
    try {
      // Get the appropriate provider client
      const bankingProvider = getBankingProvider(provider);

      // Check connection status
      const status = await bankingProvider.checkConnection(accessToken);

      if (status.valid) {
        // Connection is valid, update status
        await updateBankConnection(connectionId, {
          status: 'connected',
          error: null,
          error_retries: 0,
        });

        return {
          success: true,
          recovered: true,
        };
      } else {
        // Connection is invalid, increment retry count
        const newRetryCount = retryCount + 1;

        await updateBankConnection(connectionId, {
          status: 'disconnected',
          error: status.error || 'Connection validation failed',
          error_retries: newRetryCount,
        });

        // If we haven't exceeded max retries, schedule another attempt
        if (newRetryCount < 3) {
          // Schedule with exponential backoff
          const delayMinutes = Math.pow(2, newRetryCount) * 15; // 15min, 30min, 60min

          await scheduleJob({
            jobName: 'connection-recovery',
            runAt: new Date(Date.now() + delayMinutes * 60 * 1000),
            data: {
              connectionId,
              provider,
              accessToken,
              retryCount: newRetryCount,
            },
          });

          return {
            success: true,
            recovered: false,
            scheduled: true,
            nextAttempt: `in ${delayMinutes} minutes`,
          };
        }

        // Max retries exceeded, notify user
        await sendNotification({
          userId: await getUserIdForConnection(connectionId),
          type: 'connection_failed',
          title: 'Bank Connection Failed',
          message:
            'We were unable to connect to your bank. Please reconnect your account.',
          data: {
            connectionId,
            error: status.error,
          },
        });

        return {
          success: true,
          recovered: false,
          scheduled: false,
          maxRetriesExceeded: true,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});
```

## Implementation Examples

### 1. Setting Up Initial Bank Sync

When a user first connects a bank account, you need to set up the initial sync:

```typescript
// Example of setting up initial bank sync after connection
import { queueJob } from '@/jobs/utils/queue';

export async function handleBankConnection(connectionData) {
  // Save the connection to the database
  const connection = await createBankConnection({
    user_id: connectionData.userId,
    provider: connectionData.provider,
    access_token: connectionData.accessToken,
    institution_id: connectionData.institutionId,
    status: 'connected',
  });

  // Queue initial sync jobs
  await queueJob('sync-bank', {
    connectionId: connection.id,
    accessToken: connection.access_token,
    provider: connection.provider,
  });

  // Queue historical transaction sync
  // Get date 90 days in the past for initial sync
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);

  await queueJob('sync-transactions', {
    connectionId: connection.id,
    accessToken: connection.access_token,
    provider: connection.provider,
    startDate: startDate.toISOString(),
    endDate: new Date().toISOString(),
  });

  // Set up recurring sync schedule
  await queueJob('setup-sync-schedule', {
    connectionId: connection.id,
    provider: connection.provider,
    accessToken: connection.access_token,
  });

  return connection;
}
```

### 2. Implementing Manual Sync

Allow users to manually trigger a sync from the UI:

```typescript
// Server action for manual sync
'use server';

import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';
import { queueJob } from '@/jobs/utils/queue';
import { getBankConnection } from '@/lib/banking/connection';
import type { ActionResponse } from '@/app/actions/actions';

const schema = z.object({
  connectionId: z.string(),
});

export const manualSyncTransactionsAction = createSafeActionClient()
  .schema(schema)
  .action(async ({ connectionId }): Promise<ActionResponse> => {
    try {
      // Get connection details
      const connection = await getBankConnection(connectionId);

      if (!connection) {
        return {
          success: false,
          error: { message: 'Connection not found' },
        };
      }

      // Get date 30 days in the past for manual sync
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      // Queue sync job
      const job = await queueJob('sync-transactions', {
        connectionId,
        accessToken: connection.access_token,
        provider: connection.provider,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      });

      return {
        success: true,
        data: {
          id: job.id,
          publicAccessToken: job.publicAccessToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error.message || 'Failed to sync transactions' },
      };
    }
  });
```

### 3. Monitoring Sync Status

Create a hook to monitor the status of a sync job:

```typescript
// Client-side hook for monitoring sync status
'use client';

import { useState, useEffect } from 'react';

export function useSyncStatus({ runId, accessToken }) {
  const [status, setStatus] = useState('PENDING');

  useEffect(() => {
    if (!runId || !accessToken) return;

    let intervalId;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/jobs/status?id=${runId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch job status');
        }

        const data = await response.json();

        setStatus(data.status);

        // Clear interval if job is complete or failed
        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Error checking job status:', error);
        setStatus('FAILED');
        clearInterval(intervalId);
      }
    };

    // Check immediately
    checkStatus();

    // Then check every 2 seconds
    intervalId = setInterval(checkStatus, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [runId, accessToken]);

  return { status, setStatus };
}
```

### 4. Implementing Transaction Processing

Process and categorize transactions:

```typescript
// Implementation of transaction processing
export async function processTransactions(connectionId, transactions) {
  let processedCount = 0;

  // Get existing transactions to avoid duplicates
  const existingTransactionIds = await getExistingTransactionIds(connectionId);

  // Process each transaction
  for (const transaction of transactions) {
    // Skip if transaction already exists
    if (existingTransactionIds.includes(transaction.id)) {
      continue;
    }

    // Normalize transaction data
    const normalizedTransaction = normalizeTransaction(transaction);

    // Store in database
    await storeTransaction({
      ...normalizedTransaction,
      connection_id: connectionId,
    });

    processedCount++;
  }

  return processedCount;
}

// Helper to normalize transaction data from different providers
function normalizeTransaction(transaction) {
  return {
    id: transaction.id,
    account_id: transaction.account_id,
    amount: transaction.amount,
    date: transaction.date,
    description: transaction.description || transaction.name,
    merchant_name: transaction.merchant_name,
    pending: transaction.pending || false,
    category: transaction.category || null,
    location: transaction.location || null,
    // Add any other fields needed
  };
}
```

## Best Practices

1. **Rate Limiting**: Respect provider rate limits to avoid being blocked
2. **Error Handling**: Implement robust error handling with appropriate retry strategies
3. **Idempotency**: Ensure transaction processing is idempotent to avoid duplicates
4. **Monitoring**: Set up monitoring for sync jobs to detect and address issues
5. **User Feedback**: Provide clear feedback to users about sync status and issues
6. **Data Validation**: Validate data from providers before storing in your database
7. **Security**: Securely store access tokens and sensitive financial data
8. **Compliance**: Ensure compliance with financial regulations and data protection laws

## Conclusion

Implementing bank and transaction syncing requires careful coordination between multiple components. By following the patterns in this guide, you can create a robust system that reliably syncs financial data while providing a smooth user experience.
