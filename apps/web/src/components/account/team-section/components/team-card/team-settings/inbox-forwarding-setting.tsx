/**
 * Team inbox forwarding setting component
 *
 * @file Team Inbox Forwarding Setting Component
 */

import { Icons } from '@/components/ui/icons';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TeamInboxForwardingProps } from '../../../types';

/**
 * Component for managing a team's email forwarding settings
 *
 * Allows team owners to enable or disable automatic email forwarding to team
 * members based on notification settings.
 *
 * @example
 *   ```tsx
 *   <TeamInboxForwardingSetting
 *     inboxForwarding={team.inboxForwarding}
 *     isOwner={isOwner}
 *     onToggleInboxForwarding={handleInboxForwardingUpdate}
 *     isUpdating={isUpdating}
 *   />
 *   ```;
 *
 * @param props - Component properties
 * @param props.inboxForwarding - Whether inbox forwarding is enabled
 * @param props.isOwner - Whether the current user is a team owner
 * @param props.onToggleInboxForwarding - Handler for toggling inbox forwarding
 * @param props.isUpdating - Whether updates are in progress
 * @returns Component for managing team inbox forwarding
 */
export function TeamInboxForwardingSetting({
  inboxForwarding,
  isOwner,
  onToggleInboxForwarding,
  isUpdating,
}: TeamInboxForwardingProps) {
  return (
    <div className="space-y-1">
      <h4 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase">
        Inbox Forwarding
        <InfoTooltip
          title="Email Forwarding"
          description="When enabled, emails sent to your team inbox will be automatically forwarded to team members based on notification settings."
          size="sm"
        />
      </h4>
      <div className="flex items-center gap-2">
        <Switch
          checked={inboxForwarding}
          onCheckedChange={onToggleInboxForwarding}
          disabled={!isOwner || isUpdating}
          id="inbox-forwarding"
        />
        <Label
          htmlFor="inbox-forwarding"
          className="cursor-pointer text-sm font-medium"
        >
          {inboxForwarding ? 'Enabled' : 'Disabled'}
        </Label>
        {isUpdating && <Icons.spinner className="ml-1 h-3 w-3 animate-spin" />}
      </div>
      <p className="text-xs text-muted-foreground">
        {inboxForwarding
          ? 'Emails will be forwarded to the inbox'
          : 'Email forwarding is disabled'}
      </p>
    </div>
  );
}
