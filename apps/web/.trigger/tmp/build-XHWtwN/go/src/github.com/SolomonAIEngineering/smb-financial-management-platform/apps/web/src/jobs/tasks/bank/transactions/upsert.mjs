import {
  getTransactions
} from "../../../../../../../../../../../../chunk-LRH2TIVL.mjs";
import {
  require_date_fns
} from "../../../../../../../../../../../../chunk-HCZ7FCOM.mjs";
import {
  prisma,
  require_default
} from "../../../../../../../../../../../../chunk-OOK7QOPT.mjs";
import {
  client,
  eventTrigger
} from "../../../../../../../../../../../../chunk-MFHHZEYW.mjs";
import "../../../../../../../../../../../../chunk-L66UFWTU.mjs";
import {
  __toESM,
  init_esm
} from "../../../../../../../../../../../../chunk-KZCIDQ5Y.mjs";

// src/jobs/tasks/bank/transactions/upsert.ts
init_esm();
var import_client = __toESM(require_default(), 1);
var import_date_fns = __toESM(require_date_fns(), 1);
var upsertTransactionsJob = client.defineJob({
  id: "upsert-transactions-job",
  name: "Upsert Transactions",
  trigger: eventTrigger({
    name: "upsert-transactions"
  }),
  version: "1.0.0",
  run: async (payload, io) => {
    const { accessToken, bankAccountId, endDate, startDate, userId } = payload;
    await io.logger.info(
      `Starting transaction upsert for account ${bankAccountId}`
    );
    const bankAccount = await io.runTask("get-bank-account", async () => {
      return await prisma.bankAccount.findUnique({
        select: {
          id: true,
          bankConnectionId: true,
          name: true,
          plaidAccountId: true,
          status: true,
          updatedAt: true
        },
        where: { id: bankAccountId }
      });
    });
    if (!bankAccount) {
      await io.logger.error(`Bank account ${bankAccountId} not found`);
      throw new Error(`Bank account ${bankAccountId} not found`);
    }
    if (bankAccount.status !== "ACTIVE") {
      await io.logger.info(
        `Bank account ${bankAccountId} is not active, skipping sync`
      );
      return {
        reason: "Account not active",
        status: "skipped"
      };
    }
    await prisma.bankAccount.update({
      data: {
        status: import_client.AccountStatus.PENDING,
        updatedAt: /* @__PURE__ */ new Date()
      },
      where: { id: bankAccountId }
    });
    try {
      const today = /* @__PURE__ */ new Date();
      const defaultStartDate = bankAccount.updatedAt ? (0, import_date_fns.subDays)(bankAccount.updatedAt, 5) : (0, import_date_fns.subDays)(today, 90);
      const defaultEndDate = (0, import_date_fns.addDays)(today, 1);
      const start = startDate ? new Date(startDate) : defaultStartDate;
      const end = endDate ? new Date(endDate) : defaultEndDate;
      const startDateStr = (0, import_date_fns.format)(start, "yyyy-MM-dd");
      const endDateStr = (0, import_date_fns.format)(end, "yyyy-MM-dd");
      const bankConnection = await prisma.bankConnection.findUnique({
        where: { id: bankAccount.bankConnectionId }
      });
      if (!bankConnection) {
        throw new Error(
          `Bank connection not found for account ${bankAccountId}`
        );
      }
      const bankAccounts = await prisma.bankAccount.findMany({
        where: { bankConnectionId: bankAccount.bankConnectionId }
      });
      const plaidTransactions = await io.runTask(
        "fetch-plaid-transactions",
        async () => {
          return await getTransactions(
            accessToken,
            bankConnection,
            bankAccounts,
            startDateStr,
            endDateStr
          );
        }
      );
      await io.logger.info(
        `Fetched ${plaidTransactions.length} transactions from Plaid`
      );
      const transactionCount = await io.runTask(
        "process-transactions",
        async () => {
          let newCount = 0;
          let updatedCount = 0;
          for (const plaidTransaction of plaidTransactions) {
            const existingTransaction = await prisma.transaction.findFirst({
              where: {
                bankAccountId,
                plaidTransactionId: plaidTransaction.plaidTransactionId
              }
            });
            let category = null;
            if (plaidTransaction.originalCategory && plaidTransaction.originalCategory.length > 0) {
              try {
                category = mapPlaidCategoryToTransactionCategory(
                  plaidTransaction.originalCategory.split(",")[0].trim()
                );
              } catch (error) {
                await io.logger.warn(
                  `Could not map category for transaction ${plaidTransaction.plaidTransactionId}: ${error}`
                );
              }
            }
            if (existingTransaction) {
              await prisma.transaction.update({
                data: {
                  amount: plaidTransaction.amount,
                  category,
                  date: new Date(plaidTransaction.date),
                  merchantName: plaidTransaction.merchantName || null,
                  name: plaidTransaction.name,
                  pending: plaidTransaction.pending,
                  updatedAt: /* @__PURE__ */ new Date()
                },
                where: { id: existingTransaction.id }
              });
              updatedCount++;
            } else {
              await prisma.transaction.create({
                data: {
                  amount: plaidTransaction.amount,
                  bankAccount: { connect: { id: bankAccountId } },
                  bankConnection: {
                    connect: { id: bankAccount.bankConnectionId }
                  },
                  category,
                  date: new Date(plaidTransaction.date),
                  merchantName: plaidTransaction.merchantName || null,
                  name: plaidTransaction.name,
                  pending: plaidTransaction.pending,
                  plaidTransactionId: plaidTransaction.plaidTransactionId,
                  user: { connect: { id: userId } }
                }
              });
              newCount++;
            }
          }
          return { newCount, updatedCount };
        }
      );
      await prisma.bankAccount.update({
        data: {
          status: import_client.AccountStatus.ACTIVE,
          updatedAt: /* @__PURE__ */ new Date()
        },
        where: { id: bankAccountId }
      });
      await io.logger.info(
        `Transaction sync completed. Added ${transactionCount.newCount}, updated ${transactionCount.updatedCount} transactions`
      );
      return {
        newTransactions: transactionCount.newCount,
        status: "success",
        totalTransactions: plaidTransactions.length,
        updatedTransactions: transactionCount.updatedCount
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await io.logger.error(`Transaction sync failed: ${errorMessage}`);
      await prisma.bankAccount.update({
        data: {
          status: import_client.AccountStatus.INACTIVE,
          updatedAt: /* @__PURE__ */ new Date()
        },
        where: { id: bankAccountId }
      });
      throw error;
    }
  }
});
function mapPlaidCategoryToTransactionCategory(plaidCategory) {
  const categoryMap = {
    "Bank Fees": import_client.TransactionCategory.BANK_FEES,
    "Bills and Utilities": import_client.TransactionCategory.UTILITIES,
    Education: import_client.TransactionCategory.OTHER,
    Entertainment: import_client.TransactionCategory.ENTERTAINMENT,
    "Food and Drink": import_client.TransactionCategory.FOOD_AND_DRINK,
    "General Merchandise": import_client.TransactionCategory.GENERAL_MERCHANDISE,
    Groceries: import_client.TransactionCategory.FOOD_AND_DRINK,
    Healthcare: import_client.TransactionCategory.MEDICAL,
    Home: import_client.TransactionCategory.HOME_IMPROVEMENT,
    Income: import_client.TransactionCategory.INCOME,
    Insurance: import_client.TransactionCategory.OTHER,
    Loan: import_client.TransactionCategory.LOAN_PAYMENTS,
    Medical: import_client.TransactionCategory.MEDICAL,
    Payment: import_client.TransactionCategory.TRANSFER,
    "Personal Care": import_client.TransactionCategory.PERSONAL_CARE,
    "Professional Services": import_client.TransactionCategory.GENERAL_SERVICES,
    Recreation: import_client.TransactionCategory.ENTERTAINMENT,
    Rent: import_client.TransactionCategory.HOME_IMPROVEMENT,
    Restaurants: import_client.TransactionCategory.FOOD_AND_DRINK,
    Shopping: import_client.TransactionCategory.GENERAL_MERCHANDISE,
    Tax: import_client.TransactionCategory.GOVERNMENT_AND_NON_PROFIT,
    Transfer: import_client.TransactionCategory.TRANSFER,
    Transportation: import_client.TransactionCategory.TRANSPORTATION,
    Travel: import_client.TransactionCategory.TRAVEL
  };
  return categoryMap[plaidCategory] || import_client.TransactionCategory.OTHER;
}
export {
  upsertTransactionsJob
};
//# sourceMappingURL=upsert.mjs.map
