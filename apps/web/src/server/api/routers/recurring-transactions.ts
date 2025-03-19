import { TransactionCategory, TransactionFrequency } from '@prisma/client';

import { TRPCError } from '@trpc/server';
import { createRouter } from '@/server/api/trpc';
import { prisma } from '@/server/db';
import { protectedProcedure } from '../middlewares/procedures';
import { z } from 'zod';

// Recurring Transaction filter schema
const recurringTransactionFilterSchema = z.object({
  title: z.string().optional(),
  merchantName: z.string().optional(),
  status: z.string().optional(),
  frequency: z.nativeEnum(TransactionFrequency).optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  bankAccountId: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Recurring Transaction schema
const recurringTransactionSchema = z.object({
  bankAccountId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  amount: z.number(),
  currency: z.string().default('USD'),
  frequency: z.nativeEnum(TransactionFrequency),
  interval: z.number().int().min(1).default(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  weekOfMonth: z.number().int().min(1).max(5).optional().or(z.literal(-1)), // -1 for last week
  monthOfYear: z.number().int().min(1).max(12).optional(),
  categorySlug: z.string().optional(),
  tags: z.array(z.string()).optional(),
  merchantName: z.string().optional(),
  status: z.string().default('active'),
  isAutomated: z.boolean().default(true),
  requiresApproval: z.boolean().default(false),
  isVariable: z.boolean().default(false),
  affectAvailableBalance: z.boolean().default(true),
  notes: z.string().optional(),
  targetAccountId: z.string().optional(), // For transfers: destination account
});

// Tag schema
const tagSchema = z.object({
  tags: z.array(z.string()),
});

// Notes schema
const notesSchema = z.object({
  notes: z.string(),
});

// Category schema
const categorySchema = z.object({
  categorySlug: z.string(),
});

// Merchant schema
const merchantSchema = z.object({
  merchantName: z.string(),
  merchantId: z.string().optional(),
});

// Assign schema
const assignSchema = z.object({
  assignedToUserId: z.string(),
  notifyUser: z.boolean().default(false),
});

// Auto-detect recurring transactions schema
const detectRecurringTransactionsSchema = z.object({
  bankAccountId: z.string().optional(),
  minConfidence: z.number().min(0).max(1).default(0.7),
  minimumOccurrences: z.number().int().min(2).default(2),
  lookbackDays: z.number().int().min(30).default(90),
});

export const recurringTransactionsRouter = createRouter({
  // Core Recurring Transaction Endpoints

  // GET /api/recurring-transactions - List all recurring transactions with filtering options
  getRecurringTransactions: protectedProcedure
    .input(recurringTransactionFilterSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, ...filters } = input;
      const skip = (page - 1) * limit;

      // Build filter conditions
      const where: any = {
        // Find recurring transactions for all bank accounts owned by this user
        bankAccount: {
          userId: ctx.userId,
        },
      };

      if (filters.title) {
        where.title = { contains: filters.title, mode: 'insensitive' };
      }

      if (filters.merchantName) {
        where.merchantName = {
          contains: filters.merchantName,
          mode: 'insensitive',
        };
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.frequency) {
        where.frequency = filters.frequency;
      }

      if (filters.bankAccountId) {
        where.bankAccountId = filters.bankAccountId;
      }

      if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
        where.amount = {};
        if (filters.minAmount !== undefined) {
          where.amount.gte = filters.minAmount;
        }
        if (filters.maxAmount !== undefined) {
          where.amount.lte = filters.maxAmount;
        }
      }

      // Get recurring transactions with pagination
      const recurringTransactions = await prisma.recurringTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nextScheduledDate: 'asc' },
        include: {
          bankAccount: {
            select: {
              name: true,
              plaidAccountId: true,
              type: true,
              subtype: true,
            },
          },
          targetAccount: {
            select: {
              name: true,
              plaidAccountId: true,
              type: true,
              subtype: true,
            },
          },
        },
      });

      // Get total count for pagination
      const totalCount = await prisma.recurringTransaction.count({ where });

      return {
        recurringTransactions,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        },
      };
    }),

  // GET /api/recurring-transactions/:id - Get a specific recurring transaction
  getRecurringTransaction: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const recurringTransaction = await prisma.recurringTransaction.findUnique(
        {
          where: { id: input.id },
          include: {
            bankAccount: {
              select: {
                id: true,
                name: true,
                plaidAccountId: true,
                type: true,
                subtype: true,
                userId: true,
              },
            },
            targetAccount: {
              select: {
                id: true,
                name: true,
                plaidAccountId: true,
                type: true,
                subtype: true,
              },
            },
            transactions: {
              orderBy: { date: 'desc' },
              take: 10,
            },
          },
        }
      );

      if (
        !recurringTransaction ||
        recurringTransaction.bankAccount.userId !== ctx.userId
      ) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recurring transaction not found',
        });
      }

      return recurringTransaction;
    }),

  // POST /api/recurring-transactions - Create a new recurring transaction
  createRecurringTransaction: protectedProcedure
    .input(recurringTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify bank account belongs to user
      const bankAccount = await prisma.bankAccount.findUnique({
        where: { id: input.bankAccountId },
      });

      if (!bankAccount || bankAccount.userId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Bank account not found or unauthorized',
        });
      }

      // If targetAccountId is provided, verify it belongs to user
      if (input.targetAccountId) {
        const targetAccount = await prisma.bankAccount.findUnique({
          where: { id: input.targetAccountId },
        });

        if (!targetAccount || targetAccount.userId !== ctx.userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Target account not found or unauthorized',
          });
        }
      }

      // Calculate next scheduled date based on frequency and start date
      const startDate = new Date(input.startDate);
      let nextScheduledDate = new Date(startDate);

      // If start date is in the past, calculate the next occurrence
      if (nextScheduledDate < new Date()) {
        const today = new Date();

        switch (input.frequency) {
          case 'WEEKLY':
            // Find next occurrence by adding weeks
            while (nextScheduledDate < today) {
              nextScheduledDate.setDate(
                nextScheduledDate.getDate() + 7 * input.interval
              );
            }
            break;
          case 'BIWEEKLY':
            // Find next occurrence by adding 2 weeks
            while (nextScheduledDate < today) {
              nextScheduledDate.setDate(
                nextScheduledDate.getDate() + 14 * input.interval
              );
            }
            break;
          case 'MONTHLY':
            // Find next occurrence by adding months
            while (nextScheduledDate < today) {
              nextScheduledDate.setMonth(
                nextScheduledDate.getMonth() + 1 * input.interval
              );
            }
            break;
          case 'SEMI_MONTHLY':
            // For semi-monthly (typically 1st and 15th), find next occurrence
            while (nextScheduledDate < today) {
              // If day is 1-14, move to 15th
              if (nextScheduledDate.getDate() < 15) {
                nextScheduledDate.setDate(15);
              }
              // If day is 15-31, move to 1st of next month
              else {
                nextScheduledDate.setMonth(nextScheduledDate.getMonth() + 1);
                nextScheduledDate.setDate(1);
              }
            }
            break;
          case 'ANNUALLY':
            // Find next occurrence by adding years
            while (nextScheduledDate < today) {
              nextScheduledDate.setFullYear(
                nextScheduledDate.getFullYear() + 1 * input.interval
              );
            }
            break;
          default:
            // For IRREGULAR or UNKNOWN, just use the next day
            nextScheduledDate = new Date();
            nextScheduledDate.setDate(nextScheduledDate.getDate() + 1);
            break;
        }
      }

      // Get current account balance to store as reference
      const initialAccountBalance = bankAccount.currentBalance;

      // Create recurring transaction
      const recurringTransaction = await prisma.recurringTransaction.create({
        data: {
          ...input,
          tags: input.tags || [],
          nextScheduledDate,
          initialAccountBalance,
          executionCount: 0,
          totalExecuted: 0,
        },
      });

      // If affectAvailableBalance is true, update bank account scheduled flows
      if (input.affectAvailableBalance) {
        // For outgoing transactions (negative amount), update scheduled outflows
        if (input.amount < 0) {
          await prisma.bankAccount.update({
            where: { id: input.bankAccountId },
            data: {
              scheduledOutflows: {
                increment: Math.abs(input.amount),
              },
            },
          });
        }
        // For incoming transactions (positive amount), update scheduled inflows
        else if (input.amount > 0) {
          await prisma.bankAccount.update({
            where: { id: input.bankAccountId },
            data: {
              scheduledInflows: {
                increment: input.amount,
              },
            },
          });
        }
      }

      return recurringTransaction;
    }),

  // PUT /api/recurring-transactions/:id - Update a recurring transaction
  updateRecurringTransaction: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: recurringTransactionSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch the recurring transaction with its bank account to check ownership
      const existingRecurringTransaction =
        await prisma.recurringTransaction.findUnique({
          where: { id: input.id },
          include: {
            bankAccount: {
              select: {
                userId: true,
                currentBalance: true,
              },
            },
          },
        });

      if (
        !existingRecurringTransaction ||
        existingRecurringTransaction.bankAccount.userId !== ctx.userId
      ) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recurring transaction not found',
        });
      }

      // If updating bank account, verify new account belongs to user
      if (input.data.bankAccountId) {
        const bankAccount = await prisma.bankAccount.findUnique({
          where: { id: input.data.bankAccountId },
        });

        if (!bankAccount || bankAccount.userId !== ctx.userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Bank account not found or unauthorized',
          });
        }
      }

      // If updating targetAccountId, verify it belongs to user
      if (input.data.targetAccountId) {
        const targetAccount = await prisma.bankAccount.findUnique({
          where: { id: input.data.targetAccountId },
        });

        if (!targetAccount || targetAccount.userId !== ctx.userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Target account not found or unauthorized',
          });
        }
      }

      // If amount is changed and affectAvailableBalance is true, update bank account scheduled flows
      if (
        input.data.amount !== undefined &&
        existingRecurringTransaction.affectAvailableBalance
      ) {
        const oldAmount = existingRecurringTransaction.amount;
        const newAmount = input.data.amount;

        // If both old and new amounts are outflows (negative)
        if (oldAmount < 0 && newAmount < 0) {
          const difference = Math.abs(newAmount) - Math.abs(oldAmount);

          // If new outflow is larger, increment scheduled outflows
          if (difference > 0) {
            await prisma.bankAccount.update({
              where: { id: existingRecurringTransaction.bankAccountId },
              data: {
                scheduledOutflows: {
                  increment: difference,
                },
              },
            });
          }
          // If new outflow is smaller, decrement scheduled outflows
          else if (difference < 0) {
            await prisma.bankAccount.update({
              where: { id: existingRecurringTransaction.bankAccountId },
              data: {
                scheduledOutflows: {
                  decrement: Math.abs(difference),
                },
              },
            });
          }
        }
        // If both old and new amounts are inflows (positive)
        else if (oldAmount > 0 && newAmount > 0) {
          const difference = newAmount - oldAmount;

          // If new inflow is larger, increment scheduled inflows
          if (difference > 0) {
            await prisma.bankAccount.update({
              where: { id: existingRecurringTransaction.bankAccountId },
              data: {
                scheduledInflows: {
                  increment: difference,
                },
              },
            });
          }
          // If new inflow is smaller, decrement scheduled inflows
          else if (difference < 0) {
            await prisma.bankAccount.update({
              where: { id: existingRecurringTransaction.bankAccountId },
              data: {
                scheduledInflows: {
                  decrement: Math.abs(difference),
                },
              },
            });
          }
        }
        // If changing from outflow to inflow
        else if (oldAmount < 0 && newAmount > 0) {
          await prisma.bankAccount.update({
            where: { id: existingRecurringTransaction.bankAccountId },
            data: {
              scheduledOutflows: {
                decrement: Math.abs(oldAmount),
              },
              scheduledInflows: {
                increment: newAmount,
              },
            },
          });
        }
        // If changing from inflow to outflow
        else if (oldAmount > 0 && newAmount < 0) {
          await prisma.bankAccount.update({
            where: { id: existingRecurringTransaction.bankAccountId },
            data: {
              scheduledInflows: {
                decrement: oldAmount,
              },
              scheduledOutflows: {
                increment: Math.abs(newAmount),
              },
            },
          });
        }
      }

      // If frequency or dates are changed, recalculate the next scheduled date
      let nextScheduledDate = existingRecurringTransaction.nextScheduledDate;

      if (
        input.data.frequency ||
        input.data.startDate ||
        input.data.interval ||
        input.data.dayOfMonth ||
        input.data.dayOfWeek
      ) {
        const frequency =
          input.data.frequency || existingRecurringTransaction.frequency;
        const interval =
          input.data.interval || existingRecurringTransaction.interval;
        const startDate = input.data.startDate
          ? new Date(input.data.startDate)
          : existingRecurringTransaction.startDate;

        // Create a new date to calculate from
        nextScheduledDate = new Date(startDate);
        const today = new Date();

        // Calculate next occurrence based on frequency
        if (nextScheduledDate < today) {
          switch (frequency) {
            case 'WEEKLY':
              while (nextScheduledDate < today) {
                nextScheduledDate.setDate(
                  nextScheduledDate.getDate() + 7 * interval
                );
              }
              break;
            case 'BIWEEKLY':
              while (nextScheduledDate < today) {
                nextScheduledDate.setDate(
                  nextScheduledDate.getDate() + 14 * interval
                );
              }
              break;
            case 'MONTHLY':
              while (nextScheduledDate < today) {
                nextScheduledDate.setMonth(
                  nextScheduledDate.getMonth() + interval
                );
              }
              break;
            case 'SEMI_MONTHLY':
              while (nextScheduledDate < today) {
                if (nextScheduledDate.getDate() < 15) {
                  nextScheduledDate.setDate(15);
                } else {
                  nextScheduledDate.setMonth(nextScheduledDate.getMonth() + 1);
                  nextScheduledDate.setDate(1);
                }
              }
              break;
            case 'ANNUALLY':
              while (nextScheduledDate < today) {
                nextScheduledDate.setFullYear(
                  nextScheduledDate.getFullYear() + interval
                );
              }
              break;
            default:
              nextScheduledDate = new Date();
              nextScheduledDate.setDate(nextScheduledDate.getDate() + 1);
              break;
          }
        }
      }

      // Update the recurring transaction
      const updatedRecurringTransaction =
        await prisma.recurringTransaction.update({
          where: { id: input.id },
          data: {
            ...input.data,
            nextScheduledDate,
            lastModifiedBy: ctx.userId,
          },
        });

      return updatedRecurringTransaction;
    }),

  // DELETE /api/recurring-transactions/:id - Delete a recurring transaction
  deleteRecurringTransaction: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Fetch the recurring transaction with its bank account to check ownership
      const existingRecurringTransaction =
        await prisma.recurringTransaction.findUnique({
          where: { id: input.id },
          include: {
            bankAccount: {
              select: {
                userId: true,
                id: true,
              },
            },
          },
        });

      if (
        !existingRecurringTransaction ||
        existingRecurringTransaction.bankAccount.userId !== ctx.userId
      ) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recurring transaction not found',
        });
      }

      // If this recurring transaction affects available balance, update bank account scheduled flows
      if (existingRecurringTransaction.affectAvailableBalance) {
        if (existingRecurringTransaction.amount < 0) {
          // If outflow (negative amount), decrease scheduled outflows
          await prisma.bankAccount.update({
            where: { id: existingRecurringTransaction.bankAccountId },
            data: {
              scheduledOutflows: {
                decrement: Math.abs(existingRecurringTransaction.amount),
              },
            },
          });
        } else if (existingRecurringTransaction.amount > 0) {
          // If inflow (positive amount), decrease scheduled inflows
          await prisma.bankAccount.update({
            where: { id: existingRecurringTransaction.bankAccountId },
            data: {
              scheduledInflows: {
                decrement: existingRecurringTransaction.amount,
              },
            },
          });
        }
      }

      // Delete the recurring transaction
      await prisma.recurringTransaction.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // GET /api/recurring-transactions/:id/transactions - Get all transactions associated with a recurring transaction
  getAssociatedTransactions: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      // Fetch the recurring transaction to check ownership
      const recurringTransaction = await prisma.recurringTransaction.findUnique(
        {
          where: { id: input.id },
          include: {
            bankAccount: {
              select: {
                userId: true,
              },
            },
          },
        }
      );

      if (
        !recurringTransaction ||
        recurringTransaction.bankAccount.userId !== ctx.userId
      ) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recurring transaction not found',
        });
      }

      const { page, limit } = input;
      const skip = (page - 1) * limit;

      // Get associated transactions with pagination
      const transactions = await prisma.transaction.findMany({
        where: {
          recurringTransactionId: input.id,
        },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          transactionCategory: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });

      // Get total count for pagination
      const totalCount = await prisma.transaction.count({
        where: {
          recurringTransactionId: input.id,
        },
      });

      return {
        transactions,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        },
      };
    }),

  // Recurring Transaction Management Endpoints

  // POST /api/recurring-transactions/:id/tags - Associate tags with a recurring transaction
  addTags: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        tags: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch the recurring transaction to check ownership
      const recurringTransaction = await prisma.recurringTransaction.findUnique(
        {
          where: { id: input.id },
          include: {
            bankAccount: {
              select: {
                userId: true,
              },
            },
          },
        }
      );

      if (
        !recurringTransaction ||
        recurringTransaction.bankAccount.userId !== ctx.userId
      ) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recurring transaction not found',
        });
      }

      // Merge existing tags with new tags (remove duplicates)
      const updatedTags = [
        ...new Set([...recurringTransaction.tags, ...input.tags]),
      ];

      // Update recurring transaction with new tags
      const updatedRecurringTransaction =
        await prisma.recurringTransaction.update({
          where: { id: input.id },
          data: {
            tags: updatedTags,
            lastModifiedBy: ctx.userId,
          },
        });

      return updatedRecurringTransaction;
    }),

  // PUT /api/recurring-transactions/:id/notes - Add or update notes for a recurring transaction
  updateNotes: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        notes: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch the recurring transaction to check ownership
      const recurringTransaction = await prisma.recurringTransaction.findUnique(
        {
          where: { id: input.id },
          include: {
            bankAccount: {
              select: {
                userId: true,
              },
            },
          },
        }
      );

      if (
        !recurringTransaction ||
        recurringTransaction.bankAccount.userId !== ctx.userId
      ) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recurring transaction not found',
        });
      }

      // Update recurring transaction with notes
      const updatedRecurringTransaction =
        await prisma.recurringTransaction.update({
          where: { id: input.id },
          data: {
            notes: input.notes,
            lastModifiedBy: ctx.userId,
          },
        });

      return updatedRecurringTransaction;
    }),

  // PUT /api/recurring-transactions/:id/category - Update the category of a recurring transaction
  updateCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        categorySlug: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch the recurring transaction to check ownership
      const recurringTransaction = await prisma.recurringTransaction.findUnique(
        {
          where: { id: input.id },
          include: {
            bankAccount: {
              select: {
                userId: true,
              },
            },
          },
        }
      );

      if (
        !recurringTransaction ||
        recurringTransaction.bankAccount.userId !== ctx.userId
      ) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recurring transaction not found',
        });
      }

      // Verify the category exists
      const category = await prisma.customTransactionCategory.findUnique({
        where: { id: input.categorySlug },
      });

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      // Update recurring transaction with new category
      const updatedRecurringTransaction =
        await prisma.recurringTransaction.update({
          where: { id: input.id },
          data: {
            categorySlug: input.categorySlug,
            lastModifiedBy: ctx.userId,
          },
        });

      return updatedRecurringTransaction;
    }),

  // PUT /api/recurring-transactions/:id/merchant - Update the merchant details of a recurring transaction
  updateMerchant: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        merchantName: z.string(),
        merchantId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch the recurring transaction to check ownership
      const recurringTransaction = await prisma.recurringTransaction.findUnique(
        {
          where: { id: input.id },
          include: {
            bankAccount: {
              select: {
                userId: true,
              },
            },
          },
        }
      );

      if (
        !recurringTransaction ||
        recurringTransaction.bankAccount.userId !== ctx.userId
      ) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recurring transaction not found',
        });
      }

      // Update recurring transaction with new merchant details
      const updatedRecurringTransaction =
        await prisma.recurringTransaction.update({
          where: { id: input.id },
          data: {
            merchantName: input.merchantName,
            merchantId: input.merchantId,
            lastModifiedBy: ctx.userId,
          },
        });

      return updatedRecurringTransaction;
    }),

  // PUT /api/recurring-transactions/:id/assign - Assign a recurring transaction to a specific user
  assignRecurringTransaction: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        assignedToUserId: z.string(),
        notifyUser: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch the recurring transaction to check ownership
      const recurringTransaction = await prisma.recurringTransaction.findUnique(
        {
          where: { id: input.id },
          include: {
            bankAccount: {
              select: {
                userId: true,
              },
            },
          },
        }
      );

      if (
        !recurringTransaction ||
        recurringTransaction.bankAccount.userId !== ctx.userId
      ) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recurring transaction not found',
        });
      }

      // TODO: Verify the assignedToUserId has appropriate permissions
      // This would typically involve checking team memberships or permissions

      // Update recurring transaction with assignment
      // Note: We would need to add assignedToUserId field to the RecurringTransaction model
      const updatedRecurringTransaction =
        await prisma.recurringTransaction.update({
          where: { id: input.id },
          data: {
            // assignedToUserId: input.assignedToUserId,
            lastModifiedBy: ctx.userId,
          },
        });

      // TODO: If notifyUser is true, send notification to assigned user
      if (input.notifyUser) {
        // Implement notification logic here
      }

      return updatedRecurringTransaction;
    }),

  // POST /api/recurring-transactions/detect - Auto-detect recurring transactions from existing transactions
  detectRecurringTransactions: protectedProcedure
    .input(detectRecurringTransactionsSchema)
    .mutation(async ({ ctx, input }) => {
      const { bankAccountId, minConfidence, minimumOccurrences, lookbackDays } =
        input;

      // Build where condition for transactions
      const where: any = {
        userId: ctx.userId,
      };

      if (bankAccountId) {
        where.bankAccountId = bankAccountId;
      }

      // Set lookback date
      const lookbackDate = new Date();
      lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);
      where.date = { gte: lookbackDate };

      // Get all transactions in the lookback period
      const transactions = await prisma.transaction.findMany({
        where,
        orderBy: { date: 'asc' },
        select: {
          id: true,
          amount: true,
          date: true,
          name: true,
          merchantName: true,
          bankAccountId: true,
          isRecurring: true,
        },
      });

      // Simplified algorithm to detect recurring patterns
      // Group transactions by merchantName (or name if no merchantName)
      const groupedByMerchant: Record<string, any[]> = {};

      transactions.forEach((transaction) => {
        const key = transaction.merchantName || transaction.name;
        if (!groupedByMerchant[key]) {
          groupedByMerchant[key] = [];
        }
        groupedByMerchant[key].push(transaction);
      });

      // Process each merchant group to detect patterns
      const detectedRecurringTransactions: any[] = [];

      for (const [merchantName, merchantTransactions] of Object.entries(
        groupedByMerchant
      )) {
        // Skip if not enough transactions
        if (merchantTransactions.length < minimumOccurrences) {
          continue;
        }

        // Sort by date
        merchantTransactions.sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        );

        // Simple pattern detection - check if transactions occur at regular intervals
        const intervals: number[] = [];
        for (let i = 1; i < merchantTransactions.length; i++) {
          const dayDiff = Math.round(
            (merchantTransactions[i].date.getTime() -
              merchantTransactions[i - 1].date.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          intervals.push(dayDiff);
        }

        // Calculate average interval and its consistency (standard deviation)
        const avgInterval =
          intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance =
          intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) /
          intervals.length;
        const stdDev = Math.sqrt(variance);

        // Determine frequency based on average interval
        let frequency: TransactionFrequency;
        let interval = 1;

        if (avgInterval >= 25 && avgInterval <= 35) {
          frequency = 'MONTHLY';
        } else if (avgInterval >= 13 && avgInterval <= 15) {
          frequency = 'SEMI_MONTHLY';
        } else if (avgInterval >= 12 && avgInterval <= 16) {
          frequency = 'BIWEEKLY';
        } else if (avgInterval >= 6 && avgInterval <= 8) {
          frequency = 'WEEKLY';
        } else if (avgInterval >= 350 && avgInterval <= 380) {
          frequency = 'ANNUALLY';
        } else {
          // If interval doesn't match common patterns, use a frequency that's closest
          if (avgInterval > 90) {
            frequency = 'ANNUALLY';
            interval = Math.round(avgInterval / 365);
          } else if (avgInterval > 21) {
            frequency = 'MONTHLY';
            interval = Math.round(avgInterval / 30);
          } else if (avgInterval > 10) {
            frequency = 'BIWEEKLY';
            interval = Math.round(avgInterval / 14);
          } else {
            frequency = 'WEEKLY';
            interval = Math.round(avgInterval / 7);
          }
        }

        // Calculate confidence score based on consistency of intervals
        // Lower standard deviation means higher confidence
        const maxAllowedStdDev = avgInterval * 0.3; // Allow up to 30% deviation
        const confidenceScore = Math.max(
          0,
          Math.min(1, 1 - stdDev / maxAllowedStdDev)
        );

        // Skip if confidence score is too low
        if (confidenceScore < minConfidence) {
          continue;
        }

        // Check if amounts are consistent
        const amounts = merchantTransactions.map((t) => t.amount);
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const amountVariance =
          amounts.reduce((a, b) => a + Math.pow(b - avgAmount, 2), 0) /
          amounts.length;
        const amountStdDev = Math.sqrt(amountVariance);
        const isVariableAmount = amountStdDev / Math.abs(avgAmount) > 0.05; // 5% threshold

        // Calculate next scheduled date based on detected pattern
        const lastTransactionDate = merchantTransactions.at(-1)?.date;
        if (!lastTransactionDate) continue;
        const nextScheduledDate = new Date(lastTransactionDate);

        switch (frequency) {
          case 'WEEKLY':
            nextScheduledDate.setDate(
              nextScheduledDate.getDate() + 7 * interval
            );
            break;
          case 'BIWEEKLY':
            nextScheduledDate.setDate(
              nextScheduledDate.getDate() + 14 * interval
            );
            break;
          case 'MONTHLY':
            nextScheduledDate.setMonth(nextScheduledDate.getMonth() + interval);
            break;
          case 'SEMI_MONTHLY':
            if (nextScheduledDate.getDate() < 15) {
              nextScheduledDate.setDate(15);
            } else {
              nextScheduledDate.setMonth(nextScheduledDate.getMonth() + 1);
              nextScheduledDate.setDate(1);
            }
            break;
          case 'ANNUALLY':
            nextScheduledDate.setFullYear(
              nextScheduledDate.getFullYear() + interval
            );
            break;
          default:
            nextScheduledDate.setMonth(nextScheduledDate.getMonth() + 1);
            break;
        }

        // Get dayOfMonth or dayOfWeek
        let dayOfMonth: number | null = null;
        let dayOfWeek: number | null = null;

        if (
          frequency === 'MONTHLY' ||
          frequency === 'SEMI_MONTHLY' ||
          frequency === 'ANNUALLY'
        ) {
          dayOfMonth = lastTransactionDate.getDate();
        } else if (frequency === 'WEEKLY' || frequency === 'BIWEEKLY') {
          dayOfWeek = lastTransactionDate.getDay();
        }

        // Create recurring transaction suggestion
        detectedRecurringTransactions.push({
          bankAccountId: merchantTransactions[0].bankAccountId,
          title: merchantName,
          description: `Auto-detected recurring transaction for ${merchantName}`,
          amount: avgAmount,
          currency: 'USD', // Default, could be customized based on user preference
          frequency,
          interval,
          startDate: merchantTransactions[0].date,
          nextScheduledDate,
          dayOfMonth,
          dayOfWeek,
          merchantName,
          isVariable: isVariableAmount,
          confidenceScore,
          source: 'detected',
          transactionIds: merchantTransactions.map((t) => t.id),
        });
      }

      return {
        detectedRecurringTransactions,
        count: detectedRecurringTransactions.length,
      };
    }),

  // Search recurring transactions with comprehensive filters
  searchRecurringTransactions: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
        minAmount: z.number().optional(),
        maxAmount: z.number().optional(),
        categories: z.array(z.nativeEnum(TransactionCategory)).optional(),
        bankAccountIds: z.array(z.string()).optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { userId } = ctx;
        const {
          query,
          minAmount,
          maxAmount,
          categories,
          bankAccountIds,
          limit,
        } = input;

        // Build the where clause
        const where: any = {
          userId,
          isRecurring: true,
        };

        // Text search
        if (query && query.trim() !== '') {
          const searchTerm = query.trim();
          where.OR = [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { merchantName: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ];
        }

        // Amount filters
        if (minAmount !== undefined) {
          where.amount = { ...where.amount, gte: minAmount };
        }
        if (maxAmount !== undefined) {
          where.amount = { ...where.amount, lte: maxAmount };
        }

        // Categories filter
        if (categories && categories.length > 0) {
          where.category = { in: categories };
        }

        // Filter by specific bank accounts
        if (bankAccountIds && bankAccountIds.length > 0) {
          where.bankAccountId = { in: bankAccountIds };
        }

        // Get total count for pagination
        const totalCount = await prisma.transaction.count({ where });

        // Execute the search
        const recurringTransactions = await prisma.transaction.findMany({
          where,
          include: {
            bankAccount: {
              select: {
                name: true,
                mask: true,
                displayName: true,
              },
            },
          },
          orderBy: {
            date: 'desc',
          },
          take: limit,
        });

        return {
          recurringTransactions,
          totalCount,
        };
      } catch (error) {
        console.error('Error searching recurring transactions:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search recurring transactions',
        });
      }
    }),
});
