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
src/jobs/
├── client.ts           # Trigger.dev client configuration
├── index.ts            # Job registration and exports
├── utils/              # Job utilities and shared functions
│   ├── helpers.ts      # Helper functions for jobs
│   ├── rate-limiting.ts # Rate limiting utilities
│   └── error-handling.ts # Common error handling patterns
└── tasks/              # Task definitions organized by domain
    ├── bank/           # Banking-related jobs
    │   ├── sync/       # Bank sync jobs
    │   ├── setup/      # Bank setup jobs
    │   ├── scheduler/  # Scheduling jobs
    │   ├── notifications/ # Banking notification jobs
    │   └── transactions/ # Transaction processing jobs
    ├── financial/      # Financial analysis jobs
    └── reconnect/      # Reconnection jobs
```

The banking providers are integrated through a provider-agnostic adapter system:

```
server/services/
├── plaid/             # Plaid integration
├── teller/            # Teller integration
├── gocardless/        # GoCardless integration
└── common/            # Shared utilities for all providers
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

- **Job Queue**: Trigger.dev for reliable job queuing and processing
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

All bank sync jobs are built using Trigger.dev's job definition framework. The client is configured in `src/jobs/client.ts`:

```typescript
// src/jobs/client.ts
import { TriggerClient } from '@trigger.dev/sdk';

/**
 * This client is used to interact with the Trigger.dev API You can use it in
 * your application to trigger jobs
 */
export const client = new TriggerClient({
  id: 'smb-financial-management-platform',
  apiKey: process.env.TRIGGER_API_KEY || '',
  apiUrl: process.env.TRIGGER_API_URL,
});
```

Jobs are defined using the `schemaTask()` method, which provides type safety and built-in logging, retries, and monitoring:

```typescript
// Example job definition pattern
import { client } from '../client';
import { eventTrigger } from '@trigger.dev/sdk';
import { z } from 'zod';

export const exampleSyncJob = schemaTask({
  // Unique identifier for the job
  id: 'sync-bank-example',

  // Human-readable name
  name: 'Sync Bank Example',

  // Version for tracking changes
  version: '1.0.0',

  // Trigger that determines when the job runs
  trigger: eventTrigger({
    name: 'sync-bank-trigger',
    schema: z.object({
      connectionId: z.string(),
      accessToken: z.string(),
      provider: z.enum(['plaid', 'teller', 'gocardless']),
      userId: z.string(),
      forceRefresh: z.boolean().optional(),
    }),
  }),

  // The main job function
  run: async (payload, io, ctx) => {
    const {
      connectionId,
      accessToken,
      provider,
      userId,
      forceRefresh = false,
    } = payload;

    // Log the start of the job
    await logger.info('Starting bank sync job', {
      connectionId,
      provider,
      userId,
      forceRefresh,
    });

    try {
      // Job implementation goes here

      return {
        success: true,
        accountCount: 5, // Example value
        lastSyncTime: new Date().toISOString(),
      };
    } catch (error) {
      // Error handling
      await logger.error('Bank sync job failed', {
        connectionId,
        provider,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  },
});
```

Jobs are registered in the `src/jobs/index.ts` file:

```typescript
// src/jobs/index.ts
import { syncConnectionJob } from './tasks/bank/sync/connection';
import { syncAccountJob } from './tasks/bank/sync/account';
import { updateBalancesJob } from './tasks/bank/update-balances';
// Import other jobs...

// Define the jobs to be registered
const jobs = [
  syncConnectionJob,
  syncAccountJob,
  updateBalancesJob,
  // Other jobs...
];

export function registerJobs() {
  return jobs;
}
```

### Core Sync Job

The core sync job (`sync-connection.ts`) handles fetching the latest data from a banking provider and updating the connection status:

```typescript
// src/jobs/tasks/bank/sync/connection.ts
import { BankConnectionStatus } from '@prisma/client';
import { eventTrigger } from '@trigger.dev/sdk';

import { prisma } from '@/server/db';
import { getItemDetails } from '@/server/services/plaid';

import { client } from '../../../client';

/**
 * This job handles syncing a bank connection and all its accounts It's a
 * fan-out job that triggers sync-account for each account
 */
export const syncConnectionJob = schemaTask({
  id: 'sync-connection-job',
  name: 'Sync Bank Connection',
  trigger: eventTrigger({
    name: 'sync-connection',
  }),
  version: '1.0.0',
  run: async (payload, io) => {
    const { connectionId, manualSync = false } = payload;

    await logger.info(`Starting connection sync for ${connectionId}`);

    try {
      // Fetch the connection details
      const connection = await io.runTask('get-connection', async () => {
        return await prisma.bankConnection.findUnique({
          select: {
            id: true,
            accessToken: true,
            institutionId: true,
            institutionName: true,
            status: true,
            userId: true,
          },
          where: { id: connectionId },
        });
      });

      if (!connection) {
        await logger.error(`Connection ${connectionId} not found`);
        throw new Error(`Connection ${connectionId} not found`);
      }

      // Check connection status with Plaid
      const connectionDetails = await io.runTask(
        'check-connection-status',
        async () => {
          return await getItemDetails(connection.accessToken);
        }
      );

      // Update connection status based on Plaid response
      await io.runTask('update-connection-status', async () => {
        await prisma.bankConnection.update({
          data: {
            lastSyncAt: new Date(),
            status: connectionDetails.error
              ? BankConnectionStatus.ERROR
              : BankConnectionStatus.ACTIVE,
          },
          where: { id: connectionId },
        });
      });

      // Get all active accounts for this connection
      const accounts = await io.runTask('get-accounts', async () => {
        return await prisma.bankAccount.findMany({
          select: {
            id: true,
            plaidAccountId: true,
            status: true,
          },
          where: {
            bankConnectionId: connectionId,
            status: manualSync ? undefined : 'ACTIVE', // Include all accounts for manual sync
          },
        });
      });

      if (accounts.length === 0) {
        await logger.info(
          `No active accounts found for connection ${connectionId}`
        );

        return {
          accountsSynced: 0,
          status: 'success',
        };
      }

      await logger.info(`Found ${accounts.length} accounts to sync`);

      // Trigger account syncs with appropriate delays
      let accountsSynced = 0;

      for (const account of accounts) {
        await client.sendEvent({
          // Use context for delay information
          context: {
            delaySeconds: manualSync ? accountsSynced * 2 : accountsSynced * 30,
          },
          name: 'sync-account-trigger',
          payload: {
            accessToken: connection.accessToken,
            bankAccountId: account.id,
            manualSync,
            userId: connection.userId,
          },
        });
        accountsSynced++;
      }

      // For manual syncs, we'll also trigger transaction notifications
      if (manualSync) {
        await client.sendEvent({
          // Use context for delay information
          context: {
            delaySeconds: 120, // 2 minutes
          },
          name: 'sync-transaction-notifications-trigger',
          payload: {
            userId: connection.userId,
          },
        });
      }

      await logger.info(
        `Connection sync completed, triggered ${accountsSynced} account syncs`
      );

      return {
        accountsSynced,
        connectionId,
        status: 'success',
      };
    } catch (error) {
      await logger.error(`Connection sync failed: ${error.message}`, {
        connectionId,
        error: error.stack,
      });

      // Update connection status to error
      await prisma.bankConnection.update({
        data: {
          error: error.message,
          lastSyncAt: new Date(),
          status: BankConnectionStatus.ERROR,
        },
        where: { id: connectionId },
      });

      return {
        connectionId,
        error: error.message,
        status: 'error',
      };
    }
  },
});
```

### Balance Update Job

A specialized job for updating account balances more frequently than full syncs:

```typescript
// src/jobs/tasks/bank/update-balances.ts
import { BankConnectionStatus } from '@prisma/client';
import { cronTrigger } from '@trigger.dev/sdk';

import { prisma } from '@/server/db';
import { getAccounts } from '@/server/services/plaid';

import { client } from '../../client';

/**
 * This job updates bank account balances on a frequent basis without pulling
 * full transaction history, providing more real-time balance data.
 */
export const updateBalancesJob = schemaTask({
  id: 'update-bank-balances-job',
  name: 'Update Bank Balances',
  trigger: cronTrigger({
    cron: '0 */2 * * *', // Every 2 hours
  }),
  version: '1.0.0',
  run: async (payload, io) => {
    await logger.info('Starting balance update job');

    // Find active connections to update
    const connections = await io.runTask('get-active-connections', async () => {
      return await prisma.bankConnection.findMany({
        include: {
          accounts: {
            where: {
              status: 'ACTIVE',
            },
          },
        },
        orderBy: {
          balanceLastUpdated: 'asc', // Update oldest first
        },
        take: 100, // Process in batches
        where: {
          status: BankConnectionStatus.ACTIVE,
        },
      });
    });

    await logger.info(
      `Found ${connections.length} connections to update balances`
    );

    let successCount = 0;
    let errorCount = 0;
    let accountsUpdated = 0;

    // Process each connection
    for (const connection of connections) {
      try {
        // Skip connections with no active accounts
        if (connection.accounts.length === 0) {
          continue;
        }

        await logger.info(
          `Updating balances for connection ${connection.id} with ${connection.accounts.length} accounts`
        );

        // Get account balances from Plaid
        const plaidAccounts = await io.runTask(
          `fetch-balances-${connection.id}`,
          async () => {
            return await getAccounts(connection.accessToken);
          }
        );

        // Update each account balance
        for (const account of connection.accounts) {
          const plaidAccount = plaidAccounts.find(
            (a) => a.plaidAccountId === account.plaidAccountId
          );

          if (plaidAccount) {
            await io.runTask(`update-balance-${account.id}`, async () => {
              await prisma.bankAccount.update({
                data: {
                  availableBalance: plaidAccount.availableBalance,
                  balanceLastUpdated: new Date(),
                  currentBalance: plaidAccount.currentBalance,
                  limit: plaidAccount.limit,
                },
                where: { id: account.id },
              });
            });
            accountsUpdated++;
          }
        }

        // Update connection's balance last updated timestamp
        await io.runTask(`update-connection-${connection.id}`, async () => {
          await prisma.bankConnection.update({
            data: {
              balanceLastUpdated: new Date(),
            },
            where: { id: connection.id },
          });
        });

        successCount++;
      } catch (error) {
        await logger.error(
          `Error updating balances for connection ${connection.id}: ${error.message}`
        );
        errorCount++;
      }
    }

    await logger.info(
      `Balance update job completed: ${successCount} connections updated, ${accountsUpdated} account balances updated, ${errorCount} errors`
    );

    return {
      accountsUpdated,
      connectionsProcessed: connections.length,
      errorCount,
      successCount,
    };
  },
});
```

### Account Creation and Setup Job

A job for handling the initial setup of bank accounts:

```typescript
// src/jobs/tasks/bank/setup/initial.ts
import {
  type BankAccount,
  AccountStatus,
  AccountType,
  BankConnectionStatus,
} from '@prisma/client';
import { eventTrigger } from '@trigger.dev/sdk';

import { prisma } from '@/server/db';
import { getAccounts, getInstitutionById } from '@/server/services/plaid';

import { client } from '../../../client';

/**
 * This job handles the initial setup of a bank connection after a user has
 * successfully authenticated with Plaid. It creates the bank connection record
 * and all associated bank accounts, then triggers the initial sync.
 */
export const initialSetupJob = schemaTask({
  id: 'initial-setup-job',
  name: 'Initial Bank Connection Setup',
  trigger: eventTrigger({
    name: 'initial-setup',
  }),
  version: '1.0.0',
  run: async (payload, io) => {
    const { accessToken, institutionId, itemId, publicToken, userId } = payload;

    await logger.info(
      `Starting initial setup for institution ${institutionId}`
    );

    try {
      // Get institution details
      const institution = await io.runTask('get-institution', async () => {
        return await getInstitutionById(institutionId);
      });

      // Create bank connection record
      const bankConnection = await io.runTask('create-connection', async () => {
        return await prisma.bankConnection.create({
          data: {
            accessToken,
            institutionId,
            institutionName: institution.name,
            itemId,
            lastSyncAt: new Date(),
            status: BankConnectionStatus.ACTIVE,
            userId,
          },
        });
      });

      // Get accounts from Plaid
      const plaidAccounts = await io.runTask('get-accounts', async () => {
        return await getAccounts(accessToken);
      });

      await logger.info(
        `Found ${plaidAccounts.length} accounts for institution ${institution.name}`
      );

      // Create bank account records
      const bankAccounts: BankAccount[] = [];
      for (const account of plaidAccounts) {
        const bankAccount = await io.runTask(
          `create-account-${account.plaidAccountId}`,
          async () => {
            return await prisma.bankAccount.create({
              data: {
                availableBalance: account.availableBalance,
                balanceLastUpdated: new Date(),
                bankConnectionId: bankConnection.id,
                currentBalance: account.currentBalance,
                isoCurrencyCode: account.isoCurrencyCode,
                limit: account.limit,
                mask: account.mask,
                name: account.name,
                officialName: account.officialName,
                plaidAccountId: account.plaidAccountId,
                status: AccountStatus.ACTIVE,
                subtype: account.subtype,
                type: mapPlaidAccountType(account.type, account.subtype),
                userId,
              },
            });
          }
        );
        bankAccounts.push(bankAccount);
      }

      // Trigger sync for each account with increasing delays
      let delayCounter = 0;

      for (const account of bankAccounts) {
        // Trigger a complete sync for each account (delays increasing by 5 seconds)
        await client.sendEvent({
          // Add a context with delay information
          context: {
            delaySeconds: delayCounter * 5,
          },
          name: 'sync-account-trigger',
          payload: {
            accessToken,
            bankAccountId: account.id,
            manualSync: true, // Force sync even for accounts that might have issues
            userId,
          },
        });
        delayCounter++;
      }

      // Record this activity
      await prisma.userActivity.create({
        data: {
          detail: `Connected ${institution.name} with ${bankAccounts.length} accounts`,
          metadata: {
            accountCount: bankAccounts.length,
            bankConnectionId: bankConnection.id,
          },
          type: 'ACCOUNT_CONNECTED',
          userId,
        },
      });

      await logger.info(`Initial setup completed for ${institution.name}`);

      return {
        accountCount: bankAccounts.length,
        bankConnectionId: bankConnection.id,
        status: 'success',
      };
    } catch (error) {
      await logger.error(
        `Initial setup failed for institution ${institutionId}: ${error.message}`
      );

      return {
        error: error.message,
        institutionId,
        status: 'error',
      };
    }
  },
});

// Helper function to map Plaid account types to our internal types
function mapPlaidAccountType(
  type: string,
  subtype: string | null
): AccountType {
  switch (type) {
    case 'depository':
      if (subtype === 'checking') return AccountType.CHECKING;
      if (subtype === 'savings') return AccountType.SAVINGS;
      return AccountType.DEPOSITORY;
    case 'credit':
      return AccountType.CREDIT;
    case 'loan':
      return AccountType.LOAN;
    case 'investment':
      return AccountType.INVESTMENT;
    default:
      return AccountType.OTHER;
  }
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
// src/jobs/tasks/bank/transactions/upsert.ts
import { eventTrigger } from '@trigger.dev/sdk';
import { z } from 'zod';

import { prisma } from '@/server/db';
import { getTransactions } from '@/server/services/plaid';
import { categorizePlaidTransaction } from '@/server/services/categorization';

import { client } from '../../../client';

/**
 * This job fetches transactions for a specific bank account and upserts them
 * into the database. It also handles categorization of new transactions.
 */
export const upsertTransactionsJob = schemaTask({
  id: 'upsert-transactions-job',
  name: 'Upsert Bank Transactions',
  trigger: eventTrigger({
    name: 'upsert-transactions-trigger',
    schema: z.object({
      accessToken: z.string(),
      bankAccountId: z.string(),
      userId: z.string(),
    }),
  }),
  version: '1.0.0',
  run: async (payload, io) => {
    const { accessToken, bankAccountId, userId } = payload;

    await logger.info(
      `Starting transaction sync for account ${bankAccountId}`
    );

    try {
      // Get the bank account details
      const bankAccount = await io.runTask('get-bank-account', async () => {
        return await prisma.bankAccount.findUnique({
          select: {
            id: true,
            plaidAccountId: true,
            lastTransactionSync: true,
          },
          where: { id: bankAccountId },
        });
      });

      if (!bankAccount) {
        throw new Error(`Bank account ${bankAccountId} not found`);
      }

      // Determine date range for transaction fetch
      const startDate = bankAccount.lastTransactionSync
        ? new Date(bankAccount.lastTransactionSync)
        : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

      const endDate = new Date();

      // Fetch transactions from Plaid
      const transactions = await io.runTask('fetch-transactions', async () => {
        return await getTransactions(
          accessToken,
          bankAccount.plaidAccountId,
          startDate,
          endDate
        );
      });

      await logger.info(
        `Fetched ${transactions.length} transactions for account ${bankAccountId}`
      );

      // Process transactions in batches to avoid timeouts
      const batchSize = 50;
      let processedCount = 0;
      let newCount = 0;
      let updatedCount = 0;

      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);

        await io.runTask(`process-batch-${i}`, async () => {
          for (const transaction of batch) {
            // Check if transaction already exists
            const existingTransaction = await prisma.transaction.findUnique({
              where: {
                plaidTransactionId: transaction.plaidTransactionId,
              },
            });

            if (existingTransaction) {
              // Update existing transaction
              await prisma.transaction.update({
                data: {
                  amount: transaction.amount,
                  date: transaction.date,
                  isoCurrencyCode: transaction.isoCurrencyCode,
                  merchantName: transaction.merchantName,
                  name: transaction.name,
                  pending: transaction.pending,
                },
                where: {
                  id: existingTransaction.id,
                },
              });
              updatedCount++;
            } else {
              // Categorize the transaction
              const category = await categorizePlaidTransaction(transaction);

              // Create new transaction
              await prisma.transaction.create({
                data: {
                  amount: transaction.amount,
                  bankAccountId,
                  category,
                  date: transaction.date,
                  isoCurrencyCode: transaction.isoCurrencyCode,
                  merchantName: transaction.merchantName,
                  name: transaction.name,
                  pending: transaction.pending,
                  plaidTransactionId: transaction.plaidTransactionId,
                  userId,
                },
              });
              newCount++;
            }

            processedCount++;
          }
        });
      }

      // Update last transaction sync timestamp
      await io.runTask('update-sync-timestamp', async () => {
        await prisma.bankAccount.update({
          data: {
            lastTransactionSync: endDate,
          },
          where: {
            id: bankAccountId,
          },
        });
      });

      // If we found new transactions, trigger notifications
      if (newCount > 0) {
        await client.sendEvent({
          name: 'sync-transaction-notifications-trigger',
          payload: {
            userId,
          },
        });
      }

      await logger.info(
        `Transaction sync completed for account ${bankAccountId}: ${newCount} new, ${updatedCount} updated`
      );

      return {
        newTransactions: newCount,
        processedCount,
        status: 'success',
        updatedTransactions: updatedCount,
      };
    } catch (error) {
      await logger.error(
        `Transaction sync failed for account ${bankAccountId}: ${error.message}`
      );

      return {
        error: error.message,
        status: 'error',
      };
    }
  },
});
```

### Transaction Categorization Job

A job that categorizes transactions using machine learning:

```typescript
// src/jobs/tasks/categorize-transactions.ts
import { cronTrigger } from '@trigger.dev/sdk';

import { prisma } from '@/server/db';
import { categorizeTransaction } from '@/server/services/categorization';

import { client } from '../client';

/**
 * This job runs periodically to categorize any uncategorized transactions using
 * our machine learning categorization service.
 */
export const categorizationJob = schemaTask({
  id: 'categorize-transactions-job',
  name: 'Categorize Transactions',
  trigger: cronTrigger({
    cron: '0 */4 * * *', // Every 4 hours
  }),
  version: '1.0.0',
  run: async (payload, io) => {
    await logger.info('Starting transaction categorization job');

    try {
      // Find uncategorized transactions
      const uncategorizedTransactions = await io.runTask(
        'get-uncategorized-transactions',
        async () => {
          return await prisma.transaction.findMany({
            select: {
              id: true,
              amount: true,
              date: true,
              merchantName: true,
              name: true,
            },
            take: 500, // Process in batches
            where: {
              category: null,
            },
          });
        }
      );

      if (uncategorizedTransactions.length === 0) {
        await logger.info('No uncategorized transactions found');
        return {
          categorizedCount: 0,
          status: 'success',
        };
      }

      await logger.info(
        `Found ${uncategorizedTransactions.length} uncategorized transactions`
      );

      // Process transactions in batches
      const batchSize = 50;
      let categorizedCount = 0;

      for (let i = 0; i < uncategorizedTransactions.length; i += batchSize) {
        const batch = uncategorizedTransactions.slice(i, i + batchSize);

        await io.runTask(`categorize-batch-${i}`, async () => {
          for (const transaction of batch) {
            try {
              // Categorize the transaction
              const category = await categorizeTransaction({
                amount: transaction.amount,
                date: transaction.date,
                description: transaction.name,
                merchantName: transaction.merchantName,
              });

              // Update the transaction with the category
              await prisma.transaction.update({
                data: {
                  category,
                  categorizedAt: new Date(),
                },
                where: {
                  id: transaction.id,
                },
              });

              categorizedCount++;
            } catch (error) {
              await logger.error(
                `Error categorizing transaction ${transaction.id}: ${error.message}`
              );
            }
          }
        });
      }

      await logger.info(
        `Categorization completed: ${categorizedCount} transactions categorized`
      );

      return {
        categorizedCount,
        status: 'success',
      };
    } catch (error) {
      await logger.error(`Categorization job failed: ${error.message}`);

      return {
        error: error.message,
        status: 'error',
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

The scheduler is responsible for setting up recurring jobs based on provider requirements and user preferences. With Trigger.dev, scheduling is handled through various trigger types.

### Cron-based Scheduling

For regular, time-based scheduling, Trigger.dev provides the `cronTrigger`:

```typescript
// src/jobs/tasks/bank/scheduler/disconnected-scheduler.ts
import { cronTrigger } from '@trigger.dev/sdk';

import { prisma } from '@/server/db';
import { BankConnectionStatus } from '@prisma/client';

import { client } from '../../../client';

/**
 * This job checks for disconnected bank connections and schedules reconnection
 * attempts or sends notifications to users.
 */
export const disconnectedSchedulerJob = schemaTask({
  id: 'disconnected-scheduler-job',
  name: 'Check Disconnected Bank Connections',
  trigger: cronTrigger({
    cron: '0 12 * * *', // Run daily at noon
  }),
  version: '1.0.0',
  run: async (payload, io) => {
    await logger.info('Starting disconnected connections check');

    // Find disconnected connections
    const disconnectedConnections = await io.runTask(
      'get-disconnected-connections',
      async () => {
        return await prisma.bankConnection.findMany({
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
          where: {
            status: BankConnectionStatus.ERROR,
          },
        });
      }
    );

    await logger.info(
      `Found ${disconnectedConnections.length} disconnected connections`
    );

    // Process each disconnected connection
    let notificationsSent = 0;

    for (const connection of disconnectedConnections) {
      // Check if we should send a notification (based on last notification time)
      const shouldNotify = await io.runTask(
        `check-notification-${connection.id}`,
        async () => {
          // Logic to determine if we should notify the user
          // For example, don't notify more than once per week
          return true; // Simplified for example
        }
      );

      if (shouldNotify) {
        // Send reconnection notification
        await client.sendEvent({
          name: 'reconnect-notification-trigger',
          payload: {
            connectionId: connection.id,
            email: connection.user.email,
            institutionName: connection.institutionName,
            name: connection.user.name,
            userId: connection.userId,
          },
        });
        notificationsSent++;
      }
    }

    await logger.info(
      `Disconnected scheduler completed: ${notificationsSent} notifications sent`
    );

    return {
      connectionsChecked: disconnectedConnections.length,
      notificationsSent,
      status: 'success',
    };
  },
});
```

### Event-based Scheduling

For event-driven workflows, Trigger.dev provides the `eventTrigger`:

```typescript
// src/jobs/tasks/bank/scheduler/expiring-scheduler.ts
import { eventTrigger } from '@trigger.dev/sdk';
import { z } from 'zod';

import { client } from '../../../client';

/**
 * This job schedules notifications for connections that are about to expire.
 * It's triggered by a daily event but processes connections individually.
 */
export const expiringSchedulerJob = schemaTask({
  id: 'expiring-scheduler-job',
  name: 'Schedule Expiring Connection Notifications',
  trigger: eventTrigger({
    name: 'check-expiring-connections',
    schema: z.object({
      connectionId: z.string(),
      daysUntilExpiry: z.number(),
      userId: z.string(),
    }),
  }),
  version: '1.0.0',
  run: async (payload, io) => {
    const { connectionId, daysUntilExpiry, userId } = payload;

    await logger.info(
      `Checking expiring connection ${connectionId}, ${daysUntilExpiry} days until expiry`
    );

    // Different notification strategies based on days until expiry
    if (daysUntilExpiry <= 3) {
      // Critical notification - connection expires very soon
      await client.sendEvent({
        name: 'expiring-notification',
        payload: {
          connectionId,
          daysUntilExpiry,
          severity: 'critical',
          userId,
        },
      });

      await logger.info(
        `Sent critical expiration notification for connection ${connectionId}`
      );
    } else if (daysUntilExpiry <= 14) {
      // Warning notification - connection expires soon
      await client.sendEvent({
        name: 'expiring-notification',
        payload: {
          connectionId,
          daysUntilExpiry,
          severity: 'warning',
          userId,
        },
      });

      await logger.info(
        `Sent warning expiration notification for connection ${connectionId}`
      );
    }

    return {
      connectionId,
      daysUntilExpiry,
      status: 'success',
    };
  },
});
```

### Delayed Execution

Trigger.dev allows for delayed execution using the `context` property when sending events:

```typescript
// Example of delayed execution
await client.sendEvent({
  // Add a context with delay information
  context: {
    delaySeconds: 300, // 5 minutes
  },
  name: 'sync-account-trigger',
  payload: {
    accessToken,
    bankAccountId,
    userId,
  },
});
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
'use server';

import { client } from '@/jobs/client';

export async function handleBankConnection(connectionData) {
  try {
    // Trigger the initial setup job
    await client.sendEvent({
      name: 'initial-setup',
      payload: {
        accessToken: connectionData.accessToken,
        institutionId: connectionData.institutionId,
        itemId: connectionData.itemId,
        publicToken: connectionData.publicToken,
        userId: connectionData.userId,
      },
    });

    return {
      success: true,
      message: 'Bank connection setup initiated',
    };
  } catch (error) {
    console.error('Error setting up bank connection:', error);
    return {
      success: false,
      error: error.message || 'Failed to set up bank connection',
    };
  }
}
```

### 2. Implementing Manual Sync

Allow users to manually trigger a sync from the UI:

```typescript
// Server action for manual sync
'use server';

import { client } from '@/jobs/client';
import { prisma } from '@/server/db';
import { revalidatePath } from 'next/cache';

export async function manualSyncTransactionsAction(connectionId: string) {
  try {
    // Get connection details
    const connection = await prisma.bankConnection.findUnique({
      select: {
        accessToken: true,
        id: true,
        userId: true,
      },
      where: { id: connectionId },
    });

    if (!connection) {
      return {
        success: false,
        error: 'Connection not found',
      };
    }

    // Get all accounts for this connection
    const accounts = await prisma.bankAccount.findMany({
      select: {
        id: true,
      },
      where: {
        bankConnectionId: connectionId,
      },
    });

    // Trigger sync for each account with increasing delays
    let delayCounter = 0;

    for (const account of accounts) {
      await client.sendEvent({
        context: {
          delaySeconds: delayCounter * 5, // 5 second delay between accounts
        },
        name: 'sync-account-trigger',
        payload: {
          accessToken: connection.accessToken,
          bankAccountId: account.id,
          manualSync: true, // Flag as manual sync
          userId: connection.userId,
        },
      });
      delayCounter++;
    }

    // Revalidate the accounts page to show updated status
    revalidatePath('/accounts');

    return {
      success: true,
      message: `Sync started for ${accounts.length} accounts`,
    };
  } catch (error) {
    console.error('Error syncing transactions:', error);
    return {
      success: false,
      error: error.message || 'Failed to sync transactions',
    };
  }
}
```

### 3. Monitoring Sync Status

Create a component to display sync status:

```tsx
// Client-side component for displaying sync status
'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

export function SyncStatus({ bankAccount }) {
  const [lastSyncText, setLastSyncText] = useState('');

  useEffect(() => {
    if (!bankAccount.lastTransactionSync) {
      setLastSyncText('Never synced');
      return;
    }

    const updateSyncText = () => {
      setLastSyncText(
        `Last synced ${formatDistanceToNow(new Date(bankAccount.lastTransactionSync))} ago`
      );
    };

    updateSyncText();
    const interval = setInterval(updateSyncText, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [bankAccount.lastTransactionSync]);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-2 w-2 rounded-full ${bankAccount.lastTransactionSync ? 'bg-green-500' : 'bg-amber-500'}`}
      />
      <span className="text-sm text-gray-600">{lastSyncText}</span>
    </div>
  );
}
```

### 4. Implementing Transaction Processing

The transaction processing is handled by the `upsertTransactionsJob` we defined earlier, which:

1. Fetches transactions from Plaid
2. Checks for existing transactions to avoid duplicates
3. Categorizes new transactions
4. Stores them in the database
5. Triggers notifications for new transactions

This job is triggered:

- After initial account setup
- On a regular schedule (every few hours)
- When a user manually requests a sync

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

Implementing bank and transaction syncing requires careful coordination between multiple components. By leveraging Trigger.dev's powerful job scheduling and execution capabilities, you can create a robust system that reliably syncs financial data while providing a smooth user experience.

Trigger.dev offers several advantages over traditional job queues:

1. **Type safety** with TypeScript integration
2. **Built-in retries** with configurable backoff strategies
3. **Detailed logging** for each step of the job
4. **Task-based execution** for better observability
5. **Delayed execution** for complex workflows
6. **Event-driven architecture** for flexible job triggering
7. **Cron scheduling** for recurring jobs

These features make it easier to build, maintain, and debug complex background job workflows for financial data synchronization.
