/**
 * @fileoverview Examples of using tier limits middleware in TRPC routes
 *
 * This file contains example implementations of TRPC routes that use the
 * tier limits middleware to enforce subscription plan limits.
 */

import {
  limitedProcedure,
  resourceProcedure,
  teamLimitedProcedure,
  teamOwnerLimitedProcedure,
  teamResourceProcedure,
} from '../../middlewares/procedures'

import { LimitableResourceEnum } from '../../middlewares/tierLimitsMiddleware'
import { TRPCError } from '@trpc/server'
import { createRouter } from '../../trpc'
import { prisma } from '@solomonai/prisma/server'
import { z } from 'zod'

/**
 * Example input schema for creating a document
 */
const documentCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional().default(''),
  isTemplate: z.boolean().optional().default(false),
})

/**
 * Example input schema for creating a report
 */
const reportCreateSchema = z.object({
  type: z.enum(['PROFIT', 'REVENUE', 'BURN_RATE', 'EXPENSE']),
  from: z.date().optional(),
  to: z.date().optional(),
  currency: z.string().optional(),
})

/**
 * Example input schema for adding a team member
 */
const teamMemberAddSchema = z.object({
  teamId: z.string().min(1, 'Team ID is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['OWNER', 'MEMBER']).default('MEMBER'),
})

/**
 * Example input schema for creating a tracker project
 */
const trackerProjectSchema = z.object({
  teamId: z.string().min(1, 'Team ID is required'),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
})

/**
 * Example router that demonstrates using tier limits
 */
export const tierLimitsExampleRouter = createRouter({
  // Example 1: Simple personal document creation with tier limits
  createDocument: resourceProcedure({
    resource: LimitableResourceEnum.Documents,
    errorMessage:
      'You have reached the maximum number of documents for your current plan. Please upgrade to create more documents.',
  })
    .input(documentCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // The middleware has already verified the user can create another document

      // Create the document
      const document = await prisma.document.create({
        data: {
          title: input.title,
          content: input.content || '',
          isTemplate: input.isTemplate || false,
          user: {
            connect: {
              id: ctx.session?.userId,
            },
          },
        },
      })

      return document
    }),

  // Example 2: Check existing usage count with a custom counter function
  createReport: limitedProcedure({
    resource: LimitableResourceEnum.Reports,
    errorMessage:
      'You have reached the maximum number of reports for your current plan.',
    getCurrentCount: async ({ ctx }) => {
      // Custom counter - count reports created this month
      const userId = ctx.session?.userId
      if (!userId) return 0

      const count = await prisma.report.count({
        where: {
          createdBy: userId,
          createdAt: {
            gte: new Date(new Date().setDate(1)), // First day of current month
          },
        },
      })

      return count
    },
  })
    .input(reportCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // The middleware has already verified the user can create another report

      // Create the report
      const report = await prisma.report.create({
        data: {
          type: input.type,
          from: input.from,
          to: input.to,
          currency: input.currency,
          createdBy: ctx.session?.userId,
        },
      })

      return report
    }),

  // Example 3: Team-based limit checking for adding team members
  addTeamMember: teamResourceProcedure({
    resource: LimitableResourceEnum.TeamMembers,
    errorMessage:
      'Your team has reached the maximum number of members allowed on your current plan. Please upgrade to add more team members.',
  })
    .input(teamMemberAddSchema)
    .mutation(async ({ ctx, input }) => {
      // The middleware has already verified the team can add another member
      // and that the user has permission to access this team

      // Find the user by email
      const userToAdd = await prisma.user.findUnique({
        where: { email: input.email },
      })

      if (!userToAdd) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found with that email address',
        })
      }

      // Add the user to the team
      const teamMember = await prisma.usersOnTeam.create({
        data: {
          teamId: input.teamId,
          userId: userToAdd.id,
          role: input.role,
        },
      })

      return teamMember
    }),

  // Example 4: Team owner privileges with tier limits
  createTrackerProject: teamOwnerLimitedProcedure({
    resource: LimitableResourceEnum.TrackerProjects,
    errorMessage:
      'Your team has reached the maximum number of tracker projects for your current plan. Please upgrade to create more projects.',
  })
    .input(trackerProjectSchema)
    .mutation(async ({ ctx, input }) => {
      // The middleware has already verified:
      // 1. The user is a team owner
      // 2. The team hasn't exceeded its tracker project limits

      // Create the tracker project
      const project = await prisma.trackerProject.create({
        data: {
          name: input.name,
          description: input.description || '',
          teamId: input.teamId,
        },
      })

      return project
    }),

  // Example 5: Read operation checking against API request limits
  getAnalytics: teamLimitedProcedure({
    resource: LimitableResourceEnum.ApiRequestsPerDay,
    errorMessage:
      'You have reached your daily API request limit. Please upgrade your plan for increased API access.',
    getCurrentCount: async ({ ctx }) => {
      // Implement a counter for API requests per day
      // This would typically use a rate-limiting store like Redis

      // For example purposes, we'll just return a number
      // In a real implementation, you would track API usage properly
      return 50 // Simulated current usage
    },
  })
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      // The middleware has verified the user hasn't exceeded API request limits

      // Return analytics data
      return {
        summary: 'Analytics data would be returned here',
        dataPoints: 250,
        timestamp: new Date().toISOString(),
      }
    }),
})
