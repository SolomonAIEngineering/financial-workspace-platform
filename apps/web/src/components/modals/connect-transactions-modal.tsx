'use client';

import { AlertCircle, Building2, Search, XIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/registry/default/potion-ui/dialog';
import { useDebounce, useScript } from '@uidotdev/usehooks';
import { useEffect, useState } from 'react';

import { APIInstitutions } from '@solomon-ai/workspace-financial-backend-sdk/resources/api-institutions.js';
import { BankLogo } from '../bank-account/bank-logo';
import { Button } from '@/registry/default/potion-ui/button';
import { ConnectBankProvider } from '../bank-connection/connect-bank-provider';
import { CountrySelector } from '../bank-connection/country-selector';
import { Input } from '@/registry/default/potion-ui/input';
import { InstitutionDetails } from '../institution/institution-details';
import { LogEvents } from '@v1/analytics/events';
import { SelectBankAccountsModal } from './select-bank-accounts-modal';
import { Skeleton } from '../ui/skeleton';
import { createPlaidLinkTokenAction } from '@/actions/institution/create-link';
import { exchangePublicTokenAction } from '@/actions/institution/exchange-public-token';
import { getInstitutionsAction } from '@/actions/institution/get-institution';
import { motion } from 'framer-motion';
import { track } from '@v1/analytics/client';
import { useConnectParams } from '@/hooks/use-connect-params';
import { usePlaidLink } from 'react-plaid-link';
import { useRouter } from 'next/navigation';

/** Renders a skeleton loading state for institution search results */
function SearchSkeleton() {
  return (
    <div className="space-y-5 px-1">
      {Array.from({ length: 6 }, (_, index) => (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className="flex items-center space-x-4 p-2"
          key={index.toString()}
        >
          <Skeleton className="h-12 w-12 rounded-md" />
          <div className="flex flex-1 flex-col space-y-2">
            <Skeleton className="h-3 w-[180px] rounded-md" />
            <Skeleton className="h-2 w-[100px] rounded-md" />
          </div>
          <Skeleton className="ml-auto h-9 w-24 rounded-md" />
        </motion.div>
      ))}
    </div>
  );
}

/** Props for the SearchResult component */
type SearchResultProps = {
  id: string;
  name: string;
  logo: string | null;
  provider: string;
  availableHistory: number;
  openPlaid: () => void;
};

/** Renders an individual financial institution search result */
function SearchResult({
  id,
  name,
  logo,
  provider,
  availableHistory,
  openPlaid,
}: SearchResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between rounded-lg p-3 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
    >
      <div className="flex min-w-0 flex-1 items-center">
        <div className="relative flex-shrink-0">
          <BankLogo
            src={logo}
            alt={name}
            className="h-12 w-12 rounded-md shadow-sm"
          />
          <div className="absolute -right-1 -bottom-1 rounded-full bg-white p-0.5 shadow-sm dark:bg-gray-800">
            <div
              className={`h-3 w-3 rounded-full ${provider === 'plaid' ? 'bg-emerald-500' : 'bg-blue-500'}`}
            ></div>
          </div>
        </div>

        <div className="ml-4 cursor-default space-y-0.5 truncate">
          <p className="truncate text-sm font-medium">{name}</p>
          <InstitutionDetails provider={provider}>
            <span className="flex items-center gap-1 text-xs text-gray-500 capitalize dark:text-gray-400">
              <span className="inline-block h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600"></span>
              Via {provider}
            </span>
          </InstitutionDetails>
        </div>
      </div>

      <ConnectBankProvider
        id={id}
        provider={provider}
        openPlaid={openPlaid}
        availableHistory={availableHistory}
      />
    </motion.div>
  );
}

/** Props for the SearchBar component */
type SearchBarProps = {
  query: string | null;
  countryCode: string;
  onQueryChange: (query: string | null) => void;
  onCountryChange: (countryCode: string) => void;
  onClearResults: () => void;
};

/** Renders the search bar with country selector */
function SearchBar({
  query,
  countryCode,
  onQueryChange,
  onCountryChange,
  onClearResults,
}: SearchBarProps) {
  return (
    <div className="relative mt-5 flex space-x-2">
      <div className="relative flex-1">
        <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
          <Search size={18} />
        </div>
        <Input
          placeholder="Search for your bank..."
          type="search"
          onChange={(evt) => onQueryChange(evt.target.value || null)}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          autoFocus
          value={query ?? ''}
          className="rounded-lg border-gray-200 bg-gray-50 py-6 pl-10 dark:border-gray-700 dark:bg-gray-800/50"
        />
      </div>

      <div className="z-10">
        <CountrySelector
          defaultValue={countryCode}
          onSelect={(code) => {
            onCountryChange(code);
            onClearResults();
          }}
        />
      </div>
    </div>
  );
}

/** Props for the NoResultsFound component */
type NoResultsFoundProps = {
  onImport: () => void;
  onContactUs: () => void;
};

/** Renders the empty state when no search results are found */
function NoResultsFound({ onImport, onContactUs }: NoResultsFoundProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-[350px] flex-col items-center justify-center px-4 py-12"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20">
        <AlertCircle className="h-8 w-8 text-amber-500" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">No banks found</h3>
      <p className="mb-6 max-w-md text-center text-gray-500 dark:text-gray-400">
        We couldn't find a bank matching your search criteria.
        <br className="hidden sm:block" /> You can try a different search,
        import manually, or contact our support team.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={onImport} className="min-w-32 gap-2">
          <Building2 size={16} />
          Manual Import
        </Button>

        <Button onClick={onContactUs} className="min-w-32 gap-2">
          Need Help?
        </Button>
      </div>
    </motion.div>
  );
}

/** Props for the SearchResults component */
type SearchResultsProps = {
  loading: boolean;
  results: APIInstitutions.Institution[];
  openPlaid: any;
  onSetStepToNull: () => void;
  onImport: () => void;
  onContactUs: () => void;
};

/** Renders the search results or appropriate empty/loading states */
function SearchResults({
  loading,
  results,
  openPlaid,
  onSetStepToNull,
  onImport,
  onContactUs,
}: SearchResultsProps) {
  return (
    <div className="mx-[3%] scrollbar-hide h-[430px] space-y-2 overflow-auto rounded-lg px-1 py-2">
      {loading && <SearchSkeleton />}

      {!loading && results && results.length > 0 && (
        <div className="space-y-2 divide-y divide-gray-100 dark:divide-gray-800">
          {results.map((institution) => {
            if (!institution) {
              return null;
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
                openPlaid={openPlaid}
              />
            );
          })}
        </div>
      )}

      {!loading && (!results || results.length === 0) && (
        <NoResultsFound onImport={onImport} onContactUs={onContactUs} />
      )}
    </div>
  );
}

/** Props for the ConnectTransactionsModal component */
type ConnectTransactionsModalProps = {
  countryCode: string;
  userId: string;
  teamId: string;
  _isOpenOverride?: boolean;
  _onCloseOverride?: () => void;
  pathname: string;
};

/**
 * Modal component for connecting to financial institutions and importing
 * transactions
 */
export function ConnectTransactionsModal({
  countryCode: initialCountryCode,
  userId,
  teamId,
  _isOpenOverride,
  _onCloseOverride,
  pathname,
}: ConnectTransactionsModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<APIInstitutions.Institution[]>([]);
  const [plaidToken, setPlaidToken] = useState<string | undefined>();
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    'idle' | 'syncing' | 'success' | 'error'
  >('idle');

  // State for the SelectBankAccountsModal
  const [showSelectAccountsModal, setShowSelectAccountsModal] = useState(false);
  const [accountSelectionData, setAccountSelectionData] = useState({
    provider: '',
    ref: '',
    institution_id: '',
    token: '',
    itemId: '',
    userId: '',
    teamId: '',
  });

  const {
    countryCode,
    q: query,
    step,
    setParams,
  } = useConnectParams(initialCountryCode);

  const isOpen = step === 'connect';
  const debouncedSearchTerm = useDebounce(query, 200);

  // Load SDKs
  useScript('https://cdn.teller.io/connect/connect.js', {
    removeOnUnmount: false,
  });

  const onSuccess = async (public_token: string, metadata: any) => {
    try {
      // First set the syncing state for UI feedback
      setSyncStatus('syncing');

      // Exchange the public token for an access token
      const res = await exchangePublicTokenAction({
        publicToken: public_token,
      });

      // Get the access token and item_id from the exchange response
      const accessToken = res?.data?.access_token;
      const itemId = res?.data?.item_id;
      const institutionId = metadata.institution?.institution_id;

      if (!accessToken || !itemId) {
        console.error('Missing required tokens', {
          accessToken: !!accessToken,
          itemId: !!itemId,
        });
        throw new Error('Failed to get access token');
      }

      // Store the data needed for the SelectBankAccountsModal
      setAccountSelectionData({
        provider: 'plaid',
        ref: itemId,
        institution_id: institutionId,
        token: accessToken,
        itemId: itemId,
        userId: userId,
        teamId: teamId,
      });

      // First close the current modal
      await setParams({
        step: null,
        provider: null,
        token: null,
        institution_id: null,
        item_id: null,
      });

      // Small delay to ensure modal is fully closed
      setTimeout(() => {
        // Now show the SelectBankAccountsModal
        setShowSelectAccountsModal(true);
      }, 50);

      // Track analytics event
      track({
        event: LogEvents.ConnectBankAuthorized.name,
        channel: LogEvents.ConnectBankAuthorized.channel,
        provider: 'plaid',
      });
    } catch (error) {
      console.error('Error in exchangePublicToken or syncing:', error);
      setSyncStatus('error');
    }
  };

  /** Configure and initialize Plaid Link */
  const { open: openPlaid } = usePlaidLink({
    token: plaidToken,
    publicKey: '',
    env: process.env.NEXT_PUBLIC_PLAID_ENVIRONMENT!,
    clientName: 'simfiny',
    product: ['transactions'],
    onSuccess,
    onExit: async (err) => {
      // If there's an error, log it
      if (err) {
        console.error('Plaid exit error:', err);
      }

      // Reset the isOpeningPlaid flag so our dialog can be shown again if needed
      setIsOpeningPlaid(false);

      // We intentionally don't reopen our modal - user needs to manually reopen if desired

      track({
        event: LogEvents.ConnectBankCanceled.name,
        channel: LogEvents.ConnectBankCanceled.channel,
        provider: 'plaid',
        error: err ? String(err) : undefined,
      });
    },
  });

  // Search-related handlers
  const handleSearchChange = (newQuery: string | null) =>
    setParams({ q: newQuery });
  const handleCountryChange = (newCode: string) =>
    setParams({ countryCode: newCode });
  const handleClearResults = () => setResults([]);
  const resetStep = () => setParams({ step: null });

  /** Handles the dialog close event */
  const handleOnClose = async () => {
    // Clear the step in URL params
    await setParams(
      {
        step: null,
        countryCode: null,
        ref: null,
      },
      {
        shallow: false,
      }
    );

    // Reset local state but don't mess with the DOM
    setSyncStatus('idle');
    setIsOpeningPlaid(false);
  };

  /** Fetches institution data based on country code and search query */
  async function fetchData(query?: string) {
    try {
      setLoading(true);
      const result = await getInstitutionsAction({ countryCode, query });
      setResults(result?.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      setResults([]);
      setLoading(false);
    }
  }

  // Fetch initial data when modal opens or country changes
  useEffect(() => {
    const loadInitialData = async () => {
      if (
        (isOpen && (results?.length ?? 0) === 0) ||
        countryCode !== initialCountryCode
      ) {
        await fetchData();
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadInitialData();
  }, [isOpen, countryCode]);

  // Fetch data when search term changes
  useEffect(() => {
    const loadData = async () => {
      if (isOpen) {
        await fetchData(debouncedSearchTerm ?? undefined);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadData();
  }, [debouncedSearchTerm, isOpen]);
  // Create Plaid link token when modal opens in supported countries
  useEffect(() => {
    async function createLinkToken() {
      setIsCreatingToken(true);
      try {
        // Check if we have a valid token in localStorage first
        const storedTokenData = localStorage.getItem('plaidLinkToken');
        if (storedTokenData) {
          const { token, expiration } = JSON.parse(storedTokenData);
          const now = Date.now();

          // If token exists and hasn't expired (Plaid tokens expire after 4 hours)
          // We check with a 5-minute buffer to be safe
          if (token && expiration && now < expiration - 300_000) {
            setPlaidToken(token);
            setIsCreatingToken(false);
            return;
          }
        }

        // If no valid token in localStorage, create a new one
        const result = await createPlaidLinkTokenAction({
          accessToken: null,
        });

        if (result?.data) {
          setPlaidToken(result.data);

          // Store token in localStorage with expiration (4 hours from now)
          // Plaid tokens are valid for 4 hours, so we set expiration accordingly
          const expiration = Date.now() + 4 * 60 * 60 * 1000;
          localStorage.setItem(
            'plaidLinkToken',
            JSON.stringify({
              token: result.data,
              expiration,
            })
          );
        }
      } catch (error) {
        console.error('Error creating Plaid link token:', error);
      } finally {
        setIsCreatingToken(false);
      }
    }

    // Only run where Plaid is supported
    if ((isOpen && countryCode === 'US') || (isOpen && countryCode === 'CA')) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      (async () => {
        await createLinkToken();
      })();
    }
  }, [isOpen, countryCode]);

  // Track if we're currently opening Plaid
  const [isOpeningPlaid, setIsOpeningPlaid] = useState(false);

  useEffect(() => {
    // No aggressive DOM cleanup - let React handle unmounting properly
    return () => {
      // Reset state on unmount
      setSyncStatus('idle');
      setIsOpeningPlaid(false);
    };
  }, []);

  // Variable to control dialog visibility
  const isDialogOpen = (_isOpenOverride ?? step !== null) && !isOpeningPlaid;

  // Debug useEffect to track modal state changes
  useEffect(() => {
    // Reset isOpeningPlaid if needed when step is null
    if (step === null && isOpeningPlaid) {
      setIsOpeningPlaid(false);
    }
  }, [isDialogOpen, step, isOpeningPlaid]);

  // Create a wrapped openPlaid function that handles proper modal cleanup
  const handleOpenPlaid = () => {
    // Mark that we're opening Plaid to prevent our dialog from showing
    setIsOpeningPlaid(true);

    // Use a short timeout to allow state updates to process
    setTimeout(() => {
      // Now we can safely open Plaid
      openPlaid();
    }, 100);
  };

  // When not showing our dialog, return null to completely unmount it from the DOM
  if (!isDialogOpen) return null;

  // Only render the Dialog when it should be visible
  return (
    <>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            // Use the proper close handler to maintain reopening ability
            if (_onCloseOverride) {
              _onCloseOverride();
            } else {
              void handleOnClose();
            }
          }
        }}
      >
        <DialogContent className="overflow-hidden border-gray-200 p-0 shadow-xl md:min-h-[60%] md:min-w-[60%] dark:border-gray-800">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (_onCloseOverride) {
                _onCloseOverride();
              } else {
                void handleOnClose();
              }
            }}
            className="absolute top-2 right-2 z-50 h-7 w-7 rounded-full"
            aria-label="Close dialog"
          >
            <XIcon className="h-4 w-4" />
          </Button>

          {step === 'connect' && (
            <>
              <div className="p-6 md:p-8">
                <DialogHeader className="mb-4">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-2xl sm:text-3xl">
                      Connect your bank
                    </DialogTitle>
                  </div>
                  <DialogDescription>
                    Connect your financial accounts to import transactions.
                  </DialogDescription>
                </DialogHeader>

                <SearchBar
                  query={query}
                  countryCode={countryCode}
                  onQueryChange={handleSearchChange}
                  onCountryChange={handleCountryChange}
                  onClearResults={handleClearResults}
                />
              </div>

              <SearchResults
                loading={loading}
                results={results}
                openPlaid={handleOpenPlaid}
                onSetStepToNull={resetStep}
                onImport={() => { }}
                onContactUs={() => { }}
              />
            </>
          )}

          {(step === 'syncing' || step === 'account') &&
            !showSelectAccountsModal && (
              <div className="flex min-h-[400px] flex-col items-center justify-center">
                <p className="text-center text-muted-foreground">
                  Synchronizing with your bank account...
                </p>
              </div>
            )}
        </DialogContent>
      </Dialog>

      {/* Render the SelectBankAccountsModal when showSelectAccountsModal is true */}
      {showSelectAccountsModal && (
        <SelectBankAccountsModal
          pathname={pathname}
          isOpen={showSelectAccountsModal}
          onClose={(syncCompleted) => {
            setShowSelectAccountsModal(false);

            // Reset the account selection data
            setAccountSelectionData({
              provider: '',
              ref: '',
              institution_id: '',
              token: '',
              itemId: '',
              userId: '',
              teamId: '',
            });

            // If sync was successfully completed, go to accounts page
            if (syncCompleted) {
              // Redirect to accounts page or dashboard
              router.push('/accounts');
            } else {
              // If sync was not completed, just reset the URL params
              void setParams({
                step: null,
                provider: null,
                token: null,
                institution_id: null,
                item_id: null,
              });
            }
          }}
          provider={accountSelectionData.provider}
          ref={accountSelectionData.ref}
          institution_id={accountSelectionData.institution_id}
          token={accountSelectionData.token}
          itemId={accountSelectionData.itemId}
          userId={accountSelectionData.userId}
          teamId={accountSelectionData.teamId}
        />
      )}
    </>
  );
}
