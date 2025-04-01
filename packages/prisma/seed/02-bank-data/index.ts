import {
  AccountCapabilities,
  AccountStatus,
  AccountSubtype,
  AccountType,
  BankConnectionProvider,
  BankConnectionStatus,
  PrismaClient,
  SyncStatus,
  TeamRole,
  TransactionCategory,
  TransactionFrequency,
  VerificationStatus,
} from '@prisma/client'

import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

export const seedDatabase = async () => {
  try {
    console.info('Seeding bank data...')

    // Get users to associate bank data with
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: 'john.doe@example.com' },
          { email: 'jane.smith@example.com' },
          { email: 'yoanyomba@solomon-ai.co' },
        ],
      },
    })

    if (users.length === 0) {
      console.info(
        'No users found to associate bank data with. Skipping bank data seeding.',
      )
      return
    }

    // Create bank connections for each user
    for (const user of users) {
      // Create bank connection with enhanced fields
      const bankConnection = await prisma.bankConnection.upsert({
        where: {
          itemId: `item-${user.username}`,
        },
        update: {},
        create: {
          provider: BankConnectionProvider.PLAID,
          id: uuidv4(),
          userId: user.id,
          institutionId: `inst_${user.username}`,
          institutionName:
            user.username === 'john.doe' ? 'Chase Bank' : 'Bank of America',
          status: BankConnectionStatus.ACTIVE,
          syncStatus: SyncStatus.IDLE,
          lastSyncedAt: new Date(),
          consentExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          createdAt: new Date(),
          updatedAt: new Date(),
          logo:
            user.username === 'john.doe'
              ? 'https://logo.clearbit.com/chase.com'
              : 'https://logo.clearbit.com/bankofamerica.com',
          primaryColor: user.username === 'john.doe' ? '#117ACA' : '#012169',
          oauthSupported: false,
          mfaSupported: true,
          accessToken: `access-token-${uuidv4()}`,
          itemId: `item-${user.username}`,
          // Enhanced fields
          lastStatusChangedAt: new Date(),
          balanceLastUpdated: new Date(),
          nextSyncScheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
          lastNotifiedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          notificationCount: 2,
          webhookUrl: `https://api.example.com/webhooks/plaid/${user.id}`,
          disabled: false,
          lastAlertedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
          alertCount: 1,
          lastCheckedAt: new Date(),
          lastAccessedAt: new Date(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        },
      })

      // Create checking account with enhanced fields
      const checkingAccount = await prisma.bankAccount.upsert({
        where: {
          userId_plaidAccountId: {
            userId: user.id,
            plaidAccountId: `checking_${user.username}`,
          },
        },
        update: {},
        create: {
          id: uuidv4(),
          userId: user.id,
          bankConnectionId: bankConnection.id,
          plaidAccountId: `checking_${user.username}`,
          name: 'Checking Account',
          officialName: 'Premium Checking',
          mask: '1234',
          type: AccountType.DEPOSITORY,
          subtype: AccountSubtype.CHECKING,
          status: AccountStatus.ACTIVE,
          currentBalance: 5000.0,
          availableBalance: 4800.0,
          isoCurrencyCode: 'USD',
          lastSyncedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          verificationStatus: VerificationStatus.AUTOMATICALLY_VERIFIED,
          capabilities: [
            AccountCapabilities.BALANCE,
            AccountCapabilities.TRANSACTIONS,
          ],
          isHidden: false,
          enabled: true,
          // Enhanced fields
          displayName: 'My Primary Checking',
          accountNumber: '****1234',
          routingNumber: '****5678',
          balanceLastUpdated: new Date(),
          permissionsGranted: ['VIEW_TRANSACTIONS', 'VIEW_BALANCE'],
          isPrimary: true,
          isFavorite: true,
          monthlySpending: 2500.0,
          monthlyIncome: 5000.0,
          averageBalance: 4500.0,
          tags: ['primary', 'daily-use'],
          budgetCategory: 'Everyday Banking',
          errorCount: 0,
          balanceProjections: JSON.stringify({
            '7days': 4700.0,
            '14days': 4500.0,
            '30days': 5200.0,
          }),
          scheduledInflows: 5000.0,
          scheduledOutflows: 2000.0,
          recurringMonthlyInflow: 5000.0,
          recurringMonthlyOutflow: 2500.0,
          nextScheduledTransaction: new Date(
            Date.now() + 15 * 24 * 60 * 60 * 1000,
          ), // 15 days from now
        },
      })

      // Create savings account with enhanced fields
      const savingsAccount = await prisma.bankAccount.upsert({
        where: {
          userId_plaidAccountId: {
            userId: user.id,
            plaidAccountId: `savings_${user.username}`,
          },
        },
        update: {},
        create: {
          id: uuidv4(),
          userId: user.id,
          bankConnectionId: bankConnection.id,
          plaidAccountId: `savings_${user.username}`,
          name: 'Savings Account',
          officialName: 'High-Yield Savings',
          mask: '5678',
          type: AccountType.DEPOSITORY,
          subtype: AccountSubtype.SAVINGS,
          status: AccountStatus.ACTIVE,
          currentBalance: 10000.0,
          availableBalance: 10000.0,
          isoCurrencyCode: 'USD',
          lastSyncedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          verificationStatus: VerificationStatus.AUTOMATICALLY_VERIFIED,
          capabilities: [
            AccountCapabilities.BALANCE,
            AccountCapabilities.TRANSACTIONS,
          ],
          isHidden: false,
          enabled: true,
          // Enhanced fields
          displayName: 'Emergency Fund',
          accountNumber: '****5678',
          balanceLastUpdated: new Date(),
          permissionsGranted: ['VIEW_TRANSACTIONS', 'VIEW_BALANCE'],
          isPrimary: false,
          isFavorite: true,
          monthlySpending: 200.0,
          monthlyIncome: 1000.0,
          averageBalance: 9500.0,
          tags: ['savings', 'emergency-fund'],
          budgetCategory: 'Savings',
          errorCount: 0,
          balanceProjections: JSON.stringify({
            '7days': 10200.0,
            '14days': 10400.0,
            '30days': 11000.0,
          }),
          scheduledInflows: 1000.0,
          scheduledOutflows: 0.0,
          recurringMonthlyInflow: 1000.0,
          recurringMonthlyOutflow: 0.0,
        },
      })

      // Create credit card account with enhanced fields
      const creditCardAccount = await prisma.bankAccount.upsert({
        where: {
          userId_plaidAccountId: {
            userId: user.id,
            plaidAccountId: `credit_${user.username}`,
          },
        },
        update: {},
        create: {
          id: uuidv4(),
          userId: user.id,
          bankConnectionId: bankConnection.id,
          plaidAccountId: `credit_${user.username}`,
          name: 'Credit Card',
          officialName: 'Rewards Credit Card',
          mask: '9012',
          type: AccountType.CREDIT,
          subtype: AccountSubtype.CREDIT_CARD,
          status: AccountStatus.ACTIVE,
          currentBalance: -1500.0,
          availableBalance: 8500.0, // Credit limit of 10000 - 1500 used
          isoCurrencyCode: 'USD',
          lastSyncedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          verificationStatus: VerificationStatus.AUTOMATICALLY_VERIFIED,
          capabilities: [AccountCapabilities.PAYMENT],
          isHidden: false,
          enabled: true,
          // Enhanced fields
          displayName: 'Rewards Card',
          accountNumber: '****9012',
          balanceLastUpdated: new Date(),
          permissionsGranted: [
            'VIEW_TRANSACTIONS',
            'VIEW_BALANCE',
            'MAKE_PAYMENTS',
          ],
          isPrimary: false,
          isFavorite: true,
          monthlySpending: 1500.0,
          monthlyIncome: 0.0,
          averageBalance: -1200.0,
          tags: ['credit', 'rewards'],
          budgetCategory: 'Credit Cards',
          errorCount: 0,
          limit: 10000.0,
          balanceProjections: JSON.stringify({
            '7days': -1700.0,
            '14days': -1900.0,
            '30days': -1200.0,
          }),
          scheduledInflows: 0.0,
          scheduledOutflows: 1500.0,
          recurringMonthlyInflow: 0.0,
          recurringMonthlyOutflow: 1500.0,
          nextScheduledTransaction: new Date(
            Date.now() + 25 * 24 * 60 * 60 * 1000,
          ), // 25 days from now
        },
      })

      // Create enhanced transactions for checking account
      const checkingTransactions = [
        {
          name: 'Grocery Store',
          amount: 85.75,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          category: TransactionCategory.FOOD_AND_DRINK,
          merchantName: 'Whole Foods Market',
          location: {
            address: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            zip: '94105',
            country: 'US',
            lat: 37.7749,
            lon: -122.4194,
          },
          paymentChannel: 'IN_STORE',
          paymentMethod: 'DEBIT_CARD',
          cardLastFour: '1234',
        },
        {
          name: 'Gas Station',
          amount: 45.0,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          category: TransactionCategory.TRANSPORTATION,
          merchantName: 'Shell Gas',
          location: {
            address: '456 Market St',
            city: 'San Francisco',
            state: 'CA',
            zip: '94105',
            country: 'US',
            lat: 37.7899,
            lon: -122.4014,
          },
          paymentChannel: 'IN_STORE',
          paymentMethod: 'DEBIT_CARD',
          cardLastFour: '1234',
        },
        {
          name: 'Monthly Salary',
          amount: -3000.0, // Negative for income
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          category: TransactionCategory.INCOME,
          merchantName: 'Employer Inc.',
          paymentChannel: 'ONLINE',
          paymentMethod: 'ACH',
          transactionType: 'DIRECT_DEPOSIT',
        },
      ]

      for (const txData of checkingTransactions) {
        await prisma.transaction.create({
          data: {
            id: uuidv4(),
            userId: user.id,
            bankAccountId: checkingAccount.id,
            plaidTransactionId: `tx_${uuidv4()}`,
            name: txData.name,
            merchantName: txData.merchantName,
            amount: txData.amount,
            isoCurrencyCode: 'USD',
            date: txData.date,
            category: txData.category,
            pending: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            originalDescription: txData.name,
            originalMerchantName: txData.merchantName,
            originalCategory: txData.category,
            paymentChannel: txData.paymentChannel,
            // Enhanced fields
            description: `Transaction at ${txData.merchantName}`,
            location: txData.location
              ? JSON.stringify(txData.location)
              : undefined,
            latitude: txData.location?.lat,
            longitude: txData.location?.lon,
            paymentMethod: txData.paymentMethod,
            cardLastFour: txData.cardLastFour,
            transactionType: txData.transactionType || 'PURCHASE',
            cashFlowCategory: txData.amount < 0 ? 'INCOME' : 'EXPENSE',
            isManual: false,
            isVerified: true,
            dateYear: txData.date.getFullYear(),
            dateMonth: txData.date.getMonth() + 1,
            dateDay: txData.date.getDate(),
            dateDayOfWeek: txData.date.getDay(),
            importedAt: new Date(),
            lastReviewedAt: new Date(),
            searchableText: `${txData.name} ${txData.merchantName} ${txData.category}`,
            tags:
              txData.category === TransactionCategory.FOOD_AND_DRINK
                ? ['groceries']
                : txData.category === TransactionCategory.TRANSPORTATION
                  ? ['auto']
                  : txData.category === TransactionCategory.INCOME
                    ? ['salary']
                    : [],
            notes:
              txData.category === TransactionCategory.INCOME
                ? 'Monthly salary payment'
                : null,
            isRecurring: txData.category === TransactionCategory.INCOME,
            frequency:
              txData.category === TransactionCategory.INCOME
                ? TransactionFrequency.MONTHLY
                : null,
          },
        })
      }

      // Create enhanced transactions for credit card account
      const creditCardTransactions = [
        {
          name: 'Online Shopping',
          amount: 120.5,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          category: TransactionCategory.GENERAL_MERCHANDISE,
          merchantName: 'Amazon',
          merchantWebsite: 'www.amazon.com',
          paymentChannel: 'ONLINE',
          paymentMethod: 'CREDIT_CARD',
          cardLastFour: '9012',
          cardType: 'Visa',
        },
        {
          name: 'Restaurant',
          amount: 65.3,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          category: TransactionCategory.FOOD_AND_DRINK,
          merchantName: 'Olive Garden',
          location: {
            address: '789 Mission St',
            city: 'San Francisco',
            state: 'CA',
            zip: '94103',
            country: 'US',
            lat: 37.7847,
            lon: -122.4036,
          },
          paymentChannel: 'IN_STORE',
          paymentMethod: 'CREDIT_CARD',
          cardLastFour: '9012',
          cardType: 'Visa',
        },
        {
          name: 'Streaming Service',
          amount: 14.99,
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          category: TransactionCategory.ENTERTAINMENT,
          merchantName: 'Netflix',
          merchantWebsite: 'www.netflix.com',
          paymentChannel: 'ONLINE',
          paymentMethod: 'CREDIT_CARD',
          cardLastFour: '9012',
          cardType: 'Visa',
          isRecurring: true,
        },
      ]

      for (const txData of creditCardTransactions) {
        await prisma.transaction.create({
          data: {
            id: uuidv4(),
            userId: user.id,
            bankAccountId: creditCardAccount.id,
            plaidTransactionId: `tx_${uuidv4()}`,
            name: txData.name,
            merchantName: txData.merchantName,
            amount: txData.amount,
            isoCurrencyCode: 'USD',
            date: txData.date,
            category: txData.category,
            pending: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            originalDescription: txData.name,
            originalMerchantName: txData.merchantName,
            originalCategory: txData.category,
            paymentChannel: txData.paymentChannel,
            // Enhanced fields
            description: `Transaction at ${txData.merchantName}`,
            location: txData.location
              ? JSON.stringify(txData.location)
              : undefined,
            latitude: txData.location?.lat,
            longitude: txData.location?.lon,
            paymentMethod: txData.paymentMethod,
            merchantWebsite: txData.merchantWebsite,
            cardLastFour: txData.cardLastFour,
            cardType: txData.cardType,
            transactionType: 'PURCHASE',
            cashFlowCategory: 'EXPENSE',
            isManual: false,
            isVerified: true,
            dateYear: txData.date.getFullYear(),
            dateMonth: txData.date.getMonth() + 1,
            dateDay: txData.date.getDate(),
            dateDayOfWeek: txData.date.getDay(),
            importedAt: new Date(),
            lastReviewedAt: new Date(),
            searchableText: `${txData.name} ${txData.merchantName} ${txData.category}`,
            tags:
              txData.category === TransactionCategory.FOOD_AND_DRINK
                ? ['dining']
                : txData.category === TransactionCategory.ENTERTAINMENT
                  ? ['subscription']
                  : txData.category === TransactionCategory.GENERAL_MERCHANDISE
                    ? ['shopping']
                    : [],
            notes:
              txData.category === TransactionCategory.ENTERTAINMENT
                ? 'Monthly subscription'
                : null,
            isRecurring: txData.isRecurring || false,
            frequency: txData.isRecurring ? TransactionFrequency.MONTHLY : null,
          },
        })
      }

      // Create recurring transactions
      const recurringTransactions = [
        {
          title: 'Monthly Salary',
          description: 'Regular salary deposit',
          amount: -3000.0, // Negative for income
          currency: 'USD',
          frequency: TransactionFrequency.MONTHLY,
          startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
          dayOfMonth: 15,
          merchantName: 'Employer Inc.',
          transactionType: 'INCOME',
          bankAccountId: checkingAccount.id,
          status: 'active',
          isAutomated: true,
          isVariable: false,
          lastExecutedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          nextScheduledDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
          executionCount: 3,
          totalExecuted: 9000.0,
          notifyOnExecution: true,
        },
        {
          title: 'Netflix Subscription',
          description: 'Monthly streaming service',
          amount: 14.99,
          currency: 'USD',
          frequency: TransactionFrequency.MONTHLY,
          startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
          dayOfMonth: 10,
          merchantName: 'Netflix',
          transactionType: 'SUBSCRIPTION',
          bankAccountId: creditCardAccount.id,
          status: 'active',
          isAutomated: true,
          isVariable: false,
          lastExecutedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          nextScheduledDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
          executionCount: 2,
          totalExecuted: 29.98,
          notifyOnExecution: true,
        },
        {
          title: 'Rent Payment',
          description: 'Monthly apartment rent',
          amount: 1500.0,
          currency: 'USD',
          frequency: TransactionFrequency.MONTHLY,
          startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
          dayOfMonth: 1,
          merchantName: 'Property Management LLC',
          transactionType: 'BILL',
          bankAccountId: checkingAccount.id,
          status: 'active',
          isAutomated: true,
          isVariable: false,
          lastExecutedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          nextScheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
          executionCount: 2,
          totalExecuted: 3000.0,
          notifyOnExecution: true,
          importanceLevel: 'CRITICAL',
        },
        {
          title: 'Savings Transfer',
          description: 'Monthly transfer to savings',
          amount: 500.0,
          currency: 'USD',
          frequency: TransactionFrequency.MONTHLY,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          dayOfMonth: 20,
          transactionType: 'TRANSFER',
          bankAccountId: checkingAccount.id,
          targetAccountId: savingsAccount.id,
          status: 'active',
          isAutomated: true,
          isVariable: false,
          lastExecutedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          nextScheduledDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          executionCount: 1,
          totalExecuted: 500.0,
          notifyOnExecution: true,
        },
      ]

      for (const recTxData of recurringTransactions) {
        await prisma.recurringTransaction.create({
          data: {
            id: uuidv4(),
            bankAccountId: recTxData.bankAccountId,
            title: recTxData.title,
            description: recTxData.description,
            amount: recTxData.amount,
            currency: recTxData.currency,
            frequency: recTxData.frequency,
            interval: 1,
            startDate: recTxData.startDate,
            dayOfMonth: recTxData.dayOfMonth,
            merchantName: recTxData.merchantName,
            transactionType: recTxData.transactionType,
            status: recTxData.status,
            isAutomated: recTxData.isAutomated,
            isVariable: recTxData.isVariable,
            lastExecutedAt: recTxData.lastExecutedAt,
            nextScheduledDate: recTxData.nextScheduledDate,
            executionCount: recTxData.executionCount,
            totalExecuted: recTxData.totalExecuted,
            notifyOnExecution: recTxData.notifyOnExecution,
            notifyOnFailure: true,
            initialAccountBalance:
              recTxData.bankAccountId === checkingAccount.id ? 5000.0 : -1500.0,
            targetAccountId: recTxData.targetAccountId || null,
            affectAvailableBalance: true,
            importanceLevel: recTxData.importanceLevel || 'MEDIUM',
            reminderDays: [1, 3],
            createdAt: new Date(),
            updatedAt: new Date(),
            tags:
              recTxData.transactionType === 'INCOME'
                ? ['income', 'salary']
                : recTxData.transactionType === 'SUBSCRIPTION'
                  ? ['entertainment', 'subscription']
                  : recTxData.transactionType === 'BILL'
                    ? ['housing', 'essential']
                    : recTxData.transactionType === 'TRANSFER'
                      ? ['savings', 'transfer']
                      : [],
            source: 'MANUAL',
            confidenceScore: 1.0,
          },
        })
      }

      // Create transaction attachments
      if (user.username === 'john.doe') {
        // Create an attachment for a grocery transaction
        const groceryTransaction = await prisma.transaction.findFirst({
          where: {
            userId: user.id,
            merchantName: 'Whole Foods Market',
          },
        })

        if (groceryTransaction) {
          await prisma.attachment.create({
            data: {
              id: uuidv4(),
              transactionId: groceryTransaction.id,
              name: 'grocery_receipt.pdf',
              fileUrl: 'https://example.com/receipts/grocery_receipt.pdf',
              fileType: 'application/pdf',
              fileSize: 125000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          })
        }

        // Get or create a team for the user
        let team = await prisma.team.findFirst({
          where: {
            usersOnTeam: {
              some: {
                userId: user.id,
              },
            },
          },
        })

        if (!team) {
          team = await prisma.team.create({
            data: {
              id: uuidv4(),
              name: `${user.username}'s Team`,
              email: user.email,
              slug: `${user.username}-team`,
              createdAt: new Date(),
              usersOnTeam: {
                create: {
                  userId: user.id,
                  role: TeamRole.OWNER,
                },
              },
            },
          })
        }

        // Create a custom transaction category
        await prisma.customTransactionCategory.upsert({
          where: {
            id: 'groceries',
          },
          update: {},
          create: {
            id: 'groceries',
            name: 'Groceries',
            slug: 'groceries',
            description: 'Food and household items',
            color: '#4CAF50',
            system: false,
            teamId: team.id,
            createdAt: new Date(),
          },
        })
      }
    }

    console.info('Bank data seeding completed successfully.')
  } catch (error) {
    console.error('Error seeding bank data:', error)
  }
}
