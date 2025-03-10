# Account Onboarding and Bank Connection Guide

This guide provides a comprehensive overview of implementing account onboarding and bank connection functionality in the Solomon AI platform. It covers the components, workflows, and integration points needed to create a seamless banking connection experience.

## Table of Contents

1. [Overview](#overview)
2. [Component Architecture](#component-architecture)
3. [Connection Workflow](#connection-workflow)
4. [Bank Provider Integration](#bank-provider-integration)
5. [Connection Status Management](#connection-status-management)
6. [Bank Account Management](#bank-account-management)
7. [Background Jobs System](#background-jobs-system)
8. [Implementation Examples](#implementation-examples)

## Overview

The account onboarding system allows users to connect their bank accounts to the platform through various providers (Plaid, Teller, GoCardless), view their connected accounts, manage account settings, and sync transactions. The system is built with Next.js App Router, React Server Components, and client components where interactivity is needed.

## Component Architecture

The bank connection system consists of several interconnected components:

```
ConnectedAccounts
├── BankAccountList
│   ├── BankConnections
│   │   └── BankConnection
│   │       ├── ConnectionState
│   │       ├── ReconnectProvider
│   │       └── SyncTransactions
│   └── ManualAccounts
└── AddAccountButton
    └── ConnectTransactionsModal
        ├── SearchResult
        ├── ConnectBankProvider
        │   ├── TellerConnect
        │   ├── GoCardLessConnect
        │   └── BankConnectButton
        └── CountrySelector
```

## Connection Workflow

1. User initiates account connection from the `ConnectedAccounts` component
2. The `AddAccountButton` opens the `ConnectTransactionsModal`
3. User selects a country and searches for their bank
4. User selects a bank provider (Plaid, Teller, GoCardless)
5. Provider-specific authentication flow is initiated
6. Upon successful connection, accounts are synced and displayed in the `BankAccountList`

### Detailed Connection Flow

The connection process follows these detailed steps:

1. **Initiation**: User clicks the "Add Account" button in the `ConnectedAccounts` component
2. **Modal Opening**: The `ConnectTransactionsModal` opens, displaying a search interface
3. **Country Selection**: User selects their country using the `CountrySelector` component
4. **Bank Search**: User searches for their bank using the search input
5. **Provider Selection**: Based on the selected bank, the appropriate provider (Plaid, Teller, GoCardless) is determined
6. **Authentication**: User completes the provider-specific authentication flow
7. **Account Selection**: User selects which accounts to connect
8. **Transaction Syncing**: Background jobs fetch and process transactions
9. **Completion**: Connected accounts appear in the `BankAccountList`

## Bank Provider Integration

### Supported Providers

The platform integrates with multiple banking providers:

1. **Plaid**: Used primarily for US and Canadian banks
2. **Teller**: Alternative provider for US banks
3. **GoCardless**: Used for European banks

### Provider Selection Component

The `ConnectBankProvider` component handles provider-specific connection logic:

```tsx
export function ConnectBankProvider({
  id,
  provider,
  openPlaid,
  availableHistory,
}: Props) {
  const { setParams } = useConnectParams()
  const updateInstitutionUsage = useAction(updateInstitutionUsageAction)

  const updateUsage = () => {
    updateInstitutionUsage.execute({ institutionId: id })
  }

  switch (provider) {
    case 'teller':
      return (
        <TellerConnect
          id={id}
          onSelect={() => {
            // NOTE: Wait for Teller sdk to be configured
            setTimeout(() => {
              setParams({ step: null })
            }, 950)

            updateUsage()
          }}
        />
      )
    case 'gocardless': {
      return (
        <GoCardLessConnect
          id={id}
          availableHistory={availableHistory}
          onSelect={() => {
            updateUsage()
          }}
        />
      )
    }
    case 'plaid':
      return (
        <BankConnectButton
          onClick={() => {
            updateUsage()
            openPlaid()
          }}
        />
      )
    default:
      return null
  }
}
```

### Plaid Integration

Plaid integration is handled through the `usePlaidLink` hook in the `ConnectTransactionsModal`:

```tsx
const { open: openPlaid } = usePlaidLink({
  token: plaidToken,
  publicKey: '',
  env: process.env.NEXT_PUBLIC_PLAID_ENVIRONMENT!,
  clientName: 'Solomon AI',
  product: ['transactions'],
  onSuccess: async (public_token, metadata) => {
    const { access_token, item_id } = await exchangePublicToken(public_token)

    setParams({
      step: 'account',
      provider: 'plaid',
      token: access_token,
      ref: item_id,
      institution_id: metadata.institution?.institution_id,
    })
    track({
      event: LogEvents.ConnectBankAuthorized.name,
      channel: LogEvents.ConnectBankAuthorized.channel,
      provider: 'plaid',
    })
  },
  onExit: () => {
    setParams({ step: 'connect' })

    track({
      event: LogEvents.ConnectBankCanceled.name,
      channel: LogEvents.ConnectBankCanceled.channel,
      provider: 'plaid',
    })
  },
})
```

## Bank Search and Selection

Before connecting to a bank, users need to find and select their financial institution. This process is handled by the `ConnectTransactionsModal` component.

### ConnectTransactionsModal Component

The `ConnectTransactionsModal` provides a comprehensive interface for searching and selecting banks:

```tsx
export function ConnectTransactionsModal({
  countryCode: initialCountryCode,
}: ConnectTransactionsModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<Institutions['data']>([])
  const [plaidToken, setPlaidToken] = useState<string | undefined>()

  const {
    countryCode,
    q: query,
    step,
    setParams,
  } = useConnectParams(initialCountryCode)

  const isOpen = step === 'connect'
  const debouncedSearchTerm = useDebounce(query, 200)

  // Load SDKs for bank providers
  useScript('https://cdn.teller.io/connect/connect.js', {
    removeOnUnmount: false,
  })

  // Plaid link configuration
  const { open: openPlaid } = usePlaidLink({
    token: plaidToken,
    publicKey: '',
    env: process.env.NEXT_PUBLIC_PLAID_ENVIRONMENT!,
    clientName: 'Solomon AI',
    product: ['transactions'],
    onSuccess: async (public_token, metadata) => {
      const { access_token, item_id } = await exchangePublicToken(public_token)

      setParams({
        step: 'account',
        provider: 'plaid',
        token: access_token,
        ref: item_id,
        institution_id: metadata.institution?.institution_id,
      })
      track({
        event: LogEvents.ConnectBankAuthorized.name,
        channel: LogEvents.ConnectBankAuthorized.channel,
        provider: 'plaid',
      })
    },
    onExit: () => {
      setParams({ step: 'connect' })

      track({
        event: LogEvents.ConnectBankCanceled.name,
        channel: LogEvents.ConnectBankCanceled.channel,
        provider: 'plaid',
      })
    },
  })

  // Handle modal close
  const handleOnClose = () => {
    setParams(
      {
        step: null,
        countryCode: null,
        q: null,
        ref: null,
      },
      {
        shallow: false,
      },
    )
  }

  // Fetch institutions based on search query
  async function fetchData(query?: string) {
    try {
      setLoading(true)
      const { data } = await getInstitutions({ countryCode, query })
      setLoading(false)

      setResults(data)
    } catch {
      setLoading(false)
      setResults([])
    }
  }

  // Fetch institutions when modal opens or country changes
  useEffect(() => {
    if (
      (isOpen && !results?.length > 0) ||
      countryCode !== initialCountryCode
    ) {
      fetchData()
    }
  }, [isOpen, countryCode])

  // Fetch institutions when search term changes
  useEffect(() => {
    if (isOpen) {
      fetchData(debouncedSearchTerm ?? undefined)
    }
  }, [debouncedSearchTerm, isOpen])

  // Create Plaid link token when modal opens in supported countries
  useEffect(() => {
    async function createLinkToken() {
      const token = await createPlaidLinkTokenAction()

      if (token) {
        setPlaidToken(token)
      }
    }

    if ((isOpen && countryCode === 'US') || (isOpen && countryCode === 'CA')) {
      createLinkToken()
    }
  }, [isOpen, countryCode])

  // Render modal content
  return (
    <Dialog open={isOpen} onOpenChange={handleOnClose}>
      <DialogContent>
        <div className="p-4">
          <DialogHeader>
            <DialogTitle>Connect bank account</DialogTitle>

            <DialogDescription>
              We work with a variety of banking providers to support as many
              banks as possible. If you can't find yours,{' '}
              <button
                type="button"
                className="underline"
                onClick={() => setParams({ step: 'import' })}
              >
                manual import
              </button>{' '}
              is available as an alternative.
            </DialogDescription>

            {/* Search interface */}
            <div className="pt-4">
              <div className="relative flex space-x-2">
                <Input
                  placeholder="Search bank..."
                  type="search"
                  onChange={(evt) => setParams({ q: evt.target.value || null })}
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  autoFocus
                  value={query ?? ''}
                />

                <div className="absolute right-0">
                  <CountrySelector
                    defaultValue={countryCode}
                    onSelect={(countryCode) => {
                      setParams({ countryCode })
                      setResults([])
                    }}
                  />
                </div>
              </div>

              {/* Search results */}
              <div className="scrollbar-hide mt-2 h-[430px] space-y-4 overflow-auto pt-2">
                {loading && <SearchSkeleton />}

                {results?.map((institution) => {
                  if (!institution) {
                    return null
                  }

                  return (
                    <SearchResult
                      key={institution.id}
                      id={institution.id}
                      name={institution.name}
                      logo={institution.logo}
                      provider={institution.provider}
                      availableHistory={
                        institution.available_history
                          ? +institution.available_history
                          : 0
                      }
                      openPlaid={() => {
                        setParams({ step: null })
                        openPlaid()
                      }}
                    />
                  )
                })}

                {/* No results state */}
                {!loading && results?.length === 0 && (
                  <div className="flex min-h-[350px] flex-col items-center justify-center">
                    <p className="mb-2 font-medium">No banks found</p>
                    <p className="text-center text-sm text-[#878787]">
                      We couldn't find a bank matching your criteria.
                      <br /> Let us know, or start with manual import.
                    </p>

                    <div className="mt-4 flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setParams({ step: 'import' })}
                      >
                        Import
                      </Button>

                      <Button
                        onClick={() => {
                          router.push('/account/support')
                        }}
                      >
                        Contact us
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Search Result Component

Each bank search result is rendered using the `SearchResult` component, which displays bank information and the appropriate connection button:

```tsx
type SearchResultProps = {
  id: string
  name: string
  logo: string | null
  provider: string
  availableHistory: number
  openPlaid: () => void
}

function SearchResult({
  id,
  name,
  logo,
  provider,
  availableHistory,
  openPlaid,
}: SearchResultProps) {
  return (
    <div className="flex justify-between">
      <div className="flex items-center">
        <BankLogo src={logo} alt={name} />

        <div className="ml-4 cursor-default space-y-1">
          <p className="text-sm font-medium leading-none">{name}</p>
          <InstitutionInfo provider={provider}>
            <span className="text-xs capitalize text-[#878787]">
              Via {provider}
            </span>
          </InstitutionInfo>
        </div>
      </div>

      <ConnectBankProvider
        id={id}
        provider={provider}
        openPlaid={openPlaid}
        availableHistory={availableHistory}
      />
    </div>
  )
}
```

### Search Skeleton

During loading states, a skeleton UI is displayed to improve perceived performance:

```tsx
function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from(new Array(10), (_, index) => (
        <div className="flex items-center space-x-4" key={index.toString()}>
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex flex-col space-y-1">
            <Skeleton className="h-2 w-[140px] rounded-none" />
            <Skeleton className="h-2 w-[40px] rounded-none" />
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Country Selector

The `CountrySelector` component allows users to filter banks by country:

```tsx
export function CountrySelector({
  defaultValue,
  onSelect,
}: {
  defaultValue: string
  onSelect: (countryCode: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <CountryFlag countryCode={defaultValue} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Select country</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SUPPORTED_COUNTRIES.map((country) => (
          <DropdownMenuItem
            key={country.code}
            onClick={() => onSelect(country.code)}
          >
            <CountryFlag countryCode={country.code} className="mr-2" />
            {country.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Search Parameters Management

The search parameters are managed using the `useConnectParams` hook, which leverages URL query parameters for state management:

```tsx
export function useConnectParams(defaultCountryCode = 'US') {
  const [params, setParams] = useQueryStates({
    step: parseAsString,
    countryCode: parseAsString.withDefault(defaultCountryCode),
    q: parseAsString,
    provider: parseAsString,
    token: parseAsString,
    ref: parseAsString,
    institution_id: parseAsString,
  })

  return {
    ...params,
    setParams,
  }
}
```

This approach offers several benefits:

1. **Shareable URLs**: Users can share their search results
2. **Browser History**: Search state is preserved in browser history
3. **Deep Linking**: Specific search states can be linked directly
4. **State Persistence**: Search state persists across page refreshes

## Connection Status Management

The system tracks the status of bank connections to ensure users are aware of any issues or expiring connections.

### Connection Status Utility

The `connectionStatus` utility function determines the status of a connection based on its expiration date:

```tsx
export function connectionStatus(connection: Connection) {
  const warning =
    connection.expires_at &&
    differenceInDays(new Date(connection.expires_at), new Date()) <=
      WARNING_DAYS

  const error =
    connection.expires_at &&
    differenceInDays(new Date(connection.expires_at), new Date()) <= ERROR_DAYS

  const expired =
    connection.expires_at &&
    differenceInDays(new Date(connection.expires_at), new Date()) <= 0

  const show =
    connection.expires_at &&
    differenceInDays(new Date(connection.expires_at), new Date()) <=
      DISPLAY_DAYS

  return {
    warning,
    error,
    expired,
    show,
  }
}
```

### Connection State Display

The `ConnectionState` component displays the current status of a connection:

```tsx
function ConnectionState({
  connection,
  isSyncing,
}: {
  connection: BankConnectionProps['connection']
  isSyncing: boolean
}) {
  const { show, expired } = connectionStatus(connection)

  if (isSyncing) {
    return (
      <div className="flex items-center space-x-1 text-xs font-normal">
        <span>Syncing...</span>
      </div>
    )
  }

  if (connection.status === 'disconnected') {
    return (
      <>
        <div className="flex items-center space-x-1 text-xs font-normal text-[#c33839]">
          <Icons.AlertCircle />
          <span>Connection issue</span>
        </div>

        <TooltipContent
          className="max-w-[430px] px-3 py-1.5 text-xs"
          sideOffset={20}
          side="left"
        >
          Please reconnect to restore the connection to a good state.
        </TooltipContent>
      </>
    )
  }

  if (show) {
    return (
      <>
        <div className="flex items-center space-x-1 text-xs font-normal text-[#FFD02B]">
          <Icons.AlertCircle />
          <span>Connection expires soon</span>
        </div>

        {connection.expires_at && (
          <TooltipContent
            className="max-w-[430px] px-3 py-1.5 text-xs"
            sideOffset={20}
            side="left"
          >
            We only have access to your bank for another{' '}
            {differenceInDays(new Date(connection.expires_at), new Date())}{' '}
            days. Please update the connection to keep everything in sync.
          </TooltipContent>
        )}
      </>
    )
  }

  // Additional states...
}
```

## Bank Account Management

Once accounts are connected, users can manage them through the `BankAccount` component.

### Account Actions

The `BankAccount` component provides several actions:

- Enable/disable account
- Edit account details
- Import transactions
- Delete account

```tsx
export function BankAccount({
  id,
  name,
  currency,
  balance,
  enabled,
  manual,
  type,
  hasError,
}: Props) {
  const [value, setValue] = useState('')
  const [_, setParams] = useQueryStates({
    step: parseAsString,
    accountId: parseAsString,
    hide: parseAsBoolean,
    type: parseAsString,
  })

  const [isOpen, setOpen] = useState(false)
  const t = useI18n()

  const updateAccount = useAction(updateBankAccountAction)
  const deleteAccount = useAction(deleteBankAccountAction)

  // Component JSX...
}
```

### Account List

The `BankAccountList` component fetches and displays all connected accounts:

```tsx
export async function BankAccountList() {
  const { data } = await getTeamBankAccounts()

  const manualAccounts = data.filter((account) => account.manual)

  const bankMap = {}

  // Group accounts by bank
  for (const item of data) {
    const bankId = item.bank?.id

    if (!bankId) {
      continue
    }

    if (!bankMap[bankId]) {
      bankMap[bankId] = {
        ...item.bank,
        accounts: [],
      }
    }

    bankMap[bankId].accounts.push(item)
  }

  // Convert the map to an array
  const result = Object.values(bankMap)

  // Sort accounts by enabled status
  function sortAccountsByEnabled(accounts) {
    return accounts.sort((a, b) => b.enabled - a.enabled)
  }

  for (const bank of result) {
    if (Array.isArray(bank.accounts)) {
      bank.accounts = sortAccountsByEnabled(bank.accounts)
    }
  }

  return (
    <>
      <BankConnections data={result} />
      <ManualAccounts data={manualAccounts} />
    </>
  )
}
```

## Background Jobs System

The bank connection process relies on a robust background jobs system to handle asynchronous tasks such as syncing transactions, refreshing connections, and processing financial data. This system ensures that resource-intensive operations don't block the user interface.

### Jobs Structure

The background jobs system is organized into two main directories:

```
jobs/
├── tasks/     # Contains specific job implementations
└── utils/     # Shared utilities for job processing
```

### Job Types

Several types of jobs support the account onboarding and bank connection process:

1. **Transaction Sync Jobs**: Fetch and process transactions from connected bank accounts
2. **Connection Refresh Jobs**: Periodically refresh bank connections to prevent expiration
3. **Balance Update Jobs**: Update account balances at regular intervals
4. **Error Recovery Jobs**: Attempt to recover from connection failures

### Job Implementation

Background jobs are implemented as asynchronous functions that are queued and executed by a job processor. Here's an example of how a transaction sync job might be implemented:

```tsx
// Example implementation of a transaction sync job
import { createJob } from '../utils/job-creator'
import { syncTransactions } from '@/lib/banking'

export const transactionSyncJob = createJob({
  name: 'sync-transactions',
  handler: async ({ connectionId, accessToken }) => {
    try {
      // Fetch transactions from the banking provider
      const transactions = await syncTransactions(connectionId, accessToken)

      // Process and store the transactions
      await processTransactions(transactions)

      return { success: true, count: transactions.length }
    } catch (error) {
      // Log the error and return failure
      console.error('Transaction sync failed:', error)
      return { success: false, error: error.message }
    }
  },
})
```

### Job Scheduling

Jobs can be scheduled in different ways:

1. **On-demand**: Triggered by user actions (e.g., manual sync button)
2. **Scheduled**: Run at regular intervals (e.g., daily balance updates)
3. **Event-driven**: Triggered by system events (e.g., connection expiration warnings)

### Integration with Account Onboarding

The background jobs system integrates with the account onboarding process at several points:

1. **Initial Connection**: When a user first connects a bank account, a job is scheduled to fetch historical transactions
2. **Regular Syncing**: Scheduled jobs keep transaction data up to date
3. **Connection Maintenance**: Jobs monitor connection health and trigger reconnection flows when needed

### Job Status Monitoring

The UI components can monitor job status to provide feedback to users:

```tsx
// Example of monitoring job status in a component
const { status, setStatus } = useSyncStatus({ runId, accessToken })

useEffect(() => {
  if (status === 'COMPLETED') {
    dismiss()
    setRunId(undefined)
    setSyncing(false)
    router.replace('/settings/accounts')
    router.refresh()
  }
}, [status])
```

### Error Handling

The jobs system includes robust error handling to manage failures in bank connections:

1. **Retry Logic**: Failed jobs can be automatically retried with exponential backoff
2. **User Notifications**: Critical failures trigger user notifications for manual intervention
3. **Fallback Strategies**: When automated recovery fails, the system can suggest alternative actions

## Implementation Examples

### 1. Setting Up the Connected Accounts Component

The `ConnectedAccounts` component serves as the main entry point for account management:

```tsx
export function ConnectedAccounts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
        <CardDescription>
          Manage bank accounts, update or connect new ones.
        </CardDescription>
      </CardHeader>

      <Suspense fallback={<BankAccountListSkeleton />}>
        <BankAccountList />
      </Suspense>

      <CardFooter className="flex justify-between">
        <div />

        <AddAccountButton />
      </CardFooter>
    </Card>
  )
}
```

### 2. Implementing the Connect Transactions Modal

The `ConnectTransactionsModal` handles the bank search and selection process:

```tsx
export function ConnectTransactionsModal({
  countryCode: initialCountryCode,
}: ConnectTransactionsModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<Institutions['data']>([])
  const [plaidToken, setPlaidToken] = useState<string | undefined>()

  const {
    countryCode,
    q: query,
    step,
    setParams,
  } = useConnectParams(initialCountryCode)

  const isOpen = step === 'connect'
  const debouncedSearchTerm = useDebounce(query, 200)

  // Load SDKs
  useScript('https://cdn.teller.io/connect/connect.js', {
    removeOnUnmount: false,
  })

  // Plaid link setup
  const { open: openPlaid } = usePlaidLink({
    // Configuration...
  })

  // Data fetching and UI rendering...
}
```

### 3. Creating a Bank Connect Button

The `BankConnectButton` provides a simple interface for initiating a connection:

```tsx
export function BankConnectButton({ onClick }: Props) {
  const [isLoading, setLoading] = useState(false)

  const handleOnClick = () => {
    setLoading(true)
    onClick()

    setTimeout(() => {
      setLoading(false)
    }, 3000)
  }

  return (
    <Button
      variant="outline"
      data-event="Bank Selected"
      data-icon="🏦"
      data-channel="bank"
      disabled={isLoading}
      onClick={handleOnClick}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Connect'}
    </Button>
  )
}
```

### 4. Displaying Bank Connections

The `BankConnections` component renders a list of connected banks with their accounts:

```tsx
export function BankConnections({
  data,
}: {
  data: BankConnectionProps['connection'][]
}) {
  const defaultValue = data.length === 1 ? ['connection-0'] : undefined

  return (
    <div className="divide-y px-6">
      <Accordion type="multiple" className="w-full" defaultValue={defaultValue}>
        {data.map((connection, index) => {
          return (
            <AccordionItem
              value={`connection-${index}`}
              key={connection.id}
              className="border-none"
            >
              <BankConnection connection={connection} />
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
```

### 5. Implementing Transaction Syncing

To implement transaction syncing, use the `manualSyncTransactionsAction` server action:

```tsx
const manualSyncTransactions = useAction(manualSyncTransactionsAction, {
  onExecute: () => setSyncing(true),
  onSuccess: ({ data }) => {
    if (data) {
      setRunId(data.id)
      setAccessToken(data.publicAccessToken)
    }
  },
  onError: () => {
    setSyncing(false)
    setRunId(undefined)
    setStatus('FAILED')

    toast({
      duration: 3500,
      variant: 'error',
      title: 'Something went wrong please try again.',
    })
  },
})

// Usage
const handleManualSync = () => {
  manualSyncTransactions.execute({
    connectionId: connection.id,
  })
}
```

## Best Practices

1. **Error Handling**: Always provide clear error messages and recovery paths for connection issues
2. **Loading States**: Use skeletons and loading indicators to provide feedback during async operations
3. **Connection Status**: Regularly check and display the status of bank connections
4. **Reconnection Flow**: Implement a smooth reconnection flow for expired or disconnected accounts
5. **Provider Fallbacks**: Offer alternative providers when a user's primary choice isn't available
6. **Manual Import**: Always provide a manual import option as a fallback

## Conclusion

Implementing bank account connections requires careful integration with multiple providers and a robust UI to guide users through the connection process. By following the patterns in this guide, you can create a seamless account onboarding experience that supports various banking providers and handles connection states gracefully.
