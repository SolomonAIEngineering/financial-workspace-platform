/**
 * Empty state component for when user has no teams
 *
 * @file Empty Team State Component
 */

import { Button } from '@/registry/default/potion-ui/button';
import { EmptyTeamStateProps } from '../types';
import { Icons } from '@/components/ui/icons';
import { motion } from 'framer-motion';

/**
 * Component displayed when a user has no teams
 *
 * Shows a friendly empty state with a call-to-action button to create a new
 * team.
 *
 * @example
 *   ```tsx
 *   <EmptyTeamState onCreateTeam={handleCreateTeam} />
 *   ```;
 *
 * @param props - Component properties
 * @param props.onCreateTeam - Handler for team creation action
 * @returns Empty state component with create team CTA
 */
export function EmptyTeamState({ onCreateTeam }: EmptyTeamStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed bg-muted/40 px-10 py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="rounded-full bg-primary/10 p-5">
        <Icons.user className="h-10 w-10 text-primary" />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-semibold">No Teams Yet</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Create a team to collaborate with others and manage your
          organization's financial data.
        </p>
      </div>
      <Button onClick={onCreateTeam} className="mt-2">
        <Icons.plus className="mr-2 h-4 w-4" />
        Create Your First Team
      </Button>
    </motion.div>
  );
}
