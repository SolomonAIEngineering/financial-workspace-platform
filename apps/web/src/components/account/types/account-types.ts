/**
 * Type definitions for the account section components
 *
 * @file Account Types
 */

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
}
