/**
 * Component for managing user account preferences and settings
 *
 * @file Account Preferences Component
 */

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/registry/default/potion-ui/tooltip';

import type { AccountPreferencesProps } from '../types/account-types';
import { Button } from '@/registry/default/potion-ui/button';
import { Icons } from '@/components/ui/icons';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@udecode/cn';

/**
 * Component for managing user preferences and settings
 *
 * @example
 *   <AccountPreferences
 *     user={userObject}
 *     userSettings={userSettingsObject}
 *     updateUserSettings={updateFn}
 *     isLoading={false}
 *     isUpdating={null}
 *   />;
 *
 * @param props - Component props
 * @param props.user - User object containing account information
 * @param props.userSettings - User preferences/settings object
 * @param props.updateUserSettings - Function to update user settings
 * @param props.isLoading - Whether settings are currently being loaded/saved
 * @param props.isUpdating - The specific setting that is currently being
 *   updated, if any
 * @returns A card containing user preference controls
 * @component
 */
export function AccountPreferences({
  isLoading,
  isUpdating,
  updateUserSettings,
  user,
  userSettings,
}: AccountPreferencesProps) {
  // Get values from the hook
  const {
    darkMode,
    emailNotifications,
    saveAllPreferences,
    twoFactorEnabled,
    handleDarkModeChange,
    handleEmailNotificationChange,
    handleTwoFactorChange,
  } = updateUserSettings;

  return (
    <Card className="overflow-hidden rounded-xl border-4 border-muted/10 p-[2%] shadow-md transition-all duration-300 hover:shadow-lg">
      <CardHeader className="border-b border-muted/10 bg-background pb-6 text-foreground">
        <div className="flex items-center gap-2">
          <Icons.settings className="size-5 text-primary" />
          <CardTitle>Preferences</CardTitle>
        </div>
        <CardDescription className="mt-1 text-muted-foreground/90">
          Customize your account preferences and application settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {/* Email Notifications Preference */}
        <div className="flex items-center justify-between rounded-xl border border-muted/20 bg-background p-4 text-foreground shadow-sm transition-all duration-200 hover:border-muted/30 hover:bg-muted/10 hover:shadow-md">
          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-foreground shadow-sm">
              <Icons.message className="size-5 text-primary" />
            </div>
            <div className="space-y-1">
              <Label
                className="text-base font-medium"
                htmlFor="email-notifications"
              >
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications about account activity.
              </p>
            </div>
          </div>
          <div className="relative">
            {isUpdating === 'emailNotifications' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Icons.spinner className="size-4 animate-spin text-primary" />
              </div>
            )}
            <div
              className={cn(isUpdating === 'emailNotifications' && 'opacity-0')}
            >
              <Switch
                id="email-notifications"
                className="transition-all duration-200 data-[state=checked]:bg-primary data-[state=checked]:shadow-sm"
                checked={emailNotifications}
                disabled={isLoading || isUpdating !== null}
                onCheckedChange={handleEmailNotificationChange}
              />
            </div>
          </div>
        </div>

        {/* Dark Mode Preference */}
        <div className="flex items-center justify-between rounded-xl border border-muted/20 bg-background p-4 text-foreground shadow-sm transition-all duration-200 hover:border-muted/30 hover:bg-muted/10 hover:shadow-md">
          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-foreground shadow-sm">
              <Icons.moon className="size-5 text-primary" />
            </div>
            <div className="space-y-1">
              <Label className="text-base font-medium" htmlFor="dark-mode">
                Dark Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Use dark theme for the application interface.
              </p>
            </div>
          </div>
          <div className="relative">
            {isUpdating === 'darkMode' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Icons.spinner className="size-4 animate-spin text-primary" />
              </div>
            )}
            <div className={cn(isUpdating === 'darkMode' && 'opacity-0')}>
              <Switch
                id="dark-mode"
                className="transition-all duration-200 data-[state=checked]:bg-primary data-[state=checked]:shadow-sm"
                checked={darkMode}
                disabled={isLoading || isUpdating !== null}
                onCheckedChange={handleDarkModeChange}
              />
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication Preference */}
        <div className="flex items-center justify-between rounded-xl border border-muted/20 bg-background p-4 text-foreground shadow-sm transition-all duration-200 hover:border-muted/30 hover:bg-muted/10 hover:shadow-md">
          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-foreground shadow-sm">
              <Icons.alertCircle className="size-5 text-primary" />
            </div>
            <div className="space-y-1">
              <Label className="text-base font-medium" htmlFor="two-factor">
                Two-Factor Authentication
              </Label>
              <p className="text-sm text-muted-foreground">
                Enhance your account security with 2FA.
              </p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  {isUpdating === 'twoFactorEnabled' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icons.spinner className="size-4 animate-spin text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      isUpdating === 'twoFactorEnabled' && 'opacity-0'
                    )}
                  >
                    <Switch
                      id="two-factor"
                      className="transition-all duration-200 data-[state=checked]:bg-primary data-[state=checked]:shadow-sm"
                      checked={twoFactorEnabled}
                      disabled={
                        !user.isPremium || isLoading || isUpdating !== null
                      }
                      onCheckedChange={handleTwoFactorChange}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              {!user.isPremium && (
                <TooltipContent className="rounded-lg border border-muted/30 bg-background p-3 shadow-md">
                  <p className="text-sm font-medium">
                    Available with Premium plan
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-muted/10 bg-background p-5 text-foreground">
        <div className="text-sm text-muted-foreground">
          {isUpdating && (
            <span className="flex items-center text-primary/80">
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Saving changes...
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            size="xs"
            variant="default"
            className="rounded-full border-4 border-foreground bg-background px-3 py-3 text-foreground shadow-sm transition-all duration-200 hover:from-primary hover:to-primary/80 hover:shadow"
            disabled={isLoading || isUpdating !== null}
            onClick={() => saveAllPreferences(user.isPremium)}
          >
            {isLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.check className="mr-2 h-4 w-4 rounded-full bg-foreground text-background" />
            )}
            Save All Preferences
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
