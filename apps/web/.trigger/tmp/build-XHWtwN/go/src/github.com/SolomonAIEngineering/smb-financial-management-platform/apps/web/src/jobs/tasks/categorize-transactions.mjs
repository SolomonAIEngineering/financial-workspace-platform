import {
  prisma,
  require_default
} from "../../../../../../../../../../chunk-OOK7QOPT.mjs";
import {
  client,
  cronTrigger
} from "../../../../../../../../../../chunk-MFHHZEYW.mjs";
import "../../../../../../../../../../chunk-L66UFWTU.mjs";
import {
  __toESM,
  init_esm
} from "../../../../../../../../../../chunk-KZCIDQ5Y.mjs";

// src/jobs/tasks/categorize-transactions.ts
init_esm();
var import_client = __toESM(require_default(), 1);
var categorizationJob = client.defineJob({
  id: "categorize-transactions-job",
  name: "Categorize Transactions",
  trigger: cronTrigger({
    cron: "0 3 * * *"
    // Run daily at 3 AM
  }),
  version: "1.0.0",
  run: async (payload, io) => {
    await io.logger.info("Starting transaction categorization job");
    const uncategorizedTransactions = await io.runTask(
      "get-uncategorized-transactions",
      async () => {
        return await prisma.transaction.findMany({
          take: 1e3,
          // Process in batches
          where: {
            category: null,
            // Only process transactions from the last 90 days
            date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1e3) }
          }
        });
      }
    );
    await io.logger.info(
      `Found ${uncategorizedTransactions.length} transactions to categorize`
    );
    let categorized = 0;
    for (const transaction of uncategorizedTransactions) {
      await io.runTask(`categorize-transaction-${transaction.id}`, async () => {
        const category = categorizeTxByName(
          transaction.name,
          transaction.merchantName
        );
        if (category) {
          await prisma.transaction.update({
            data: {
              category
              // You could also assign a subcategory here
            },
            where: { id: transaction.id }
          });
          categorized++;
        }
      });
    }
    await io.runTask("identify-recurring-transactions", async () => {
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
      for (const group of potentialRecurring) {
        const transactions = await prisma.transaction.findMany({
          orderBy: { date: "asc" },
          where: {
            amount: {
              gte: Number.parseFloat(group.rounded_amount) - 0.01,
              lte: Number.parseFloat(group.rounded_amount) + 0.01
            },
            date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1e3) },
            merchantName: group.merchantName
          }
        });
        if (transactions.length >= 2) {
          const isRecurring = checkIfRecurring(transactions);
          if (isRecurring) {
            const recurrenceId = `${group.merchantName}-${group.rounded_amount}`;
            for (const tx of transactions) {
              await prisma.transaction.update({
                data: {
                  isRecurring: true,
                  recurrenceId
                },
                where: { id: tx.id }
              });
            }
          }
        }
      }
    });
    return {
      categorized,
      success: true,
      transactionsProcessed: uncategorizedTransactions.length
    };
  }
});
function categorizeTxByName(name, merchantName) {
  const searchText = (merchantName || name).toLowerCase();
  if (/payroll|salary|deposit|direct deposit/i.test(searchText)) {
    return import_client.TransactionCategory.INCOME;
  }
  if (/transfer|zelle|venmo|paypal|cash app/i.test(searchText)) {
    return import_client.TransactionCategory.TRANSFER;
  }
  if (/mortgage|loan|lending|payment/i.test(searchText)) {
    return import_client.TransactionCategory.LOAN_PAYMENTS;
  }
  if (/fee|service charge|maintenance|overdraft/i.test(searchText)) {
    return import_client.TransactionCategory.BANK_FEES;
  }
  if (/netflix|spotify|hulu|disney|cinema|movie|entertainment/i.test(searchText)) {
    return import_client.TransactionCategory.ENTERTAINMENT;
  }
  if (/restaurant|doordash|uber eats|grubhub|mcdonald|starbucks|dunkin|grocery|food/i.test(
    searchText
  )) {
    return import_client.TransactionCategory.FOOD_AND_DRINK;
  }
  if (/amazon|walmart|target|costco|best buy|ebay|etsy|store|shop/i.test(
    searchText
  )) {
    return import_client.TransactionCategory.GENERAL_MERCHANDISE;
  }
  if (/home depot|lowe|improvement|repair|furniture|bed bath/i.test(searchText)) {
    return import_client.TransactionCategory.HOME_IMPROVEMENT;
  }
  if (/doctor|medical|pharmacy|hospital|clinic|health|dental/i.test(searchText)) {
    return import_client.TransactionCategory.MEDICAL;
  }
  if (/gym|fitness|salon|barber|spa|beauty/i.test(searchText)) {
    return import_client.TransactionCategory.PERSONAL_CARE;
  }
  if (/service|cleaning|repair|maintenance/i.test(searchText)) {
    return import_client.TransactionCategory.GENERAL_SERVICES;
  }
  if (/government|tax|irs|dmv|court|donation|charity/i.test(searchText)) {
    return import_client.TransactionCategory.GOVERNMENT_AND_NON_PROFIT;
  }
  if (/uber|lyft|taxi|parking|gas|fuel|transit|subway|bus/i.test(searchText)) {
    return import_client.TransactionCategory.TRANSPORTATION;
  }
  if (/hotel|airbnb|airline|flight|travel|vacation|expedia|trip/i.test(searchText)) {
    return import_client.TransactionCategory.TRAVEL;
  }
  if (/electric|water|gas|utility|internet|phone|cable|bill/i.test(searchText)) {
    return import_client.TransactionCategory.UTILITIES;
  }
  return null;
}
function checkIfRecurring(transactions) {
  if (transactions.length < 2) {
    return false;
  }
  let totalInterval = 0;
  const intervals = [];
  for (let i = 1; i < transactions.length; i++) {
    const currentDate = new Date(transactions[i].date);
    const prevDate = new Date(transactions[i - 1].date);
    const intervalDays = (currentDate.getTime() - prevDate.getTime()) / (1e3 * 60 * 60 * 24);
    intervals.push(intervalDays);
    totalInterval += intervalDays;
  }
  const avgInterval = totalInterval / intervals.length;
  let variance = 0;
  for (const interval of intervals) {
    variance += Math.pow(interval - avgInterval, 2);
  }
  variance /= intervals.length;
  return (avgInterval >= 25 && avgInterval <= 35 || avgInterval >= 13 && avgInterval <= 16) && Math.sqrt(variance) < 0.2 * avgInterval;
}
export {
  categorizationJob
};
//# sourceMappingURL=categorize-transactions.mjs.map
