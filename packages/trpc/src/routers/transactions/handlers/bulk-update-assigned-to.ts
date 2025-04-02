import { TRPCError } from '@trpc/server'
import { bulkUpdateAssignedToSchema } from '../schema'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Updates the assignee for multiple transactions in bulk.
 * This handler verifies that all transactions belong to the authenticated user
 * before updating their assigned user.
 *
 * @param ctx - The context object containing the user's session information
 * @param input - The input object containing:
 *   - transactionIds: Array of transaction IDs to update (min: 1, max: 500)
 *   - assignedTo: ID of the user to assign transactions to, or null to remove assignment
 *   - notifyUsers: Boolean flag indicating whether to send notifications to assigned users (default: false)
 * @returns An object containing:
 *   - results: Array of results for each transaction update operation, including success status
 *   - successCount: Number of transactions successfully updated
 *   - failureCount: Number of transactions that failed to update
 * @throws {TRPCError} With code 'UNAUTHORIZED' if the user is not authenticated
 * @throws {TRPCError} With code 'BAD_REQUEST' if any transactions don't exist or don't belong to the user
 */
export const bulkUpdateAssignedToHandler = protectedProcedure
  .input(bulkUpdateAssignedToSchema)
  .mutation(async ({ ctx, input }) => {
    const { transactionIds, assignedTo, teamId, notifyAssignees } = input

    try {
      // Verify user has access to all transactions
      const existingTransactions = await prisma.transaction.findMany({
        where: {
          id: { in: transactionIds },
          userId: ctx.session?.userId,
        },
        select: { id: true },
      })

      // ensure the list of transactions is not empty
      if (existingTransactions.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No transactions found',
        })
      }

      const existingIds = existingTransactions.map((tx: { id: string }) => tx.id)
      const missingIds = transactionIds.filter(
        (id) => !existingIds.includes(id),
      )

      if (existingIds.length !== transactionIds.length) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `${missingIds.length} transaction(s) not found or unauthorized`,
          cause: { missingIds },
        })
      }

      // Verify that both users are part of the same team
      if (assignedTo && teamId && ctx.session?.userId) {
        const teamMembers = await prisma.usersOnTeam.findMany({
          where: {
            teamId: teamId,
            userId: {
              in: [ctx.session.userId, assignedTo],
            },
          },
          select: {
            userId: true,
          },
        })

        const userIds = teamMembers.map((member: { userId: string }) => member.userId)
        const isCurrentUserInTeam = userIds.includes(ctx.session.userId)
        const isAssignedUserInTeam = userIds.includes(assignedTo)

        if (!isCurrentUserInTeam || !isAssignedUserInTeam) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'One or both users are not part of the specified team',
          })
        }
      }

      // Execute all operations in a transaction for atomicity
      const now = new Date()

      return await prisma.$transaction(async (tx) => {
        // Bulk update all transactions
        const updateResult = await tx.transaction.updateMany({
          where: {
            id: { in: existingIds },
          },
          data: {
            assignedAt: assignedTo ? now : null,
            assigneeId: assignedTo,
            lastModifiedAt: now,
          },
        })

        if (updateResult.count === 0) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update transactions',
          })
        }

        // Get updated transactions with basic info for the response
        const updatedTransactions = await tx.transaction.findMany({
          where: { id: { in: existingIds } },
          select: {
            id: true,
            name: true,
            amount: true,
            date: true,
            assigneeId: true,
            assignedAt: true,
          },
        })

        // TODO: If notifyAssignees is true, queue notifications
        if (notifyAssignees && assignedTo) {
          // Implement notification logic here or queue a background job
        }

        return {
          count: updateResult.count,
          success: true,
          updatedTransactions,
          timestamp: now,
        }
      })
    } catch (error) {
      // Handle any errors that weren't explicitly caught
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('Error in bulkUpdateAssignedTo:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update transaction assignments',
        cause: error,
      })
    }
  })
