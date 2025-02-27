/**
 * Main component for displaying and managing user account information
 *
 * @file Account Section Component
 */

'use client';

import type { AccountSectionProps } from './types/account-types';

import { AccountInformation } from './components/account-information';
import { AccountPreferences } from './components/account-preferences';
import { DangerZone } from './components/danger-zone';
import { SubscriptionManagement } from './components/subscription-management';
import { useAccountSettings } from './hooks/use-account-settings';

/**
 * Main account section component that displays user's account information,
 * preferences, and danger zone
 *
 * @example
 *   <AccountSection user={user} userSettings={settings} />;
 *
 * @param props - Component props
 * @param props.user - User information object
 * @param props.userSettings - User preferences/settings object
 * @returns The complete account section with information, preferences, and
 *   danger zone
 * @component
 */
export function AccountSection({ user, userSettings }: AccountSectionProps) {
  // Use the custom hook to manage account settings
  const accountSettings = useAccountSettings(userSettings);

  return (
    <div className="fade-in animate-in space-y-8 duration-500">
      {/* Account Information Card */}
      <AccountInformation user={user} />

      {/* Subscription Management Card */}
      <SubscriptionManagement userId={user.id} />

      {/* Account Preferences Card */}
      <AccountPreferences
        isLoading={accountSettings.isLoading}
        isUpdating={accountSettings.isUpdating}
        updateUserSettings={accountSettings}
        user={user}
        userSettings={userSettings}
      />

      {/* Danger Zone Card */}
      <DangerZone user={user} />
    </div>
  );
}

// Declare the global timeout to avoid TypeScript errors
declare global {
  interface Window {
    savePreferencesTimeout: any;
  }
}
