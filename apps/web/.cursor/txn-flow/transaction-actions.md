# Midday Actions Documentation

This document provides detailed implementation guidance for the server actions in the Midday dashboard application.

## Core Implementation Pattern

All actions in the system follow a consistent implementation pattern using `next-safe-action`:

```typescript
'use server'

import { createSafeActionClient } from 'next-safe-action'
import { z } from 'zod'
import type { ActionResponse } from '@/types/actions'
import { appErrors } from '@/lib/errors'

// 1. Define input schema with Zod
const schema = z.object({
  // Define the shape of your input data with proper validation
  userId: z.string().min(1, 'User ID is required'),
  // Add more fields as needed with specific validation rules
})

// 2. Create and export the action
export const actionName = createSafeActionClient()
  .schema(schema)
  .action(async (input): Promise<ActionResponse> => {
    try {
      // 3. Implement action logic here
      const result = await someService.performOperation(input)

      // 4. Return success response
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      // 5. Handle errors and return error response
      return {
        success: false,
        error: error instanceof AppError ? error : appErrors.UNEXPECTED_ERROR,
      }
    }
  })
```

## Key Components in the Actions System

### 1. `safe-action.ts`

This is the foundation file that configures the `next-safe-action` client for use throughout the application. It sets up global middleware, error handling, and validation behaviors.

```typescript
// Example structure of safe-action.ts
import { createSafeActionClient } from 'next-safe-action'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Custom middleware for authentication
const auth = async () => {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error('Unauthorized')
  }
  return { userId: session.user.id }
}

// Create the safe action client with middleware
export const action = createSafeActionClient({
  middleware: [auth],
})
```

### 2. `schema.ts`

Contains shared Zod schemas used across multiple actions for consistent validation. This centralizes common validation logic and reduces duplication.

## Action Categories

### Transaction Actions

Located in `apps/dashboard/src/actions/transactions/`

These actions handle transaction-related operations in the Midday dashboard. Each action follows the standard next-safe-action pattern but contains specialized business logic for handling financial transaction data.

#### 1. `get-transactions-from-layout.ts`

This action retrieves transactions with flexible filtering, sorting, and pagination options.

```typescript
'use server'

import { createSafeActionClient } from 'next-safe-action'
import { z } from 'zod'
import type { ActionResponse } from '@/types/actions'
import { appErrors } from '@/lib/errors'
import { getTransactions } from '@/lib/services/transaction-service'
import { Transaction } from '@/types/transaction'

// Comprehensive schema for transaction filtering
const schema = z.object({
  // Pagination parameters
  limit: z.number().int().positive().optional().default(10),
  offset: z.number().int().min(0).optional().default(0),

  // Filtering parameters
  userId: z.string().optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),

  // Sorting parameters
  sortBy: z.string().optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),

  // Date range parameters
  startDate: z.string().optional(),
  endDate: z.string().optional(),

  // Search parameter
  search: z.string().optional(),

  // Additional filters
  status: z.enum(['pending', 'cleared', 'all']).optional().default('all'),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  tags: z.array(z.string()).optional(),
})

export const getTransactionsFromLayout = createSafeActionClient()
  .schema(schema)
  .action(
    async (input): Promise<ActionResponse<{ transactions: Transaction[] }>> => {
      try {
        // Transform date strings to Date objects if present
        const filters = {
          ...input,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
        }

        // Call transaction service with transformed filters
        const transactions = await getTransactions(filters)

        // Return strongly-typed response with transactions array
        return {
          success: true,
          data: { transactions },
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error)

        // Return appropriate error response
        return {
          success: false,
          error:
            error instanceof AppError
              ? error
              : appErrors.FETCH_TRANSACTIONS_ERROR,
        }
      }
    },
  )
```

**Implementation Notes:**

- Uses extensive Zod schema validation for all possible filtering parameters
- Handles date string conversion to Date objects
- Returns strongly-typed Transaction[] array in the response
- Provides proper error handling with specific error types
- Supports comprehensive filtering options including date ranges, amount ranges, and status filters

#### 2. `import-transactions.ts`

This action allows users to import transactions from external files (CSV/Excel).

```typescript
'use server'

import { createSafeActionClient } from 'next-safe-action'
import { z } from 'zod'
import type { ActionResponse } from '@/types/actions'
import { appErrors } from '@/lib/errors'
import { importTransactionsFromFile } from '@/lib/services/import-service'
import { addJob } from '@/lib/queue'

// File validation schema
const schema = z.object({
  // Validates that input is a File object
  file: z.instanceof(File, { message: 'Please provide a valid file' }),

  // The account to associate imported transactions with
  accountId: z.string({ required_error: 'Account ID is required' }),

  // Optional format specification
  format: z.enum(['csv', 'xlsx', 'qfx', 'ofx', 'qif']).optional(),

  // Optional date format for parsing
  dateFormat: z.string().optional(),

  // Whether to skip the first row (headers)
  skipHeaders: z.boolean().optional().default(true),

  // Column mapping information
  columnMap: z.record(z.string(), z.string()).optional(),
})

export const importTransactions = createSafeActionClient()
  .schema(schema)
  .action(async (input): Promise<ActionResponse<{ jobId: string }>> => {
    try {
      // Convert file to buffer or readable stream
      const fileBuffer = await input.file.arrayBuffer()

      // Create initial import job record
      const jobId = await addJob('transaction-import', {
        accountId: input.accountId,
        fileName: input.file.name,
        fileSize: input.file.size,
        format: input.format || detectFileFormat(input.file.name),
        dateFormat: input.dateFormat,
        skipHeaders: input.skipHeaders,
        columnMap: input.columnMap,
      })

      // Store file buffer in temporary storage
      await storeFileForProcessing(jobId, Buffer.from(fileBuffer))

      // Return job ID for client to poll status
      return {
        success: true,
        data: { jobId },
      }
    } catch (error) {
      console.error('Failed to import transactions:', error)

      return {
        success: false,
        error: error instanceof AppError ? error : appErrors.IMPORT_FAILED,
      }
    }
  })

// Helper function to detect file format from extension
function detectFileFormat(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'csv':
      return 'csv'
    case 'xlsx':
    case 'xls':
      return 'xlsx'
    case 'qfx':
    case 'ofx':
      return 'ofx'
    case 'qif':
      return 'qif'
    default:
      return 'csv' // Default to CSV
  }
}
```

**Implementation Notes:**

- Handles file upload and conversion to buffer
- Creates a background job for processing (integration with job queue)
- Detects file format from extension
- Supports multiple file formats (CSV, Excel, QFX, OFX, QIF)
- Provides options for column mapping and date format customization
- Returns job ID for client-side status polling

#### 3. `manual-sync-transactions-action.ts`

This action triggers a manual synchronization of transactions from connected financial accounts.

```typescript
'use server'

import { createSafeActionClient } from 'next-safe-action'
import { z } from 'zod'
import type { ActionResponse } from '@/types/actions'
import { appErrors } from '@/lib/errors'
import { triggerManualSync } from '@/lib/services/sync-service'

const schema = z.object({
  // User ID requesting the sync
  userId: z.string({ required_error: 'User ID is required' }),

  // Optional specific account IDs to sync (if not provided, syncs all)
  accountIds: z.array(z.string()).optional(),

  // Optional date range to sync
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const manualSyncTransactions = createSafeActionClient()
  .schema(schema)
  .action(async (input): Promise<ActionResponse<{ syncId: string }>> => {
    try {
      // Transform dates if provided
      const syncOptions = {
        ...input,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
      }

      // Trigger sync process and get tracking ID
      const syncId = await triggerManualSync(syncOptions)

      return {
        success: true,
        data: { syncId },
      }
    } catch (error) {
      console.error('Failed to trigger manual sync:', error)

      return {
        success: false,
        error: error instanceof AppError ? error : appErrors.SYNC_FAILED,
      }
    }
  })
```

**Implementation Notes:**

- Supports syncing specific accounts or all accounts
- Provides date range filtering for the sync operation
- Returns a sync ID for tracking the background process
- Interfaces with the sync service for actual implementation
- Handles proper error management with specific error types

#### 4. `reconnect-connection-action.ts`

This action re-establishes connections to financial institutions when they expire or require re-authentication.

```typescript
'use server'

import { createSafeActionClient } from 'next-safe-action'
import { z } from 'zod'
import type { ActionResponse } from '@/types/actions'
import { appErrors } from '@/lib/errors'
import { initiateReconnection } from '@/lib/services/connection-service'

const schema = z.object({
  // Connection ID to reconnect
  connectionId: z.string({ required_error: 'Connection ID is required' }),
})

export const reconnectConnection = createSafeActionClient()
  .schema(schema)
  .action(async (input): Promise<ActionResponse<{ redirectUrl: string }>> => {
    try {
      // Get connection details from database
      const connection = await getConnectionById(input.connectionId)

      if (!connection) {
        throw appErrors.CONNECTION_NOT_FOUND
      }

      // Call financial provider API to initiate reconnection flow
      const { redirectUrl, tokenExpiry } =
        await initiateReconnection(connection)

      // Update connection status in database
      await updateConnectionStatus(
        input.connectionId,
        'reconnecting',
        tokenExpiry,
      )

      // Return redirect URL for user to complete authentication
      return {
        success: true,
        data: { redirectUrl },
      }
    } catch (error) {
      console.error('Failed to reconnect financial connection:', error)

      return {
        success: false,
        error:
          error instanceof AppError ? error : appErrors.RECONNECTION_FAILED,
      }
    }
  })
```

**Implementation Notes:**

- Validates connection existence before attempting reconnection
- Interfaces with financial provider APIs to initiate authentication
- Updates connection status in the database
- Returns authentication redirect URL for the client
- Handles connection-specific errors with proper error types

#### 5. `update-currency-action.ts`

This action updates the base currency for transaction display and calculations.

```typescript
'use server'

import { createSafeActionClient } from 'next-safe-action'
import { z } from 'zod'
import type { ActionResponse } from '@/types/actions'
import { appErrors } from '@/lib/errors'
import { updateUserCurrency } from '@/lib/services/currency-service'
import { addJob } from '@/lib/queue'

// Supported currency codes
const SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'JPY',
  'CHF',
  'CNY',
  'INR',
  'BRL',
  'MXN',
  'SGD',
  'HKD',
  'SEK',
  'NOK',
  'NZD',
] as const

const schema = z.object({
  // User ID for the currency update
  userId: z.string({ required_error: 'User ID is required' }),

  // Currency code from supported list
  currency: z.enum(SUPPORTED_CURRENCIES, {
    errorMap: () => ({ message: 'Please select a supported currency' }),
  }),

  // Whether to recalculate historical transactions (expensive operation)
  recalculateHistorical: z.boolean().optional().default(true),
})

export const updateCurrency = createSafeActionClient()
  .schema(schema)
  .action(async (input): Promise<ActionResponse<{ jobId?: string }>> => {
    try {
      // Update user's currency preference
      await updateUserCurrency(input.userId, input.currency)

      // If historical recalculation is requested, create a background job
      let jobId: string | undefined
      if (input.recalculateHistorical) {
        jobId = await addJob('update-currency-transactions', {
          userId: input.userId,
          currency: input.currency,
        })
      }

      return {
        success: true,
        data: { jobId },
      }
    } catch (error) {
      console.error('Failed to update currency:', error)

      return {
        success: false,
        error:
          error instanceof AppError ? error : appErrors.CURRENCY_UPDATE_FAILED,
      }
    }
  })
```

**Implementation Notes:**

- Restricts to supported currency codes with enum validation
- Handles immediate preference update and optional historical recalculation
- Creates background job for expensive currency conversion operations
- Returns job ID for historical calculations that can be tracked
- Provides detailed error messages specific to currency-related issues

### Integration with Background Jobs

Transaction actions often integrate with background processing jobs located in `apps/dashboard/jobs/tasks/transactions/`:

#### 1. Transaction Import Job (`import.ts`)

This background job processes imported transaction files:

```typescript
// Simplified example from import.ts
import { Job } from '@/lib/queue'
import { parseCSV, parseXLSX, parseOFX, parseQIF } from '@/lib/parsers'
import {
  validateTransactions,
  saveTransactions,
} from '@/lib/services/transaction-service'

export async function handleImportJob(job: Job): Promise<void> {
  const { accountId, fileName, format, dateFormat, skipHeaders, columnMap } =
    job.data

  // Retrieve file from temporary storage
  const fileBuffer = await retrieveFileForProcessing(job.id)

  // Parse file based on format
  let transactions = []
  switch (format) {
    case 'csv':
      transactions = await parseCSV(fileBuffer, {
        skipHeaders,
        dateFormat,
        columnMap,
      })
      break
    case 'xlsx':
      transactions = await parseXLSX(fileBuffer, {
        skipHeaders,
        dateFormat,
        columnMap,
      })
      break
    case 'ofx':
    case 'qfx':
      transactions = await parseOFX(fileBuffer)
      break
    case 'qif':
      transactions = await parseQIF(fileBuffer, { dateFormat })
      break
  }

  // Validate parsed transactions
  const validationResults = await validateTransactions(transactions)

  // Handle duplicates and validation errors
  const { valid, duplicates, invalid } = validationResults

  // Save valid transactions
  const savedCount = await saveTransactions(valid, accountId)

  // Update job with results
  await job.update({
    status: 'completed',
    results: {
      total: transactions.length,
      saved: savedCount,
      duplicates: duplicates.length,
      invalid: invalid.length,
      validationErrors: invalid.map((t) => t.validationError),
    },
  })
}
```

**Integration Notes:**

- The `importTransactions` action creates the job
- The job processes the file asynchronously, allowing the UI to remain responsive
- Job status can be polled by the client to show progress
- Supports multiple file formats with specialized parsers
- Handles validation, deduplication, and error reporting
- Job results provide detailed import statistics

#### 2. Currency Update Job (`update-base-currency.ts`)

This background job updates currencies for historical transactions:

```typescript
// Simplified example from update-base-currency.ts
import { Job } from '@/lib/queue'
import {
  getTransactionsByUserId,
  updateTransactionCurrency,
} from '@/lib/services/transaction-service'
import { getCurrencyRates } from '@/lib/services/exchange-rate-service'

export async function handleCurrencyUpdateJob(job: Job): Promise<void> {
  const { userId, currency } = job.data

  // Get all user transactions
  const transactions = await getTransactionsByUserId(userId)

  // Get historical exchange rates for all transaction dates
  const uniqueDates = [
    ...new Set(transactions.map((t) => t.date.toISOString().split('T')[0])),
  ]
  const exchangeRates = await getCurrencyRates(uniqueDates, currency)

  // Process transactions in batches to avoid memory issues
  const BATCH_SIZE = 100
  let processedCount = 0

  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE)

    // Update each transaction's currency
    await Promise.all(
      batch.map(async (transaction) => {
        const transactionDate = transaction.date.toISOString().split('T')[0]
        const rate = exchangeRates[transactionDate]

        if (!rate) {
          console.warn(`No exchange rate found for ${transactionDate}`)
          return
        }

        // Convert amount using historical rate
        const convertedAmount = transaction.originalAmount * rate

        // Update transaction with new currency and converted amount
        await updateTransactionCurrency(
          transaction.id,
          currency,
          convertedAmount,
          rate,
        )
      }),
    )

    processedCount += batch.length

    // Update job progress
    await job.update({
      progress: Math.floor((processedCount / transactions.length) * 100),
    })
  }

  // Update job with results
  await job.update({
    status: 'completed',
    results: {
      totalProcessed: processedCount,
      currency,
    },
  })
}
```

**Integration Notes:**

- The `updateCurrency` action initiates this job when historical recalculation is needed
- Processes transactions in batches to handle large datasets efficiently
- Reports progress that can be displayed to the user
- Handles historical exchange rates for accurate conversion
- Updates each transaction with new currency, converted amount, and rate used

## Client-Side Transaction Action Usage

Here are comprehensive examples of how to use transaction actions in client components:

### Transaction List with Filtering

```tsx
'use client'

import { useAction } from 'next-safe-action/hooks'
import { useQueryState } from 'nuqs'
import { getTransactionsFromLayout } from '@/actions/transactions/get-transactions-from-layout'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { useState, useEffect } from 'react'
import {
  ChevronDown,
  Filter,
  RefreshCw,
  Search,
  SortAsc,
  SortDesc,
} from 'lucide-react'

export function TransactionsList() {
  // State for pagination
  const [limit, setLimit] = useQueryState('limit', { defaultValue: '10' })
  const [page, setPage] = useQueryState('page', { defaultValue: '1' })

  // State for filtering
  const [search, setSearch] = useQueryState('search')
  const [dateRange, setDateRange] = useQueryState('dateRange')
  const [category, setCategory] = useQueryState('category')
  const [account, setAccount] = useQueryState('account')

  // State for sorting
  const [sortBy, setSortBy] = useQueryState('sortBy', { defaultValue: 'date' })
  const [sortOrder, setSortOrder] = useQueryState('sortOrder', {
    defaultValue: 'desc',
  })

  // Local state for the table
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Parse filter values
  const parsedLimit = parseInt(limit || '10')
  const parsedPage = parseInt(page || '1')
  const offset = (parsedPage - 1) * parsedLimit

  // Parse date range
  const parsedDateRange = dateRange
    ? JSON.parse(dateRange)
    : { startDate: undefined, endDate: undefined }

  // Setup action hook
  const { execute, result, status } = useAction(getTransactionsFromLayout)

  // Fetch transactions when filters change
  const fetchTransactions = () => {
    execute({
      limit: parsedLimit,
      offset,
      search: search || undefined,
      startDate: parsedDateRange.startDate,
      endDate: parsedDateRange.endDate,
      categoryId: category || undefined,
      accountId: account || undefined,
      sortBy: sortBy || 'date',
      sortOrder: (sortOrder || 'desc') as 'asc' | 'desc',
    })
  }

  // Effect to fetch transactions when filters change
  useEffect(() => {
    fetchTransactions()
  }, [limit, page, dateRange, category, account, sortBy, sortOrder])

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTransactions()
  }

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchTransactions()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Handle sort change
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters section */}
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={handleSearchSubmit} className="flex items-center">
          <Input
            placeholder="Search transactions..."
            value={search || ''}
            onChange={(e) => setSearch(e.target.value)}
            className="mr-2 w-64"
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <DateRangePicker
          value={parsedDateRange}
          onChange={(range) => setDateRange(JSON.stringify(range))}
        />

        <Select value={category || ''} onValueChange={setCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {/* Add categories from your data */}
          </SelectContent>
        </Select>

        <Select value={account || ''} onValueChange={setAccount}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Accounts</SelectItem>
            {/* Add accounts from your data */}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" /> More Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* Add additional filters */}
            <DropdownMenuItem>Status</DropdownMenuItem>
            <DropdownMenuItem>Amount Range</DropdownMenuItem>
            <DropdownMenuItem>Tags</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={status === 'executing'}
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </Button>
      </div>

      {/* Transactions table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('date')}
              >
                Date
                {sortBy === 'date' &&
                  (sortOrder === 'asc' ? (
                    <SortAsc className="ml-1 inline h-4 w-4" />
                  ) : (
                    <SortDesc className="ml-1 inline h-4 w-4" />
                  ))}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('description')}
              >
                Description
                {sortBy === 'description' &&
                  (sortOrder === 'asc' ? (
                    <SortAsc className="ml-1 inline h-4 w-4" />
                  ) : (
                    <SortDesc className="ml-1 inline h-4 w-4" />
                  ))}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('amount')}
              >
                Amount
                {sortBy === 'amount' &&
                  (sortOrder === 'asc' ? (
                    <SortAsc className="ml-1 inline h-4 w-4" />
                  ) : (
                    <SortDesc className="ml-1 inline h-4 w-4" />
                  ))}
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status === 'executing' ? (
              // Loading state
              Array.from({ length: parsedLimit }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell className="h-12 bg-gray-100"></TableCell>
                  <TableCell className="h-12 bg-gray-100"></TableCell>
                  <TableCell className="h-12 bg-gray-100"></TableCell>
                  <TableCell className="h-12 bg-gray-100"></TableCell>
                  <TableCell className="h-12 bg-gray-100"></TableCell>
                  <TableCell className="h-12 bg-gray-100"></TableCell>
                </TableRow>
              ))
            ) : result?.data?.transactions &&
              result.data.transactions.length > 0 ? (
              // Data state
              result.data.transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell
                    className={
                      transaction.amount < 0 ? 'text-red-500' : 'text-green-500'
                    }
                  >
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </TableCell>
                  <TableCell>
                    {transaction.category?.name || 'Uncategorized'}
                  </TableCell>
                  <TableCell>{transaction.account?.name}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Categorize</DropdownMenuItem>
                        <DropdownMenuItem>Split</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // Empty state
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  No transactions found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {result?.data?.transactions &&
            `Showing ${offset + 1} - ${Math.min(offset + parsedLimit, result.data.transactions.length)} transactions`}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, parsedPage - 1).toString())}
            disabled={parsedPage <= 1}
          >
            Previous
          </Button>
          <div className="text-sm">Page {parsedPage}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((parsedPage + 1).toString())}
            disabled={
              !result?.data?.transactions ||
              result.data.transactions.length < parsedLimit
            }
          >
            Next
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Rows per page:</span>
          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger className="w-16">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
```

### User Management Actions

These actions handle user account and profile operations:

1. **`update-user-action.ts`**

   ```typescript
   const schema = z.object({
     userId: z.string(),
     name: z.string().optional(),
     email: z.string().email().optional(),
     image: z.string().optional(),
     preferences: z.record(z.any()).optional(),
   })

   export const updateUser = createSafeActionClient()
     .schema(schema)
     .action(async (input): Promise<ActionResponse> => {
       try {
         const updatedUser = await userService.update(input)
         return { success: true, data: updatedUser }
       } catch (error) {
         return { success: false, error: appErrors.USER_UPDATE_FAILED }
       }
     })
   ```

2. **`delete-user-action.ts`**
3. **`update-subscriber-preference-action.ts`**
4. **`verify-otp-action.ts`**
5. **`sign-out-action.ts`**
6. **`unenroll-mfa-action.ts`**
7. **`mfa-verify-action.ts`**

### Team Collaboration Actions

These actions manage team-based functionality:

1. **`create-team-action.ts`**

   ```typescript
   const schema = z.object({
     name: z.string().min(1, 'Team name is required'),
     userId: z.string(),
     logo: z.string().optional(),
   })

   export const createTeam = createSafeActionClient()
     .schema(schema)
     .action(async (input): Promise<ActionResponse> => {
       try {
         const team = await teamService.create({
           name: input.name,
           ownerId: input.userId,
           logo: input.logo,
         })
         return { success: true, data: team }
       } catch (error) {
         return { success: false, error: appErrors.TEAM_CREATION_FAILED }
       }
     })
   ```

2. **`update-team-action.ts`**
3. **`delete-team-action.ts`**
4. **`invite-team-members-action.ts`**
5. **`accept-invite-action.ts`**
6. **`decline-invite-action.ts`**
7. **`delete-invite-action.ts`**
8. **`delete-team-member-action.ts`**
9. **`leave-team-action.ts`**
10. **`change-team-action.ts`**
11. **`change-user-role-action.ts`**

### Financial Institution Actions

Located in `apps/dashboard/src/actions/institutions/`

These actions handle connections to financial institutions:

1. **`connect-bank-account-action.ts`**

   ```typescript
   const schema = z.object({
     userId: z.string(),
     institutionId: z.string(),
     publicToken: z.string(),
   })

   export const connectBankAccount = createSafeActionClient()
     .schema(schema)
     .action(async (input): Promise<ActionResponse> => {
       try {
         // Exchange public token for access token and store connection
         const result = await financeService.exchangePublicToken(
           input.publicToken,
           input.institutionId,
           input.userId,
         )
         return { success: true, data: result }
       } catch (error) {
         return { success: false, error: appErrors.CONNECTION_FAILED }
       }
     })
   ```

2. **`disconnect-app-action.ts`**

### Categorization and Tagging Actions

These actions handle categorization and tagging of transactions:

1. **`create-tag-action.tsx`**

   ```typescript
   const schema = z.object({
     name: z.string().min(1, 'Tag name is required'),
     color: z.string().optional(),
     userId: z.string(),
   })

   export const createTag = createSafeActionClient()
     .schema(schema)
     .action(async (input): Promise<ActionResponse> => {
       try {
         const tag = await tagService.create({
           name: input.name,
           color: input.color || '#000000',
           userId: input.userId,
         })
         return { success: true, data: tag }
       } catch (error) {
         return { success: false, error: appErrors.TAG_CREATION_FAILED }
       }
     })
   ```

2. **`update-tag-action.ts`**
3. **`delete-tag-action.ts`**
4. **`create-transaction-tag-action.ts`**
5. **`delete-transaction-tag-action.ts`**
6. **`create-categories-action.ts`**
7. **`update-category-action.ts`**
8. **`delete-categories-action.ts`**

### Transaction Management Actions

These actions handle transaction management beyond basic CRUD:

1. **`update-transaction-action.ts`**

   ```typescript
   const schema = z.object({
     id: z.string(),
     description: z.string().optional(),
     categoryId: z.string().optional(),
     amount: z.number().optional(),
     date: z.string().optional(),
     notes: z.string().optional(),
   })

   export const updateTransaction = createSafeActionClient()
     .schema(schema)
     .action(async (input): Promise<ActionResponse> => {
       try {
         const updated = await transactionService.update(input)
         return { success: true, data: updated }
       } catch (error) {
         return { success: false, error: appErrors.TRANSACTION_UPDATE_FAILED }
       }
     })
   ```

2. **`create-transaction-action.ts`**
3. **`delete-transactions-action.ts`**
4. **`export-transactions-action.ts`**
5. **`bulk-update-transactions-action.ts`**
6. **`update-similar-transactions-action.ts`**
7. **`update-similar-transactions-recurring.ts`**

### UI Preference Actions

These actions manage user interface preferences:

1. **`update-column-visibility-action.ts`**

   ```typescript
   const schema = z.object({
     userId: z.string(),
     columnId: z.string(),
     visible: z.boolean(),
   })

   export const updateColumnVisibility = createSafeActionClient()
     .schema(schema)
     .action(async (input): Promise<ActionResponse> => {
       try {
         await preferencesService.updateColumnVisibility(
           input.userId,
           input.columnId,
           input.visible,
         )
         return { success: true }
       } catch (error) {
         return { success: false, error: appErrors.PREFERENCES_UPDATE_FAILED }
       }
     })
   ```

2. **`update-menu-action.ts`**
3. **`update-app-settings-action.ts`**
4. **`change-chart-period-action.ts`**
5. **`change-chart-type-action.ts`**
6. **`change-spending-period-action.ts`**
7. **`change-transactions-period-action.ts`**
8. **`hide-connect-flow-action.ts`**
9. **`tracking-consent-action.ts`**

### Document Management Actions

These actions handle document management:

1. **`create-attachments-action.ts`**

   ```typescript
   const schema = z.object({
     files: z.array(z.instanceof(File)),
     transactionId: z.string().optional(),
     folderId: z.string().optional(),
   })

   export const createAttachments = createSafeActionClient()
     .schema(schema)
     .action(async (input): Promise<ActionResponse> => {
       try {
         const attachments = await attachmentService.upload(input.files, {
           transactionId: input.transactionId,
           folderId: input.folderId,
         })
         return { success: true, data: { attachments } }
       } catch (error) {
         return { success: false, error: appErrors.ATTACHMENT_UPLOAD_FAILED }
       }
     })
   ```

2. **`delete-attachment-action.ts`**
3. **`update-document-action.ts`**
4. **`create-folder-action.ts`**
5. **`delete-folder-action.ts`**
6. **`share-file-action.ts`**

### Customer Management Actions

Located in `apps/dashboard/src/actions/customer/`

These actions handle customer relationship management:

1. **`create-customer-action.ts`**
2. **`delete-customer-action.ts`**

### Support and Feedback Actions

These actions handle user support and feedback:

1. **`send-feedback-action.ts`**

   ```typescript
   const schema = z.object({
     userId: z.string(),
     feedback: z.string().min(1, 'Feedback is required'),
     rating: z.number().min(1).max(5).optional(),
     category: z.enum(['bug', 'feature', 'general']).optional(),
     metadata: z.record(z.any()).optional(),
   })

   export const sendFeedback = createSafeActionClient()
     .schema(schema)
     .action(async (input): Promise<ActionResponse> => {
       try {
         await feedbackService.submit({
           userId: input.userId,
           feedback: input.feedback,
           rating: input.rating,
           category: input.category || 'general',
           metadata: input.metadata || {},
           timestamp: new Date(),
         })
         return { success: true }
       } catch (error) {
         return { success: false, error: appErrors.FEEDBACK_SUBMISSION_FAILED }
       }
     })
   ```

2. **`send-support-action.tsx`**
3. **`validate-vat-number-action.ts`**

### AI-Powered Features

Located in `apps/dashboard/src/actions/ai/`

These actions handle AI-powered features in the application.

### Report Generation

Located in `apps/dashboard/src/actions/report/`

These actions handle report generation functionality.

### Project Management

Located in `apps/dashboard/src/actions/project/`

These actions handle project management functionality.

### Invoice Management

Located in `apps/dashboard/src/actions/invoice/`

These actions handle invoice management functionality.

## Client-Side Usage

All actions should be used with the `useAction` hook from `next-safe-action/hooks`:

```tsx
'use client'

import { useAction } from 'next-safe-action/hooks'
import { someAction } from '@/actions/some-action'
import { toast } from 'sonner'

export function ActionComponent() {
  const { execute, result, status } = useAction(someAction, {
    onSuccess: (data) => toast.success('Action completed successfully'),
    onError: (error) => toast.error(`Action failed: ${error.message}`),
  })

  const handleExecute = (values) => {
    execute(values)
  }

  return (
    <div>
      <button
        onClick={() => handleExecute({ userId: 'user-id' })}
        disabled={status === 'executing'}
      >
        {status === 'executing' ? 'Processing...' : 'Execute Action'}
      </button>

      {result.data && <div>Success: {JSON.stringify(result.data)}</div>}
      {result.error && (
        <div className="text-red-500">Error: {result.error.message}</div>
      )}
    </div>
  )
}
```

## Best Practices

1. **Error Handling**:

   - Use specific error types from `appErrors` for different error scenarios
   - Return appropriate error messages for client-side display
   - Log detailed errors server-side but return sanitized errors to clients

2. **Validation**:

   - Always validate input using Zod schemas with descriptive error messages
   - Include min/max values, patterns, and other constraints where appropriate
   - Consider using custom refinements for complex validation rules

3. **Performance**:

   - Avoid unnecessary database queries
   - Keep actions lightweight and focused on a single responsibility
   - Use proper database indexes for frequently queried fields

4. **Security**:

   - Validate user permissions before performing sensitive operations
   - Never expose sensitive financial data
   - Use middleware for consistent authentication across actions
   - Sanitize all user input

5. **User Experience**:

   - Provide meaningful feedback through the action response
   - Handle loading, success, and error states appropriately in the UI
   - Use optimistic updates where appropriate for responsive interfaces

6. **Testing**:

   - Write unit tests for each action
   - Test happy paths and error cases
   - Mock external services for consistent test results

7. **Maintenance**:
   - Keep actions small and focused
   - Document inputs, outputs, and side effects
   - Use consistent naming conventions across all actions
