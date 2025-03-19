/**
 * Type definitions for the account section components
 *
 * @file Account Types
 */

import { TeamRole } from '@/server/types/prisma';

/**
 * Props for the AccountInformation component
 *
 * @interface AccountInformationProps
 */
export interface AccountInformationProps {
  /** User information */
  user: User;
}

/**
 * Props for the AccountPreferences component
 *
 * @interface AccountPreferencesProps
 */
export interface AccountPreferencesProps {
  /** Whether settings are currently being updated */
  isLoading: boolean;
  /** The specific setting that is currently being updated */
  isUpdating: string | null;
  /** All settings state and functions from the useAccountSettings hook */
  updateUserSettings: AccountSettingsHookResult;
  /** User information */
  user: User;
  /** User preferences/settings */
  userSettings?: UserSettings;
}

/**
 * Props for the AccountSection component
 *
 * @interface AccountSectionProps
 */
export interface AccountSectionProps {
  /** User information */
  user: User;
  /** User preferences/settings */
  userSettings?: UserSettings;
}

/**
 * Props for the TeamSection component
 *
 * @interface TeamSectionProps
 */
export interface TeamSectionProps {
  /** User ID */
  userId: string;
}

/**
 * Team object containing team information
 *
 * @interface Team
 */
export interface Team {
  /** The team's ID */
  id: string;
  /** The team's name */
  name?: string;
  /** The team's email address */
  email?: string;
  /** The team's base currency */
  baseCurrency?: string;
  /** The team's logo URL */
  logoUrl?: string;
  /** The team's unique slug used in URLs */
  slug?: string;
  /** Whether inbox email forwarding is enabled for the team */
  inboxForwarding?: boolean;
  /** Array of feature flags enabled for the team */
  flags?: string[];
  /** Users that belong to the team */
  usersOnTeam?: UsersOnTeam[];
}

/**
 * User-Team relationship object
 *
 * @interface UsersOnTeam
 */
export interface UsersOnTeam {
  /** User ID */
  userId: string;
  /** Team ID */
  teamId: string;
  /** User's role in the team */
  role: TeamRole;
  /** User information */
  user?: {
    id: string;
    name?: string;
    email?: string;
    profileImageUrl?: string;
  };
}

/**
 * Result object from the useAccountSettings hook
 *
 * @interface AccountSettingsHookResult
 */
export interface AccountSettingsHookResult {
  /** Dark mode setting state */
  darkMode: boolean;
  /** Email notifications setting state */
  emailNotifications: boolean;
  /** Whether settings are being loaded/saved */
  isLoading: boolean;
  /** The specific setting being updated */
  isUpdating: string | null;
  /** Two-factor authentication setting state */
  twoFactorEnabled: boolean;
  /** Handler for dark mode changes */
  handleDarkModeChange: (checked: boolean) => void;
  /** Handler for email notification changes */
  handleEmailNotificationChange: (checked: boolean) => void;
  /** Handler for two-factor authentication changes */
  handleTwoFactorChange: (checked: boolean) => void;
  /** Save all preferences at once */
  saveAllPreferences: (isPremium?: boolean) => Promise<void>;
  /** Save a single preference */
  savePreference: (setting: string, value: boolean) => Promise<any>;
}

/**
 * Account status information
 *
 * @interface AccountStatus
 */
export interface AccountStatus {
  /** Display label for the account status */
  label: string;
  /** Visual variant for the badge */
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'warning';
}

/**
 * Props for the DangerZone component
 *
 * @interface DangerZoneProps
 */
export interface DangerZoneProps {
  /** User information */
  user: User;
}

/**
 * Props for the InfoItem component
 *
 * @interface InfoItemProps
 */
export interface InfoItemProps {
  /** Icon to display with this item */
  icon: React.ReactNode;
  /** The label for this information item */
  label: string;
  /** The value to display */
  value: string;
  /** Whether the value is verified (displays a verification badge) */
  verified?: boolean;
}

/**
 * User object containing account information
 *
 * @interface User
 */
export interface User {
  /** The user's ID */
  id: string;
  /** The user's email address */
  email: string;
  /** Date when the user account was created */
  createdAt?: Date | string;
  /** Whether the email has been verified */
  emailVerified?: boolean;
  /** Whether the user has a premium subscription */
  isPremium?: boolean;
  /** Whether the user is in a trial period */
  isTrialing?: boolean;
  /** The user's subscription plan name */
  plan?: string;
  /** The user's subscription plan name */
  subscriptionPlan?: string;
  /** Unique username for the user */
  username?: string;
  /** Teams the user belongs to */
  teams?: Team[];
  /** Primary team ID if applicable */
  teamId?: string;
}

/**
 * User preferences/settings
 *
 * @interface UserSettings
 */
export interface UserSettings {
  /** Whether dark mode is enabled */
  darkMode?: boolean;
  /** Whether to receive email notifications */
  emailNotifications?: boolean;
  /** Whether two-factor authentication is enabled */
  twoFactorEnabled?: boolean;
  /** Default team ID for the user */
  defaultTeamId?: string;
}
