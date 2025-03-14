import { TRPCError } from "@trpc/server";
import { TransactionCategory } from "@prisma/client";
import { createRouter } from "../trpc";
import { prisma } from "@/server/db";
import { protectedProcedure } from "../middlewares/procedures";
import { z } from "zod";

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
            const where: any = {
                userId: ctx.userId,
            };

            if (filters.merchant) {
                where.merchantName = { contains: filters.merchant, mode: 'insensitive' };
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
                where.assignedToUserId = filters.assignedTo;
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

            if (!transaction || transaction.userId !== ctx.userId) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaction not found",
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

            if (!bankAccount || bankAccount.userId !== ctx.userId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Bank account not found or unauthorized",
                });
            }

            // Create transaction
            const transaction = await prisma.transaction.create({
                data: {
                    ...input,
                    userId: ctx.userId,
                    isManual: true,
                    tags: input.tags || [],
                },
            });

            return transaction;
        }),

    // PUT /api/transactions/:id - Update an existing transaction
    updateTransaction: protectedProcedure
        .input(z.object({
            id: z.string(),
            data: transactionSchema.partial(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if transaction exists and belongs to user
            const existingTransaction = await prisma.transaction.findUnique({
                where: { id: input.id },
            });

            if (!existingTransaction || existingTransaction.userId !== ctx.userId) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaction not found",
                });
            }

            // Update transaction
            const updatedTransaction = await prisma.transaction.update({
                where: { id: input.id },
                data: {
                    ...input.data,
                    isModified: true,
                    lastModifiedAt: new Date(),
                },
            });

            return updatedTransaction;
        }),

    // DELETE /api/transactions/:id - Delete a transaction
    deleteTransaction: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Check if transaction exists and belongs to user
            const existingTransaction = await prisma.transaction.findUnique({
                where: { id: input.id },
            });

            if (!existingTransaction || existingTransaction.userId !== ctx.userId) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaction not found",
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
            const bankAccountIds = [...new Set(transactions.map(t => t.bankAccountId))];

            // Verify all bank accounts belong to user
            const bankAccounts = await prisma.bankAccount.findMany({
                where: {
                    id: { in: bankAccountIds },
                    userId: ctx.userId,
                },
            });

            if (bankAccounts.length !== bankAccountIds.length) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "One or more bank accounts not found or unauthorized",
                });
            }

            // Create transactions
            const createdTransactions = await prisma.transaction.createMany({
                data: transactions.map(t => ({
                    ...t,
                    userId: ctx.userId,
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
        .input(z.object({
            transactions: z.array(z.object({
                id: z.string(),
                data: transactionSchema.partial(),
            })),
        }))
        .mutation(async ({ ctx, input }) => {
            const { transactions } = input;
            const transactionIds = transactions.map(t => t.id);

            // Verify all transactions belong to user
            const existingTransactions = await prisma.transaction.findMany({
                where: {
                    id: { in: transactionIds },
                    userId: ctx.userId,
                },
            });

            if (existingTransactions.length !== transactionIds.length) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "One or more transactions not found or unauthorized",
                });
            }

            // Update transactions
            const now = new Date();
            const results = await Promise.all(
                transactions.map(async t => {
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
                success: results.every(r => r.success),
                successCount: results.filter(r => r.success).length,
                errorCount: results.filter(r => !r.success).length,
            };
        }),

    // DELETE /api/transactions/batch - Delete multiple transactions in a single request
    deleteBatchTransactions: protectedProcedure
        .input(z.object({
            ids: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input }) => {
            const { ids } = input;

            // Verify all transactions belong to user
            const existingTransactions = await prisma.transaction.findMany({
                where: {
                    id: { in: ids },
                    userId: ctx.userId,
                },
                select: { id: true },
            });

            const existingIds = existingTransactions.map(t => t.id);

            if (existingIds.length !== ids.length) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "One or more transactions not found or unauthorized",
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

    // Transaction Enhancement Endpoints

    // POST /api/transactions/:id/tags - Associate tags with a transaction
    addTags: protectedProcedure
        .input(z.object({
            id: z.string(),
            tags: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if transaction exists and belongs to user
            const existingTransaction = await prisma.transaction.findUnique({
                where: { id: input.id },
                select: { userId: true, tags: true },
            });

            if (!existingTransaction || existingTransaction.userId !== ctx.userId) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaction not found",
                });
            }

            // Merge existing tags with new tags (remove duplicates)
            const updatedTags = [...new Set([...existingTransaction.tags, ...input.tags])];

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
        .input(z.object({
            id: z.string(),
            tag: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if transaction exists and belongs to user
            const existingTransaction = await prisma.transaction.findUnique({
                where: { id: input.id },
                select: { userId: true, tags: true },
            });

            if (!existingTransaction || existingTransaction.userId !== ctx.userId) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaction not found",
                });
            }

            // Remove tag from transaction
            const updatedTags = existingTransaction.tags.filter(tag => tag !== input.tag);

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
        .input(z.object({
            id: z.string(),
            category: z.nativeEnum(TransactionCategory),
            subCategory: z.string().optional(),
            customCategory: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if transaction exists and belongs to user
            const existingTransaction = await prisma.transaction.findUnique({
                where: { id: input.id },
            });

            if (!existingTransaction || existingTransaction.userId !== ctx.userId) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaction not found",
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
        .input(z.object({
            id: z.string(),
            merchantName: z.string(),
            merchantId: z.string().optional(),
            merchantLogoUrl: z.string().optional(),
            merchantCategory: z.string().optional(),
            merchantWebsite: z.string().optional(),
            merchantPhone: z.string().optional(),
            merchantAddress: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if transaction exists and belongs to user
            const existingTransaction = await prisma.transaction.findUnique({
                where: { id: input.id },
            });

            if (!existingTransaction || existingTransaction.userId !== ctx.userId) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaction not found",
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
        .input(z.object({
            id: z.string(),
            status: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if transaction exists and belongs to user
            const existingTransaction = await prisma.transaction.findUnique({
                where: { id: input.id },
            });

            if (!existingTransaction || existingTransaction.userId !== ctx.userId) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaction not found",
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
        .input(z.object({
            id: z.string(),
            paymentMethod: z.string(),
            paymentProcessor: z.string().optional(),
            paymentChannel: z.string().optional(),
            cardType: z.string().optional(),
            cardLastFour: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if transaction exists and belongs to user
            const existingTransaction = await prisma.transaction.findUnique({
                where: { id: input.id },
            });

            if (!existingTransaction || existingTransaction.userId !== ctx.userId) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaction not found",
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

    // PUT /api/transactions/:id/assign - Assign a transaction to a specific user
    assignTransaction: protectedProcedure
        .input(z.object({
            id: z.string(),
            assignedToUserId: z.string(),
            notifyUser: z.boolean().default(false),
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if transaction exists and belongs to user
            const existingTransaction = await prisma.transaction.findUnique({
                where: { id: input.id },
            });

            if (!existingTransaction || existingTransaction.userId !== ctx.userId) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaction not found",
                });
            }

            // TODO: Verify the assignedToUserId has appropriate permissions
            // This would typically involve checking team memberships or permissions

            // Update transaction with assignment
            const updatedTransaction = await prisma.transaction.update({
                where: { id: input.id },
                data: {
                    // We would need to add these fields to the Transaction model
                    // assignedToUserId: input.assignedToUserId,
                    // assignedAt: new Date(),
                    lastModifiedAt: new Date(),
                },
            });

            // TODO: If notifyUser is true, send notification to assigned user
            if (input.notifyUser) {
                // Implement notification logic here
            }

            return updatedTransaction;
        }),

    // PUT /api/transactions/:id/notes - Add or update notes for a transaction
    updateNotes: protectedProcedure
        .input(z.object({
            id: z.string(),
            notes: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if transaction exists and belongs to user
            const existingTransaction = await prisma.transaction.findUnique({
                where: { id: input.id },
            });

            if (!existingTransaction || existingTransaction.userId !== ctx.userId) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaction not found",
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
        .input(z.object({
            id: z.string(),
            fileName: z.string(),
            fileUrl: z.string(),
            fileType: z.string(),
            fileSize: z.number(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if transaction exists and belongs to user
            const existingTransaction = await prisma.transaction.findUnique({
                where: { id: input.id },
            });

            if (!existingTransaction || existingTransaction.userId !== ctx.userId) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaction not found",
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
        .input(z.object({
            id: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if transaction exists and belongs to user
            const existingTransaction = await prisma.transaction.findUnique({
                where: { id: input.id },
            });

            if (!existingTransaction || existingTransaction.userId !== ctx.userId) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Transaction not found",
                });
            }

            // Update transaction status to completed
            const updatedTransaction = await prisma.transaction.update({
                where: { id: input.id },
                data: {
                    status: "completed",
                    pending: false,
                    lastModifiedAt: new Date(),
                },
            });

            return updatedTransaction;
        }),

    // POST /api/transactions/categorize-by-merchant - Bulk categorize transactions by merchant name
    categorizeByMerchant: protectedProcedure
        .input(z.object({
            merchantName: z.string(),
            category: z.nativeEnum(TransactionCategory),
            subCategory: z.string().optional(),
            applyToFuture: z.boolean().default(false),
        }))
        .mutation(async ({ ctx, input }) => {
            // Find all transactions by this merchant name for the user
            const transactions = await prisma.transaction.findMany({
                where: {
                    userId: ctx.userId,
                    merchantName: input.merchantName,
                },
                select: { id: true },
            });

            const transactionIds = transactions.map(t => t.id);

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
        .input(z.object({
            transactionIds: z.array(z.string()),
            category: z.nativeEnum(TransactionCategory),
            subCategory: z.string().optional(),
            customCategory: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Verify all transactions belong to user
            const existingTransactions = await prisma.transaction.findMany({
                where: {
                    id: { in: input.transactionIds },
                    userId: ctx.userId,
                },
                select: { id: true },
            });

            const existingIds = existingTransactions.map(t => t.id);

            if (existingIds.length !== input.transactionIds.length) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "One or more transactions not found or unauthorized",
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
}); 