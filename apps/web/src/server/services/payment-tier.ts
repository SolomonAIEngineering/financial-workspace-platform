/**
 * Payment Tier Service
 *
 * Server-side implementation of payment tier feature gates. This module
 * provides utilities for enforcing feature limits based on user subscription
 * tiers. It integrates with Stripe to determine a user's current subscription
 * level and enforces appropriate limitations on features such as team creation,
 * bank account connections, invoice generation, file uploads, and more.
 *
 * The service includes:
 *
 * - Payment tier definitions (FREE, BASIC, PROFESSIONAL, ENTERPRISE)
 * - Feature limit definitions for each tier
 * - User tier determination via Stripe subscription API
 * - Helper functions to retrieve specific limits for a given tier
 * - ResourceValidator class to enforce limits during resource creation
 *
 * Usage:
 *
 * ```typescript
 * // First, get the user's current tier
 * const tier = await getUserTier(userId);
 *
 * // Get a specific limit
 * const maxTeams = getMaxTeamsAllowed(tier);
 *
 * // Or validate an action directly using the validator class
 * const validator = new ResourceValidator();
 * await validator.validateTeamCreation(userId);
 * ```
 *
 * @module server/services/payment-tier
 */

import { TRPCError } from '@trpc/server';
import { env } from '@/env';
import { prisma } from '@/server/db';
import { stripe } from '@/lib/stripe';

/**
 * Available subscription tiers within the application. Each tier corresponds to
 * a different level of access and feature availability.
 *
 * @enum {string}
 */
export enum PaymentTier {
  /** Free tier with basic features */
  FREE = 'FREE',
  /** Basic paid tier with moderate features */
  BASIC = 'BASIC',
  /** Professional tier with enhanced features for businesses */
  PROFESSIONAL = 'PROFESSIONAL',
  /** Enterprise tier with unlimited features for large organizations */
  ENTERPRISE = 'ENTERPRISE',
}

/**
 * Feature limitations for each payment tier. Defines the maximum number of
 * resources a user can access based on their subscription level.
 *
 * @type {Record<PaymentTier, Record<string, number>>}
 */
export const FEATURE_LIMITS = {
  [PaymentTier.FREE]: {
    /** Maximum number of teams that can be created */
    TEAMS: 2,
    /** Maximum number of members allowed per team */
    TEAM_MEMBERS: 5,
    /** Maximum storage in gigabytes */
    STORAGE_GB: 2,
    /** Maximum number of reports that can be generated */
    REPORTS: 5,
    /** Maximum number of invoices that can be created */
    INVOICES: 20,
    /** Maximum number of bank accounts that can be connected */
    BANK_ACCOUNTS: 3,
    /** Maximum number of third-party integrations */
    INTEGRATIONS: 1,
    /** Maximum number of API requests allowed per day */
    API_REQUESTS_PER_DAY: 100,
    /** Maximum number of documents that can be created */
    DOCUMENTS: 50,
    /** Maximum file size for uploads in MB */
    MAX_FILE_SIZE_MB: 10,
    /** Maximum number of apps that can be installed */
    APPS: 3,
    /** Maximum historical transaction data retention in days */
    TRANSACTION_HISTORY_DAYS: 90,
    /** Maximum custom transaction categories allowed */
    CUSTOM_CATEGORIES: 10,
    /** Maximum number of simultaneous trackers/projects */
    TRACKER_PROJECTS: 2,
  },
  [PaymentTier.BASIC]: {
    TEAMS: 10,
    TEAM_MEMBERS: 25,
    STORAGE_GB: 50,
    REPORTS: 100,
    INVOICES: 500,
    BANK_ACCOUNTS: 20,
    INTEGRATIONS: 10,
    API_REQUESTS_PER_DAY: 5000,
    DOCUMENTS: 1000,
    MAX_FILE_SIZE_MB: 100,
    APPS: 25,
    TRANSACTION_HISTORY_DAYS: 730, // 2 years
    CUSTOM_CATEGORIES: 50,
    TRACKER_PROJECTS: 25,
  },
  [PaymentTier.PROFESSIONAL]: {
    TEAMS: 25,
    TEAM_MEMBERS: 100,
    STORAGE_GB: 250,
    REPORTS: 500,
    INVOICES: 2500,
    BANK_ACCOUNTS: 50,
    INTEGRATIONS: 30,
    API_REQUESTS_PER_DAY: 50000,
    DOCUMENTS: 5000,
    MAX_FILE_SIZE_MB: 250,
    APPS: 75,
    TRANSACTION_HISTORY_DAYS: 1825, // 5 years
    CUSTOM_CATEGORIES: 200,
    TRACKER_PROJECTS: 100,
  },
  [PaymentTier.ENTERPRISE]: {
    TEAMS: Infinity,
    TEAM_MEMBERS: Infinity,
    STORAGE_GB: Infinity,
    REPORTS: Infinity,
    INVOICES: Infinity,
    BANK_ACCOUNTS: Infinity,
    INTEGRATIONS: Infinity,
    API_REQUESTS_PER_DAY: Infinity,
    DOCUMENTS: Infinity,
    MAX_FILE_SIZE_MB: 1000, // 1 GB file upload limit
    APPS: Infinity,
    TRANSACTION_HISTORY_DAYS: 3650, // 10 years
    CUSTOM_CATEGORIES: Infinity,
    TRACKER_PROJECTS: Infinity,
  },
};

/**
 * Default tier assigned to new users. Users start with the FREE tier unless
 * they explicitly subscribe to a higher tier.
 *
 * @constant {PaymentTier}
 */
export const DEFAULT_TIER = PaymentTier.FREE;

/**
 * Mapping of Stripe price IDs to internal payment tiers. This mapping is used
 * to determine a user's tier based on their active Stripe subscription.
 *
 * @type {Record<string, PaymentTier>}
 */
const STRIPE_PRICE_TO_TIER: Record<string, PaymentTier> = {
  // Use price IDs from environment variables
  [env.NEXT_PUBLIC_STRIPE_PRICE_BASIC]: PaymentTier.BASIC,
  [env.NEXT_PUBLIC_STRIPE_PRICE_PRO]: PaymentTier.PROFESSIONAL,
  [env.NEXT_PUBLIC_STRIPE_PRICE_TEAM]: PaymentTier.ENTERPRISE,
  // Default FREE tier has no price ID (it's free)
};

/**
 * Retrieves a user's current payment tier based on their Stripe subscription.
 * This function queries the Stripe API to determine the user's active
 * subscription and maps it to the appropriate internal payment tier.
 *
 * @example
 *   ```typescript
 *   // Get a user's current tier
 *   const tier = await getUserTier('user_123');
 *
 *   if (tier === PaymentTier.ENTERPRISE) {
 *     // Allow enterprise-only features
 *   }
 *   ```;
 *
 * @param {string} userId - The user's unique identifier
 * @returns {Promise<PaymentTier>} The user's current payment tier
 */
export async function getUserTier(userId: string): Promise<PaymentTier> {
  try {
    // Get the user's Stripe customer ID
    const user = await prisma.user.findUnique({
      select: { stripeCustomerId: true },
      where: { id: userId },
    });

    // If no Stripe customer ID, return the default tier
    if (!user?.stripeCustomerId) {
      return DEFAULT_TIER;
    }

    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
    });

    // If no active subscription, return the default tier
    if (subscriptions.data.length === 0) {
      return DEFAULT_TIER;
    }

    // Get the price ID from the first active subscription
    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;

    // Map the price ID to a payment tier
    const tier = STRIPE_PRICE_TO_TIER[priceId] || DEFAULT_TIER;

    return tier;
  } catch (error) {
    console.error('Error retrieving user subscription tier:', error);
    // If there's an error, return the default tier as a fallback
    return DEFAULT_TIER;
  }
}

/**
 * Gets the maximum number of teams a user can create based on their payment
 * tier.
 *
 * @example
 *   ```typescript
 *   // Check how many teams a user can create based on their tier
 *   const maxTeams = getMaxTeamsAllowed(PaymentTier.BASIC); // Returns 5 for BASIC tier
 *   ```;
 *
 * @param {PaymentTier} tier - The user's payment tier
 * @returns {number} The maximum number of teams allowed for the tier
 */
export function getMaxTeamsAllowed(tier: PaymentTier): number {
  return FEATURE_LIMITS[tier].TEAMS;
}

/**
 * Gets the maximum number of team members allowed per team based on payment
 * tier.
 *
 * @param {PaymentTier} tier - The user's payment tier
 * @returns {number} The maximum number of team members allowed
 */
export function getMaxTeamMembersAllowed(tier: PaymentTier): number {
  return FEATURE_LIMITS[tier].TEAM_MEMBERS;
}

/**
 * Gets the maximum storage (in GB) a user is allowed based on their payment
 * tier.
 *
 * @param {PaymentTier} tier - The user's payment tier
 * @returns {number} The maximum storage in gigabytes
 */
export function getMaxStorageAllowed(tier: PaymentTier): number {
  return FEATURE_LIMITS[tier].STORAGE_GB;
}

/**
 * Gets the maximum number of reports a user can create based on their payment
 * tier.
 *
 * @param {PaymentTier} tier - The user's payment tier
 * @returns {number} The maximum number of reports allowed
 */
export function getMaxReportsAllowed(tier: PaymentTier): number {
  return FEATURE_LIMITS[tier].REPORTS;
}

/**
 * Gets the maximum number of invoices a user can create based on their payment
 * tier.
 *
 * @param {PaymentTier} tier - The user's payment tier
 * @returns {number} The maximum number of invoices allowed
 */
export function getMaxInvoicesAllowed(tier: PaymentTier): number {
  return FEATURE_LIMITS[tier].INVOICES;
}

/**
 * Gets the maximum number of bank accounts a user can connect based on their
 * payment tier.
 *
 * @param {PaymentTier} tier - The user's payment tier
 * @returns {number} The maximum number of bank accounts allowed
 */
export function getMaxBankAccountsAllowed(tier: PaymentTier): number {
  return FEATURE_LIMITS[tier].BANK_ACCOUNTS;
}

/**
 * Gets the maximum file size (in MB) a user can upload based on their payment
 * tier.
 *
 * @param {PaymentTier} tier - The user's payment tier
 * @returns {number} The maximum file size in megabytes
 */
export function getMaxFileSizeAllowed(tier: PaymentTier): number {
  return FEATURE_LIMITS[tier].MAX_FILE_SIZE_MB;
}

/**
 * Gets the transaction history retention period (in days) based on payment
 * tier.
 *
 * @param {PaymentTier} tier - The user's payment tier
 * @returns {number} The transaction history retention period in days
 */
export function getTransactionHistoryDays(tier: PaymentTier): number {
  return FEATURE_LIMITS[tier].TRANSACTION_HISTORY_DAYS;
}

/**
 * Gets the maximum number of custom transaction categories allowed based on
 * payment tier.
 *
 * @param {PaymentTier} tier - The user's payment tier
 * @returns {number} The maximum number of custom categories allowed
 */
export function getMaxCustomCategoriesAllowed(tier: PaymentTier): number {
  return FEATURE_LIMITS[tier].CUSTOM_CATEGORIES;
}

/**
 * Gets the maximum number of tracker projects allowed based on payment tier.
 *
 * @param {PaymentTier} tier - The user's payment tier
 * @returns {number} The maximum number of tracker projects allowed
 */
export function getMaxTrackerProjectsAllowed(tier: PaymentTier): number {
  return FEATURE_LIMITS[tier].TRACKER_PROJECTS;
}

/**
 * ResourceValidator class provides methods to validate if a user can create or
 * modify resources based on their subscription tier.
 *
 * This class encapsulates all validation logic for enforcing resource limits in
 * a single place, making it easy to check permissions before attempting to
 * create or modify resources.
 *
 * @example
 *   ```typescript
 *   // Create a validator instance
 *   const validator = new ResourceValidator();
 *
 *   try {
 *     // Check if the user can create a team
 *     await validator.validateTeamCreation(userId);
 *
 *     // If successful, proceed with team creation
 *     const team = await createTeam({ ... });
 *   } catch (error) {
 *     // Handle validation error (e.g., show an upgrade prompt)
 *     console.error(error.message);
 *   }
 *   ```;
 *
 * @class
 */
export class ResourceValidator {
  /**
   * Validates whether a user can create more teams based on their
   * subscription tier. This method throws a TRPCError if the user has reached
   * their team creation limit.
   *
   * @param {string} userId - The user's unique identifier
   * @throws {TRPCError} If the user has reached their team limit or if
   *   validation fails
   */
  public async validateTeamCreation(userId: string): Promise<void> {
    try {
      const tier = await getUserTier(userId);
      const maxTeams = getMaxTeamsAllowed(tier);

      // Get the user's current teams count - count only teams where the user is an OWNER
      // This prevents counting teams the user was invited to against their limit
      const userTeamsCount = await prisma.usersOnTeam.count({
        where: {
          userId,
          role: 'OWNER', // Only count teams where user is the OWNER
        },
      });

      console.log(
        `User ${userId} has created ${userTeamsCount} teams. Max allowed: ${maxTeams} on tier ${tier}`
      );

      if (userTeamsCount >= maxTeams) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `You've reached the maximum limit of ${maxTeams} teams on your ${tier} plan. Please upgrade your subscription to create more teams.`,
        });
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to validate team creation permissions',
      });
    }
  }

  /**
   * Validates whether a team can add more members based on the owner's
   * subscription tier. This method verifies that adding new members would not
   * exceed the plan's limitations for team size, and throws a TRPCError if
   * the limit would be exceeded.
   *
   * @param {string} userId - The team owner's unique identifier
   * @param {string} teamId - The unique identifier of the team
   * @param {number} [newMemberCount=1] - The number of new members to be
   *   added. Default is `1`
   * @throws {TRPCError} If adding members would exceed the plan limit or if
   *   validation fails
   */
  public async validateTeamMemberAddition(
    userId: string,
    teamId: string,
    newMemberCount: number = 1
  ): Promise<void> {
    try {
      // Get the user's tier
      const tier = await getUserTier(userId);

      // Get the team member limit for this tier
      const memberLimit = FEATURE_LIMITS[tier].TEAM_MEMBERS;

      // Get current team member count
      const currentMemberCount = await prisma.usersOnTeam.count({
        where: { teamId },
      });

      // Check if adding new members would exceed the limit
      if (currentMemberCount + newMemberCount > memberLimit) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `You've reached the maximum limit of ${memberLimit} team members on your ${tier} plan. Please upgrade your subscription to add more members.`,
        });
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to validate team member addition permissions',
      });
    }
  }

  /**
   * Validates whether a user can create more invoices based on their
   * subscription tier. This method throws a TRPCError if the user has reached
   * their invoice creation limit.
   *
   * @param {string} userId - The user's unique identifier
   * @throws {TRPCError} If the user has reached their invoice limit or if
   *   validation fails
   */
  public async validateInvoiceCreation(userId: string): Promise<void> {
    try {
      const tier = await getUserTier(userId);
      const maxInvoices = getMaxInvoicesAllowed(tier);

      // Get user's teams to check invoices across all teams
      const userTeams = await prisma.team.findMany({
        where: {
          users: {
            some: {
              id: userId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      const teamIds = userTeams.map((team) => team.id);

      // Count existing invoices across all user's teams
      const invoiceCount = await prisma.invoice.count({
        where: {
          teamId: {
            in: teamIds,
          },
        },
      });

      if (invoiceCount >= maxInvoices) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `You've reached the maximum limit of ${maxInvoices} invoices on your ${tier} plan. Please upgrade your subscription to create more invoices.`,
        });
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to validate invoice creation permissions',
      });
    }
  }

  /**
   * Validates whether a user can connect more bank accounts based on their
   * subscription tier. This method throws a TRPCError if the user has reached
   * their bank account limit.
   *
   * @param {string} userId - The user's unique identifier
   * @throws {TRPCError} If the user has reached their bank account limit or
   *   if validation fails
   */
  public async validateBankAccountCreation(userId: string): Promise<void> {
    try {
      const tier = await getUserTier(userId);
      const maxBankAccounts = getMaxBankAccountsAllowed(tier);

      // Count existing bank accounts for the user
      const bankAccountCount = await prisma.bankAccount.count({
        where: {
          userId,
        },
      });

      if (bankAccountCount >= maxBankAccounts) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `You've reached the maximum limit of ${maxBankAccounts} connected bank accounts on your ${tier} plan. Please upgrade your subscription to connect more accounts.`,
        });
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to validate bank account creation permissions',
      });
    }
  }

  /**
   * Validates whether a file can be uploaded based on the user's subscription
   * tier. This method throws a TRPCError if the file size exceeds the allowed
   * limit.
   *
   * @param {string} userId - The user's unique identifier
   * @param {number} fileSizeInBytes - The size of the file to upload in bytes
   * @throws {TRPCError} If the file size exceeds the allowed limit or if
   *   validation fails
   */
  public async validateFileUpload(
    userId: string,
    fileSizeInBytes: number
  ): Promise<void> {
    try {
      const tier = await getUserTier(userId);
      const maxFileSizeMB = getMaxFileSizeAllowed(tier);
      const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024; // Convert MB to bytes

      if (fileSizeInBytes > maxFileSizeBytes) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `File size exceeds the maximum allowed size of ${maxFileSizeMB}MB on your ${tier} plan. Please upgrade your subscription for larger file uploads.`,
        });
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to validate file upload permissions',
      });
    }
  }

  /**
   * Validates whether a user can create more custom transaction categories.
   * This method throws a TRPCError if the user has reached their category
   * limit.
   *
   * @param {string} userId - The user's unique identifier
   * @param {string} teamId - The team ID
   * @throws {TRPCError} If the custom category limit is reached or if
   *   validation fails
   */
  public async validateCustomCategoryCreation(
    userId: string,
    teamId: string
  ): Promise<void> {
    try {
      const tier = await getUserTier(userId);
      const maxCategories = getMaxCustomCategoriesAllowed(tier);

      // Count existing custom categories for the team
      const categoryCount = await prisma.customTransactionCategory.count({
        where: {
          teamId,
        },
      });

      if (categoryCount >= maxCategories) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `You've reached the maximum limit of ${maxCategories} custom transaction categories on your ${tier} plan. Please upgrade your subscription to create more categories.`,
        });
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to validate custom category creation permissions',
      });
    }
  }

  /**
   * Validates whether a user can create more reports based on their
   * subscription tier. This method throws a TRPCError if the user has reached
   * their report creation limit.
   *
   * @param {string} userId - The user's unique identifier
   * @throws {TRPCError} If the user has reached their report limit or if
   *   validation fails
   */
  public async validateReportCreation(userId: string): Promise<void> {
    try {
      const tier = await getUserTier(userId);
      const maxReports = getMaxReportsAllowed(tier);

      // Get user's teams to check reports across all teams
      const userTeams = await prisma.team.findMany({
        where: {
          users: {
            some: {
              id: userId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      const teamIds = userTeams.map((team) => team.id);

      // Count existing reports across all user's teams
      const reportCount = await prisma.report.count({
        where: {
          teamId: {
            in: teamIds,
          },
        },
      });

      if (reportCount >= maxReports) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `You've reached the maximum limit of ${maxReports} reports on your ${tier} plan. Please upgrade your subscription to create more reports.`,
        });
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to validate report creation permissions',
      });
    }
  }

  /**
   * Validates whether a user can create more documents based on their
   * subscription tier. This method throws a TRPCError if the user has reached
   * their document creation limit.
   *
   * @param {string} userId - The user's unique identifier
   * @throws {TRPCError} If the user has reached their document limit or if
   *   validation fails
   */
  public async validateDocumentCreation(userId: string): Promise<void> {
    try {
      const tier = await getUserTier(userId);
      const maxDocuments = FEATURE_LIMITS[tier].DOCUMENTS;

      // Get user's teams to check documents across all teams
      const userTeams = await prisma.team.findMany({
        where: {
          users: {
            some: {
              id: userId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      const teamIds = userTeams.map((team) => team.id);

      // Count existing documents - adjust this query based on your actual schema
      // This is a placeholder that needs to be adjusted to your actual document storage model
      const documentCount = await prisma.file.count({
        where: {
          // Adjust based on your actual schema structure
          OR: [
            {
              // If files are associated directly with users
              userId,
            },
          ],
        },
      });

      if (documentCount >= maxDocuments) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `You've reached the maximum limit of ${maxDocuments} documents on your ${tier} plan. Please upgrade your subscription to create more documents.`,
        });
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to validate document creation permissions',
      });
    }
  }

  /**
   * Validates whether a user has sufficient storage remaining based on their
   * subscription tier. This method throws a TRPCError if the user has reached
   * their storage limit.
   *
   * @param {string} userId - The user's unique identifier
   * @param {number} additionalStorageNeededInBytes - Additional storage
   *   needed in bytes
   * @throws {TRPCError} If the storage limit would be exceeded or if
   *   validation fails
   */
  public async validateStorageUsage(
    userId: string,
    additionalStorageNeededInBytes: number = 0
  ): Promise<void> {
    try {
      const tier = await getUserTier(userId);
      const maxStorageGB = getMaxStorageAllowed(tier);
      const maxStorageBytes = maxStorageGB * 1024 * 1024 * 1024; // Convert GB to bytes

      // Get files associated with the user - adjust based on your schema
      // This is a placeholder that should be adjusted to your actual file storage model
      const files = await prisma.file.aggregate({
        where: {
          userId,
        },
        _sum: {
          size: true,
        },
      });

      // Calculate total storage used in bytes
      const totalStorageUsedBytes = files._sum.size || 0;

      if (
        totalStorageUsedBytes + additionalStorageNeededInBytes >
        maxStorageBytes
      ) {
        const usedStorageGB = totalStorageUsedBytes / (1024 * 1024 * 1024);
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `You've reached your storage limit of ${maxStorageGB}GB on your ${tier} plan. Currently using ${usedStorageGB.toFixed(2)}GB. Please upgrade your subscription for more storage.`,
        });
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to validate storage usage permissions',
      });
    }
  }

  /**
   * Validates whether a user is within their API request limit based on their
   * subscription tier. This method throws a TRPCError if the user has reached
   * their API request limit for the day.
   *
   * @param {string} userId - The user's unique identifier
   * @throws {TRPCError} If the API request limit has been reached or if
   *   validation fails
   */
  public async validateApiUsage(userId: string): Promise<void> {
    try {
      const tier = await getUserTier(userId);
      const maxApiRequests = FEATURE_LIMITS[tier].API_REQUESTS_PER_DAY;

      // Get the start of the current day in UTC
      const startOfDay = new Date();
      startOfDay.setUTCHours(0, 0, 0, 0);

      // This is a placeholder - we'll need to implement API request tracking
      // in your application. This could be through:
      // 1. A dedicated apiRequest table in your schema
      // 2. Analytics tracking in a separate system
      // 3. Logs that you parse and count
      const apiRequestCount = 0; // Replace with actual implementation

      if (apiRequestCount >= maxApiRequests) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `You've reached the maximum limit of ${maxApiRequests} API requests per day on your ${tier} plan. Please upgrade your subscription for higher limits or try again tomorrow.`,
        });
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to validate API usage permissions',
      });
    }
  }

  /**
   * Validates whether a user can create more tracker projects based on their
   * subscription tier. This method throws a TRPCError if the user has reached
   * their tracker project limit.
   *
   * @param {string} userId - The user's unique identifier
   * @throws {TRPCError} If the tracker project limit is reached or if
   *   validation fails
   */
  public async validateTrackerProjectCreation(userId: string): Promise<void> {
    try {
      const tier = await getUserTier(userId);
      const maxTrackerProjects = getMaxTrackerProjectsAllowed(tier);

      // Get all teams the user belongs to
      const userTeams = await prisma.team.findMany({
        where: {
          users: {
            some: {
              id: userId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      const teamIds = userTeams.map((team) => team.id);

      // Count tracker projects owned by the user or their teams
      const trackerProjectCount = await prisma.trackerProject.count({
        where: {
          teamId: {
            in: teamIds,
          },
        },
      });

      if (trackerProjectCount >= maxTrackerProjects) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `You've reached the maximum limit of ${maxTrackerProjects} tracker projects on your ${tier} plan. Please upgrade your subscription to create more tracker projects.`,
        });
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to validate tracker project creation permissions',
      });
    }
  }

  /**
   * Validates whether a user can install more apps based on their
   * subscription tier. This method throws a TRPCError if the user has reached
   * their app installation limit.
   *
   * @param {string} userId - The user's unique identifier
   * @throws {TRPCError} If the app installation limit is reached or if
   *   validation fails
   */
  public async validateAppInstallation(userId: string): Promise<void> {
    try {
      const tier = await getUserTier(userId);
      const maxApps = FEATURE_LIMITS[tier].APPS;

      // Get all teams the user belongs to
      const userTeams = await prisma.team.findMany({
        where: {
          users: {
            some: {
              id: userId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      const teamIds = userTeams.map((team) => team.id);

      // For app counts, we'll need to implement when the App model is available
      // This is a safe implementation that won't throw errors if the model doesn't exist
      let appCount = 0;

      try {
        // Only attempt to count if the model exists
        if ('app' in prisma) {
          appCount = await (prisma as any).app.count({
            where: {
              teamId: {
                in: teamIds,
              },
            },
          });
        }
      } catch (e) {
        console.log('App model not available yet, using default count of 0');
      }

      if (appCount >= maxApps) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `You've reached the maximum limit of ${maxApps} app installations on your ${tier} plan. Please upgrade your subscription to install more apps.`,
        });
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to validate app installation permissions',
      });
    }
  }

  /**
   * Validates whether a user can create or access data based on transaction
   * history retention limits. This method throws a TRPCError if the
   * transaction date is outside the allowed retention period.
   *
   * @param {string} userId - The user's unique identifier
   * @param {Date} transactionDate - The date of the transaction to validate
   * @throws {TRPCError} If the transaction date is outside the retention
   *   period or if validation fails
   */
  public async validateTransactionHistoryAccess(
    userId: string,
    transactionDate: Date
  ): Promise<void> {
    try {
      const tier = await getUserTier(userId);
      const retentionDays = getTransactionHistoryDays(tier);

      // Calculate the oldest date allowed based on retention period
      const now = new Date();
      const oldestAllowedDate = new Date(now);
      oldestAllowedDate.setDate(now.getDate() - retentionDays);

      if (transactionDate < oldestAllowedDate) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Your ${tier} plan only allows access to transaction history from the past ${retentionDays} days. Please upgrade your subscription to access older transaction data.`,
        });
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to validate transaction history access permissions',
      });
    }
  }
}

/** Types of resources that can be limited by payment tiers */
export enum ResourceType {
  BANK_ACCOUNT = 'bankAccount',
  DOCUMENT = 'document',
  FILE = 'file',
  INVOICE = 'invoice',
  REPORT = 'report',
  STORAGE = 'storage',
  TEAM = 'team',
  TEAM_MEMBER = 'teamMember',
  TRACKER_PROJECT = 'trackerProject',
}

// Export an instance of ResourceValidator to make it easier to use
export const resourceValidator = new ResourceValidator();
