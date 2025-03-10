'use client';

import { ConnectTransactionsButton } from './connect-transactions-button';
import { ConnectTransactionsProvider } from './connect-transactions-context';
import { ConnectTransactionsWrapper } from './connect-transactions-wrapper';

/**
 * Example component demonstrating how to use the ConnectTransactionsButton
 * 
 * This component shows different configuration options for the ConnectTransactionsButton
 * and includes the ConnectTransactionsProvider to manage the modal state.
 */
export function ConnectTransactionsExample({ userId }: { userId: string }) {
    return (
        <ConnectTransactionsProvider defaultUserId={userId}>
            <div className="space-y-6">
                <h2 className="text-xl font-semibold">Connect Bank Account Examples</h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Basic usage with default settings */}
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-2 text-lg font-medium">Default Button</h3>
                        <p className="mb-4 text-sm text-muted-foreground">Basic usage with default settings</p>
                        <ConnectTransactionsButton userId={userId} />
                    </div>

                    {/* Custom styling */}
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-2 text-lg font-medium">Custom Styling</h3>
                        <p className="mb-4 text-sm text-muted-foreground">Button with custom styling and text</p>
                        <ConnectTransactionsButton
                            userId={userId}
                            countryCode="CA"
                            buttonProps={{
                                variant: "secondary",
                                size: "lg",
                                className: "w-full"
                            }}
                        >
                            Link Canadian Bank
                        </ConnectTransactionsButton>
                    </div>

                    {/* Alternative style */}
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-2 text-lg font-medium">Outline Variant</h3>
                        <p className="mb-4 text-sm text-muted-foreground">Button with outline variant</p>
                        <ConnectTransactionsButton
                            userId={userId}
                            buttonProps={{
                                variant: "outline",
                                className: "border-primary text-primary"
                            }}
                        >
                            Connect Financial Account
                        </ConnectTransactionsButton>
                    </div>
                </div>

                {/* The modal wrapper component handles rendering the modal */}
                <ConnectTransactionsWrapper />

                <div className="mt-8 rounded-lg border bg-muted p-4">
                    <h3 className="mb-2 text-lg font-medium">Implementation Notes</h3>
                    <ul className="list-inside list-disc space-y-2 text-sm">
                        <li>Wrap your app or page with <code className="rounded bg-muted-foreground/20 px-1">ConnectTransactionsProvider</code></li>
                        <li>Place the <code className="rounded bg-muted-foreground/20 px-1">ConnectTransactionsWrapper</code> component in your layout</li>
                        <li>Use the <code className="rounded bg-muted-foreground/20 px-1">ConnectTransactionsButton</code> anywhere you need a button to open the modal</li>
                        <li>The button directly controls the modal state through React context, no URL parameters needed</li>
                        <li>Customize the button appearance using the <code className="rounded bg-muted-foreground/20 px-1">buttonProps</code> property</li>
                    </ul>
                </div>
            </div>
        </ConnectTransactionsProvider>
    );
} 