import { Prisma, prisma } from '@solomonai/prisma';

import { TRPCError } from '@trpc/server';
import { TransactionCategory } from '@solomonai/prisma/client';
import { createRouter } from '../trpc';
import { protectedProcedure } from '../middlewares/procedures';
import { z } from 'zod';

// Transaction filter schema
const transactionFilterSchema = z.object({
  merchant: z.string().optional(),
  category: z.nativeEnum(TransactionCategory).optional(),
  tags: z.array(z.string()).optional(),
  method: z.string().optional(),
  assignedTo: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Transaction schema
const transactionSchema = z.object({
  bankAccountId: z.string(),
  amount: z.number(),
  date: z.string().datetime(),
  name: z.string(),
  merchantName: z.string().optional(),
  description: z.string().optional(),
  pending: z.boolean().default(false),
  category: z.nativeEnum(TransactionCategory).optional(),
  paymentMethod: z.string().optional(),
  tags: z.array(z.string()).optional(),

  // Tax & Financial Information
  taxDeductible: z.boolean().optional(),
  taxExempt: z.boolean().optional(),
  taxAmount: z.number().optional(),
  taxRate: z.number().optional(),
  taxCategory: z.string().optional(),
  vatAmount: z.number().optional(),
  vatRate: z.number().optional(),

  // Additional financial flags
  excludeFromBudget: z.boolean().optional(),
  reimbursable: z.boolean().optional(),
  plannedExpense: z.boolean().optional(),
  discretionary: z.boolean().optional(),

  // Business information
  businessPurpose: z.string().optional(),
  costCenter: z.string().optional(),
  projectCode: z.string().optional(),
  cashFlowCategory: z.string().optional(),
  cashFlowType: z.string().optional(),
});

// Batch transaction schema
const batchTransactionSchema = z.object({
  transactions: z.array(transactionSchema),
});

// Transaction with ID schema
const transactionWithIdSchema = z.object({
  id: z.string(),
});

// Tag schema
const tagSchema = z.object({
  tags: z.array(z.string()),
});

// Category schema
const categorySchema = z.object({
  category: z.nativeEnum(TransactionCategory),
  subCategory: z.string().optional(),
  customCategory: z.string().optional(),
});

// Merchant schema
const merchantSchema = z.object({
  merchantName: z.string(),
  merchantId: z.string().optional(),
  merchantLogoUrl: z.string().optional(),
  merchantCategory: z.string().optional(),
});

// Status schema
const statusSchema = z.object({
  status: z.string(),
});

// Payment method schema
const paymentMethodSchema = z.object({
  paymentMethod: z.string(),
  paymentProcessor: z.string().optional(),
  cardType: z.string().optional(),
  cardLastFour: z.string().optional(),
});

// Assign schema
const assignSchema = z.object({
  assignedToUserId: z.string(),
  notifyUser: z.boolean().default(false),
});

// Notes schema
const notesSchema = z.object({
  notes: z.string(),
});

// Categorize by merchant schema
const categorizeByMerchantSchema = z.object({
  merchantName: z.string(),
  category: z.nativeEnum(TransactionCategory),
  subCategory: z.string().optional(),
  applyToFuture: z.boolean().default(false),
});

// Manual categorization schema
const manualCategorizationSchema = z.object({
  transactionIds: z.array(z.string()),
  category: z.nativeEnum(TransactionCategory),
  subCategory: z.string().optional(),
  customCategory: z.string().optional(),
});

export const transactionsRouter = createRouter({
  // Core Transaction Endpoints

  // GET /api/transactions - Retrieve transactions with filtering, sorting, and pagination
  getTransactions: protectedProcedure
    .input(transactionFilterSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, ...filters } = input;
      const skip = (page - 1) * limit;

      // Build filter conditions
      const where: Prisma.TransactionWhereInput = {
        userId: ctx.session?.userId,
      };

      if (filters.merchant) {
        where.merchantName = {
          contains: filters.merchant,
          mode: 'insensitive',
        };
      }

      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.tags && filters.tags.length > 0) {
        where.tags = { hasEvery: filters.tags };
      }

      if (filters.method) {
        where.paymentMethod = { contains: filters.method, mode: 'insensitive' };
      }

      if (filters.assignedTo) {
        where.assigneeId = filters.assignedTo;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.dateFrom || filters.dateTo) {
        where.date = {};
        if (filters.dateFrom) {
          where.date.gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          where.date.lte = new Date(filters.dateTo);
        }
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

      // Get transactions with pagination
      const transactions = await prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          bankAccount: {
            select: {
              name: true,
              plaidAccountId: true,
              type: true,
              subtype: true,
            },
          },
          transactionCategory: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          transactionTags: {
            select: {
              tag: true,
            },
          },
        },
      });

      // Get total count for pagination
      const totalCount = await prisma.transaction.count({ where });

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

  // GET /api/transactions/:id - Get a specific transaction by ID
  getTransaction: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const transaction = await prisma.transaction.findUnique({
        where: { id: input.id },
        include: {
          bankAccount: {
            select: {
              name: true,
              plaidAccountId: true,
              type: true,
              subtype: true,
            },
          },
          transactionCategory: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          transactionTags: {
            select: {
              tag: true,
            },
          },
          customAttachments: {
            select: {
              id: true,
              createdAt: true,
            },
          },
          recurringTransaction: true,
        },
      });

      if (!transaction || transaction.userId !== ctx.session?.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        });
      }

      return transaction;
    }),

  // POST /api/transactions - Create a new transaction
  createTransaction: protectedProcedure
    .input(transactionSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify bank account belongs to user
      const bankAccount = await prisma.bankAccount.findUnique({
        where: { id: input.bankAccountId },
      });

      if (!bankAccount || bankAccount.userId !== ctx.session?.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Bank account not found or unauthorized',
        });
      }

      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          ...input,
          userId: ctx.session?.userId,
          isManual: true,
          tags: input.tags || [],
        },
      });

      return transaction;
    }),

  // PUT /api/transactions/:id - Update an existing transaction
  updateTransaction: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: transactionSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      try {
        // Check if transaction exists and belongs to user
        const existingTransaction = await prisma.transaction.findUnique({
          where: { id },
          select: {
            id: true,
            userId: true,
          },
        });

        if (!existingTransaction) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Transaction not found',
          });
        }

        if (existingTransaction.userId !== ctx.session?.userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to modify this transaction',
          });
        }

        const now = new Date();
        // Execute in a transaction for atomicity
        return await prisma.$transaction(async (tx) => {
          try {
            const updatedTransaction = await tx.transaction.update({
              where: { id },
              data: {
                ...data,
                isModified: true,
                lastModifiedAt: now,
              },
            });

            return {
              ...updatedTransaction,
              updated: true,
              timestamp: now,
            };
          } catch (txError) {
            console.error(
              `[updateTransaction] Error during transaction update:`,
              txError
            );
            throw txError; // Re-throw to be caught by the outer try/catch
          }
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          console.error(`[updateTransaction] TRPC Error:`, {
            code: error.code,
            message: error.message,
          });
          throw error;
        }

        console.error(`[updateTransaction] Unexpected error for ${id}:`, {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          data: Object.keys(data),
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update transaction',
          cause: error,
        });
      }
    }),

  // DELETE /api/transactions/:id - Delete a transaction
  deleteTransaction: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if transaction exists and belongs to user
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: input.id },
      });

      if (!existingTransaction || existingTransaction.userId !== ctx.session?.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        });
      }

      // Delete transaction
      await prisma.transaction.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // POST /api/transactions/batch - Create multiple transactions in a single request
  createBatchTransactions: protectedProcedure
    .input(batchTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const { transactions } = input;

      // Extract unique bank account IDs
      const bankAccountIds = [
        ...new Set(transactions.map((t) => t.bankAccountId)),
      ];

      // Verify all bank accounts belong to user
      const bankAccounts = await prisma.bankAccount.findMany({
        where: {
          id: { in: bankAccountIds },
          userId: ctx.session?.userId,
        },
      });

      if (bankAccounts.length !== bankAccountIds.length) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'One or more bank accounts not found or unauthorized',
        });
      }

      // Create transactions
      const createdTransactions = await prisma.transaction.createMany({
        data: transactions.map((t) => ({
          ...t,
          userId: ctx.session?.userId as string,
          isManual: true,
          tags: t.tags || [],
        })),
      });

      return {
        count: createdTransactions.count,
        success: true,
      };
    }),

  // PUT /api/transactions/batch - Update multiple transactions in a single request
  updateBatchTransactions: protectedProcedure
    .input(
      z.object({
        transactions: z.array(
          z.object({
            id: z.string(),
            data: transactionSchema.partial(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { transactions } = input;
      const transactionIds = transactions.map((t) => t.id);

      // Verify all transactions belong to user
      const existingTransactions = await prisma.transaction.findMany({
        where: {
          id: { in: transactionIds },
          userId: ctx.session?.userId,
        },
      });

      if (existingTransactions.length !== transactionIds.length) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'One or more transactions not found or unauthorized',
        });
      }

      // Update transactions
      const now = new Date();
      const results = await Promise.all(
        transactions.map(async (t) => {
          try {
            const updated = await prisma.transaction.update({
              where: { id: t.id },
              data: {
                ...t.data,
                isModified: true,
                lastModifiedAt: now,
              },
            });
            return { id: t.id, success: true, data: updated };
          } catch (error) {
            return { id: t.id, success: false, error: String(error) };
          }
        })
      );

      return {
        results,
        success: results.every((r) => r.success),
        successCount: results.filter((r) => r.success).length,
        errorCount: results.filter((r) => !r.success).length,
      };
    }),

  // DELETE /api/transactions/batch - Delete multiple transactions in a single request
  deleteBatchTransactions: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { ids } = input;

      // Verify all transactions belong to user
      const existingTransactions = await prisma.transaction.findMany({
        where: {
          id: { in: ids },
          userId: ctx.session?.userId,
        },
        select: { id: true },
      });

      const existingIds = existingTransactions.map((t) => t.id);

      if (existingIds.length !== ids.length) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'One or more transactions not found or unauthorized',
        });
      }

      // Delete transactions
      const deletedTransactions = await prisma.transaction.deleteMany({
        where: {
          id: { in: existingIds },
        },
      });

      return {
        count: deletedTransactions.count,
        success: true,
      };
    }),

  // GET /api/transactions/:id/transactions - Get all transactions associated with a recurring transaction
  getAssociatedTransactions: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const transaction = await prisma.transaction.findUnique({
        where: { id: input.id },
        include: {
          recurringTransaction: true,
        },
      });

      if (!transaction || transaction.userId !== ctx.session?.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        });
      }

      const associatedTransactions = await prisma.transaction.findMany({
        where: {
          userId: ctx.session?.userId,
          recurringTransactionId: transaction.recurringTransactionId,
        },
        include: {
          bankAccount: {
            select: {
              name: true,
              plaidAccountId: true,
              type: true,
              subtype: true,
            },
          },
          transactionCategory: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          transactionTags: {
            select: {
              tag: true,
            },
          },
        },
      });

      return associatedTransactions;
    }),

  // Transaction Enhancement Endpoints

  // Search transactions with comprehensive filters
  searchTransactions: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        minAmount: z.number().optional(),
        maxAmount: z.number().optional(),
        categories: z.array(z.nativeEnum(TransactionCategory)).optional(),
        bankAccountIds: z.array(z.string()).optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.session?.userId;
        const {
          query,
          startDate,
          endDate,
          minAmount,
          maxAmount,
          categories,
          bankAccountIds,
          limit,
        } = input;

        // Build the where clause
        const where: Prisma.TransactionWhereInput = {
          userId,
        };

        // Text search
        if (query && query.trim() !== '') {
          const searchTerm = query.trim();
          where.OR = [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { merchantName: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { notes: { contains: searchTerm, mode: 'insensitive' } },
          ];
        }

        // Date filters
        if (startDate) {
          where.date = { gte: startDate };
        }
        if (endDate) {
          where.date = { lte: endDate };
        }

        // Amount filters
        if (minAmount !== undefined) {
          where.amount = { gte: minAmount };
        }
        if (maxAmount !== undefined) {
          where.amount = { lte: maxAmount };
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
        const transactions = await prisma.transaction.findMany({
          where,
          include: {
            bankAccount: {
              select: {
                name: true,
                mask: true,
                displayName: true,
              },
            },
            attachments: {
              select: {
                id: true,
                name: true,
                fileUrl: true,
                fileType: true,
              },
            },
          },
          orderBy: {
            date: 'desc',
          },
          take: limit,
        });

        return {
          transactions,
          totalCount,
        };
      } catch (error) {
        console.error('Error searching transactions:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search transactions',
        });
      }
    }),

  // POST /api/transactions/:id/tags - Associate tags with a transaction
  addTags: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        tags: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if transaction exists and belongs to user
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: input.id },
        select: { userId: true, tags: true },
      });

      if (!existingTransaction || existingTransaction.userId !== ctx.session?.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        });
      }

      // Start with existing tags
      const currentTags = existingTransaction.tags || [];
      const updatedTags = [...currentTags];

      // Process each new tag to add
      for (const tag of input.tags) {
        if (tag.trim() === '') continue; // Skip empty tags

        // Check if this tag already exists (case-insensitive)
        const isDuplicate = updatedTags.some(
          (existingTag) => existingTag.toLowerCase() === tag.toLowerCase()
        );

        // Only add if it's not a duplicate
        if (!isDuplicate) {
          updatedTags.push(tag);
        }
      }

      // Update transaction with new tags
      const updatedTransaction = await prisma.transaction.update({
        where: { id: input.id },
        data: {
          tags: updatedTags,
          lastModifiedAt: new Date(),
        },
      });

      return updatedTransaction;
    }),

  // DELETE /api/transactions/:id/tags/:tagId - Remove a tag from a transaction
  removeTag: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        tag: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if transaction exists and belongs to user
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: input.id },
        select: { userId: true, tags: true },
      });

      if (!existingTransaction || existingTransaction.userId !== ctx.session?.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        });
      }

      // Case-insensitive tag removal
      const tagToRemove = input.tag.toLowerCase();
      const updatedTags = existingTransaction.tags.filter(
        (tag) => tag.toLowerCase() !== tagToRemove
      );

      // Update transaction with new tags
      const updatedTransaction = await prisma.transaction.update({
        where: { id: input.id },
        data: {
          tags: updatedTags,
          lastModifiedAt: new Date(),
        },
      });

      return updatedTransaction;
    }),

  // PUT /api/transactions/:id/category - Update the category of a transaction
  updateCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        category: z.nativeEnum(TransactionCategory),
        subCategory: z.string().optional(),
        customCategory: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if transaction exists and belongs to user
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: input.id },
      });

      if (!existingTransaction || existingTransaction.userId !== ctx.session?.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        });
      }

      // Update transaction with new category
      const updatedTransaction = await prisma.transaction.update({
        where: { id: input.id },
        data: {
          category: input.category,
          subCategory: input.subCategory,
          customCategory: input.customCategory,
          lastCategorizedAt: new Date(),
          lastModifiedAt: new Date(),
        },
      });

      return updatedTransaction;
    }),

  // PUT /api/transactions/:id/merchant - Update the merchant details of a transaction
  updateMerchant: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        merchantName: z.string(),
        merchantId: z.string().optional(),
        merchantLogoUrl: z.string().optional(),
        merchantCategory: z.string().optional(),
        merchantWebsite: z.string().optional(),
        merchantPhone: z.string().optional(),
        merchantAddress: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if transaction exists and belongs to user
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: input.id },
      });

      if (!existingTransaction || existingTransaction.userId !== ctx.session?.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        });
      }

      // Update transaction with new merchant details
      const updatedTransaction = await prisma.transaction.update({
        where: { id: input.id },
        data: {
          merchantName: input.merchantName,
          merchantId: input.merchantId,
          merchantLogoUrl: input.merchantLogoUrl,
          merchantCategory: input.merchantCategory,
          merchantWebsite: input.merchantWebsite,
          merchantPhone: input.merchantPhone,
          merchantAddress: input.merchantAddress,
          lastModifiedAt: new Date(),
        },
      });

      return updatedTransaction;
    }),

  // PUT /api/transactions/:id/status - Update the status of a transaction
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if transaction exists and belongs to user
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: input.id },
      });

      if (!existingTransaction || existingTransaction.userId !== ctx.session?.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        });
      }

      // Update transaction with new status
      const updatedTransaction = await prisma.transaction.update({
        where: { id: input.id },
        data: {
          status: input.status,
          lastModifiedAt: new Date(),
        },
      });

      return updatedTransaction;
    }),

  // PUT /api/transactions/:id/payment-method - Update the payment method of a transaction
  updatePaymentMethod: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        paymentMethod: z.string(),
        paymentProcessor: z.string().optional(),
        paymentChannel: z.string().optional(),
        cardType: z.string().optional(),
        cardLastFour: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if transaction exists and belongs to user
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: input.id },
      });

      if (!existingTransaction || existingTransaction.userId !== ctx.session?.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        });
      }

      // Update transaction with new payment method details
      const updatedTransaction = await prisma.transaction.update({
        where: { id: input.id },
        data: {
          paymentMethod: input.paymentMethod,
          paymentProcessor: input.paymentProcessor,
          paymentChannel: input.paymentChannel,
          cardType: input.cardType,
          cardLastFour: input.cardLastFour,
          lastModifiedAt: new Date(),
        },
      });

      return updatedTransaction;
    }),

  // PUT /api/transactions/:id/assigned-to - Update who a transaction is assigned to
  updateAssignedTo: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        assignedTo: z.string().nullable(),
        teamId: z.string().optional(),
        notifyAssignee: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, assignedTo, teamId, notifyAssignee } = input;

      try {
        // Check if transaction exists and belongs to user
        const existingTransaction = await prisma.transaction.findUnique({
          where: { id },
          select: {
            id: true,
            userId: true,
            assigneeId: true,
          },
        });

        if (!existingTransaction) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Transaction not found',
          });
        }

        if (existingTransaction.userId !== ctx.session?.userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to modify this transaction',
          });
        }

        // If assigning to someone, verify they are a team member
        if (assignedTo && teamId) {
          const teamMember = await prisma.usersOnTeam.findFirst({
            where: {
              userId: assignedTo,
              teamId: teamId,
            },
          });

          if (!teamMember) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message:
                'Invalid team member: User is not part of the specified team',
            });
          }
        }

        // If nothing is changing, return early with the existing transaction
        if (existingTransaction.assigneeId === assignedTo) {
          const fullTransaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
              bankAccount: {
                select: {
                  name: true,
                  type: true,
                  subtype: true,
                },
              },
            },
          });

          return {
            ...fullTransaction,
            unchanged: true,
            message: 'No changes were needed',
          };
        }

        const now = new Date();

        // Execute in a transaction for atomicity
        return await prisma.$transaction(async (tx) => {
          // Update transaction with new assignment
          const updatedTransaction = await tx.transaction.update({
            where: { id },
            data: {
              assigneeId: assignedTo,
              assignedAt: assignedTo ? now : null,
              lastModifiedAt: now,
            },
            include: {
              bankAccount: {
                select: {
                  name: true,
                  type: true,
                  subtype: true,
                },
              },
            },
          });

          // TODO: Handle notification if needed
          if (notifyAssignee && assignedTo) {
            // Implement notification logic here or queue a background job
          }

          return {
            ...updatedTransaction,
            updated: true,
            timestamp: now,
          };
        });
      } catch (error) {
        // Handle any errors that weren't explicitly caught
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error('Error updating transaction assignment:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update transaction assignment',
          cause: error,
        });
      }
    }),

  // PUT /api/transactions/:id/notes - Add or update notes for a transaction
  updateNotes: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        notes: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if transaction exists and belongs to user
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: input.id },
      });

      if (!existingTransaction || existingTransaction.userId !== ctx.session?.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        });
      }

      // Update transaction with new notes
      const updatedTransaction = await prisma.transaction.update({
        where: { id: input.id },
        data: {
          notes: input.notes,
          lastModifiedAt: new Date(),
        },
      });

      return updatedTransaction;
    }),

  // POST /api/transactions/:id/attachments - Add attachments to a transaction
  addAttachment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        fileName: z.string(),
        fileUrl: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if transaction exists and belongs to user
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: input.id },
      });

      if (!existingTransaction || existingTransaction.userId !== ctx.session?.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        });
      }

      // Create attachment and link to transaction
      const attachment = await prisma.transactionAttachment.create({
        data: {
          transactionId: input.id,
        },
      });

      return attachment;
    }),

  // PUT /api/transactions/:id/complete - Mark a transaction as completed
  completeTransaction: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if transaction exists and belongs to user
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: input.id },
      });

      if (!existingTransaction || existingTransaction.userId !== ctx.session?.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        });
      }

      // Update transaction status to completed
      const updatedTransaction = await prisma.transaction.update({
        where: { id: input.id },
        data: {
          status: 'completed',
          pending: false,
          lastModifiedAt: new Date(),
        },
      });

      return updatedTransaction;
    }),

  // POST /api/transactions/categorize-by-merchant - Bulk categorize transactions by merchant name
  categorizeByMerchant: protectedProcedure
    .input(
      z.object({
        merchantName: z.string(),
        category: z.nativeEnum(TransactionCategory),
        subCategory: z.string().optional(),
        applyToFuture: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find all transactions by this merchant name for the user
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: ctx.session?.userId,
          merchantName: input.merchantName,
        },
        select: { id: true },
      });

      const transactionIds = transactions.map((t) => t.id);

      // Update all matching transactions with the new category
      const now = new Date();
      const result = await prisma.transaction.updateMany({
        where: {
          id: { in: transactionIds },
        },
        data: {
          category: input.category,
          subCategory: input.subCategory,
          lastCategorizedAt: now,
          lastModifiedAt: now,
        },
      });

      // TODO: If applyToFuture is true, save this categorization rule
      if (input.applyToFuture) {
        // Implement logic to save categorization rule for future transactions
      }

      return {
        success: true,
        count: result.count,
        updatedTransactions: transactionIds,
      };
    }),

  // POST /api/transactions/manual-categorization - Manually categorize multiple transactions in one request
  manualCategorization: protectedProcedure
    .input(
      z.object({
        transactionIds: z.array(z.string()),
        category: z.nativeEnum(TransactionCategory),
        subCategory: z.string().optional(),
        customCategory: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify all transactions belong to user
      const existingTransactions = await prisma.transaction.findMany({
        where: {
          id: { in: input.transactionIds },
          userId: ctx.session?.userId,
        },
        select: { id: true },
      });

      const existingIds = existingTransactions.map((t) => t.id);

      if (existingIds.length !== input.transactionIds.length) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'One or more transactions not found or unauthorized',
        });
      }

      // Update all transactions with the new category
      const now = new Date();
      const result = await prisma.transaction.updateMany({
        where: {
          id: { in: existingIds },
        },
        data: {
          category: input.category,
          subCategory: input.subCategory,
          customCategory: input.customCategory,
          lastCategorizedAt: now,
          lastModifiedAt: now,
        },
      });

      return {
        success: true,
        count: result.count,
        updatedTransactions: existingIds,
      };
    }),

  // PUT /api/transactions/:id/tags - Update the tags of a transaction
  updateTags: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        tags: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if transaction exists and belongs to user
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: input.id },
        select: {
          tags: true,
          userId: true,
        },
      });

      if (!existingTransaction) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        });
      }

      // Handle case-insensitive duplicates among input tags
      const uniqueInputTags: string[] = [];
      const lowerCaseInputTags = new Set<string>();

      // Process each input tag, keeping only the first occurrence (case-insensitive)
      for (const tag of input.tags) {
        if (tag.trim() === '') continue; // Skip empty tags

        const lowerCaseTag = tag.toLowerCase();

        // Check if this tag already exists in our input (case-insensitive)
        if (!lowerCaseInputTags.has(lowerCaseTag)) {
          uniqueInputTags.push(tag);
          lowerCaseInputTags.add(lowerCaseTag);
        }
      }

      // Get existing tags from the transaction
      const existingTags = existingTransaction.tags || [];
      const lowerCaseExistingTags = new Set(
        existingTags.map((tag) => tag.toLowerCase())
      );

      // Only add tags that don't already exist (case-insensitive)
      const tagsToAdd = uniqueInputTags.filter(
        (tag) => !lowerCaseExistingTags.has(tag.toLowerCase())
      );

      // Combine existing tags with new unique tags
      const updatedTags = [...existingTags, ...tagsToAdd];

      // Update transaction with combined tags
      const updatedTransaction = await prisma.transaction.update({
        where: { id: input.id },
        data: {
          tags: updatedTags,
          lastModifiedAt: new Date(),
        },
      });

      return updatedTransaction;
    }),

  // PUT /api/transactions/:id/assign - Assign a transaction to a specific user (DEPRECATED)
  assignTransaction: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        assignedToUserId: z.string(),
        notifyUser: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if transaction exists and belongs to user
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: input.id },
      });

      if (!existingTransaction || existingTransaction.userId !== ctx.session?.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        });
      }

      // Update transaction with assignment
      const updatedTransaction = await prisma.transaction.update({
        where: { id: input.id },
        data: {
          assigneeId: input.assignedToUserId,
          assignedAt: new Date(),
          lastModifiedAt: new Date(),
        },
      });

      // TODO: If notifyUser is true, send notification to assigned user
      if (input.notifyUser) {
        // Implement notification logic here
      }

      console.warn(
        'The assignTransaction endpoint is deprecated. Please use updateAssignedTo instead.'
      );
      return updatedTransaction;
    }),

  // Bulk update transaction tags
  bulkUpdateTags: protectedProcedure
    .input(
      z.object({
        transactionIds: z.array(z.string()),
        tags: z.array(z.string()),
        operation: z.enum(['add', 'remove', 'replace']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { transactionIds, tags, operation } = input;

      // Verify user has access to all transactions
      const existingTransactions = await prisma.transaction.findMany({
        where: {
          id: { in: transactionIds },
          userId: ctx.session?.userId,
        },
        select: { id: true, tags: true },
      });

      const existingIds = existingTransactions.map((tx) => tx.id);

      if (existingIds.length !== transactionIds.length) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'One or more transactions not found or unauthorized',
        });
      }

      // Process each transaction based on the operation
      const updates = await Promise.all(
        existingTransactions.map(async (tx) => {
          let newTags: string[] = [];

          if (operation === 'replace') {
            // First clean up the input tags (handle duplicates case-insensitively)
            newTags = [];
            for (const tag of tags) {
              if (tag.trim() === '') continue; // Skip empty tags

              // Check if this tag already exists (case-insensitive)
              const isDuplicate = newTags.some(
                (existingTag) => existingTag.toLowerCase() === tag.toLowerCase()
              );

              // Only add if it's not a duplicate
              if (!isDuplicate) {
                newTags.push(tag);
              }
            }
          } else if (operation === 'add') {
            // Add tags without duplicates (case-insensitive)
            const currentTags = (tx.tags as string[]) || [];

            newTags = [...currentTags];

            // Process each tag from the input
            for (const tag of tags) {
              if (tag.trim() === '') continue; // Skip empty tags

              // Check if this tag already exists in the current tags (case-insensitive)
              const isDuplicate = newTags.some(
                (existingTag) => existingTag.toLowerCase() === tag.toLowerCase()
              );

              // Only add if it's not a duplicate
              if (!isDuplicate) {
                newTags.push(tag);
              }
            }
          } else if (operation === 'remove') {
            // Remove specified tags (case-insensitive)
            const currentTags = (tx.tags as string[]) || [];

            // Keep tags that don't match any in the remove list (case-insensitive)
            newTags = currentTags.filter(
              (currentTag) =>
                !tags.some(
                  (tagToRemove) =>
                    tagToRemove.toLowerCase() === currentTag.toLowerCase()
                )
            );
          }

          return prisma.transaction.update({
            where: { id: tx.id },
            data: {
              tags: newTags,
              lastModifiedAt: new Date(),
            },
          });
        })
      );

      return {
        count: updates.length,
        success: true,
      };
    }),

  // Bulk update transaction assigned users
  bulkUpdateAssignedTo: protectedProcedure
    .input(
      z.object({
        transactionIds: z.array(z.string()).min(1).max(500),
        assignedTo: z.string().nullable(),
        teamId: z.string().optional(),
        notifyAssignees: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { transactionIds, assignedTo, teamId, notifyAssignees } = input;

      try {
        // Verify user has access to all transactions
        const existingTransactions = await prisma.transaction.findMany({
          where: {
            id: { in: transactionIds },
            userId: ctx.session?.userId,
          },
          select: { id: true },
        });

        const existingIds = existingTransactions.map((tx) => tx.id);
        const missingIds = transactionIds.filter(
          (id) => !existingIds.includes(id)
        );

        if (existingIds.length !== transactionIds.length) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `${missingIds.length} transaction(s) not found or unauthorized`,
            cause: { missingIds },
          });
        }

        // If assigning to someone, verify they are a team member (if team feature is implemented)
        if (assignedTo && teamId) {
          const teamMember = await prisma.usersOnTeam.findFirst({
            where: {
              userId: assignedTo,
              teamId: teamId,
            },
          });

          if (!teamMember) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message:
                'Invalid team member: User is not part of the specified team',
            });
          }
        }

        // Execute all operations in a transaction for atomicity
        const now = new Date();

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
          });

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
          });

          // TODO: If notifyAssignees is true, queue notifications
          if (notifyAssignees && assignedTo) {
            // Implement notification logic here or queue a background job
          }

          return {
            count: updateResult.count,
            success: true,
            updatedTransactions,
            timestamp: now,
          };
        });
      } catch (error) {
        // Handle any errors that weren't explicitly caught
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error('Error in bulkUpdateAssignedTo:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update transaction assignments',
          cause: error,
        });
      }
    }),
});
