/**
 * Main component for displaying and managing user account information
 *
 * @file Account Section Component
 */

'use client';

import { AccountInformation } from './components/account-information';
import { AccountPreferences } from './components/account-preferences';
import type { AccountSectionProps } from './types/account-types';
import { DangerZone } from './components/danger-zone';
import { InfoTooltip } from '@/components/ui/info-tooltip';
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
      {/* Account Information Card with InfoTooltip */}
      <div className="relative">
        <AccountInformation user={user} />
        <div className="absolute top-6 right-6">
          <InfoTooltip
            title="Account Information"
            description="View your account details including signup date, verification status, and account type. This information is used for security and identity verification."
            size="default"
            side="left"
          />
        </div>
      </div>

      {/* Subscription Management Card with InfoTooltip */}
      <div className="relative">
        <SubscriptionManagement userId={user.id} />
        <div className="absolute top-6 right-6">
          <InfoTooltip
            title="Subscription Management"
            description="Manage your subscription plan, billing information, and payment methods. You can upgrade, downgrade, or cancel your subscription from here."
            size="default"
            side="left"
          />
        </div>
      </div>

      {/* Account Preferences Card with InfoTooltip */}
      <div className="relative">
        <AccountPreferences
          isLoading={accountSettings.isLoading}
          isUpdating={accountSettings.isUpdating}
          updateUserSettings={accountSettings}
          user={user}
          userSettings={userSettings}
        />
        <div className="absolute top-6 right-6">
          <InfoTooltip
            title="Account Preferences"
            description="Customize your account settings including dark mode, email notifications, and two-factor authentication for added security."
            size="default"
            side="left"
          />
        </div>
      </div>

      {/* Danger Zone Card with InfoTooltip */}
      <div className="relative">
        <DangerZone user={user} />
        <div className="absolute top-6 right-6">
          <InfoTooltip
            title="Danger Zone"
            description="Actions that permanently affect your account such as deleting your account or resetting your data. These actions cannot be undone."
            size="default"
            side="left"
            contentClassName="bg-destructive/5 border border-destructive/20"
            iconClassName="text-destructive/70 hover:text-destructive"
          />
        </div>
      </div>
    </div>
  );
}

// Declare the global timeout to avoid TypeScript errors
declare global {
  interface Window {
    savePreferencesTimeout: any;
  }
}
