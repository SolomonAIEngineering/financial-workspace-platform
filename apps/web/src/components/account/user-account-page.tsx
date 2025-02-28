'use client';

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { AccountSection } from '@/components/account/account-section';
import { ProfileSection } from '@/components/account/profile-section';
import { Icons } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { Spinner } from '@/registry/default/potion-ui/spinner';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/registry/default/potion-ui/tabs';
import { useTRPC } from '@/trpc/react';

import { useCurrentUser } from '../auth/useCurrentUser';
import { BankConnections } from './components/bank-connections';

export function UserAccountPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const user = useCurrentUser();
  const trpc = useTRPC();

  const { data: userSettings, isLoading: isSettingsLoading } = useQuery(
    trpc.user.getSettings.queryOptions()
  );

  // Add a query to fetch the full user profile
  const { data: fullUserProfile, isLoading: isProfileLoading } = useQuery(
    trpc.user.getFullProfile.queryOptions()
  );

  // Combine user data from both sources
  const combinedUserData = {
    ...user,
    ...fullUserProfile,
    // Ensure email is always a string
    email: user.email || fullUserProfile?.email || 'Not specified',
  };

  // Adapt userSettings to match expected interface
  const formattedSettings = userSettings
    ? {
        darkMode: false,
        emailNotifications: !!userSettings.email,
        twoFactorEnabled: false,
        ...userSettings,
      }
    : undefined;

  if (isSettingsLoading || isProfileLoading || user.isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner size="lg" className="text-primary/60" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Background gradient effect */}
      <div className="absolute inset-0 -z-10 max-h-64 bg-gradient-to-b from-primary/5 to-transparent" />

      <div className="fade-in container mx-auto max-w-5xl animate-in px-4 py-12 duration-500 sm:px-6 lg:px-8">
        <PageHeader
          className="mb-10"
          description="Manage your personal profile, account preferences, and security settings."
          title="Account Settings"
        />

        <Tabs
          className="mt-8"
          defaultValue="profile"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <div className="mb-10 flex justify-center">
            <TabsList className="h-auto rounded-full border border-muted/10 bg-gradient-to-r from-background to-muted/5 p-1.5 shadow-sm">
              <TabsTrigger
                className="flex min-w-32 items-center justify-center gap-2 rounded-full px-8 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-muted/20 data-[state=active]:scale-[1.02] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                value="profile"
              >
                <Icons.user className="size-4 opacity-80" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger
                className="flex min-w-32 items-center justify-center gap-2 rounded-full px-8 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-muted/20 data-[state=active]:scale-[1.02] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                value="account"
              >
                <Icons.settings className="size-4 opacity-80" />
                <span>Account</span>
              </TabsTrigger>
              <TabsTrigger
                className="flex min-w-32 items-center justify-center gap-2 rounded-full px-8 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-muted/20 data-[state=active]:scale-[1.02] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                value="bankAccounts"
              >
                <Icons.creditCard className="size-4 opacity-80" />
                <span>Bank Accounts</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-20" />

            <TabsContent
              className="slide-in-from-right-1 animate-in space-y-8 duration-300"
              value="profile"
            >
              <ProfileSection
                user={combinedUserData as any}
                userSettings={userSettings}
              />
            </TabsContent>

            <TabsContent
              className="slide-in-from-right-1 animate-in space-y-8 duration-300"
              value="account"
            >
              <AccountSection
                user={combinedUserData as any}
                userSettings={formattedSettings as any}
              />
            </TabsContent>

            <TabsContent
              className="slide-in-from-right-1 animate-in space-y-8 duration-300"
              value="bankAccounts"
            >
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="w-full">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">
                      Bank Account Settings
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
                      </TabsTrigger>
                      <TabsTrigger
                        className="flex items-center gap-2 data-[state=active]:bg-background"
                        value="accounts"
                      >
                        <Icons.creditCard className="size-4" />
                        <span>Account Settings</span>
                      </TabsTrigger>
                      <TabsTrigger
                        className="flex items-center gap-2 data-[state=active]:bg-background"
                        value="transactions"
                      >
                        <Icons.arrowLeftRight className="size-4" />
                        <span>Transaction Settings</span>
                      </TabsTrigger>
                      <TabsTrigger
                        className="flex items-center gap-2 data-[state=active]:bg-background"
                        value="notifications"
                      >
                        <Icons.alertCircle className="size-4" />
                        <span>Notifications</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent
                      className="slide-in-from-bottom-2 animate-in space-y-4 duration-300"
                      value="connections"
                    >
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium">
                            Bank Connections
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Connect to your financial institutions and manage
                            existing connections
                          </p>
                        </div>
                        <BankConnections userId={user.id ?? ''} />
                      </div>
                    </TabsContent>

                    <TabsContent
                      className="slide-in-from-bottom-2 animate-in space-y-4 duration-300"
                      value="accounts"
                    >
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium">
                            Account Display Settings
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Customize how your bank accounts are displayed and
                            organized
                          </p>
                        </div>

                        <div className="space-y-4">
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
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent
                      className="slide-in-from-bottom-2 animate-in space-y-4 duration-300"
                      value="transactions"
                    >
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium">
                            Transaction Settings
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Customize how transactions are categorized and
                            displayed
                          </p>
                        </div>

                        <div className="space-y-4">
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
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent
                      className="slide-in-from-bottom-2 animate-in space-y-4 duration-300"
                      value="notifications"
                    >
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium">
                            Notification Preferences
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Manage how and when you receive notifications about
                            your financial accounts
                          </p>
                        </div>

                        <div className="space-y-4">
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
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
