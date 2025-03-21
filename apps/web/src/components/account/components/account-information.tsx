/**
 * Displays a card with essential user account information
 *
 * @file Account Information Component
 */

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDate, getAccountStatus } from '../utils/account-utils';

import type { AccountInformationProps } from '../types/account-types';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { InfoItem } from './info-item';

/**
 * Component that displays the user's account information in a card layout
 *
 * @example
 *   <AccountInformation user={userObject} />;
 *
 * @param props - Component props
 * @param props.user - User object containing account information
 * @returns A card containing formatted user account information
 * @component
 */
export function AccountInformation({ user }: AccountInformationProps) {
  // Format the user's creation date
  const createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
  const formattedDate = formatDate(createdAt);

  // Get the account status for display
  const accountStatus = getAccountStatus(user);

  return (
    <Card className="overflow-hidden rounded-xl border-4 border-muted/10 p-[2%] shadow-md transition-all duration-300 hover:shadow-lg">
      <CardHeader className="border-b border-muted/10 bg-background pb-6 text-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.user className="size-5 text-primary" />
            <CardTitle>Account Information</CardTitle>
          </div>
          <Badge
            variant={accountStatus.variant as any}
            className="fade-in animate-in rounded-full px-3 py-1 text-xs font-medium duration-500"
          >
            {accountStatus.label}
          </Badge>
        </div>
        <CardDescription className="mt-1 text-muted-foreground/90">
          View information about your account and subscription.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoItem
            value={user.username || 'Not set'}
            label="Username"
            icon={<Icons.user className="size-4 text-primary/60" />}
          />
          <InfoItem
            value={user.email}
            label="Email"
            icon={<Icons.message className="size-4 text-primary/60" />}
            verified={user.emailVerified}
          />
          <InfoItem
            value={formattedDate}
            label="Member Since"
            icon={<Icons.calendar className="size-4 text-primary/60" />}
          />
          <InfoItem
            value={user.plan || 'Personal Plan'}
            label="Account Type"
            icon={<Icons.creditCard className="size-4 text-primary/60" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}
