import { TRANSACTION_JOBS } from '../constants';
import { TransactionCategory } from '@prisma/client';
import { client } from '../../client';
import { cronTrigger } from '@trigger.dev/sdk';
import { prisma } from '@/server/db';

/**
 * This job identifies transactions that need categorization and applies
 * auto-categorization based on patterns and merchant names.
 */
export const categorizationJob = client.defineJob({
  id: TRANSACTION_JOBS.CATEGORIZE_TRANSACTIONS,
  name: 'Categorize Transactions',
  trigger: cronTrigger({
    cron: '0 3 * * *', // Run daily at 3 AM
  }),
  version: '1.0.0',
  run: async (payload, io) => {
    await io.logger.info('Starting transaction categorization job');

    // Get transactions that need categorization
    let uncategorizedTransactions: {
      id: string;
      name: string;
      merchantName: string | null;
      [key: string]: any;
    }[] = [];

    await io.runTask('get-uncategorized-transactions', async (task, io) => {
      const result = await prisma.transaction.findMany({
        take: 1000, // Process in batches
        where: {
          category: null,
          // Only process transactions from the last 90 days
          date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
        },
      });

      uncategorizedTransactions = result;
      return { success: true };
    });

    await io.logger.info(
      `Found ${uncategorizedTransactions.length} transactions to categorize`
    );

    // Process each transaction
    let categorized = 0;

    for (const transaction of uncategorizedTransactions) {
      await io.runTask(`categorize-transaction-${transaction.id}`, async () => {
        // Apply auto-categorization logic
        const category = categorizeTxByName(
          transaction.name,
          transaction.merchantName
        );

        if (category) {
          await prisma.transaction.update({
            data: {
              category,
              // You could also assign a subcategory here
            },
            where: { id: transaction.id },
          });
          categorized++;
        }
      });
    }

    // Identify recurring transactions
    await io.runTask('identify-recurring-transactions', async () => {
      // Find potential recurring transactions (similar amounts, same merchant)
      const potentialRecurring = await prisma.$queryRaw`
          SELECT 
            "merchantName", 
            ROUND("amount"::numeric, 2) as rounded_amount,
            COUNT(*) as occurrence_count
          FROM "Transaction"
          WHERE 
            "date" >= NOW() - INTERVAL '90 days'
            AND "merchantName" IS NOT NULL
          GROUP BY "merchantName", ROUND("amount"::numeric, 2)
          HAVING COUNT(*) >= 2
          ORDER BY occurrence_count DESC
          LIMIT 500
        `;

      // For each potential recurring group, check if the transactions are evenly spaced
      for (const group of potentialRecurring as any[]) {
        const transactions = await prisma.transaction.findMany({
          orderBy: { date: 'asc' },
          where: {
            amount: {
              gte: Number.parseFloat(group.rounded_amount) - 0.01,
              lte: Number.parseFloat(group.rounded_amount) + 0.01,
            },
            date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
            merchantName: group.merchantName,
          },
        });

        if (transactions.length >= 2) {
          // Check if transactions are roughly evenly spaced
          const isRecurring = checkIfRecurring(transactions);

          if (isRecurring) {
            // Generate a recurrence ID (merchant name + amount)
            const recurrenceId = `${group.merchantName}-${group.rounded_amount}`;

            // Mark all transactions in this group as recurring
            for (const tx of transactions) {
              await prisma.transaction.update({
                data: {
                  isRecurring: true,
                  recurrenceId,
                },
                where: { id: tx.id },
              });
            }
          }
        }
      }
    });

    return {
      categorized,
      success: true,
      transactionsProcessed: uncategorizedTransactions.length,
    };
  },
});

/** Analyze transaction name and merchant to determine category */
function categorizeTxByName(
  name: string,
  merchantName: string | null
): TransactionCategory | null {
  const searchText = (merchantName || name).toLowerCase();

  // Simple categorization rule set
  // In a production app, this would be more sophisticated, possibly using ML
  if (/payroll|salary|deposit|direct deposit/i.test(searchText)) {
    return TransactionCategory.INCOME;
  }
  if (/transfer|zelle|venmo|paypal|cash app/i.test(searchText)) {
    return TransactionCategory.TRANSFER;
  }
  if (/mortgage|loan|lending|payment/i.test(searchText)) {
    return TransactionCategory.LOAN_PAYMENTS;
  }
  if (/fee|service charge|maintenance|overdraft/i.test(searchText)) {
    return TransactionCategory.BANK_FEES;
  }
  if (
    /netflix|spotify|hulu|disney|cinema|movie|entertainment/i.test(searchText)
  ) {
    return TransactionCategory.ENTERTAINMENT;
  }
  if (
    /restaurant|doordash|uber eats|grubhub|mcdonald|starbucks|dunkin|grocery|food/i.test(
      searchText
    )
  ) {
    return TransactionCategory.FOOD_AND_DRINK;
  }
  if (
    /amazon|walmart|target|costco|best buy|ebay|etsy|store|shop/i.test(
      searchText
    )
  ) {
    return TransactionCategory.GENERAL_MERCHANDISE;
  }
  if (
    /home depot|lowe|improvement|repair|furniture|bed bath/i.test(searchText)
  ) {
    return TransactionCategory.HOME_IMPROVEMENT;
  }
  if (
    /doctor|medical|pharmacy|hospital|clinic|health|dental/i.test(searchText)
  ) {
    return TransactionCategory.MEDICAL;
  }
  if (/gym|fitness|salon|barber|spa|beauty/i.test(searchText)) {
    return TransactionCategory.PERSONAL_CARE;
  }
  if (/service|cleaning|repair|maintenance/i.test(searchText)) {
    return TransactionCategory.GENERAL_SERVICES;
  }
  if (/government|tax|irs|dmv|court|donation|charity/i.test(searchText)) {
    return TransactionCategory.GOVERNMENT_AND_NON_PROFIT;
  }
  if (/uber|lyft|taxi|parking|gas|fuel|transit|subway|bus/i.test(searchText)) {
    return TransactionCategory.TRANSPORTATION;
  }
  if (
    /hotel|airbnb|airline|flight|travel|vacation|expedia|trip/i.test(searchText)
  ) {
    return TransactionCategory.TRAVEL;
  }
  if (
    /electric|water|gas|utility|internet|phone|cable|bill/i.test(searchText)
  ) {
    return TransactionCategory.UTILITIES;
  }

  // If we can't categorize it, return null
  return null;
}

/**
 * Check if a set of transactions appears to be recurring This is a simple
 * implementation that checks if transactions are roughly evenly spaced
 */
function checkIfRecurring(transactions: any[]): boolean {
  if (transactions.length < 2) {
    return false;
  }

  // Calculate the average interval between transactions in days
  let totalInterval = 0;
  const intervals: number[] = [];

  for (let i = 1; i < transactions.length; i++) {
    const currentDate = new Date(transactions[i].date);
    const prevDate = new Date(transactions[i - 1].date);
    const intervalDays =
      (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

    intervals.push(intervalDays);
    totalInterval += intervalDays;
  }

  const avgInterval = totalInterval / intervals.length;

  // Check if transactions are roughly evenly spaced
  // (variance less than 20% of the average interval)
  let variance = 0;

  for (const interval of intervals) {
    variance += Math.pow(interval - avgInterval, 2);
  }

  variance /= intervals.length;

  // Return true if average interval is between 25-35 days (monthly) or 13-16 days (bi-weekly)
  // and variance is low
  return (
    ((avgInterval >= 25 && avgInterval <= 35) ||
      (avgInterval >= 13 && avgInterval <= 16)) &&
    Math.sqrt(variance) < 0.2 * avgInterval
  );
}
