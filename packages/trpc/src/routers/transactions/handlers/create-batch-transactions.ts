import { batchResultSchema, createBatchTransactionsSchema } from '../schema'

import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Creates multiple transactions in batches to optimize database performance.
 * This handler verifies that all specified bank accounts belong to the authenticated user
 * before creating transactions in configurable batch sizes.
 *
 * @param ctx - The context object containing the user's session information
 * @param input - The input object containing:
 *   - transactions: Array of transaction objects conforming to the transactionSchema
 *   - batchSize: Optional number of transactions to process in each batch (default: 50)
 * @returns A batch result object containing:
 *   - transactions: Array of successfully created transaction entities
 *   - status: Overall status ('SUCCESS' or 'PARTIAL_SUCCESS')
 *   - totalProcessed: Number of transactions successfully created
 *   - totalRequested: Total number of transactions requested for creation
 *   - failedBatches: Array of objects describing failed batches (if any)
 * @throws {TRPCError} With code 'UNAUTHORIZED' if the user is not authenticated
 * @throws {TRPCError} With code 'BAD_REQUEST' if any bank accounts don't exist or don't belong to the user
 * @throws {TRPCError} With code 'INTERNAL_SERVER_ERROR' if all transaction batches fail to process
 */
export const createBatchTransactionsHandler = protectedProcedure
  .input(createBatchTransactionsSchema)
  .output(batchResultSchema)
  .mutation(async ({ ctx, input }) => {
    // since this is a protected procedure, we can safely assume the user is authenticated
    const userId = ctx.session?.userId as string

    // Get all unique bank account IDs from input
    const bankAccountIds = [
      ...new Set(input.transactions.map((tx) => tx.bankAccountId)),
    ]

    // Ensure all bank accounts exist and belong to the user
    const bankAccounts = await prisma.bankAccount.findMany({
      where: {
        id: { in: bankAccountIds },
        userId,
      },
    })

    if (bankAccounts.length !== bankAccountIds.length) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'One or more bank accounts not found or not owned by user',
      })
    }

    // Process transactions in smaller batches to prevent DB overload
    const BATCH_SIZE = input.batchSize || 50 // Use provided batch size or default to 50
    const allTransactions = input.transactions
    const totalTransactions = allTransactions.length
    const createdTransactions = []
    const failedBatches = []

    // Process transactions in batches
    for (let i = 0; i < totalTransactions; i += BATCH_SIZE) {
      const batchIndex = Math.floor(i / BATCH_SIZE)
      const batchTransactions = allTransactions.slice(i, i + BATCH_SIZE)

      try {
        // Create this batch of transactions in a transaction
        const batchResults = await prisma.$transaction(
          batchTransactions.map((tx) =>
            prisma.transaction.create({
              data: {
                ...tx,
                userId,
                date: new Date(tx.date),
              },
            }),
          ),
        )

        createdTransactions.push(...batchResults)
        console.info(
          `Successfully processed batch ${batchIndex + 1} (${batchResults.length} transactions)`,
        )
      } catch (error) {
        // Log the error and continue with next batch
        console.error(`Error processing batch ${batchIndex + 1}:`, error)
        failedBatches.push({
          batchIndex,
          startIndex: i,
          endIndex: Math.min(i + BATCH_SIZE - 1, totalTransactions - 1),
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // If all batches failed, throw an error
    if (createdTransactions.length === 0 && failedBatches.length > 0) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `All transaction batches failed to process. First error: ${failedBatches[0].error}`,
      })
    }

    return {
      transactions: createdTransactions,
      status: failedBatches.length > 0 ? 'PARTIAL_SUCCESS' : 'SUCCESS',
      totalProcessed: createdTransactions.length,
      totalRequested: totalTransactions,
      failedBatches: failedBatches.length > 0 ? failedBatches : undefined,
    }
  })
