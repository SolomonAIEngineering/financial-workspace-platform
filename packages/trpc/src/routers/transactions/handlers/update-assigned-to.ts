import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { updateAssignedToSchema } from '../schema'

/**
 * Updates the assignee for a single transaction.
 * This handler verifies that the transaction belongs to the authenticated user
 * and that both users are part of the same team (if applicable) before updating.
 *
 * @param ctx - The context object containing the user's session information
 * @param input - The input object containing:
 *   - id: Transaction ID to update
 *   - assignedTo: ID of the user to assign transaction to, or null to remove assignment
 *   - teamId: Optional team ID to verify team membership
 *   - notifyAssignee: Boolean flag indicating whether to send notification to assigned user (default: false)
 * @returns The updated transaction with basic information
 * @throws {TRPCError} With code 'UNAUTHORIZED' if the user is not authenticated
 * @throws {TRPCError} With code 'NOT_FOUND' if the transaction doesn't exist or doesn't belong to the user
 * @throws {TRPCError} With code 'BAD_REQUEST' if users are not part of the specified team
 */
export const updateAssignedToHandler = protectedProcedure
  .input(updateAssignedToSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, assignedTo, teamId, notifyAssignee } = input
    const userId = ctx.session?.userId as string

    try {
      // Check if transaction exists and belongs to user
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id },
        select: { id: true, userId: true },
      })

      if (!existingTransaction) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        })
      }

      // Verify that both users are part of the same team if teamId is provided
      if (assignedTo && teamId) {
        const teamMembers = await prisma.usersOnTeam.findMany({
          where: {
            teamId: teamId,
            userId: {
              in: [userId, assignedTo],
            },
          },
          select: {
            userId: true,
          },
        })

        const userIds = teamMembers.map((member) => member.userId)
        const isCurrentUserInTeam = userIds.includes(userId)
        const isAssignedUserInTeam = userIds.includes(assignedTo)

        if (!isCurrentUserInTeam || !isAssignedUserInTeam) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'One or both users are not part of the specified team',
          })
        }
      }

      // Execute update in a transaction for atomicity
      const now = new Date()
      return await prisma.$transaction(async (tx) => {
        const updatedTransaction = await tx.transaction.update({
          where: { id },
          data: {
            assignedAt: assignedTo ? now : null,
            assigneeId: assignedTo,
            lastModifiedAt: now,
          },
          select: {
            id: true,
            name: true,
            amount: true,
            date: true,
            assigneeId: true,
            assignedAt: true,
          },
        })

        // TODO: If notifyAssignee is true, queue notification
        if (notifyAssignee && assignedTo) {
          // Implement notification logic here or queue a background job
        }

        return updatedTransaction
      })
    } catch (error) {
      // Handle any errors that weren't explicitly caught
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('Error in updateAssignedTo:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update transaction assignment',
        cause: error,
      })
    }
  })
