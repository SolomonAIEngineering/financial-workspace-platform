'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/registry/default/potion-ui/dialog';
import { useDebounce, useScript } from '@uidotdev/usehooks';
import { useEffect, useState } from 'react';

import { BankLogo } from '../bank-account/bank-logo';
import { Button } from '@/registry/default/potion-ui/button';
import { ConnectBankProvider } from '../bank-connection/connect-bank-provider';
import { CountrySelector } from '../bank-connection/country-selector';
import { Input } from '@/registry/default/potion-ui/input';
import { InstitutionDetails } from '../institution/institution-details';
import { InstitutionsSchema } from '@solomon-ai/financial-engine-sdk/resources/institutions.mjs';
import { LogEvents } from '@v1/analytics/events';
import { Skeleton } from '../ui/skeleton';
import { createPlaidLinkTokenAction } from '@/actions/institution/create-link';
import { exchangePublicTokenAction } from '@/actions/institution/exchange-public-token';
import { getInstitutions } from '@/actions/institution/get-institution';
import { track } from '@v1/analytics/client';
import { useConnectParams } from '@/lib/hooks/use-connect-params';
import { usePlaidLink } from 'react-plaid-link';
import { useRouter } from 'next/navigation';

/**
 * Renders a skeleton loading state for institution search results
 *
 * @returns A loading skeleton UI for the search results list
 */
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
    );
}

/**
 * Props for the SearchResult component
 *
 * @property id - Unique identifier for the financial institution
 * @property name - Display name of the financial institution
 * @property logo - URL to the institution's logo image
 * @property provider - The provider name (e.g., "plaid", "teller")
 * @property availableHistory - Number of months of available transaction
 *   history
 * @property openPlaid - Function to open the Plaid connection dialog
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
 *
 * @param props - The component props
 * @returns A search result item showing institution details and connection
 *   options
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
        <div className="flex justify-between">
            <div className="flex items-center">
                <BankLogo src={logo} alt={name} />

                <div className="ml-4 cursor-default space-y-1">
                    <p className="text-sm leading-none font-medium">{name}</p>
                    <InstitutionDetails provider={provider}>
                        <span className="text-xs text-[#878787] capitalize">
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
        </div>
    );
}

/**
 * Props for the SearchBar component
 *
 * @property query - Current search query value
 * @property countryCode - Selected country code
 * @property onQueryChange - Handler for search query changes
 * @property onCountryChange - Handler for country selection changes
 */
type SearchBarProps = {
    query: string | null;
    countryCode: string;
    onQueryChange: (query: string | null) => void;
    onCountryChange: (countryCode: string) => void;
    onClearResults: () => void;
};

/**
 * Renders the search bar with country selector for finding financial
 * institutions
 *
 * @param props - The component props
 * @returns A search input and country selector UI
 */
function SearchBar({
    query,
    countryCode,
    onQueryChange,
    onCountryChange,
    onClearResults,
}: SearchBarProps) {
    return (
        <div className="relative flex space-x-2">
            <Input
                placeholder="Search bank..."
                type="search"
                onChange={(evt) => onQueryChange(evt.target.value || null)}
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
 *
 * @property onImport - Handler for the import button click
 * @property onContactUs - Handler for the contact us button click
 */
type NoResultsFoundProps = {
    onImport: () => void;
    onContactUs: () => void;
};

/**
 * Renders the empty state when no search results are found
 *
 * @param props - The component props
 * @returns An empty state UI with import and contact options
 */
function NoResultsFound({ onImport, onContactUs }: NoResultsFoundProps) {
    return (
        <div className="flex min-h-[350px] flex-col items-center justify-center">
            <p className="mb-2 font-medium">No banks found</p>
            <p className="text-center text-sm text-[#878787]">
                We couldn't find a bank matching your criteria.
                <br /> Let us know, or start with manual import.
            </p>

            <div className="mt-4 flex space-x-2">
                <Button variant="outline" onClick={onImport}>
                    Import
                </Button>

                <Button onClick={onContactUs}>Contact us</Button>
            </div>
        </div>
    );
}

/**
 * Props for the SearchResults component
 *
 * @property loading - Whether results are currently loading
 * @property results - Array of institution search results
 * @property openPlaid - Function to open the Plaid connection dialog
 * @property onSetStepToNull - Function to set the step to null
 * @property onImport - Handler for the import button click
 * @property onContactUs - Handler for the contact us button click
 */
type SearchResultsProps = {
    loading: boolean;
    results: Array<InstitutionsSchema.Data>;
    openPlaid: any;
    onSetStepToNull: () => void;
    onImport: () => void;
    onContactUs: () => void;
};

/**
 * Renders the search results or appropriate empty/loading states
 *
 * @param props - The component props
 * @returns List of search results, loading state, or empty state
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
        <div className="mt-2 scrollbar-hide h-[430px] space-y-4 overflow-auto pt-2">
            {loading && <SearchSkeleton />}

            {results?.map((institution) => {
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

            {!loading && results.length === 0 && (
                <NoResultsFound onImport={onImport} onContactUs={onContactUs} />
            )}
        </div>
    );
}

/**
 * Props for the ConnectTransactionsModal component
 *
 * @property countryCode - Initial country code to use for institution search
 * @property userId - ID of the current user
 */
type ConnectTransactionsModalProps = {
    countryCode: string;
    userId: string;
};

/**
 * Modal component for connecting to financial institutions and importing
 * transactions
 *
 * This component allows users to search for their financial institution across
 * different countries and providers (like Plaid), connect to it securely, and
 * import transaction data.
 *
 * @param props - The component props
 * @returns A dialog for connecting to financial institutions
 */
export function ConnectTransactionsModal({
    countryCode: initialCountryCode,
    userId,
}: ConnectTransactionsModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<Array<InstitutionsSchema.Data>>([]);
    const [plaidToken, setPlaidToken] = useState<string | undefined>();

    const {
        countryCode,
        q: query,
        step,
        setParams,
    } = useConnectParams(initialCountryCode);

    const isOpen = step === 'connect';
    const debouncedSearchTerm = useDebounce(query, 200);

    // NOTE: Load SDKs here so it's not unmonted
    useScript('https://cdn.teller.io/connect/connect.js', {
        removeOnUnmount: false,
    });

    /**
     * Configure and initialize Plaid Link
     *
     * Sets up the Plaid Link connection flow with appropriate callbacks for
     * token exchange and UI state management
     */
    const { open: openPlaid } = usePlaidLink({
        token: plaidToken,
        publicKey: '',
        env: process.env.NEXT_PUBLIC_PLAID_ENVIRONMENT!,
        clientName: 'simfiny',
        product: ['transactions'],

        onSuccess: async (public_token, metadata) => {
            // exchange the access token (this will perform token exchange with our enterprise backend as well)
            try {
                const res = await exchangePublicTokenAction({
                    publicToken: public_token,
                });

                // TODO: save the item id for the given institution id
                console.log(
                    'this is the result obtained from exchange public token',
                    res
                );

                setParams({
                    step: 'account',
                    provider: 'plaid',
                    token: res?.data?.access_token,
                    institution_id: metadata.institution?.institution_id,
                    // item_id: res?.data?.item_id,
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
     *
     * Resets all parameters and ensures proper UI state on modal close
     */
    const handleOnClose = () => {
        setParams(
            {
                step: null,
                countryCode: null,
                q: null,
                ref: null,
            },
            {
                // NOTE: Rerender so the overview modal is visible
                shallow: false,
            }
        );
    };

    /**
     * Fetches institution data based on country code and search query
     *
     * @param query - Optional search term to filter institutions
     */
    async function fetchData(query?: string) {
        try {
            setLoading(true);
            const { data } = await getInstitutions({ countryCode, query });
            setLoading(false);

            setResults(data);
        } catch {
            setLoading(false);
            setResults([]);
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
        /** Creates a Plaid link token for the current user */
        async function createLinkToken() {
            const result = await createPlaidLinkTokenAction({
                accessToken: null,
            });

            if (result?.data) {
                setPlaidToken(result.data);
            }
        }

        // NOTE: Only run where Plaid is supported
        if ((isOpen && countryCode === 'US') || (isOpen && countryCode === 'CA')) {
            createLinkToken();
        }
    }, [isOpen, countryCode]);

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

                        <div className="pt-4">
                            <SearchBar
                                query={query}
                                countryCode={countryCode}
                                onQueryChange={(newQuery) => setParams({ q: newQuery })}
                                onCountryChange={(newCode) =>
                                    setParams({ countryCode: newCode })
                                }
                                onClearResults={() => setResults([])}
                            />

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
            </DialogContent>
        </Dialog>
    );
}
