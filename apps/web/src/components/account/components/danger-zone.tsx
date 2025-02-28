/**
 * Component for displaying dangerous account operations like account deletion
 *
 * @file Danger Zone Component
 */

'use client';

import { DeleteAccountButton } from '@/components/settings/delete-account-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';

import type { DangerZoneProps } from '../types/account-types';

/**
 * Component displaying dangerous account operations with proper warnings
 *
 * @example
 *   <DangerZone user={userObject} />;
 *
 * @param props - Component props
 * @param props.user - User information
 * @returns A card containing account deletion options with appropriate warnings
 * @component
 */
export function DangerZone({ user }: DangerZoneProps) {
  return (
    <Card className="overflow-hidden rounded-xl border border-destructive/20 shadow-md transition-all duration-300 hover:border-destructive/40 hover:shadow-lg">
      <CardHeader className="border-b border-destructive/10 bg-gradient-to-r from-destructive/10 to-destructive/5 pb-6">
        <div className="flex items-center gap-2">
          <Icons.alertCircle className="size-5 text-destructive" />
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </div>
        <CardDescription className="mt-1 text-destructive/70">
          Permanently delete your account and all associated data.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="rounded-xl border border-destructive/20 bg-gradient-to-r from-destructive/5 to-transparent p-5 shadow-sm">
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            Once you delete your account, there is no going back. This action
            cannot be undone. All of your personal data, documents, and files
            will be permanently removed.
          </p>
          <DeleteAccountButton />
        </div>
      </CardContent>
    </Card>
  );
}
