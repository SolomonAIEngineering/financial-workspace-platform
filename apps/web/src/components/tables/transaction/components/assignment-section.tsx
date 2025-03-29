import * as React from 'react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/registry/default/potion-ui/avatar';
import { Building2, Check, Loader2, User, UserCog, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { TransactionSection } from './transaction-section';
import { api } from '@/trpc/react';
import { sectionDescriptions } from './section-descriptions';
import { toast } from 'sonner';
import { useAssignTransaction } from '@/trpc/hooks/transaction-hooks';
import { useTransactionContext } from './transaction-context';

/**
 * AssignmentSection - Component for assigning transactions to team members
 *
 * This component handles the display and editing of transaction assignments,
 * allowing users to assign transactions to team members for tracking and
 * accountability.
 */
export function AssignmentSection() {
  const { transaction, updateTransactionData } = useTransactionContext();
  const assignTransaction = useAssignTransaction();
  const [updatingAssignment, setUpdatingAssignment] = React.useState<
    string | null
  >(null);

  // Fetch team members across all teams with team information
  const { data: teamMembers, isLoading: isLoadingTeamMembers } =
    api.team.getMembersWithTeams.useQuery();

  // Get initials from a name
  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleAssignTransaction = (userId: string) => {
    if (!transaction.id) return;

    // Set updating state with user ID
    setUpdatingAssignment(userId);

    assignTransaction.mutate(
      {
        id: transaction.id,
        assignedToUserId: userId,
      },
      {
        onSuccess: () => {
          // Update the local transaction data to reflect the new assignment
          updateTransactionData({
            assigneeId: userId, // Update the assigneeId field
          });

          toast.success('Transaction assigned successfully');
          setUpdatingAssignment(null);
        },
        onError: (error) => {
          toast.error(`Failed to update assignment: ${error.message}`);
          console.error('Update assignment error:', error.message);
          setUpdatingAssignment(null);
        },
      }
    );
  };

  // Group members by team
  const teamMembersGrouped = React.useMemo(() => {
    if (!teamMembers) return {};

    return teamMembers.reduce(
      (acc, member) => {
        const teamName = member.teamName || 'Other';
        if (!acc[teamName]) {
          acc[teamName] = [];
        }
        acc[teamName].push(member);
        return acc;
      },
      {} as Record<string, typeof teamMembers>
    );
  }, [teamMembers]);

  // Sort team names to ensure consistent order
  const teamNames = React.useMemo(() => {
    return Object.keys(teamMembersGrouped).sort();
  }, [teamMembersGrouped]);

  return (
    <TransactionSection
      title="Assignment"
      icon={<Users className="h-4 w-4" />}
      defaultOpen={!!transaction.assigneeId}
      tooltip={
        sectionDescriptions.assignment ||
        'Team member assigned to this transaction'
      }
    >
      <div className="space-y-6">
        {/* Current Assignment */}
        {transaction.assigneeId && teamMembers && (
          <div className="relative overflow-hidden rounded-xl border border-violet-200/50 bg-gradient-to-br from-violet-50/80 to-violet-50/30 p-4 shadow-sm backdrop-blur-sm">
            <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-background"></div>
            <div className="relative">
              <p className="mb-3 flex items-center text-sm font-medium text-violet-700">
                <User className="mr-1.5 h-4 w-4 text-violet-600" />
                Currently Assigned
              </p>
              {teamMembers
                .filter((member) => member.id === transaction.assigneeId)
                .map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-violet-400 shadow-md">
                      {member.avatar ? (
                        <AvatarImage
                          src={member.avatar}
                          alt={`${member.name}'s avatar`}
                        />
                      ) : (
                        <AvatarFallback className="bg-violet-500 text-white">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-violet-900">
                        {member.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {member.role && (
                          <span className="text-xs text-violet-600/80">
                            {member.role}
                          </span>
                        )}
                        {member.teamName && (
                          <>
                            <span className="text-xs text-violet-300">•</span>
                            <span className="flex items-center text-xs text-violet-700/80">
                              <Building2 className="mr-0.5 inline h-3 w-3 opacity-70" />
                              {member.teamName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge className="ml-auto border border-violet-200/50 bg-background px-2.5 py-1 text-sm text-violet-700">
                      Assigned
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Team Members Grid */}
        <div>
          <span className="mb-4 block text-sm font-medium text-foreground/80">
            {transaction.assigneeId ? 'Reassign to:' : 'Assign to team member:'}
          </span>

          {isLoadingTeamMembers ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border/40 bg-muted/20 py-12">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Loading team members...
              </p>
            </div>
          ) : teamMembers && teamMembers.length > 0 ? (
            <div className="space-y-6">
              {teamNames.map((teamName) => (
                <div key={teamName} className="space-y-2">
                  <div className="flex items-center">
                    <Building2 className="mr-1.5 h-4 w-4 text-muted-foreground/70" />
                    <h4 className="text-sm font-medium text-muted-foreground/90">
                      {teamName}
                    </h4>
                    <div className="ml-3 h-px flex-grow bg-border/50"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {teamMembersGrouped[teamName].map((member) => (
                      <div
                        key={`${teamName}-${member.id}`}
                        onClick={() => handleAssignTransaction(member.id)}
                        className={`group relative flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-all duration-200 ${member.id === transaction.assigneeId
                            ? 'border-2 border-violet-400/70 bg-gradient-to-br from-violet-100/80 to-violet-50/30 shadow-md'
                            : 'border border-border/40 bg-background/80 hover:border-violet-200/70 hover:bg-violet-50/50 hover:shadow-sm'
                          } ${updatingAssignment !== null ? 'pointer-events-none opacity-60' : ''} `}
                      >
                        {member.id === transaction.assigneeId && (
                          <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 shadow-sm">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <Avatar
                          className={`h-9 w-9 transition-all duration-300 ${member.id === transaction.assigneeId
                              ? 'border-2 border-violet-400 ring-2 ring-violet-200/50'
                              : 'border border-border/30 group-hover:border-violet-200/70'
                            }`}
                        >
                          {updatingAssignment === member.id ? (
                            <AvatarFallback className="bg-violet-100">
                              <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                            </AvatarFallback>
                          ) : (
                            <>
                              {member.avatar ? (
                                <AvatarImage
                                  src={member.avatar}
                                  alt={`${member.name}'s avatar`}
                                />
                              ) : (
                                <AvatarFallback
                                  className={
                                    member.id === transaction.assigneeId
                                      ? 'bg-violet-500 text-white'
                                      : 'bg-muted'
                                  }
                                >
                                  {getInitials(member.name)}
                                </AvatarFallback>
                              )}
                            </>
                          )}
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate text-sm font-medium">
                            {member.name}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {member.role || 'Member'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border/30 bg-muted/20 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/30">
                <UserCog className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <h3 className="mb-1 text-base font-medium text-foreground/80">
                No team members found
              </h3>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                Add team members in your account settings to assign transactions
                and track responsibilities.
              </p>
            </div>
          )}
        </div>
      </div>
    </TransactionSection>
  );
}
