'use client';

import { AlertCircle, BarChart3, Building2, Check, Loader2, Search } from 'lucide-react';
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
import { CubeIcon } from '@radix-ui/react-icons';
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
    results: Array<APIInstitutions.Institution>;
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
        <div className="mt-4 scrollbar-hide h-[430px] space-y-2 overflow-auto px-1 py-2 rounded-lg">
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
                                openPlaid={() => {
                                    onSetStepToNull();
                                    openPlaid();
                                }}
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

    /**
     * Configure and initialize Plaid Link
     */
    const { open: openPlaid } = usePlaidLink({
        token: plaidToken,
        publicKey: '',
        env: process.env.NEXT_PUBLIC_PLAID_ENVIRONMENT!,
        clientName: 'simfiny',
        product: ['transactions'],

        onSuccess: async (public_token, metadata) => {
            try {
                const res = await exchangePublicTokenAction({
                    publicToken: public_token,
                });
                setParams({
                    step: 'account',
                    provider: 'plaid',
                    token: res?.data?.access_token,
                    institution_id: metadata.institution?.institution_id,
                    item_id: res?.data?.item_id,
                });
                track({
                    event: LogEvents.ConnectBankAuthorized.name,
                    channel: LogEvents.ConnectBankAuthorized.channel,
                    provider: 'plaid',
                });
            } catch (error) {
                console.error('Error in exchangePublicToken:', error);
            }
        },
        onExit: () => {
            setParams({ step: 'connect' });

            track({
                event: LogEvents.ConnectBankCanceled.name,
                channel: LogEvents.ConnectBankCanceled.channel,
                provider: 'plaid',
            });
        },
    });

    /**
     * Handles the dialog close event
     */
    const handleOnClose = () => {
        setParams(
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
        if (isOpen) {
            fetchData(debouncedSearchTerm ?? undefined);
        }
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

    return (
        <Dialog open={_isOpenOverride || isOpen} onOpenChange={_onCloseOverride || handleOnClose}>
            <DialogContent className="md:max-w-[700px] p-0 border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                <div className="p-6 md:p-8">
                    <DialogHeader className="mb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-2xl font-bold">
                                    Connect your bank
                                </DialogTitle>
                                <DialogDescription className="mt-2 text-gray-500 dark:text-gray-400 max-w-md">
                                    Securely connect your accounts to track transactions and get financial insights
                                </DialogDescription>
                            </div>
                            <div className="hidden md:flex">
                                <div className="flex gap-2 items-center bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400">
                                    <CubeIcon className="text-primary" />
                                    <span>Bank-level encryption</span>
                                </div>
                            </div>
                        </div>

                        {isCreatingToken ? (
                            <div className="flex items-center justify-center gap-2 py-2 text-sm text-primary text-bold">
                                <Loader2 size={16} className="animate-spin" />
                                <span>Establishing secure connection...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 py-2 text-sm text-bold">
                                <Check size={16} />
                                <span>Secure connection Established</span>
                            </div>
                        )}

                        <SearchBar
                            query={query}
                            countryCode={countryCode}
                            onQueryChange={(newQuery) => setParams({ q: newQuery })}
                            onCountryChange={(newCode) => setParams({ countryCode: newCode })}
                            onClearResults={() => setResults([])}
                        />

                        <div className="mt-2 border-t border-gray-100 dark:border-gray-800 pt-2">
                            <div className="flex justify-between items-center text-sm text-gray-500 px-2 mb-2">
                                <span>Popular Banks</span>
                                {!loading && results.length > 0 && (
                                    <span>{results.length} results</span>
                                )}
                            </div>
                            <SearchResults
                                loading={loading}
                                results={results}
                                openPlaid={openPlaid}
                                onSetStepToNull={() => setParams({ step: null })}
                                onImport={() => setParams({ step: 'import' })}
                                onContactUs={() => router.push('/account/support')}
                            />
                        </div>
                    </DialogHeader>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 text-center border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                    Can't find your bank? Try <button
                        type="button"
                        className="font-medium text-primary underline underline-offset-2"
                        onClick={() => setParams({ step: 'import' })}
                    >
                        manual import
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
