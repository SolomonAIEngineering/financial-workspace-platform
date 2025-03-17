import { ResourceType, resourceValidator } from '@/server/services/payment-tier';

import { TRPCError } from '@trpc/server';
import { t } from '../trpc';

/**
 * Creates a middleware for validating resource limits based on user's subscription tier
 * 
 * @param resourceType The type of resource being validated
 * @returns A middleware function that validates the resource operation
 */
export const createResourceValidationMiddleware = (options: {
    resourceType: ResourceType;
    getSize?: (input: any) => number;  // For file/storage validations
    teamId?: (input: any) => string | undefined; // For team-based resources
}) => {
    return t.middleware(async ({ ctx, input, next }) => {
        if (!ctx.userId) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'You must be logged in to perform this action',
            });
        }

        // Based on resource type, call the appropriate validator
        try {
            switch (options.resourceType) {
                case ResourceType.BANK_ACCOUNT:
                    await resourceValidator.validateBankAccountCreation(ctx.userId);
                    break;
                case ResourceType.DOCUMENT:
                    await resourceValidator.validateDocumentCreation(ctx.userId);
                    break;
                case ResourceType.FILE:
                    if (options.getSize && typeof input === 'object') {
                        const fileSize = options.getSize(input);
                        await resourceValidator.validateFileUpload(ctx.userId, fileSize);
                    } else {
                        throw new TRPCError({
                            code: 'BAD_REQUEST',
                            message: 'Invalid file size for validation'
                        });
                    }
                    break;
                case ResourceType.INVOICE:
                    await resourceValidator.validateInvoiceCreation(ctx.userId);
                    break;
                case ResourceType.REPORT:
                    await resourceValidator.validateReportCreation(ctx.userId);
                    break;
                case ResourceType.STORAGE:
                    if (options.getSize && typeof input === 'object') {
                        const storageSize = options.getSize(input);
                        await resourceValidator.validateStorageUsage(ctx.userId, storageSize);
                    } else {
                        await resourceValidator.validateStorageUsage(ctx.userId);
                    }
                    break;
                case ResourceType.TEAM:
                    await resourceValidator.validateTeamCreation(ctx.userId);
                    break;
                case ResourceType.TEAM_MEMBER:
                    if (options.teamId && typeof input === 'object') {
                        const teamId = options.teamId(input);
                        if (teamId) {
                            // We assume the newMemberCount is 1 if not specified
                            await resourceValidator.validateTeamMemberAddition(ctx.userId, teamId, 1);
                        } else {
                            throw new TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'Team ID is required for team member validation'
                            });
                        }
                    } else {
                        throw new TRPCError({
                            code: 'BAD_REQUEST',
                            message: 'Invalid team ID for validation'
                        });
                    }
                    break;
                case ResourceType.TRACKER_PROJECT:
                    await resourceValidator.validateTrackerProjectCreation(ctx.userId);
                    break;
            }
        } catch (error) {
            // Pass through any TRPCErrors from the validators
            if (error instanceof TRPCError) {
                throw error;
            }

            // Otherwise wrap in a generic error
            throw new TRPCError({
                code: 'FORBIDDEN',
                message: `You've reached the limit for this resource on your current subscription plan.`,
                cause: error,
            });
        }

        // If validation passes, continue to the actual procedure
        return next({ ctx });
    });
}; 