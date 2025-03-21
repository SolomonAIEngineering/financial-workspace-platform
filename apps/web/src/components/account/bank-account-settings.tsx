import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/registry/default/potion-ui/tabs';

import { ConnectTransactionsButton } from '../bank-connection/connect-transactions-button';
import { Icons } from '@/components/ui/icons';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { cn } from '@/lib/utils';

interface BankAccountSettingsProps {
  userId: string;
}

export function BankAccountSettings({ userId }: BankAccountSettingsProps) {
  return (
    <div className="rounded-xl border-4 border-muted/10 shadow-md transition-all duration-300 hover:shadow-lg md:p-[4%]">
      <div className="w-full">
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            Bank Account Settings
            <InfoTooltip
              title="Bank Account Settings"
              description="Manage your financial institution connections, account preferences, and how transaction data is processed and displayed."
              size="default"
            />
          </h2>
          <p className="mt-1 text-muted-foreground">
            Manage settings for your bank connections, accounts, and
            transactions
          </p>
        </div>

        <Tabs className="w-full" defaultValue="connections">
          <TabsList className="mb-6 grid w-full grid-cols-4 bg-muted/20">
            <TabsTrigger
              className="flex items-center gap-2 data-[state=active]:bg-background"
              value="connections"
            >
              <Icons.link className="size-4" />
              <span>Connection Settings</span>
              <InfoTooltip
                title="Connection Settings"
                description="Manage your existing financial institution connections and add new ones."
                size="sm"
                side="bottom"
              />
            </TabsTrigger>
            <TabsTrigger
              className="flex items-center gap-2 data-[state=active]:bg-background"
              value="accounts"
            >
              <Icons.creditCard className="size-4" />
              <span>Account Settings</span>
              <InfoTooltip
                title="Account Settings"
                description="Customize the display of your bank accounts, set nicknames, and manage account visibility."
                size="sm"
                side="bottom"
              />
            </TabsTrigger>
            <TabsTrigger
              className="flex items-center gap-2 data-[state=active]:bg-background"
              value="transactions"
            >
              <Icons.arrowLeftRight className="size-4" />
              <span>Transaction Settings</span>
              <InfoTooltip
                title="Transaction Settings"
                description="Configure how transactions are categorized, displayed, and processed in reports and analysis."
                size="sm"
                side="bottom"
              />
            </TabsTrigger>
            <TabsTrigger
              className="flex items-center gap-2 data-[state=active]:bg-background"
              value="notifications"
            >
              <Icons.alertCircle className="size-4" />
              <span>Notifications</span>
              <InfoTooltip
                title="Notification Settings"
                description="Set up alerts for balance changes, large transactions, and other account activity."
                size="sm"
                side="bottom"
              />
            </TabsTrigger>
          </TabsList>

          <TabsContent
            className="slide-in-from-bottom-2 animate-in space-y-4 duration-300 md:p-[2%]"
            value="connections"
          >
            <div className="space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-medium">
                  Bank Connections
                  <InfoTooltip
                    description="Connect to your financial institutions to automatically import transactions and account data."
                    size="sm"
                  />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Connect to your financial institutions and manage existing
                  connections
                </p>
              </div>
              <ConnectTransactionsButton
                userId={userId}
                buttonProps={{
                  variant: 'secondary',
                  size: 'sm',
                  className: cn(
                    'h-8 px-3 bg-background  text-foreground border-4 border-primary/10 gap-1 rounded-full px-2 text-xs'
                  ),
                }}
              />
            </div>
          </TabsContent>

          <TabsContent
            className="slide-in-from-bottom-2 animate-in space-y-4 duration-300 md:p-[2%]"
            value="accounts"
          >
            <div className="space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-medium">
                  Account Display Settings
                  <InfoTooltip
                    description="Customize how your bank accounts are displayed, including nicknames and grouping options."
                    size="sm"
                  />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Customize how your bank accounts are displayed and organized
                </p>
              </div>

              {/* <div className="space-y-4">
                                <div className="rounded-lg border p-4">
                                    <h4 className="mb-2 font-medium">
                                        Account Visibility
                                    </h4>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Choose which accounts to show or hide in your
                                        dashboard
                                    </p>
                                    <div className="py-4 text-center text-muted-foreground">
                                        Account visibility settings will be implemented
                                        here
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <h4 className="mb-2 font-medium">
                                        Account Nicknames
                                    </h4>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Set custom names for your accounts for easier
                                        identification
                                    </p>
                                    <div className="py-4 text-center text-muted-foreground">
                                        Account nickname settings will be implemented here
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <h4 className="mb-2 font-medium">
                                        Account Grouping
                                    </h4>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Organize accounts into custom groups
                                    </p>
                                    <div className="py-4 text-center text-muted-foreground">
                                        Account grouping settings will be implemented here
                                    </div>
                                </div>
                            </div> */}
            </div>
          </TabsContent>

          <TabsContent
            className="slide-in-from-bottom-2 animate-in space-y-4 duration-300 md:p-[2%]"
            value="transactions"
          >
            <div className="space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-medium">
                  Transaction Settings
                  <InfoTooltip
                    description="Configure how transactions are categorized and create rules for automatic processing."
                    size="sm"
                  />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Customize how transactions are categorized and displayed
                </p>
              </div>

              {/* <div className="space-y-4">
                                <div className="rounded-lg border p-4">
                                    <h4 className="mb-2 font-medium">
                                        Transaction Categories
                                    </h4>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Manage custom categories for your transactions
                                    </p>
                                    <div className="py-4 text-center text-muted-foreground">
                                        Transaction category settings will be implemented
                                        here
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <h4 className="mb-2 font-medium">Merchant Rules</h4>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Create rules for automatically categorizing
                                        transactions from specific merchants
                                    </p>
                                    <div className="py-4 text-center text-muted-foreground">
                                        Merchant rule settings will be implemented here
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <h4 className="mb-2 font-medium">
                                        Transaction Exclusions
                                    </h4>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Exclude specific transactions from budgets and
                                        reports
                                    </p>
                                    <div className="py-4 text-center text-muted-foreground">
                                        Transaction exclusion settings will be implemented
                                        here
                                    </div>
                                </div>
                            </div> */}
            </div>
          </TabsContent>

          <TabsContent
            className="slide-in-from-bottom-2 animate-in space-y-4 duration-300 md:p-[2%]"
            value="notifications"
          >
            <div className="space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-medium">
                  Notification Preferences
                  <InfoTooltip
                    description="Set up alerts for account activity including low balances, large transactions, and suspicious activity."
                    size="sm"
                  />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage how and when you receive notifications about your
                  financial accounts
                </p>
              </div>

              {/* <div className="space-y-4">
                                <div className="rounded-lg border p-4">
                                    <h4 className="mb-2 font-medium">Balance Alerts</h4>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Get notified when your account balances fall below
                                        specified thresholds
                                    </p>
                                    <div className="py-4 text-center text-muted-foreground">
                                        Balance alert settings will be implemented here
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <h4 className="mb-2 font-medium">
                                        Transaction Alerts
                                    </h4>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Receive notifications for large transactions or
                                        specific transaction types
                                    </p>
                                    <div className="py-4 text-center text-muted-foreground">
                                        Transaction alert settings will be implemented
                                        here
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <h4 className="mb-2 font-medium">
                                        Notification Delivery
                                    </h4>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Choose how you want to receive notifications
                                        (email, push, SMS)
                                    </p>
                                    <div className="py-4 text-center text-muted-foreground">
                                        Notification delivery settings will be implemented
                                        here
                                    </div>
                                </div>
                            </div> */}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
