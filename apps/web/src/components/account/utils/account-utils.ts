/**
 * Helper functions for account-related components
 *
 * @file Account Utilities
 */

import type { AccountStatus, User } from '../types/account-types';

/**
 * Formats a date into a readable string
 *
 * @example
 *   // Returns "January 1, 2023"
 *   formatDate(new Date('2023-01-01'));
 *
 * @param date - Date to format
 * @returns Formatted date string in the format "Month Day, Year"
 */
export function formatDate(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  return dateObj.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Determines the account status based on the user's subscription
 *
 * @example
 *   // Returns { label: 'Premium', variant: 'default' }
 *   getAccountStatus({ isPremium: true });
 *
 * @param user - User object containing subscription information
 * @returns Account status object with label and UI variant
 */
export function getAccountStatus(user: User): AccountStatus {
  if (user.isPremium) return { label: 'Premium', variant: 'default' };
  if (user.isTrialing) return { label: 'Trial', variant: 'warning' };

  return { label: 'Free', variant: 'secondary' };
}

/**
 * Creates a record to store timeouts with initial null values
 *
 * @returns Record with initialized timeout values set to null
 */
export function createTimeoutRefs(): Record<string, NodeJS.Timeout | null> {
  return {
    darkMode: null,
    emailNotifications: null,
    twoFactorEnabled: null,
  };
}

/**
 * Cleans up all timeout references
 *
 * @param timeoutRefs - Record containing timeout references
 */
export function cleanupTimeouts(
  timeoutRefs: Record<string, NodeJS.Timeout | null>
): void {
  Object.values(timeoutRefs).forEach((timeout) => {
    if (timeout) clearTimeout(timeout);
  });
}
