import Stripe from 'stripe';
import { TRPCError } from '@trpc/server';
import { createRouter } from '../trpc';
import { deleteContactInLoopsAction } from '@/actions/loops';
import { env } from '@/env';
import { prisma } from '@/server/db';
import { protectedProcedure } from '../middlewares/procedures';
import { stripe } from '@/lib/stripe';
import { z } from 'zod';

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_PROFILE_IMAGE_URL_LENGTH = 500;
const MAX_URL_LENGTH = 500;
const MAX_TEXT_LENGTH = 1000;
const MAX_SHORT_TEXT_LENGTH = 255;

// Define AccountStatus enum if it doesn't exist in types
const AccountStatus = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  SUSPENDED: 'SUSPENDED',
} as const;
type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

// Define a comprehensive schema for professional profile validation
const professionalProfileSchema = z.object({
  // Address fields
  addressLine1: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  addressLine2: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  bio: z.string().max(MAX_TEXT_LENGTH, 'Bio is too long').optional().nullable(),
  businessEmail: z
    .string()
    .email('Invalid business email')
    .max(MAX_EMAIL_LENGTH)
    .optional()
    .nullable(),
  businessPhone: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  city: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  country: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  department: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),

  // Basic profile
  email: z
    .string()
    .email()
    .max(MAX_EMAIL_LENGTH, 'Email is too long')
    .optional(),
  employeeId: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  firstName: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  githubProfile: z
    .string()
    .url('Invalid URL')
    .max(MAX_URL_LENGTH)
    .optional()
    .nullable(),
  hireDate: z.string().optional().nullable(), // Changed from z.date() to z.string() for easier handling

  // Professional details
  jobTitle: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  language: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  lastName: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  // Social profiles
  linkedinProfile: z
    .string()
    .url('Invalid URL')
    .max(MAX_URL_LENGTH)
    .optional()
    .nullable(),

  name: z
    .string()
    .min(1, 'Name is required')
    .max(MAX_NAME_LENGTH, 'Name is too long')
    .trim()
    .optional(),
  officeLocation: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  // Organization data
  organizationName: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),

  organizationUnit: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  // Contact information
  phoneNumber: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  postalCode: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  profileImageUrl: z
    .string()
    .url('Invalid URL')
    .max(MAX_PROFILE_IMAGE_URL_LENGTH, 'Profile image URL is too long')
    .optional()
    .nullable(),
  state: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  teamName: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),

  timezone: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  twitterProfile: z
    .string()
    .url('Invalid URL')
    .max(MAX_URL_LENGTH)
    .optional()
    .nullable(),
  yearsOfExperience: z.number().int().positive().optional().nullable(),
});

// Schema for organization-related updates
const organizationProfileSchema = z.object({
  department: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  jobTitle: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  organizationName: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  organizationUnit: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  teamName: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
});

// Schema for contact information updates
const contactInfoSchema = z.object({
  addressLine1: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  addressLine2: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  businessEmail: z
    .string()
    .email('Invalid business email')
    .max(MAX_EMAIL_LENGTH)
    .optional()
    .nullable(),
  businessPhone: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  city: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  country: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  officeLocation: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  phoneNumber: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  postalCode: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
  state: z.string().max(MAX_SHORT_TEXT_LENGTH).optional().nullable(),
});

// Schema for preferences
const userPreferencesSchema = z.object({
  displayPreferences: z
    .object({
      compactMode: z.boolean().optional(),
      fontSize: z.enum(['small', 'medium', 'large']).optional(),
      theme: z.enum(['light', 'dark', 'system']).optional(),
    })
    .optional()
    .nullable(),
  documentPreferences: z
    .object({
      autoSave: z.boolean().optional(),
      defaultView: z.enum(['edit', 'preview']).optional(),
      showComments: z.boolean().optional(),
    })
    .optional()
    .nullable(),
  notificationPreferences: z
    .object({
      documentUpdates: z.boolean().optional(),
      emailNotifications: z.boolean().optional(),
      pushNotifications: z.boolean().optional(),
      teamUpdates: z.boolean().optional(),
    })
    .optional()
    .nullable(),
});

export const userRouter = createRouter({
  // NEW SUBSCRIPTION ENDPOINTS

  /** Create a Stripe Checkout session for subscription */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        priceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { priceId } = input;

      // Get the user to see if they already have a Stripe customer ID
      const user = await prisma.user.findUnique({
        select: { email: true, name: true, stripeCustomerId: true },
        where: { id: userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Base URL for redirects
      const baseUrl =
        env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
        'http://localhost:3000';

      // Create or retrieve the Stripe customer
      let customerId = user.stripeCustomerId;

      if (!customerId) {
        // Create a new customer if one doesn't exist
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: {
            userId: userId,
          },
          name: user.name || undefined,
        });

        customerId = customer.id;

        // Save the customer ID to the user
        await prisma.user.update({
          data: { stripeCustomerId: customerId },
          where: { id: userId },
        });
      }

      // Create the checkout session
      const session = await stripe.checkout.sessions.create({
        cancel_url: `${baseUrl}/api/stripe/return?status=canceled`,
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          userId: userId,
        },
        mode: 'subscription',
        payment_method_types: ['card'],
        subscription_data: {
          metadata: {
            userId: userId,
          },
        },
        success_url: `${baseUrl}/api/stripe/return?status=success&session_id={CHECKOUT_SESSION_ID}`,
      });

      return { url: session.url };
    }),

  /** Create a Stripe Customer Portal session for managing subscriptions */
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx;

    // Get the user's Stripe customer ID
    const user = await prisma.user.findUnique({
      select: { stripeCustomerId: true },
      where: { id: userId },
    });

    if (!user?.stripeCustomerId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No Stripe customer found for this user',
      });
    }

    // Base URL for redirects
    const baseUrl =
      env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
      'http://localhost:3000';

    // Create a portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/api/stripe/return?source=portal`,
    });

    return { url: session.url };
  }),

  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {

    // First, check if user has a Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { stripeCustomerId: true, email: true }
    });

    // If user has a Stripe customer ID, delete the customer
    if (user?.stripeCustomerId) {
      try {
        // First, cancel any active subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
        });

        // Cancel all active subscriptions
        for (const subscription of subscriptions.data) {
          if (subscription.status === 'active' || subscription.status === 'trialing') {
            await stripe.subscriptions.cancel(subscription.id, {
              invoice_now: false,
              prorate: true,
            });
          }
        }

        // Optional: Delete the customer (or mark as deleted - depends on stripe retention policy)
        await stripe.customers.del(user.stripeCustomerId);

        console.log(`Stripe customer ${user.stripeCustomerId} deleted successfully`);
      } catch (error) {
        console.error('Failed to delete Stripe customer:', error);
        // Continue with account deletion even if Stripe deletion fails
      }
    }

    // delete the user from loops 
    try {
      await deleteContactInLoopsAction({
        email: ctx.user?.email ?? '',
        // Only include userId if we have it to avoid "Only one parameter is permitted" error
        ...(ctx.userId ? { userId: ctx.userId } : {})
      });
    } catch (error) {
      console.error("Error deleting contact from Loops:", error);
      // Continue with account deletion even if Loops deletion fails
    }

    // First delete team associations to avoid foreign key constraint violation
    await prisma.usersOnTeam.deleteMany({
      where: { userId: ctx.userId },
    });

    // Now we can safely delete the user
    await prisma.user.delete({
      where: { id: ctx.userId },
    });

    return { success: true };
  }),

  /**
   * Check if the user has at least one team
   * 
   * This procedure checks if the authenticated user is a member of at least one team.
   * It can be used to determine if a user needs to create or join a team.
   * 
   * @returns A boolean indicating whether the user has at least one team
   * 
   * @example
   * ```tsx
   * const { hasTeam } = api.user.hasTeam.useQuery();
   * 
   * if (!hasTeam) {
   *   // Show team creation or join UI
   * }
   * ```
   */
  hasTeam: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    // Count the number of teams the user is a member of
    const teamsCount = await prisma.usersOnTeam.count({
      where: { userId },
    });

    return { hasTeam: teamsCount > 0 };
  }),

  // EXISTING ENDPOINTS

  // Get enhanced profile completeness with all relevant fields for business profile
  getBusinessProfileCompleteness: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate profile completeness on all business-relevant fields
    const businessFields = [
      user.name,
      user.firstName,
      user.lastName,
      user.profileImageUrl,
      user.email,
      user.bio,
      user.jobTitle,
      user.department,
      user.organizationName,
      user.teamName,
      user.phoneNumber,
      user.businessEmail,
      user.businessPhone,
      user.officeLocation,
      user.addressLine1,
      user.city,
      user.country,
    ];

    const completedFields = businessFields.filter((field) => !!field).length;
    const totalFields = businessFields.length;
    const completenessPercentage = Math.round(
      (completedFields / totalFields) * 100
    );

    // Create sections with their own completeness
    const basicInfo = [
      user.name,
      user.firstName,
      user.lastName,
      user.email,
      user.profileImageUrl,
    ];
    const basicInfoCompleteness = Math.round(
      (basicInfo.filter((f) => !!f).length / basicInfo.length) * 100
    );

    const professionalInfo = [
      user.jobTitle,
      user.department,
      user.organizationName,
      user.teamName,
    ];
    const professionalInfoCompleteness = Math.round(
      (professionalInfo.filter((f) => !!f).length / professionalInfo.length) *
      100
    );

    const contactInfo = [
      user.phoneNumber,
      user.businessEmail,
      user.businessPhone,
      user.officeLocation,
      user.addressLine1,
      user.city,
      user.country,
    ];
    const contactInfoCompleteness = Math.round(
      (contactInfo.filter((f) => !!f).length / contactInfo.length) * 100
    );

    return {
      nextStepsToComplete: businessFields
        .map((field, index) => {
          const fieldNames = [
            'name',
            'firstName',
            'lastName',
            'profileImageUrl',
            'email',
            'bio',
            'jobTitle',
            'department',
            'organizationName',
            'teamName',
            'phoneNumber',
            'businessEmail',
            'businessPhone',
            'officeLocation',
            'addressLine1',
            'city',
            'country',
          ];

          return field === undefined ? fieldNames[index] : null;
        })
        .filter(Boolean),
      overallCompleteness: completenessPercentage,
      sections: {
        basicInfo: { completeness: basicInfoCompleteness },
        contactInfo: { completeness: contactInfoCompleteness },
        professionalInfo: { completeness: professionalInfoCompleteness },
      },
    };
  }),

  // Get comprehensive profile including all fields
  getFullProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }),

  // Get organization directory
  getOrganizationDirectory: protectedProcedure
    .input(
      z.object({
        organizationName: z.string().optional(), // If not provided, uses current user's org
      })
    )
    .query(async ({ ctx, input }) => {
      // If organization not specified, get current user's organization
      let organizationName = input.organizationName;

      if (!organizationName) {
        const currentUser = await prisma.user.findUnique({
          select: { organizationName: true },
          where: { id: ctx.userId },
        });
        organizationName = currentUser?.organizationName || '';
      }
      if (!organizationName) {
        return [];
      }

      // Get all users in the organization, grouped by department/team
      const orgUsers = await prisma.user.findMany({
        orderBy: [
          { department: 'asc' },
          { teamName: 'asc' },
          { lastName: 'asc' },
        ],
        select: {
          id: true,
          department: true,
          email: true,
          firstName: true,
          jobTitle: true,
          lastName: true,
          name: true,
          profileImageUrl: true,
          teamName: true,
        },
        where: {
          organizationName: organizationName,
        },
      });

      // Group by department and team
      const directory: Record<string, Record<string, any[]>> = {};

      orgUsers.forEach((user) => {
        const dept = user.department || 'Other';
        const team = user.teamName || 'General';

        if (!directory[dept]) {
          directory[dept] = {};
        }
        if (!directory[dept][team]) {
          directory[dept][team] = [];
        }

        directory[dept][team].push(user);
      });

      return {
        directory,
        organizationName,
      };
    }),

  // Add an endpoint to get profile completeness
  getProfileCompleteness: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate profile completeness only on fields we know exist
    const fields = [
      user.name,
      user.firstName,
      user.lastName,
      user.profileImageUrl,
      user.email,
    ];

    const completedFields = fields.filter((field) => !!field).length;
    const totalFields = fields.length;
    const completenessPercentage = Math.round(
      (completedFields / totalFields) * 100
    );

    return {
      completeness: completenessPercentage,
      missingFields: fields
        .map((field, index) => {
          const fieldNames = [
            'name',
            'firstName',
            'lastName',
            'profileImageUrl',
            'email',
          ];

          return field === undefined ? fieldNames[index] : null;
        })
        .filter(Boolean),
    };
  }),

  getSettings: protectedProcedure.query(async ({ ctx }) => {
    // Get all available fields for the user
    const user = await prisma.user.findUnique({
      select: {
        email: true,
        name: true,
        profileImageUrl: true,
      },
      where: { id: ctx.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }),

  // NEW ENDPOINTS

  // Get team members (users with the same teamName)
  getTeamMembers: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = await prisma.user.findUnique({
      select: { organizationName: true, teamName: true },
      where: { id: ctx.userId },
    });

    if (!currentUser?.teamName) {
      return [];
    }

    const teamMembers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        jobTitle: true,
        lastName: true,
        name: true,
        profileImageUrl: true,
      },
      where: {
        id: { not: ctx.userId }, // Exclude current user
        organizationName: currentUser.organizationName,
        teamName: currentUser.teamName,
      },
    });

    return teamMembers;
  }),

  getUser: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // Return limited public profile information for other users
      const user = await prisma.user.findUnique({
        select: {
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          profileImageUrl: true,
          teamName: true,
          team: {
            select: {
              id: true,
              name: true,
              email: true,
              baseCurrency: true,
              createdAt: true,
            },
          },
        },
        where: { id: input.id },
      });

      return user;
    }),

  /** Get a user's subscription details */
  getUserSubscription: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    // Get the user's Stripe customer ID
    const user = await prisma.user.findUnique({
      select: { stripeCustomerId: true },
      where: { id: userId },
    });

    if (!user?.stripeCustomerId) {
      // No subscription found, return null values
      return {
        id: null,
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null,
        plan: null,
        status: null,
      };
    }

    try {
      // Get all subscriptions for this customer
      // Use simpler expand pattern to avoid Stripe API limitations
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        expand: ['data.default_payment_method'],
        status: 'all',
      });

      // First try to find an active subscription
      let subscription = subscriptions.data.find(
        (sub) => sub.status === 'active'
      );

      // If no active subscription, check for canceled subscription that's still in period
      if (!subscription) {
        subscription = subscriptions.data.find(
          (sub) =>
            sub.status === 'canceled' &&
            sub.current_period_end * 1000 > Date.now()
        );
      }
      // If still no subscription, get the most recent one
      if (!subscription && subscriptions.data.length > 0) {
        subscription = subscriptions.data[0];
      }
      if (!subscription) {
        // No subscription found, return null values
        return {
          id: null,
          cancelAtPeriodEnd: false,
          currentPeriodEnd: null,
          plan: null,
          status: null,
        };
      }

      // Get the price and product details in separate calls to avoid deep nesting
      const priceId = subscription.items.data[0].price.id;

      // Get price with expanded product
      const price = await stripe.prices.retrieve(priceId, {
        expand: ['product'],
      });

      const product = price.product as Stripe.Product;

      // Return formatted subscription details
      return {
        id: subscription.id,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        plan: {
          id: priceId,
          amount: price.unit_amount,
          interval: price.recurring?.interval || 'month',
          name: product.name,
        },
        status: subscription.status,
      };
    } catch (error) {
      console.error('Error retrieving subscription:', error);

      // Return null values if there's an error
      return {
        id: null,
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null,
        plan: null,
        status: null,
      };
    }
  }),

  // Search for users by name, org, or team
  searchUsers: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        query: z.string().min(1).max(100),
      })
    )
    .query(async ({ input }) => {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          jobTitle: true,
          lastName: true,
          name: true,
          organizationName: true,
          profileImageUrl: true,
          teamName: true,
        },
        take: input.limit,
        where: {
          OR: [
            { name: { contains: input.query, mode: 'insensitive' } },
            { firstName: { contains: input.query, mode: 'insensitive' } },
            { lastName: { contains: input.query, mode: 'insensitive' } },
            {
              organizationName: { contains: input.query, mode: 'insensitive' },
            },
            { teamName: { contains: input.query, mode: 'insensitive' } },
          ],
        },
      });

      return users;
    }),

  // Set user language preference
  setLanguage: protectedProcedure
    .input(
      z.object({
        language: z.string().min(2).max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await prisma.user.update({
        data: {
          language: input.language,
        },
        where: { id: ctx.userId },
      });

      return { language: updatedUser.language, success: true };
    }),

  // Set user timezone
  setTimezone: protectedProcedure
    .input(
      z.object({
        timezone: z.string().min(1).max(50),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await prisma.user.update({
        data: {
          timezone: input.timezone,
        },
        where: { id: ctx.userId },
      });

      return { success: true, timezone: updatedUser.timezone };
    }),

  // Update contact information
  updateContactInfo: protectedProcedure
    .input(contactInfoSchema)
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await prisma.user.update({
        data: input,
        where: { id: ctx.userId },
      });

      return updatedUser;
    }),

  // Update organization-related information
  updateOrganizationInfo: protectedProcedure
    .input(organizationProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await prisma.user.update({
        data: input,
        where: { id: ctx.userId },
      });

      return updatedUser;
    }),

  // Update user preferences (notifications, display, etc.)
  updatePreferences: protectedProcedure
    .input(userPreferencesSchema)
    .mutation(async ({ ctx, input }) => {
      // Serialize the preferences objects while converting to Prisma-compatible JSON
      const displayPrefs = input.displayPreferences
        ? structuredClone(input.displayPreferences)
        : undefined;
      const notificationPrefs = input.notificationPreferences
        ? structuredClone(input.notificationPreferences)
        : undefined;
      const documentPrefs = input.documentPreferences
        ? structuredClone(input.documentPreferences)
        : undefined;

      const updatedUser = await prisma.user.update({
        data: {
          displayPreferences: displayPrefs,
          documentPreferences: documentPrefs,
          notificationPreferences: notificationPrefs,
        },
        where: { id: ctx.userId },
      });

      return updatedUser;
    }),

  // Update comprehensive professional profile
  updateProfessionalProfile: protectedProcedure
    .input(professionalProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await prisma.user.update({
        data: input,
        where: { id: ctx.userId },
      });

      return updatedUser;
    }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        bio: z.string().max(MAX_TEXT_LENGTH, 'Bio is too long').optional(),
        email: z
          .string()
          .email()
          .max(MAX_EMAIL_LENGTH, 'Email is too long')
          .optional(),
        firstName: z.string().max(MAX_SHORT_TEXT_LENGTH).optional(),
        lastName: z.string().max(MAX_SHORT_TEXT_LENGTH).optional(),
        name: z
          .string()
          .min(1, 'Name is required')
          .max(MAX_NAME_LENGTH, 'Name is too long')
          .trim()
          .optional(),
        profileImageUrl: z
          .string()
          .url('Invalid URL')
          .max(MAX_PROFILE_IMAGE_URL_LENGTH, 'Profile image URL is too long')
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await prisma.user.update({
        data: input,
        where: { id: ctx.userId },
      });

      return updatedUser;
    }),

  // Update social profiles
  updateSocialProfiles: protectedProcedure
    .input(
      z.object({
        githubProfile: z
          .string()
          .url('Invalid URL')
          .max(MAX_URL_LENGTH)
          .optional()
          .nullable(),
        linkedinProfile: z
          .string()
          .url('Invalid URL')
          .max(MAX_URL_LENGTH)
          .optional()
          .nullable(),
        twitterProfile: z
          .string()
          .url('Invalid URL')
          .max(MAX_URL_LENGTH)
          .optional()
          .nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await prisma.user.update({
        data: input,
        where: { id: ctx.userId },
      });

      return updatedUser;
    }),
});
