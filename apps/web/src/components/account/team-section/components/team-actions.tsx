/**
 * Actions component for team-related actions
 *
 * @file Team Actions Component
 */

import { Button } from '@/registry/default/potion-ui/button';
import { CardFooter } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { ListBulletIcon } from '@radix-ui/react-icons';
import { TeamActionsProps } from '../types';

/**
 * Component for displaying team management action buttons
 *
 * Renders a footer with buttons for viewing all teams and creating new teams.
 *
 * @example
 *   ```tsx
 *   <TeamActions
 *     onViewAllTeams={() => router.push('/teams')}
 *     onCreateTeam={handleCreateTeam}
 *   />
 *   ```;
 *
 * @param props - Component properties
 * @param props.onViewAllTeams - Handler for viewing all teams
 * @param props.onCreateTeam - Handler for creating a new team
 * @returns Footer component with team management actions
 */
export function TeamActions({
  onViewAllTeams,
  onCreateTeam,
}: TeamActionsProps) {
  return (
    <CardFooter className="flex justify-between border-t bg-muted/10 px-6 py-4">
      <Button variant="ghost" onClick={onViewAllTeams} className="gap-2">
        <ListBulletIcon className="h-4 w-4" />
        <span>All Teams</span>
      </Button>
      <Button onClick={onCreateTeam} className="gap-2">
        <Icons.plus className="h-4 w-4" />
        <span>New Team</span>
      </Button>
    </CardFooter>
  );
}
