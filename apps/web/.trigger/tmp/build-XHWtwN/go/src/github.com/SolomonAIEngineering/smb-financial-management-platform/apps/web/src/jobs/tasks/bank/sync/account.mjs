import {
  getAccounts
} from "../../../../../../../../../../../../chunk-LRH2TIVL.mjs";
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

// src/jobs/tasks/bank/sync/account.ts
init_esm();
var import_client = __toESM(require_default(), 1);
var syncAccountJob = client.defineJob({
  id: "sync-account-job",
  name: "Sync Bank Account",
  trigger: eventTrigger({
    name: "sync-account"
  }),
  version: "1.0.0",
  run: async (payload, io) => {
    const { accessToken, bankAccountId, manualSync = false, userId } = payload;
    await io.logger.info(`Starting account sync for account ${bankAccountId}`);
    const bankAccount = await io.runTask("get-bank-account", async () => {
      return await prisma.bankAccount.findUnique({
        select: {
          id: true,
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
    if (bankAccount.status !== "ACTIVE" && !manualSync) {
      await io.logger.info(
        `Bank account ${bankAccountId} is not active and not manually synced, skipping`
      );
      return {
        reason: "Account not active",
        status: "skipped"
      };
    }
    try {
      const plaidAccounts = await io.runTask(
        "fetch-plaid-accounts",
        async () => {
          return await getAccounts(accessToken);
        }
      );
      const plaidAccount = plaidAccounts.find(
        (acc) => acc.plaidAccountId === bankAccount.plaidAccountId
      );
      if (!plaidAccount) {
        await io.logger.error(
          `Plaid account not found for bank account ${bankAccountId}`
        );
        throw new Error(
          `Plaid account not found for bank account ${bankAccountId}`
        );
      }
      await io.runTask("update-bank-account", async () => {
        await prisma.bankAccount.update({
          data: {
            availableBalance: plaidAccount.availableBalance,
            balanceLastUpdated: /* @__PURE__ */ new Date(),
            currentBalance: plaidAccount.currentBalance,
            isoCurrencyCode: plaidAccount.isoCurrencyCode,
            limit: plaidAccount.limit,
            mask: plaidAccount.mask,
            name: plaidAccount.name || bankAccount.name,
            officialName: plaidAccount.officialName,
            status: import_client.AccountStatus.ACTIVE,
            subtype: plaidAccount.subtype,
            type: mapPlaidAccountType(plaidAccount.type, plaidAccount.subtype),
            updatedAt: /* @__PURE__ */ new Date()
          },
          where: { id: bankAccountId }
        });
      });
      if (manualSync) {
        await client.sendEvent({
          name: "upsert-transactions-trigger",
          payload: {
            accessToken,
            bankAccountId,
            userId
          }
        });
      }
      await io.logger.info(`Account sync completed for ${bankAccountId}`);
      return {
        accountId: bankAccountId,
        balance: {
          available: plaidAccount.availableBalance,
          current: plaidAccount.currentBalance
        },
        status: "success"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await io.logger.error(`Account sync failed: ${errorMessage}`);
      await prisma.bankAccount.update({
        data: {
          status: import_client.AccountStatus.INACTIVE,
          updatedAt: /* @__PURE__ */ new Date()
        },
        where: { id: bankAccountId }
      });
      const bankConnectionInfo = await prisma.bankAccount.findUnique({
        select: { bankConnectionId: true },
        where: { id: bankAccountId }
      });
      if (bankConnectionInfo) {
        await prisma.bankConnection.update({
          data: {
            errorMessage,
            status: import_client.BankConnectionStatus.REQUIRES_ATTENTION,
            updatedAt: /* @__PURE__ */ new Date()
          },
          where: { id: bankConnectionInfo.bankConnectionId }
        });
      }
      throw error;
    }
  }
});
function mapPlaidAccountType(type, subtype) {
  if (type === "depository") {
    if (subtype === "checking") return import_client.AccountType.DEPOSITORY;
    if (subtype === "savings") return import_client.AccountType.DEPOSITORY;
    return import_client.AccountType.DEPOSITORY;
  }
  if (type === "credit") return import_client.AccountType.CREDIT;
  if (type === "loan") return import_client.AccountType.LOAN;
  if (type === "investment") return import_client.AccountType.INVESTMENT;
  return import_client.AccountType.OTHER;
}
export {
  syncAccountJob
};
//# sourceMappingURL=account.mjs.map
