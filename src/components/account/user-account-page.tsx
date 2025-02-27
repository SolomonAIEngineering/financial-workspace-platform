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
          </div>
        </Tabs>
      </div>
    </div>
  );
}
