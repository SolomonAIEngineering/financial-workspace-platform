/**
 * Custom hook to manage account settings state and mutations
 *
 * @file Account Settings Hook
 */

import { useEffect, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/trpc/react';

import type { UserSettings } from '../types/account-types';

import { cleanupTimeouts, createTimeoutRefs } from '../utils/account-utils';

/**
 * Custom hook for managing account settings state and mutations
 *
 * @param initialSettings - Initial user settings from the server
 * @returns Object containing state and functions for managing account settings
 */
export function useAccountSettings(initialSettings?: UserSettings) {
  // State for tracking loading and updating status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // State for settings
  const [emailNotifications, setEmailNotifications] = useState<boolean>(
    initialSettings?.emailNotifications ?? true
  );
  const [darkMode, setDarkMode] = useState<boolean>(
    initialSettings?.darkMode ?? false
  );
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(
    initialSettings?.twoFactorEnabled ?? false
  );

  // Reference to timeout IDs for cleanup
  const timeoutRefs =
    useRef<Record<string, NodeJS.Timeout | null>>(createTimeoutRefs());

  // Query client for cache management
  const queryClient = useQueryClient();

  /** Update settings mutation with success/error handlers */
  const updateSettingsMutation = api.user.updateSettings.useMutation({
    onError: (error) => {
      console.error('Failed to update user settings:', error);
      toast.error('Failed to update preferences');

      // Reset state to match server on error
      if (initialSettings) {
        setEmailNotifications(initialSettings.emailNotifications ?? true);
        setDarkMode(initialSettings.darkMode ?? false);
        setTwoFactorEnabled(initialSettings.twoFactorEnabled ?? false);
      }
    },
    onSuccess: async (data) => {
      // Update the query cache directly with the new data
      queryClient.setQueryData([['user', 'getSettings']], (oldData: any) => {
        const updatedData = { ...oldData, ...data };

        return updatedData;
      });

      // Invalidate related queries to ensure fresh data
      await queryClient.invalidateQueries({
        queryKey: [['user', 'getSettings']],
      });
      await queryClient.invalidateQueries({ queryKey: [['layout', 'app']] });
      await queryClient.invalidateQueries({
        queryKey: [['user', 'getFullProfile']],
      });

      // Update local state to match server state
      if ('emailNotifications' in data)
        setEmailNotifications(!!data.emailNotifications);
      if ('darkMode' in data) setDarkMode(!!data.darkMode);
      if ('twoFactorEnabled' in data)
        setTwoFactorEnabled(!!data.twoFactorEnabled);

      toast.success('Preferences updated successfully');
    },
  });

  /**
   * Direct save function for immediate saving of a single setting
   *
   * @param setting - The setting key to update
   * @param value - The new value for the setting
   * @returns Result of the mutation
   */
  const savePreference = async (setting: string, value: boolean) => {
    setIsUpdating(setting);

    try {
      const result = await updateSettingsMutation.mutateAsync({
        [setting]: value,
      });

      return result;
    } catch (error) {
      console.error(`Error saving ${setting}:`, error);

      throw error;
    } finally {
      setIsUpdating(null);
    }
  };

  /**
   * Handler for email notification preference changes
   *
   * @param checked - New value for email notifications
   */
  const handleEmailNotificationChange = (checked: boolean) => {
    // Clear existing timeout
    if (timeoutRefs.current.emailNotifications) {
      clearTimeout(timeoutRefs.current.emailNotifications);
      timeoutRefs.current.emailNotifications = null;
    }

    // Update UI immediately
    setEmailNotifications(checked);

    // Set new timeout for debounced save
    timeoutRefs.current.emailNotifications = setTimeout(() => {
      void savePreference('emailNotifications', checked).catch(() => {
        // If save fails, revert UI
        setEmailNotifications(!checked);
      });
    }, 500);
  };

  /**
   * Handler for dark mode preference changes
   *
   * @param checked - New value for dark mode
   */
  const handleDarkModeChange = (checked: boolean) => {
    if (timeoutRefs.current.darkMode) {
      clearTimeout(timeoutRefs.current.darkMode);
      timeoutRefs.current.darkMode = null;
    }

    setDarkMode(checked);

    timeoutRefs.current.darkMode = setTimeout(() => {
      void savePreference('darkMode', checked).catch(() => {
        setDarkMode(!checked);
      });
    }, 500);
  };

  /**
   * Handler for two-factor authentication preference changes
   *
   * @param checked - New value for two-factor authentication
   */
  const handleTwoFactorChange = (checked: boolean) => {
    if (timeoutRefs.current.twoFactorEnabled) {
      clearTimeout(timeoutRefs.current.twoFactorEnabled);
      timeoutRefs.current.twoFactorEnabled = null;
    }

    setTwoFactorEnabled(checked);

    timeoutRefs.current.twoFactorEnabled = setTimeout(() => {
      void savePreference('twoFactorEnabled', checked).catch(() => {
        setTwoFactorEnabled(!checked);
      });
    }, 500);
  };

  /**
   * Save all preferences at once
   *
   * @param isPremium - Whether the user has a premium account
   */
  const saveAllPreferences = async (isPremium?: boolean) => {
    setIsLoading(true);

    try {
      const settingsData: Partial<UserSettings> = {
        darkMode,
        emailNotifications,
        twoFactorEnabled: isPremium ? twoFactorEnabled : false,
      };

      // Type assertion to match what the API expects
      await updateSettingsMutation.mutateAsync(settingsData as any);
      toast.success('All preferences saved successfully');
    } catch (error) {
      console.error('Failed to save all preferences:', error);
      toast.error('Failed to save preferences');

      // Reset to server values on error
      if (initialSettings) {
        setEmailNotifications(initialSettings.emailNotifications ?? true);
        setDarkMode(initialSettings.darkMode ?? false);
        setTwoFactorEnabled(initialSettings.twoFactorEnabled ?? false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update local state when initialSettings changes
  useEffect(() => {
    if (initialSettings) {
      setEmailNotifications(initialSettings.emailNotifications ?? true);
      setDarkMode(initialSettings.darkMode ?? false);
      setTwoFactorEnabled(initialSettings.twoFactorEnabled ?? false);
    }
  }, [initialSettings]);

  // Clean up timeouts on unmount
  useEffect(() => {
    const timeoutRefsSnapshot = timeoutRefs.current;

    return () => {
      cleanupTimeouts(timeoutRefsSnapshot);
    };
  }, []);

  return {
    darkMode,
    emailNotifications,
    // State
    isLoading,
    isUpdating,
    saveAllPreferences,

    savePreference,
    twoFactorEnabled,
    handleDarkModeChange,
    // Functions
    handleEmailNotificationChange,
    handleTwoFactorChange,
  };
}
