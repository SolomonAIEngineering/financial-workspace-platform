/**
 * Sheet component to display all teams
 *
 * @file Team All Sheet Component
 */

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/registry/default/potion-ui/avatar';
import { CheckCircle2, Users } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/registry/default/potion-ui/sheet';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/registry/default/potion-ui/button';
import { Icons } from '@/components/ui/icons';
import { Team } from '../types';
import { getAvatarFallback } from '../utils';
import { motion } from 'framer-motion';

interface TeamAllSheetProps {
  teams: Team[] | undefined;
  selectedTeamId: string | null;
  onTeamSelect: (teamId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getUserRoleInTeam: (teamId: string) => string | null;
}

export function TeamAllSheet({
  teams,
  selectedTeamId,
  onTeamSelect,
  open,
  onOpenChange,
  getUserRoleInTeam,
}: TeamAllSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md overflow-y-auto sm:max-w-lg">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            All Teams
          </SheetTitle>
          <SheetDescription>
            View and select from all your available teams
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          {teams?.map((team) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`relative rounded-md border p-4 transition-all hover:bg-accent/40 ${
                team.id === selectedTeamId
                  ? 'border-primary/50 bg-accent/60'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {team.logoUrl ? (
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={team.logoUrl}
                        alt={`${team.name || 'Team'} logo`}
                      />
                      <AvatarFallback className="bg-primary/10 font-medium text-primary">
                        {getAvatarFallback(team.name)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Icons.user className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{team.name}</h3>
                      {getUserRoleInTeam(team.id) === 'OWNER' && (
                        <Badge
                          variant="outline"
                          className="rounded-sm px-1 py-0 text-xs"
                        >
                          Owner
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {team.usersOnTeam?.length || 0}{' '}
                      {team.usersOnTeam?.length === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                </div>

                <Button
                  variant={team.id === selectedTeamId ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    onTeamSelect(team.id);
                    onOpenChange(false);
                  }}
                  className={`min-w-24 ${team.id === selectedTeamId ? 'gap-2' : ''}`}
                >
                  {team.id === selectedTeamId ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Active
                    </>
                  ) : (
                    'Select'
                  )}
                </Button>
              </div>

              {team.id === selectedTeamId && (
                <div className="absolute top-0 right-0 h-3 w-3 translate-x-1/2 -translate-y-1/2">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75"></div>
                  <div className="absolute inset-0 rounded-full bg-primary"></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
