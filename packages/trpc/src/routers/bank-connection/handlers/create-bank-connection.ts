import {
  AccountType,
  BankConnectionStatus,
  Prisma,
} from '@solomonai/prisma'
import {
  CreateBankConnectionResponseSchema,
  CreateBankConnectionSchema,
} from '../schema'

import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Maps the account type from the schema format to the Prisma AccountType enum
 */
function mapAccountType(
  type: 'credit' | 'depository' | 'other_asset' | 'loan' | 'other_liability',
): AccountType {
  const typeMap: Record<string, string> = {
    credit: AccountType.CREDIT,
    depository: AccountType.DEPOSITORY,
    other_asset: AccountType.INVESTMENT,
    loan: AccountType.LOAN,
    other_liability: AccountType.MORTGAGE,
  }

  return typeMap[type] as AccountType
}

/**
 * Validates the input data for creating a bank connection
 */
function validateBankConnectionInput(
  teamId: string,
  userId: string,
  provider: string,
  itemId?: string,
  accessToken?: string,
  accounts?: any[],
): void {
  // Validate all required fields have values
  if (!teamId || !userId || !provider) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Missing required fields: teamId, userId, provider',
    })
  }

  // Make sure itemId or accessToken exists
  if (!itemId && !accessToken) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Either itemId or accessToken is required',
    })
  }

  // check if the accounts list is empty or invalid
  if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'No accounts found',
    })
  }

  // get the first account to create a bank connectionn
  const account = accounts[0]
  if (!account) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'No accounts found',
    })
  }

  // Validate the first account has all required fields
  if (!account.bank_name || !account.account_id) {
    console.error(
      '[createBankConnection] Invalid account data:',
      JSON.stringify(account),
    )
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid account data. Missing required fields.',
    })
  }
}

/**
 * Verifies that the team exists
 */
async function verifyTeamExists(teamId: string): Promise<void> {
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
  })

  if (!team) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Team not found',
    })
  }
}

/**
 * Creates or updates a bank connection
 */
async function upsertBankConnection(
  itemId: string,
  institutionId: string,
  account: any,
  accessToken: string,
  provider: string,
  userId: string,
  teamId: string,
): Promise<{ id: string }> {
  const updateData: Prisma.BankConnectionUpdateInput = {
    accessToken: accessToken || '',
    provider: provider as any,
    institutionName: account.bank_name,
    logo: account.logo_url || null,
    expiresAt: account.expires_at || null,
    status: BankConnectionStatus.ACTIVE,
  }

  const createData: Prisma.BankConnectionCreateInput = {
    institutionId: institutionId || '',
    institutionName: account.bank_name,
    logo: account.logo_url || null,
    provider: provider as any,
    accessToken: accessToken || '',
    itemId: itemId || '',
    status: BankConnectionStatus.ACTIVE,
    user: {
      connect: { id: userId },
    },
    team: {
      connect: [{ id: teamId }],
    },
  }

  return prisma.bankConnection.upsert({
    where: {
      itemId: itemId || '', // Ensure not null
    },
    update: updateData,
    create: createData,
  })
}

/**
 * Creates or updates bank accounts associated with a bank connection
 */
async function processAccounts(
  accounts: any[],
  userId: string,
  teamId: string,
  bankConnectionId: string,
): Promise<void> {
  // Filter out accounts without IDs first to avoid null promises
  const validAccounts = accounts.filter((acc) => !!acc.account_id)

  if (validAccounts.length === 0) {
    console.warn(
      '[createBankConnection] No valid accounts found with account_id',
    )
    return
  }

  const accountPromises = validAccounts.map(async (acc) => {
    try {
      const updateBankAccount: Prisma.BankAccountUpdateInput = {
        name: acc.name || 'Unnamed Account',
        isoCurrencyCode: acc.currency || 'USD',
        enabled: acc.enabled,
        type: mapAccountType(acc.type),
        balance: acc.balance ?? 0,
      }

      const createBankAccount: Prisma.BankAccountCreateInput = {
        plaidAccountId: acc.account_id,
        name: acc.name || 'Unnamed Account',
        isoCurrencyCode: acc.currency || 'USD',
        createdAt: new Date(),
        enabled: acc.enabled,
        type: mapAccountType(acc.type),
        balance: acc.balance ?? 0,
        Team: {
          connect: [{ id: teamId }],
        },
        user: {
          connect: { id: userId },
        },
        bankConnection: {
          connect: { id: bankConnectionId },
        },
      }

      // Ensure all required fields have values or defaults
      return prisma.bankAccount.upsert({
        where: {
          userId_plaidAccountId: {
            userId: userId,
            plaidAccountId: acc.account_id,
          },
        },
        update: updateBankAccount,
        create: createBankAccount,
      })
    } catch (err) {
      console.error(
        '[createBankConnection] Error creating/updating bank account:',
        err,
      )
      throw err // Rethrow to be caught by the main try/catch
    }
  })

  await Promise.all(accountPromises)
}

/**
 * Handles errors in the bank connection creation process
 */
function handleBankConnectionError(error: unknown): never {
  console.error('[createBankConnection] Error:', error)

  // If it's already a TRPCError, rethrow it
  if (error instanceof TRPCError) {
    throw error
  }

  // Otherwise, determine the error type and provide a more specific error message
  let message = 'Failed to create bank connection'
  let code: TRPCError['code'] = 'INTERNAL_SERVER_ERROR'

  if (error instanceof Error) {
    message = error.message || 'Unknown error occurred'

    // Map error messages to appropriate TRPC error codes
    if (error.message.includes('No accounts found')) {
      code = 'BAD_REQUEST'
    } else if (error.message.includes('Team not found')) {
      code = 'NOT_FOUND'
    } else if (error.message.includes('foreign key constraint')) {
      code = 'BAD_REQUEST'
      message = 'Invalid relationship between records'
    } else if (error.message.includes('unique constraint')) {
      code = 'CONFLICT'
      message = 'Record already exists'
    } else if (error.message.includes('argument must be of type object')) {
      code = 'INTERNAL_SERVER_ERROR'
      message = 'Invalid data format provided'
      console.error(
        '[createBankConnection] Data format error:',
        error.stack || error,
      )
    }
  }

  // Use proper TRPC error - ensure message is not null
  throw new TRPCError({
    code,
    message: message || 'Unknown error',
    cause: error,
  })
}

/**
 * Create a bank connection
 *
 * @description This procedure creates a new bank connection record and associates bank accounts with it.
 * It validates the input data, ensures the team exists, and creates or updates bank accounts linked to the connection.
 *
 * @param ctx - The TRPC context object
 * @param input - The input parameters for creating a bank connection, validated using the CreateBankConnectionSchema
 *
 * @returns A CreateBankConnectionResponse object containing the ID of the created connection and a success flag
 * @throws {TRPCError} - With BAD_REQUEST code if any required fields are missing or invalid
 * @throws {TRPCError} - With NOT_FOUND code if the specified team doesn't exist
 * @throws {TRPCError} - With other error codes based on the specific error encountered
 */
export const createBankConnection = protectedProcedure
  .input(CreateBankConnectionSchema)
  .output(CreateBankConnectionResponseSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      const {
        teamId,
        institutionId,
        accessToken,
        itemId,
        userId,
        accounts,
        provider,
      } = input

      // Validate input data
      validateBankConnectionInput(
        teamId,
        userId,
        provider,
        itemId,
        accessToken,
        accounts,
      )

      // Verify team exists
      await verifyTeamExists(teamId)

      // Create or update bank connection
      const bankConnection = await upsertBankConnection(
        itemId || '',
        institutionId || '',
        accounts[0],
        accessToken || '',
        provider,
        userId,
        teamId,
      )

      // Process accounts
      await processAccounts(accounts, userId, teamId, bankConnection.id)

      return { connectionId: bankConnection.id, success: true }
    } catch (error) {
      return handleBankConnectionError(error)
    }
  })
