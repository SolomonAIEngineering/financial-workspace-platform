'use client';

import { AlertCircle, Building2, Check, RefreshCw, Search } from 'lucide-react';
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
import { Skeleton } from '../ui/skeleton';
import { createPlaidLinkTokenAction } from '@/actions/institution/create-link';
import { exchangePublicTokenAction } from '@/actions/institution/exchange-public-token';
import { getInstitutionsAction } from '@/actions/institution/get-institution';
import { motion } from 'framer-motion';
import { track } from '@v1/analytics/client';
import { useConnectParams } from '@/lib/hooks/use-connect-params';
import { usePlaidLink } from 'react-plaid-link';
import { useRouter } from 'next/navigation';

/**
 * Renders a skeleton loading state for institution search results
 */
function SearchSkeleton() {
    return (
        <div className="space-y-5 px-1">
            {Array.from(new Array(6), (_, index) => (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center space-x-4 p-2"
                    key={index.toString()}
                >
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="flex flex-col space-y-2 flex-1">
                        <Skeleton className="h-3 w-[180px] rounded-md" />
                        <Skeleton className="h-2 w-[100px] rounded-md" />
                    </div>
                    <Skeleton className="h-9 w-24 rounded-md ml-auto" />
                </motion.div>
            ))}
        </div>
    );
}

/**
 * Props for the SearchResult component
 */
type SearchResultProps = {
    id: string;
    name: string;
    logo: string | null;
    provider: string;
    availableHistory: number;
    openPlaid: () => void;
};

/**
 * Renders an individual financial institution search result
 */
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
            className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
        >
            <div className="flex items-center flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                    <BankLogo src={logo} alt={name} className="w-12 h-12 rounded-md shadow-sm" />
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm">
                        <div className={`w-3 h-3 rounded-full ${provider === 'plaid' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                    </div>
                </div>

                <div className="ml-4 cursor-default space-y-0.5 truncate">
                    <p className="text-sm font-medium truncate">{name}</p>
                    <InstitutionDetails provider={provider}>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center capitalize gap-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></span>
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

/**
 * Props for the SearchBar component
 */
type SearchBarProps = {
    query: string | null;
    countryCode: string;
    onQueryChange: (query: string | null) => void;
    onCountryChange: (countryCode: string) => void;
    onClearResults: () => void;
};

/**
 * Renders the search bar with country selector
 */
function SearchBar({
    query,
    countryCode,
    onQueryChange,
    onCountryChange,
    onClearResults,
}: SearchBarProps) {
    return (
        <div className="relative flex space-x-2 mt-5">
            <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
                    className="pl-10 py-6 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg"
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

/**
 * Props for the NoResultsFound component
 */
type NoResultsFoundProps = {
    onImport: () => void;
    onContactUs: () => void;
};

/**
 * Renders the empty state when no search results are found
 */
function NoResultsFound({ onImport, onContactUs }: NoResultsFoundProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex min-h-[350px] flex-col items-center justify-center py-12 px-4"
        >
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-5">
                <AlertCircle className="text-amber-500 w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No banks found</h3>
            <p className="text-center text-gray-500 dark:text-gray-400 max-w-md mb-6">
                We couldn't find a bank matching your search criteria.
                <br className="hidden sm:block" /> You can try a different search, import manually, or contact our support team.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    variant="outline"
                    onClick={onImport}
                    className="min-w-32 gap-2"
                >
                    <Building2 size={16} />
                    Manual Import
                </Button>

                <Button
                    onClick={onContactUs}
                    className="min-w-32 gap-2"
                >
                    Need Help?
                </Button>
            </div>
        </motion.div>
    );
}

/**
 * Props for the SearchResults component
 */
type SearchResultsProps = {
    loading: boolean;
    results: APIInstitutions.Institution[];
    openPlaid: any;
    onSetStepToNull: () => void;
    onImport: () => void;
    onContactUs: () => void;
};

/**
 * Renders the search results or appropriate empty/loading states
 */
function SearchResults({
    loading,
    results,
    openPlaid,
    onSetStepToNull,
    onImport,
    onContactUs,
}: SearchResultsProps) {
    return (
        <div className="mx-[3%] scrollbar-hide h-[430px] space-y-2 overflow-auto px-1 py-2 rounded-lg">
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
                                    institution.available_history ? +institution.available_history : 0
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

/**
 * Component to display the transaction sync status
 */
function SyncStatusContent({ status, onComplete }: { status: 'idle' | 'syncing' | 'success' | 'error', onComplete: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-6">
            {status === 'syncing' && (
                <>
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        <RefreshCw className="h-16 w-16 text-primary animate-spin" />
                    </div>
                    <h3 className="text-xl font-semibold">Syncing Your Data</h3>
                    <p className="text-muted-foreground max-w-md">
                        We're connecting to your financial institution and syncing your transactions, accounts, and balances.
                        This process may take a minute or two.
                    </p>
                </>
            )}

            {status === 'success' && (
                <>
                    <div className="relative w-20 h-20 flex items-center justify-center bg-green-100 rounded-full">
                        <Check className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold">Connection Successful!</h3>
                    <p className="text-muted-foreground max-w-md">
                        Your accounts and transactions have been successfully synced.
                        You can now view your accounts and transactions.
                    </p>
                    <Button onClick={onComplete} className="mt-4">
                        Go to Accounts
                    </Button>
                </>
            )}

            {status === 'error' && (
                <>
                    <div className="relative w-20 h-20 flex items-center justify-center bg-red-100 rounded-full">
                        <AlertCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold">Sync Failed</h3>
                    <p className="text-muted-foreground max-w-md">
                        We encountered an error while syncing your accounts and transactions.
                        Please try again later or contact support if the issue persists.
                    </p>
                    <div className="flex space-x-4 mt-4">
                        <Button onClick={() => window.location.reload()} variant="outline">
                            Try Again
                        </Button>
                        <Button onClick={onComplete}>
                            Continue Anyway
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

/**
 * Props for the ConnectTransactionsModal component
 */
type ConnectTransactionsModalProps = {
    countryCode: string;
    userId: string;
    _isOpenOverride?: boolean;
    _onCloseOverride?: () => void;
};

/**
 * Modal component for connecting to financial institutions and importing transactions
 */
export function ConnectTransactionsModal({
    countryCode: initialCountryCode,
    userId,
    _isOpenOverride,
    _onCloseOverride,
}: ConnectTransactionsModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<Array<APIInstitutions.Institution>>([]);
    const [plaidToken, setPlaidToken] = useState<string | undefined>();
    const [isCreatingToken, setIsCreatingToken] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

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
                throw new Error('Failed to get access token');
            }

            // Set params to move to syncing state
            await setParams({
                step: 'syncing',
                provider: 'plaid',
                token: accessToken,
                institution_id: institutionId,
                item_id: itemId,
            });

            // Trigger background job to sync transactions, bank accounts, and connections
            // Use the API endpoint to trigger the sync
            const syncResponse = await fetch('/api/sync-transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accessToken,
                    itemId,
                    institutionId,
                    userId
                }),
            });

            if (!syncResponse.ok) {
                const errorData = await syncResponse.json();
                throw new Error(errorData.message || 'Failed to trigger sync job');
            }

            // Mark sync as successful
            setSyncStatus('success');

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

    /**
     * Configure and initialize Plaid Link
     */
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
    const handleSearchChange = (newQuery: string | null) => setParams({ q: newQuery });
    const handleCountryChange = (newCode: string) => setParams({ countryCode: newCode });
    const handleClearResults = () => setResults([]);
    const resetStep = () => setParams({ step: null });

    // Handle sync completion and redirect to accounts or dashboard
    const handleSyncComplete = async () => {
        await setParams({ step: null });
        // Redirect to accounts page or dashboard
        router.push('/accounts');
    };

    /**
     * Handles the dialog close event
     */
    const handleOnClose = async () => {
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
    };

    /**
     * Fetches institution data based on country code and search query
     */
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
        if (
            (isOpen && (results?.length ?? 0) === 0) ||
            countryCode !== initialCountryCode
        ) {
            fetchData();
        }
    }, [isOpen, countryCode]);
    // Fetch data when search term changes
    useEffect(() => {
        const loadData = async () => {
            if (isOpen) {
                await fetchData(debouncedSearchTerm ?? undefined);
            }
        };

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
                    const now = new Date().getTime();

                    // If token exists and hasn't expired (Plaid tokens expire after 4 hours)
                    // We check with a 5-minute buffer to be safe
                    if (token && expiration && now < expiration - 300000) {
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
                    const expiration = new Date().getTime() + 4 * 60 * 60 * 1000;
                    localStorage.setItem(
                        'plaidLinkToken',
                        JSON.stringify({
                            token: result.data,
                            expiration
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
            createLinkToken();
        }
    }, [isOpen, countryCode]);

    // Track if we're currently opening Plaid
    const [isOpeningPlaid, setIsOpeningPlaid] = useState(false);

    useEffect(() => {
        // Clean up any leftover dialogs when component unmounts
        return () => {
            // Force cleanup of any dialogs or overlays
            document.querySelectorAll('[role="dialog"]').forEach(el => {
                if (el.parentNode) el.parentNode.removeChild(el);
            });
        };
    }, []);

    // Variable to control dialog visibility
    const isDialogOpen = (_isOpenOverride ?? step !== null) && !isOpeningPlaid;

    // Create a wrapped openPlaid function that handles proper modal cleanup
    const handleOpenPlaid = () => {
        // Mark that we're opening Plaid to prevent our dialog from showing
        setIsOpeningPlaid(true);

        // Clean up any potential blocking elements
        setTimeout(() => {
            // Force remove any dialog elements
            document.querySelectorAll('[role="dialog"]').forEach(el => {
                if (el.parentNode) el.parentNode.removeChild(el);
            });

            // Remove fixed position overlays
            document.querySelectorAll('.fixed.inset-0').forEach(el => {
                if (el.parentNode) el.parentNode.removeChild(el);
            });

            // Now we can safely open Plaid
            openPlaid();
        }, 100);
    };

    // When not showing our dialog, return null to completely unmount it from the DOM
    if (!isDialogOpen) return null;

    // Only render the Dialog when it should be visible
    return (
        <Dialog
            open={true}
            onOpenChange={(isOpen) => {
                if (!isOpen && !_isOpenOverride) {
                    void (_onCloseOverride
                        ? _onCloseOverride()
                        : handleOnClose());
                }
            }}
        >
            <DialogContent className="md:min-w-[60%] md:min-h-[60%] p-0 border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                {step === 'connect' && (
                    <>
                        <div className="p-6 md:p-8">
                            <DialogHeader className="mb-4">
                                <div className="flex justify-between items-center">
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

                        {/* Close button */}
                        <button
                            onClick={handleOnClose}
                            className="absolute top-4 right-4 opacity-70 transition-opacity hover:opacity-100"
                        >
                            <span className="sr-only">Close</span>
                            &times;
                        </button>
                    </>
                )}

                {(step === 'syncing' || step === 'account') && (
                    <SyncStatusContent status={syncStatus} onComplete={handleSyncComplete} />
                )}
            </DialogContent>
        </Dialog>
    );
}
