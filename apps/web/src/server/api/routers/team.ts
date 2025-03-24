import { ResourceType } from '@/server/services/payment-tier';
import { TRPCError } from '@trpc/server';
import { TeamRole } from '@solomonai/prisma/client';
import { createResourceValidationMiddleware } from '../middlewares/resourceValidationMiddleware';
import { createRouter } from '../trpc';
import { prisma } from '@/server/db';
import { protectedProcedure } from '../middlewares/procedures';
import { z } from 'zod';

// Create team-specific validation middlewares
const validateTeamCreation = createResourceValidationMiddleware({
  resourceType: ResourceType.TEAM,
});

const validateTeamMemberAddition = createResourceValidationMiddleware({
  resourceType: ResourceType.TEAM_MEMBER,
  teamId: (input) => input.teamId,
});

// Define validation schemas
const teamCreateSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100),
  baseCurrency: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
  logoUrl: z.string().url('Invalid URL').optional(),
  inboxEmail: z.string().email('Invalid email').optional(),
  inboxForwarding: z.boolean().optional(),
  documentClassification: z.boolean().optional(),
  flags: z.array(z.string()).optional(),
  slug: z.string().optional(),
});

const teamUpdateSchema = teamCreateSchema.partial();

const teamIdSchema = z.object({
  id: z.string().min(1, 'Team ID is required'),
});

export const teamRouter = createRouter({
  // Create a new team
  create: protectedProcedure
    .input(teamCreateSchema)
    .use(validateTeamCreation)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      try {
        // make sure no team with the same name exists
        const existingTeam = await prisma.team.findFirst({
          where: {
            name: input.name,
          },
        });

        if (existingTeam) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Team with this name already exists',
          });
        }

        // Create the team - normalize input data
        const teamData = {
          ...input,
          // Ensure slug is not undefined by providing a default if needed
          slug:
            input.slug ||
            input.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') ||
            `team-${Date.now()}`,
          // Create the user-team relationship with OWNER role
          usersOnTeam: {
            create: {
              userId,
              role: TeamRole.OWNER,
            },
          },
          // Add the user to the team
          users: {
            connect: {
              id: userId,
            },
          },
        };

        const team = await prisma.team.create({
          data: teamData,
          include: {
            usersOnTeam: true,
          },
        });

        return team;
      } catch (error) {
        console.error('Failed to create team:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create team',
        });
      }
    }),

  // Get a team by ID
  getById: protectedProcedure
    .input(teamIdSchema)
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { id } = input;

      const team = await prisma.team.findFirst({
        where: {
          id,
          usersOnTeam: {
            some: {
              userId,
            },
          },
        },
        include: {
          usersOnTeam: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImageUrl: true,
                },
              },
            },
          },
        },
      });

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        });
      }

      return team;
    }),

  // Get the default team for the current user
  getDefaultTeam: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    const team = await prisma.team.findFirst({
      where: {
        usersOnTeam: {
          some: {
            userId,
          },
        },
        isDefault: true,
      },
    });

    return team;
  }),

  // Get all teams for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    const teams = await prisma.team.findMany({
      where: {
        usersOnTeam: {
          some: {
            userId,
          },
        },
      },
      include: {
        usersOnTeam: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImageUrl: true,
              },
            },
          },
        },
      },
    });

    return teams;
  }),

  // Update a team
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, 'Team ID is required'),
        data: teamUpdateSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { id, data } = input;

      // Check if the team exists
      const teamExists = await prisma.team.findUnique({
        where: { id },
      });

      if (!teamExists) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        });
      }

      // Check if user has permission to update the team
      const userTeam = await prisma.usersOnTeam.findFirst({
        where: {
          teamId: id,
          userId,
          role: TeamRole.OWNER, // Only admins or superadmins can update team details
        },
      });

      if (!userTeam) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this team',
        });
      }

      try {
        const updatedTeam = await prisma.team.update({
          where: { id },
          data,
          include: {
            usersOnTeam: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    profileImageUrl: true,
                  },
                },
              },
            },
          },
        });

        return updatedTeam;
      } catch (error) {
        console.error('Failed to update team:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update team',
        });
      }
    }),

  // Delete a team
  delete: protectedProcedure
    .input(teamIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { id } = input;

      // Check if the team exists
      const teamExists = await prisma.team.findUnique({
        where: { id },
      });

      if (!teamExists) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        });
      }

      // Check if user has permission to delete the team
      const userTeam = await prisma.usersOnTeam.findFirst({
        where: {
          teamId: id,
          userId,
          role: TeamRole.OWNER, // Only owners can delete teams
        },
      });

      if (!userTeam) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this team',
        });
      }

      try {
        // Delete the team
        await prisma.team.delete({
          where: { id },
        });

        return { success: true };
      } catch (error) {
        console.error('Failed to delete team:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete team',
        });
      }
    }),

  // Add a user to a team
  addUser: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        userId: z.string(),
        role: z.nativeEnum(TeamRole).optional(),
      })
    )
    .use(validateTeamMemberAddition)
    .mutation(async ({ ctx, input }) => {
      const { userId: currentUserId } = ctx;
      const { teamId, userId: newUserId, role = TeamRole.MEMBER } = input;

      try {
        // Check if the current user has permission to add a user
        const currentUserTeam = await prisma.usersOnTeam.findFirst({
          where: {
            userId: currentUserId,
            teamId,
            role: {
              in: [TeamRole.OWNER, TeamRole.MEMBER],
            },
          },
        });

        if (!currentUserTeam) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to add users to this team',
          });
        }

        // Check if the user is already a member of the team
        const existingMembership = await prisma.usersOnTeam.findFirst({
          where: {
            userId: newUserId,
            teamId,
          },
        });

        if (existingMembership) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User is already a member of this team',
          });
        }

        // Add the user to the team
        const membership = await prisma.usersOnTeam.create({
          data: {
            userId: newUserId,
            teamId,
            role,
          },
          include: {
            user: true,
            team: true,
          },
        });

        return membership;
      } catch (error) {
        console.error('Failed to add user to team:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add user to team',
        });
      }
    }),

  // Remove a user from a team
  removeUser: protectedProcedure
    .input(
      z.object({
        teamId: z.string().min(1, 'Team ID is required'),
        userId: z.string().min(1, 'User ID is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId: currentUserId } = ctx;
      const { teamId, userId: userToRemoveId } = input;

      // Check if the user exists
      const userExists = await prisma.user.findUnique({
        where: { id: userToRemoveId },
      });

      if (!userExists) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Check if the team exists
      const teamExists = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!teamExists) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        });
      }

      // Check if current user has permission to remove users from the team
      const userTeam = await prisma.usersOnTeam.findFirst({
        where: {
          teamId,
          userId: currentUserId,
          role: TeamRole.OWNER, // Only owners can remove users
        },
      });

      if (!userTeam) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to remove users from this team',
        });
      }

      // Prevent removing the last owner
      if (userToRemoveId === currentUserId) {
        const ownersCount = await prisma.usersOnTeam.count({
          where: {
            teamId,
            role: TeamRole.OWNER,
          },
        });

        if (ownersCount <= 1) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot remove the last owner from the team',
          });
        }
      }

      try {
        // Remove the user from the team
        await prisma.usersOnTeam.delete({
          where: {
            userId_teamId: {
              userId: userToRemoveId,
              teamId,
            },
          },
        });

        // Also disconnect the user from the team
        await prisma.team.update({
          where: { id: teamId },
          data: {
            users: {
              disconnect: {
                id: userToRemoveId,
              },
            },
          },
        });

        return { success: true };
      } catch (error) {
        console.error('Failed to remove user from team:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove user from team',
        });
      }
    }),

  // Update user role in a team
  updateUserRole: protectedProcedure
    .input(
      z.object({
        teamId: z.string().min(1, 'Team ID is required'),
        userId: z.string().min(1, 'User ID is required'),
        role: z.nativeEnum(TeamRole),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId: currentUserId } = ctx;
      const { teamId, userId: userToUpdateId, role } = input;

      // Check if the user exists
      const userExists = await prisma.user.findUnique({
        where: { id: userToUpdateId },
      });

      if (!userExists) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Check if current user has permission to update roles
      const userTeam = await prisma.usersOnTeam.findFirst({
        where: {
          teamId,
          userId: currentUserId,
          role: TeamRole.OWNER, // Only owners can update roles
        },
      });

      if (!userTeam) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update roles in this team',
        });
      }

      // Prevent downgrading the last owner
      if (userToUpdateId === currentUserId && role !== TeamRole.OWNER) {
        const ownersCount = await prisma.usersOnTeam.count({
          where: {
            teamId,
            role: TeamRole.OWNER,
          },
        });

        if (ownersCount <= 1) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot downgrade the last owner of the team',
          });
        }
      }

      try {
        // Update the user's role
        const updatedUserTeam = await prisma.usersOnTeam.update({
          where: {
            userId_teamId: {
              userId: userToUpdateId,
              teamId,
            },
          },
          data: {
            role,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImageUrl: true,
              },
            },
          },
        });

        return updatedUserTeam;
      } catch (error) {
        console.error('Failed to update user role:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user role',
        });
      }
    }),

  // Create a team invite
  createInvite: protectedProcedure
    .input(
      z.object({
        teamId: z.string().min(1, 'Team ID is required'),
        email: z.string().email('Invalid email'),
        role: z
          .enum([TeamRole.OWNER, TeamRole.MEMBER])
          .default(TeamRole.MEMBER),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { teamId, email, role } = input;

      // Check if the team exists
      const teamExists = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!teamExists) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        });
      }

      // Check if user has permission to create invites
      const userTeam = await prisma.usersOnTeam.findFirst({
        where: {
          teamId,
          userId,
          role: TeamRole.OWNER, // Only owners can create invites
        },
      });

      if (!userTeam) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create invites for this team',
        });
      }

      // Check if the user is already a member of the team
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingUser) {
        const existingMember = await prisma.usersOnTeam.findFirst({
          where: {
            teamId,
            userId: existingUser.id,
          },
        });

        if (existingMember) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User is already a member of this team',
          });
        }
      }

      // Check if there's already an invite for this email
      const existingInvite = await prisma.userInvite.findFirst({
        where: {
          teamId,
          email,
        },
      });

      if (existingInvite) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'An invite has already been sent to this email',
        });
      }

      try {
        // Generate a unique invite code
        const code = Math.random().toString(36).substring(2, 15);

        // Create the invite
        const invite = await prisma.userInvite.create({
          data: {
            teamId,
            email,
            code,
            invitedBy: userId,
            role,
          },
        });

        // TODO: Send an email to the invited user (implement separately)

        return invite;
      } catch (error) {
        console.error('Failed to create team invite:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create team invite',
        });
      }
    }),

  // Get all invites for a team
  getInvites: protectedProcedure
    .input(teamIdSchema)
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { id: teamId } = input;

      // Check if user has permission to view invites
      const userTeam = await prisma.usersOnTeam.findFirst({
        where: {
          teamId,
          userId,
        },
      });

      if (!userTeam) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view invites for this team',
        });
      }

      const invites = await prisma.userInvite.findMany({
        where: {
          teamId,
        },
        include: {
          inviter: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImageUrl: true,
            },
          },
        },
      });

      return invites;
    }),

  // Delete a team invite
  deleteInvite: protectedProcedure
    .input(
      z.object({
        inviteId: z.string().min(1, 'Invite ID is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { inviteId } = input;

      // Get the invite
      const invite = await prisma.userInvite.findUnique({
        where: { id: inviteId },
        include: {
          team: {
            include: {
              usersOnTeam: true,
            },
          },
        },
      });

      if (!invite) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invite not found',
        });
      }

      // Check if user has permission to delete the invite
      const userTeam = await prisma.usersOnTeam.findFirst({
        where: {
          teamId: invite.teamId!,
          userId,
          role: TeamRole.OWNER, // Only owners can delete invites
        },
      });

      if (!userTeam && invite.invitedBy !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this invite',
        });
      }

      try {
        // Delete the invite
        await prisma.userInvite.delete({
          where: { id: inviteId },
        });

        return { success: true };
      } catch (error) {
        console.error('Failed to delete team invite:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete team invite',
        });
      }
    }),

  // Accept a team invite
  acceptInvite: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1, 'Invite code is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { code } = input;

      // Get the user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Get the invite
      const invite = await prisma.userInvite.findFirst({
        where: {
          code,
          email: user.email,
        },
      });

      if (!invite || !invite.teamId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid invite code',
        });
      }

      // Check if user is already a member of the team
      const existingMember = await prisma.usersOnTeam.findFirst({
        where: {
          teamId: invite.teamId,
          userId,
        },
      });

      if (existingMember) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You are already a member of this team',
        });
      }

      try {
        // Add the user to the team
        const userOnTeam = await prisma.usersOnTeam.create({
          data: {
            teamId: invite.teamId,
            userId,
            role: invite.role || 'MEMBER',
          },
        });

        // Also connect the user to the team
        await prisma.team.update({
          where: { id: invite.teamId },
          data: {
            users: {
              connect: {
                id: userId,
              },
            },
          },
        });

        // Delete the invite
        await prisma.userInvite.delete({
          where: { id: invite.id },
        });

        return {
          success: true,
          teamId: invite.teamId,
        };
      } catch (error) {
        console.error('Failed to accept team invite:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to accept team invite',
        });
      }
    }),

  // Get team members
  getMembers: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Fetch teams the user belongs to
        const userTeams = await prisma.usersOnTeam.findMany({
          where: { userId: ctx.userId },
          select: { teamId: true },
        });

        if (!userTeams.length) {
          return [];
        }

        const teamIds = userTeams.map(team => team.teamId);

        // Get all members from the user's teams
        const teamMembers = await prisma.usersOnTeam.findMany({
          where: {
            teamId: { in: teamIds }
          },
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                email: true,
              }
            }
          }
        });

        // Transform to expected format
        return teamMembers.map(member => ({
          id: member.user.id,
          name: member.user.name || `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim() || member.user.email || 'Unknown User',
          avatar: member.user.profileImageUrl,
          role: member.role,
        }));
      } catch (error) {
        console.error('Failed to fetch team members:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch team members',
        });
      }
    }),

  // Get team members with team information
  getMembersWithTeams: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Fetch teams the user belongs to
        const userTeams = await prisma.usersOnTeam.findMany({
          where: { userId: ctx.userId },
          select: { teamId: true },
        });

        if (!userTeams.length) {
          return [];
        }

        const teamIds = userTeams.map(team => team.teamId);

        // Get all members from the user's teams - include team information
        const teamMembers = await prisma.usersOnTeam.findMany({
          where: {
            teamId: { in: teamIds }
          },
          select: {
            id: true,
            role: true,
            team: {
              select: {
                id: true,
                name: true,
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                email: true,
              }
            }
          }
        });

        // Transform to expected format with team information
        return teamMembers.map(member => ({
          id: member.user.id,
          name: member.user.name || `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim() || member.user.email || 'Unknown User',
          avatar: member.user.profileImageUrl,
          role: member.role,
          teamId: member.team.id,
          teamName: member.team.name,
        }));
      } catch (error) {
        console.error('Failed to fetch team members with teams:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch team members with teams',
        });
      }
    }),
});
