import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/registry/default/potion-ui/avatar';
import {
    Building2,
    Check,
    Loader2,
    User,
    UserCog,
    Users,
} from 'lucide-react';

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
 * allowing users to assign transactions to team members for tracking and accountability.
 */
export function AssignmentSection() {
    const { transaction, updateTransactionData } = useTransactionContext();
    const assignTransaction = useAssignTransaction();
    const [updatingAssignment, setUpdatingAssignment] = React.useState<string | null>(null);

    // Fetch team members across all teams with team information
    const { data: teamMembers, isLoading: isLoadingTeamMembers } = api.team.getMembersWithTeams.useQuery();

    // Get initials from a name
    const getInitials = (name: string) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map(n => n[0])
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

        return teamMembers.reduce((acc, member) => {
            const teamName = member.teamName || 'Other';
            if (!acc[teamName]) {
                acc[teamName] = [];
            }
            acc[teamName].push(member);
            return acc;
        }, {} as Record<string, typeof teamMembers>);
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
            tooltip={sectionDescriptions.assignment || "Team member assigned to this transaction"}
        >
            <div className="space-y-6">
                {/* Current Assignment */}
                {transaction.assigneeId && teamMembers && (
                    <div className="relative overflow-hidden bg-gradient-to-br from-violet-50/80 to-violet-50/30 backdrop-blur-sm rounded-xl p-4 border border-violet-200/50 shadow-sm">
                        <div className="absolute -top-12 -right-12 w-24 h-24 bg-violet-200/20 rounded-full blur-2xl"></div>
                        <div className="relative">
                            <p className="text-sm font-medium text-violet-700 mb-3 flex items-center">
                                <User className="h-4 w-4 mr-1.5 text-violet-600" />
                                Currently Assigned
                            </p>
                            {teamMembers.filter(member => member.id === transaction.assigneeId).map(member => (
                                <div key={member.id} className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-violet-400 shadow-md">
                                        {member.avatar ? (
                                            <AvatarImage src={member.avatar} alt={`${member.name}'s avatar`} />
                                        ) : (
                                            <AvatarFallback className="bg-violet-500 text-white">
                                                {getInitials(member.name)}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-base font-medium text-violet-900">{member.name}</span>
                                        <div className="flex items-center gap-1.5">
                                            {member.role && (
                                                <span className="text-xs text-violet-600/80">{member.role}</span>
                                            )}
                                            {member.teamName && (
                                                <>
                                                    <span className="text-xs text-violet-300">•</span>
                                                    <span className="text-xs text-violet-700/80 flex items-center">
                                                        <Building2 className="h-3 w-3 mr-0.5 inline opacity-70" />
                                                        {member.teamName}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <Badge className="ml-auto bg-violet-500/15 text-violet-700 px-2.5 py-1 border border-violet-200/50">
                                        Assigned
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Team Members Grid */}
                <div>
                    <span className="text-sm font-medium text-foreground/80 mb-4 block">
                        {transaction.assigneeId ? "Reassign to:" : "Assign to team member:"}
                    </span>

                    {isLoadingTeamMembers ? (
                        <div className="flex flex-col justify-center items-center py-12 bg-muted/20 rounded-xl border border-border/40">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground">Loading team members...</p>
                        </div>
                    ) : teamMembers && teamMembers.length > 0 ? (
                        <div className="space-y-6">
                            {teamNames.map(teamName => (
                                <div key={teamName} className="space-y-2">
                                    <div className="flex items-center">
                                        <Building2 className="h-4 w-4 mr-1.5 text-muted-foreground/70" />
                                        <h4 className="text-sm font-medium text-muted-foreground/90">{teamName}</h4>
                                        <div className="h-px flex-grow bg-border/50 ml-3"></div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {teamMembersGrouped[teamName].map((member) => (
                                            <div
                                                key={`${teamName}-${member.id}`}
                                                onClick={() => handleAssignTransaction(member.id)}
                                                className={`
                                                    relative group flex items-center p-3 gap-3 rounded-lg cursor-pointer transition-all duration-200
                                                    ${member.id === transaction.assigneeId
                                                        ? 'bg-gradient-to-br from-violet-100/80 to-violet-50/30 border-2 border-violet-400/70 shadow-md'
                                                        : 'bg-background/80 border border-border/40 hover:border-violet-200/70 hover:bg-violet-50/50 hover:shadow-sm'}
                                                    ${updatingAssignment !== null ? 'opacity-60 pointer-events-none' : ''}
                                                `}
                                            >
                                                {member.id === transaction.assigneeId && (
                                                    <div className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-violet-500 rounded-full flex items-center justify-center shadow-sm">
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
                                                                <AvatarImage src={member.avatar} alt={`${member.name}'s avatar`} />
                                                            ) : (
                                                                <AvatarFallback className={member.id === transaction.assigneeId ? 'bg-violet-500 text-white' : 'bg-muted'}>
                                                                    {getInitials(member.name)}
                                                                </AvatarFallback>
                                                            )}
                                                        </>
                                                    )}
                                                </Avatar>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="text-sm font-medium truncate">{member.name}</span>
                                                    <span className="text-xs text-muted-foreground truncate">
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
                        <div className="bg-muted/20 rounded-xl p-8 text-center border border-border/30">
                            <div className="bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserCog className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-base font-medium text-foreground/80 mb-1">No team members found</h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                Add team members in your account settings to assign transactions and track responsibilities.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </TransactionSection>
    );
} 